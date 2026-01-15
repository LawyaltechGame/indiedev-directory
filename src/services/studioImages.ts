import { Storage } from 'appwrite';
import client from '../config/appwrite';

const storage = new Storage(client);

const STUDIO_IMAGES_BUCKET_ID = import.meta.env.VITE_APPWRITE_STUDIO_IMAGES_BUCKET_ID as string;

/**
 * Compress image before uploading
 */
export function compressImage(file: File, maxWidth: number = 1200, quality: number = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          file.type,
          quality
        );
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Upload studio profile image to Appwrite Storage
 */
export async function uploadStudioImage(
  studioId: string,
  imageFile: File
): Promise<string> {
  try {
    if (!STUDIO_IMAGES_BUCKET_ID) {
      throw new Error('Studio images bucket not configured');
    }

    // Compress image
    const compressedFile = await compressImage(imageFile, 1200, 0.8);

    // Upload to Appwrite Storage
    const file = await storage.createFile(
      STUDIO_IMAGES_BUCKET_ID,
      `${studioId}-${Date.now()}`,
      compressedFile
    );

    // Return file URL
    return storage.getFileView(STUDIO_IMAGES_BUCKET_ID, file.$id);
  } catch (error) {
    console.error('Error uploading studio image:', error);
    throw error;
  }
}

/**
 * Get studio image URL from Appwrite Storage
 */
export function getStudioImageUrl(fileId: string): string {
  if (!STUDIO_IMAGES_BUCKET_ID) {
    return '';
  }
  return storage.getFileView(STUDIO_IMAGES_BUCKET_ID, fileId);
}

/**
 * Delete studio image from Appwrite Storage
 */
export async function deleteStudioImage(fileId: string): Promise<void> {
  try {
    if (!STUDIO_IMAGES_BUCKET_ID) {
      throw new Error('Studio images bucket not configured');
    }
    await storage.deleteFile(STUDIO_IMAGES_BUCKET_ID, fileId);
  } catch (error) {
    console.error('Error deleting studio image:', error);
    throw error;
  }
}

