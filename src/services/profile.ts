import { databases, ID, Query } from '../config/appwrite';
import { Permission, Role } from 'appwrite';
import type { FormData } from '../types';

export async function createProfileDocument(params: {
  databaseId: string;
  tableId: string; // collection/table id
  userId: string;
  data: FormData;
  createdByTeam?: boolean; // Flag to indicate if created by review team
}) {
  const { databaseId, tableId, userId, data, createdByTeam = false } = params;

  const createdAt = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date());

  // Normalize payload to simple fields
  // ALL data grouped into ONE JSON column to stay within Appwrite free tier column limit (15 max)
  const documentData = {
    // Keep these separate for queries/filtering (commonly used)
    userId,
    status: createdByTeam ? 'approved' : 'pending', // Auto-approve if created by team
    createdByTeam, // Track if created by team
    createdAt,
    
    // ONE BIG JSON column with ALL profile data
    profileData: JSON.stringify({
      // Basic Profile Info
      name: data.name,
      tagline: data.tagline,
      description: data.description || '',
      website: data.website || '',
      
      // Classification & Location
      genre: data.genre,
      platform: data.platform,
      teamSize: data.teamSize,
      location: data.location,
      
      // Contact Information
      email: data.email,
      authEmail: data.authEmail, // User's authentication email
      publicContactEmail: data.publicContactEmail || '',
      
      // Business & Revenue
      revenue: data.revenue || '',
      foundedYear: data.foundedYear || '',
      
      // Tags & Tools
      tools: data.tools || [],
      tags: data.tags || [],
      
      // Extended Studio Details
      studioType: data.studioType || '',
      headquartersCountry: data.headquartersCountry || '',
      city: data.city || '',
      languagesSupported: data.languagesSupported || [],
      regionsServed: data.regionsServed || [],
      
      // Ownership & Identity
      founders: data.founders || [],
      parentCompany: data.parentCompany || '',
      acquisitionStatus: data.acquisitionStatus || '',
      acquiredBy: data.acquiredBy || '',
      
      // Team & Capabilities
      targetAudience: data.targetAudience || '',
      primaryExpertise: data.primaryExpertise || [],
      gameEngines: data.gameEngines || [],
      deploymentType: data.deploymentType || '',
      
      // Platforms & Technology
      supportedPlatforms: data.supportedPlatforms || [],
      
      // Projects Portfolio
      projects: data.projects || [],
      
      // Business & Collaboration
      lookingFor: data.lookingFor || [],
      openToPublishingDeals: data.openToPublishingDeals || false,
      publisherPartners: data.publisherPartners || '',
      fundingType: data.fundingType || '',
      latestFundingRound: data.latestFundingRound || '',
      totalFunding: data.totalFunding || '',
      
      // Distribution & Stores
      distributionChannels: data.distributionChannels || [],
      storeLinks: data.storeLinks || [],
      
      // Contact & Community
      socialLinks: data.socialLinks || {},
      recognitions: data.recognitions || [],
      trailerVideoUrl: data.trailerVideoUrl || '',
      gameplayVideoUrl: data.gameplayVideoUrl || '',
    }),
  } as const;

  // For Appwrite Tables, don't pass permissions during creation
  // Use table-level permissions instead (configured in Appwrite Console)
  // Row security can be enabled later if document-level permissions are needed
  return await databases.createDocument(databaseId, tableId, ID.unique(), documentData as any);
}

