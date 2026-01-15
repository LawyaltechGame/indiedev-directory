/**
 * Utility to update studio profileImageId
 * Run: window.updateStudioImageId('BoringSuburbanDad', '6968aae1001bacf83a50')
 */
import { databases, Query } from '../config/appwrite';
import { parseProfileJSONFields } from '../services/profile';

const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID as string;
const PROFILE_TABLE_ID = import.meta.env.VITE_APPWRITE_PROFILE_TABLE_ID as string;

export async function updateStudioImageId(studioName: string, imageId: string) {
  try {
    if (!DB_ID || !PROFILE_TABLE_ID) {
      throw new Error('Database configuration missing');
    }

    console.log(`🔄 Updating ${studioName} with profileImageId: ${imageId}`);

    // Find the studio
    const existingProfiles = await databases.listDocuments(DB_ID, PROFILE_TABLE_ID, [
      Query.equal('status', 'approved'),
    ]);

    const studio = existingProfiles.documents.find((doc: any) => {
      try {
        const parsed = parseProfileJSONFields(doc);
        return parsed.name === studioName;
      } catch {
        return false;
      }
    });

    if (!studio) {
      console.error(`❌ Studio "${studioName}" not found`);
      return { success: false, message: 'Studio not found' };
    }

    // Get current profileData
    const currentProfileData = studio.profileData 
      ? (typeof studio.profileData === 'string' 
          ? JSON.parse(studio.profileData) 
          : studio.profileData)
      : {};

    // Update profileImageId
    const updatedProfileData = {
      ...currentProfileData,
      profileImageId: imageId,
    };

    // Update the document
    await databases.updateDocument(DB_ID, PROFILE_TABLE_ID, studio.$id, {
      profileData: JSON.stringify(updatedProfileData),
    });

    console.log(`✅ Updated ${studioName} with profileImageId: ${imageId}`);
    
    return { success: true, imageId };
  } catch (error) {
    console.error('❌ Error updating studio image ID:', error);
    return { success: false, error };
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.updateStudioImageId = updateStudioImageId;
}
