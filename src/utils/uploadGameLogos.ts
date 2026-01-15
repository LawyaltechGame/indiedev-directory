/**
 * Utility script to upload game logos to Appwrite Storage
 * 
 * Usage:
 * 1. Place game logo images in the public folder:
 *    - public/game-logos/just-cause-3-logo.png
 *    - public/game-logos/mad-max-logo.png
 * 
 * 2. Run this in browser console:
 *    window.uploadGameLogos()
 * 
 * Or import and call:
 *    import { uploadGameLogos } from './utils/uploadGameLogos';
 *    await uploadGameLogos();
 */

import { Storage, ID } from 'appwrite';
import client from '../config/appwrite';
import { compressImage } from '../services/studioImages';

const storage = new Storage(client);
const STUDIO_IMAGES_BUCKET_ID = import.meta.env.VITE_APPWRITE_STUDIO_IMAGES_BUCKET_ID as string;

async function uploadGameLogo(imagePath: string, fileName: string): Promise<string> {
  try {
    if (!STUDIO_IMAGES_BUCKET_ID) {
      throw new Error('Studio images bucket not configured');
    }

    // Fetch image from public folder
    const response = await fetch(imagePath);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const blob = await response.blob();
    const file = new File([blob], fileName, { type: blob.type });

    // Compress image
    const compressedFile = await compressImage(file, 800, 0.85);

    // Upload to Appwrite Storage
    const uploadedFile = await storage.createFile(
      STUDIO_IMAGES_BUCKET_ID,
      ID.unique(),
      compressedFile
    );

    return uploadedFile.$id;
  } catch (error) {
    console.error(`Error uploading ${fileName}:`, error);
    throw error;
  }
}

export async function uploadGameLogos(): Promise<{
  justCause3?: string;
  madMax?: string;
}> {
  const results: { justCause3?: string; madMax?: string } = {};

  try {
    console.log('🎮 Starting game logo uploads...');

    // Try to upload Just Cause 3 logo
    const possibleJustCause3Paths = [
      '/game-logos/just-cause-3-logo.png',
      '/game-logos/Just Cause 3 Profilephoto.png',
      '/images/game-logos/just-cause-3-logo.png',
    ];

    for (const path of possibleJustCause3Paths) {
      try {
        const fileId = await uploadGameLogo(path, 'just-cause-3-logo');
        results.justCause3 = fileId;
        console.log('✅ Just Cause 3 logo uploaded:', fileId);
        break;
      } catch {
        continue;
      }
    }

    if (!results.justCause3) {
      console.warn('⚠️ Just Cause 3 logo not found. Please upload manually.');
    }

    // Try to upload Mad Max logo
    const possibleMadMaxPaths = [
      '/game-logos/mad-max-logo.png',
      '/game-logos/Madmax Profilephoto.png',
      '/images/game-logos/mad-max-logo.png',
    ];

    for (const path of possibleMadMaxPaths) {
      try {
        const fileId = await uploadGameLogo(path, 'mad-max-logo');
        results.madMax = fileId;
        console.log('✅ Mad Max logo uploaded:', fileId);
        break;
      } catch {
        continue;
      }
    }

    if (!results.madMax) {
      console.warn('⚠️ Mad Max logo not found. Please upload manually.');
    }

    if (results.justCause3 && results.madMax) {
      console.log('✅ All game logos uploaded successfully!');
      console.log('📋 File IDs:', results);
      console.log('💡 Update your game initialization code with these IDs');
    }

    return results;
  } catch (error) {
    console.error('❌ Error uploading game logos:', error);
    throw error;
  }
}

// Make it available globally for console access
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.uploadGameLogos = uploadGameLogos;
}

