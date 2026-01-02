import ReactGA from 'react-ga4';

const GA4_MEASUREMENT_ID = 'G-KZ5NQGR392';

/**
 * Initialize Google Analytics 4
 * Should be called once when the app starts
 */
export const initializeGA4 = () => {
  if (typeof window !== 'undefined' && GA4_MEASUREMENT_ID) {
    ReactGA.initialize(GA4_MEASUREMENT_ID, {
      testMode: false, // Set to true only for testing
    });
  }
};

/**
 * Track a page view
 * @param path - The page path (e.g., '/', '/blogs', '/content/my-post')
 * @param title - Optional page title
 */
export const trackPageView = (path: string, title?: string) => {
  if (typeof window !== 'undefined' && GA4_MEASUREMENT_ID) {
    // Send page_view event to GA4 using gtag
    // This is the recommended way for GA4 page tracking
    ReactGA.gtag('event', 'page_view', {
      page_path: path,
      page_title: title || document.title,
      page_location: window.location.href,
    });
  }
};

/**
 * Track a custom event
 * @param eventName - Name of the event
 * @param eventParams - Optional event parameters
 */
export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, any>
) => {
  if (typeof window !== 'undefined' && GA4_MEASUREMENT_ID) {
    ReactGA.event(eventName, eventParams);
  }
};

