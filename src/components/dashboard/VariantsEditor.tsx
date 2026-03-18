import { useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, ImageIcon, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PriceVariant {
  name: string;
  price: number;
  image_url?: string | null;
}

interface VariantsEditorProps {
  variants: PriceVariant[];
  onAdd: () => void;
  onUpdate: (index: number, field: 'name' | 'price' | 'image_url', value: string | number | null) => void;
  onRemove: (index: number) => void;
  userId?: string;
}

export function VariantsEditor({ variants, onAdd, onUpdate, onRemove, userId }: VariantsEditorProps) {
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);

  const handleImageUpload = async (file: File, index: number) => {
    if (!userId) return;
    setUploadingIdx(index);
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const fileName = `${userId}/variant-${Date.now()}-${index}.${fileExt}`;
    const { error } = await supabase.storage.from('center-gallery').upload(fileName, file, { upsert: true });
    if (error) { toast.error('Erreur upload'); setUploadingIdx(null); return; }
    const { data: urlData } = supabase.storage.from('center-gallery').getPublicUrl(fileName);
    onUpdate(index, 'image_url', urlData.publicUrl);
    setUploadingIdx(null);
  };

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
        <div className="space-y-3">
          {variants.map((variant, index) => (
            <div key={index} className="flex gap-2 items-start p-3 rounded-lg border border-border/50 bg-secondary/10">
              {/* Image thumbnail or upload button */}
              <div className="flex-shrink-0">
                <input
                  ref={el => { fileInputRefs.current[index] = el; }}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f, index); e.target.value = ''; }}
                />
                {variant.image_url ? (
                  <div className="relative">
                    <img src={variant.image_url} alt={variant.name} className="w-14 h-14 object-cover rounded-lg" />
                    <Button variant="destructive" size="icon" className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full" onClick={() => onUpdate(index, 'image_url', null)}>
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="w-14 h-14 rounded-lg"
                    disabled={uploadingIdx === index || !userId}
                    onClick={() => fileInputRefs.current[index]?.click()}
                  >
                    {uploadingIdx === index ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4 text-muted-foreground" />}
                  </Button>
                )}
              </div>
              <div className="flex-1 flex gap-2 items-center">
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
