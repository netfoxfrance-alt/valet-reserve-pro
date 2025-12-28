import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CenterCustomization, defaultCustomization } from '@/types/customization';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Palette, Type, Layout, Image, Upload, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomizationSectionProps {
  centerId: string;
  userId: string;
  customization: CenterCustomization;
  onUpdate: (customization: CenterCustomization) => void;
}

const COLOR_PRESETS = [
  { name: 'Bleu', primary: '#3b82f6', secondary: '#1e293b', accent: '#10b981' },
  { name: 'Rouge', primary: '#ef4444', secondary: '#1c1917', accent: '#f59e0b' },
  { name: 'Vert', primary: '#22c55e', secondary: '#14532d', accent: '#3b82f6' },
  { name: 'Violet', primary: '#8b5cf6', secondary: '#1e1b4b', accent: '#ec4899' },
  { name: 'Orange', primary: '#f97316', secondary: '#431407', accent: '#06b6d4' },
  { name: 'Rose', primary: '#ec4899', secondary: '#500724', accent: '#8b5cf6' },
];

export function CustomizationSection({ centerId, userId, customization, onUpdate }: CustomizationSectionProps) {
  const { toast } = useToast();
  const [uploadingCover, setUploadingCover] = useState(false);
  const [local, setLocal] = useState<CenterCustomization>(customization);

  const updateLocal = (updates: Partial<CenterCustomization>) => {
    const newCustomization = { ...local, ...updates };
    setLocal(newCustomization);
    onUpdate(newCustomization);
  };

  const updateColors = (colors: Partial<CenterCustomization['colors']>) => {
    updateLocal({ colors: { ...local.colors, ...colors } });
  };

  const updateTexts = (texts: Partial<CenterCustomization['texts']>) => {
    updateLocal({ texts: { ...local.texts, ...texts } });
  };

  const updateLayout = (layout: Partial<CenterCustomization['layout']>) => {
    updateLocal({ layout: { ...local.layout, ...layout } });
  };

  const applyPreset = (preset: typeof COLOR_PRESETS[0]) => {
    updateLocal({
      colors: {
        primary: preset.primary,
        secondary: preset.secondary,
        accent: preset.accent,
      },
    });
  };

  const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Erreur', description: 'Veuillez sélectionner une image.', variant: 'destructive' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Erreur', description: "L'image doit faire moins de 5 Mo.", variant: 'destructive' });
      return;
    }

    setUploadingCover(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/cover.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('center-logos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('center-logos')
        .getPublicUrl(fileName);

      updateLocal({ cover_url: publicUrl });
      toast({ title: 'Image de couverture mise à jour' });
    } catch (error) {
      console.error('Cover upload error:', error);
      toast({ title: 'Erreur', description: 'Impossible de télécharger l\'image.', variant: 'destructive' });
    } finally {
      setUploadingCover(false);
      event.target.value = '';
    }
  };

  const handleRemoveCover = async () => {
    setUploadingCover(true);
    try {
      await supabase.storage
        .from('center-logos')
        .remove([`${userId}/cover.png`, `${userId}/cover.jpg`, `${userId}/cover.jpeg`, `${userId}/cover.webp`]);

      updateLocal({ cover_url: null });
      toast({ title: 'Image supprimée' });
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de supprimer l\'image.', variant: 'destructive' });
    } finally {
      setUploadingCover(false);
    }
  };

  return (
    <section className="mb-6 sm:mb-8">
      <Card variant="elevated" className="p-4 sm:p-6">
        <Tabs defaultValue="colors" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="colors" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Couleurs</span>
            </TabsTrigger>
            <TabsTrigger value="texts" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <Type className="w-4 h-4" />
              <span className="hidden sm:inline">Textes</span>
            </TabsTrigger>
            <TabsTrigger value="layout" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <Layout className="w-4 h-4" />
              <span className="hidden sm:inline">Affichage</span>
            </TabsTrigger>
            <TabsTrigger value="cover" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <Image className="w-4 h-4" />
              <span className="hidden sm:inline">Couverture</span>
            </TabsTrigger>
          </TabsList>

          {/* Colors Tab */}
          <TabsContent value="colors" className="space-y-6">
            <div>
              <Label className="text-sm font-medium mb-3 block">Thèmes prédéfinis</Label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset)}
                    className={cn(
                      "p-3 rounded-lg border-2 transition-all hover:scale-105",
                      local.colors.primary === preset.primary 
                        ? "border-primary ring-2 ring-primary/20" 
                        : "border-border hover:border-muted-foreground"
                    )}
                  >
                    <div className="flex gap-1 mb-1.5">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: preset.primary }}
                      />
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: preset.secondary }}
                      />
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: preset.accent }}
                      />
                    </div>
                    <p className="text-xs text-center text-muted-foreground">{preset.name}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primary-color">Couleur principale</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    id="primary-color"
                    value={local.colors.primary}
                    onChange={(e) => updateColors({ primary: e.target.value })}
                    className="w-12 h-10 rounded border border-border cursor-pointer"
                  />
                  <Input
                    value={local.colors.primary}
                    onChange={(e) => updateColors({ primary: e.target.value })}
                    className="flex-1"
                    placeholder="#3b82f6"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondary-color">Couleur secondaire</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    id="secondary-color"
                    value={local.colors.secondary}
                    onChange={(e) => updateColors({ secondary: e.target.value })}
                    className="w-12 h-10 rounded border border-border cursor-pointer"
                  />
                  <Input
                    value={local.colors.secondary}
                    onChange={(e) => updateColors({ secondary: e.target.value })}
                    className="flex-1"
                    placeholder="#1e293b"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accent-color">Couleur d'accent</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    id="accent-color"
                    value={local.colors.accent}
                    onChange={(e) => updateColors({ accent: e.target.value })}
                    className="w-12 h-10 rounded border border-border cursor-pointer"
                  />
                  <Input
                    value={local.colors.accent}
                    onChange={(e) => updateColors({ accent: e.target.value })}
                    className="flex-1"
                    placeholder="#10b981"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Texts Tab */}
          <TabsContent value="texts" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tagline">Slogan / Sous-titre</Label>
              <Input
                id="tagline"
                value={local.texts.tagline}
                onChange={(e) => updateTexts({ tagline: e.target.value })}
                placeholder="Ex: Spécialiste du lavage premium depuis 2010"
              />
              <p className="text-xs text-muted-foreground">Affiché sous le nom de votre centre</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cta-button">Texte du bouton principal</Label>
              <Input
                id="cta-button"
                value={local.texts.cta_button}
                onChange={(e) => updateTexts({ cta_button: e.target.value })}
                placeholder="Réserver maintenant"
              />
            </div>
          </TabsContent>

          {/* Layout Tab */}
          <TabsContent value="layout" className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-foreground">Afficher les horaires</p>
                <p className="text-sm text-muted-foreground">Montre les heures d'ouverture</p>
              </div>
              <Switch
                checked={local.layout.show_hours}
                onCheckedChange={(checked) => updateLayout({ show_hours: checked })}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-foreground">Afficher l'adresse</p>
                <p className="text-sm text-muted-foreground">Montre l'adresse du centre</p>
              </div>
              <Switch
                checked={local.layout.show_address}
                onCheckedChange={(checked) => updateLayout({ show_address: checked })}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-foreground">Afficher le téléphone</p>
                <p className="text-sm text-muted-foreground">Montre le numéro de téléphone</p>
              </div>
              <Switch
                checked={local.layout.show_phone}
                onCheckedChange={(checked) => updateLayout({ show_phone: checked })}
              />
            </div>

            <div className="flex items-center justify-between py-2 border-t pt-4">
              <div>
                <p className="font-medium text-foreground">Mode sombre</p>
                <p className="text-sm text-muted-foreground">Utilise un thème sombre pour la page</p>
              </div>
              <Switch
                checked={local.layout.dark_mode}
                onCheckedChange={(checked) => updateLayout({ dark_mode: checked })}
              />
            </div>
          </TabsContent>

          {/* Cover Tab */}
          <TabsContent value="cover" className="space-y-4">
            <div>
              <Label className="mb-3 block">Image de couverture</Label>
              <p className="text-sm text-muted-foreground mb-4">
                L'image affichée en haut de votre page de réservation.
              </p>

              {local.cover_url ? (
                <div className="relative">
                  <img
                    src={local.cover_url}
                    alt="Couverture"
                    className="w-full h-40 object-cover rounded-lg border border-border"
                  />
                  {uploadingCover && (
                    <div className="absolute inset-0 bg-background/80 rounded-lg flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  )}
                  <div className="flex gap-2 mt-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverUpload}
                      className="sr-only"
                      id="cover-upload"
                    />
                    <Label
                      htmlFor="cover-upload"
                      className={cn(
                        buttonVariants({ variant: 'outline', size: 'sm' }),
                        uploadingCover && 'pointer-events-none opacity-50',
                        "cursor-pointer"
                      )}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Changer
                    </Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveCover}
                      disabled={uploadingCover}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Image className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground mb-3">
                    Aucune image de couverture
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    className="sr-only"
                    id="cover-upload-empty"
                  />
                  <Label
                    htmlFor="cover-upload-empty"
                    className={cn(
                      buttonVariants({ variant: 'outline', size: 'sm' }),
                      uploadingCover && 'pointer-events-none opacity-50',
                      "cursor-pointer"
                    )}
                  >
                    {uploadingCover ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2" />
                    )}
                    Ajouter une image
                  </Label>
                  <p className="text-xs text-muted-foreground mt-3">
                    JPG, PNG ou WebP. Max 5 Mo. Ratio 16:9 recommandé.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </section>
  );
}
