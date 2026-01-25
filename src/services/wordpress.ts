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
 * Fetch all posts from WordPress (blogs, news, guides, tools combined)
 * @param page - Page number for pagination (default: 1)
 * @param perPage - Number of posts per page (default: 10)
 */
export async function fetchAllPosts(page: number = 1, perPage: number = 10): Promise<WordPressPost[]> {
  if (!config.baseUrl) {
    console.warn('WordPress base URL not configured');
    return [];
  }

  try {
    // Fetch posts from each category separately and combine them
    // WordPress REST API treats multiple categories as AND, not OR
    // Fetch enough posts from each category to support pagination
    const postsPerCategory = Math.max(perPage * 2, 24); // Fetch at least 24 posts per category or 2x perPage
    
    const fetchPromises: Promise<WordPressPost[]>[] = [];
    
    if (config.blogCategoryId) {
      fetchPromises.push(fetchBlogs(1, postsPerCategory));
    }
    if (config.newsCategoryId) {
      fetchPromises.push(fetchNews(1, postsPerCategory));
    }
    if (config.guidesCategoryId) {
      fetchPromises.push(fetchGuides(1, postsPerCategory));
    }
    if (config.toolsCategoryId) {
      fetchPromises.push(fetchTools(1, postsPerCategory));
    }

    // Wait for all requests to complete
    const results = await Promise.all(fetchPromises);
    
    // Combine all posts and deduplicate by post ID
    const allPosts: WordPressPost[] = [];
    const seenIds = new Set<number>();
    
    results.forEach(posts => {
      posts.forEach(post => {
        if (!seenIds.has(post.id)) {
          seenIds.add(post.id);
          allPosts.push(post);
        }
      });
    });

    // Sort by date (newest first)
    allPosts.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });

    // Return only the requested number of posts per page
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    return allPosts.slice(startIndex, endIndex);
  } catch (error) {
    console.error('Error fetching all posts:', error);
    return [];
  }
}

/**
 * Get the category tag name for a post based on its categories
 * @param post - WordPress post object
 * @returns Category tag name ('Blog', 'News', 'Guide', 'Tools', or 'Blog' as default)
 */
export function getPostCategoryTag(post: WordPressPost): string {
  if (!post.categories || post.categories.length === 0) {
    return 'Blog';
  }

  const categoryIds = post.categories;
  
  if (config.newsCategoryId && categoryIds.includes(config.newsCategoryId)) {
    return 'News';
  }
  if (config.toolsCategoryId && categoryIds.includes(config.toolsCategoryId)) {
    return 'Tools';
  }
  if (config.guidesCategoryId && categoryIds.includes(config.guidesCategoryId)) {
    return 'Guide';
  }
  if (config.blogCategoryId && categoryIds.includes(config.blogCategoryId)) {
    return 'Blog';
  }

  // Default to Blog if no matching category found
  return 'Blog';
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
