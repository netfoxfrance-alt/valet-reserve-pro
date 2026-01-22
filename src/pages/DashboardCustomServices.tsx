import { useState } from 'react';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { MobileSidebar } from '@/components/dashboard/MobileSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useMyCustomServices, formatDuration, CustomService } from '@/hooks/useCustomServices';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Clock, Euro, FileText, Loader2 } from 'lucide-react';

export default function DashboardCustomServices() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { services, loading, createService, updateService, deleteService } = useMyCustomServices();
  const { toast } = useToast();

  // New service form state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newHours, setNewHours] = useState(1);
  const [newMinutes, setNewMinutes] = useState(0);
  const [newPrice, setNewPrice] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [creating, setCreating] = useState(false);

  // Edit form state
  const [editingService, setEditingService] = useState<CustomService | null>(null);
  const [editName, setEditName] = useState('');
  const [editHours, setEditHours] = useState(1);
  const [editMinutes, setEditMinutes] = useState(0);
  const [editPrice, setEditPrice] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const resetCreateForm = () => {
    setNewName('');
    setNewHours(1);
    setNewMinutes(0);
    setNewPrice('');
    setNewDescription('');
  };

  const handleCreate = async () => {
    if (!newName.trim() || !newPrice) {
      toast({ title: "Erreur", description: "Nom et prix requis", variant: "destructive" });
      return;
    }
    setCreating(true);
    const { error } = await createService({
      name: newName.trim(),
      duration_minutes: newHours * 60 + newMinutes,
      price: parseFloat(newPrice),
      description: newDescription.trim() || undefined,
    });
    setCreating(false);

    if (error) {
      toast({ title: "Erreur", description: error, variant: "destructive" });
    } else {
      toast({ title: "Prestation créée" });
      resetCreateForm();
      setIsCreateOpen(false);
    }
  };

  const openEdit = (service: CustomService) => {
    setEditingService(service);
    setEditName(service.name);
    setEditHours(Math.floor(service.duration_minutes / 60));
    setEditMinutes(service.duration_minutes % 60);
    setEditPrice(service.price.toString());
    setEditDescription(service.description || '');
  };

  const handleSave = async () => {
    if (!editingService || !editName.trim() || !editPrice) return;
    setSaving(true);
    const { error } = await updateService(editingService.id, {
      name: editName.trim(),
      duration_minutes: editHours * 60 + editMinutes,
      price: parseFloat(editPrice),
      description: editDescription.trim() || null,
    });
    setSaving(false);

    if (error) {
      toast({ title: "Erreur", description: error, variant: "destructive" });
    } else {
      toast({ title: "Prestation modifiée" });
      setEditingService(null);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await deleteService(id);
    if (error) {
      toast({ title: "Erreur", description: error, variant: "destructive" });
    } else {
      toast({ title: "Prestation supprimée" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar />
      <MobileSidebar open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} />

      <div className="flex-1 flex flex-col lg:ml-72">
        <DashboardHeader title="Prestations" onMenuClick={() => setMobileMenuOpen(true)} />

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Prestations personnalisées</h1>
                <p className="text-muted-foreground">
                  Créez des services sur mesure avec durée et prix libres, puis attribuez-les à vos clients réguliers
                </p>
              </div>
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvelle prestation
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nouvelle prestation personnalisée</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom de la prestation</Label>
                      <Input
                        id="name"
                        placeholder="Ex: Nettoyage vitres bureau mensuel"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Durée</Label>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min={0}
                            max={10}
                            value={newHours}
                            onChange={(e) => setNewHours(parseInt(e.target.value) || 0)}
                            className="w-20"
                          />
                          <span className="text-muted-foreground">h</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min={0}
                            max={59}
                            step={5}
                            value={newMinutes}
                            onChange={(e) => setNewMinutes(parseInt(e.target.value) || 0)}
                            className="w-20"
                          />
                          <span className="text-muted-foreground">min</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Prix (€)</Label>
                      <Input
                        id="price"
                        type="number"
                        min={0}
                        step={0.01}
                        placeholder="85"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description (optionnelle)</Label>
                      <Textarea
                        id="description"
                        placeholder="Détails de la prestation..."
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleCreate} className="w-full" disabled={creating}>
                      {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Créer la prestation
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {loading ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            ) : services.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Aucune prestation personnalisée</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Créez votre première prestation pour pouvoir l'attacher à vos clients
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {services.map((service) => (
                  <Card key={service.id} className={!service.active ? 'opacity-60' : ''}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{service.name}</CardTitle>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(service)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(service.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {formatDuration(service.duration_minutes)}
                        </div>
                        <div className="flex items-center gap-1 font-semibold text-primary">
                          <Euro className="h-4 w-4" />
                          {service.price}€
                        </div>
                      </div>
                      {service.description && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {service.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingService} onOpenChange={(open) => !open && setEditingService(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la prestation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="editName">Nom de la prestation</Label>
              <Input
                id="editName"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Durée</Label>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    max={10}
                    value={editHours}
                    onChange={(e) => setEditHours(parseInt(e.target.value) || 0)}
                    className="w-20"
                  />
                  <span className="text-muted-foreground">h</span>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    max={59}
                    step={5}
                    value={editMinutes}
                    onChange={(e) => setEditMinutes(parseInt(e.target.value) || 0)}
                    className="w-20"
                  />
                  <span className="text-muted-foreground">min</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editPrice">Prix (€)</Label>
              <Input
                id="editPrice"
                type="number"
                min={0}
                step={0.01}
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editDescription">Description (optionnelle)</Label>
              <Textarea
                id="editDescription"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </div>
            <Button onClick={handleSave} className="w-full" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Enregistrer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
