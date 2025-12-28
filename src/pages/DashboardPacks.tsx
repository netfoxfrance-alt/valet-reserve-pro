import { useState } from 'react';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { MobileSidebar } from '@/components/dashboard/MobileSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useMyPacks, Pack } from '@/hooks/useCenter';
import { Pencil, Clock, Plus, Trash2, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

interface PriceVariant {
  name: string;
  price: number;
}

export default function DashboardPacks() {
  const { packs, loading, createPack, updatePack, deletePack } = useMyPacks();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Pack> & { price_variants?: PriceVariant[] }>({});
  const [newPack, setNewPack] = useState({
    name: '',
    description: '',
    price: 0,
    duration: '1h',
    features: [] as string[],
    sort_order: 0,
    active: true,
    price_variants: [] as PriceVariant[],
  });

  const handleEdit = (pack: Pack) => {
    setEditingId(pack.id);
    setEditForm({
      name: pack.name,
      description: pack.description,
      price: pack.price,
      duration: pack.duration,
      features: pack.features,
      price_variants: (pack as any).price_variants || [],
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
    if (!newPack.name || (newPack.price <= 0 && newPack.price_variants.length === 0)) {
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
        duration: '1h',
        features: [],
        sort_order: 0,
        active: true,
        price_variants: [],
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

  const addVariant = (isNew: boolean) => {
    if (isNew) {
      setNewPack({
        ...newPack,
        price_variants: [...newPack.price_variants, { name: '', price: 0 }],
      });
    } else {
      setEditForm({
        ...editForm,
        price_variants: [...(editForm.price_variants || []), { name: '', price: 0 }],
      });
    }
  };

  const updateVariant = (isNew: boolean, index: number, field: 'name' | 'price', value: string | number) => {
    if (isNew) {
      const variants = [...newPack.price_variants];
      variants[index] = { ...variants[index], [field]: value };
      setNewPack({ ...newPack, price_variants: variants });
    } else {
      const variants = [...(editForm.price_variants || [])];
      variants[index] = { ...variants[index], [field]: value };
      setEditForm({ ...editForm, price_variants: variants });
    }
  };

  const removeVariant = (isNew: boolean, index: number) => {
    if (isNew) {
      setNewPack({
        ...newPack,
        price_variants: newPack.price_variants.filter((_, i) => i !== index),
      });
    } else {
      setEditForm({
        ...editForm,
        price_variants: (editForm.price_variants || []).filter((_, i) => i !== index),
      });
    }
  };

  const addFeature = (isNew: boolean) => {
    if (isNew) {
      setNewPack({ ...newPack, features: [...newPack.features, ''] });
    } else {
      setEditForm({ ...editForm, features: [...(editForm.features || []), ''] });
    }
  };

  const updateFeature = (isNew: boolean, index: number, value: string) => {
    if (isNew) {
      const features = [...newPack.features];
      features[index] = value;
      setNewPack({ ...newPack, features });
    } else {
      const features = [...(editForm.features || [])];
      features[index] = value;
      setEditForm({ ...editForm, features });
    }
  };

  const removeFeature = (isNew: boolean, index: number) => {
    if (isNew) {
      setNewPack({ ...newPack, features: newPack.features.filter((_, i) => i !== index) });
    } else {
      setEditForm({ ...editForm, features: (editForm.features || []).filter((_, i) => i !== index) });
    }
  };

  const VariantsEditor = ({ variants, isNew }: { variants: PriceVariant[], isNew: boolean }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Variantes de prix</Label>
        <Button type="button" variant="outline" size="sm" onClick={() => addVariant(isNew)}>
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
                onChange={(e) => updateVariant(isNew, index, 'name', e.target.value)}
                className="flex-1"
              />
              <Input
                type="number"
                placeholder="Prix"
                value={variant.price || ''}
                onChange={(e) => updateVariant(isNew, index, 'price', parseFloat(e.target.value) || 0)}
                className="w-24"
              />
              <span className="text-muted-foreground">€</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeVariant(isNew, index)}
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

  const FeaturesEditor = ({ features, isNew }: { features: string[], isNew: boolean }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Ce qui est inclus</Label>
        <Button type="button" variant="outline" size="sm" onClick={() => addFeature(isNew)}>
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
                onChange={(e) => updateFeature(isNew, index, e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeFeature(isNew, index)}
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <MobileSidebar open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} />
      
      <div className="lg:pl-64">
        <DashboardHeader 
          title="Formules" 
          onMenuClick={() => setMobileMenuOpen(true)}
        />
        
        <main className="p-4 lg:p-8 max-w-4xl">
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
                  <div className="space-y-2">
                    <Label htmlFor="new-duration">Durée estimée</Label>
                    <Input
                      id="new-duration"
                      value={newPack.duration}
                      onChange={(e) => setNewPack({ ...newPack, duration: e.target.value })}
                      placeholder="1h30"
                    />
                  </div>
                </div>

                {newPack.price_variants.length === 0 && (
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

                <VariantsEditor variants={newPack.price_variants} isNew={true} />

                <div className="space-y-2">
                  <Label htmlFor="new-description">Description</Label>
                  <Textarea
                    id="new-description"
                    value={newPack.description}
                    onChange={(e) => setNewPack({ ...newPack, description: e.target.value })}
                    placeholder="Description de la formule..."
                    rows={2}
                  />
                </div>

                <FeaturesEditor features={newPack.features} isNew={true} />

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
                            <Label htmlFor={`duration-${pack.id}`}>Durée</Label>
                            <Input
                              id={`duration-${pack.id}`}
                              value={editForm.duration || ''}
                              onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                            />
                          </div>
                        </div>

                        {(editForm.price_variants?.length || 0) === 0 && (
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

                        <VariantsEditor variants={editForm.price_variants || []} isNew={false} />

                        <div className="space-y-2">
                          <Label htmlFor={`description-${pack.id}`}>Description</Label>
                          <Textarea
                            id={`description-${pack.id}`}
                            value={editForm.description || ''}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            rows={2}
                          />
                        </div>

                        <FeaturesEditor features={editForm.features || []} isNew={false} />

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
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg text-foreground truncate">{pack.name}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">{pack.description}</p>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6">
                            <div className="text-left sm:text-right">
                              <p className="text-xl sm:text-2xl font-bold text-foreground">
                                {variants.length > 0 ? `À partir de ${minPrice}€` : `${pack.price}€`}
                              </p>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                {pack.duration || 'Non défini'}
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
        </main>
      </div>
    </div>
  );
}