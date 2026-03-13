import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CenterCustomization, defaultCustomization, PageBlock, FontFamily, FONT_MAP, GOOGLE_FONT_URLS } from '@/types/customization';
import { cn } from '@/lib/utils';
import { Check, Sparkles, ArrowRight } from 'lucide-react';

interface PageTemplate {
  id: string;
  name: string;
  fontFamily: FontFamily;
  darkMode: boolean;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textPrimary: string;
  textSecondary: string;
  background: string;
  backgroundGradient?: string;
  headerStyle: 'banner' | 'minimal';
  buttonRadius: string;
  blocks: PageBlock[];
  ctaText: string;
}

const TEMPLATES: PageTemplate[] = [
  {
    id: 'default',
    name: 'Classique',
    fontFamily: 'system',
    darkMode: false,
    primaryColor: '#3b82f6',
    secondaryColor: '#1e293b',
    accentColor: '#10b981',
    textPrimary: '#111827',
    textSecondary: '#6b7280',
    background: '#ffffff',
    headerStyle: 'minimal',
    buttonRadius: '9999px',
    blocks: [
      { id: 'formules', type: 'formules', title: 'Nos formules', enabled: true, order: 1 },
    ],
    ctaText: 'Réserver',
  },
  {
    id: 'daft-punk',
    name: 'Noir',
    fontFamily: 'space-grotesk',
    darkMode: true,
    primaryColor: '#ffffff',
    secondaryColor: '#ffffff',
    accentColor: '#888888',
    textPrimary: '#ffffff',
    textSecondary: '#999999',
    background: '#0a0a0a',
    headerStyle: 'minimal',
    buttonRadius: '12px',
    blocks: [
      { id: 'formules', type: 'formules', title: 'Services', enabled: true, order: 1 },
    ],
    ctaText: 'Réserver',
  },
  {
    id: 'grey',
    name: 'Gris',
    fontFamily: 'inter',
    darkMode: false,
    primaryColor: '#4b5563',
    secondaryColor: '#1f2937',
    accentColor: '#6b7280',
    textPrimary: '#374151',
    textSecondary: '#9ca3af',
    background: '#f3f4f6',
    headerStyle: 'minimal',
    buttonRadius: '9999px',
    blocks: [
      { id: 'formules', type: 'formules', title: 'Nos formules', enabled: true, order: 1 },
    ],
    ctaText: 'Réserver',
  },
  {
    id: 'blue',
    name: 'Océan',
    fontFamily: 'dm-sans',
    darkMode: false,
    primaryColor: '#3b82f6',
    secondaryColor: '#1e3a5f',
    accentColor: '#60a5fa',
    textPrimary: '#1e3a5f',
    textSecondary: '#64748b',
    background: '#dbeafe',
    backgroundGradient: 'linear-gradient(180deg, #dbeafe 0%, #eff6ff 50%, #f0f9ff 100%)',
    headerStyle: 'banner',
    buttonRadius: '9999px',
    blocks: [
      { id: 'formules', type: 'formules', title: 'Nos formules', enabled: true, order: 1 },
    ],
    ctaText: 'Prendre RDV',
  },
  {
    id: 'aurora',
    name: 'Aurore',
    fontFamily: 'raleway',
    darkMode: false,
    primaryColor: '#be185d',
    secondaryColor: '#1e1b4b',
    accentColor: '#c084fc',
    textPrimary: '#1e1b4b',
    textSecondary: '#6b7280',
    background: '#fce7f3',
    backgroundGradient: 'linear-gradient(135deg, #fce7f3 0%, #ede9fe 50%, #dbeafe 100%)',
    headerStyle: 'minimal',
    buttonRadius: '9999px',
    blocks: [
      { id: 'formules', type: 'formules', title: 'Nos formules', enabled: true, order: 1 },
      { id: 'reviews_google', type: 'reviews', title: 'Avis Google', enabled: true, order: 2, reviewPlatform: 'google', reviewRating: 5, reviewCount: 0, reviewUrl: '' },
    ],
    ctaText: 'Réserver',
  },
  {
    id: 'nature',
    name: 'Nature',
    fontFamily: 'montserrat',
    darkMode: false,
    primaryColor: '#16a34a',
    secondaryColor: '#14532d',
    accentColor: '#22d3ee',
    textPrimary: '#14532d',
    textSecondary: '#4b5563',
    background: '#f0fdf4',
    backgroundGradient: 'linear-gradient(180deg, #f0fdf4 0%, #ecfdf5 50%, #f0fdf4 100%)',
    headerStyle: 'banner',
    buttonRadius: '9999px',
    blocks: [
      { id: 'formules', type: 'formules', title: 'Nos services', enabled: true, order: 1 },
      { id: 'hours_1', type: 'hours', title: 'Horaires', enabled: true, order: 2 },
    ],
    ctaText: 'Prendre RDV',
  },
  {
    id: 'lemon',
    name: 'Citron',
    fontFamily: 'poppins',
    darkMode: false,
    primaryColor: '#ca8a04',
    secondaryColor: '#713f12',
    accentColor: '#eab308',
    textPrimary: '#713f12',
    textSecondary: '#92400e',
    background: '#fef9c3',
    headerStyle: 'minimal',
    buttonRadius: '12px',
    blocks: [
      { id: 'formules', type: 'formules', title: 'Nos prestations', enabled: true, order: 1 },
    ],
    ctaText: 'Réserver',
  },
  {
    id: 'premium',
    name: 'Prestige',
    fontFamily: 'playfair',
    darkMode: true,
    primaryColor: '#a855f7',
    secondaryColor: '#1e1b4b',
    accentColor: '#ec4899',
    textPrimary: '#f8fafc',
    textSecondary: '#94a3b8',
    background: '#0f0a1a',
    backgroundGradient: 'linear-gradient(180deg, #0f0a1a 0%, #1a1035 50%, #0f0a1a 100%)',
    headerStyle: 'banner',
    buttonRadius: '9999px',
    blocks: [
      { id: 'formules', type: 'formules', title: 'Nos formules', enabled: true, order: 1 },
      { id: 'gallery_1', type: 'gallery', title: 'Galerie', enabled: true, order: 2, images: [], galleryType: 'gallery' },
    ],
    ctaText: 'Réserver',
  },
  {
    id: 'brown',
    name: 'Caramel',
    fontFamily: 'montserrat',
    darkMode: false,
    primaryColor: '#92400e',
    secondaryColor: '#451a03',
    accentColor: '#d97706',
    textPrimary: '#451a03',
    textSecondary: '#78350f',
    background: '#fef3c7',
    backgroundGradient: 'linear-gradient(180deg, #d2a679 0%, #fef3c7 40%, #fffbeb 100%)',
    headerStyle: 'banner',
    buttonRadius: '9999px',
    blocks: [
      { id: 'formules', type: 'formules', title: 'Nos formules', enabled: true, order: 1 },
    ],
    ctaText: 'Réserver',
  },
  {
    id: 'bold-red',
    name: 'Bold',
    fontFamily: 'space-grotesk',
    darkMode: false,
    primaryColor: '#dc2626',
    secondaryColor: '#1c1917',
    accentColor: '#f59e0b',
    textPrimary: '#1c1917',
    textSecondary: '#78716c',
    background: '#ffffff',
    headerStyle: 'banner',
    buttonRadius: '12px',
    blocks: [
      { id: 'formules', type: 'formules', title: 'Nos prestations', enabled: true, order: 1 },
      { id: 'gallery_1', type: 'gallery', title: 'Nos réalisations', enabled: true, order: 2, images: [], galleryType: 'realizations' },
    ],
    ctaText: 'Réserver maintenant',
  },
];

