// WordPress REST API Service
// Configure your WordPress site URL and category IDs here

interface WordPressConfig {
  baseUrl: string;
  blogCategoryId?: number;
  newsCategoryId?: number;
}

// WordPress site configuration
const config: WordPressConfig = {
  baseUrl: 'https://test.lawyaltech.org/wp-json/wp/v2',
  blogCategoryId: 1,
  newsCategoryId: 130,
};

export interface WordPressAuthor {
  id: number;
  name: string;
  description: string;
  avatar_urls: {
    24: string;
    48: string;
    96: string;
  };
  link: string;
}

export interface WordPressPost {
  id: number;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  date: string;
  link: string;
  author: number;
  categories: number[];
  featured_media?: number;
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
      alt_text: string;
    }>;
    author?: WordPressAuthor[];
  };
}

/**
 * Fetch blog posts from WordPress
 * @param page - Page number for pagination (default: 1)
 * @param perPage - Number of posts per page (default: 10)
 */
export async function fetchBlogs(page: number = 1, perPage: number = 10): Promise<WordPressPost[]> {
  if (!config.baseUrl) {
    console.warn('WordPress base URL not configured');
    return [];
  }

  try {
    const params = new URLSearchParams({
      _embed: 'true',
      page: page.toString(),
      per_page: perPage.toString(),
    });

    if (config.blogCategoryId) {
      params.append('categories', config.blogCategoryId.toString());
    }

    const response = await fetch(`${config.baseUrl}/posts?${params.toString()}`);
    
    // If 400 error, it likely means no more posts (invalid page number)
    if (response.status === 400) {
      console.log('No more blog posts available');
      return [];
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching blogs:', error);
    // Return empty array instead of throwing to prevent infinite scroll errors
    return [];
  }
}

/**
 * Fetch news posts from WordPress
 * @param page - Page number for pagination (default: 1)
 * @param perPage - Number of posts per page (default: 10)
 */
export async function fetchNews(page: number = 1, perPage: number = 10): Promise<WordPressPost[]> {
  if (!config.baseUrl) {
    console.warn('WordPress base URL not configured');
    return [];
  }

  try {
    const params = new URLSearchParams({
      _embed: 'true',
      page: page.toString(),
      per_page: perPage.toString(),
    });

    if (config.newsCategoryId) {
      params.append('categories', config.newsCategoryId.toString());
    }

    const response = await fetch(`${config.baseUrl}/posts?${params.toString()}`);
    
    // If 400 error, it likely means no more posts (invalid page number)
    if (response.status === 400) {
      console.log('No more news posts available');
      return [];
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching news:', error);
    // Return empty array instead of throwing to prevent infinite scroll errors
    return [];
  }
}

/**
 * Update WordPress configuration
 * Use this to set your WordPress site details
 */
export function configureWordPress(newConfig: Partial<WordPressConfig>) {
  Object.assign(config, newConfig);
}

/**
 * Get current WordPress configuration
 */
export function getWordPressConfig(): WordPressConfig {
  return { ...config };
}
