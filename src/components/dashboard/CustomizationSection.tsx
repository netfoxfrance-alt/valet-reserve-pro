import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CenterCustomization, CustomLink, defaultCustomization } from '@/types/customization';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Palette, Type, Layout, Image, Upload, Trash2, Loader2, Share2, Instagram, Mail, ImagePlus, X, Search, Globe, MapPin, Tag, Package, Link2, Plus, ShoppingBag, BookOpen, Video, Calendar, FileText, ChevronUp, ChevronDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Pack } from '@/hooks/useCenter';
import { Checkbox } from '@/components/ui/checkbox';

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

export function CustomizationSection({ centerId, userId, customization, onUpdate, packs = [] }: CustomizationSectionProps) {
  const { toast } = useToast();
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [local, setLocal] = useState<CenterCustomization>(customization);

  // Sync local state when prop changes from parent (e.g., from DB load)
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

  // If no visible_pack_ids set yet, all packs are visible by default
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
      // Extract path from URL
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
        <Tabs defaultValue="colors" className="w-full">
          {/* Mobile: horizontal scroll with labels */}
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 mb-6">
            <TabsList className="inline-flex sm:grid sm:grid-cols-9 gap-1 sm:gap-0 w-max sm:w-full bg-muted/50 p-1 rounded-lg">
              <TabsTrigger value="colors" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5 px-3 py-2 sm:py-1.5 text-xs whitespace-nowrap">
                <Palette className="w-4 h-4" />
                <span>Couleurs</span>
              </TabsTrigger>
              <TabsTrigger value="texts" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5 px-3 py-2 sm:py-1.5 text-xs whitespace-nowrap">
                <Type className="w-4 h-4" />
                <span>Textes</span>
              </TabsTrigger>
              <TabsTrigger value="links" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5 px-3 py-2 sm:py-1.5 text-xs whitespace-nowrap">
                <Link2 className="w-4 h-4" />
                <span>Liens</span>
              </TabsTrigger>
              <TabsTrigger value="social" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5 px-3 py-2 sm:py-1.5 text-xs whitespace-nowrap">
                <Share2 className="w-4 h-4" />
                <span>Réseaux</span>
              </TabsTrigger>
              <TabsTrigger value="layout" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5 px-3 py-2 sm:py-1.5 text-xs whitespace-nowrap">
                <Layout className="w-4 h-4" />
                <span>Affichage</span>
              </TabsTrigger>
              <TabsTrigger value="packs" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5 px-3 py-2 sm:py-1.5 text-xs whitespace-nowrap">
                <Package className="w-4 h-4" />
                <span>Formules</span>
              </TabsTrigger>
              <TabsTrigger value="cover" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5 px-3 py-2 sm:py-1.5 text-xs whitespace-nowrap">
                <Image className="w-4 h-4" />
                <span>Image</span>
              </TabsTrigger>
              <TabsTrigger value="gallery" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5 px-3 py-2 sm:py-1.5 text-xs whitespace-nowrap">
                <ImagePlus className="w-4 h-4" />
                <span>Galerie</span>
              </TabsTrigger>
              <TabsTrigger value="seo" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5 px-3 py-2 sm:py-1.5 text-xs whitespace-nowrap">
                <Search className="w-4 h-4" />
                <span>SEO</span>
              </TabsTrigger>
            </TabsList>
          </div>

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
              <Label htmlFor="welcome-message">Phrase d'accueil</Label>
              <Input
                id="welcome-message"
                value={local.texts.welcome_message || ''}
                onChange={(e) => updateTexts({ welcome_message: e.target.value })}
                placeholder="Ex: Réservez votre rendez-vous en quelques clics"
              />
              <p className="text-xs text-muted-foreground">Affiché en haut de votre page de réservation</p>
            </div>

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
                placeholder="Racontez l'histoire de votre entreprise, votre passion, vos valeurs..."
                rows={4}
              />
              <p className="text-xs text-muted-foreground">Texte affiché sur votre page publique pour présenter votre activité</p>
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
          </TabsContent>

          {/* Custom Links Tab */}
          <TabsContent value="links" className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Liens personnalisés</Label>
                  <p className="text-xs text-muted-foreground">Ajoutez des liens vers votre boutique, ebook, vidéos, etc.</p>
                </div>
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
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  <Link2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Aucun lien personnalisé</p>
                  <p className="text-xs">Cliquez sur "Ajouter" pour créer un lien</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(local.custom_links || []).map((link, index) => (
                    <div key={link.id} className="p-3 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveCustomLink(link.id, 'up')}
                            disabled={index === 0}
                            className="h-8 w-8 p-0"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveCustomLink(link.id, 'down')}
                            disabled={index === (local.custom_links?.length || 0) - 1}
                            className="h-8 w-8 p-0"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                        </div>
                        <Select
                          value={link.icon || 'link'}
                          onValueChange={(value) => updateCustomLink(link.id, { icon: value as CustomLink['icon'] })}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="link">
                              <div className="flex items-center gap-2">
                                <Link2 className="w-4 h-4" /> Lien
                              </div>
                            </SelectItem>
                            <SelectItem value="shop">
                              <div className="flex items-center gap-2">
                                <ShoppingBag className="w-4 h-4" /> Boutique
                              </div>
                            </SelectItem>
                            <SelectItem value="book">
                              <div className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4" /> Ebook
                              </div>
                            </SelectItem>
                            <SelectItem value="video">
                              <div className="flex items-center gap-2">
                                <Video className="w-4 h-4" /> Vidéo
                              </div>
                            </SelectItem>
                            <SelectItem value="calendar">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" /> Calendrier
                              </div>
                            </SelectItem>
                            <SelectItem value="file">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4" /> Document
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCustomLink(link.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <Input
                        value={link.title}
                        onChange={(e) => updateCustomLink(link.id, { title: e.target.value })}
                        placeholder="Titre du lien (ex: Notre boutique)"
                      />
                      <Input
                        value={link.url}
                        onChange={(e) => updateCustomLink(link.id, { url: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Position selector */}
              {(local.custom_links?.length || 0) > 0 && (
                <div className="pt-4 border-t space-y-2">
                  <Label>Position sur la page</Label>
                  <Select
                    value={local.layout.links_position || 'top'}
                    onValueChange={(value) => updateLayout({ links_position: value as 'top' | 'after_formules' | 'after_gallery' | 'bottom' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top">En haut (après réseaux sociaux)</SelectItem>
                      <SelectItem value="after_formules">Après les formules</SelectItem>
                      <SelectItem value="after_gallery">Après la galerie</SelectItem>
                      <SelectItem value="bottom">En bas (avant formulaire contact)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Choisissez où afficher vos liens sur votre page publique</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Social Tab */}
          <TabsContent value="social" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="social-instagram">Instagram</Label>
              <div className="flex gap-2 items-center">
                <Instagram className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <Input
                  id="social-instagram"
                  value={local.social.instagram}
                  onChange={(e) => updateSocial({ instagram: e.target.value })}
                  placeholder="votre_compte (sans @)"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="social-tiktok">TikTok</Label>
              <div className="flex gap-2 items-center">
                <svg className="w-5 h-5 text-muted-foreground flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
                <Input
                  id="social-tiktok"
                  value={local.social.tiktok}
                  onChange={(e) => updateSocial({ tiktok: e.target.value })}
                  placeholder="votre_compte (sans @)"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="social-facebook">Facebook</Label>
              <div className="flex gap-2 items-center">
                <svg className="w-5 h-5 text-muted-foreground flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <Input
                  id="social-facebook"
                  value={local.social.facebook}
                  onChange={(e) => updateSocial({ facebook: e.target.value })}
                  placeholder="Nom de votre page Facebook"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="social-email">Email de contact</Label>
              <div className="flex gap-2 items-center">
                <Mail className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <Input
                  id="social-email"
                  type="email"
                  value={local.social.email}
                  onChange={(e) => updateSocial({ email: e.target.value })}
                  placeholder="contact@votreentreprise.com"
                />
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground pt-2">
              Ces liens seront affichés sur votre page publique sous forme d'icônes.
            </p>
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
                <p className="font-medium text-foreground">Formulaire de contact</p>
                <p className="text-sm text-muted-foreground">Permet aux visiteurs de vous envoyer une demande</p>
              </div>
              <Switch
                checked={local.layout.show_contact_form}
                onCheckedChange={(checked) => updateLayout({ show_contact_form: checked })}
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

          {/* Packs Tab */}
          <TabsContent value="packs" className="space-y-4">
            {packs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Aucune formule créée</p>
                <p className="text-sm">Créez des formules dans l'onglet "Formules" du tableau de bord.</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Sélectionnez les formules à afficher sur votre page publique.
                </p>
                <div className="space-y-3">
                  {packs.map((pack) => {
                    const isVisible = effectiveVisiblePacks.includes(pack.id);
                    return (
                      <div 
                        key={pack.id}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-lg border transition-colors cursor-pointer",
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
                            <p className="font-medium">{pack.name}</p>
                            {pack.description && (
                              <p className="text-sm text-muted-foreground line-clamp-1">{pack.description}</p>
                            )}
                          </div>
                        </div>
                        <p className="font-semibold text-primary">{pack.price}€</p>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
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

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="space-y-4">
            <div>
              <Label className="mb-3 block">Galerie de réalisations</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Ajoutez jusqu'à 8 photos de vos réalisations pour montrer la qualité de votre travail.
              </p>

              {/* Gallery Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {(local.gallery_images || []).map((url, index) => (
                  <div key={index} className="relative group aspect-square">
                    <img
                      src={url}
                      alt={`Réalisation ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg border border-border"
                    />
                    <button
                      onClick={() => handleRemoveGalleryImage(url)}
                      className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {/* Add Button */}
                {(local.gallery_images || []).length < 8 && (
                  <div className="aspect-square border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleGalleryUpload}
                      className="sr-only"
                      id="gallery-upload"
                    />
                    <Label
                      htmlFor="gallery-upload"
                      className="w-full h-full flex flex-col items-center justify-center cursor-pointer"
                    >
                      {uploadingGallery ? (
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                      ) : (
                        <>
                          <ImagePlus className="w-6 h-6 text-muted-foreground mb-1" />
                          <span className="text-xs text-muted-foreground">Ajouter</span>
                        </>
                      )}
                    </Label>
                  </div>
                )}
              </div>

              <p className="text-xs text-muted-foreground">
                {(local.gallery_images || []).length}/8 images. JPG, PNG ou WebP. Max 5 Mo par image.
              </p>
            </div>
          </TabsContent>

          {/* SEO Tab */}
          <TabsContent value="seo" className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                Personnalisez comment votre page apparaît dans les résultats Google.
              </p>
              
              {/* Google Preview */}
              <div className="p-4 rounded-lg bg-secondary/50 mb-4">
                <p className="text-xs text-muted-foreground mb-3">Aperçu Google</p>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">cleaningpage.com › ...</p>
                  <p className="text-lg text-[#1a0dab] hover:underline cursor-pointer font-medium line-clamp-1">
                    {local.seo?.title || 'Votre titre Google'}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {local.seo?.description || 'Votre description apparaîtra ici...'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="seo-city" className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                Ville
              </Label>
              <Input
                id="seo-city"
                value={local.seo?.city || ''}
                onChange={(e) => updateLocal({ seo: { ...local.seo, city: e.target.value } })}
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
                value={local.seo?.title || ''}
                onChange={(e) => updateLocal({ seo: { ...local.seo, title: e.target.value.slice(0, 60) } })}
                placeholder="Mon Entreprise - Nettoyage professionnel"
                maxLength={60}
              />
              <p className="text-xs text-muted-foreground text-right">
                {(local.seo?.title || '').length}/60
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="seo-description">Description Google (max 160 caractères)</Label>
              <Textarea
                id="seo-description"
                value={local.seo?.description || ''}
                onChange={(e) => updateLocal({ seo: { ...local.seo, description: e.target.value.slice(0, 160) } })}
                placeholder="Décrivez votre activité en incluant votre ville et vos services..."
                rows={3}
                maxLength={160}
              />
              <p className="text-xs text-muted-foreground text-right">
                {(local.seo?.description || '').length}/160
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="seo-keywords" className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-muted-foreground" />
                Mots-clés (séparés par des virgules)
              </Label>
              <Input
                id="seo-keywords"
                value={local.seo?.keywords || ''}
                onChange={(e) => updateLocal({ seo: { ...local.seo, keywords: e.target.value } })}
                placeholder="nettoyage auto, detailing, lavage voiture..."
              />
              <p className="text-xs text-muted-foreground">
                Mots-clés sur lesquels vous souhaitez être trouvé
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </section>
  );
}
