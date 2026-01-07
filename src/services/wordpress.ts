interface WordPressConfig {
  baseUrl: string;
  blogCategoryId?: number;
  newsCategoryId?: number;
  guidesCategoryId?: number;
  toolsCategoryId?: number;
}

// WordPress site configuration
const config: WordPressConfig = {
  baseUrl: 'https://test.lawyaltech.org/wp-json/wp/v2',
  blogCategoryId: 1,
  newsCategoryId: 130,
  guidesCategoryId: 217,
  toolsCategoryId: 287, 
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
      media_details?: {
        sizes?: {
          full?: {
            source_url: string;
          };
          large?: {
            source_url: string;
          };
        };
      };
    }>;
    author?: WordPressAuthor[];
  };
}

/**
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
    return [];
  }
}

/**
 * Fetch guides from WordPress
 * @param page - Page number for pagination (default: 1)
 * @param perPage - Number of posts per page (default: 10)
 */
export async function fetchGuides(page: number = 1, perPage: number = 10): Promise<WordPressPost[]> {
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

    if (config.guidesCategoryId) {
      params.append('categories', config.guidesCategoryId.toString());
    }

    const response = await fetch(`${config.baseUrl}/posts?${params.toString()}`);
    
    if (response.status === 400) {
      console.log('No more guide posts available');
      return [];
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching guides:', error);
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
    return [];
  }
}

/**
 * Fetch tools posts from WordPress
 * @param page - Page number for pagination (default: 1)
 * @param perPage - Number of posts per page (default: 10)
 */
export async function fetchTools(page: number = 1, perPage: number = 10): Promise<WordPressPost[]> {
  if (!config.baseUrl) {
    console.warn('WordPress base URL not configured');
    return [];
  }

  // If toolsCategoryId is not set, return empty array
  if (!config.toolsCategoryId) {
    return [];
  }

  try {
    const params = new URLSearchParams({
      _embed: 'true',
      page: page.toString(),
      per_page: perPage.toString(),
      categories: config.toolsCategoryId.toString(),
    });

    const response = await fetch(`${config.baseUrl}/posts?${params.toString()}`);
    
    if (response.status === 400) {
      console.log('No more tools posts available');
      return [];
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching tools:', error);
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

export interface WordPressComment {
  id: number;
  post: number;
  parent: number;
  author: number;
  author_name: string;
  author_url: string;
  date: string;
  date_gmt: string;
  content: {
    rendered: string;
  };
  link: string;
  status: string;
  type: string;
  author_avatar_urls: {
    24: string;
    48: string;
    96: string;
  };
}

/**
 * Fetch comments for a WordPress post
 * @param postId - WordPress post ID
 */
export async function fetchWordPressComments(postId: number): Promise<WordPressComment[]> {
  if (!config.baseUrl) {
    console.warn('WordPress base URL not configured');
    return [];
  }

  try {
    const params = new URLSearchParams({
      post: postId.toString(),
      per_page: '100',
      orderby: 'date',
      order: 'desc',
    });

    const response = await fetch(`${config.baseUrl}/comments?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.filter((comment: WordPressComment) => comment.status === 'approved');
  } catch (error) {
    console.error('Error fetching WordPress comments:', error);
    return [];
  }
}
