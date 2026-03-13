import { useState } from 'react';
import { PAGE_TEMPLATES, PageTemplate, applyTemplate } from '@/lib/pageTemplates';
import { CenterCustomization } from '@/types/customization';
import { cn } from '@/lib/utils';
import { Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface TemplateSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentCustomization: CenterCustomization;
  onApply: (customization: CenterCustomization) => void;
}

export function TemplateSelector({ open, onOpenChange, currentCustomization, onApply }: TemplateSelectorProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleApply = () => {
    const template = PAGE_TEMPLATES.find(t => t.id === selected);
    if (!template) return;
    const newCustomization = applyTemplate(template, currentCustomization);
    onApply(newCustomization);
    onOpenChange(false);
    setSelected(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Choisir un template
          </DialogTitle>
          <DialogDescription>
            Un point de départ pour votre page. Vous pourrez tout personnaliser ensuite.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 py-4">
          {PAGE_TEMPLATES.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isSelected={selected === template.id}
              onSelect={() => setSelected(template.id)}
            />
          ))}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleApply} disabled={!selected}>
            Appliquer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TemplateCard({ template, isSelected, onSelect }: { template: PageTemplate; isSelected: boolean; onSelect: () => void }) {
  const { preview } = template;

  return (
    <button
      onClick={onSelect}
      className={cn(
        "relative flex flex-col rounded-xl border-2 overflow-hidden transition-all hover:scale-[1.02] text-left",
        isSelected
          ? "border-primary ring-2 ring-primary/20"
          : "border-border hover:border-muted-foreground/50"
      )}
    >
      {/* Mini preview */}
      <div
        className="h-28 w-full relative p-3 flex flex-col justify-end"
        style={{
          backgroundColor: preview.dark_mode ? '#0f172a' : '#f8fafc',
        }}
      >
        {/* Mock header bar */}
        <div className="absolute top-0 left-0 right-0 h-10" style={{ backgroundColor: preview.dark_mode ? '#1e293b' : '#ffffff' }}>
          <div className="flex items-center gap-2 px-3 h-full">
            <div className="w-5 h-5 rounded-full" style={{ backgroundColor: preview.primary }} />
            <div className="h-2 w-12 rounded-full" style={{ backgroundColor: preview.dark_mode ? '#475569' : '#d1d5db' }} />
          </div>
        </div>

        {/* Mock content blocks */}
        <div className="flex flex-col gap-1.5 mt-2">
          <div className="h-2 w-3/4 rounded-full" style={{ backgroundColor: preview.dark_mode ? '#e2e8f0' : '#374151', opacity: 0.7 }} />
          <div className="flex gap-1.5">
            <div className="h-6 flex-1 rounded-md" style={{ backgroundColor: preview.primary, opacity: 0.3 }} />
            <div className="h-6 flex-1 rounded-md" style={{ backgroundColor: preview.primary, opacity: 0.3 }} />
          </div>
          {/* CTA */}
          <div className="h-5 w-full rounded-md" style={{ backgroundColor: preview.primary }} />
        </div>
      </div>

      {/* Info */}
      <div className="p-3 bg-card">
        <div className="flex items-center gap-2">
          <span className="text-lg">{template.emoji}</span>
          <span className="font-semibold text-sm text-foreground">{template.name}</span>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1 leading-tight">{template.description}</p>

        {/* Color dots */}
        <div className="flex gap-1 mt-2">
          <div className="w-3.5 h-3.5 rounded-full border border-border" style={{ backgroundColor: preview.primary }} />
          <div className="w-3.5 h-3.5 rounded-full border border-border" style={{ backgroundColor: preview.secondary }} />
          <div className="w-3.5 h-3.5 rounded-full border border-border" style={{ backgroundColor: preview.accent }} />
        </div>
      </div>

      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
          <Check className="w-3.5 h-3.5 text-primary-foreground" />
        </div>
      )}
    </button>
  );
}
