import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, Globe, MapPin, Tag, Share2, ImageIcon } from 'lucide-react';
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

  // Preview what will appear on Google & social
  const previewTitle = seo.title || `${centerName}${seo.city ? ` à ${seo.city}` : ''} — Réservez en ligne facilement.`;
  const previewDescription = seo.description || `${centerName}${seo.city ? ` à ${seo.city}` : ''} — Réservez en ligne facilement.`;
  const previewImage = customization.cover_url || null;

  return (
    <section className="mb-6 sm:mb-8">
      <div className="flex items-center gap-2 mb-1 sm:mb-2">
        <Search className="w-5 h-5 text-primary" />
        <h2 className="text-lg sm:text-xl font-semibold text-foreground">Référencement & Partage</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4 sm:mb-6">
        Personnalisez comment votre page apparaît sur Google et quand vous partagez votre lien par message (iMessage, WhatsApp, etc.).
      </p>
      
      {/* Google Preview */}
      <Card variant="elevated" className="p-4 sm:p-6 mb-4 bg-card/50">
        <p className="text-xs text-muted-foreground mb-3 font-medium">🔍 Aperçu Google</p>
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

      {/* Social Share Preview (iMessage / WhatsApp style) */}
      <Card variant="elevated" className="p-4 sm:p-6 mb-4 bg-card/50">
        <p className="text-xs text-muted-foreground mb-3 font-medium">💬 Aperçu partage par message (iMessage, WhatsApp...)</p>
        <div className="rounded-xl overflow-hidden border border-border bg-muted/30 max-w-sm">
          {previewImage ? (
            <div className="w-full h-36 bg-muted overflow-hidden">
              <img 
                src={previewImage} 
                alt="Image d'aperçu" 
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-full h-36 bg-muted flex items-center justify-center">
              <div className="text-center">
                <ImageIcon className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground/60">Ajoutez une bannière dans "Apparence"</p>
              </div>
            </div>
          )}
          <div className="p-3 space-y-0.5">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{centerName}</p>
            <p className="text-sm font-semibold text-foreground line-clamp-1">{previewTitle}</p>
            <p className="text-xs text-muted-foreground line-clamp-2">{previewDescription}</p>
          </div>
        </div>
        {!previewImage && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-3">
            💡 Ajoutez une bannière dans la section "Apparence" pour que votre lien partagé affiche votre image, pas une image générique.
          </p>
        )}
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
            Titre (Google + aperçu de lien, max 60 caractères)
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
          <Label htmlFor="seo-description">Description (Google + aperçu de lien, max 160 caractères)</Label>
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
