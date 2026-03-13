import { CenterCustomization, PageBlock, defaultCustomization } from '@/types/customization';

export interface PageTemplate {
  id: string;
  name: string;
  description: string;
  emoji: string;
  preview: {
    primary: string;
    secondary: string;
    accent: string;
    dark_mode: boolean;
  };
  customization: Partial<CenterCustomization>;
}

export const PAGE_TEMPLATES: PageTemplate[] = [
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Épuré et professionnel. Idéal pour aller droit au but.',
    emoji: '✨',
    preview: {
      primary: '#111827',
      secondary: '#1f2937',
      accent: '#6366f1',
      dark_mode: false,
    },
    customization: {
      colors: {
        primary: '#111827',
        secondary: '#1f2937',
        accent: '#6366f1',
        text_primary: '#111827',
        text_secondary: '#6b7280',
      },
      texts: {
        tagline: '',
        cta_button: 'Réserver',
        welcome_message: '',
      },
      layout: {
        dark_mode: false,
        header_style: 'minimal',
      },
      cover_url: null,
      blocks: [
        { id: 'formules', type: 'formules', title: 'Nos formules', enabled: true, order: 1 },
        { id: 'phone_default', type: 'phone', title: 'Téléphone', enabled: true, order: 2, infoStyle: 'pill' },
      ],
    },
  },
  {
    id: 'vitrine',
    name: 'Vitrine',
    description: 'Page complète avec galerie, avis et coordonnées.',
    emoji: '🏪',
    preview: {
      primary: '#2563eb',
      secondary: '#1e3a5f',
      accent: '#10b981',
      dark_mode: false,
    },
    customization: {
      colors: {
        primary: '#2563eb',
        secondary: '#1e3a5f',
        accent: '#10b981',
        text_primary: '#111827',
        text_secondary: '#6b7280',
      },
      texts: {
        tagline: 'Qualité et professionnalisme',
        cta_button: 'Réserver maintenant',
        welcome_message: '',
      },
      layout: {
        dark_mode: false,
        header_style: 'banner',
      },
      blocks: [
        { id: 'formules', type: 'formules', title: 'Nos formules', enabled: true, order: 1 },
        { id: 'gallery_default', type: 'gallery', title: 'Nos réalisations', enabled: true, order: 2, images: [], galleryType: 'realizations' },
        { id: 'reviews_google', type: 'reviews', title: 'Avis Google', enabled: true, order: 3, reviewPlatform: 'google', reviewUrl: '', reviewRating: 5, reviewCount: 0 },
        { id: 'hours_default', type: 'hours', title: 'Horaires', enabled: true, order: 4, infoStyle: 'card' },
        { id: 'address_default', type: 'address', title: 'Adresse', enabled: true, order: 5, infoStyle: 'card' },
        { id: 'contact_default', type: 'contact', title: 'Nous contacter', enabled: true, order: 6 },
      ],
    },
  },
  {
    id: 'pro_nettoyage',
    name: 'Pro Nettoyage',
    description: 'Optimisé pour les pros du nettoyage et du detailing.',
    emoji: '🧹',
    preview: {
      primary: '#059669',
      secondary: '#064e3b',
      accent: '#0ea5e9',
      dark_mode: false,
    },
    customization: {
      colors: {
        primary: '#059669',
        secondary: '#064e3b',
        accent: '#0ea5e9',
        text_primary: '#111827',
        text_secondary: '#6b7280',
      },
      texts: {
        tagline: 'Nettoyage professionnel à domicile',
        cta_button: 'Demander un devis',
        welcome_message: '',
      },
      layout: {
        dark_mode: false,
        header_style: 'banner',
      },
      blocks: [
        { id: 'text_intro', type: 'text_block', title: 'Notre savoir-faire', enabled: true, order: 1, content: '<p>Nous intervenons chez vous pour un nettoyage professionnel de qualité. Devis gratuit et sans engagement.</p>' },
        { id: 'formules', type: 'formules', title: 'Nos prestations', enabled: true, order: 2 },
        { id: 'gallery_before_after', type: 'gallery', title: 'Avant / Après', enabled: true, order: 3, images: [], galleryType: 'before_after' },
        { id: 'phone_default', type: 'phone', title: 'Téléphone', enabled: true, order: 4, infoStyle: 'pill' },
        { id: 'contact_default', type: 'contact', title: 'Demander un devis', enabled: true, order: 5 },
      ],
    },
  },
  {
    id: 'prestige',
    name: 'Prestige',
    description: 'Élégant et haut de gamme avec mode sombre.',
    emoji: '🖤',
    preview: {
      primary: '#c084fc',
      secondary: '#1e1b4b',
      accent: '#f59e0b',
      dark_mode: true,
    },
    customization: {
      colors: {
        primary: '#c084fc',
        secondary: '#1e1b4b',
        accent: '#f59e0b',
        text_primary: '#f8fafc',
        text_secondary: '#94a3b8',
      },
      texts: {
        tagline: 'L\'excellence à votre service',
        cta_button: 'Prendre rendez-vous',
        welcome_message: '',
      },
      layout: {
        dark_mode: true,
        header_style: 'banner',
      },
      blocks: [
        { id: 'formules', type: 'formules', title: 'Nos prestations', enabled: true, order: 1 },
        { id: 'gallery_default', type: 'gallery', title: 'Galerie', enabled: true, order: 2, images: [], galleryType: 'gallery' },
        { id: 'links_default', type: 'links', title: 'Liens', enabled: true, order: 3 },
        { id: 'contact_default', type: 'contact', title: 'Contact', enabled: true, order: 4 },
      ],
      social: {
        instagram: '',
        tiktok: '',
        facebook: '',
        email: '',
      },
    },
  },
];

