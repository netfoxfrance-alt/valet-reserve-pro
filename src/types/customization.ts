export interface CenterCustomization {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  texts: {
    tagline: string;
    cta_button: string;
  };
  layout: {
    show_hours: boolean;
    show_address: boolean;
    show_phone: boolean;
    dark_mode: boolean;
  };
  cover_url: string | null;
}

export const defaultCustomization: CenterCustomization = {
  colors: {
    primary: '#3b82f6',
    secondary: '#1e293b',
    accent: '#10b981',
  },
  texts: {
    tagline: '',
    cta_button: 'Réserver maintenant',
  },
  layout: {
    show_hours: true,
    show_address: true,
    show_phone: true,
    dark_mode: false,
  },
  cover_url: null,
};