// Helper function to parse JSON columns from Appwrite and flatten for backward compatibility
function parseProfileJSONFields(profile: any) {
  if (!profile) return profile;
  
  const parsed = { ...profile };
  
  // Parse the main profileData JSON column and flatten all fields
  if (parsed.profileData && parsed.profileData !== 'NULL' && parsed.profileData !== null) {
    if (typeof parsed.profileData === 'string' && parsed.profileData.trim() && parsed.profileData.trim() !== 'NULL') {
      try {
        const profileData = JSON.parse(parsed.profileData);
        // Flatten all fields to root level for backward compatibility
        Object.assign(parsed, profileData);
        // Keep the grouped version too
        parsed.profileData = profileData;
      } catch (e) {
        console.error('Error parsing profileData:', e, 'Raw data:', parsed.profileData);
        parsed.profileData = {};
      }
    } else if (typeof parsed.profileData === 'object' && parsed.profileData !== null) {
      // Already parsed, just flatten it
      Object.assign(parsed, parsed.profileData);
    }
  }
  
  // Handle backward compatibility - if profileData is NULL but old columns exist, use them
  if ((!parsed.profileData || parsed.profileData === 'NULL' || Object.keys(parsed.profileData || {}).length === 0) && !parsed.name) {
    // Try to read from old column structure if it exists
    // This handles profiles created before the new structure
  }
  
  // Also handle old grouped format for backward compatibility (if migrating)
  const oldJsonFields = [
    'basicInfo',
    'classification',
    'contactInfo',
    'businessInfo',
    'tagsTools',
    'studioDetails',
    'ownershipIdentity',
    'teamCapabilities',
    'platformsTech',
    'projectsPortfolio',
    'businessCollaboration',
    'distributionStores',
    'contactCommunity',
  ];
  
  oldJsonFields.forEach((field) => {
    if (parsed[field] && typeof parsed[field] === 'string') {
      try {
        const parsedData = JSON.parse(parsed[field]);
        Object.assign(parsed, parsedData);
        parsed[field] = parsedData;
      } catch (e) {
        parsed[field] = field === 'projectsPortfolio' ? [] : {};
      }
    }
  });
  
  // Ensure required fields have defaults if missing (for display purposes)
  if (!parsed.name && parsed.profileData && typeof parsed.profileData === 'object') {
    // If name is missing but profileData exists, try to extract it
    parsed.name = parsed.profileData.name || 'Unknown Studio';
  }

  return parsed;
}

export async function getAllProfiles(databaseId: string, tableId: string) {
  try {
    const response = await databases.listDocuments(databaseId, tableId);
    // Parse JSON columns for each profile
    return response.documents.map(parseProfileJSONFields);
  } catch (error) {
    console.error('Error fetching profiles:', error);
    throw error;
  }
}

export async function getApprovedProfiles(databaseId: string, tableId: string) {
  try {
    const response = await databases.listDocuments(databaseId, tableId, [
      Query.equal('status', 'approved')
    ]);
    // Parse JSON columns for each profile
    return response.documents.map(parseProfileJSONFields);
  } catch (error) {
    console.error('Error fetching approved profiles:', error);
    throw error;
  }
}

export async function updateProfileStatus(
  databaseId: string,
  tableId: string,
  documentId: string,
  status: 'pending' | 'approved' | 'rejected'
) {
  try {
    return await databases.updateDocument(databaseId, tableId, documentId, {
      status,
    });
  } catch (error) {
    console.error('Error updating profile status:', error);
    throw error;
  }
}

export async function getUserPendingProfile(databaseId: string, tableId: string, userId: string) {
  try {
    const response = await databases.listDocuments(databaseId, tableId, [
      Query.equal('userId', userId),
      Query.equal('status', 'pending')
    ]);
    return response.documents.length > 0 ? response.documents[0] : null;
  } catch (error) {
    console.error('Error fetching user pending profile:', error);
    return null;
  }
}

export async function updateProfilePermissions(
  databaseId: string,
  tableId: string,
  documentId: string
) {
  try {
    const REVIEW_TEAM_ID = import.meta.env.VITE_REVIEW_TEAM_ID as string;
    
    if (!REVIEW_TEAM_ID) {
      console.warn('REVIEW_TEAM_ID not configured. Cannot add team permissions.');
      return null;
    }

    // Get the current document to preserve existing permissions
    const document = await databases.getDocument(databaseId, tableId, documentId);
    const userId = document.userId;

    // Build permissions array with both user and team permissions
    // Note: Document-level permissions support read/update/delete. Avoid 'write' on documents.
    const permissions = [
      Permission.read(Role.any()),
      Permission.update(Role.user(userId)),
      Permission.delete(Role.user(userId)),
      Permission.update(Role.team(REVIEW_TEAM_ID)),
      Permission.delete(Role.team(REVIEW_TEAM_ID)),
    ];

    // Try to update permissions (this requires write access)
    return await databases.updateDocument(
      databaseId,
      tableId,
      documentId,
      {},
      permissions
    );
  } catch (error) {
    console.error('Error updating profile permissions:', error);
    // Return null if we can't update permissions (might not have access)
    return null;
  }
}

export async function deleteProfile(
  databaseId: string,
  tableId: string,
  documentId: string
) {
  try {
    // First, try to update permissions if this is an old profile without team permissions
    // This will silently fail if we don't have write access, which is fine
    await updateProfilePermissions(databaseId, tableId, documentId);
    
    // Then delete the document
    return await databases.deleteDocument(databaseId, tableId, documentId);
  } catch (error) {
    console.error('Error deleting profile:', error);
    throw error;
  }
}
