import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../../services/analytics';

/**
 * Component to automatically track page views on route changes
 * Should be placed inside the Router component
 */
export function PageViewTracker() {
  const location = useLocation();

  useEffect(() => {
    // Track page view when route changes
    trackPageView(location.pathname + location.search);
  }, [location]);

  return null;
}

