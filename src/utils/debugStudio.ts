/**
 * Debug utility to check studio data in database
 * Run: window.debugStudio('BoringSuburbanDad')
 */
import { databases, Query } from '../config/appwrite';
import { parseProfileJSONFields } from '../services/profile';

const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID as string;
const PROFILE_TABLE_ID = import.meta.env.VITE_APPWRITE_PROFILE_TABLE_ID as string;

export async function debugStudio(studioName: string) {
  try {
    if (!DB_ID || !PROFILE_TABLE_ID) {
      throw new Error('Database configuration missing');
    }

    console.log(`🔍 Debugging studio: ${studioName}`);

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
      console.log(`❌ Studio "${studioName}" not found`);
      return;
    }

    console.log('📄 Raw document:', studio);
    
    // Parse the profile
    const parsed = parseProfileJSONFields(studio);
    console.log('📋 Parsed profile:', parsed);
    
    // Check profileData
    const profileData = studio.profileData 
      ? (typeof studio.profileData === 'string' 
          ? JSON.parse(studio.profileData) 
          : studio.profileData)
      : {};
    console.log('📦 ProfileData object:', profileData);
    console.log('🖼️ ProfileImageId in profileData:', profileData.profileImageId);
    console.log('🖼️ ProfileImageId in parsed (root):', parsed.profileImageId);
    
    // Check if image URL can be generated
    if (parsed.profileImageId || profileData.profileImageId) {
      const imageId = parsed.profileImageId || profileData.profileImageId;
      console.log('✅ Found profileImageId:', imageId);
      
      // Try to generate URL
      const { getStudioImageUrl } = await import('../services/studioImages');
      const imageUrl = getStudioImageUrl(imageId);
      console.log('🔗 Generated image URL:', imageUrl);
      
      // Test if image loads
      const img = new Image();
      img.onload = () => console.log('✅ Image URL is valid and loads successfully');
      img.onerror = () => console.error('❌ Image URL failed to load');
      img.src = imageUrl;
    } else {
      console.log('❌ No profileImageId found');
    }

    return {
      raw: studio,
      parsed,
      profileData,
      profileImageId: parsed.profileImageId || profileData.profileImageId,
    };
  } catch (error) {
    console.error('❌ Error debugging studio:', error);
    return { error };
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.debugStudio = debugStudio;
}
