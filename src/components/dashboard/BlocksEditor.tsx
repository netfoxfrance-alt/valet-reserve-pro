import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { PageBlock, BlockType, CustomLink, CenterCustomization, InfoBlockStyle } from '@/types/customization';
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
  reviews: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  ),
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
  reviews: 'Avis',
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

// Google icon component
const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

// TripAdvisor icon component
const TripAdvisorIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#00AF87">
    <path d="M12.006 4.295c-2.67 0-5.338.784-7.645 2.353H0l1.963 2.135a5.997 5.997 0 0 0 4.04 10.43 5.976 5.976 0 0 0 4.075-1.6L12 19.705l1.922-2.09a5.972 5.972 0 0 0 4.072 1.598 5.997 5.997 0 0 0 4.04-10.43L24 6.647h-4.35a13.573 13.573 0 0 0-7.644-2.352zM12 6.255a11.31 11.31 0 0 1 4.786 1.058 5.976 5.976 0 0 0-9.573 0A11.31 11.31 0 0 1 12 6.255zm-6.003 3.088a4.008 4.008 0 1 1 0 8.017 4.008 4.008 0 0 1 0-8.017zm12.006 0a4.008 4.008 0 1 1 0 8.017 4.008 4.008 0 0 1 0-8.017zM5.997 11.21a2.143 2.143 0 1 0 0 4.286 2.143 2.143 0 0 0 0-4.286zm12.006 0a2.143 2.143 0 1 0 0 4.286 2.143 2.143 0 0 0 0-4.286z"/>
  </svg>
);

