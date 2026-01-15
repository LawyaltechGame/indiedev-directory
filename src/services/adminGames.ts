import { databases, ID, Query } from '../config/appwrite';
import { Storage } from 'appwrite';
import client from '../config/appwrite';
import { compressImage } from './studioImages';

const storage = new Storage(client);
const STUDIO_IMAGES_BUCKET_ID = import.meta.env.VITE_APPWRITE_STUDIO_IMAGES_BUCKET_ID as string;

const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID as string;
const GAMES_TABLE_ID = import.meta.env.VITE_APPWRITE_GAMES_TABLE_ID as string;

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
async function uploadImageFromLocalPath(imagePath: string, fileName: string): Promise<string> {
  try {
    // In browser, we need to fetch from public folder
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

export async function addAdminGame(gameData: {
  name: string;
  developedBy: string;
  publisher: string;
  status: string;
  releaseDate: string;
  platforms: string[];
  engine?: string;
  genre: string;
  monetization: string;
  description: string;
  keyFeatures?: Array<{
    feature: string;
    description: string;
  }>;
  recognitions?: Array<{
    type: string;
    title: string;
    source?: string;
  }>;
  logoImageId?: string;
  logoImageFile?: File;
  logoImageUrl?: string;
  logoImagePath?: string; // Local path for development
}): Promise<{ success: boolean; id?: string; message: string; updated?: boolean }> {
  try {
    if (!DB_ID || !GAMES_TABLE_ID) {
      throw new Error('Database configuration missing');
    }

    // Check if game already exists by name FIRST, before any uploads
    const existingGames = await databases.listDocuments(DB_ID, GAMES_TABLE_ID, [
      Query.equal('status', 'approved'),
    ]);

    const existingDoc = existingGames.documents.find((doc: any) => {
      try {
        const parsed = typeof doc.gameData === 'string' 
          ? JSON.parse(doc.gameData) 
          : doc.gameData;
        return parsed?.name === gameData.name;
      } catch {
        return false;
      }
    });

    if (existingDoc) {
      const currentGameData = typeof existingDoc.gameData === 'string' 
        ? JSON.parse(existingDoc.gameData) 
        : existingDoc.gameData;
      
      const existingLogoId = currentGameData?.logoImageId;
      
      // If game exists and a new logoImageId is provided (different from existing), update it
      if (gameData.logoImageId && gameData.logoImageId !== existingLogoId) {
        const updatedGameData = {
          ...currentGameData,
          logoImageId: gameData.logoImageId,
        };

        await databases.updateDocument(DB_ID, GAMES_TABLE_ID, existingDoc.$id, {
          gameData: JSON.stringify(updatedGameData),
        });
        console.log(`✅ Updated ${gameData.name} with logo ID:`, gameData.logoImageId);
        return { success: true, id: existingDoc.$id, message: 'Game updated with logo', updated: true };
      }
      
      // If game exists and has a logo (and no new logo provided), don't upload anything - just return
      if (existingLogoId) {
        console.log(`ℹ️ Game "${gameData.name}" already exists with logo. Skipping upload.`);
        return { success: false, message: 'Game already exists' };
      }
      
      // Game exists but no logo - only upload if explicitly provided (not from path/url)
      // Only use provided logoImageId, don't upload from path/url on reload
      if (gameData.logoImageId) {
        const updatedGameData = {
          ...currentGameData,
          logoImageId: gameData.logoImageId,
        };

        await databases.updateDocument(DB_ID, GAMES_TABLE_ID, existingDoc.$id, {
          gameData: JSON.stringify(updatedGameData),
        });
        console.log(`✅ Updated ${gameData.name} with logo ID:`, gameData.logoImageId);
        return { success: true, id: existingDoc.$id, message: 'Game updated with logo', updated: true };
      }
      
      console.log(`ℹ️ Game "${gameData.name}" already exists without logo. Skipping upload.`);
      return { success: false, message: 'Game already exists' };
    }

    // Game doesn't exist - handle logo image upload or use provided ID
    let imageFileId: string | undefined = gameData.logoImageId;
    
    // Only upload if explicitly provided via file/url/path (not on every reload)
    if (gameData.logoImageFile) {
      imageFileId = await uploadImageToStorage(gameData.logoImageFile, `${gameData.name}-logo`);
      console.log(`Uploaded logo for ${gameData.name}:`, imageFileId);
    } else if (gameData.logoImageUrl) {
      imageFileId = await uploadImageFromUrl(gameData.logoImageUrl, `${gameData.name}-logo`);
      console.log(`Uploaded logo for ${gameData.name} from URL:`, imageFileId);
    } else if (gameData.logoImagePath) {
      imageFileId = await uploadImageFromLocalPath(gameData.logoImagePath, `${gameData.name}-logo`);
      console.log(`Uploaded logo for ${gameData.name} from local path:`, imageFileId);
    } else if (gameData.logoImageId) {
      // Use provided logoImageId directly (no upload needed)
      imageFileId = gameData.logoImageId;
      console.log(`Using provided logo ID for ${gameData.name}:`, imageFileId);
    }

    // Prepare the game data
    const documentData = {
      userId: 'admin-team',
      status: 'approved',
      createdByTeam: true,
      createdAt: new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(new Date()),
      gameData: JSON.stringify({
        name: gameData.name,
        developedBy: gameData.developedBy,
        publisher: gameData.publisher,
        status: gameData.status,
        releaseDate: gameData.releaseDate,
        platforms: gameData.platforms,
        engine: gameData.engine,
        genre: gameData.genre,
        monetization: gameData.monetization,
        description: gameData.description,
        keyFeatures: gameData.keyFeatures || [],
        recognitions: gameData.recognitions || [],
        logoImageId: imageFileId,
      }),
    } as const;

    // Create the game
    const response = await databases.createDocument(
      DB_ID,
      GAMES_TABLE_ID,
      ID.unique(),
      documentData as any
    );

    console.log(`Game "${gameData.name}" added successfully:`, response.$id);
    return { success: true, id: response.$id, message: 'Game added successfully' };
  } catch (error: any) {
    console.error('Error adding admin game:', error);
    return { success: false, message: error.message || 'Failed to add game' };
  }
}

export async function addJustCause3(logoImageId?: string) {
  // Use the existing uploaded logo file ID (updated with new logo)
  const JUST_CAUSE_3_LOGO_ID = '696615750028a1980aa7';
  
  // If logoImageId is provided, use it; otherwise use the default uploaded file ID
  let finalLogoImageId: string | undefined = logoImageId || JUST_CAUSE_3_LOGO_ID;
  
  console.log('ℹ️ Using Just Cause 3 logo ID:', finalLogoImageId);
  
  return await addAdminGame({
    name: 'Just Cause 3',
    developedBy: 'Avalanche Studios',
    publisher: 'Square Enix',
    status: 'Released',
    releaseDate: 'December 1st, 2015',
    platforms: ['PC', 'Playstation', 'Xbox'],
    engine: 'Apex Engine',
    genre: 'Action/Adventure/Open World',
    monetization: 'Paid Game + Optional DLC',
    description: 'The protagonist Rico Rodriguez returns to his home island of Medici to overthrow a dictator. The game emphasises large-scale destruction, wingsuit traversal, and open sandbox chaos.',
    keyFeatures: [
      {
        feature: 'Destruction Mechanics',
        description: 'Full ragdoll and gravity physics with strong destruction physics',
      },
      {
        feature: 'World Exploration',
        description: 'Large open world with verticality, wingsuit and grappling hook systems.',
      },
      {
        feature: 'Player Adaptation',
        description: 'In a do it your own way style game, Emphasis on player creativity in destruction and traversal',
      },
    ],
    recognitions: [
      {
        type: 'Review',
        title: 'Just Cause 3 does one thing really well, and a lot of other things poorly.',
        source: 'https://kotaku.com/just-cause-3-the-kotaku-review-1745359451',
      },
      {
        type: 'Press',
        title: 'Just Cause 3 is a solid game, but it may be a risky buy for a lot of people at the moment.',
        source: '',
      },
    ],
    logoImageId: finalLogoImageId,
  });
}

export async function addMadMax(logoImageId?: string) {
  // Use the existing uploaded logo file ID (updated with new logo)
  const MAD_MAX_LOGO_ID = '69661710002c930ed5dd';
  
  // If logoImageId is provided, use it; otherwise use the default uploaded file ID
  let finalLogoImageId: string | undefined = logoImageId || MAD_MAX_LOGO_ID;
  
  console.log('ℹ️ Using Mad Max logo ID:', finalLogoImageId);
  
  return await addAdminGame({
    name: 'Mad Max',
    developedBy: 'Avalanche Studios',
    publisher: 'Warner Bros',
    status: 'Released',
    releaseDate: 'September 1st, 2015',
    platforms: ['PC', 'Playstation', 'Xbox'],
    engine: 'Not Stated',
    genre: 'Action/Adventure/Open World',
    monetization: 'Paid Game',
    description: 'Based on the Mad Max film universe, this open-world action game focuses on vehicle combat, melee encounters, and survival in a post-apocalyptic wasteland.',
    keyFeatures: [
      {
        feature: 'Customization',
        description: 'Vehicle customization and deep car-combat mechanics in an open wasteland.',
      },
      {
        feature: 'Combat',
        description: 'Melee combat blended with driving sequences and exploration.',
      },
      {
        feature: 'Movie Hype',
        description: 'Spin off of movies with a large fan base.',
      },
    ],
    recognitions: [
      {
        type: 'Review',
        title: 'The road warrior provides a thrilling adventure, but the rust-ridden story can\'t keep up with the chase.',
        source: '',
      },
      {
        type: 'Press',
        title: 'Mad Max isn\'t a mediocre video game … runs spectacularly on PC.',
        source: '',
      },
    ],
    logoImageId: finalLogoImageId,
  });
}

export async function addDinnerWithAnOwl(logoImageId?: string) {
  // Use the existing uploaded logo file ID (updated with new logo)
  const DINNER_WITH_OWL_LOGO_ID = '69661a9d002b1779b767';
  
  // Path to the game logo in public folder (fallback for first-time upload)
  const LOGO_IMAGE_PATH = '/studio-images/Studio game images/Dinnerwithowl.png';
  
  // If logoImageId is provided, use it; otherwise use the default uploaded file ID
  let finalLogoImageId: string | undefined = logoImageId || DINNER_WITH_OWL_LOGO_ID;
  
  console.log('ℹ️ Using Dinner with an Owl logo ID:', finalLogoImageId);
  
  return await addAdminGame({
    name: 'Dinner with an Owl - "Dessert Edition"',
    developedBy: 'BoringSuburbanDad Games',
    publisher: 'BoringSuburbanDad Games',
    status: 'Released',
    releaseDate: 'May 18th, 2021',
    platforms: ['PC (Windows)'],
    engine: 'Proprietary Engine/Unknown',
    genre: 'Point and Click/Adventure/Horror/Fantasy',
    monetization: 'Free base game; paid Soundtrack DLC ($4.99)',
    description: 'Dinner With An Owl is a charming and macabre little game with a simple yet intriguing mystery to unravel. It\'s aesthetically beautiful and visually intriguing, and its engagement with surrealism and existential horror is both romantic and wryly self-aware. Anyone with a penchant for the gothic or for escape rooms may find something compelling in Dinner With An Owl, and be left wanting more.',
    keyFeatures: [
      {
        feature: 'Full voice acting',
        description: 'Full professional voice acting across characters.',
      },
      {
        feature: 'Original Soundtrack',
        description: 'Eerie OST available separately as DLC (Many people requested before its release)',
      },
      {
        feature: 'Time-loop narrative',
        description: 'Twisted, looping storyline within the mansion',
      },
      {
        feature: 'Free to play',
        description: 'Free to play base game through Steam',
      },
      {
        feature: 'Unique Graphics/Design',
        description: 'Hand drawn, noir-inspired 2D art with unsettling, but intriguing colour palette',
      },
    ],
    recognitions: [
      {
        type: 'Festival',
        title: 'Original release created in just two weeks for Adventure Jam 2017. (Has been updated many times since)',
        source: 'Adventure Jam 2017',
      },
      {
        type: 'Press Mention',
        title: 'Listed among "10 free horror games you can finish in 30 minutes or less"',
        source: 'Dread Central',
      },
      {
        type: 'Press Mention',
        title: 'Youtube coverage (1.5M views across uploads)',
        source: 'Alpha Beta Gamer',
      },
      {
        type: 'Review',
        title: 'Steam store (Very positive) with highly anticipated prequel release coming soon',
        source: 'Steam',
      },
    ],
    // Only pass logoImageId (never logoImagePath) to prevent re-uploads
    logoImageId: finalLogoImageId,
  });
}

export async function addOwlObservatory(logoImageId?: string) {
  // Use the existing uploaded logo file ID (updated with new logo)
  const OWL_OBSERVATORY_LOGO_ID = '69661db500374bf76d20';
  
  // Path to the game logo in public folder (fallback for first-time upload)
  const LOGO_IMAGE_PATH = '/studio-images/Studio game images/Owlobservatory.png';
  
  // If logoImageId is provided, use it; otherwise use the default uploaded file ID
  let finalLogoImageId: string | undefined = logoImageId || OWL_OBSERVATORY_LOGO_ID;
  
  console.log('ℹ️ Using Owl Observatory logo ID:', finalLogoImageId);
  
  return await addAdminGame({
    name: 'Owl Observatory',
    developedBy: 'BoringSuburbanDad Games',
    publisher: 'BoringSuburbanDad Games',
    status: 'In Development (TBA)',
    releaseDate: 'To be announced',
    platforms: ['PC (Windows)'],
    engine: 'Proprietary Engine/Unknown',
    genre: 'Point and Click/Adventure/Horror/Fantasy',
    monetization: 'Free game demo; Soundtrack DLC in progress; Base game',
    description: 'In Owl Observatory, the prequel to Dinner with an Owl, you experience a completely new adventure and dive deeper into the time-twisting mysteries of your owlish host. Enter the enigmatic mansion of Mr. Brooks, a peculiar owlish gourmet who holds his involuntary guests under a puzzling spell. Can you help them escape this nightmare? Then brace yourselves for some serious surprises!',
    keyFeatures: [
      {
        feature: 'Full voice acting',
        description: 'Full professional voice acting across characters in progress',
      },
      {
        feature: 'Original Soundtrack',
        description: 'Music teased via dev channels, OST presences established via predecessor, made with sound creation with the same artist.',
      },
      {
        feature: 'Time-loop narrative',
        description: 'Twisted, looping storyline within the mansion. Consequences repeating changing story lines',
      },
      {
        feature: 'High Anticipated Prequel',
        description: 'Very highly anticipated, lots of traction on first game and fan-base looking forward to next game',
      },
      {
        feature: 'Unique Graphics/Design',
        description: 'Hand drawn, noir-inspired 2D art with unsettling, but intriguing colour palette',
      },
    ],
    recognitions: [
      {
        type: 'Festival',
        title: 'Tiny Teams 2024 - selection/participation (Festival hosted on Steam by Yogacast; Aug 8-15 2024.)',
        source: 'Steam',
      },
      {
        type: 'Demo',
        title: 'Public demo release June 6, 2024: playable on Steam',
        source: 'Steam',
      },
      {
        type: 'Announcement',
        title: 'boringsuburbandad.Itch.IO Devlog announcement confirming it as the prequel to Dinner with an Owl, with wishlist call to action.',
        source: 'Itch.io',
      },
      {
        type: 'Creator Coverage',
        title: 'Alpha Beta Gamer; Youtube coverage (28k views across uploads)',
        source: 'Alpha Beta Gamer',
      },
    ],
    // Only pass logoImageId (never logoImagePath) to prevent re-uploads
    logoImageId: finalLogoImageId,
  });
}

export async function addShadowSurvival(logoImageId?: string) {
  // Use the existing uploaded logo file ID (updated with new logo)
  const SHADOW_SURVIVAL_LOGO_ID = '696621670036ecd7cf88';
  
  // If logoImageId is provided, use it; otherwise use the default uploaded file ID
  let finalLogoImageId: string | undefined = logoImageId || SHADOW_SURVIVAL_LOGO_ID;
  
  console.log('ℹ️ Using Shadow Survival logo ID:', finalLogoImageId);
  
  return await addAdminGame({
    name: 'Shadow Survival',
    developedBy: 'Celestial Knight Studios',
    publisher: 'Celestial Knight Studios',
    status: 'Released (Early Access)',
    releaseDate: 'January 24th, 2024',
    platforms: ['PC (Windows)'],
    engine: 'Unreal Engine',
    genre: 'Action/FPS/Co-op',
    monetization: 'Early access on steam $12.99 (CAD)',
    description: 'Story-driven online action FPS where you and friends fight demonic hordes across large, randomized battlefields. Craft weapons, customize loadouts and progress through a co-op campaign as Earth fights back after the apocalypse. "Fight for survival like no human ever has. Unleash powerful Abilities, and wield a vast array of destructive weaponry to eliminate hordes of demons on sight. And after all the dust clears, earn powerful, unique rewards, allowing you to return to the battlefield to unleash Mayhem however you please."',
    keyFeatures: [
      {
        feature: 'Co-op',
        description: '1-12 player co-op focus with DEEP customization',
      },
      {
        feature: 'Campaign',
        description: 'Massive series of co-op campaign missions with survival scenario and class choices',
      },
      {
        feature: 'Crafting + Progression',
        description: 'Craft hundreds of weapons, companions, or paint jobs, with 99+ achievements on steam.',
      },
      {
        feature: 'Unique Biome + Art Style',
        description: 'Procedurally Generated Environments, with a distinct low-poly art style to showcase game uniqueness',
      },
      {
        feature: 'Early Access',
        description: 'Dev is seeking early feedback during development (early stage game; <year)',
      },
    ],
    recognitions: [
      {
        type: 'Steam Reviews',
        title: 'Steam store (positive), not many reviews but very in depth and give genuine feedback (showing user have interest to improve game)',
        source: 'Steam',
      },
      {
        type: 'Reddit Traction',
        title: 'Many reddit users seen prompted said game - looking forward to full release',
        source: 'Reddit',
      },
    ],
    logoImageId: finalLogoImageId,
  });
}
