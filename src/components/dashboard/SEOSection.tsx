import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, Globe, MapPin, Tag } from 'lucide-react';
import { CenterCustomization } from '@/types/customization';

interface SEOSectionProps {
  customization: CenterCustomization;
  centerName: string;
  onChange: (customization: CenterCustomization) => void;
}

export function SEOSection({ customization, centerName, onChange }: SEOSectionProps) {
  const seo = customization.seo || { title: '', description: '', keywords: '', city: '' };
  
  const updateSEO = (field: keyof typeof seo, value: string) => {
    onChange({
      ...customization,
      seo: {
        ...seo,
        [field]: value,
      },
    });
  };

  // Preview what will appear on Google
  const previewTitle = seo.title || `${centerName} - Nettoyage professionnel${seo.city ? ` à ${seo.city}` : ''}`;
  const previewDescription = seo.description || `${centerName} propose des services de nettoyage professionnel${seo.city ? ` à ${seo.city}` : ''}. Réservez en ligne facilement.`;

  return (
    <section className="mb-6 sm:mb-8">
      <div className="flex items-center gap-2 mb-1 sm:mb-2">
        <Search className="w-5 h-5 text-primary" />
        <h2 className="text-lg sm:text-xl font-semibold text-foreground">Référencement Google (SEO)</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4 sm:mb-6">
        Personnalisez comment votre page apparaît dans les résultats Google.
      </p>
      
      {/* Google Preview */}
      <Card variant="elevated" className="p-4 sm:p-6 mb-4 bg-card/50">
        <p className="text-xs text-muted-foreground mb-3">Aperçu Google</p>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">cleaningpage.com › ...</p>
          <p className="text-lg text-[#1a0dab] hover:underline cursor-pointer font-medium line-clamp-1">
            {previewTitle}
          </p>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {previewDescription}
          </p>
        </div>
      </Card>

      <Card variant="elevated" className="p-4 sm:p-6 space-y-4 sm:space-y-5">
        <div className="space-y-2">
          <Label htmlFor="seo-city" className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            Ville
          </Label>
          <Input
            id="seo-city"
            value={seo.city}
            onChange={(e) => updateSEO('city', e.target.value)}
            placeholder="Ex: Paris, Lyon, Marseille..."
          />
          <p className="text-xs text-muted-foreground">
            Importante pour apparaître dans les recherches "Nettoyage + Ville"
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="seo-title" className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            Titre Google (max 60 caractères)
          </Label>
          <Input
            id="seo-title"
            value={seo.title}
            onChange={(e) => updateSEO('title', e.target.value.slice(0, 60))}
            placeholder={`${centerName} - Nettoyage professionnel`}
            maxLength={60}
          />
          <p className="text-xs text-muted-foreground text-right">
            {seo.title.length}/60
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="seo-description">Description Google (max 160 caractères)</Label>
          <Textarea
            id="seo-description"
            value={seo.description}
            onChange={(e) => updateSEO('description', e.target.value.slice(0, 160))}
            placeholder="Décrivez votre activité en incluant votre ville et vos services..."
            rows={3}
            maxLength={160}
          />
          <p className="text-xs text-muted-foreground text-right">
            {seo.description.length}/160
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="seo-keywords" className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-muted-foreground" />
            Mots-clés (séparés par des virgules)
          </Label>
          <Input
            id="seo-keywords"
            value={seo.keywords}
            onChange={(e) => updateSEO('keywords', e.target.value)}
            placeholder="nettoyage auto, detailing, lavage voiture..."
          />
          <p className="text-xs text-muted-foreground">
            Mots-clés sur lesquels vous souhaitez être trouvé
          </p>
        </div>
      </Card>
    </section>
  );
}
