import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';

interface PriceVariant {
  name: string;
  price: number;
}

interface VariantsEditorProps {
  variants: PriceVariant[];
  onAdd: () => void;
  onUpdate: (index: number, field: 'name' | 'price', value: string | number) => void;
  onRemove: (index: number) => void;
}

export function VariantsEditor({ variants, onAdd, onUpdate, onRemove }: VariantsEditorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Variantes de prix</Label>
        <Button type="button" variant="outline" size="sm" onClick={onAdd}>
          <Plus className="w-3 h-3 mr-1" />
          Ajouter
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Ex: Citadine, Berline, SUV... ou Canapé 2 places, 3 places...
      </p>
      {variants.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">Aucune variante (prix unique)</p>
      ) : (
        <div className="space-y-2">
          {variants.map((variant, index) => (
            <div key={index} className="flex gap-2 items-center">
              <Input
                placeholder="Nom (ex: Citadine)"
                value={variant.name}
                onChange={(e) => onUpdate(index, 'name', e.target.value)}
                className="flex-1"
              />
              <Input
                type="number"
                placeholder="Prix"
                value={variant.price || ''}
                onChange={(e) => onUpdate(index, 'price', parseFloat(e.target.value) || 0)}
                className="w-24"
              />
              <span className="text-muted-foreground">€</span>
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
