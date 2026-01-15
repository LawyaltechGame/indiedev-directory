/**
 * Utility to manually update studio profile images
 * Run this in browser console: window.fixStudioImages()
 */
import { databases, Query } from '../config/appwrite';
import { parseProfileJSONFields } from '../services/profile';

const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID as string;
const PROFILE_TABLE_ID = import.meta.env.VITE_APPWRITE_PROFILE_TABLE_ID as string;

const STUDIO_IMAGE_IDS: Record<string, string> = {
  'Avalanche Studios': '695e37a300182b435e34',
  'BoringSuburbanDad': '', // Will need to be uploaded/found
  'Celestial Knight Studios': '696620cf0001ea892949',
};

export async function fixStudioImages() {
  try {
    if (!DB_ID || !PROFILE_TABLE_ID) {
      throw new Error('Database configuration missing');
    }

    console.log('🔍 Checking studios for missing profileImageId...');

    const existingProfiles = await databases.listDocuments(DB_ID, PROFILE_TABLE_ID, [
      Query.equal('status', 'approved'),
    ]);

    const updates: Array<{ name: string; id: string; imageId: string }> = [];

    for (const doc of existingProfiles.documents) {
      try {
        const parsed = parseProfileJSONFields(doc);
        const studioName = parsed.name;
        
        if (!studioName) continue;

        // Get current profileImageId
        const currentProfileData = doc.profileData 
          ? (typeof doc.profileData === 'string' 
              ? JSON.parse(doc.profileData) 
              : doc.profileData)
          : {};
        
        const currentImageId = currentProfileData?.profileImageId || '';
        const expectedImageId = STUDIO_IMAGE_IDS[studioName];

        // If studio has no image ID but we have one for it, add to updates
        if ((!currentImageId || currentImageId === '') && expectedImageId) {
          updates.push({
            name: studioName,
            id: doc.$id,
            imageId: expectedImageId,
          });
        } else if (currentImageId && currentImageId !== '') {
          console.log(`✅ ${studioName} already has profileImageId: ${currentImageId}`);
        } else {
          console.log(`⚠️ ${studioName} has no profileImageId and no expected ID configured`);
        }
      } catch (error) {
        console.error(`Error processing profile ${doc.$id}:`, error);
      }
    }

    // Update studios that need images
    for (const update of updates) {
      try {
        const doc = existingProfiles.documents.find(d => d.$id === update.id);
        if (!doc) continue;

        const currentProfileData = doc.profileData 
          ? (typeof doc.profileData === 'string' 
              ? JSON.parse(doc.profileData) 
              : doc.profileData)
          : {};

        const updatedProfileData = {
          ...currentProfileData,
          profileImageId: update.imageId,
        };

        await databases.updateDocument(DB_ID, PROFILE_TABLE_ID, update.id, {
          profileData: JSON.stringify(updatedProfileData),
        });

        console.log(`✅ Updated ${update.name} with profileImageId: ${update.imageId}`);
      } catch (error) {
        console.error(`❌ Failed to update ${update.name}:`, error);
      }
    }

    console.log(`\n✨ Fix complete! Updated ${updates.length} studio(s).`);
    return { success: true, updated: updates.length };
  } catch (error) {
    console.error('❌ Error fixing studio images:', error);
    return { success: false, error };
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.fixStudioImages = fixStudioImages;
}
