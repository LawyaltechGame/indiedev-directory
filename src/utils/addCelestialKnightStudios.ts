import { addCelestialKnightStudios } from '../services/adminStudios';

export async function initializeCelestialKnightStudios() {
  try {
    const result = await addCelestialKnightStudios();
    if (result.success) {
      console.log('✅ Celestial Knight Studios added successfully!');
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
    console.error('❌ Error adding Celestial Knight Studios:', error);
    throw error;
  }
}

// Automatically add Celestial Knight Studios when app loads (only if it doesn't exist)
if (typeof window !== 'undefined') {
  // Run once when app loads
  initializeCelestialKnightStudios().catch(() => {
    // Silently fail if already exists or other error
  });
  
  // Also make it available globally for manual calls
  // @ts-ignore
  window.addCelestialKnightStudios = initializeCelestialKnightStudios;
}
