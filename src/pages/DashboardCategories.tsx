import { useState, useRef } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useMyServiceCategories } from '@/hooks/useServiceCategories';
import { useMyCenter } from '@/hooks/useCenter';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Pencil, Trash2, Loader2, Image as ImageIcon, X, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardCategories() {
  const { categories, loading, createCategory, updateCategory, deleteCategory } = useMyServiceCategories();
  const { center } = useMyCenter();
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const [newCat, setNewCat] = useState({ name: '', description: '', image_url: '' });
  const [editForm, setEditForm] = useState<{ name: string; description: string; image_url: string }>({ name: '', description: '', image_url: '' });
  const newImageRef = useRef<HTMLInputElement>(null);
  const editImageRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (file: File, target: 'new' | 'edit') => {
    if (!center || !user) return;
    const targetId = target === 'edit' && editingId ? editingId : 'new-cat';
    setUploadingImage(targetId);
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const fileName = `${user.id}/cat-${targetId}-${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('center-gallery').upload(fileName, file, { upsert: true });
    if (uploadError) { toast.error('Erreur upload'); setUploadingImage(null); return; }
    const { data: urlData } = supabase.storage.from('center-gallery').getPublicUrl(fileName);
    if (target === 'new') setNewCat(prev => ({ ...prev, image_url: urlData.publicUrl }));
    else setEditForm(prev => ({ ...prev, image_url: urlData.publicUrl }));
    setUploadingImage(null);
  };

  const handleCreate = async () => {
    if (!newCat.name.trim()) { toast.error('Veuillez saisir un nom'); return; }
    const { error } = await createCategory({ name: newCat.name, description: newCat.description || undefined, image_url: newCat.image_url || undefined });
    if (error) toast.error('Erreur'); else { toast.success('Catégorie créée'); setIsCreating(false); setNewCat({ name: '', description: '', image_url: '' }); }
  };

  const handleSave = async () => {
    if (!editingId) return;
    const { error } = await updateCategory(editingId, editForm);
    if (error) toast.error('Erreur'); else { toast.success('Catégorie mise à jour'); setEditingId(null); }
  };

  const handleDelete = async (id: string) => {
    const { error } = await deleteCategory(id);
    if (error) toast.error('Erreur'); else toast.success('Catégorie supprimée');
  };

  if (loading) return <DashboardLayout title="Catégories"><div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></DashboardLayout>;

  return (
    <DashboardLayout title="Catégories">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-1">Catégories de services</h2>
          <p className="text-sm text-muted-foreground">Groupez vos formules par catégorie (ex: Véhicules, Matelas, Vitres...)</p>
        </div>
        <Button onClick={() => setIsCreating(true)} disabled={isCreating} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" /> Nouvelle catégorie
        </Button>
      </div>

      {isCreating && (
        <Card variant="elevated" className="p-4 sm:p-6 mb-4 border-2 border-primary/20">
          <h3 className="font-semibold mb-4">Nouvelle catégorie</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nom *</Label>
              <Input value={newCat.name} onChange={e => setNewCat({ ...newCat, name: e.target.value })} placeholder="Ex: Véhicules" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={newCat.description} onChange={e => setNewCat({ ...newCat, description: e.target.value })} placeholder="Description optionnelle..." rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Image (optionnel)</Label>
              <input ref={newImageRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f, 'new'); }} />
              {newCat.image_url ? (
                <div className="relative inline-block">
                  <img src={newCat.image_url} alt="" className="w-32 h-24 object-cover rounded-lg" />
                  <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => setNewCat({ ...newCat, image_url: '' })}><X className="w-3 h-3" /></Button>
                </div>
              ) : (
                <Button type="button" variant="outline" disabled={uploadingImage === 'new-cat'} onClick={() => newImageRef.current?.click()}>
                  {uploadingImage === 'new-cat' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ImageIcon className="w-4 h-4 mr-2" />} Ajouter une image
                </Button>
              )}
            </div>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setIsCreating(false)}>Annuler</Button>
              <Button onClick={handleCreate}>Créer</Button>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {categories.length === 0 && !isCreating ? (
          <Card variant="elevated" className="p-6 sm:p-8 text-center">
            <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">Aucune catégorie créée</p>
            <p className="text-sm text-muted-foreground mb-4">Les catégories sont optionnelles. Elles permettent de grouper vos formules (ex: "Que souhaitez-vous nettoyer ?").</p>
            <Button onClick={() => setIsCreating(true)}><Plus className="w-4 h-4 mr-2" /> Créer une catégorie</Button>
          </Card>
        ) : (
          categories.map(cat => (
            <Card key={cat.id} variant="elevated" className="p-4 sm:p-6">
              {editingId === cat.id ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nom</Label>
                    <Input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} rows={2} />
                  </div>
                  <div className="space-y-2">
                    <Label>Image</Label>
                    <input ref={editImageRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f, 'edit'); }} />
                    {editForm.image_url ? (
                      <div className="relative inline-block">
                        <img src={editForm.image_url} alt="" className="w-32 h-24 object-cover rounded-lg" />
                        <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => setEditForm({ ...editForm, image_url: '' })}><X className="w-3 h-3" /></Button>
                      </div>
                    ) : (
                      <Button type="button" variant="outline" disabled={uploadingImage === cat.id} onClick={() => editImageRef.current?.click()}>
                        {uploadingImage === cat.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ImageIcon className="w-4 h-4 mr-2" />} Ajouter une image
                      </Button>
                    )}
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setEditingId(null)}>Annuler</Button>
                    <Button onClick={handleSave}>Enregistrer</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  {cat.image_url && <img src={cat.image_url} alt={cat.name} className="w-16 h-16 object-cover rounded-xl flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">{cat.name}</h3>
                    {cat.description && <p className="text-sm text-muted-foreground line-clamp-1">{cat.description}</p>}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => { setEditingId(cat.id); setEditForm({ name: cat.name, description: cat.description || '', image_url: cat.image_url || '' }); }}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(cat.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}
