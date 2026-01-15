import { databases, ID, Query } from '../config/appwrite';
import { Storage } from 'appwrite';
import client from '../config/appwrite';
import { parseProfileJSONFields } from './profile';
import { compressImage } from './studioImages';

const storage = new Storage(client);
const STUDIO_IMAGES_BUCKET_ID = import.meta.env.VITE_APPWRITE_STUDIO_IMAGES_BUCKET_ID as string;

const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID as string;
const PROFILE_TABLE_ID = import.meta.env.VITE_APPWRITE_PROFILE_TABLE_ID as string;

/**
 * Upload image file to Appwrite Storage and return file ID
 */
async function uploadImageToStorage(imageFile: File, _fileName: string): Promise<string> {
  try {
    if (!STUDIO_IMAGES_BUCKET_ID) {
      throw new Error('Studio images bucket not configured');
    }

    // Compress image
    const compressedFile = await compressImage(imageFile, 800, 0.85);

    // Upload to Appwrite Storage
    const file = await storage.createFile(
      STUDIO_IMAGES_BUCKET_ID,
      ID.unique(),
      compressedFile
    );

    return file.$id;
  } catch (error) {
    console.error('Error uploading image to storage:', error);
    throw error;
  }
}

/**
 * Fetch image from URL and upload to Appwrite Storage
 */
async function uploadImageFromUrl(imageUrl: string, fileName: string): Promise<string> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const blob = await response.blob();
    const file = new File([blob], fileName, { type: blob.type });
    return await uploadImageToStorage(file, fileName);
  } catch (error) {
    console.error('Error uploading image from URL:', error);
    throw error;
  }
}

/**
 * Upload image from local file path (for development)
 */
export async function uploadImageFromLocalPath(imagePath: string, fileName: string): Promise<string> {
  try {
    // In browser, we need to fetch from public folder or src folder
    const response = await fetch(imagePath);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const blob = await response.blob();
    const file = new File([blob], fileName, { type: blob.type });
    return await uploadImageToStorage(file, fileName);
  } catch (error) {
    console.error('Error uploading image from local path:', error);
    throw error;
  }
}

