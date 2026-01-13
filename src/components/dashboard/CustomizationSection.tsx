import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CenterCustomization, CustomLink, defaultCustomization, PageSection, defaultSections } from '@/types/customization';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Palette, Type, Image, Upload, Trash2, Loader2, Share2, Instagram, Mail, ImagePlus, X, Search, Globe, MapPin, Tag, Package, Link2, Plus, ShoppingBag, BookOpen, Video, Calendar, FileText, ChevronUp, ChevronDown, Settings2, Paintbrush } from 'lucide-react';
import { SectionsEditor } from './SectionsEditor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Pack } from '@/hooks/useCenter';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface CustomizationSectionProps {
  centerId: string;
  userId: string;
  customization: CenterCustomization;
  onUpdate: (customization: CenterCustomization) => void;
  packs?: Pack[];
}

const COLOR_PRESETS = [
  { name: 'Bleu', primary: '#3b82f6', secondary: '#1e293b', accent: '#10b981' },
  { name: 'Rouge', primary: '#ef4444', secondary: '#1c1917', accent: '#f59e0b' },
  { name: 'Vert', primary: '#22c55e', secondary: '#14532d', accent: '#3b82f6' },
  { name: 'Violet', primary: '#8b5cf6', secondary: '#1e1b4b', accent: '#ec4899' },
  { name: 'Orange', primary: '#f97316', secondary: '#431407', accent: '#06b6d4' },
  { name: 'Rose', primary: '#ec4899', secondary: '#500724', accent: '#8b5cf6' },
];

