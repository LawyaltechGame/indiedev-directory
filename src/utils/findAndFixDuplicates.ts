/**
 * Utility to find and fix duplicate studio entries
 * Run: window.findAndFixDuplicates('BoringSuburbanDad')
 */
import { databases, Query } from '../config/appwrite';
import { parseProfileJSONFields } from '../services/profile';

const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID as string;
const PROFILE_TABLE_ID = import.meta.env.VITE_APPWRITE_PROFILE_TABLE_ID as string;

export async function findAndFixDuplicates(studioName: string) {
  try {
    if (!DB_ID || !PROFILE_TABLE_ID) {
      throw new Error('Database configuration missing');
    }

    console.log(`🔍 Finding duplicates for: ${studioName}`);

    const existingProfiles = await databases.listDocuments(DB_ID, PROFILE_TABLE_ID, [
      Query.equal('status', 'approved'),
    ]);

    const duplicates = existingProfiles.documents.filter((doc: any) => {
      try {
        const parsed = parseProfileJSONFields(doc);
        return parsed.name === studioName;
      } catch {
        return false;
      }
    });

    console.log(`Found ${duplicates.length} entries for ${studioName}:`, duplicates.map(d => ({
      id: d.$id,
      createdAt: d.$createdAt,
      profileImageId: (() => {
        try {
          const profileData = d.profileData 
            ? (typeof d.profileData === 'string' ? JSON.parse(d.profileData) : d.profileData)
            : {};
          return profileData.profileImageId || 'none';
        } catch {
          return 'error';
        }
      })(),
    })));

    if (duplicates.length > 1) {
      // Find the one with the correct/newest image ID
      const getCorrectImageId = (studioName: string): string | null => {
        if (studioName === 'BoringSuburbanDad') return '6968aae1001bacf83a50';
        if (studioName === 'Avalanche Studios') return '6968ab5b0025fcdc0d8c';
        return null;
      };
      
      const correctImageId = getCorrectImageId(studioName);
      
      const withCorrectImage = duplicates.find((doc: any) => {
        try {
          const profileData = doc.profileData 
            ? (typeof doc.profileData === 'string' ? JSON.parse(doc.profileData) : doc.profileData)
            : {};
          return profileData.profileImageId === correctImageId;
        } catch {
          return false;
        }
      });

      if (withCorrectImage) {
        console.log(`✅ Found entry with correct image ID: ${withCorrectImage.$id}`);
        
        // Delete duplicates without the correct image ID
        const toDelete = duplicates.filter(d => d.$id !== withCorrectImage.$id);
        
        for (const dup of toDelete) {
          try {
            await databases.deleteDocument(DB_ID, PROFILE_TABLE_ID, dup.$id);
            console.log(`🗑️ Deleted duplicate entry: ${dup.$id}`);
          } catch (error) {
            console.error(`❌ Failed to delete ${dup.$id}:`, error);
          }
        }
        
        console.log(`✅ Kept entry ${withCorrectImage.$id} and deleted ${toDelete.length} duplicate(s)`);
        return { success: true, kept: withCorrectImage.$id, deleted: toDelete.length };
      } else {
        console.log(`⚠️ No entry found with correct image ID. All entries:`, duplicates.map(d => ({
          id: d.$id,
          imageId: (() => {
            try {
              const profileData = d.profileData 
                ? (typeof d.profileData === 'string' ? JSON.parse(d.profileData) : d.profileData)
                : {};
              return profileData.profileImageId || 'none';
            } catch {
              return 'error';
            }
          })(),
        })));
        
        // Keep the most recent one and update it
        const mostRecent = duplicates.sort((a, b) => 
          (b.$createdAt || '').localeCompare(a.$createdAt || '')
        )[0];
        
        console.log(`📝 Updating most recent entry ${mostRecent.$id} with correct image ID`);
        
        const currentProfileData = mostRecent.profileData 
          ? (typeof mostRecent.profileData === 'string' 
              ? JSON.parse(mostRecent.profileData) 
              : mostRecent.profileData)
          : {};

        const updatedProfileData = {
          ...currentProfileData,
          profileImageId: correctImageId,
        };

        await databases.updateDocument(DB_ID, PROFILE_TABLE_ID, mostRecent.$id, {
          profileData: JSON.stringify(updatedProfileData),
        });

        // Delete other duplicates
        const toDelete = duplicates.filter(d => d.$id !== mostRecent.$id);
        for (const dup of toDelete) {
          try {
            await databases.deleteDocument(DB_ID, PROFILE_TABLE_ID, dup.$id);
            console.log(`🗑️ Deleted duplicate entry: ${dup.$id}`);
          } catch (error) {
            console.error(`❌ Failed to delete ${dup.$id}:`, error);
          }
        }

        return { success: true, updated: mostRecent.$id, deleted: toDelete.length };
      }
    } else {
      console.log(`✅ No duplicates found for ${studioName}`);
      return { success: true, duplicates: 0 };
    }
  } catch (error) {
    console.error('❌ Error finding/fixing duplicates:', error);
    return { success: false, error };
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.findAndFixDuplicates = findAndFixDuplicates;
}
