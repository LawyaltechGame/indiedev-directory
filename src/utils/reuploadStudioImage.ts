/**
 * Utility to re-upload studio profile images
 * Run: window.reuploadStudioImage('BoringSuburbanDad')
 */
import { databases, Query, ID } from '../config/appwrite';
import { parseProfileJSONFields } from '../services/profile';
import { Storage } from 'appwrite';
import client from '../config/appwrite';
import { compressImage } from '../services/studioImages';

const storage = new Storage(client);
const STUDIO_IMAGES_BUCKET_ID = import.meta.env.VITE_APPWRITE_STUDIO_IMAGES_BUCKET_ID as string;

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

const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID as string;
const PROFILE_TABLE_ID = import.meta.env.VITE_APPWRITE_PROFILE_TABLE_ID as string;

const STUDIO_IMAGE_PATHS: Record<string, string> = {
  'BoringSuburbanDad': '/studio-images/BoringSuburbanDad-Profilephoto.png',
  'Avalanche Studios': '', // Uses provided ID
  'Celestial Knight Studios': '', // Uses provided ID
};

export async function reuploadStudioImage(studioName: string) {
  try {
    if (!DB_ID || !PROFILE_TABLE_ID) {
      throw new Error('Database configuration missing');
    }

    console.log(`🔄 Re-uploading image for studio: ${studioName}`);

    const imagePath = STUDIO_IMAGE_PATHS[studioName];
    if (!imagePath) {
      console.error(`❌ No image path configured for ${studioName}`);
      return { success: false, message: 'No image path configured' };
    }

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

    console.log(`📤 Uploading image from: ${imagePath}`);
    
    // Upload the image
    const newImageId = await uploadImageFromLocalPath(imagePath, `${studioName}-logo`);
    console.log(`✅ Image uploaded with ID: ${newImageId}`);

    // Update the studio's profileImageId
    const currentProfileData = studio.profileData 
      ? (typeof studio.profileData === 'string' 
          ? JSON.parse(studio.profileData) 
          : studio.profileData)
      : {};

    const updatedProfileData = {
      ...currentProfileData,
      profileImageId: newImageId,
    };

    await databases.updateDocument(DB_ID, PROFILE_TABLE_ID, studio.$id, {
      profileData: JSON.stringify(updatedProfileData),
    });

    console.log(`✅ Updated ${studioName} with new profileImageId: ${newImageId}`);
    
    return { success: true, imageId: newImageId };
  } catch (error) {
    console.error('❌ Error re-uploading studio image:', error);
    return { success: false, error };
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.reuploadStudioImage = reuploadStudioImage;
}
