import { useEffect } from 'react';

interface LocalBusinessSchemaProps {
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  url: string;
  image?: string;
  openingHours?: {
    dayOfWeek: number;
    opens: string;
    closes: string;
  }[];
}

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday', 
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

export function LocalBusinessSchema({
  name,
  description,
  address,
  phone,
  email,
  url,
  image,
  openingHours
}: LocalBusinessSchemaProps) {
  useEffect(() => {
    // Create structured data
    const structuredData: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      'name': name,
      'url': url,
      '@id': url,
    };

    if (description) {
      structuredData.description = description;
    }

    if (image) {
      structuredData.image = image;
    }

    if (address) {
      structuredData.address = {
        '@type': 'PostalAddress',
        'streetAddress': address,
      };
    }

    if (phone) {
      structuredData.telephone = phone;
    }

    if (email) {
      structuredData.email = email;
    }

    // Add opening hours
    if (openingHours && openingHours.length > 0) {
      structuredData.openingHoursSpecification = openingHours.map(oh => ({
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': DAYS_OF_WEEK[oh.dayOfWeek],
        'opens': oh.opens,
        'closes': oh.closes,
      }));
    }

    // Add service type
    structuredData.additionalType = 'https://schema.org/CleaningService';
    structuredData.serviceType = 'Nettoyage professionnel';

    // Create or update script tag
    const scriptId = 'local-business-schema';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    
    script.textContent = JSON.stringify(structuredData);

    // Cleanup
    return () => {
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [name, description, address, phone, email, url, image, openingHours]);

  return null;
}
