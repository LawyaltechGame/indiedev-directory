// RSS Feed Parser for AppAgg Mobile Game Deals
// Uses multiple CORS proxies with automatic fallback

// Multiple CORS proxy options - will try each one until success
const CORS_PROXIES = [
  { name: 'corsproxy.io', url: 'https://corsproxy.io/?' },
  { name: 'allorigins', url: 'https://api.allorigins.win/raw?url=' },
  { name: 'thingproxy', url: 'https://thingproxy.freeboard.io/fetch/' },
  { name: 'cors.eu.org', url: 'https://cors.eu.org/' },
];

// Fallback image for games without thumbnails
const FALLBACK_GAME_IMAGE = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=450&fit=crop&q=80';

export interface RSSGame {
  id: string;
  title: string;
  thumbnail: string;
  description: string;
  url: string;
  developer: string;
  category: string;
  originalPrice: string;
  currentPrice: string;
  discount: string;
  platform: 'Android' | 'iOS';
  pubDate: string;
}

/**
 * Parse RSS XML to extract game deals
 */
function parseRSSXML(xmlText: string, platform: 'Android' | 'iOS'): RSSGame[] {
  const deals: RSSGame[] = [];
  
  try {
    // Extract items using regex
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
    const items = xmlText.match(itemRegex) || [];
    
    console.log(`📦 Found ${items.length} items in ${platform} RSS feed`);
    
    items.forEach((itemXml, index) => {
      try {
        // Helper to extract CDATA or plain text
        const extractText = (tag: string): string => {
          const cdataRegex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i');
          const cdataMatch = itemXml.match(cdataRegex);
          if (cdataMatch) return cdataMatch[1].trim();
          
          const plainRegex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
          const plainMatch = itemXml.match(plainRegex);
          if (plainMatch) return plainMatch[1].trim();
          
          return '';
        };
        
        const title = extractText('title');
        const link = extractText('link');
        const description = extractText('description');
        const category = extractText('category') || 'Game';
        const pubDate = extractText('pubDate') || new Date().toISOString();
        
        // Parse title: [100%] Game Name – Platform
        const titleParse = title.match(/\[(-?\d+%)\]\s*(.+?)\s*[–-]/);
        const discount = titleParse ? titleParse[1] : '100%';
        const gameName = titleParse ? titleParse[2].trim() : title.replace(/\[.*?\]|\(.*?\)/g, '').trim();
        
        // Extract price from description
        const priceMatch = description.match(/<b>Price:<\/b>\s*\$?([\d.]+)/i);
        const originalPrice = priceMatch ? `$${priceMatch[1]}` : '$4.99';
        
        // Extract developer
        const devMatch = description.match(/<b>By:<\/b>\s*<a[^>]*>([^<]+)<\/a>/i);
        const developer = devMatch ? devMatch[1].trim() : 'Unknown';
        
        // Extract image
        const imgMatch = description.match(/src="([^"]+)"/i);
        let thumbnail = imgMatch ? imgMatch[1] : '';
        
        // Use fallback image if thumbnail is missing or invalid
        if (!thumbnail || thumbnail.trim() === '' || thumbnail === 'undefined') {
          thumbnail = FALLBACK_GAME_IMAGE;
        }
        
        // Extract Play Store / App Store link from description
        // Look for Google Play or App Store URLs in the description
        let storeUrl = link; // Default to AppAgg link
        
        if (platform === 'Android') {
          // Look for Google Play Store link
          const playStoreMatch = description.match(/href="(https?:\/\/play\.google\.com\/store\/apps\/details\?id=[^"]+)"/i);
          if (playStoreMatch) {
            storeUrl = playStoreMatch[1];
          }
        } else if (platform === 'iOS') {
          // Look for App Store link
          const appStoreMatch = description.match(/href="(https?:\/\/(?:apps\.apple\.com|itunes\.apple\.com)[^"]+)"/i);
          if (appStoreMatch) {
            storeUrl = appStoreMatch[1];
          }
        }
        
        if (gameName && storeUrl) {
          deals.push({
            id: `appagg-${platform.toLowerCase()}-${index}`,
            title: gameName,
            thumbnail, // Will use fallback if original was missing
            description: `Originally ${originalPrice} - Now FREE! ${discount} discount`,
            url: storeUrl, // Use store URL instead of AppAgg link
            developer,
            category,
            originalPrice,
            currentPrice: 'Free',
            discount,
            platform,
            pubDate,
          });
        }
      } catch (err) {
        console.error(`⚠️ Error parsing item ${index}:`, err);
      }
    });
    
    return deals;
  } catch (error) {
    console.error('❌ Error parsing RSS XML:', error);
    return [];
  }
}

/**
 * Try fetching RSS feed through a specific proxy
 */
async function fetchViaProxy(feedUrl: string, proxy: { name: string; url: string }): Promise<string | null> {
  try {
    const proxyUrl = `${proxy.url}${encodeURIComponent(feedUrl)}`;
    
    console.log(`🔄 Trying ${proxy.name}...`);
    
    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      },
    });
    
    if (!response.ok) {
      console.log(`❌ ${proxy.name} failed: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const xmlText = await response.text();
    
    // Validate that we got XML content
    if (!xmlText.includes('<rss') && !xmlText.includes('<?xml')) {
      console.log(`❌ ${proxy.name} returned invalid XML`);
      return null;
    }
    
    console.log(`✅ ${proxy.name} succeeded! Received ${xmlText.length} characters`);
    return xmlText;
    
  } catch (error) {
    console.log(`❌ ${proxy.name} error:`, error);
    return null;
  }
}

/**
 * Fetch mobile deals from RSS feed - tries multiple proxies until one works
 */
export async function parseAppAggRSS(platform: 'android' | 'ios'): Promise<RSSGame[]> {
  const feedUrls = {
    android: 'https://appagg.com/rss/sale/android-games/free/?hl=en',
    ios: 'https://appagg.com/rss/sale/ios-games/free/?hl=en',
  };
  
  const feedUrl = feedUrls[platform];
  
  console.log(`\n📱 Fetching ${platform.toUpperCase()} deals from AppAgg RSS`);
  console.log(`🔗 Feed URL: ${feedUrl}`);
  console.log(`🔄 Trying ${CORS_PROXIES.length} different proxies...\n`);
  
  // Try each proxy until one works
  for (const proxy of CORS_PROXIES) {
    const xmlText = await fetchViaProxy(feedUrl, proxy);
    
    if (xmlText) {
      // Successfully fetched, now parse it
      const deals = parseRSSXML(xmlText, platform === 'android' ? 'Android' : 'iOS');
      
      if (deals.length > 0) {
        console.log(`\n🎉 SUCCESS! Found ${deals.length} ${platform} deals via ${proxy.name}\n`);
        return deals;
      } else {
        console.log(`⚠️ ${proxy.name} returned XML but no deals found`);
      }
    }
  }
  
  console.error(`\n❌ All ${CORS_PROXIES.length} proxies failed for ${platform}\n`);
  return [];
}

/**
 * Fetch mobile deals from RSS feeds
 */
export async function fetchMobileDealsFromRSS(platform: 'android' | 'ios' | 'all'): Promise<RSSGame[]> {
  try {
    if (platform === 'all') {
      const [androidGames, iosGames] = await Promise.all([
        parseAppAggRSS('android'),
        parseAppAggRSS('ios'),
      ]);
      return [...androidGames, ...iosGames];
    }
    
    return await parseAppAggRSS(platform);
  } catch (error) {
    console.error('❌ Error fetching mobile deals:', error);
    return [];
  }
}
