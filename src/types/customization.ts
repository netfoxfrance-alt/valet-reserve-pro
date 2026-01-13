export interface CustomLink {
  id: string;
  title: string;
  url: string;
  icon?: 'link' | 'shop' | 'book' | 'video' | 'calendar' | 'file';
}

export interface PageSection {
  id: string;
  type: 'formules' | 'gallery' | 'about' | 'contact' | 'text_block';
  title: string;
  enabled: boolean;
  order: number;
  content?: string; // For text_block sections
}

export interface CenterCustomization {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text_primary: string;
    text_secondary: string;
  };
  texts: {
    tagline: string;
    cta_button: string;
    about: string;
    welcome_message: string;
  };
  layout: {
    show_hours: boolean;
    show_address: boolean;
    show_phone: boolean;
    show_contact_form: boolean;
    show_gallery: boolean;
    dark_mode: boolean;
    links_position: 'top' | 'after_formules' | 'after_gallery' | 'bottom';
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
  custom_links: CustomLink[];
  sections: PageSection[];
}

// Default sections for new centers
export const defaultSections: PageSection[] = [
  { id: 'formules', type: 'formules', title: 'Nos formules', enabled: true, order: 1 },
  { id: 'gallery', type: 'gallery', title: 'Nos réalisations', enabled: true, order: 2 },
  { id: 'about', type: 'about', title: 'À propos', enabled: true, order: 3 },
  { id: 'contact', type: 'contact', title: 'Nous contacter', enabled: true, order: 4 },
];

export const defaultCustomization: CenterCustomization = {
  colors: {
    primary: '#3b82f6',
    secondary: '#1e293b',
    accent: '#10b981',
    text_primary: '#111827',
    text_secondary: '#6b7280',
  },
  texts: {
    tagline: '',
    cta_button: 'Réserver',
    about: '',
    welcome_message: '',
  },
  layout: {
    show_hours: true,
    show_address: true,
    show_phone: true,
    show_contact_form: true,
    show_gallery: true,
    dark_mode: false,
    links_position: 'top',
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
  custom_links: [],
  sections: defaultSections,
};
