import { useEffect, useCallback } from 'react';

declare global {
  interface Window {
    Tawk_API?: any;
    Tawk_LoadStart?: Date;
  }
}

// Load Tawk.to script once
const loadTawkScript = () => {
  if (window.Tawk_LoadStart) return;
  
  window.Tawk_API = window.Tawk_API || {};
  window.Tawk_LoadStart = new Date();

  // Hide widget by default
  window.Tawk_API.onLoad = function() {
    window.Tawk_API.hideWidget?.();
  };

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://embed.tawk.to/696aa37e895de4198b90486a/1jf48t9sv';
  script.charset = 'UTF-8';
  script.setAttribute('crossorigin', '*');

  const firstScript = document.getElementsByTagName('script')[0];
  firstScript?.parentNode?.insertBefore(script, firstScript);
};

export const useTawkTo = () => {
  useEffect(() => {
    loadTawkScript();
  }, []);

  const openChat = useCallback(() => {
    if (window.Tawk_API) {
      window.Tawk_API.showWidget?.();
      window.Tawk_API.maximize?.();
    }
  }, []);

  return { openChat };
};

export default useTawkTo;
