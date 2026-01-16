import { useEffect } from 'react';

declare global {
  interface Window {
    Tawk_API?: any;
    Tawk_LoadStart?: Date;
  }
}

const TawkTo = () => {
  useEffect(() => {
    // Prevent loading twice
    if (window.Tawk_API && Object.keys(window.Tawk_API).length > 0) {
      return;
    }

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://embed.tawk.to/696aa37e895de4198b90486a/1jf48t9sv';
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');

    const firstScript = document.getElementsByTagName('script')[0];
    firstScript?.parentNode?.insertBefore(script, firstScript);

    return () => {
      // Cleanup not needed as Tawk persists across navigation
    };
  }, []);

  return null;
};

export default TawkTo;
