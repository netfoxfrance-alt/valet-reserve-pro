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
import { Pencil, Clock, Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardPacks() {
  const { packs, loading, createPack, updatePack, deletePack } = useMyPacks();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Pack>>({});
  const [newPack, setNewPack] = useState({
    name: '',
    description: '',
    price: 0,
    duration: '1h',
    features: [] as string[],
    sort_order: 0,
    active: true
  });

  const handleEdit = (pack: Pack) => {
    setEditingId(pack.id);
    setEditForm({
      name: pack.name,
      description: pack.description,
      price: pack.price,
      duration: pack.duration,
      features: pack.features
    });
  };

  const handleSave = async () => {
    if (!editingId) return;
    const { error } = await updatePack(editingId, editForm);
    if (error) {
      toast.error('Erreur lors de la sauvegarde');
    } else {
      toast.success('Pack mis à jour');
      setEditingId(null);
    }
  };

  const handleCreate = async () => {
    if (!newPack.name || newPack.price <= 0) {
      toast.error('Veuillez remplir le nom et le prix');
      return;
    }
    const { error } = await createPack({
      ...newPack,
      sort_order: packs.length
    });
    if (error) {
      toast.error('Erreur lors de la création');
    } else {
      toast.success('Pack créé');
      setIsCreating(false);
      setNewPack({
        name: '',
        description: '',
        price: 0,
        duration: '1h',
        features: [],
        sort_order: 0,
        active: true
      });
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await deletePack(id);
    if (error) {
      toast.error('Erreur lors de la suppression');
    } else {
      toast.success('Pack supprimé');
    }
  };

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
          title="Packs" 
          onMenuClick={() => setMobileMenuOpen(true)}
        />
        
        <main className="p-4 lg:p-8 max-w-4xl">
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-1 sm:mb-2">Vos offres</h2>
              <p className="text-sm text-muted-foreground">Configurez les packs proposés à vos clients.</p>
            </div>
            <Button onClick={() => setIsCreating(true)} disabled={isCreating} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau pack
            </Button>
          </div>

          {isCreating && (
            <Card variant="elevated" className="p-4 sm:p-6 mb-4 border-2 border-primary/20">
              <h3 className="font-semibold mb-4">Nouveau pack</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-name">Nom *</Label>
                    <Input
                      id="new-name"
                      value={newPack.name}
                      onChange={(e) => setNewPack({ ...newPack, name: e.target.value })}
                      placeholder="Pack Essentiel"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-price">Prix (€) *</Label>
                    <Input
                      id="new-price"
                      type="number"
                      value={newPack.price || ''}
                      onChange={(e) => setNewPack({ ...newPack, price: parseFloat(e.target.value) || 0 })}
                      placeholder="49"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                    <Label htmlFor="new-duration">Durée</Label>
                    <Input
                      id="new-duration"
                      value={newPack.duration}
                      onChange={(e) => setNewPack({ ...newPack, duration: e.target.value })}
                      placeholder="1h"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-description">Description</Label>
                  <Textarea
                    id="new-description"
                    value={newPack.description}
                    onChange={(e) => setNewPack({ ...newPack, description: e.target.value })}
                    placeholder="Description du pack..."
                  />
                </div>
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
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
                <p className="text-muted-foreground mb-4">Aucun pack créé pour le moment.</p>
                <Button onClick={() => setIsCreating(true)} className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Créer votre premier pack
                </Button>
              </Card>
            ) : (
              packs.map((pack) => (
                <Card key={pack.id} variant="elevated" className="p-4 sm:p-6">
                  {editingId === pack.id ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`name-${pack.id}`}>Nom</Label>
                          <Input
                            id={`name-${pack.id}`}
                            value={editForm.name || ''}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`price-${pack.id}`}>Prix (€)</Label>
                          <Input
                            id={`price-${pack.id}`}
                            type="number"
                            value={editForm.price || ''}
                            onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                        <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                          <Label htmlFor={`duration-${pack.id}`}>Durée</Label>
                          <Input
                            id={`duration-${pack.id}`}
                            value={editForm.duration || ''}
                            onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`description-${pack.id}`}>Description</Label>
                        <Textarea
                          id={`description-${pack.id}`}
                          value={editForm.description || ''}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        />
                      </div>
                      <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
                        <Button variant="ghost" onClick={() => setEditingId(null)} className="w-full sm:w-auto">
                          Annuler
                        </Button>
                        <Button onClick={handleSave} className="w-full sm:w-auto">
                          Enregistrer
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-foreground truncate">{pack.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{pack.description}</p>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6">
                        <div className="text-left sm:text-right">
                          <p className="text-xl sm:text-2xl font-bold text-foreground">{pack.price}€</p>
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
                  )}
                </Card>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