// Categories for the add dialog
const ELEMENT_CATEGORIES = [
  {
    title: 'Informations',
    description: 'Vos coordonnées essentielles',
    items: [
      { type: 'phone' as BlockType, label: 'Téléphone', description: 'Votre numéro', icon: Phone, multiple: false },
      { type: 'address' as BlockType, label: 'Adresse', description: 'Votre localisation', icon: MapPin, multiple: false },
      { type: 'hours' as BlockType, label: 'Horaires', description: "Vos horaires d'ouverture", icon: Clock, multiple: false },
    ],
  },
  {
    title: 'Contenu',
    description: 'Enrichissez votre page',
    items: [
      { type: 'gallery' as BlockType, label: 'Images', description: 'Galerie, réalisations, avant/après', icon: ImageIcon, multiple: true },
      { type: 'text_block' as BlockType, label: 'Texte', description: 'Bloc de texte personnalisé', icon: Type, multiple: true },
    ],
  },
  {
    title: 'Avis clients',
    description: 'Affichez vos notes',
    items: [
      { type: 'reviews' as BlockType, label: 'Avis Google', description: 'Votre note Google', icon: GoogleIcon, multiple: false, reviewPlatform: 'google' as const },
      { type: 'reviews' as BlockType, label: 'Avis TripAdvisor', description: 'Votre note TripAdvisor', icon: TripAdvisorIcon, multiple: false, reviewPlatform: 'tripadvisor' as const },
    ],
  },
  {
    title: 'Liens',
    description: 'Vos réseaux et ressources',
    items: [
      { type: 'links' as BlockType, label: 'Ajouter des liens', description: 'Réseaux sociaux, boutique...', icon: Link2, multiple: false, hasSubmenu: true },
    ],
  },
  {
    title: 'Contact',
    description: 'Facilitez les échanges',
    items: [
      { type: 'contact' as BlockType, label: 'Formulaire de contact', description: 'Pour être contacté', icon: Mail, multiple: false },
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
  const hasGoogleReviews = blocks.some(b => b.type === 'reviews' && b.reviewPlatform === 'google');
  const hasTripAdvisorReviews = blocks.some(b => b.type === 'reviews' && b.reviewPlatform === 'tripadvisor');

  const isBlockAvailable = (type: BlockType, multiple: boolean, reviewPlatform?: 'google' | 'tripadvisor') => {
    if (multiple) return true;
    switch (type) {
      case 'contact': return !hasContact;
      case 'hours': return !hasHours;
      case 'address': return !hasAddress;
      case 'phone': return !hasPhone;
      case 'links': return !hasLinks;
      case 'reviews':
        if (reviewPlatform === 'google') return !hasGoogleReviews;
        if (reviewPlatform === 'tripadvisor') return !hasTripAdvisorReviews;
        return true;
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

  const updateBlockInfoStyle = (id: string, infoStyle: InfoBlockStyle) => {
    onUpdateBlocks(blocks.map(b => 
      b.id === id ? { ...b, infoStyle } : b
    ));
  };

  // Update review block properties
  const updateReviewBlock = (id: string, updates: { reviewUrl?: string; reviewRating?: number; reviewCount?: number }) => {
    onUpdateBlocks(blocks.map(b => 
      b.id === id ? { ...b, ...updates } : b
    ));
  };

  // Style selector for info blocks (phone, address, hours)
  const INFO_STYLES: { value: InfoBlockStyle; label: string; preview: string }[] = [
    { value: 'minimal', label: 'Minimal', preview: 'Discret' },
    { value: 'pill', label: 'Pill', preview: 'Badge' },
    { value: 'card', label: 'Carte', preview: 'Complet' },
  ];

  const renderStyleSelector = (block: PageBlock) => (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
      <Label className="text-xs text-muted-foreground">Style :</Label>
      <div className="flex gap-1.5 flex-wrap">
        {INFO_STYLES.map((style) => (
          <button
            key={style.value}
            onClick={() => updateBlockInfoStyle(block.id, style.value)}
            className={cn(
              "px-3 py-1.5 text-xs rounded-lg border transition-all",
              (block.infoStyle || 'minimal') === style.value
                ? "border-primary bg-primary/10 text-primary font-medium"
                : "border-border hover:border-muted-foreground text-muted-foreground"
            )}
          >
            {style.label}
          </button>
        ))}
      </div>
    </div>
  );

  const addBlock = (type: BlockType, reviewPlatform?: 'google' | 'tripadvisor') => {
    const maxOrder = Math.max(...blocks.map(b => b.order), 0);
    const newBlock: PageBlock = {
      id: `${type}_${reviewPlatform || ''}_${Date.now()}`,
      type,
      title: reviewPlatform === 'google' ? 'Avis Google' : reviewPlatform === 'tripadvisor' ? 'Avis TripAdvisor' : BLOCK_LABELS[type],
      enabled: true,
      order: maxOrder + 1,
    };
    
    if (type === 'gallery') {
      newBlock.images = [];
      newBlock.galleryType = 'gallery';
    } else if (type === 'text_block') {
      newBlock.content = '';
    } else if (type === 'reviews' && reviewPlatform) {
      newBlock.reviewPlatform = reviewPlatform;
      newBlock.reviewUrl = '';
      newBlock.reviewRating = 5;
      newBlock.reviewCount = 0;
    }
    
    onUpdateBlocks([...blocks, newBlock]);
    setAddDialogOpen(false);
    toast({ title: reviewPlatform === 'google' ? 'Avis Google ajouté' : reviewPlatform === 'tripadvisor' ? 'Avis TripAdvisor ajouté' : `${BLOCK_LABELS[type]} ajouté` });
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
        return (
          <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-4">
            {/* Custom Links Section */}
            {customLinks.length > 0 && (
              <div className="space-y-3">
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
          <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              {centerAddress || 'Adresse non configurée (Paramètres → Informations)'}
            </p>
            {renderStyleSelector(block)}
          </div>
        );

      case 'phone':
        return (
          <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              {centerPhone || 'Téléphone non configuré (Paramètres → Informations)'}
            </p>
            {renderStyleSelector(block)}
          </div>
        );

      case 'hours':
        return (
          <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              Horaires configurés dans Paramètres → Disponibilités
            </p>
            {renderStyleSelector(block)}
          </div>
        );

      case 'reviews':
        const isGoogle = block.reviewPlatform === 'google';
        return (
          <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-3">
            {/* Platform indicator */}
            <div className="flex items-center gap-2 text-sm">
              {isGoogle ? <GoogleIcon /> : <TripAdvisorIcon />}
              <span className="font-medium text-foreground">{isGoogle ? 'Google' : 'TripAdvisor'}</span>
            </div>
            
            {/* URL */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Lien vers votre fiche</Label>
              <Input
                value={block.reviewUrl || ''}
                onChange={(e) => updateReviewBlock(block.id, { reviewUrl: e.target.value })}
                placeholder={isGoogle ? 'https://g.page/...' : 'https://tripadvisor.com/...'}
                className="h-9 text-sm"
              />
            </div>
            
            {/* Rating */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Note (sur 5)</Label>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={block.reviewRating || 5}
                  onChange={(e) => updateReviewBlock(block.id, { reviewRating: parseFloat(e.target.value) || 5 })}
                  className="h-9 text-sm"
                />
              </div>
              
              {/* Review count */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Nombre d'avis</Label>
                <Input
                  type="number"
                  min="0"
                  value={block.reviewCount || 0}
                  onChange={(e) => updateReviewBlock(block.id, { reviewCount: parseInt(e.target.value) || 0 })}
                  className="h-9 text-sm"
                />
              </div>
            </div>
            
            {/* Preview */}
            <div className="mt-2 p-3 rounded-xl bg-muted/30 border">
              <p className="text-xs text-muted-foreground mb-1">Aperçu</p>
              <div className="flex items-center gap-2">
                {isGoogle ? <GoogleIcon /> : <TripAdvisorIcon />}
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={cn(
                        "w-3.5 h-3.5",
                        i < Math.floor(block.reviewRating || 5) ? "text-yellow-400" : "text-gray-300"
                      )}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  ))}
                  <span className="text-sm font-medium ml-1">{block.reviewRating || 5}</span>
                  <span className="text-xs text-muted-foreground">({block.reviewCount || 0} avis)</span>
                </div>
              </div>
            </div>
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

      {/* Social Links as separate visible items */}
      {(social.instagram || social.tiktok || social.facebook || social.email) && (
        <div className="space-y-3">
          <Label className="text-sm font-medium text-muted-foreground">Réseaux sociaux & liens</Label>
          {social.instagram && (
            <div className="border rounded-xl bg-background border-border overflow-hidden">
              <div className="flex items-center gap-3 p-3 sm:p-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                  <Instagram className="w-4 h-4 text-pink-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Instagram</p>
                  <Input
                    value={social.instagram === ' ' ? '' : social.instagram}
                    onChange={(e) => onUpdateSocial({ ...social, instagram: e.target.value || ' ' })}
                    placeholder="@username ou https://instagram.com/..."
                    className="h-8 text-sm"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onUpdateSocial({ ...social, instagram: '' })}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive flex-shrink-0 self-end"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
          {social.tiktok && (
            <div className="border rounded-xl bg-background border-border overflow-hidden">
              <div className="flex items-center gap-3 p-3 sm:p-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-foreground/5">
                  <svg className="w-4 h-4 text-foreground" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground mb-1">TikTok</p>
                  <Input
                    value={social.tiktok === ' ' ? '' : social.tiktok}
                    onChange={(e) => onUpdateSocial({ ...social, tiktok: e.target.value || ' ' })}
                    placeholder="@username ou https://tiktok.com/@..."
                    className="h-8 text-sm"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onUpdateSocial({ ...social, tiktok: '' })}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive flex-shrink-0 self-end"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
          {social.facebook && (
            <div className="border rounded-xl bg-background border-border overflow-hidden">
              <div className="flex items-center gap-3 p-3 sm:p-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-blue-500/10">
                  <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Facebook</p>
                  <Input
                    value={social.facebook === ' ' ? '' : social.facebook}
                    onChange={(e) => onUpdateSocial({ ...social, facebook: e.target.value || ' ' })}
                    placeholder="https://facebook.com/votrepage"
                    className="h-8 text-sm"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onUpdateSocial({ ...social, facebook: '' })}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive flex-shrink-0 self-end"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
          {social.email && (
            <div className="border rounded-xl bg-background border-border overflow-hidden">
              <div className="flex items-center gap-3 p-3 sm:p-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'hsl(var(--primary) / 0.1)' }}>
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Adresse email</p>
                  <Input
                    value={social.email === ' ' ? '' : social.email}
                    onChange={(e) => onUpdateSocial({ ...social, email: e.target.value || ' ' })}
                    placeholder="contact@votreentreprise.com"
                    className="h-8 text-sm"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onUpdateSocial({ ...social, email: '' })}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive flex-shrink-0 self-end"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Element Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-md max-h-[85vh] flex flex-col" aria-describedby={undefined}>
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Ajouter un élément</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-5 mt-4 overflow-y-auto flex-1 pr-2">
            {!linksSubmenuOpen ? (
              // Main menu
              <>
                {ELEMENT_CATEGORIES.map((category, idx) => (
                  <div key={category.title}>
                    {idx > 0 && <div className="border-t mb-4" />}
                    <div className="mb-3">
                      <Label className="text-sm font-semibold text-foreground">
                        {category.title}
                      </Label>
                      {'description' in category && (
                        <p className="text-xs text-muted-foreground mt-0.5">{category.description}</p>
                      )}
                    </div>
                    <div className="grid gap-2">
                      {category.items.map((item) => {
                        const reviewPlatform = 'reviewPlatform' in item ? item.reviewPlatform : undefined;
                        const available = isBlockAvailable(item.type, item.multiple, reviewPlatform);
                        const hasSubmenu = 'hasSubmenu' in item && item.hasSubmenu;
                        const itemKey = reviewPlatform ? `${item.type}_${reviewPlatform}` : item.type;
                        
                        return (
                          <button
                            key={itemKey}
                            onClick={() => {
                              if (!available) return;
                              if (hasSubmenu) {
                                setLinksSubmenuOpen(true);
                              } else {
                                addBlock(item.type, reviewPlatform);
                              }
                            }}
                            disabled={!available}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                              available 
                                ? "hover:border-primary hover:bg-primary/5 cursor-pointer" 
                                : "opacity-50 cursor-not-allowed bg-muted/30"
                            )}
                          >
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                              available ? "bg-primary/10" : "bg-muted"
                            )}>
                              <item.icon className={cn("w-5 h-5", available ? "text-primary" : "text-muted-foreground")} />
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
                {/* Bottom padding for scroll */}
                <div className="h-4" />
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
