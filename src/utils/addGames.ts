import { addJustCause3, addMadMax, addDinnerWithAnOwl, addOwlObservatory, addShadowSurvival } from '../services/adminGames';

export async function initializeGames(logoImageIds?: { 
  justCause3?: string; 
  madMax?: string;
  dinnerWithAnOwl?: string;
  owlObservatory?: string;
  shadowSurvival?: string;
}) {
  try {
    // Use provided logo IDs or let the functions use their default IDs
    const results = await Promise.all([
      addJustCause3(logoImageIds?.justCause3), // Will use default '696615750028a1980aa7' if not provided
      addMadMax(logoImageIds?.madMax), // Will use default if not provided
      addDinnerWithAnOwl(logoImageIds?.dinnerWithAnOwl),
      addOwlObservatory(logoImageIds?.owlObservatory),
      addShadowSurvival(logoImageIds?.shadowSurvival),
    ]);

    const successCount = results.filter(r => r.success).length;
    const updatedCount = results.filter(r => r.updated).length;
    
    if (successCount > 0) {
      console.log(`✅ ${successCount} game(s) added/updated successfully!`);
      if (updatedCount > 0) {
        console.log(`ℹ️ ${updatedCount} game(s) were updated with logos`);
      }
    } else {
      console.log('ℹ️ All games already exist');
    }
    
    return results;
  } catch (error) {
    console.error('❌ Error initializing games:', error);
    throw error;
  }
}

// Automatically initialize games when app loads (only if they don't exist)
if (typeof window !== 'undefined') {
  // Run once when app loads
  initializeGames().catch(() => {
    // Silently fail if already exists or other error
  });
  
  // Also make it available globally for manual calls
  // @ts-ignore
  window.addGames = initializeGames;
}