export function applyTemplate(
  template: PageTemplate,
  currentCustomization: CenterCustomization
): CenterCustomization {
  return {
    ...currentCustomization,
    ...template.customization,
    colors: {
      ...currentCustomization.colors,
      ...template.customization.colors,
    },
    texts: {
      ...currentCustomization.texts,
      ...template.customization.texts,
    },
    layout: {
      ...currentCustomization.layout,
      ...template.customization.layout,
    },
    social: template.customization.social || currentCustomization.social,
    blocks: (template.customization.blocks || currentCustomization.blocks) as PageBlock[],
    // Keep existing data
    cover_url: template.customization.cover_url !== undefined ? template.customization.cover_url : currentCustomization.cover_url,
    visible_pack_ids: currentCustomization.visible_pack_ids,
    custom_links: currentCustomization.custom_links,
    gallery_images: currentCustomization.gallery_images,
    seo: currentCustomization.seo,
    settings: currentCustomization.settings,
  };
}

// Color themes for the simplified theme picker
export interface ColorTheme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text_primary: string;
    text_secondary: string;
  };
}

export const COLOR_THEMES: ColorTheme[] = [
  {
    id: 'ocean',
    name: 'Océan',
    colors: { primary: '#2563eb', secondary: '#1e3a5f', accent: '#06b6d4', text_primary: '#111827', text_secondary: '#6b7280' },
  },
  {
    id: 'emerald',
    name: 'Émeraude',
    colors: { primary: '#059669', secondary: '#064e3b', accent: '#34d399', text_primary: '#111827', text_secondary: '#6b7280' },
  },
  {
    id: 'sunset',
    name: 'Coucher',
    colors: { primary: '#f97316', secondary: '#431407', accent: '#fbbf24', text_primary: '#111827', text_secondary: '#6b7280' },
  },
  {
    id: 'rose',
    name: 'Rose',
    colors: { primary: '#ec4899', secondary: '#500724', accent: '#f472b6', text_primary: '#111827', text_secondary: '#6b7280' },
  },
  {
    id: 'violet',
    name: 'Violet',
    colors: { primary: '#8b5cf6', secondary: '#1e1b4b', accent: '#a78bfa', text_primary: '#111827', text_secondary: '#6b7280' },
  },
  {
    id: 'crimson',
    name: 'Carmin',
    colors: { primary: '#dc2626', secondary: '#1c1917', accent: '#f59e0b', text_primary: '#111827', text_secondary: '#6b7280' },
  },
  {
    id: 'slate',
    name: 'Ardoise',
    colors: { primary: '#334155', secondary: '#0f172a', accent: '#6366f1', text_primary: '#111827', text_secondary: '#6b7280' },
  },
  {
    id: 'gold',
    name: 'Or',
    colors: { primary: '#b45309', secondary: '#1c1917', accent: '#fbbf24', text_primary: '#111827', text_secondary: '#6b7280' },
  },
];