// Collapsible Section Component for better organization
function CollapsibleSection({ 
  title, 
  icon: Icon, 
  children, 
  defaultOpen = false 
}: { 
  title: string; 
  icon: React.ElementType; 
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-secondary/30 rounded-xl hover:bg-secondary/50 transition-colors group">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Icon className="w-4 h-4" />
          </div>
          <span className="font-medium text-foreground">{title}</span>
        </div>
        <ChevronDown className={cn(
          "w-5 h-5 text-muted-foreground transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </CollapsibleTrigger>
      <CollapsibleContent className="px-4 pb-4 pt-3 space-y-4">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

export function CustomizationSection({ centerId, userId, customization, onUpdate, packs = [] }: CustomizationSectionProps) {
  const { toast } = useToast();
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [local, setLocal] = useState<CenterCustomization>(customization);

  useEffect(() => {
    setLocal(customization);
  }, [customization]);

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

  const addCustomLink = () => {
    const newLink: CustomLink = {
      id: crypto.randomUUID(),
      title: '',
      url: '',
      icon: 'link',
    };
    updateLocal({ custom_links: [...(local.custom_links || []), newLink] });
  };

  const updateCustomLink = (id: string, updates: Partial<CustomLink>) => {
    const updatedLinks = (local.custom_links || []).map(link =>
      link.id === id ? { ...link, ...updates } : link
    );
    updateLocal({ custom_links: updatedLinks });
  };

  const removeCustomLink = (id: string) => {
    updateLocal({ custom_links: (local.custom_links || []).filter(link => link.id !== id) });
  };

  const moveCustomLink = (id: string, direction: 'up' | 'down') => {
    const links = [...(local.custom_links || [])];
    const index = links.findIndex(link => link.id === id);
    if (index === -1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= links.length) return;
    
    [links[index], links[newIndex]] = [links[newIndex], links[index]];
    updateLocal({ custom_links: links });
  };

  const applyPreset = (preset: typeof COLOR_PRESETS[0]) => {
    updateColors({
      primary: preset.primary,
      secondary: preset.secondary,
      accent: preset.accent,
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

  const handleGalleryUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const currentImages = local.gallery_images || [];
    if (currentImages.length + files.length > 8) {
      toast({ title: 'Erreur', description: 'Maximum 8 images dans la galerie.', variant: 'destructive' });
      return;
    }

    setUploadingGallery(true);
    const newUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (!file.type.startsWith('image/')) continue;
        if (file.size > 5 * 1024 * 1024) continue;

        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/gallery/${Date.now()}-${i}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('center-gallery')
          .upload(fileName, file);

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('center-gallery')
            .getPublicUrl(fileName);
          newUrls.push(publicUrl);
        }
      }

      if (newUrls.length > 0) {
        updateLocal({ gallery_images: [...currentImages, ...newUrls] });
        toast({ title: `${newUrls.length} image(s) ajoutée(s)` });
      }
    } catch (error) {
      console.error('Gallery upload error:', error);
      toast({ title: 'Erreur', description: 'Impossible de télécharger les images.', variant: 'destructive' });
    } finally {
      setUploadingGallery(false);
      event.target.value = '';
    }
  };

  const handleRemoveGalleryImage = async (urlToRemove: string) => {
    try {
      const urlObj = new URL(urlToRemove);
      const pathParts = urlObj.pathname.split('/center-gallery/');
      if (pathParts.length > 1) {
        await supabase.storage.from('center-gallery').remove([pathParts[1]]);
      }
      
      const updatedImages = (local.gallery_images || []).filter(url => url !== urlToRemove);
      updateLocal({ gallery_images: updatedImages });
      toast({ title: 'Image supprimée' });
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de supprimer l\'image.', variant: 'destructive' });
    }
  };

  return (
    <section className="mb-6 sm:mb-8">
      <Card variant="elevated" className="p-4 sm:p-6">
        <Tabs defaultValue="content" className="w-full">
          {/* Simplified 3-tab navigation */}
          <div className="mb-6">
            <TabsList className="grid grid-cols-3 gap-1 w-full bg-muted/50 p-1.5 rounded-xl h-auto">
              <TabsTrigger value="content" className="flex items-center justify-center gap-2 px-3 py-3 text-sm rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Type className="w-4 h-4" />
                <span>Contenu</span>
              </TabsTrigger>
              <TabsTrigger value="appearance" className="flex items-center justify-center gap-2 px-3 py-3 text-sm rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Paintbrush className="w-4 h-4" />
                <span>Apparence</span>
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center justify-center gap-2 px-3 py-3 text-sm rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Settings2 className="w-4 h-4" />
                <span>Avancé</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ==================== CONTENT TAB ==================== */}
          <TabsContent value="content" className="space-y-3">
            {/* Texts Section */}
            <CollapsibleSection title="Textes" icon={Type} defaultOpen={true}>
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
                <Label htmlFor="about">À propos / Histoire</Label>
                <Textarea
                  id="about"
                  value={local.texts.about || ''}
                  onChange={(e) => updateTexts({ about: e.target.value })}
                  placeholder="Racontez l'histoire de votre entreprise..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cta-button">Texte du bouton principal</Label>
                <Input
                  id="cta-button"
                  value={local.texts.cta_button}
                  onChange={(e) => updateTexts({ cta_button: e.target.value })}
                  placeholder="Réserver"
                />
              </div>
            </CollapsibleSection>

            {/* Sections Section */}
            <CollapsibleSection title="Ordre des sections" icon={ChevronUp} defaultOpen={false}>
              <SectionsEditor
                sections={local.sections || defaultSections}
                onUpdate={(sections) => updateLocal({ sections })}
              />
              
              {/* Info cards toggles */}
              <div className="pt-4 border-t space-y-3">
                <Label className="text-sm font-medium">Infos affichées</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-background">
                    <span className="text-sm">Horaires</span>
                    <Switch
                      checked={local.layout.show_hours}
                      onCheckedChange={(checked) => updateLayout({ show_hours: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-background">
                    <span className="text-sm">Adresse</span>
                    <Switch
                      checked={local.layout.show_address}
                      onCheckedChange={(checked) => updateLayout({ show_address: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-background">
                    <span className="text-sm">Téléphone</span>
                    <Switch
                      checked={local.layout.show_phone}
                      onCheckedChange={(checked) => updateLayout({ show_phone: checked })}
                    />
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            {/* Social Links Section */}
            <CollapsibleSection title="Réseaux sociaux" icon={Share2} defaultOpen={false}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm">
                    <Instagram className="w-4 h-4" /> Instagram
                  </Label>
                  <Input
                    value={local.social.instagram}
                    onChange={(e) => updateSocial({ instagram: e.target.value })}
                    placeholder="votre_compte"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                    </svg>
                    TikTok
                  </Label>
                  <Input
                    value={local.social.tiktok}
                    onChange={(e) => updateSocial({ tiktok: e.target.value })}
                    placeholder="votre_compte"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </Label>
                  <Input
                    value={local.social.facebook}
                    onChange={(e) => updateSocial({ facebook: e.target.value })}
                    placeholder="votre_page"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4" /> Email
                  </Label>
                  <Input
                    type="email"
                    value={local.social.email}
                    onChange={(e) => updateSocial({ email: e.target.value })}
                    placeholder="contact@example.com"
                  />
                </div>
              </div>
            </CollapsibleSection>

            {/* Custom Links Section */}
            <CollapsibleSection title="Liens personnalisés" icon={Link2} defaultOpen={false}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Boutique, ebook, vidéos...</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addCustomLink}
                    disabled={(local.custom_links?.length || 0) >= 6}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Ajouter
                  </Button>
                </div>

                {(local.custom_links || []).length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg">
                    <Link2 className="w-6 h-6 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Aucun lien</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(local.custom_links || []).map((link, index) => (
                      <div key={link.id} className="p-3 border rounded-lg space-y-2 bg-background">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-0.5">
                            <Button variant="ghost" size="sm" onClick={() => moveCustomLink(link.id, 'up')} disabled={index === 0} className="h-7 w-7 p-0">
                              <ChevronUp className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => moveCustomLink(link.id, 'down')} disabled={index === (local.custom_links?.length || 0) - 1} className="h-7 w-7 p-0">
                              <ChevronDown className="w-3 h-3" />
                            </Button>
                          </div>
                          <Select value={link.icon || 'link'} onValueChange={(value) => updateCustomLink(link.id, { icon: value as CustomLink['icon'] })}>
                            <SelectTrigger className="w-28 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="link"><div className="flex items-center gap-2"><Link2 className="w-3 h-3" /> Lien</div></SelectItem>
                              <SelectItem value="shop"><div className="flex items-center gap-2"><ShoppingBag className="w-3 h-3" /> Boutique</div></SelectItem>
                              <SelectItem value="book"><div className="flex items-center gap-2"><BookOpen className="w-3 h-3" /> Ebook</div></SelectItem>
                              <SelectItem value="video"><div className="flex items-center gap-2"><Video className="w-3 h-3" /> Vidéo</div></SelectItem>
                              <SelectItem value="calendar"><div className="flex items-center gap-2"><Calendar className="w-3 h-3" /> RDV</div></SelectItem>
                              <SelectItem value="file"><div className="flex items-center gap-2"><FileText className="w-3 h-3" /> Doc</div></SelectItem>
                            </SelectContent>
                          </Select>
                          <Input value={link.title} onChange={(e) => updateCustomLink(link.id, { title: e.target.value })} placeholder="Titre" className="flex-1 h-8" />
                          <Button variant="ghost" size="sm" onClick={() => removeCustomLink(link.id)} className="text-destructive h-7 w-7 p-0">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                        <Input value={link.url} onChange={(e) => updateCustomLink(link.id, { url: e.target.value })} placeholder="https://..." className="h-8" />
                      </div>
                    ))}
                  </div>
                )}

                {(local.custom_links?.length || 0) > 0 && (
                  <div className="pt-3 border-t">
                    <Label className="text-sm mb-2 block">Position sur la page</Label>
                    <Select value={local.layout.links_position || 'top'} onValueChange={(value) => updateLayout({ links_position: value as 'top' | 'after_formules' | 'after_gallery' | 'bottom' })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="top">En haut</SelectItem>
                        <SelectItem value="after_formules">Après les formules</SelectItem>
                        <SelectItem value="after_gallery">Après la galerie</SelectItem>
                        <SelectItem value="bottom">En bas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CollapsibleSection>
          </TabsContent>

          {/* ==================== APPEARANCE TAB ==================== */}
          <TabsContent value="appearance" className="space-y-3">
            {/* Colors Section */}
            <CollapsibleSection title="Couleurs" icon={Palette} defaultOpen={true}>
              <div>
                <Label className="text-sm font-medium mb-3 block">Thèmes prédéfinis</Label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
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
                      <div className="flex gap-1 justify-center mb-1">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.primary }} />
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.secondary }} />
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.accent }} />
                      </div>
                      <p className="text-[10px] text-center text-muted-foreground">{preset.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Principale</Label>
                  <div className="flex gap-2">
                    <input type="color" value={local.colors.primary} onChange={(e) => updateColors({ primary: e.target.value })} className="w-10 h-9 rounded border cursor-pointer" />
                    <Input value={local.colors.primary} onChange={(e) => updateColors({ primary: e.target.value })} className="flex-1 h-9 text-xs" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Secondaire</Label>
                  <div className="flex gap-2">
                    <input type="color" value={local.colors.secondary} onChange={(e) => updateColors({ secondary: e.target.value })} className="w-10 h-9 rounded border cursor-pointer" />
                    <Input value={local.colors.secondary} onChange={(e) => updateColors({ secondary: e.target.value })} className="flex-1 h-9 text-xs" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Accent</Label>
                  <div className="flex gap-2">
                    <input type="color" value={local.colors.accent} onChange={(e) => updateColors({ accent: e.target.value })} className="w-10 h-9 rounded border cursor-pointer" />
                    <Input value={local.colors.accent} onChange={(e) => updateColors({ accent: e.target.value })} className="flex-1 h-9 text-xs" />
                  </div>
                </div>
              </div>

              {/* Text Colors */}
              <div className="pt-3 border-t">
                <Label className="text-sm font-medium mb-2 block">Couleurs de texte</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Titres</Label>
                    <div className="flex gap-2">
                      <input type="color" value={local.colors.text_primary || '#111827'} onChange={(e) => updateColors({ text_primary: e.target.value })} className="w-10 h-9 rounded border cursor-pointer" />
                      <Input value={local.colors.text_primary || '#111827'} onChange={(e) => updateColors({ text_primary: e.target.value })} className="flex-1 h-9 text-xs" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Descriptions</Label>
                    <div className="flex gap-2">
                      <input type="color" value={local.colors.text_secondary || '#6b7280'} onChange={(e) => updateColors({ text_secondary: e.target.value })} className="w-10 h-9 rounded border cursor-pointer" />
                      <Input value={local.colors.text_secondary || '#6b7280'} onChange={(e) => updateColors({ text_secondary: e.target.value })} className="flex-1 h-9 text-xs" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Dark Mode */}
              <div className="flex items-center justify-between p-3 rounded-lg border bg-background">
                <div>
                  <p className="font-medium text-sm">Mode sombre</p>
                  <p className="text-xs text-muted-foreground">Thème sombre pour la page</p>
                </div>
                <Switch
                  checked={local.layout.dark_mode}
                  onCheckedChange={(checked) => updateLayout({ dark_mode: checked })}
                />
              </div>
            </CollapsibleSection>

            {/* Cover Image Section */}
            <CollapsibleSection title="Bannière" icon={Image} defaultOpen={false}>
              {local.cover_url ? (
                <div className="relative">
                  <img src={local.cover_url} alt="Couverture" className="w-full h-32 object-cover rounded-lg border" />
                  {uploadingCover && (
                    <div className="absolute inset-0 bg-background/80 rounded-lg flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  )}
                  <div className="flex gap-2 mt-2">
                    <input type="file" accept="image/*" onChange={handleCoverUpload} className="sr-only" id="cover-upload" />
                    <Label htmlFor="cover-upload" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), uploadingCover && 'pointer-events-none opacity-50', "cursor-pointer")}>
                      <Upload className="w-4 h-4 mr-1" /> Changer
                    </Label>
                    <Button variant="ghost" size="sm" onClick={handleRemoveCover} disabled={uploadingCover} className="text-destructive">
                      <Trash2 className="w-4 h-4 mr-1" /> Supprimer
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <Image className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">Aucune bannière</p>
                  <input type="file" accept="image/*" onChange={handleCoverUpload} className="sr-only" id="cover-upload-empty" />
                  <Label htmlFor="cover-upload-empty" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), uploadingCover && 'pointer-events-none opacity-50', "cursor-pointer")}>
                    {uploadingCover ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />}
                    Ajouter
                  </Label>
                </div>
              )}
            </CollapsibleSection>

            {/* Gallery Section */}
            <CollapsibleSection title="Galerie photos" icon={ImagePlus} defaultOpen={false}>
              <p className="text-sm text-muted-foreground mb-3">Jusqu'à 8 photos de vos réalisations.</p>
              
              <div className="grid grid-cols-4 gap-2 mb-3">
                {(local.gallery_images || []).map((url, index) => (
                  <div key={index} className="relative group aspect-square">
                    <img src={url} alt={`Photo ${index + 1}`} className="w-full h-full object-cover rounded-lg border" />
                    <button onClick={() => handleRemoveGalleryImage(url)} className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {(local.gallery_images || []).length < 8 && (
                  <div className="aspect-square border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                    <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="sr-only" id="gallery-upload" />
                    <Label htmlFor="gallery-upload" className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                      {uploadingGallery ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /> : (
                        <>
                          <ImagePlus className="w-5 h-5 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground mt-1">Ajouter</span>
                        </>
                      )}
                    </Label>
                  </div>
                )}
              </div>
              
              <p className="text-xs text-muted-foreground">{(local.gallery_images || []).length}/8 images</p>
            </CollapsibleSection>
          </TabsContent>

          {/* ==================== ADVANCED TAB ==================== */}
          <TabsContent value="advanced" className="space-y-3">
            {/* Visible Packs Section */}
            <CollapsibleSection title="Formules visibles" icon={Package} defaultOpen={true}>
              {packs.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Aucune formule créée</p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground mb-3">Sélectionnez les formules à afficher.</p>
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
                            <Checkbox checked={isVisible} onCheckedChange={() => togglePackVisibility(pack.id)} />
                            <div>
                              <p className="font-medium text-sm">{pack.name}</p>
                              {pack.description && <p className="text-xs text-muted-foreground line-clamp-1">{pack.description}</p>}
                            </div>
                          </div>
                          <p className="font-semibold text-primary text-sm">{pack.price}€</p>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </CollapsibleSection>

            {/* SEO Section */}
            <CollapsibleSection title="Référencement (SEO)" icon={Search} defaultOpen={false}>
              <p className="text-sm text-muted-foreground mb-3">Comment votre page apparaît sur Google.</p>
              
              {/* Google Preview */}
              <div className="p-3 rounded-lg bg-secondary/50 mb-4">
                <p className="text-xs text-muted-foreground mb-2">Aperçu Google</p>
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">cleaningpage.com › ...</p>
                  <p className="text-sm text-[#1a0dab] font-medium line-clamp-1">{local.seo?.title || 'Votre titre Google'}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{local.seo?.description || 'Votre description...'}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-2 text-sm">
                    <MapPin className="w-3 h-3" /> Ville
                  </Label>
                  <Input
                    value={local.seo?.city || ''}
                    onChange={(e) => updateLocal({ seo: { ...local.seo, city: e.target.value } })}
                    placeholder="Paris, Lyon..."
                    className="h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="flex items-center gap-2 text-sm">
                    <Globe className="w-3 h-3" /> Titre ({(local.seo?.title || '').length}/60)
                  </Label>
                  <Input
                    value={local.seo?.title || ''}
                    onChange={(e) => updateLocal({ seo: { ...local.seo, title: e.target.value.slice(0, 60) } })}
                    placeholder="Mon Entreprise - Nettoyage professionnel"
                    maxLength={60}
                    className="h-9"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label className="text-sm">Description ({(local.seo?.description || '').length}/160)</Label>
                  <Textarea
                    value={local.seo?.description || ''}
                    onChange={(e) => updateLocal({ seo: { ...local.seo, description: e.target.value.slice(0, 160) } })}
                    placeholder="Décrivez votre activité..."
                    rows={2}
                    maxLength={160}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="flex items-center gap-2 text-sm">
                    <Tag className="w-3 h-3" /> Mots-clés
                  </Label>
                  <Input
                    value={local.seo?.keywords || ''}
                    onChange={(e) => updateLocal({ seo: { ...local.seo, keywords: e.target.value } })}
                    placeholder="nettoyage auto, detailing..."
                    className="h-9"
                  />
                </div>
              </div>
            </CollapsibleSection>
          </TabsContent>
        </Tabs>
      </Card>
    </section>
  );
}
