import { useState } from 'react';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { MobileSidebar } from '@/components/dashboard/MobileSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMyCenter } from '@/hooks/useCenter';
import { useMyClients, Client } from '@/hooks/useClients';
import { useMyCustomServices, formatDuration } from '@/hooks/useCustomServices';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Users, Search, Phone, Mail, MapPin, Plus, Pencil, Trash2, Loader2, Sparkles, CalendarCheck, UserPlus } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function DashboardClients() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchClient, setSearchClient] = useState('');
  const { center } = useMyCenter();
  const { clients, loading, createClient, updateClient, deleteClient } = useMyClients();
  const { services } = useMyCustomServices();
  const { toast } = useToast();

  // Form states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    default_service_id: '',
    notes: ''
  });

  // Edit states
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    default_service_id: '',
    notes: ''
  });
  const [saving, setSaving] = useState(false);

  // Filter clients
  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(searchClient.toLowerCase()) ||
    (c.phone && c.phone.includes(searchClient)) ||
    (c.email && c.email.toLowerCase().includes(searchClient.toLowerCase()))
  );

  // Stats
  const totalClients = clients.length;
  const manualClients = clients.filter(c => c.source === 'manual').length;
  const bookingClients = clients.filter(c => c.source === 'booking').length;

  const resetCreateForm = () => {
    setNewClient({ name: '', email: '', phone: '', address: '', default_service_id: '', notes: '' });
  };

  const handleCreate = async () => {
    if (!newClient.name.trim()) {
      toast({ title: "Erreur", description: "Le nom est requis", variant: "destructive" });
      return;
    }
    setCreating(true);
    const { error } = await createClient({
      name: newClient.name.trim(),
      email: newClient.email.trim() || undefined,
      phone: newClient.phone.trim() || undefined,
      address: newClient.address.trim() || undefined,
      default_service_id: newClient.default_service_id || null,
      notes: newClient.notes.trim() || undefined,
    });
    setCreating(false);

    if (error) {
      toast({ title: "Erreur", description: error, variant: "destructive" });
    } else {
      toast({ title: "Client ajouté" });
      resetCreateForm();
      setIsCreateOpen(false);
    }
  };

  const openEdit = (client: Client) => {
    setEditingClient(client);
    setEditForm({
      name: client.name,
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
      default_service_id: client.default_service_id || '',
      notes: client.notes || ''
    });
  };

  const handleSave = async () => {
    if (!editingClient || !editForm.name.trim()) return;
    setSaving(true);
    const { error } = await updateClient(editingClient.id, {
      name: editForm.name.trim(),
      email: editForm.email.trim() || null,
      phone: editForm.phone.trim() || null,
      address: editForm.address.trim() || null,
      default_service_id: editForm.default_service_id || null,
      notes: editForm.notes.trim() || null,
    });
    setSaving(false);

    if (error) {
      toast({ title: "Erreur", description: error, variant: "destructive" });
    } else {
      toast({ title: "Client modifié" });
      setEditingClient(null);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await deleteClient(id);
    if (error) {
      toast({ title: "Erreur", description: error, variant: "destructive" });
    } else {
      toast({ title: "Client supprimé" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <MobileSidebar open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} />

      <div className="lg:pl-64">
        <DashboardHeader
          title="Clients"
          subtitle={center?.name}
          onMenuClick={() => setMobileMenuOpen(true)}
        />

        <main className="p-4 lg:p-8">
          {loading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}
              </div>
              <Skeleton className="h-96" />
            </div>
          ) : (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
                <Card variant="elevated" className="p-4 sm:p-5">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{totalClients}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Total clients</p>
                </Card>

                <Card variant="elevated" className="p-4 sm:p-5">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center mb-2">
                    <CalendarCheck className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{bookingClients}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Via réservation</p>
                </Card>

                <Card variant="elevated" className="p-4 sm:p-5">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center mb-2">
                    <UserPlus className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{manualClients}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Ajout manuel</p>
                </Card>
              </div>

              {/* Search and New Client Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un client..."
                    value={searchClient}
                    onChange={(e) => setSearchClient(e.target.value)}
                    className="pl-9 w-full sm:w-80"
                  />
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Nouveau client
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Nouveau client</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Nom *</Label>
                        <Input
                          placeholder="Jean Dupont"
                          value={newClient.name}
                          onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Téléphone</Label>
                          <Input
                            placeholder="06 12 34 56 78"
                            value={newClient.phone}
                            onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Email</Label>
                          <Input
                            type="email"
                            placeholder="jean@email.com"
                            value={newClient.email}
                            onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Adresse</Label>
                        <Input
                          placeholder="123 rue Example, 75000 Paris"
                          value={newClient.address}
                          onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-primary" />
                          Prestation personnalisée
                        </Label>
                        <Select
                          value={newClient.default_service_id || "none"}
                          onValueChange={(v) => setNewClient({ ...newClient, default_service_id: v === "none" ? "" : v })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Aucune prestation" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Aucune</SelectItem>
                            {services.map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.name} - {formatDuration(s.duration_minutes)} - {s.price}€
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          {services.length === 0 
                            ? "Créez d'abord une prestation dans Configuration → Prestations"
                            : "Prestation utilisée par défaut pour ce client"
                          }
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label>Notes</Label>
                        <Textarea
                          placeholder="Informations supplémentaires..."
                          value={newClient.notes}
                          onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
                        />
                      </div>
                      <Button onClick={handleCreate} className="w-full" disabled={creating}>
                        {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Ajouter le client
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Client List */}
              <Card variant="elevated" className="p-4 sm:p-6">
                {filteredClients.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h4 className="font-medium text-foreground mb-1">
                      {searchClient ? 'Aucun client trouvé' : 'Aucun client pour le moment'}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      {searchClient
                        ? 'Essayez avec un autre terme de recherche'
                        : 'Les clients seront ajoutés automatiquement lors des réservations'}
                    </p>
                    {!searchClient && (
                      <Button onClick={() => setIsCreateOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter un client
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredClients.map((client) => (
                      <div
                        key={client.id}
                        className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-secondary/20 rounded-xl hover:bg-secondary/40 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-semibold text-primary">
                              {client.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium text-foreground">{client.name}</p>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                client.source === 'booking' 
                                  ? 'bg-blue-500/10 text-blue-600' 
                                  : 'bg-muted text-muted-foreground'
                              }`}>
                                {client.source === 'booking' ? 'Réservation' : 'Manuel'}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground mt-1">
                              {client.phone && (
                                <a href={`tel:${client.phone}`} className="flex items-center gap-1 hover:text-primary">
                                  <Phone className="w-3 h-3" />
                                  {client.phone}
                                </a>
                              )}
                              {client.email && (
                                <a href={`mailto:${client.email}`} className="flex items-center gap-1 hover:text-primary">
                                  <Mail className="w-3 h-3" />
                                  <span className="truncate max-w-[180px]">{client.email}</span>
                                </a>
                              )}
                              {client.address && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  <span className="truncate max-w-[180px]">{client.address}</span>
                                </span>
                              )}
                            </div>
                            {client.default_service && (
                              <p className="text-xs text-primary mt-1 flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                {client.default_service.name} • {formatDuration(client.default_service.duration_minutes)} • {client.default_service.price}€
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <span className="text-xs text-muted-foreground hidden sm:block">
                            Ajouté le {format(parseISO(client.created_at), 'd MMM yyyy', { locale: fr })}
                          </span>
                          <Button variant="outline" size="sm" onClick={() => openEdit(client)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(client.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </>
          )}
        </main>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingClient} onOpenChange={(open) => !open && setEditingClient(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Fiche client</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {editingClient && (
              <p className="text-sm text-muted-foreground">
                Client ajouté {editingClient.source === 'booking' ? 'via réservation' : 'manuellement'} le {format(parseISO(editingClient.created_at), 'd MMMM yyyy', { locale: fr })}
              </p>
            )}
            <div className="space-y-2">
              <Label>Nom *</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Téléphone</Label>
                <Input
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Adresse</Label>
              <Input
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Prestation personnalisée
              </Label>
              <Select
                value={editForm.default_service_id || "none"}
                onValueChange={(v) => setEditForm({ ...editForm, default_service_id: v === "none" ? "" : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Aucune prestation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune</SelectItem>
                  {services.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} - {formatDuration(s.duration_minutes)} - {s.price}€
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
              />
            </div>
            <Button onClick={handleSave} className="w-full" disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Enregistrer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
