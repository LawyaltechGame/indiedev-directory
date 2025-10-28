import { useEffect, useState } from 'react';

export const useScrollProgress = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [navShrunk, setNavShrunk] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const onScroll = () => {
      setNavShrunk(window.scrollY > 8);
      setShowScrollTop(window.scrollY > 300);
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      setScrollProgress(scrollPercent);
    };
    
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return { scrollProgress, navShrunk, showScrollTop };
};
