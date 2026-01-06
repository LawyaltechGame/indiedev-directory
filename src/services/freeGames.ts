// Free Games API Service
// Fetching temporarily free games (normally paid games that are free for limited time)
// Using GamerPower API via RapidAPI for PC/Console platforms
// Using AppAgg RSS feeds for Android/iOS mobile deals

import { fetchMobileDealsFromRSS, type RSSGame } from './rssFeedParser';

// NOTE: Hardcoding the API key and host is generally discouraged for client-side applications.
// It is recommended to use environment variables or a secure backend proxy.
const RAPIDAPI_KEY = '8b42a012aemsh4e3e8772f08343bp10444fjsn0b1c0e87f4b2';
const RAPIDAPI_HOST = 'gamerpower.p.rapidapi.com';
const API_BASE_URL = 'https://gamerpower.p.rapidapi.com/api';

// Fallback image for games without thumbnails
const FALLBACK_GAME_IMAGE = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=450&fit=crop&q=80';

export interface FreeGame {
  id: number;
  title: string;
  thumbnail: string;
  short_description: string;
  game_url: string; // The correct link to the giveaway/game store
  genre: string;
  platform: string;
  publisher: string;
  developer: string;
  release_date: string;
  freetogame_profile_url: string; // The link back to the GamerPower site
}

export interface GameDetail extends FreeGame {
  description: string;
  minimum_system_requirements?: {
    os?: string;
    processor?: string;
    memory?: string;
    graphics?: string;
    storage?: string;
  };
  screenshots?: Array<{
    id: number;
    image: string;
  }>;
}

export type TimeFilter = 'weekly' | 'monthly';
export type PlatformFilter = 'all' | 'steam' | 'playstation' | 'xbox' | 'gog' | 'android' | 'ios';



/**
 * Fetch all temporarily free games (giveaways)
 * Only returns full game giveaways, not DLC or loot
 */
