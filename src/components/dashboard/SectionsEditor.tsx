import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { PageSection, defaultSections } from '@/types/customization';
import { ChevronUp, ChevronDown, Plus, Trash2, GripVertical, Package, ImageIcon, Info, Mail, Type } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionsEditorProps {
  sections: PageSection[];
  onUpdate: (sections: PageSection[]) => void;
}

const SECTION_ICONS: Record<PageSection['type'], React.ElementType> = {
  formules: Package,
  gallery: ImageIcon,
  about: Info,
  contact: Mail,
  text_block: Type,
};

const SECTION_LABELS: Record<PageSection['type'], string> = {
  formules: 'Formules',
  gallery: 'Galerie',
  about: 'À propos',
  contact: 'Contact',
  text_block: 'Bloc de texte',
};

export function SectionsEditor({ sections, onUpdate }: SectionsEditorProps) {
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
    
    // Update order values
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

  const removeSection = (id: string) => {
    const section = currentSections.find(s => s.id === id);
    // Only allow removing text_block sections
    if (section?.type !== 'text_block') return;
    
    const filtered = currentSections.filter(s => s.id !== id);
    // Reorder
    const reordered = filtered.sort((a, b) => a.order - b.order).map((s, i) => ({ ...s, order: i + 1 }));
    onUpdate(reordered);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base font-medium">Sections de la page</Label>
          <p className="text-sm text-muted-foreground">Réordonnez et personnalisez les sections</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={addTextBlock}
          className="gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Ajouter texte
        </Button>
      </div>

      <div className="space-y-2">
        {sortedSections.map((section, index) => {
          const Icon = SECTION_ICONS[section.type];
          const isTextBlock = section.type === 'text_block';
          
          return (
            <div 
              key={section.id}
              className={cn(
                "border rounded-xl p-4 transition-all",
                section.enabled 
                  ? "bg-background border-border" 
                  : "bg-muted/30 border-muted opacity-60"
              )}
            >
              {/* Header row */}
              <div className="flex items-center gap-3">
                {/* Drag handle / Icon */}
                <div className="flex items-center gap-1 text-muted-foreground">
                  <GripVertical className="w-4 h-4 cursor-grab" />
                  <Icon className="w-4 h-4" />
                </div>

                {/* Title input */}
                <Input
                  value={section.title}
                  onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                  className="flex-1 h-9 font-medium"
                  placeholder="Titre de la section"
                />

                {/* Move buttons */}
                <div className="flex items-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveSection(section.id, 'up')}
                    disabled={index === 0}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveSection(section.id, 'down')}
                    disabled={index === sortedSections.length - 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </div>

                {/* Toggle */}
                <Switch
                  checked={section.enabled}
                  onCheckedChange={() => toggleSection(section.id)}
                />

                {/* Delete (only for text blocks) */}
                {isTextBlock && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSection(section.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* Content textarea for text blocks */}
              {isTextBlock && section.enabled && (
                <div className="mt-3 pl-9">
                  <Textarea
                    value={section.content || ''}
                    onChange={(e) => updateSectionContent(section.id, e.target.value)}
                    placeholder="Contenu de la section..."
                    rows={3}
                    className="resize-none"
                  />
                </div>
              )}

              {/* Helper text for built-in sections */}
              {!isTextBlock && (
                <p className="text-xs text-muted-foreground mt-2 pl-9">
                  {section.type === 'formules' && 'Affiche vos formules et tarifs'}
                  {section.type === 'gallery' && 'Affiche vos photos de réalisations'}
                  {section.type === 'about' && 'Affiche votre texte "À propos"'}
                  {section.type === 'contact' && 'Affiche le formulaire de contact'}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {sortedSections.length === 0 && (
        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-xl">
          <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Aucune section</p>
        </div>
      )}
    </div>
  );
}
