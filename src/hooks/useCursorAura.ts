import { useEffect } from 'react';

export const useCursorAura = () => {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    
    const move = (e: MouseEvent) => {
      document.documentElement.style.setProperty('--mx', e.clientX + 'px');
      document.documentElement.style.setProperty('--my', e.clientY + 'px');
    };
    
    window.addEventListener('pointermove', move);
    return () => window.removeEventListener('pointermove', move);
  }, []);
};
