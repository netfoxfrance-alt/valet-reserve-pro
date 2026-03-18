import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useMyServiceCategories, ServiceCategory, useServiceVariants, ServiceVariant } from '@/hooks/useServiceCategories';
import { useMyPacks, Pack, useMyCenter } from '@/hooks/useCenter';
import { useAuth } from '@/hooks/useAuth';
import { FeaturesEditor } from '@/components/dashboard/FeaturesEditor';
import { supabase } from '@/integrations/supabase/client';
import { stripHtml } from '@/lib/utils';
import { toast } from 'sonner';
import {
  ArrowLeft, Plus, Pencil, Trash2, Clock, Loader2,
  FileText, Package, Settings2, Layers, Image as ImageIcon, X,
  ChevronDown, ChevronUp, GripVertical, Home, Building2, MapPin,
} from 'lucide-react';

// Duration helpers
const parseDuration = (duration: string): { hours: number; minutes: number } => {
  const hoursMatch = duration.match(/(\d+)h/);
  const minutesMatch = duration.match(/(\d+)(?:min|m(?!h))/);
  return {
    hours: hoursMatch ? parseInt(hoursMatch[1], 10) : 0,
    minutes: minutesMatch ? parseInt(minutesMatch[1], 10) : 0,
  };
};

const formatDuration = (hours: number, minutes: number): string => {
  if (hours === 0 && minutes === 0) return '';
  if (hours === 0) return `${minutes}min`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h${minutes.toString().padStart(2, '0')}`;
};

const FUNNEL_PRESETS = [
  { id: 'simple', name: 'Simple', icon: '🎯' },
  { id: 'classic', name: 'Classique', icon: '📋' },
  { id: 'detailing', name: 'Detailing', icon: '🚗' },
  { id: 'quote', name: 'Sur devis', icon: '📝' },
];

const LOCATION_OPTIONS = [
  { id: 'home', label: 'À domicile', icon: Home },
  { id: 'workshop', label: 'En atelier', icon: Building2 },
  { id: 'both', label: 'Les deux', icon: MapPin },
];

export default function DashboardServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { center } = useMyCenter();
  const { user } = useAuth();
  const { categories, updateCategory } = useMyServiceCategories();
  const { variants, createVariant, updateVariant, deleteVariant } = useServiceVariants(id || null);
  const { packs, loading: packsLoading, createPack, updatePack, deletePack } = useMyPacks();
  
  const category = categories.find(c => c.id === id);
  const categoryPacks = packs.filter(p => (p as any).category_id === id);

  // Pack form state
  const [isCreatingPack, setIsCreatingPack] = useState(false);
  const [editingPackId, setEditingPackId] = useState<string | null>(null);
  const [packForm, setPackForm] = useState({
    name: '',
    description: '',
    price: 0,
    duration: '',
    features: [] as string[],
    pricing_type: 'fixed' as 'fixed' | 'quote',
    image_url: null as string | null,
  });
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Variant form
  const [newVariantName, setNewVariantName] = useState('');
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [editVariantName, setEditVariantName] = useState('');

  // Settings
  const [settingsForm, setSettingsForm] = useState({
    name: '',
    description: '',
    funnel_type: 'classic',
    location_type: 'both',
  });

  useEffect(() => {
    if (category) {
      setSettingsForm({
        name: category.name,
        description: category.description || '',
        funnel_type: category.funnel_type,
        location_type: category.location_type,
      });
    }
  }, [category]);

  // Pack form helpers
  const resetPackForm = () => {
    setPackForm({ name: '', description: '', price: 0, duration: '', features: [], pricing_type: 'fixed', image_url: null });
  };

  const openEditPack = (pack: Pack) => {
    setEditingPackId(pack.id);
    setPackForm({
      name: pack.name,
      description: pack.description || '',
      price: pack.price,
      duration: pack.duration || '',
      features: pack.features || [],
      pricing_type: pack.pricing_type || 'fixed',
      image_url: pack.image_url || null,
    });
  };

  const handleCreatePack = async () => {
    if (!packForm.name.trim()) {
      toast.error('Donnez un nom à la formule');
      return;
    }
    const { error } = await createPack({
      ...packForm,
      sort_order: categoryPacks.length,
      active: true,
      price_variants: [],
      // @ts-ignore - category_id is a valid field
      category_id: id,
    } as any);
    if (error) toast.error('Erreur');
    else {
      toast.success('Formule créée');
      setIsCreatingPack(false);
      resetPackForm();
    }
  };

  const handleSavePack = async () => {
    if (!editingPackId) return;
    const { error } = await updatePack(editingPackId, packForm as any);
    if (error) toast.error('Erreur');
    else {
      toast.success('Formule mise à jour');
      setEditingPackId(null);
      resetPackForm();
    }
  };

  const handleDeletePack = async (packId: string) => {
    const { error } = await deletePack(packId);
    if (error) toast.error('Erreur');
    else toast.success('Formule supprimée');
  };

  // Variant helpers
  const handleCreateVariant = async () => {
    if (!newVariantName.trim()) return;
    const { error } = await createVariant(newVariantName.trim());
    if (error) toast.error('Erreur');
    else {
      setNewVariantName('');
      toast.success('Variante ajoutée');
    }
  };

  const handleSaveVariant = async () => {
    if (!editingVariantId || !editVariantName.trim()) return;
    const { error } = await updateVariant(editingVariantId, { name: editVariantName.trim() });
    if (error) toast.error('Erreur');
    else {
      setEditingVariantId(null);
      toast.success('Variante mise à jour');
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    const { error } = await deleteVariant(variantId);
    if (error) toast.error('Erreur');
    else toast.success('Variante supprimée');
  };

  // Image upload
  const handleImageUpload = async (file: File) => {
    if (!center || !user) return;
    setUploadingImage(true);
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const fileName = `${user.id}/pack-${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from('center-gallery')
      .upload(fileName, file, { upsert: true });
    if (uploadError) {
      toast.error('Erreur upload');
      setUploadingImage(false);
      return;
    }
    const { data: urlData } = supabase.storage.from('center-gallery').getPublicUrl(fileName);
    setPackForm(prev => ({ ...prev, image_url: urlData.publicUrl }));
    setUploadingImage(false);
  };

  // Settings save
  const handleSaveSettings = async () => {
    if (!id || !settingsForm.name.trim()) return;
    const { error } = await updateCategory(id, {
      name: settingsForm.name.trim(),
      description: settingsForm.description.trim() || null,
      funnel_type: settingsForm.funnel_type as any,
      location_type: settingsForm.location_type as any,
    });
    if (error) toast.error('Erreur');
    else toast.success('Paramètres mis à jour');
  };

  // Feature callbacks
  const handleAddFeature = useCallback(() => {
    setPackForm(prev => ({ ...prev, features: [...prev.features, ''] }));
  }, []);
  const handleUpdateFeature = useCallback((index: number, value: string) => {
    setPackForm(prev => {
      const features = [...prev.features];
      features[index] = value;
      return { ...prev, features };
    });
  }, []);
  const handleRemoveFeature = useCallback((index: number) => {
    setPackForm(prev => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }));
  }, []);

  if (!category) {
    return (
      <DashboardLayout title="Service">
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </DashboardLayout>
    );
  }

  const PackFormContent = ({ onSave, onCancel, saveLabel }: { onSave: () => void; onCancel: () => void; saveLabel: string }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Nom *</Label>
          <Input
            value={packForm.name}
            onChange={(e) => setPackForm({ ...packForm, name: e.target.value })}
            placeholder="Ex: Basique, Premium, Complet..."
          />
        </div>
        <div className="space-y-2">
          <Label>Durée estimée <span className="text-muted-foreground font-normal">(optionnelle)</span></Label>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Input
                type="number" min="0" max="23" className="w-16 text-center"
                value={parseDuration(packForm.duration).hours}
                onChange={(e) => {
                  const hours = Math.max(0, Math.min(23, parseInt(e.target.value) || 0));
                  setPackForm({ ...packForm, duration: formatDuration(hours, parseDuration(packForm.duration).minutes) });
                }}
              />
              <span className="text-sm text-muted-foreground">h</span>
            </div>
            <div className="flex items-center gap-1">
              <Input
                type="number" min="0" max="59" className="w-16 text-center"
                value={parseDuration(packForm.duration).minutes}
                onChange={(e) => {
                  const minutes = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
                  setPackForm({ ...packForm, duration: formatDuration(parseDuration(packForm.duration).hours, minutes) });
                }}
              />
              <span className="text-sm text-muted-foreground">min</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing type */}
      <div className="space-y-2">
        <Label>Tarification</Label>
        <div className="flex gap-2">
          <Button type="button" variant={packForm.pricing_type === 'fixed' ? 'default' : 'outline'} size="sm" className="flex-1 rounded-xl"
            onClick={() => setPackForm({ ...packForm, pricing_type: 'fixed' })}>
            Prix fixe
          </Button>
          <Button type="button" variant={packForm.pricing_type === 'quote' ? 'default' : 'outline'} size="sm" className="flex-1 rounded-xl"
            onClick={() => setPackForm({ ...packForm, pricing_type: 'quote', price: 0 })}>
            <FileText className="w-4 h-4 mr-1.5" /> Sur devis
          </Button>
        </div>
      </div>

      {packForm.pricing_type === 'fixed' && (
        <div className="space-y-2">
          <Label>Prix (€)</Label>
          <Input
            type="number"
            value={packForm.price || ''}
            onChange={(e) => setPackForm({ ...packForm, price: parseFloat(e.target.value) || 0 })}
            placeholder="49"
          />
          {variants.length > 0 && (
            <p className="text-xs text-muted-foreground">
              💡 Ce prix sera le prix de base. Les variantes ({variants.map(v => v.name).join(', ')}) pourront avoir des prix différents.
            </p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label>Description</Label>
        <RichTextEditor
          content={packForm.description}
          onChange={(html) => setPackForm({ ...packForm, description: html })}
          placeholder="Décrivez cette formule..."
        />
      </div>

      <FeaturesEditor
        features={packForm.features}
        onAdd={handleAddFeature}
        onUpdate={handleUpdateFeature}
        onRemove={handleRemoveFeature}
      />

      {/* Image */}
      <div className="space-y-2">
        <Label>Image (optionnel)</Label>
        <input ref={imageInputRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }} />
        {packForm.image_url ? (
          <div className="relative inline-block">
            <img src={packForm.image_url} alt="Pack" className="w-32 h-24 object-cover rounded-lg" />
            <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
              onClick={() => setPackForm({ ...packForm, image_url: null })}>
              <X className="w-3 h-3" />
            </Button>
          </div>
        ) : (
          <Button type="button" variant="outline" disabled={uploadingImage} onClick={() => imageInputRef.current?.click()}>
            {uploadingImage ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ImageIcon className="w-4 h-4 mr-2" />}
            Ajouter une image
          </Button>
        )}
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
        <Button variant="ghost" onClick={onCancel}>Annuler</Button>
        <Button onClick={onSave}>{saveLabel}</Button>
      </div>
    </div>
  );

  return (
    <DashboardLayout title={category.name}>
      {/* Back button */}
      <Button variant="ghost" className="mb-4" onClick={() => navigate('/dashboard/formules')}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Retour aux services
      </Button>

      <Tabs defaultValue="formules" className="space-y-6">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="formules" className="gap-2">
            <Package className="w-4 h-4" /> Formules
          </TabsTrigger>
          <TabsTrigger value="variantes" className="gap-2">
            <Layers className="w-4 h-4" /> Variantes
          </TabsTrigger>
          <TabsTrigger value="config" className="gap-2">
            <Settings2 className="w-4 h-4" /> Configuration
          </TabsTrigger>
        </TabsList>

        {/* === FORMULES TAB === */}
        <TabsContent value="formules" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Formules</h3>
              <p className="text-sm text-muted-foreground">Les offres proposées pour ce service</p>
            </div>
            <Button onClick={() => { setIsCreatingPack(true); resetPackForm(); }} disabled={isCreatingPack}>
              <Plus className="w-4 h-4 mr-2" /> Nouvelle formule
            </Button>
          </div>

          {isCreatingPack && (
            <Card variant="elevated" className="p-4 sm:p-6 border-2 border-primary/20">
              <h4 className="font-semibold mb-4">Nouvelle formule</h4>
              <PackFormContent
                onSave={handleCreatePack}
                onCancel={() => { setIsCreatingPack(false); resetPackForm(); }}
                saveLabel="Créer"
              />
            </Card>
          )}

          {categoryPacks.length === 0 && !isCreatingPack ? (
            <Card variant="elevated" className="p-8 text-center">
              <Package className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground mb-4">Aucune formule pour ce service.</p>
              <Button onClick={() => { setIsCreatingPack(true); resetPackForm(); }}>
                <Plus className="w-4 h-4 mr-2" /> Créer une formule
              </Button>
            </Card>
          ) : (
            categoryPacks.map((pack) => (
              <Card key={pack.id} variant="elevated" className="p-4 sm:p-6">
                {editingPackId === pack.id ? (
                  <PackFormContent
                    onSave={handleSavePack}
                    onCancel={() => { setEditingPackId(null); resetPackForm(); }}
                    saveLabel="Enregistrer"
                  />
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex gap-4 flex-1 min-w-0">
                      {pack.image_url && (
                        <img src={pack.image_url} alt={pack.name} className="w-20 h-20 object-cover rounded-xl flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-lg text-foreground">{pack.name}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">{stripHtml(pack.description)}</p>
                        {pack.duration && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <Clock className="w-3.5 h-3.5" /> {pack.duration}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-xl font-bold text-foreground">
                        {pack.pricing_type === 'quote' ? 'Sur devis' : `${pack.price}€`}
                      </p>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditPack(pack)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeletePack(pack.id)} className="text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))
          )}
        </TabsContent>

        {/* === VARIANTES TAB === */}
        <TabsContent value="variantes" className="space-y-4">
          <div>
            <h3 className="font-semibold text-foreground">Variantes</h3>
            <p className="text-sm text-muted-foreground">
              Types de véhicules, surfaces, tailles... Les variantes impactent le prix de chaque formule.
            </p>
          </div>

          {/* Add variant */}
          <div className="flex gap-2">
            <Input
              value={newVariantName}
              onChange={(e) => setNewVariantName(e.target.value)}
              placeholder="Ex: Citadine, Berline, SUV, 2 places..."
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && handleCreateVariant()}
            />
            <Button onClick={handleCreateVariant} disabled={!newVariantName.trim()}>
              <Plus className="w-4 h-4 mr-2" /> Ajouter
            </Button>
          </div>

          {variants.length === 0 ? (
            <Card variant="elevated" className="p-6 text-center">
              <Layers className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">Aucune variante pour ce service.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Ajoutez des variantes si vos prix changent selon le type de véhicule, la taille, etc.
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {variants.map((variant) => (
                <Card key={variant.id} variant="elevated" className="p-3 flex items-center gap-3">
                  {editingVariantId === variant.id ? (
                    <>
                      <Input
                        value={editVariantName}
                        onChange={(e) => setEditVariantName(e.target.value)}
                        className="flex-1"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveVariant()}
                      />
                      <Button size="sm" onClick={handleSaveVariant}>OK</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingVariantId(null)}>Annuler</Button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 font-medium text-foreground">{variant.name}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8"
                        onClick={() => { setEditingVariantId(variant.id); setEditVariantName(variant.name); }}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteVariant(variant.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* === CONFIG TAB === */}
        <TabsContent value="config" className="space-y-6">
          <div>
            <h3 className="font-semibold text-foreground mb-4">Configuration du service</h3>
          </div>

          <div className="space-y-4 max-w-lg">
            <div className="space-y-2">
              <Label>Nom du service</Label>
              <Input
                value={settingsForm.name}
                onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={settingsForm.description}
                onChange={(e) => setSettingsForm({ ...settingsForm, description: e.target.value })}
                placeholder="Description courte..."
              />
            </div>

            <div className="space-y-2">
              <Label>Lieu d'intervention</Label>
              <div className="grid grid-cols-3 gap-2">
                {LOCATION_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-center ${
                      settingsForm.location_type === opt.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/30'
                    }`}
                    onClick={() => setSettingsForm({ ...settingsForm, location_type: opt.id })}
                  >
                    <opt.icon className="w-5 h-5" />
                    <span className="text-xs font-medium">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Parcours de réservation</Label>
              <div className="grid grid-cols-2 gap-2">
                {FUNNEL_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left ${
                      settingsForm.funnel_type === preset.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/30'
                    }`}
                    onClick={() => setSettingsForm({ ...settingsForm, funnel_type: preset.id })}
                  >
                    <span className="text-lg">{preset.icon}</span>
                    <span className="text-sm font-medium">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={handleSaveSettings} className="w-full sm:w-auto">
              Enregistrer les paramètres
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
