import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CenterCustomization, defaultCustomization, defaultBlocks, HeaderStyle } from '@/types/customization';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Palette, Image, Upload, Trash2, Loader2, Instagram, Mail, MapPin, Package, Layers, PanelTop, Minus, ChevronDown } from 'lucide-react';
import { BlocksEditor } from './BlocksEditor';
import { cn, stripHtml } from '@/lib/utils';
import { Pack } from '@/hooks/useCenter';
import { Checkbox } from '@/components/ui/checkbox';
import { COLOR_THEMES, ColorTheme } from '@/lib/pageTemplates';

interface CustomizationSectionProps {
  centerId: string;
  userId: string;
  customization: CenterCustomization;
  onUpdate: (customization: CenterCustomization) => void;
  packs?: Pack[];
  centerAddress?: string;
  centerPhone?: string;
}

// Kept for backward compat but now using COLOR_THEMES
const COLOR_PRESETS = COLOR_THEMES.slice(0, 6).map(t => ({
  name: t.name,
  primary: t.colors.primary,
  secondary: t.colors.secondary,
  accent: t.colors.accent,
}));

export function CustomizationSection({ centerId, userId, customization, onUpdate, packs = [], centerAddress, centerPhone }: CustomizationSectionProps) {
  const { toast } = useToast();
  const [uploadingCover, setUploadingCover] = useState(false);
  const [local, setLocal] = useState<CenterCustomization>(customization);
  const [showCustomColors, setShowCustomColors] = useState(false);

  // Sync local state when prop changes from parent
  useEffect(() => {
    setLocal(customization);
  }, [customization]);

  const updateLocal = (updates: Partial<CenterCustomization>) => {
    setLocal(prev => {
      const newCustomization = { ...prev, ...updates };
      onUpdate(newCustomization);
      return newCustomization;
    });
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

  const updateSocial = (social: Partial<CenterCustomization['social']>) => {
    updateLocal({ social: { ...local.social, ...social } });
  };

  const togglePackVisibility = (packId: string) => {
    const currentIds = local.visible_pack_ids || [];
    const newIds = currentIds.includes(packId)
      ? currentIds.filter(id => id !== packId)
      : [...currentIds, packId];
    updateLocal({ visible_pack_ids: newIds });
  };

  const effectiveVisiblePacks = (local.visible_pack_ids?.length ?? 0) > 0 
    ? local.visible_pack_ids 
    : packs.map(p => p.id);

  const applyTheme = (theme: ColorTheme) => {
    updateColors({
      primary: theme.colors.primary,
      secondary: theme.colors.secondary,
      accent: theme.colors.accent,
      text_primary: theme.colors.text_primary,
      text_secondary: theme.colors.text_secondary,
    });
  };

  const currentThemeId = COLOR_THEMES.find(t => t.colors.primary === local.colors.primary)?.id;

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

  const updateSeo = (seo: Partial<CenterCustomization['seo']>) => {
    updateLocal({ seo: { ...local.seo, ...seo } });
  };

  return (
    <section className="mb-6 sm:mb-8">
      <Card variant="elevated" className="p-4 sm:p-6">
        <Tabs defaultValue="design" className="w-full">
          {/* 3 Clean tabs: Design, Formules, Éléments */}
          <div className="mb-6">
            <TabsList className="grid grid-cols-3 gap-1 w-full bg-muted/50 p-1.5 rounded-xl h-auto">
              <TabsTrigger value="design" className="flex flex-col items-center gap-0.5 px-2 py-2.5 text-xs sm:text-sm rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Palette className="w-4 h-4" />
                <span>Design</span>
              </TabsTrigger>
              <TabsTrigger value="formules" className="flex flex-col items-center gap-0.5 px-2 py-2.5 text-xs sm:text-sm rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Package className="w-4 h-4" />
                <span>Formules</span>
              </TabsTrigger>
              <TabsTrigger value="blocks" className="flex flex-col items-center gap-0.5 px-2 py-2.5 text-xs sm:text-sm rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Layers className="w-4 h-4" />
                <span>Éléments</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Design Tab - Banner, Colors only (simplified) */}
          <TabsContent value="design" className="space-y-6">
            {/* Header Style Selector */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Style de page</Label>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { value: 'banner' as HeaderStyle, label: 'Bannière', desc: 'Image de couverture grande', icon: PanelTop },
                  { value: 'minimal' as HeaderStyle, label: 'Minimal', desc: 'Header discret avec logo', icon: Minus },
                ]).map((style) => (
                  <button
                    key={style.value}
                    onClick={() => updateLayout({ header_style: style.value })}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all hover:scale-[1.02]",
                      (local.layout.header_style || 'banner') === style.value
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border hover:border-muted-foreground"
                    )}
                  >
                    <style.icon className="w-6 h-6" />
                    <div className="text-center">
                      <p className="font-medium text-sm">{style.label}</p>
                      <p className="text-[10px] text-muted-foreground leading-tight">{style.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Banner Section - only show when header_style is banner */}
            {(local.layout.header_style || 'banner') === 'banner' && (
            <div>
              <Label className="text-sm font-medium mb-3 block">Bannière</Label>
              {local.cover_url ? (
                <div className="relative">
                  <img
                    src={local.cover_url}
                    alt="Couverture"
                    className="w-full h-32 object-cover rounded-lg border border-border"
                  />
                  {uploadingCover && (
                    <div className="absolute inset-0 bg-background/80 rounded-lg flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  )}
                  <div className="flex gap-2 mt-2">
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
                      <Upload className="w-4 h-4 mr-1.5" />
                      Changer
                    </Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveCover}
                      disabled={uploadingCover}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Image className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">Aucune bannière</p>
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
                      <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 mr-1.5" />
                    )}
                    Ajouter
                  </Label>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Le logo se configure dans Paramètres → Informations
              </p>
            </div>
            )}

            {/* Color Presets */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Couleurs</Label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset)}
                    className={cn(
                      "p-2.5 rounded-lg border-2 transition-all hover:scale-105",
                      local.colors.primary === preset.primary 
                        ? "border-primary ring-2 ring-primary/20" 
                        : "border-border hover:border-muted-foreground"
                    )}
                  >
                    <div className="flex gap-1 mb-1">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.primary }} />
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.secondary }} />
                    </div>
                    <p className="text-[10px] text-center text-muted-foreground">{preset.name}</p>
                  </button>
                ))}
              </div>
              
              {/* Custom Colors */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Principale</Label>
                  <div className="flex gap-1.5">
                    <input
                      type="color"
                      value={local.colors.primary}
                      onChange={(e) => updateColors({ primary: e.target.value })}
                      className="w-10 h-9 rounded border border-border cursor-pointer"
                    />
                    <Input
                      value={local.colors.primary}
                      onChange={(e) => updateColors({ primary: e.target.value })}
                      className="flex-1 h-9 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Titres</Label>
                  <div className="flex gap-1.5">
                    <input
                      type="color"
                      value={local.colors.text_primary || '#111827'}
                      onChange={(e) => updateColors({ text_primary: e.target.value })}
                      className="w-10 h-9 rounded border border-border cursor-pointer"
                    />
                    <Input
                      value={local.colors.text_primary || '#111827'}
                      onChange={(e) => updateColors({ text_primary: e.target.value })}
                      className="flex-1 h-9 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Texte</Label>
                  <div className="flex gap-1.5">
                    <input
                      type="color"
                      value={local.colors.text_secondary || '#6b7280'}
                      onChange={(e) => updateColors({ text_secondary: e.target.value })}
                      className="w-10 h-9 rounded border border-border cursor-pointer"
                    />
                    <Input
                      value={local.colors.text_secondary || '#6b7280'}
                      onChange={(e) => updateColors({ text_secondary: e.target.value })}
                      className="flex-1 h-9 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Dark Mode */}
              <div className="flex items-center justify-between py-3 px-3 rounded-lg border bg-secondary/30 mt-4">
                <div>
                  <p className="font-medium text-sm">Mode sombre</p>
                  <p className="text-xs text-muted-foreground">Thème sombre pour la page</p>
                </div>
                <Switch
                  checked={local.layout.dark_mode}
                  onCheckedChange={(checked) => updateLayout({ dark_mode: checked })}
                />
              </div>

            </div>

            {/* CTA Button Text */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Bouton d'action</Label>
              <Input
                value={local.texts.cta_button}
                onChange={(e) => updateTexts({ cta_button: e.target.value })}
                placeholder="Texte du bouton (ex: Réserver)"
                className="h-10"
              />
              <p className="text-xs text-muted-foreground">
                Ce bouton reste fixé en bas de votre page
              </p>
            </div>

            {/* Tagline */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Slogan</Label>
              <Input
                value={local.texts.tagline}
                onChange={(e) => updateTexts({ tagline: e.target.value })}
                placeholder="Votre slogan ou sous-titre"
                className="h-10"
              />
            </div>
          </TabsContent>

          {/* Formules Tab */}
          <TabsContent value="formules" className="space-y-4">
            {packs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Aucune formule créée</p>
                <p className="text-sm">Créez des formules dans l'onglet "Formules" du menu.</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Sélectionnez les formules visibles sur votre page.
                </p>
                <div className="space-y-2">
                  {packs.map((pack) => {
                    const isVisible = effectiveVisiblePacks.includes(pack.id);
                    return (
                      <div 
                        key={pack.id}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer",
                          isVisible ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground"
                        )}
                        onClick={() => togglePackVisibility(pack.id)}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={isVisible}
                            onCheckedChange={() => togglePackVisibility(pack.id)}
                          />
                          <div>
                            <p className="font-medium text-sm">{pack.name}</p>
                            {pack.description && (
                              <p className="text-xs text-muted-foreground line-clamp-1">{stripHtml(pack.description)}</p>
                            )}
                          </div>
                        </div>
                        <p className="font-semibold text-primary text-sm">
                          {pack.pricing_type === 'quote' 
                            ? 'Sur devis' 
                            : pack.price_variants && pack.price_variants.length > 0 
                              ? `dès ${Math.min(...pack.price_variants.map(v => v.price))}€` 
                              : `${pack.price}€`}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </TabsContent>

          {/* Blocs Tab */}
          <TabsContent value="blocks" className="space-y-4">
            <BlocksEditor
              blocks={local.blocks || defaultBlocks}
              customLinks={local.custom_links || []}
              social={local.social || { instagram: '', tiktok: '', facebook: '', email: '' }}
              onUpdateBlocks={(blocks) => updateLocal({ blocks })}
              onUpdateLinks={(custom_links) => updateLocal({ custom_links })}
              onUpdateSocial={(social) => updateLocal({ social })}
              userId={userId}
              centerAddress={centerAddress}
              centerPhone={centerPhone}
              headerStyle={local.layout?.header_style || 'banner'}
            />
          </TabsContent>

        </Tabs>
      </Card>
    </section>
  );
}
