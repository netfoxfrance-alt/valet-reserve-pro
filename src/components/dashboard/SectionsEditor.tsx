import { useState } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { PageSection, defaultSections } from '@/types/customization';
import { ChevronUp, ChevronDown, Plus, Trash2, GripVertical, Package, ImageIcon, Info, Mail, Type, Upload, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SectionsEditorProps {
  sections: PageSection[];
  onUpdate: (sections: PageSection[]) => void;
  userId: string;
}

const SECTION_ICONS: Record<PageSection['type'], React.ElementType> = {
  formules: Package,
  gallery: ImageIcon,
  about: Info,
  contact: Mail,
  text_block: Type,
};

const SECTION_DESCRIPTIONS: Record<PageSection['type'], string> = {
  formules: 'Affiche vos formules et tarifs',
  gallery: 'Affiche vos photos',
  about: 'Texte de présentation',
  contact: 'Formulaire de contact',
  text_block: 'Bloc de texte libre',
};

export function SectionsEditor({ sections, onUpdate, userId }: SectionsEditorProps) {
  const { toast } = useToast();
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  
  // Ensure we have at least default sections
  const currentSections = sections?.length > 0 ? sections : defaultSections;
  const sortedSections = [...currentSections].sort((a, b) => a.order - b.order);

  const moveSection = (id: string, direction: 'up' | 'down') => {
    const index = sortedSections.findIndex(s => s.id === id);
    if (index === -1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sortedSections.length) return;
    
    const newSections = [...sortedSections];
    [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
    
    const reordered = newSections.map((s, i) => ({ ...s, order: i + 1 }));
    onUpdate(reordered);
  };

  const toggleSection = (id: string) => {
    const updated = currentSections.map(s => 
      s.id === id ? { ...s, enabled: !s.enabled } : s
    );
    onUpdate(updated);
  };

  const updateSectionTitle = (id: string, title: string) => {
    const updated = currentSections.map(s => 
      s.id === id ? { ...s, title } : s
    );
    onUpdate(updated);
  };

  const updateSectionContent = (id: string, content: string) => {
    const updated = currentSections.map(s => 
      s.id === id ? { ...s, content } : s
    );
    onUpdate(updated);
  };

  const addTextBlock = () => {
    const maxOrder = Math.max(...currentSections.map(s => s.order), 0);
    const newSection: PageSection = {
      id: `text_block_${Date.now()}`,
      type: 'text_block',
      title: 'Nouvelle section',
      enabled: true,
      order: maxOrder + 1,
      content: '',
    };
    onUpdate([...currentSections, newSection]);
  };

  const addGallery = () => {
    const maxOrder = Math.max(...currentSections.map(s => s.order), 0);
    const newSection: PageSection = {
      id: `gallery_${Date.now()}`,
      type: 'gallery',
      title: 'Nouvelle galerie',
      enabled: true,
      order: maxOrder + 1,
      images: [],
    };
    onUpdate([...currentSections, newSection]);
  };

  const removeSection = (id: string) => {
    const section = currentSections.find(s => s.id === id);
    // Only allow removing user-created sections (text_block and additional galleries)
    const isUserCreated = section?.type === 'text_block' || 
      (section?.type === 'gallery' && section.id !== 'gallery');
    
    if (!isUserCreated) return;
    
    const filtered = currentSections.filter(s => s.id !== id);
    const reordered = filtered.sort((a, b) => a.order - b.order).map((s, i) => ({ ...s, order: i + 1 }));
    onUpdate(reordered);
  };

  const handleImageUpload = async (sectionId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const section = currentSections.find(s => s.id === sectionId);
    if (!section || section.type !== 'gallery') return;

    const currentImages = section.images || [];
    if (currentImages.length + files.length > 8) {
      toast({ title: 'Maximum 8 images par galerie', variant: 'destructive' });
      return;
    }

    setUploadingFor(sectionId);
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
        const fileName = `${userId}/gallery/${sectionId}/${Date.now()}-${i}.${fileExt}`;

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
        const updated = currentSections.map(s => 
          s.id === sectionId ? { ...s, images: [...(s.images || []), ...newUrls] } : s
        );
        onUpdate(updated);
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

  const removeImage = async (sectionId: string, urlToRemove: string) => {
    try {
      const urlObj = new URL(urlToRemove);
      const pathParts = urlObj.pathname.split('/center-gallery/');
      if (pathParts.length > 1) {
        await supabase.storage.from('center-gallery').remove([pathParts[1]]);
      }
      
      const updated = currentSections.map(s => 
        s.id === sectionId ? { ...s, images: (s.images || []).filter(url => url !== urlToRemove) } : s
      );
      onUpdate(updated);
      toast({ title: 'Image supprimée' });
    } catch (error) {
      toast({ title: 'Erreur lors de la suppression', variant: 'destructive' });
    }
  };

  const canDelete = (section: PageSection) => {
    // Can delete text_blocks and user-created galleries (those not with id 'gallery')
    return section.type === 'text_block' || 
      (section.type === 'gallery' && section.id !== 'gallery');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base font-medium">Blocs de la page</Label>
          <p className="text-sm text-muted-foreground">Réordonnez et personnalisez vos blocs</p>
        </div>
      </div>

      <div className="space-y-3">
        {sortedSections.map((section, index) => {
          const Icon = SECTION_ICONS[section.type];
          const isGallery = section.type === 'gallery';
          const isTextContent = section.type === 'text_block' || section.type === 'about';
          const isUploading = uploadingFor === section.id;
          
          return (
            <div 
              key={section.id}
              className={cn(
                "border rounded-xl overflow-hidden transition-all",
                section.enabled 
                  ? "bg-background border-border" 
                  : "bg-muted/30 border-muted opacity-60"
              )}
            >
              {/* Header */}
              <div className="flex items-center gap-2 p-3 sm:p-4">
                <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab flex-shrink-0" />
                
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: section.enabled ? 'hsl(var(--primary) / 0.1)' : undefined }}
                >
                  <Icon className={cn("w-4 h-4", section.enabled ? "text-primary" : "text-muted-foreground")} />
                </div>

                <div className="flex-1 min-w-0">
                  <Input
                    value={section.title}
                    onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                    className="h-8 text-sm font-medium border-0 bg-transparent p-0 focus-visible:ring-0"
                    placeholder="Titre du bloc"
                  />
                  <p className="text-xs text-muted-foreground truncate">
                    {SECTION_DESCRIPTIONS[section.type]}
                  </p>
                </div>

                {/* Move buttons */}
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveSection(section.id, 'up')}
                    disabled={index === 0}
                    className="h-7 w-7 p-0"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveSection(section.id, 'down')}
                    disabled={index === sortedSections.length - 1}
                    className="h-7 w-7 p-0"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </div>

                {/* Toggle */}
                <Switch
                  checked={section.enabled}
                  onCheckedChange={() => toggleSection(section.id)}
                  className="flex-shrink-0"
                />

                {/* Delete */}
                {canDelete(section) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSection(section.id)}
                    className="h-7 w-7 p-0 text-destructive hover:text-destructive flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* Content area for text blocks and about */}
              {isTextContent && section.enabled && (
                <div className="px-3 sm:px-4 pb-3 sm:pb-4">
                  <Textarea
                    value={section.content || ''}
                    onChange={(e) => updateSectionContent(section.id, e.target.value)}
                    placeholder="Écrivez votre texte ici..."
                    rows={3}
                    className="resize-none text-sm"
                  />
                </div>
              )}

              {/* Image gallery for gallery sections */}
              {isGallery && section.enabled && (
                <div className="px-3 sm:px-4 pb-3 sm:pb-4">
                  <div className="grid grid-cols-4 gap-2">
                    {(section.images || []).map((url, imgIndex) => (
                      <div key={imgIndex} className="relative group aspect-square">
                        <img
                          src={url}
                          alt={`Image ${imgIndex + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeImage(section.id, url)}
                          className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    
                    {(section.images || []).length < 8 && (
                      <div className="aspect-square border-2 border-dashed border-border rounded-lg flex items-center justify-center">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => handleImageUpload(section.id, e)}
                          className="sr-only"
                          id={`gallery-upload-${section.id}`}
                          disabled={isUploading}
                        />
                        <Label
                          htmlFor={`gallery-upload-${section.id}`}
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
                  <p className="text-xs text-muted-foreground mt-2">
                    {(section.images || []).length}/8 images • Max 5 Mo
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add buttons */}
      <div className="flex flex-wrap gap-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={addGallery}
          className="gap-1.5"
        >
          <ImageIcon className="w-4 h-4" />
          Ajouter galerie
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={addTextBlock}
          className="gap-1.5"
        >
          <Type className="w-4 h-4" />
          Ajouter texte
        </Button>
      </div>
    </div>
  );
}
