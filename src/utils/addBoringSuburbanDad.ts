import { addBoringSuburbanDad } from '../services/adminStudios';

export async function initializeBoringSuburbanDad() {
  try {
    const result = await addBoringSuburbanDad();
    if (result.success) {
      console.log('✅ BoringSuburbanDad studio added successfully!');
      if ('id' in result && result.id) {
        console.log('Studio ID:', result.id);
      }
      if ('updated' in result && result.updated) {
        console.log('✅ Studio was updated with logo');
      }
      return result;
    } else {
      console.log('ℹ️', result.message);
      return result;
    }
  } catch (error) {
    console.error('❌ Error adding BoringSuburbanDad studio:', error);
    throw error;
  }
}

// Automatically add BoringSuburbanDad studio when app loads (only if it doesn't exist)
if (typeof window !== 'undefined') {
  // Run once when app loads
  initializeBoringSuburbanDad().catch(() => {
    // Silently fail if already exists or other error
  });
  
  // Also make it available globally for manual calls
  // @ts-ignore
  window.addBoringSuburbanDad = initializeBoringSuburbanDad;
}

