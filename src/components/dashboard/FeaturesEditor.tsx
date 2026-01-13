import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';

interface FeaturesEditorProps {
  features: string[];
  onAdd: () => void;
  onUpdate: (index: number, value: string) => void;
  onRemove: (index: number) => void;
}

export function FeaturesEditor({ features, onAdd, onUpdate, onRemove }: FeaturesEditorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Ce qui est inclus</Label>
        <Button type="button" variant="outline" size="sm" onClick={onAdd}>
          <Plus className="w-3 h-3 mr-1" />
          Ajouter
        </Button>
      </div>
      {features.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">Aucun élément listé</p>
      ) : (
        <div className="space-y-2">
          {features.map((feature, index) => (
            <div key={index} className="flex gap-2 items-center">
              <Input
                placeholder="Ex: Nettoyage sièges"
                value={feature}
                onChange={(e) => onUpdate(index, e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onRemove(index)}
                className="text-destructive hover:text-destructive h-8 w-8"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