// Pre-load Google Fonts for template previews
const fontLinks = new Set<string>();
TEMPLATES.forEach(t => {
  const url = GOOGLE_FONT_URLS[t.fontFamily];
  if (url) fontLinks.add(url);
});

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
        primary: template.primaryColor,
        secondary: template.secondaryColor,
        accent: template.accentColor,
        text_primary: template.textPrimary,
        text_secondary: template.textSecondary,
        background: template.background,
        background_gradient: template.backgroundGradient,
      },
      layout: {
        dark_mode: template.darkMode,
        header_style: template.headerStyle,
        font_family: template.fontFamily,
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
    <div className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-start p-6 overflow-y-auto">
      {/* Font preload */}
      {Array.from(fontLinks).map(url => (
        <link key={url} rel="stylesheet" href={url} />
      ))}

      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Thèmes
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Choisissez un thème
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Sélectionnez un style pour démarrer. Vous pourrez tout personnaliser ensuite.
          </p>
        </div>

        {/* Templates Grid — paa.ge style visual cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          {TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => setSelected(template.id)}
              className={cn(
                "relative flex flex-col rounded-2xl overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:shadow-lg text-left group",
                selected === template.id
                  ? "ring-[3px] ring-primary shadow-lg"
                  : "ring-1 ring-border hover:ring-muted-foreground"
              )}
            >
              {/* Visual preview — shows actual background + styled elements */}
              <div
                className="h-44 sm:h-52 relative overflow-hidden flex flex-col items-center justify-center p-4 gap-2.5"
                style={{
                  background: template.backgroundGradient || template.background,
                  fontFamily: FONT_MAP[template.fontFamily] || FONT_MAP['system'],
                }}
              >
                {/* Template name as "title" */}
                <span
                  className="text-base sm:text-lg font-bold tracking-tight text-center z-10"
                  style={{ color: template.textPrimary }}
                >
                  {template.name}
                </span>

                {/* 3 fake button bars */}
                {[0.75, 0.85, 0.65].map((w, i) => (
                  <div
                    key={i}
                    className="h-9 sm:h-10 transition-all"
                    style={{
                      width: `${w * 100}%`,
                      backgroundColor: template.darkMode
                        ? `${template.primaryColor}22`
                        : `${template.primaryColor}18`,
                      borderRadius: template.buttonRadius,
                      border: template.darkMode
                        ? `1px solid ${template.primaryColor}33`
                        : `1px solid ${template.primaryColor}20`,
                    }}
                  />
                ))}

                {/* Selected check */}
                {selected === template.id && (
                  <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 pb-6">
          <Button variant="ghost" onClick={onSkip} className="text-muted-foreground">
            Passer
          </Button>
          <Button
            variant="premium"
            size="lg"
            onClick={handleApply}
            disabled={!selected}
            className="px-8 gap-2"
          >
            Utiliser ce thème
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
