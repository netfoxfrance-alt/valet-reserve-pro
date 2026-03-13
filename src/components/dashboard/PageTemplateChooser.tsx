import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CenterCustomization, defaultCustomization, defaultBlocks, PageBlock } from '@/types/customization';
import { cn } from '@/lib/utils';
import { Check, Sparkles } from 'lucide-react';

interface PageTemplate {
  id: string;
  name: string;
  description: string;
  preview: {
    headerStyle: 'banner' | 'minimal';
    darkMode: boolean;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    textPrimary: string;
    textSecondary: string;
  };
  blocks: PageBlock[];
  ctaText: string;
}

const TEMPLATES: PageTemplate[] = [
  {
    id: 'classic',
    name: 'Classique',
    description: 'Bannière + formules. Simple et efficace.',
    preview: {
      headerStyle: 'banner',
      darkMode: false,
      primaryColor: '#3b82f6',
      secondaryColor: '#1e293b',
      accentColor: '#10b981',
      textPrimary: '#111827',
      textSecondary: '#6b7280',
    },
    blocks: [
      { id: 'formules', type: 'formules', title: 'Nos formules', enabled: true, order: 1 },
    ],
    ctaText: 'Réserver',
  },
  {
    id: 'modern',
    name: 'Moderne',
    description: 'Style minimal avec des touches élégantes.',
    preview: {
      headerStyle: 'minimal',
      darkMode: false,
      primaryColor: '#0ea5e9',
      secondaryColor: '#0f172a',
      accentColor: '#06b6d4',
      textPrimary: '#0f172a',
      textSecondary: '#64748b',
    },
    blocks: [
      { id: 'formules', type: 'formules', title: 'Nos formules', enabled: true, order: 1 },
      { id: 'reviews_google', type: 'reviews', title: 'Avis Google', enabled: true, order: 2, reviewPlatform: 'google', reviewRating: 5, reviewCount: 0, reviewUrl: '' },
    ],
    ctaText: 'Prendre rendez-vous',
  },
  {
    id: 'bold',
    name: 'Audacieux',
    description: 'Couleurs vives et accrocheuses.',
    preview: {
      headerStyle: 'banner',
      darkMode: false,
      primaryColor: '#ef4444',
      secondaryColor: '#1c1917',
      accentColor: '#f59e0b',
      textPrimary: '#1c1917',
      textSecondary: '#78716c',
    },
    blocks: [
      { id: 'formules', type: 'formules', title: 'Nos prestations', enabled: true, order: 1 },
      { id: 'gallery_1', type: 'gallery', title: 'Nos réalisations', enabled: true, order: 2, images: [], galleryType: 'realizations' },
    ],
    ctaText: 'Réserver maintenant',
  },
  {
    id: 'dark',
    name: 'Premium',
    description: 'Thème sombre, style luxe.',
    preview: {
      headerStyle: 'banner',
      darkMode: true,
      primaryColor: '#a855f7',
      secondaryColor: '#1e1b4b',
      accentColor: '#ec4899',
      textPrimary: '#f8fafc',
      textSecondary: '#94a3b8',
    },
    blocks: [
      { id: 'formules', type: 'formules', title: 'Nos formules', enabled: true, order: 1 },
      { id: 'gallery_1', type: 'gallery', title: 'Galerie', enabled: true, order: 2, images: [], galleryType: 'gallery' },
      { id: 'contact_1', type: 'contact', title: 'Contact', enabled: true, order: 3 },
    ],
    ctaText: 'Réserver',
  },
  {
    id: 'nature',
    name: 'Nature',
    description: 'Tons verts apaisants et frais.',
    preview: {
      headerStyle: 'minimal',
      darkMode: false,
      primaryColor: '#22c55e',
      secondaryColor: '#14532d',
      accentColor: '#3b82f6',
      textPrimary: '#14532d',
      textSecondary: '#4b5563',
    },
    blocks: [
      { id: 'formules', type: 'formules', title: 'Nos services', enabled: true, order: 1 },
      { id: 'hours_1', type: 'hours', title: 'Horaires', enabled: true, order: 2 },
      { id: 'address_1', type: 'address', title: 'Adresse', enabled: true, order: 3 },
    ],
    ctaText: 'Prendre RDV',
  },
  {
    id: 'orange',
    name: 'Énergie',
    description: 'Orange dynamique et chaleureux.',
    preview: {
      headerStyle: 'banner',
      darkMode: false,
      primaryColor: '#f97316',
      secondaryColor: '#431407',
      accentColor: '#06b6d4',
      textPrimary: '#431407',
      textSecondary: '#78716c',
    },
    blocks: [
      { id: 'formules', type: 'formules', title: 'Nos formules', enabled: true, order: 1 },
      { id: 'text_1', type: 'text_block', title: 'À propos', enabled: true, order: 2, content: '' },
    ],
    ctaText: 'Réserver',
  },
];

