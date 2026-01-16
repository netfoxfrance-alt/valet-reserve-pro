import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    Tawk_API?: any;
    Tawk_LoadStart?: Date;
  }
}

const TawkTo = () => {
  const location = useLocation();
  
  // Only show on home page and dashboard pages
  const shouldShow = location.pathname === '/' || location.pathname.startsWith('/dashboard');

  useEffect(() => {
    // Load script only once
    if (!window.Tawk_LoadStart) {
      window.Tawk_API = window.Tawk_API || {};
      window.Tawk_LoadStart = new Date();

      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://embed.tawk.to/696aa37e895de4198b90486a/1jf48t9sv';
      script.charset = 'UTF-8';
      script.setAttribute('crossorigin', '*');

      const firstScript = document.getElementsByTagName('script')[0];
      firstScript?.parentNode?.insertBefore(script, firstScript);
    }
  }, []);

  // Show/hide widget based on route
  useEffect(() => {
    if (window.Tawk_API) {
      if (shouldShow) {
        window.Tawk_API.showWidget?.();
      } else {
        window.Tawk_API.hideWidget?.();
      }
    }
  }, [shouldShow]);

  return null;
};

export default TawkTo;
