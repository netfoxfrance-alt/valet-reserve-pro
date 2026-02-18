import { useState, useCallback, useRef } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/ui/rich-text-editor';

import { useMyPacks, Pack, useMyCenter } from '@/hooks/useCenter';
import { useAuth } from '@/hooks/useAuth';
import { Pencil, Clock, Plus, Trash2, Loader2, ChevronDown, ChevronUp, Image as ImageIcon, X, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { VariantsEditor } from '@/components/dashboard/VariantsEditor';
import { FeaturesEditor } from '@/components/dashboard/FeaturesEditor';
import { supabase } from '@/integrations/supabase/client';

// Helper to parse duration string to { hours, minutes }
const parseDuration = (duration: string): { hours: number; minutes: number } => {
  const hoursMatch = duration.match(/(\d+)h/);
  const minutesMatch = duration.match(/(\d+)(?:min|m(?!h))/);
  return {
    hours: hoursMatch ? parseInt(hoursMatch[1], 10) : 0,
    minutes: minutesMatch ? parseInt(minutesMatch[1], 10) : 0,
  };
};

// Helper to format { hours, minutes } to duration string
const formatDuration = (hours: number, minutes: number): string => {
  if (hours === 0 && minutes === 0) return '';
  if (hours === 0) return `${minutes}min`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h${minutes.toString().padStart(2, '0')}`;
};

interface PriceVariant {
  name: string;
  price: number;
}

export default function DashboardPacks() {
  const { packs, loading, createPack, updatePack, deletePack } = useMyPacks();
  const { center } = useMyCenter();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Pack> & { price_variants?: PriceVariant[]; image_url?: string | null }>({});
  const [newPack, setNewPack] = useState({
    name: '',
    description: '',
    price: 0,
    duration: '',
    features: [] as string[],
    sort_order: 0,
    active: true,
    price_variants: [] as PriceVariant[],
    image_url: null as string | null,
    pricing_type: 'fixed' as 'fixed' | 'quote',
  });
  const newImageInputRef = useRef<HTMLInputElement>(null);
  const editImageInputRef = useRef<HTMLInputElement>(null);

  const handleEdit = (pack: Pack) => {
    setEditingId(pack.id);
    setEditForm({
      name: pack.name,
      description: pack.description,
      price: pack.price,
      duration: pack.duration,
      features: pack.features,
      price_variants: (pack as any).price_variants || [],
      image_url: (pack as any).image_url || null,
      pricing_type: pack.pricing_type || 'fixed',
    });
  };

  const handleSave = async () => {
    if (!editingId) return;
    const { error } = await updatePack(editingId, editForm);
    if (error) {
      toast.error('Erreur lors de la sauvegarde');
    } else {
      toast.success('Formule mise à jour');
      setEditingId(null);
    }
  };

  const handleCreate = async () => {
    if (!newPack.name || (newPack.pricing_type === 'fixed' && newPack.price <= 0 && newPack.price_variants.length === 0)) {
      toast.error('Veuillez remplir le nom et au moins un prix');
      return;
    }
    const { error } = await createPack({
      ...newPack,
      sort_order: packs.length
    });
    if (error) {
      toast.error('Erreur lors de la création');
    } else {
      toast.success('Formule créée');
      setIsCreating(false);
      setNewPack({
        name: '',
        description: '',
        price: 0,
        duration: '',
        features: [],
        sort_order: 0,
        active: true,
        price_variants: [],
        image_url: null,
        pricing_type: 'fixed',
      });
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await deletePack(id);
    if (error) {
      toast.error('Erreur lors de la suppression');
    } else {
      toast.success('Formule supprimée');
    }
  };

  // Stable callbacks for new pack variants
  const handleAddNewVariant = useCallback(() => {
    setNewPack(prev => ({
      ...prev,
      price_variants: [...prev.price_variants, { name: '', price: 0 }],
    }));
  }, []);

  const handleUpdateNewVariant = useCallback((index: number, field: 'name' | 'price', value: string | number) => {
    setNewPack(prev => {
      const variants = [...prev.price_variants];
      variants[index] = { ...variants[index], [field]: value };
      return { ...prev, price_variants: variants };
    });
  }, []);

  const handleRemoveNewVariant = useCallback((index: number) => {
    setNewPack(prev => ({
      ...prev,
      price_variants: prev.price_variants.filter((_, i) => i !== index),
    }));
  }, []);

  // Stable callbacks for edit form variants
  const handleAddEditVariant = useCallback(() => {
    setEditForm(prev => ({
      ...prev,
      price_variants: [...(prev.price_variants || []), { name: '', price: 0 }],
    }));
  }, []);

  const handleUpdateEditVariant = useCallback((index: number, field: 'name' | 'price', value: string | number) => {
    setEditForm(prev => {
      const variants = [...(prev.price_variants || [])];
      variants[index] = { ...variants[index], [field]: value };
      return { ...prev, price_variants: variants };
    });
  }, []);

  const handleRemoveEditVariant = useCallback((index: number) => {
    setEditForm(prev => ({
      ...prev,
      price_variants: (prev.price_variants || []).filter((_, i) => i !== index),
    }));
  }, []);

  // Stable callbacks for new pack features
  const handleAddNewFeature = useCallback(() => {
    setNewPack(prev => ({ ...prev, features: [...prev.features, ''] }));
  }, []);

  const handleUpdateNewFeature = useCallback((index: number, value: string) => {
    setNewPack(prev => {
      const features = [...prev.features];
      features[index] = value;
      return { ...prev, features };
    });
  }, []);

  const handleRemoveNewFeature = useCallback((index: number) => {
    setNewPack(prev => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }));
  }, []);

  // Stable callbacks for edit form features
  const handleAddEditFeature = useCallback(() => {
    setEditForm(prev => ({ ...prev, features: [...(prev.features || []), ''] }));
  }, []);

  const handleUpdateEditFeature = useCallback((index: number, value: string) => {
    setEditForm(prev => {
      const features = [...(prev.features || [])];
      features[index] = value;
      return { ...prev, features };
    });
  }, []);

  const handleRemoveEditFeature = useCallback((index: number) => {
    setEditForm(prev => ({ ...prev, features: (prev.features || []).filter((_, i) => i !== index) }));
  }, []);

  // Image upload handler
  const handleImageUpload = async (file: File, target: 'new' | 'edit') => {
    if (!center || !user) return;
    
    const targetId = target === 'edit' && editingId ? editingId : 'new';
    setUploadingImage(targetId);
    
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const fileName = `${user.id}/${targetId}-${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('center-gallery')
      .upload(fileName, file, { upsert: true });
    
    if (uploadError) {
      toast.error('Erreur lors du téléchargement');
      setUploadingImage(null);
      return;
    }
    
    const { data: urlData } = supabase.storage
      .from('center-gallery')
      .getPublicUrl(fileName);
    
    const imageUrl = urlData.publicUrl;
    
    if (target === 'new') {
      setNewPack(prev => ({ ...prev, image_url: imageUrl }));
    } else {
      setEditForm(prev => ({ ...prev, image_url: imageUrl }));
    }
    
    setUploadingImage(null);
    toast.success('Image ajoutée');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <DashboardLayout title="Formules">
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-1 sm:mb-2">Vos offres</h2>
              <p className="text-sm text-muted-foreground">Configurez les formules proposées à vos clients.</p>
            </div>
            <Button onClick={() => setIsCreating(true)} disabled={isCreating} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle formule
            </Button>
          </div>

          {isCreating && (
            <Card variant="elevated" className="p-4 sm:p-6 mb-4 border-2 border-primary/20">
              <h3 className="font-semibold mb-4">Nouvelle formule</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-name">Nom *</Label>
                    <Input
                      id="new-name"
                      value={newPack.name}
                      onChange={(e) => setNewPack({ ...newPack, name: e.target.value })}
                      placeholder="Nettoyage Complet"
                    />
                  </div>
                  {/* Duration - optional for quote type */}
                  <div className="space-y-2">
                    <Label>Durée estimée {newPack.pricing_type === 'quote' && <span className="text-muted-foreground font-normal">(optionnelle)</span>}</Label>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          min="0"
                          max="23"
                          className="w-16 text-center"
                          value={parseDuration(newPack.duration).hours}
                          onChange={(e) => {
                            const hours = Math.max(0, Math.min(23, parseInt(e.target.value) || 0));
                            const { minutes } = parseDuration(newPack.duration);
                            setNewPack({ ...newPack, duration: formatDuration(hours, minutes) });
                          }}
                        />
                        <span className="text-sm text-muted-foreground">h</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          min="0"
                          max="59"
                          className="w-16 text-center"
                          value={parseDuration(newPack.duration).minutes}
                          onChange={(e) => {
                            const minutes = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
                            const { hours } = parseDuration(newPack.duration);
                            setNewPack({ ...newPack, duration: formatDuration(hours, minutes) });
                          }}
                        />
                        <span className="text-sm text-muted-foreground">min</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pricing type toggle */}
                <div className="space-y-2">
                  <Label>Type de tarification</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={newPack.pricing_type === 'fixed' ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1 rounded-xl"
                      onClick={() => setNewPack({ ...newPack, pricing_type: 'fixed' })}
                    >
                      Prix fixe
                    </Button>
                    <Button
                      type="button"
                      variant={newPack.pricing_type === 'quote' ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1 rounded-xl"
                      onClick={() => setNewPack({ ...newPack, pricing_type: 'quote', price: 0, price_variants: [] })}
                    >
                      <FileText className="w-4 h-4 mr-1.5" />
                      Sur devis
                    </Button>
                  </div>
                </div>

                {newPack.pricing_type === 'fixed' && newPack.price_variants.length === 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="new-price">Prix unique (€)</Label>
                    <Input
                      id="new-price"
                      type="number"
                      value={newPack.price || ''}
                      onChange={(e) => setNewPack({ ...newPack, price: parseFloat(e.target.value) || 0 })}
                      placeholder="49"
                    />
                    <p className="text-xs text-muted-foreground">
                      Ou ajoutez des variantes de prix ci-dessous
                    </p>
                  </div>
                )}

                {newPack.pricing_type === 'fixed' && (
                  <VariantsEditor
                  variants={newPack.price_variants} 
                  onAdd={handleAddNewVariant}
                  onUpdate={handleUpdateNewVariant}
                  onRemove={handleRemoveNewVariant}
                />
                )}

                <div className="space-y-2">
                  <Label htmlFor="new-description">Description</Label>
                  <RichTextEditor
                    content={newPack.description}
                    onChange={(html) => setNewPack({ ...newPack, description: html })}
                    placeholder="Décrivez votre prestation..."
                  />
                </div>

                <FeaturesEditor 
                  features={newPack.features} 
                  onAdd={handleAddNewFeature}
                  onUpdate={handleUpdateNewFeature}
                  onRemove={handleRemoveNewFeature}
                />

                {/* Image upload for new pack */}
                <div className="space-y-2">
                  <Label>Image (optionnel)</Label>
                  <input
                    ref={newImageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, 'new');
                    }}
                  />
                  {newPack.image_url ? (
                    <div className="relative inline-block">
                      <img 
                        src={newPack.image_url} 
                        alt="Pack image" 
                        className="w-32 h-24 object-cover rounded-lg"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={() => setNewPack({ ...newPack, image_url: null })}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full sm:w-auto"
                      disabled={uploadingImage === 'new'}
                      onClick={() => newImageInputRef.current?.click()}
                    >
                      {uploadingImage === 'new' ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <ImageIcon className="w-4 h-4 mr-2" />
                      )}
                      Ajouter une image
                    </Button>
                  )}
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
                  <Button variant="ghost" onClick={() => setIsCreating(false)} className="w-full sm:w-auto">
                    Annuler
                  </Button>
                  <Button onClick={handleCreate} className="w-full sm:w-auto">
                    Créer
                  </Button>
                </div>
              </div>
            </Card>
          )}
          
          <div className="space-y-3 sm:space-y-4">
            {packs.length === 0 && !isCreating ? (
              <Card variant="elevated" className="p-6 sm:p-8 text-center">
                <p className="text-muted-foreground mb-4">Aucune formule créée pour le moment.</p>
                <Button onClick={() => setIsCreating(true)} className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Créer votre première formule
                </Button>
              </Card>
            ) : (
              packs.map((pack) => {
                const variants = (pack as any).price_variants as PriceVariant[] || [];
                const isExpanded = expandedId === pack.id;
                const minPrice = variants.length > 0 
                  ? Math.min(...variants.map(v => v.price))
                  : pack.price;

                return (
                  <Card key={pack.id} variant="elevated" className="p-4 sm:p-6">
                    {editingId === pack.id ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`name-${pack.id}`}>Nom</Label>
                            <Input
                              id={`name-${pack.id}`}
                              value={editForm.name || ''}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Durée {editForm.pricing_type === 'quote' && <span className="text-muted-foreground font-normal">(optionnelle)</span>}</Label>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <Input
                                  type="number"
                                  min="0"
                                  max="23"
                                  className="w-16 text-center"
                                  value={parseDuration(editForm.duration || '1h').hours}
                                  onChange={(e) => {
                                    const hours = Math.max(0, Math.min(23, parseInt(e.target.value) || 0));
                                    const { minutes } = parseDuration(editForm.duration || '1h');
                                    setEditForm({ ...editForm, duration: formatDuration(hours, minutes) });
                                  }}
                                />
                                <span className="text-sm text-muted-foreground">h</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Input
                                  type="number"
                                  min="0"
                                  max="59"
                                  className="w-16 text-center"
                                  value={parseDuration(editForm.duration || '1h').minutes}
                                  onChange={(e) => {
                                    const minutes = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
                                    const { hours } = parseDuration(editForm.duration || '1h');
                                    setEditForm({ ...editForm, duration: formatDuration(hours, minutes) });
                                  }}
                                />
                                <span className="text-sm text-muted-foreground">min</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Pricing type toggle */}
                        <div className="space-y-2">
                          <Label>Type de tarification</Label>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant={editForm.pricing_type === 'fixed' || !editForm.pricing_type ? 'default' : 'outline'}
                              size="sm"
                              className="flex-1 rounded-xl"
                              onClick={() => setEditForm({ ...editForm, pricing_type: 'fixed' })}
                            >
                              Prix fixe
                            </Button>
                            <Button
                              type="button"
                              variant={editForm.pricing_type === 'quote' ? 'default' : 'outline'}
                              size="sm"
                              className="flex-1 rounded-xl"
                              onClick={() => setEditForm({ ...editForm, pricing_type: 'quote', price: 0, price_variants: [] })}
                            >
                              <FileText className="w-4 h-4 mr-1.5" />
                              Sur devis
                            </Button>
                          </div>
                        </div>

                        {(editForm.pricing_type !== 'quote') && (editForm.price_variants?.length || 0) === 0 && (
                          <div className="space-y-2">
                            <Label htmlFor={`price-${pack.id}`}>Prix unique (€)</Label>
                            <Input
                              id={`price-${pack.id}`}
                              type="number"
                              value={editForm.price || ''}
                              onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })}
                            />
                          </div>
                        )}

                        {(editForm.pricing_type !== 'quote') && (
                          <VariantsEditor 
                            variants={editForm.price_variants || []} 
                            onAdd={handleAddEditVariant}
                            onUpdate={handleUpdateEditVariant}
                            onRemove={handleRemoveEditVariant}
                          />
                        )}

                        <div className="space-y-2">
                          <Label htmlFor={`description-${pack.id}`}>Description</Label>
                          <RichTextEditor
                            content={editForm.description || ''}
                            onChange={(html) => setEditForm({ ...editForm, description: html })}
                            placeholder="Décrivez votre prestation..."
                          />
                        </div>

                        <FeaturesEditor 
                          features={editForm.features || []} 
                          onAdd={handleAddEditFeature}
                          onUpdate={handleUpdateEditFeature}
                          onRemove={handleRemoveEditFeature}
                        />

                        {/* Image upload for edit */}
                        <div className="space-y-2">
                          <Label>Image (optionnel)</Label>
                          <input
                            ref={editImageInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(file, 'edit');
                            }}
                          />
                          {editForm.image_url ? (
                            <div className="relative inline-block">
                              <img 
                                src={editForm.image_url} 
                                alt="Pack image" 
                                className="w-32 h-24 object-cover rounded-lg"
                              />
                              <Button
                                variant="destructive"
                                size="icon"
                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                onClick={() => setEditForm({ ...editForm, image_url: null })}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full sm:w-auto"
                              disabled={uploadingImage === editingId}
                              onClick={() => editImageInputRef.current?.click()}
                            >
                              {uploadingImage === editingId ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <ImageIcon className="w-4 h-4 mr-2" />
                              )}
                              Ajouter une image
                            </Button>
                          )}
                        </div>

                        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
                          <Button variant="ghost" onClick={() => setEditingId(null)} className="w-full sm:w-auto">
                            Annuler
                          </Button>
                          <Button onClick={handleSave} className="w-full sm:w-auto">
                            Enregistrer
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          {/* Image + Info */}
                          <div className="flex gap-4 flex-1 min-w-0">
                            {(pack as any).image_url && (
                              <img 
                                src={(pack as any).image_url} 
                                alt={pack.name}
                                className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl flex-shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-lg text-foreground truncate">{pack.name}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2">{pack.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6">
                            <div className="text-left sm:text-right">
                              <p className="text-xl sm:text-2xl font-bold text-foreground">
                                {pack.pricing_type === 'quote' 
                                  ? 'Sur devis' 
                                  : variants.length > 0 ? `À partir de ${minPrice}€` : `${pack.price}€`}
                              </p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                {pack.pricing_type === 'quote' ? (
                                  <><FileText className="w-4 h-4" /> Demande de devis</>
                                ) : pack.duration ? (
                                  <><Clock className="w-4 h-4" /> {pack.duration}</>
                                ) : null}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleEdit(pack)}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleDelete(pack.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Show variants preview */}
                        {variants.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-border">
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : pack.id)}
                              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              {variants.length} variante{variants.length > 1 ? 's' : ''} de prix
                            </button>
                            {isExpanded && (
                              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {variants.map((v, i) => (
                                  <div key={i} className="bg-secondary/30 rounded-lg px-3 py-2 text-center">
                                    <p className="text-sm font-medium text-foreground">{v.name}</p>
                                    <p className="text-sm text-muted-foreground">{v.price}€</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Show features */}
                        {pack.features && pack.features.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-border">
                            <p className="text-sm text-muted-foreground mb-2">Inclus :</p>
                            <div className="flex flex-wrap gap-2">
                              {pack.features.map((f, i) => (
                                <span key={i} className="bg-secondary/30 text-sm px-2 py-1 rounded">
                                  {f}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                );
              })
            )}
          </div>
    </DashboardLayout>
  );
}