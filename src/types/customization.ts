export interface CenterCustomization {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  texts: {
    tagline: string;
    cta_button: string;
    about: string;
  };
  layout: {
    show_hours: boolean;
    show_address: boolean;
    show_phone: boolean;
    show_contact_form: boolean;
    show_gallery: boolean;
    dark_mode: boolean;
  };
  social: {
    instagram: string;
    tiktok: string;
    facebook: string;
    email: string;
  };
  seo: {
    title: string;
    description: string;
    keywords: string;
    city: string;
  };
  cover_url: string | null;
  gallery_images: string[];
  visible_pack_ids: string[];
}

export const defaultCustomization: CenterCustomization = {
  colors: {
    primary: '#3b82f6',
    secondary: '#1e293b',
    accent: '#10b981',
  },
  texts: {
    tagline: '',
    cta_button: 'Réserver',
    about: '',
  },
  layout: {
    show_hours: true,
    show_address: true,
    show_phone: true,
    show_contact_form: true,
    show_gallery: true,
    dark_mode: false,
  },
  social: {
    instagram: '',
    tiktok: '',
    facebook: '',
    email: '',
  },
  seo: {
    title: '',
    description: '',
    keywords: '',
    city: '',
  },
  cover_url: null,
  gallery_images: [],
  visible_pack_ids: [],
};