interface PageTemplateChooserProps {
  onSelect: (customization: CenterCustomization) => void;
  onSkip: () => void;
}

export function PageTemplateChooser({ onSelect, onSkip }: PageTemplateChooserProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleApply = () => {
    const template = TEMPLATES.find(t => t.id === selected);
    if (!template) return;

    const customization: CenterCustomization = {
      ...defaultCustomization,
      colors: {
        primary: template.preview.primaryColor,
        secondary: template.preview.secondaryColor,
        accent: template.preview.accentColor,
        text_primary: template.preview.textPrimary,
        text_secondary: template.preview.textSecondary,
      },
      layout: {
        dark_mode: template.preview.darkMode,
        header_style: template.preview.headerStyle,
      },
      texts: {
        ...defaultCustomization.texts,
        cta_button: template.ctaText,
      },
      blocks: template.blocks,
    };

    onSelect(customization);
  };

  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center p-6">
      <div className="max-w-3xl w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-5">
            <Sparkles className="w-4 h-4" />
            Nouvelle page
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Choisissez un style
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Sélectionnez un template pour démarrer. Vous pourrez tout personnaliser ensuite.
          </p>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
          {TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => setSelected(template.id)}
              className={cn(
                "relative flex flex-col rounded-2xl border-2 overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:shadow-lg text-left",
                selected === template.id
                  ? "border-primary ring-4 ring-primary/20 shadow-lg"
                  : "border-border hover:border-muted-foreground"
              )}
            >
              {/* Mini preview */}
              <div 
                className="h-32 sm:h-40 relative overflow-hidden"
                style={{ 
                  backgroundColor: template.preview.darkMode ? '#111' : '#f8fafc',
                }}
              >
                {/* Header bar */}
                <div 
                  className="h-8 flex items-center px-3 gap-1.5"
                  style={{ 
                    backgroundColor: template.preview.headerStyle === 'banner' 
                      ? template.preview.primaryColor + '20' 
                      : 'transparent',
                    borderBottom: `1px solid ${template.preview.darkMode ? '#333' : '#e5e7eb'}`
                  }}
                >
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: template.preview.primaryColor }} />
                  <div 
                    className="h-2 w-16 rounded-full" 
                    style={{ backgroundColor: template.preview.textPrimary + '40' }} 
                  />
                </div>
                
                {/* Content preview lines */}
                <div className="p-3 space-y-2">
                  <div className="h-2 w-3/4 rounded-full" style={{ backgroundColor: template.preview.textPrimary + '25' }} />
                  <div className="h-2 w-1/2 rounded-full" style={{ backgroundColor: template.preview.textSecondary + '25' }} />
                  
                  <div className="flex gap-1.5 mt-3">
                    <div 
                      className="h-6 flex-1 rounded-lg" 
                      style={{ backgroundColor: template.preview.primaryColor + '20' }} 
                    />
                    <div 
                      className="h-6 flex-1 rounded-lg" 
                      style={{ backgroundColor: template.preview.primaryColor + '20' }} 
                    />
                  </div>
                  
                  <div 
                    className="h-7 w-full rounded-lg mt-2" 
                    style={{ backgroundColor: template.preview.primaryColor }} 
                  />
                </div>

                {/* Selected check */}
                {selected === template.id && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </div>

              {/* Label */}
              <div className="p-3 bg-background">
                <p className="font-semibold text-sm text-foreground">{template.name}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">{template.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3">
          <Button variant="ghost" onClick={onSkip} className="text-muted-foreground">
            Passer cette étape
          </Button>
          <Button 
            variant="premium" 
            size="lg" 
            onClick={handleApply} 
            disabled={!selected}
            className="px-8"
          >
            Utiliser ce template
          </Button>
        </div>
      </div>
    </div>
  );
}
