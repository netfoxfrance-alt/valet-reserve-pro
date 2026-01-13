import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { PageBlock, BlockType, CustomLink } from '@/types/customization';
import { 
  ChevronUp, ChevronDown, Plus, Trash2, GripVertical, Package, ImageIcon, 
  Mail, Type, Upload, X, Loader2, Link2, Clock, MapPin, Phone,
  ShoppingBag, BookOpen, Video, Calendar, FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
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
  onUpdateBlocks: (blocks: PageBlock[]) => void;
  onUpdateLinks: (links: CustomLink[]) => void;
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

const BLOCK_DESCRIPTIONS: Record<BlockType, string> = {
  formules: 'Affiche vos tarifs et formules',
  gallery: 'Galerie, réalisations, avant/après...',
  text_block: 'Bloc de texte personnalisé',
  links: 'Liens vers boutique, réseaux...',
  contact: 'Formulaire pour être contacté',
  hours: "Vos horaires d'ouverture",
  address: 'Votre adresse',
  phone: 'Votre numéro de téléphone',
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

export function BlocksEditor({ 
  blocks, 
  customLinks,
  onUpdateBlocks, 
  onUpdateLinks,
  userId,
  centerAddress,
  centerPhone,
}: BlocksEditorProps) {
  const { toast } = useToast();
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  
  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);

  // Check which singular blocks already exist
  const hasFormules = blocks.some(b => b.type === 'formules');
  const hasContact = blocks.some(b => b.type === 'contact');
  const hasHours = blocks.some(b => b.type === 'hours');
  const hasAddress = blocks.some(b => b.type === 'address');
  const hasPhone = blocks.some(b => b.type === 'phone');
  const hasLinks = blocks.some(b => b.type === 'links');

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
    
    // Set defaults based on type
    if (type === 'gallery') {
      newBlock.images = [];
      newBlock.galleryType = 'gallery';
    } else if (type === 'text_block') {
      newBlock.content = '';
    }
    
    onUpdateBlocks([...blocks, newBlock]);
  };

  const removeBlock = (id: string) => {
    const filtered = blocks.filter(b => b.id !== id);
    onUpdateBlocks(filtered.map((b, i) => ({ ...b, order: i + 1 })));
  };

  const canDelete = (block: PageBlock) => {
    // Can always delete galleries and text blocks
    if (block.type === 'gallery' || block.type === 'text_block') return true;
    // Cannot delete formules (it's the base)
    if (block.type === 'formules') return false;
    // Other types can be deleted
    return true;
  };

  // Image upload for gallery blocks
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

  // Custom Links management
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
          <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-3">
            {customLinks.map((link) => (
              <div key={link.id} className="flex gap-2 items-start">
                <Select
                  value={link.icon || 'link'}
                  onValueChange={(v) => updateLink(link.id, { icon: v as CustomLink['icon'] })}
                >
                  <SelectTrigger className="w-24 h-9 flex-shrink-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LINK_ICONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex items-center gap-2">
                          <opt.icon className="w-3 h-3" />
                          <span className="text-xs">{opt.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            
            {customLinks.length < 6 && (
              <Button
                variant="outline"
                size="sm"
                onClick={addLink}
                className="w-full gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Ajouter un lien
              </Button>
            )}
            <p className="text-xs text-muted-foreground">Max 6 liens</p>
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base font-medium">Éléments de la page</Label>
          <p className="text-sm text-muted-foreground">Ajoutez et ordonnez vos blocs</p>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Plus className="w-4 h-4" />
              Ajouter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Contenu</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => addBlock('gallery')} className="gap-2">
              <ImageIcon className="w-4 h-4" />
              Images
              <span className="ml-auto text-xs text-muted-foreground">∞</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addBlock('text_block')} className="gap-2">
              <Type className="w-4 h-4" />
              Texte
              <span className="ml-auto text-xs text-muted-foreground">∞</span>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Informations</DropdownMenuLabel>
            
            {!hasLinks && (
              <DropdownMenuItem onClick={() => addBlock('links')} className="gap-2">
                <Link2 className="w-4 h-4" />
                Liens
              </DropdownMenuItem>
            )}
            {!hasContact && (
              <DropdownMenuItem onClick={() => addBlock('contact')} className="gap-2">
                <Mail className="w-4 h-4" />
                Formulaire de contact
              </DropdownMenuItem>
            )}
            {!hasHours && (
              <DropdownMenuItem onClick={() => addBlock('hours')} className="gap-2">
                <Clock className="w-4 h-4" />
                Horaires
              </DropdownMenuItem>
            )}
            {!hasAddress && (
              <DropdownMenuItem onClick={() => addBlock('address')} className="gap-2">
                <MapPin className="w-4 h-4" />
                Adresse
              </DropdownMenuItem>
            )}
            {!hasPhone && (
              <DropdownMenuItem onClick={() => addBlock('phone')} className="gap-2">
                <Phone className="w-4 h-4" />
                Téléphone
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {sortedBlocks.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-xl">
          <Package className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Aucun élément ajouté</p>
          <p className="text-sm text-muted-foreground">Cliquez sur "Ajouter" pour commencer</p>
        </div>
      ) : (
        <div className="space-y-3">
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
                    <p className="text-xs text-muted-foreground truncate">
                      {BLOCK_DESCRIPTIONS[block.type]}
                    </p>
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

                  {/* Toggle */}
                  <Switch
                    checked={block.enabled}
                    onCheckedChange={() => toggleBlock(block.id)}
                    className="flex-shrink-0"
                  />

                  {/* Delete */}
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

                {/* Block-specific content */}
                {renderBlockContent(block)}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
