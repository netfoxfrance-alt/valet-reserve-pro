import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  noindex?: boolean;
}

export function useSEO({ title, description, canonical, ogImage, noindex }: SEOProps) {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Helper to set or create meta tag
    const setMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Basic meta tags
    setMetaTag('description', description);
    
    // Open Graph
    setMetaTag('og:title', title, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:type', 'website', true);
    
    if (ogImage) {
      setMetaTag('og:image', ogImage, true);
    }
    
    if (canonical) {
      setMetaTag('og:url', canonical, true);
      
      // Set canonical link
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', canonical);
    }

    // Twitter Card
    setMetaTag('twitter:title', title);
    setMetaTag('twitter:description', description);
    setMetaTag('twitter:card', 'summary_large_image');
    
    if (ogImage) {
      setMetaTag('twitter:image', ogImage);
    }

    // Robots
    if (noindex) {
      setMetaTag('robots', 'noindex, nofollow');
    } else {
      setMetaTag('robots', 'index, follow');
    }

    // Cleanup function to reset title on unmount
    return () => {
      document.title = 'CleaningPage - Tout votre service de nettoyage, dans un seul lien.';
    };
  }, [title, description, canonical, ogImage, noindex]);
}