export async function addAdminStudio(studioData: {
  name: string;
  tagline: string;
  description: string;
  website: string;
  genre: string;
  platform: string;
  teamSize: string;
  location: string;
  profileImageId?: string; // File ID from Appwrite Storage (Studio profile photo folder)
  profileImageFile?: File; // Image file to upload (will be uploaded to Appwrite Storage)
  profileImageUrl?: string; // URL to image file (will be fetched and uploaded to Appwrite Storage)
  profileImagePath?: string; // Local path for development (e.g., from src/Images folder)
  foundedYear?: string;
  headquartersCountry?: string;
  city?: string;
  founders?: string[];
  languagesSupported?: string[];
  regionsServed?: string[];
  studioType?: string;
  gameEngines?: string[];
  supportedPlatforms?: string[];
  targetAudience?: string;
  deploymentType?: string;
  projects?: Array<{
    gameTitle: string;
    status: string;
    platforms: string[];
    projectPageUrl: string;
    shortDescription?: string;
  }>;
  lookingFor?: string[];
  openToPublishingDeals?: boolean;
  publisherPartners?: string;
  fundingType?: string;
  latestFundingRound?: string;
  totalFunding?: string;
  distributionChannels?: string[];
  storeLinks?: string[];
  socialLinks?: {
    twitter?: string;
    youtube?: string;
    instagram?: string;
    facebook?: string;
    discord?: string;
    linkedin?: string;
  };
  recognitions?: Array<{
    type: string;
    title: string;
    year?: string;
    description?: string;
    source: string;
  }>;
  trailerVideoUrl?: string;
  gameplayVideoUrl?: string;
  knownFor?: string;
  email?: string;
  publicContactEmail?: string;
  revenue?: string;
  tools?: string[];
  tags?: string[];
  parentCompany?: string;
  acquisitionStatus?: string;
  acquiredBy?: string;
  primaryExpertise?: string[];
}) {
  try {
    if (!DB_ID || !PROFILE_TABLE_ID) {
      throw new Error('Database configuration missing');
    }

    // Check if studio already exists by name
    const existingProfiles = await databases.listDocuments(DB_ID, PROFILE_TABLE_ID, [
      Query.equal('status', 'approved'),
    ]);

    const studioExists = existingProfiles.documents.some((doc: any) => {
      try {
        const parsed = parseProfileJSONFields(doc);
        return parsed.name === studioData.name;
      } catch {
        return false;
      }
    });

    // If studio exists, check if we need to update the profileImageId
    if (studioExists) {
      const existingDoc = existingProfiles.documents.find((doc: any) => {
        try {
          const parsed = parseProfileJSONFields(doc);
          return parsed.name === studioData.name;
        } catch {
          return false;
        }
      });

      if (existingDoc) {
        // Check if studio already has a logo
        const currentProfileData = existingDoc.profileData 
          ? (typeof existingDoc.profileData === 'string' 
              ? JSON.parse(existingDoc.profileData) 
              : existingDoc.profileData)
          : {};
        
        const existingLogoId = currentProfileData?.profileImageId;
        // Treat empty string as no logo
        const hasLogo = existingLogoId && existingLogoId !== '' && existingLogoId !== 'NULL';
        
        // If studio already has a logo, don't upload anything - just return
        if (hasLogo) {
          console.log(`ℹ️ Studio "${studioData.name}" already exists with logo: ${existingLogoId}. Skipping upload.`);
          return { success: false, message: 'Studio already exists' };
        }
        
        // Studio exists but no logo - only update if explicitly provided logoImageId
        // Don't upload from path/url/file on reload - only use provided ID
        if (studioData.profileImageId && studioData.profileImageId !== existingLogoId && studioData.profileImageId !== '') {
          const updatedProfileData = {
            ...currentProfileData,
            profileImageId: studioData.profileImageId,
          };
          
          await databases.updateDocument(DB_ID, PROFILE_TABLE_ID, existingDoc.$id, {
            profileData: JSON.stringify(updatedProfileData),
          });
          console.log(`✅ Updated ${studioData.name} with profile image ID:`, studioData.profileImageId);
          return { success: true, id: existingDoc.$id, message: 'Studio updated with logo', updated: true };
        }
        
        // If no logo and no explicit ID provided, don't upload on reload
        console.log(`ℹ️ Studio "${studioData.name}" already exists without logo. Skipping upload to prevent duplicates.`);
        return { success: false, message: 'Studio already exists' };
      }
    }

    // Prepare the profile data in the same format as form submissions
    const profileData: any = {
      userId: 'admin-team', // Mark as admin-created
      status: 'approved', // Auto-approved
      createdByTeam: true, // Mark as team-created
      createdAt: new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(new Date()),
    };

    // Handle profile image upload
    let imageFileId: string | undefined = studioData.profileImageId;
    
    if (studioData.profileImageFile) {
      // Upload image file to Appwrite Storage
      imageFileId = await uploadImageToStorage(studioData.profileImageFile, `${studioData.name}-logo`);
      console.log(`Uploaded profile image for ${studioData.name}:`, imageFileId);
    } else if (studioData.profileImagePath) {
      // Upload image from local path
      imageFileId = await uploadImageFromLocalPath(studioData.profileImagePath, `${studioData.name}-logo`);
      console.log(`Uploaded profile image for ${studioData.name} from local path:`, imageFileId);
    } else if (studioData.profileImageUrl) {
      // Fetch and upload image from URL
      imageFileId = await uploadImageFromUrl(studioData.profileImageUrl, `${studioData.name}-logo`);
      console.log(`Uploaded profile image for ${studioData.name} from URL:`, imageFileId);
    }
    
    profileData.profileData = JSON.stringify({
        // Basic Profile Info
        name: studioData.name,
        tagline: studioData.tagline,
        description: studioData.description || '',
        website: studioData.website || '',
        
        // Classification & Location
        genre: studioData.genre,
        platform: studioData.platform,
        teamSize: studioData.teamSize,
        location: studioData.location,
        
        // Contact Information
        email: studioData.email || '',
        publicContactEmail: studioData.publicContactEmail || '',
        
        // Business & Revenue
        revenue: studioData.revenue || '',
        foundedYear: studioData.foundedYear || '',
        
        // Tags & Tools
        tools: studioData.tools || [],
        tags: studioData.tags || [],
        
        // Extended Studio Details
        studioType: studioData.studioType || '',
        headquartersCountry: studioData.headquartersCountry || '',
        city: studioData.city || '',
        languagesSupported: studioData.languagesSupported || [],
        regionsServed: studioData.regionsServed || [],
        
        // Ownership & Identity
        founders: studioData.founders || [],
        parentCompany: studioData.parentCompany || '',
        acquisitionStatus: studioData.acquisitionStatus || '',
        acquiredBy: studioData.acquiredBy || '',
        
        // Team & Capabilities
        targetAudience: studioData.targetAudience || '',
        primaryExpertise: studioData.primaryExpertise || [],
        gameEngines: studioData.gameEngines || [],
        deploymentType: studioData.deploymentType || '',
        
        // Platforms & Technology
        supportedPlatforms: studioData.supportedPlatforms || [],
        
        // Projects Portfolio
        projects: studioData.projects || [],
        
        // Business & Collaboration
        lookingFor: studioData.lookingFor || [],
        openToPublishingDeals: studioData.openToPublishingDeals ?? undefined,
        publisherPartners: studioData.publisherPartners || '',
        fundingType: studioData.fundingType || '',
        latestFundingRound: studioData.latestFundingRound || '',
        totalFunding: studioData.totalFunding || '',
        
        // Distribution & Stores
        distributionChannels: studioData.distributionChannels || [],
        storeLinks: studioData.storeLinks || [],
        
        // Contact & Community
        socialLinks: studioData.socialLinks || {},
        recognitions: studioData.recognitions || [],
        trailerVideoUrl: studioData.trailerVideoUrl || '',
        gameplayVideoUrl: studioData.gameplayVideoUrl || '',
        
        // Known For
        knownFor: studioData.knownFor || '',
        
        // Profile Image ID (stored in profileData JSON)
        profileImageId: imageFileId || '',
      });

    // Create the studio profile
    const response = await databases.createDocument(
      DB_ID,
      PROFILE_TABLE_ID,
      ID.unique(),
      profileData as any
    );

    console.log(`Studio "${studioData.name}" added successfully:`, response.$id);
    return { success: true, id: response.$id, message: 'Studio added successfully' };
  } catch (error: any) {
    console.error('Error adding admin studio:', error);
    return { success: false, message: error.message || 'Failed to add studio' };
  }
}

