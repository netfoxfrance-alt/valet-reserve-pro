export interface CustomLink {
  id: string;
  title: string;
  url: string;
  icon?: 'link' | 'shop' | 'book' | 'video' | 'calendar' | 'file';
}

// All block types that can be added to a page
export type BlockType = 
  | 'formules'      // Pack/tarifs display
  | 'gallery'       // Image gallery (multiple allowed)
  | 'text_block'    // Free text block (multiple allowed)
  | 'links'         // Custom links
  | 'contact'       // Contact form
  | 'hours'         // Business hours
  | 'address'       // Address display
  | 'phone';        // Phone display

export interface PageBlock {
  id: string;
  type: BlockType;
  title: string;
  enabled: boolean;
  order: number;
  // Content varies by type
  content?: string;           // For text_block
  images?: string[];          // For gallery
  galleryType?: 'gallery' | 'realizations' | 'before_after';  // Subtype for gallery
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
    welcome_message: string;
  };
  layout: {
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
  gallery_images: string[]; // Legacy - kept for backward compatibility
  visible_pack_ids: string[];
  custom_links: CustomLink[];
  blocks: PageBlock[];
}

// For backward compatibility - convert old sections to blocks
export interface PageSection {
  id: string;
  type: 'formules' | 'gallery' | 'about' | 'contact' | 'text_block';
  title: string;
  enabled: boolean;
  order: number;
  content?: string;
  images?: string[];
}

export const defaultSections: PageSection[] = [
  { id: 'formules', type: 'formules', title: 'Nos formules', enabled: true, order: 1 },
  { id: 'gallery', type: 'gallery', title: 'Nos réalisations', enabled: true, order: 2, images: [] },
  { id: 'about', type: 'about', title: 'À propos', enabled: true, order: 3, content: '' },
  { id: 'contact', type: 'contact', title: 'Nous contacter', enabled: true, order: 4 },
];

// Default blocks for new centers - start with formules only (minimal page)
export const defaultBlocks: PageBlock[] = [
  { id: 'formules', type: 'formules', title: 'Nos formules', enabled: true, order: 1 },
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
    welcome_message: '',
  },
  layout: {
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
  custom_links: [],
  blocks: defaultBlocks,
};

// Helper to migrate old sections to new blocks format
export function migrateToBlocks(customization: any): PageBlock[] {
  // If already has blocks, return them
  if (customization.blocks && customization.blocks.length > 0) {
    return customization.blocks;
  }
  
  // If has old sections, migrate them
  if (customization.sections && customization.sections.length > 0) {
    return customization.sections.map((section: PageSection) => {
      const block: PageBlock = {
        id: section.id,
        type: section.type === 'about' ? 'text_block' : section.type as BlockType,
        title: section.title,
        enabled: section.enabled,
        order: section.order,
      };
      
      if (section.content) block.content = section.content;
      if (section.images) block.images = section.images;
      
      return block;
    });
  }
  
  // Otherwise, return defaults
  return defaultBlocks;
}
