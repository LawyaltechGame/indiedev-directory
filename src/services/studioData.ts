import { databases, ID, Query } from '../config/appwrite';

const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID as string;
const PROFILE_TABLE_ID = import.meta.env.VITE_APPWRITE_PROFILE_TABLE_ID as string;

/**
 * Add Avalanche Studios profile directly to Appwrite
 * This can be called once to populate the studio data
 */
export async function addAvalancheStudiosProfile() {
  try {
    if (!DB_ID || !PROFILE_TABLE_ID) {
      throw new Error('Database configuration missing');
    }

    // Check if Avalanche Studios already exists by searching approved profiles
    const existingProfiles = await databases.listDocuments(DB_ID, PROFILE_TABLE_ID, [
      Query.equal('status', 'approved'),
    ]);

    const avalancheExists = existingProfiles.documents.some((doc: any) => {
      try {
        const profileData = typeof doc.profileData === 'string' 
          ? JSON.parse(doc.profileData) 
          : doc.profileData;
        return profileData?.name === 'Avalanche Studios';
      } catch {
        return false;
      }
    });

    if (avalancheExists) {
      console.log('Avalanche Studios profile already exists');
      return null;
    }

    const avalancheStudioData = {
      userId: 'system', // System user ID for manually added studios
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
      profileData: JSON.stringify({
        // Basic Profile Info
        name: 'Avalanche Studios',
        tagline: 'Avalanche Game Studios',
        description: 'Avalanche Studios Group is a Swedish developer and publisher based in Stockholm, best known for large-scale open-world action games. Founded in 2003, the group includes the Avalanche Studios, Expansive Worlds,',
        website: 'https://avalanchestudios.com/',
        
        // Classification & Location
        genre: 'Action',
        platform: 'PC, Playstation, Xbox',
        teamSize: '~450+',
        location: 'Stockholm, Sweden',
        
        // Contact Information
        email: '',
        publicContactEmail: '',
        
        // Business & Revenue
        revenue: '',
        foundedYear: '2003',
        
        // Tags & Tools
        tools: [],
        tags: [],
        
        // Extended Studio Details
        studioType: 'AAA Developer',
        headquartersCountry: 'Sweden',
        city: 'Stockholm',
        languagesSupported: ['English (primary)'],
        regionsServed: ['Global'],
        
        // Ownership & Identity
        founders: ['Linus Blomberg', 'Christofer Sundberg'],
        parentCompany: '',
        acquisitionStatus: 'Independent',
        acquiredBy: '',
        
        // Team & Capabilities
        targetAudience: 'Open-world sanction and sandbox players',
        primaryExpertise: [],
        gameEngines: ['Apex Engine (formerly Avalanche Engine)', 'Proprietary tools'],
        deploymentType: 'Digital (Steam, Epic games store, console)',
        
        // Platforms & Technology
        supportedPlatforms: ['PC', 'Playstation', 'Xbox', 'Stadia'],
        
        // Projects Portfolio
        projects: [
          {
            gameTitle: 'Just Cause 3',
            status: 'Released',
            platforms: ['PC', 'Playstation', 'Xbox'],
            projectPageUrl: 'https://store.steampowered.com/app/225540/Just_Cause_3/',
            shortDescription: '',
          },
          {
            gameTitle: 'Just Cause 4',
            status: 'Released',
            platforms: ['PC', 'Playstation', 'Xbox'],
            projectPageUrl: 'https://store.steampowered.com/app/517630/Just_Cause_4_Reloaded/',
            shortDescription: '',
          },
          {
            gameTitle: 'Mad Max',
            status: 'Released',
            platforms: ['PC', 'Ps4', 'Xbox'],
            projectPageUrl: 'https://store.steampowered.com/app/234140/Mad_Max/',
            shortDescription: '',
          },
          {
            gameTitle: 'Rage 2',
            status: 'Released',
            platforms: ['PC', 'Xbox'],
            projectPageUrl: 'https://store.steampowered.com/app/548570/RAGE_2/',
            shortDescription: '',
          },
          {
            gameTitle: 'Contraband',
            status: 'In Development',
            platforms: ['Planned Xbox'],
            projectPageUrl: 'https://avalanchestudios.com/games/contraband',
            shortDescription: '',
          },
        ],
        
        // Business & Collaboration
        lookingFor: ['Not stated publicly; continues to work with major publishers and explore self-publishing for new IP'],
        openToPublishingDeals: true,
        publisherPartners: 'Square Enix (Just Cause series), Warner Bros. (Mad Max), Bethesda Softworks (Rage 2), Xbox Game Studios (Contraband before halt).',
        fundingType: 'Owned by Nordisk Film',
        latestFundingRound: '',
        totalFunding: '',
        
        // Distribution & Stores
        distributionChannels: ['Steam', 'Consoles'],
        storeLinks: [
          'https://store.steampowered.com/developer/Avalanchestudios/',
          'https://avalanchestudios.com/divisions/',
        ],
        
        // Contact & Community
        socialLinks: {
          twitter: 'https://x.com/AvalancheSweden',
          instagram: 'https://www.instagram.com/avalanchestudios/?hl=en',
          youtube: '',
          facebook: '',
          discord: '',
          linkedin: '',
        },
        recognitions: [
          {
            type: 'Press Mention',
            title: 'Long recognized as "the creators of the Just Cause franchise and developers of Mad Max and Rage 2," emphasizing their open-world expertise.',
            year: '',
            description: '',
            source: 'Avalanche Studios',
          },
          {
            type: 'Press mention',
            title: 'Some subsidiary studios are closing worldwide.',
            year: '',
            description: '',
            source: 'Games Industry',
          },
        ],
        trailerVideoUrl: 'https://www.youtube.com/watch?v=0ND5dYIFkd0',
        gameplayVideoUrl: '',
        
        // Known For
        knownFor: 'Their very popular series Just Cause, and their Mad Max game, and Rage 2.',
      }),
    };

    // Create the profile
    const response = await databases.createDocument(
      DB_ID,
      PROFILE_TABLE_ID,
      ID.unique(),
      avalancheStudioData as any
    );
    console.log('Avalanche Studios profile added successfully:', response.$id);
    return response;
  } catch (error: any) {
    // If error is because it already exists or other issue, just log it
    console.error('Error adding Avalanche Studios profile:', error);
    return null;
  }
}