export async function fetchAllFreeGames(): Promise<FreeGame[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/giveaways`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST,
      },
    });
    
    if (!response.ok) {
      console.error('API failed with status:', response.status);
      return [];
    }
    
    const data = await response.json();
    
    // Log all unique platforms found in the API response
    const allPlatforms = new Set<string>();
    data.forEach((giveaway: any) => {
      if (giveaway.platforms) {
        allPlatforms.add(giveaway.platforms);
      }
    });
    console.log('\n =====l===== ALL PLATFORMS AVAILABLE ==========');
    console.log('📊 Total Giveaways:', data.length);
    console.log('🎮 Available Platforms:', Array.from(allPlatforms).sort());
    
    // Filter to only show full game giveaways (not loot, DLC, beta access, etc.)
    const gameGiveaways = data.filter((giveaway: any) => 
      giveaway.type === 'Game' || giveaway.type === 'Other' || !giveaway.type // 'Other' is often used for full game store deals
    );
    
    console.log('🎮 Game Giveaways (filtered):', gameGiveaways.length);
    
    // Group games by platform
    const gamesByPlatform: Record<string, any[]> = {};
    gameGiveaways.forEach((game: any) => {
      const platform = game.platforms || 'Unknown';
      if (!gamesByPlatform[platform]) {
        gamesByPlatform[platform] = [];
      }
      gamesByPlatform[platform].push(game);
    });
    
    // Log games for each platform
    console.log('\n📋 ========== GAMES BY PLATFORM ==========');
    Object.keys(gamesByPlatform).sort().forEach(platform => {
      const games = gamesByPlatform[platform];
      console.log(`\n🎮 ${platform} (${games.length} games):`);
      games.forEach((game, index) => {
        console.log(`  ${index + 1}. ${game.title} - ${game.worth || 'Free'}`);
      });
    });
    console.log('\n=======================================\n');
    
    // Transform GamerPower data to our FreeGame interface
    // **This section defines the game_url priority:**
    return gameGiveaways.map((giveaway: any) => ({
      id: giveaway.id,
      title: giveaway.title,
      thumbnail: giveaway.thumbnail || giveaway.image || FALLBACK_GAME_IMAGE,
      short_description: giveaway.worth ? `Worth ${giveaway.worth} - ${giveaway.description || 'Free giveaway'}` : (giveaway.description || 'Free giveaway'),
      game_url: giveaway.open_giveaway_url || giveaway.gamerpower_url, // <-- CORRECT LINK LOGIC
      genre: giveaway.type || 'Giveaway',
      platform: giveaway.platforms || 'PC',
      publisher: giveaway.publisher || giveaway.platforms || 'Unknown',
      developer: giveaway.publisher || 'Unknown',
      release_date: giveaway.published_date || new Date().toISOString().split('T')[0],
      freetogame_profile_url: giveaway.gamerpower_url,
    }));
  } catch (error) {
    console.error('Error fetching free games:', error);
    return [];
  }
}

/**
 * Fetch mobile deals from AppAgg RSS feeds
 */
async function fetchMobileFreeGames(platform: 'android' | 'ios' | 'all'): Promise<FreeGame[]> {
  try {
    const deals = await fetchMobileDealsFromRSS(platform);
    
    // Transform RSS game deals to FreeGame interface
    return deals.map((deal: RSSGame) => ({
      id: Math.floor(Math.random() * 1000000), // Random ID for mobile deals
      title: deal.title,
      thumbnail: deal.thumbnail || FALLBACK_GAME_IMAGE,
      short_description: deal.description,
      game_url: deal.url, // <-- CORRECT LINK LOGIC for RSS feed
      genre: deal.category,
      platform: deal.platform,
      publisher: deal.developer,
      developer: deal.developer,
      release_date: deal.pubDate ? new Date(deal.pubDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      freetogame_profile_url: deal.url,
    }));
  } catch (error) {
    console.error('Error fetching mobile free games:', error);
    return [];
  }
}

/**
 * Fetch free games by platform
 * Uses fetchAllFreeGames for PC/Console platforms and fetchMobileFreeGames for mobile.
 */
export async function fetchGamesByPlatform(platform: PlatformFilter): Promise<FreeGame[]> {
  try {
    // Handle mobile platforms separately
    if (platform === 'android' || platform === 'ios') {
      return await fetchMobileFreeGames(platform);
    }

    if (platform === 'all') {
      // Fetch both PC/Console and mobile games
      const [pcConsoleGames, mobileGames] = await Promise.all([
        fetchAllFreeGames(),
        fetchMobileFreeGames('all'),
      ]);
      return [...pcConsoleGames, ...mobileGames];
    }

    console.log(`🔍 Fetching games for platform: ${platform}`);

    // Fetch all games first (PC/Console)
    const allGames = await fetchAllFreeGames();
    
    // Filter games based on platform
    let filteredGames: FreeGame[] = [];
    
    switch (platform) {
      case 'steam':
        // Check for 'Steam', 'PC' or 'Windows' in the platform string
        filteredGames = allGames.filter(game => 
          game.platform.toLowerCase().includes('steam') ||
          game.platform.toLowerCase().includes('pc') ||
          game.platform.toLowerCase().includes('windows')
        );
        break;
        
      case 'playstation':
        // Check for PlayStation platforms
        filteredGames = allGames.filter(game => 
          game.platform.toLowerCase().includes('playstation') ||
          game.platform.toLowerCase().includes('ps5') ||
          game.platform.toLowerCase().includes('ps4') ||
          game.platform.toLowerCase().includes('ps3')
        );
        break;
        
      case 'xbox':
        // Check for Xbox platforms
        filteredGames = allGames.filter(game => 
          game.platform.toLowerCase().includes('xbox')
        );
        break;
        
      case 'gog':
        // Check for GOG or DRM-free
        filteredGames = allGames.filter(game => 
          game.platform.toLowerCase().includes('gog') ||
          game.platform.toLowerCase().includes('drm-free')
        );
        break;
        
      default:
        // Should be caught by 'all' above, but as a safeguard, return all PC/Console games
        filteredGames = allGames; 
    }
    
    console.log(`✅ Found ${filteredGames.length} games for ${platform}`);
    
    const gameGiveaways = filteredGames;
    
    console.log(`🎮 Game giveaways (after filtering): ${gameGiveaways.length}`);
    
    // Log game titles and available data for this platform (using FreeGame structure for logging)
    if (gameGiveaways.length > 0) {
      console.log(`\n📋 Available FREE GAMES on ${platform.toUpperCase()}:`);
      gameGiveaways.forEach((game: FreeGame, index: number) => { 
        console.log(`  ${index + 1}. ${game.title} - ${game.short_description}`);
        console.log(`      Platform: ${game.platform}`); 
        console.log(`      Type: ${game.genre}`); 
        console.log(`      Link: ${game.game_url}`); // <-- Logging the final correct link
        
        if (index === 0) {
          console.log('\n🔍 Sample game data structure:');
          console.log(JSON.stringify(game, null, 2));
        }
        console.log('');
      });
    } else {
      console.log(`⚠️ No game giveaways found for ${platform}`);
    }
    
    // The transformation is performed in fetchAllFreeGames(), so we just return the filtered, already-mapped objects
    return gameGiveaways; 

  } catch (error) {
    console.error('Error fetching games by platform:', error);
    return [];
  }
}

/**
 * Fetch games filtered by time period (uses published date)
 */
export async function fetchGamesByTime(
  timeFilter: TimeFilter,
  platform: PlatformFilter = 'all'
): Promise<FreeGame[]> {
  try {
    const games = await fetchGamesByPlatform(platform);
    
    // Sort by published date (newest first)
    const sortedGames = games.sort((a, b) => {
      const dateA = new Date(a.release_date).getTime();
      const dateB = new Date(b.release_date).getTime();
      return dateB - dateA;
    });

    const now = new Date();
    
    // Filter games based on time period
    switch (timeFilter) {
      case 'weekly': {
        // Show games from the last 7 days
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const filtered = sortedGames.filter(game => {
          const gameDate = new Date(game.release_date);
          // Check if the game date is within the last week
          return gameDate >= weekAgo && gameDate <= now;
        });
        console.log(`📅 Weekly filter: ${filtered.length} games from last 7 days`);
        return filtered;
      }
      
      case 'monthly': {
        // Show games from the last 30 days
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const filtered = sortedGames.filter(game => {
          const gameDate = new Date(game.release_date);
          // Check if the game date is within the last month
          return gameDate >= monthAgo && gameDate <= now;
        });
        console.log(`📅 Monthly filter: ${filtered.length} games from last 30 days`);
        return filtered;
      }
      
      default:
        return sortedGames;
    }
  } catch (error) {
    console.error('Error fetching games by time:', error);
    return [];
  }
}

/**
 * Fetch game details by ID
 */
export async function fetchGameDetails(gameId: number): Promise<GameDetail | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/giveaway?id=${gameId}`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const giveaway = await response.json();
    
    // **This section defines the game_url priority for detail view:**
    return {
      id: giveaway.id,
      title: giveaway.title,
      thumbnail: giveaway.thumbnail || giveaway.image || FALLBACK_GAME_IMAGE,
      short_description: giveaway.description || giveaway.worth,
      description: giveaway.description || giveaway.instructions || '',
      game_url: giveaway.open_giveaway_url || giveaway.gamerpower_url, // <-- CORRECT LINK LOGIC
      genre: giveaway.type || 'Game',
      platform: giveaway.platforms || 'PC',
      publisher: giveaway.publisher || 'Unknown',
      developer: giveaway.publisher || 'Unknown',
      release_date: giveaway.published_date || new Date().toISOString().split('T')[0],
      freetogame_profile_url: giveaway.gamerpower_url,
      screenshots: giveaway.image ? [{ id: 1, image: giveaway.image }] : undefined,
    };
  } catch (error) {
    console.error('Error fetching game details:', error);
    return null;
  }
}

/**
 * Fetch games by genre (filter from all giveaways)
 */
export async function fetchGamesByGenre(genre: string): Promise<FreeGame[]> {
  try {
    const allGames = await fetchAllFreeGames();
    return allGames.filter(game => 
      game.genre.toLowerCase().includes(genre.toLowerCase())
    );
  } catch (error) {
    console.error('Error fetching games by genre:', error);
    return [];
  }
}

/**
 * Get platform icon
 */
export function getPlatformIcon(platform: string): string {
  const platformLower = platform.toLowerCase();
  if (platformLower.includes('android')) return '🤖';
  if (platformLower.includes('ios') || platformLower.includes('iphone') || platformLower.includes('ipad')) return '🍎';
  if (platformLower.includes('windows') || platformLower.includes('pc')) return '🖥️';
  if (platformLower.includes('browser') || platformLower.includes('web')) return '🌐';
  if (platformLower.includes('playstation') || platformLower.includes('ps')) return '🎮';
  if (platformLower.includes('xbox')) return '🎮';
  if (platformLower.includes('nintendo') || platformLower.includes('switch')) return '🎮';
  return '🎮';
}

/**
 * Format release date
 */
export function formatReleaseDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}