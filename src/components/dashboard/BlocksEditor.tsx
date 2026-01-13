import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { PageBlock, BlockType, CustomLink, CenterCustomization } from '@/types/customization';
import { 
  ChevronUp, ChevronDown, Plus, Trash2, GripVertical, Package, ImageIcon, 
  Mail, Type, Upload, X, Loader2, Link2, Clock, MapPin, Phone,
  ShoppingBag, BookOpen, Video, Calendar, FileText, Instagram
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface BlocksEditorProps {
  blocks: PageBlock[];
  customLinks: CustomLink[];
  social: CenterCustomization['social'];
  onUpdateBlocks: (blocks: PageBlock[]) => void;
  onUpdateLinks: (links: CustomLink[]) => void;
  onUpdateSocial: (social: CenterCustomization['social']) => void;
  userId: string;
  centerAddress?: string;
  centerPhone?: string;
}

const BLOCK_ICONS: Record<BlockType, React.ElementType> = {
  formules: Package,
  gallery: ImageIcon,
  text_block: Type,
  links: Link2,
  contact: Mail,
  hours: Clock,
  address: MapPin,
  phone: Phone,
};

const BLOCK_LABELS: Record<BlockType, string> = {
  formules: 'Formules',
  gallery: 'Images',
  text_block: 'Texte',
  links: 'Liens',
  contact: 'Formulaire de contact',
  hours: 'Horaires',
  address: 'Adresse',
  phone: 'Téléphone',
};

const GALLERY_TYPES = [
  { value: 'gallery', label: 'Galerie' },
  { value: 'realizations', label: 'Réalisations' },
  { value: 'before_after', label: 'Avant/Après' },
];

const LINK_ICONS = [
  { value: 'link', label: 'Lien', icon: Link2 },
  { value: 'shop', label: 'Boutique', icon: ShoppingBag },
  { value: 'book', label: 'Ebook', icon: BookOpen },
  { value: 'video', label: 'Vidéo', icon: Video },
  { value: 'calendar', label: 'Calendrier', icon: Calendar },
  { value: 'file', label: 'Document', icon: FileText },
];

// Individual link options for the links submenu - each can be added separately
const INDIVIDUAL_LINK_OPTIONS = [
  { id: 'instagram', label: 'Instagram', placeholder: 'Votre @username', icon: Instagram, socialKey: 'instagram' as const },
  { id: 'tiktok', label: 'TikTok', placeholder: 'Votre @username', icon: Video, socialKey: 'tiktok' as const },
  { id: 'facebook', label: 'Facebook', placeholder: 'URL de votre page', icon: Link2, socialKey: 'facebook' as const },
  { id: 'email', label: 'Email', placeholder: 'votre@email.com', icon: Mail, socialKey: 'email' as const },
  { id: 'shop', label: 'Boutique', placeholder: 'Lien vers votre shop', icon: ShoppingBag, customLink: true },
  { id: 'book', label: 'Ebook / Document', placeholder: 'Lien vers votre ressource', icon: BookOpen, customLink: true },
  { id: 'video', label: 'Vidéo', placeholder: 'YouTube, Vimeo...', icon: Video, customLink: true },
  { id: 'calendar', label: 'Calendrier', placeholder: 'Lien de réservation externe', icon: Calendar, customLink: true },
  { id: 'other', label: 'Autre lien', placeholder: 'Tout autre lien', icon: FileText, customLink: true },
];

// Categories for the add dialog
const ELEMENT_CATEGORIES = [
  {
    title: 'Contenu',
    items: [
      { type: 'gallery' as BlockType, label: 'Images', description: 'Galerie, réalisations, avant/après', icon: ImageIcon, multiple: true },
      { type: 'text_block' as BlockType, label: 'Texte', description: 'Bloc de texte personnalisé', icon: Type, multiple: true },
    ],
  },
  {
    title: 'Liens',
    items: [
      { type: 'links' as BlockType, label: 'Ajouter des liens', description: 'Réseaux sociaux, boutique...', icon: Link2, multiple: false, hasSubmenu: true },
    ],
  },
  {
    title: 'Contact',
    items: [
      { type: 'contact' as BlockType, label: 'Formulaire', description: 'Pour être contacté', icon: Mail, multiple: false },
      { type: 'phone' as BlockType, label: 'Téléphone', description: 'Votre numéro', icon: Phone, multiple: false },
      { type: 'address' as BlockType, label: 'Adresse', description: 'Votre localisation', icon: MapPin, multiple: false },
      { type: 'hours' as BlockType, label: 'Horaires', description: "Vos horaires d'ouverture", icon: Clock, multiple: false },
    ],
  },
];

export function BlocksEditor({ 
  blocks, 
  customLinks,
  social,
  onUpdateBlocks, 
  onUpdateLinks,
  onUpdateSocial,
  userId,
  centerAddress,
  centerPhone,
}: BlocksEditorProps) {
  const { toast } = useToast();
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [linksSubmenuOpen, setLinksSubmenuOpen] = useState(false);
  const [addedLinks, setAddedLinks] = useState<string[]>([]);
  
  // Track which social links are already added
  const getExistingSocialLinks = () => {
    const existing: string[] = [];
    if (social.instagram) existing.push('instagram');
    if (social.tiktok) existing.push('tiktok');
    if (social.facebook) existing.push('facebook');
    if (social.email) existing.push('email');
    return existing;
  };
  
  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);

  // Check which singular blocks already exist
  const hasContact = blocks.some(b => b.type === 'contact');
  const hasHours = blocks.some(b => b.type === 'hours');
  const hasAddress = blocks.some(b => b.type === 'address');
  const hasPhone = blocks.some(b => b.type === 'phone');
  const hasLinks = blocks.some(b => b.type === 'links');

  const isBlockAvailable = (type: BlockType, multiple: boolean) => {
    if (multiple) return true;
    switch (type) {
      case 'contact': return !hasContact;
      case 'hours': return !hasHours;
      case 'address': return !hasAddress;
      case 'phone': return !hasPhone;
      case 'links': return !hasLinks;
      default: return true;
    }
  };

  const moveBlock = (id: string, direction: 'up' | 'down') => {
    const index = sortedBlocks.findIndex(b => b.id === id);
    if (index === -1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sortedBlocks.length) return;
    
    const newBlocks = [...sortedBlocks];
    [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
    
    onUpdateBlocks(newBlocks.map((b, i) => ({ ...b, order: i + 1 })));
  };

  const toggleBlock = (id: string) => {
    onUpdateBlocks(blocks.map(b => 
      b.id === id ? { ...b, enabled: !b.enabled } : b
    ));
  };

  const updateBlockTitle = (id: string, title: string) => {
    onUpdateBlocks(blocks.map(b => 
      b.id === id ? { ...b, title } : b
    ));
  };

  const updateBlockContent = (id: string, content: string) => {
    onUpdateBlocks(blocks.map(b => 
      b.id === id ? { ...b, content } : b
    ));
  };

  const updateGalleryType = (id: string, galleryType: PageBlock['galleryType']) => {
    onUpdateBlocks(blocks.map(b => 
      b.id === id ? { ...b, galleryType } : b
    ));
  };

  const addBlock = (type: BlockType) => {
    const maxOrder = Math.max(...blocks.map(b => b.order), 0);
    const newBlock: PageBlock = {
      id: `${type}_${Date.now()}`,
      type,
      title: BLOCK_LABELS[type],
      enabled: true,
      order: maxOrder + 1,
    };
    
    if (type === 'gallery') {
      newBlock.images = [];
      newBlock.galleryType = 'gallery';
    } else if (type === 'text_block') {
      newBlock.content = '';
    }
    
    onUpdateBlocks([...blocks, newBlock]);
    setAddDialogOpen(false);
    toast({ title: `${BLOCK_LABELS[type]} ajouté` });
  };

  const removeBlock = (id: string) => {
    const filtered = blocks.filter(b => b.id !== id);
    onUpdateBlocks(filtered.map((b, i) => ({ ...b, order: i + 1 })));
  };

  const canDelete = (block: PageBlock) => {
    if (block.type === 'gallery' || block.type === 'text_block') return true;
    if (block.type === 'formules') return false;
    return true;
  };

  // Image upload
  const handleImageUpload = async (blockId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const block = blocks.find(b => b.id === blockId);
    if (!block || block.type !== 'gallery') return;

    const currentImages = block.images || [];
    if (currentImages.length + files.length > 8) {
      toast({ title: 'Maximum 8 images par galerie', variant: 'destructive' });
      return;
    }

    setUploadingFor(blockId);
    const newUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;
        if (file.size > 5 * 1024 * 1024) {
          toast({ title: 'Image trop lourde (max 5 Mo)', variant: 'destructive' });
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/gallery/${blockId}/${Date.now()}-${i}.${fileExt}`;

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
        onUpdateBlocks(blocks.map(b => 
          b.id === blockId ? { ...b, images: [...(b.images || []), ...newUrls] } : b
        ));
        toast({ title: `${newUrls.length} image(s) ajoutée(s)` });
      }
    } catch (error) {
      console.error('Gallery upload error:', error);
      toast({ title: 'Erreur lors du téléchargement', variant: 'destructive' });
    } finally {
      setUploadingFor(null);
      event.target.value = '';
    }
  };

  const removeImage = async (blockId: string, urlToRemove: string) => {
    try {
      const urlObj = new URL(urlToRemove);
      const pathParts = urlObj.pathname.split('/center-gallery/');
      if (pathParts.length > 1) {
        await supabase.storage.from('center-gallery').remove([pathParts[1]]);
      }
      
      onUpdateBlocks(blocks.map(b => 
        b.id === blockId ? { ...b, images: (b.images || []).filter(url => url !== urlToRemove) } : b
      ));
      toast({ title: 'Image supprimée' });
    } catch (error) {
      toast({ title: 'Erreur lors de la suppression', variant: 'destructive' });
    }
  };

  // Custom Links
  const addLink = () => {
    const newLink: CustomLink = {
      id: crypto.randomUUID(),
      title: '',
      url: '',
      icon: 'link',
    };
    onUpdateLinks([...customLinks, newLink]);
  };

  const updateLink = (id: string, updates: Partial<CustomLink>) => {
    onUpdateLinks(customLinks.map(link =>
      link.id === id ? { ...link, ...updates } : link
    ));
  };

  const removeLink = (id: string) => {
    onUpdateLinks(customLinks.filter(link => link.id !== id));
  };

  const renderBlockContent = (block: PageBlock) => {
    if (!block.enabled) return null;

    switch (block.type) {
      case 'gallery':
        const isUploading = uploadingFor === block.id;
        return (
          <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-3">
            <Select
              value={block.galleryType || 'gallery'}
              onValueChange={(v) => updateGalleryType(block.id, v as PageBlock['galleryType'])}
            >
              <SelectTrigger className="w-40 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GALLERY_TYPES.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="grid grid-cols-4 gap-2">
              {(block.images || []).map((url, imgIndex) => (
                <div key={imgIndex} className="relative group aspect-square">
                  <img
                    src={url}
                    alt={`Image ${imgIndex + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeImage(block.id, url)}
                    className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              
              {(block.images || []).length < 8 && (
                <div className="aspect-square border-2 border-dashed border-border rounded-lg flex items-center justify-center">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageUpload(block.id, e)}
                    className="sr-only"
                    id={`gallery-upload-${block.id}`}
                    disabled={isUploading}
                  />
                  <Label
                    htmlFor={`gallery-upload-${block.id}`}
                    className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 rounded-lg transition-colors"
                  >
                    {isUploading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground mt-1">Ajouter</span>
                      </>
                    )}
                  </Label>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {(block.images || []).length}/8 images • Max 5 Mo
            </p>
          </div>
        );

      case 'text_block':
        return (
          <div className="px-3 sm:px-4 pb-3 sm:pb-4">
            <Textarea
              value={block.content || ''}
              onChange={(e) => updateBlockContent(block.id, e.target.value)}
              placeholder="Écrivez votre texte ici..."
              rows={3}
              className="resize-none text-sm"
            />
          </div>
        );

      case 'links':
        // Only show social links that have been added (not empty)
        const hasSocialLinks = social.instagram || social.tiktok || social.facebook || social.email;
        
        return (
          <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-4">
            {/* Social Networks Section - only show added ones */}
            {hasSocialLinks && (
              <div className="space-y-3">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Réseaux sociaux</Label>
                <div className="grid gap-2">
                  {social.instagram !== undefined && social.instagram !== '' && (
                    <div className="flex gap-2 items-center">
                      <Instagram className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <Input
                        value={social.instagram === ' ' ? '' : social.instagram}
                        onChange={(e) => onUpdateSocial({ ...social, instagram: e.target.value || ' ' })}
                        placeholder="Instagram (sans @)"
                        className="h-9 text-sm"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onUpdateSocial({ ...social, instagram: '' })}
                        className="h-9 w-9 p-0 text-destructive hover:text-destructive flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  {social.tiktok !== undefined && social.tiktok !== '' && (
                    <div className="flex gap-2 items-center">
                      <svg className="w-4 h-4 text-muted-foreground flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                      </svg>
                      <Input
                        value={social.tiktok === ' ' ? '' : social.tiktok}
                        onChange={(e) => onUpdateSocial({ ...social, tiktok: e.target.value || ' ' })}
                        placeholder="TikTok (sans @)"
                        className="h-9 text-sm"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onUpdateSocial({ ...social, tiktok: '' })}
                        className="h-9 w-9 p-0 text-destructive hover:text-destructive flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  {social.facebook !== undefined && social.facebook !== '' && (
                    <div className="flex gap-2 items-center">
                      <svg className="w-4 h-4 text-muted-foreground flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      <Input
                        value={social.facebook === ' ' ? '' : social.facebook}
                        onChange={(e) => onUpdateSocial({ ...social, facebook: e.target.value || ' ' })}
                        placeholder="Page Facebook"
                        className="h-9 text-sm"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onUpdateSocial({ ...social, facebook: '' })}
                        className="h-9 w-9 p-0 text-destructive hover:text-destructive flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  {social.email !== undefined && social.email !== '' && (
                    <div className="flex gap-2 items-center">
                      <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <Input
                        value={social.email === ' ' ? '' : social.email}
                        onChange={(e) => onUpdateSocial({ ...social, email: e.target.value || ' ' })}
                        placeholder="Email de contact"
                        className="h-9 text-sm"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onUpdateSocial({ ...social, email: '' })}
                        className="h-9 w-9 p-0 text-destructive hover:text-destructive flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Custom Links Section */}
            {customLinks.length > 0 && (
              <div className={cn("space-y-3", hasSocialLinks && "pt-2 border-t")}>
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Liens personnalisés</Label>
                {customLinks.map((link) => (
                  <div key={link.id} className="flex gap-2 items-start">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {(() => {
                        const iconData = LINK_ICONS.find(i => i.value === link.icon);
                        const IconComp = iconData?.icon || Link2;
                        return <IconComp className="w-4 h-4 text-primary" />;
                      })()}
                    </div>
                    <div className="flex-1 space-y-1">
                      <Input
                        value={link.title}
                        onChange={(e) => updateLink(link.id, { title: e.target.value })}
                        placeholder="Titre"
                        className="h-9 text-sm"
                      />
                      <Input
                        value={link.url}
                        onChange={(e) => updateLink(link.id, { url: e.target.value })}
                        placeholder="https://..."
                        className="h-9 text-sm"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLink(link.id)}
                      className="h-9 w-9 p-0 text-destructive hover:text-destructive flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Add more links button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setLinksSubmenuOpen(true);
                setAddDialogOpen(true);
              }}
              className="w-full gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Ajouter un lien
            </Button>
          </div>
        );

      case 'address':
        return (
          <div className="px-3 sm:px-4 pb-3 sm:pb-4">
            <p className="text-sm text-muted-foreground">
              {centerAddress || 'Adresse non configurée (Paramètres → Informations)'}
            </p>
          </div>
        );

      case 'phone':
        return (
          <div className="px-3 sm:px-4 pb-3 sm:pb-4">
            <p className="text-sm text-muted-foreground">
              {centerPhone || 'Téléphone non configuré (Paramètres → Informations)'}
            </p>
          </div>
        );

      case 'hours':
        return (
          <div className="px-3 sm:px-4 pb-3 sm:pb-4">
            <p className="text-sm text-muted-foreground">
              Horaires configurés dans Paramètres → Disponibilités
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Big Add Button - Linktree style */}
      <button
        onClick={() => setAddDialogOpen(true)}
        className="w-full py-8 border-2 border-dashed border-primary/30 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-primary hover:bg-primary/5 transition-all duration-300 group"
      >
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Plus className="w-7 h-7 text-primary" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-foreground">Ajouter un élément</p>
          <p className="text-sm text-muted-foreground">Images, texte, liens, contact...</p>
        </div>
      </button>

      {/* Current Elements */}
      {sortedBlocks.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium text-muted-foreground">Vos éléments</Label>
          {sortedBlocks.map((block, index) => {
            const Icon = BLOCK_ICONS[block.type];
            
            return (
              <div 
                key={block.id}
                className={cn(
                  "border rounded-xl overflow-hidden transition-all",
                  block.enabled 
                    ? "bg-background border-border" 
                    : "bg-muted/30 border-muted opacity-60"
                )}
              >
                {/* Header */}
                <div className="flex items-center gap-2 p-3 sm:p-4">
                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab flex-shrink-0" />
                  
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: block.enabled ? 'hsl(var(--primary) / 0.1)' : undefined }}
                  >
                    <Icon className={cn("w-4 h-4", block.enabled ? "text-primary" : "text-muted-foreground")} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <Input
                      value={block.title}
                      onChange={(e) => updateBlockTitle(block.id, e.target.value)}
                      className="h-8 text-sm font-medium border-0 bg-transparent p-0 focus-visible:ring-0"
                      placeholder="Titre du bloc"
                    />
                  </div>

                  {/* Move buttons */}
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveBlock(block.id, 'up')}
                      disabled={index === 0}
                      className="h-7 w-7 p-0"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveBlock(block.id, 'down')}
                      disabled={index === sortedBlocks.length - 1}
                      className="h-7 w-7 p-0"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </div>

                  <Switch
                    checked={block.enabled}
                    onCheckedChange={() => toggleBlock(block.id)}
                    className="flex-shrink-0"
                  />

                  {canDelete(block) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeBlock(block.id)}
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {renderBlockContent(block)}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Element Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter un élément</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            {!linksSubmenuOpen ? (
              // Main menu
              <>
                {ELEMENT_CATEGORIES.map((category) => (
                  <div key={category.title}>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3 block">
                      {category.title}
                    </Label>
                    <div className="grid gap-2">
                      {category.items.map((item) => {
                        const available = isBlockAvailable(item.type, item.multiple);
                        const hasSubmenu = 'hasSubmenu' in item && item.hasSubmenu;
                        
                        return (
                          <button
                            key={item.type}
                            onClick={() => {
                              if (!available) return;
                              if (hasSubmenu) {
                                setLinksSubmenuOpen(true);
                              } else {
                                addBlock(item.type);
                              }
                            }}
                            disabled={!available}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                              available 
                                ? "hover:border-primary hover:bg-primary/5 cursor-pointer" 
                                : "opacity-50 cursor-not-allowed"
                            )}
                          >
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <item.icon className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">{item.label}</p>
                              <p className="text-xs text-muted-foreground">{item.description}</p>
                            </div>
                            {!available && (
                              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">Ajouté</span>
                            )}
                            {available && (
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Plus className="w-4 h-4 text-primary" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              // Links submenu - individual selection
              <div>
                <button
                  onClick={() => setLinksSubmenuOpen(false)}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
                >
                  <ChevronUp className="w-4 h-4 rotate-[-90deg]" />
                  Retour
                </button>
                
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3 block">
                  Sélectionnez les liens à ajouter
                </Label>
                
                <div className="grid gap-2">
                  {INDIVIDUAL_LINK_OPTIONS.map((option) => {
                    // Check if this link is already added
                    const existingLinks = getExistingSocialLinks();
                    const isAlreadyAdded = option.socialKey 
                      ? existingLinks.includes(option.id) 
                      : customLinks.some(link => link.icon === option.id);
                    
                    return (
                      <button
                        key={option.id}
                        onClick={() => {
                          if (isAlreadyAdded) return;
                          
                          // Ensure links block exists
                          if (!hasLinks) {
                            addBlock('links');
                          }
                          
                          if (option.socialKey) {
                            // For social links, set a placeholder to mark as "added"
                            onUpdateSocial({ ...social, [option.socialKey]: ' ' });
                          } else if (option.customLink) {
                            // For custom links, add a new link entry
                            const newLink: CustomLink = {
                              id: crypto.randomUUID(),
                              title: option.label,
                              url: '',
                              icon: option.id as CustomLink['icon'],
                            };
                            onUpdateLinks([...customLinks, newLink]);
                          }
                          
                          setLinksSubmenuOpen(false);
                          setAddDialogOpen(false);
                          toast({ title: `${option.label} ajouté` });
                        }}
                        disabled={isAlreadyAdded}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                          isAlreadyAdded 
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:border-primary hover:bg-primary/5 cursor-pointer"
                        )}
                      >
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <option.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{option.label}</p>
                          <p className="text-xs text-muted-foreground">{option.placeholder}</p>
                        </div>
                        {isAlreadyAdded ? (
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">Ajouté</span>
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Plus className="w-4 h-4 text-primary" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
