import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
}

/**
 * Component to manage SEO meta tags and canonical URLs dynamically
 * This helps prevent redirect issues and ensures proper indexing
 */
export function SEOHead({ 
  title, 
  description, 
  canonicalUrl,
  ogImage 
}: SEOHeadProps) {
  const location = useLocation();
  const baseUrl = 'https://gamecentralen.com';
  
  // Generate canonical URL from current path if not provided
  const finalCanonicalUrl = canonicalUrl || `${baseUrl}${location.pathname}`;
  
  // Remove trailing slash from canonical URL to prevent redirect issues
  const cleanCanonicalUrl = finalCanonicalUrl.replace(/\/$/, '');
  
  useEffect(() => {
    // Update or create canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', cleanCanonicalUrl);
    
    // Update title if provided
    if (title) {
      document.title = title;
    }
    
    // Update meta description if provided
    if (description) {
      let metaDescription = document.querySelector('meta[name="description"]') as HTMLMetaElement;
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', description);
    }
    
    // Update Open Graph tags
    if (title) {
      let ogTitle = document.querySelector('meta[property="og:title"]') as HTMLMetaElement;
      if (!ogTitle) {
        ogTitle = document.createElement('meta');
        ogTitle.setAttribute('property', 'og:title');
        document.head.appendChild(ogTitle);
      }
      ogTitle.setAttribute('content', title);
    }
    
    if (description) {
      let ogDescription = document.querySelector('meta[property="og:description"]') as HTMLMetaElement;
      if (!ogDescription) {
        ogDescription = document.createElement('meta');
        ogDescription.setAttribute('property', 'og:description');
        document.head.appendChild(ogDescription);
      }
      ogDescription.setAttribute('content', description);
    }
    
    // Update OG URL
    let ogUrl = document.querySelector('meta[property="og:url"]') as HTMLMetaElement;
    if (!ogUrl) {
      ogUrl = document.createElement('meta');
      ogUrl.setAttribute('property', 'og:url');
      document.head.appendChild(ogUrl);
    }
    ogUrl.setAttribute('content', cleanCanonicalUrl);
    
    // Update OG Image if provided
    if (ogImage) {
      let ogImageMeta = document.querySelector('meta[property="og:image"]') as HTMLMetaElement;
      if (!ogImageMeta) {
        ogImageMeta = document.createElement('meta');
        ogImageMeta.setAttribute('property', 'og:image');
        document.head.appendChild(ogImageMeta);
      }
      ogImageMeta.setAttribute('content', ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`);
    }
  }, [title, description, cleanCanonicalUrl, ogImage, baseUrl]);
  
  return null;
}