/**
 * Add Avalanche Studios - Pre-configured studio data
 * This will automatically upload the logo from the Images folder
 */
/**
 * Update existing studio's profileImageId
 */
async function updateStudioImage(studioName: string, imageFileId: string): Promise<boolean> {
  try {
    if (!DB_ID || !PROFILE_TABLE_ID) {
      throw new Error('Database configuration missing');
    }

    const existingProfiles = await databases.listDocuments(DB_ID, PROFILE_TABLE_ID, [
      Query.equal('status', 'approved'),
    ]);

    const existingDoc = existingProfiles.documents.find((doc: any) => {
      try {
        const parsed = parseProfileJSONFields(doc);
        return parsed.name === studioName;
      } catch {
        return false;
      }
    });

    if (existingDoc) {
      // Get current profileData and update it with profileImageId
      const currentProfileData = existingDoc.profileData 
        ? (typeof existingDoc.profileData === 'string' 
            ? JSON.parse(existingDoc.profileData) 
            : existingDoc.profileData)
        : {};
      
      // Update profileData with profileImageId
      const updatedProfileData = {
        ...currentProfileData,
        profileImageId: imageFileId,
      };
      
      await databases.updateDocument(DB_ID, PROFILE_TABLE_ID, existingDoc.$id, {
        profileData: JSON.stringify(updatedProfileData),
      });
      console.log(`✅ Updated ${studioName} with profile image ID:`, imageFileId);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating studio image:', error);
    return false;
  }
}

export async function addAvalancheStudios() {
  // Use the existing uploaded logo file ID
  const AVALANCHE_STUDIOS_LOGO_ID = '695e37a300182b435e34';
  
  // First, check if studio already exists and has a logo
  let profileImageId: string | undefined = AVALANCHE_STUDIOS_LOGO_ID;
  let studioAlreadyHasLogo = false;
  
  try {
    if (!DB_ID || !PROFILE_TABLE_ID) {
      throw new Error('Database configuration missing');
    }

    const existingProfiles = await databases.listDocuments(DB_ID, PROFILE_TABLE_ID, [
      Query.equal('status', 'approved'),
    ]);

    const existingDoc = existingProfiles.documents.find((doc: any) => {
      try {
        const parsed = parseProfileJSONFields(doc);
        return parsed.name === 'Avalanche Studios';
      } catch {
        return false;
      }
    });

    if (existingDoc) {
      const currentProfileData = existingDoc.profileData 
        ? (typeof existingDoc.profileData === 'string' 
            ? JSON.parse(existingDoc.profileData) 
            : existingDoc.profileData)
        : {};
      
      if (currentProfileData?.profileImageId) {
        studioAlreadyHasLogo = true;
        profileImageId = currentProfileData.profileImageId;
        console.log('ℹ️ Avalanche Studios already has a logo, using existing:', profileImageId);
      } else {
        // Studio exists but doesn't have logo, use the provided file ID
        profileImageId = AVALANCHE_STUDIOS_LOGO_ID;
        console.log('ℹ️ Using provided Avalanche Studios logo ID:', profileImageId);
      }
    } else {
      // Studio doesn't exist, use the provided file ID
      profileImageId = AVALANCHE_STUDIOS_LOGO_ID;
      console.log('ℹ️ Using provided Avalanche Studios logo ID:', profileImageId);
    }
  } catch (error) {
    console.warn('⚠️ Could not check existing studio:', error);
    // Fallback to provided file ID
    profileImageId = AVALANCHE_STUDIOS_LOGO_ID;
  }
  
  // Try to add studio with the logo (will update existing if needed)
  const result = await addAdminStudio({
    name: 'Avalanche Studios',
    tagline: 'Avalanche Game Studios',
    description: 'Avalanche Studios Group is a Swedish developer and publisher based in Stockholm, best known for large-scale open-world action games. Founded in 2003, the group includes the Avalanche Studios, Expansive Worlds,',
    website: 'https://avalanchestudios.com/',
    genre: 'Action',
    platform: 'PC, Playstation, Xbox',
    teamSize: '~450+',
    location: 'Stockholm, Sweden',
    foundedYear: '2003',
    headquartersCountry: 'Sweden',
    city: 'Stockholm',
    founders: ['Linus Blomberg', 'Christofer Sundberg'],
    languagesSupported: ['English (primary)'],
    regionsServed: ['Global'],
    studioType: 'AAA Developer',
    gameEngines: ['Apex Engine (formerly Avalanche Engine)', 'Proprietary tools'],
    supportedPlatforms: ['PC', 'Playstation', 'Xbox', 'Stadia'],
    targetAudience: 'Open-world sanction and sandbox players',
    deploymentType: 'Digital (Steam, Epic games store, console)',
    lookingFor: ['Not stated publicly; continues to work with major publishers and explore self-publishing for new IP'],
    openToPublishingDeals: true,
    publisherPartners: 'Square Enix (Just Cause series), Warner Bros. (Mad Max), Bethesda Softworks (Rage 2), Xbox Game Studios (Contraband before halt).',
    fundingType: 'Owned by Nordisk Film',
    distributionChannels: ['Steam', 'Consoles'],
    storeLinks: [
      'https://store.steampowered.com/developer/Avalanchestudios/',
      'https://avalanchestudios.com/divisions/',
    ],
    socialLinks: {
      twitter: 'https://x.com/AvalancheSweden',
      instagram: 'https://www.instagram.com/avalanchestudios/?hl=en',
    },
    recognitions: [
      {
        type: 'Press Mention',
        title: 'Long recognized as "the creators of the Just Cause franchise and developers of Mad Max and Rage 2," emphasizing their open-world expertise.',
        source: 'Avalanche Studios',
      },
      {
        type: 'Press mention',
        title: 'Some subsidiary studios are closing worldwide.',
        source: 'Games Industry',
      },
    ],
    trailerVideoUrl: 'https://www.youtube.com/watch?v=0ND5dYIFkd0',
    knownFor: 'Their very popular series Just Cause, and their Mad Max game, and Rage 2.',
    projects: [
      {
        gameTitle: 'Just Cause 3',
        status: 'Released',
        platforms: ['PC', 'Playstation', 'Xbox'],
        projectPageUrl: 'https://store.steampowered.com/app/225540/Just_Cause_3/',
      },
      {
        gameTitle: 'Just Cause 4',
        status: 'Released',
        platforms: ['PC', 'Playstation', 'Xbox'],
        projectPageUrl: 'https://store.steampowered.com/app/517630/Just_Cause_4_Reloaded/',
      },
      {
        gameTitle: 'Mad Max',
        status: 'Released',
        platforms: ['PC', 'Ps4', 'Xbox'],
        projectPageUrl: 'https://store.steampowered.com/app/234140/Mad_Max/',
      },
      {
        gameTitle: 'Rage 2',
        status: 'Released',
        platforms: ['PC', 'Xbox'],
        projectPageUrl: 'https://store.steampowered.com/app/548570/RAGE_2/',
      },
      {
        gameTitle: 'Contraband',
        status: 'In Development',
        platforms: ['Planned Xbox'],
        projectPageUrl: 'https://avalanchestudios.com/games/contraband',
      },
    ],
    profileImageId, // Use the uploaded image ID (or existing one)
  });

  // The addAdminStudio function now handles logo updates internally
  // Only update if studio exists but doesn't have a logo and we just uploaded one
  if (!result.success && result.message === 'Studio already exists' && profileImageId && !studioAlreadyHasLogo) {
    const updated = await updateStudioImage('Avalanche Studios', profileImageId);
    if (updated) {
      return { success: true, message: 'Studio updated with logo', updated: true };
    }
  }

  return result;
}

/**
 * Add BoringSuburbanDad Studio - Pre-configured studio data
 */
export async function addBoringSuburbanDad() {
  // Path to the profile photo - try public folder first, then src folder
  // Note: For browser access, image should be in public folder
  // Use the manually uploaded logo file ID
  const BORING_SUBURBAN_DAD_LOGO_ID = '6968aae1001bacf83a50';
  
  let profileImageId: string | undefined = BORING_SUBURBAN_DAD_LOGO_ID;
  let existingDoc: any = undefined;
  
  try {
    if (!DB_ID || !PROFILE_TABLE_ID) {
      throw new Error('Database configuration missing');
    }

    const existingProfiles = await databases.listDocuments(DB_ID, PROFILE_TABLE_ID, [
      Query.equal('status', 'approved'),
    ]);

    existingDoc = existingProfiles.documents.find((doc: any) => {
      try {
        const parsed = parseProfileJSONFields(doc);
        return parsed.name === 'BoringSuburbanDad';
      } catch {
        return false;
      }
    });

    if (existingDoc) {
      const currentProfileData = existingDoc.profileData 
        ? (typeof existingDoc.profileData === 'string' 
            ? JSON.parse(existingDoc.profileData) 
            : existingDoc.profileData)
        : {};
      
      if (currentProfileData?.profileImageId && currentProfileData.profileImageId !== '') {
        studioAlreadyHasLogo = true;
        profileImageId = currentProfileData.profileImageId;
        console.log('ℹ️ BoringSuburbanDad already has a logo, using existing:', profileImageId);
      } else {
        // Studio exists but doesn't have a valid logo - use the provided ID
        profileImageId = BORING_SUBURBAN_DAD_LOGO_ID;
        console.log('ℹ️ BoringSuburbanDad exists but has no logo, using provided ID:', profileImageId);
      }
    } else {
      // Studio doesn't exist, use the provided ID
      profileImageId = BORING_SUBURBAN_DAD_LOGO_ID;
      console.log('ℹ️ Using provided BoringSuburbanDad logo ID:', profileImageId);
    }
  } catch (error) {
    console.warn('⚠️ Could not check existing studio:', error);
    // Fallback to provided ID
    profileImageId = BORING_SUBURBAN_DAD_LOGO_ID;
  }

  const result = await addAdminStudio({
    name: 'BoringSuburbanDad',
    tagline: 'Solo Indie Developer behind cult point and click Dinner with and Owl and its prequel, Dinner with an Owl: Owl Observatory (TBA) on Steam',
    description: 'Solo Indie Developer behind cult point and click Dinner with and Owl and its prequel, Dinner with an Owl: Owl Observatory (TBA) on Steam. Known for Dinner with an Owl - Free point and click with full voice acting, an eerie original soundtrack + a Twisted, looping storyline.',
    website: 'https://x.com/BoringSubDad',
    genre: 'Point and Click Adventure',
    platform: 'PC',
    teamSize: '~1',
    location: 'Not Disclosed',
    foundedYear: '2021', // First Steam release in May 2021
    headquartersCountry: 'Not Disclosed',
    city: 'Not Disclosed',
    founders: ['BoringSuburbanDad'],
    languagesSupported: ['English'],
    regionsServed: ['Global'],
    studioType: 'Solo indie developer',
    gameEngines: ['Unknown'],
    supportedPlatforms: ['PC'],
    targetAudience: 'Point and click adventure/horror-comedy fans',
    deploymentType: 'Digital (Steam)',
    lookingFor: ['Not stated publicly'],
    openToPublishingDeals: false,
    publisherPartners: 'Self published on Steam',
    fundingType: 'Not Disclosed',
    distributionChannels: ['Steam'],
    storeLinks: [
      'https://store.steampowered.com/developer/BoringSuburbanDad',
    ],
    socialLinks: {
      twitter: 'https://x.com/BoringSubDad',
      youtube: 'https://www.youtube.com/@boringsuburbandadgames',
    },
    recognitions: [
      {
        type: 'Festival',
        title: 'Tiny Teams 2024 - selection/participation (Festival hosted on Steam by Yogacast; Aug 8-15 2024.)',
        source: 'Steam',
      },
      {
        type: 'Press Mention',
        title: '"The plot had sung its lovely swan song."',
        source: 'Janneke Parrish',
      },
      {
        type: 'Press Mention',
        title: 'Played by various popular gaming Youtubers; Markiplier, Alpha Beta Gamer, etc.',
        source: 'YouTube',
      },
    ],
    trailerVideoUrl: 'https://www.youtube.com/watch?v=UB5VT0kdi5A',
    knownFor: 'Dinner with an Owl - Free point and click with full voice acting, an eerie original soundtrack + a Twisted, looping storyline.',
    projects: [
      {
        gameTitle: 'Dinner with an Owl ("Dessert Edition")',
        status: 'Released',
        platforms: ['PC'],
        projectPageUrl: 'https://store.steampowered.com/app/1567420/Dinner_with_an_Owl/',
      },
      {
        gameTitle: 'Owl Observatory - Dinner with an Owl Prequel',
        status: 'In Progress - (Demo Available)',
        platforms: ['PC'],
        projectPageUrl: 'https://store.steampowered.com/app/2633510/Dinner_with_an_Owl_Owl_Observatory/',
      },
      {
        gameTitle: 'Dinner with an Owl - Soundtrack',
        status: 'Released',
        platforms: ['PC'],
        projectPageUrl: 'https://store.steampowered.com/app/1567470/Dinner_with_an_Owl_Soundtrack/?curator_clanid=44809782',
      },
    ],
    // Always pass profileImageId if we have it (will update existing studio if needed)
    ...(profileImageId ? { profileImageId } : {}),
  });

  return result;
}

/**
 * Add Celestial Knight Studios - Pre-configured studio data
 */
export async function addCelestialKnightStudios() {
  // Use the existing uploaded logo file ID
  const CELESTIAL_KNIGHT_STUDIOS_LOGO_ID = '696620cf0001ea892949';
  
  let profileImageId: string | undefined = CELESTIAL_KNIGHT_STUDIOS_LOGO_ID;
  let existingDoc: any = undefined;
  
  try {
    if (!DB_ID || !PROFILE_TABLE_ID) {
      throw new Error('Database configuration missing');
    }

    const existingProfiles = await databases.listDocuments(DB_ID, PROFILE_TABLE_ID, [
      Query.equal('status', 'approved'),
    ]);

    existingDoc = existingProfiles.documents.find((doc: any) => {
      try {
        const parsed = parseProfileJSONFields(doc);
        return parsed.name === 'Celestial Knight Studios';
      } catch {
        return false;
      }
    });

    if (existingDoc) {
      const currentProfileData = existingDoc.profileData 
        ? (typeof existingDoc.profileData === 'string' 
            ? JSON.parse(existingDoc.profileData) 
            : existingDoc.profileData)
        : {};
      
      if (currentProfileData?.profileImageId) {
        profileImageId = currentProfileData.profileImageId;
        console.log('ℹ️ Celestial Knight Studios already has a logo, using existing:', profileImageId);
      }
    }
  } catch (error) {
    console.warn('⚠️ Could not check existing studio:', error);
  }

  const result = await addAdminStudio({
    name: 'Celestial Knight Studios',
    tagline: 'Octagon Game Studio',
    description: 'Indie studio developing Shadow Survival, a 1-12 person co-op, wave based first person action shooter in early access on steam.',
    website: 'https://shadowsurvival.wordpress.com',
    genre: 'Action',
    platform: 'PC',
    teamSize: '~1',
    location: 'Not Disclosed',
    foundedYear: '2023', // Earliest dev presence active by 2023
    headquartersCountry: 'USA',
    city: 'Not Disclosed',
    founders: ['Not Publicly Stated'],
    languagesSupported: ['English'],
    regionsServed: ['Global'],
    studioType: 'Indie Game Studio',
    gameEngines: ['Unreal Engine'],
    supportedPlatforms: ['PC'],
    targetAudience: 'Co-op FPS/wave-survival players',
    deploymentType: 'Digital (Steam)',
    lookingFor: ['To get early feedback about the game during the development process.'],
    openToPublishingDeals: undefined,
    publisherPartners: 'Self published on steam (dev+publisher listed as Celestial Knight Studios)',
    fundingType: 'Not Disclosed',
    distributionChannels: ['Steam'],
    storeLinks: [
      'https://store.steampowered.com/app/2051870/Shadow_Survival/',
    ],
    socialLinks: {
      twitter: 'https://x.com/shadow_survival',
    },
    recognitions: [
      {
        type: 'Community Chatter',
        title: 'Reddit chatter for early impressions looks positive.',
        source: 'https://www.reddit.com/r/killingfloor/comments/1ic70ly/hs_shadow_survival_a_true_killing_floor_like_with',
      },
    ],
    trailerVideoUrl: 'https://www.youtube.com/watch?v=TuwjthfKOGU&t=1s',
    knownFor: 'Shadow Survival - Story Driven online action FPS with co-op against demonic hordes.',
    projects: [
      {
        gameTitle: 'Shadow Survival',
        status: 'Released (Early Access)',
        platforms: ['PC'],
        projectPageUrl: 'https://store.steampowered.com/app/2051870/Shadow_Survival/',
      },
    ],
    // Only pass profileImageId to prevent re-uploads on reload
    ...(existingDoc && profileImageId 
      ? { profileImageId } 
      : !existingDoc 
        ? { profileImageId }
        : {}),
  });

  return result;
}
