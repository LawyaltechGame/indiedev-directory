import { addAvalancheStudios } from '../services/adminStudios';

export async function initializeAvalancheStudio() {
  try {
    const result = await addAvalancheStudios();
    if (result.success) {
      console.log('✅ Avalanche Studios added successfully!');
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
    console.error('❌ Error adding Avalanche Studios:', error);
    throw error;
  }
}

// Automatically add Avalanche Studios when app loads (only if it doesn't exist)
if (typeof window !== 'undefined') {
  // Run once when app loads
  initializeAvalancheStudio().catch(() => {
    // Silently fail if already exists or other error
  });
  
  // Also make it available globally for manual calls
  // @ts-ignore
  window.addAvalancheStudio = initializeAvalancheStudio;
}

