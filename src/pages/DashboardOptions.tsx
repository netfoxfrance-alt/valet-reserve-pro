import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useMyServiceOptions } from '@/hooks/useServiceOptions';
import { useMyPacks } from '@/hooks/useCenter';
import { Plus, Pencil, Trash2, Loader2, Settings2, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardOptions() {
  const { options, loading, createOption, updateOption, deleteOption, linkOptionToPack, unlinkOptionFromPack, isOptionLinked } = useMyServiceOptions();
  const { packs } = useMyPacks();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [managingLinksId, setManagingLinksId] = useState<string | null>(null);
  const [newOpt, setNewOpt] = useState({ name: '', price: 0, duration_minutes: 0, description: '' });
  const [editForm, setEditForm] = useState({ name: '', price: 0, duration_minutes: 0, description: '' });

  const handleCreate = async () => {
    if (!newOpt.name.trim()) { toast.error('Veuillez saisir un nom'); return; }
    const { error } = await createOption(newOpt);
    if (error) toast.error('Erreur'); else { toast.success('Option créée'); setIsCreating(false); setNewOpt({ name: '', price: 0, duration_minutes: 0, description: '' }); }
  };

  const handleSave = async () => {
    if (!editingId) return;
    const { error } = await updateOption(editingId, editForm);
    if (error) toast.error('Erreur'); else { toast.success('Option mise à jour'); setEditingId(null); }
  };

  const handleDelete = async (id: string) => {
    const { error } = await deleteOption(id);
    if (error) toast.error('Erreur'); else toast.success('Option supprimée');
  };

  const toggleLink = async (packId: string, optionId: string) => {
    if (isOptionLinked(packId, optionId)) {
      await unlinkOptionFromPack(packId, optionId);
    } else {
      await linkOptionToPack(packId, optionId);
    }
  };

  if (loading) return <DashboardLayout title="Options"><div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></DashboardLayout>;

  return (
    <DashboardLayout title="Options supplémentaires">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-1">Options & suppléments</h2>
          <p className="text-sm text-muted-foreground">Proposez des add-ons à vos clients (ex: Traitement cuir, Ozone...)</p>
        </div>
        <Button onClick={() => setIsCreating(true)} disabled={isCreating} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" /> Nouvelle option
        </Button>
      </div>

      {isCreating && (
        <Card variant="elevated" className="p-4 sm:p-6 mb-4 border-2 border-primary/20">
          <h3 className="font-semibold mb-4">Nouvelle option</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nom *</Label>
                <Input value={newOpt.name} onChange={e => setNewOpt({ ...newOpt, name: e.target.value })} placeholder="Ex: Traitement cuir" />
              </div>
              <div className="space-y-2">
                <Label>Prix (€)</Label>
                <Input type="number" value={newOpt.price || ''} onChange={e => setNewOpt({ ...newOpt, price: parseFloat(e.target.value) || 0 })} placeholder="30" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Durée supplémentaire (min)</Label>
              <Input type="number" value={newOpt.duration_minutes || ''} onChange={e => setNewOpt({ ...newOpt, duration_minutes: parseInt(e.target.value) || 0 })} placeholder="15" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={newOpt.description} onChange={e => setNewOpt({ ...newOpt, description: e.target.value })} placeholder="Description optionnelle..." rows={2} />
            </div>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setIsCreating(false)}>Annuler</Button>
              <Button onClick={handleCreate}>Créer</Button>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {options.length === 0 && !isCreating ? (
          <Card variant="elevated" className="p-6 sm:p-8 text-center">
            <Settings2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">Aucune option créée</p>
            <p className="text-sm text-muted-foreground mb-4">Les options sont des suppléments que vos clients peuvent ajouter à une formule (ex: Traitement cuir +30€).</p>
            <Button onClick={() => setIsCreating(true)}><Plus className="w-4 h-4 mr-2" /> Créer une option</Button>
          </Card>
        ) : (
          options.map(opt => (
            <Card key={opt.id} variant="elevated" className="p-4 sm:p-6">
              {editingId === opt.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Nom</Label><Input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} /></div>
                    <div className="space-y-2"><Label>Prix (€)</Label><Input type="number" value={editForm.price || ''} onChange={e => setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })} /></div>
                  </div>
                  <div className="space-y-2"><Label>Durée supplémentaire (min)</Label><Input type="number" value={editForm.duration_minutes || ''} onChange={e => setEditForm({ ...editForm, duration_minutes: parseInt(e.target.value) || 0 })} /></div>
                  <div className="space-y-2"><Label>Description</Label><Textarea value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} rows={2} /></div>
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setEditingId(null)}>Annuler</Button>
                    <Button onClick={handleSave}>Enregistrer</Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-foreground">{opt.name}</h3>
                        <span className="text-lg font-bold text-primary">+{opt.price}€</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        {opt.duration_minutes > 0 && (
                          <span className="text-sm text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> +{opt.duration_minutes}min</span>
                        )}
                        {opt.description && <span className="text-sm text-muted-foreground">{opt.description}</span>}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setManagingLinksId(managingLinksId === opt.id ? null : opt.id)} title="Associer aux formules">
                        <Settings2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => { setEditingId(opt.id); setEditForm({ name: opt.name, price: opt.price, duration_minutes: opt.duration_minutes, description: opt.description || '' }); }}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(opt.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Pack linking panel */}
                  {managingLinksId === opt.id && packs.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-sm font-medium text-foreground mb-3">Proposer cette option avec :</p>
                      <div className="space-y-2">
                        {packs.filter(p => p.active).map(pack => (
                          <label key={pack.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/30 cursor-pointer transition-colors">
                            <Checkbox
                              checked={isOptionLinked(pack.id, opt.id)}
                              onCheckedChange={() => toggleLink(pack.id, opt.id)}
                            />
                            <span className="text-sm text-foreground">{pack.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}
