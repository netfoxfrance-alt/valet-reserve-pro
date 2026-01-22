import { useState, useMemo } from 'react';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { MobileSidebar } from '@/components/dashboard/MobileSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMyAppointments } from '@/hooks/useAppointments';
import { useMyCenter } from '@/hooks/useCenter';
import { useMyClients, Client } from '@/hooks/useClients';
import { useMyCustomServices, formatDuration } from '@/hooks/useCustomServices';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Users, Search, Phone, Mail, Calendar, TrendingUp, Plus, Pencil, Trash2, CalendarPlus, Loader2, UserCheck } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function DashboardClients() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchClient, setSearchClient] = useState('');
  const [activeTab, setActiveTab] = useState('registered');
  const { appointments, loading: loadingAppointments } = useMyAppointments();
  const { center } = useMyCenter();
  const { clients: registeredClients, loading: loadingClients, createClient, updateClient, deleteClient } = useMyClients();
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

  // Clients extracted from appointments (non-registered)
  const extractedClients = useMemo(() => {
    const clientMap: Record<string, {
      name: string;
      phone: string;
      email: string;
      appointments: number;
      totalSpent: number;
      lastVisit: string;
      firstVisit: string;
    }> = {};

    appointments.filter(a => a.status !== 'cancelled').forEach(a => {
      const key = a.client_phone;
      if (!clientMap[key]) {
        clientMap[key] = {
          name: a.client_name,
          phone: a.client_phone,
          email: a.client_email,
          appointments: 0,
          totalSpent: 0,
          lastVisit: a.appointment_date,
          firstVisit: a.appointment_date,
        };
      }
      clientMap[key].appointments++;
      clientMap[key].totalSpent += a.pack?.price || 0;
      if (a.appointment_date > clientMap[key].lastVisit) {
        clientMap[key].lastVisit = a.appointment_date;
      }
      if (a.appointment_date < clientMap[key].firstVisit) {
        clientMap[key].firstVisit = a.appointment_date;
      }
    });

    return Object.values(clientMap)
      .sort((a, b) => b.totalSpent - a.totalSpent);
  }, [appointments]);

  // Filter registered clients
  const filteredRegistered = registeredClients.filter(c =>
    c.name.toLowerCase().includes(searchClient.toLowerCase()) ||
    (c.phone && c.phone.includes(searchClient)) ||
    (c.email && c.email.toLowerCase().includes(searchClient.toLowerCase()))
  );

  // Filter extracted clients
  const filteredExtracted = extractedClients.filter(c =>
    c.name.toLowerCase().includes(searchClient.toLowerCase()) ||
    c.phone.includes(searchClient) ||
    c.email.toLowerCase().includes(searchClient.toLowerCase())
  );

  // Stats
  const totalRevenue = extractedClients.reduce((sum, c) => sum + c.totalSpent, 0);
  const avgPerClient = extractedClients.length > 0 ? Math.round(totalRevenue / extractedClients.length) : 0;
  const returningClients = extractedClients.filter(c => c.appointments > 1).length;

  const loading = loadingAppointments || loadingClients;

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
      toast({ title: "Client créé" });
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

  // Convert extracted client to registered
  const handleConvertClient = (extracted: typeof extractedClients[0]) => {
    setNewClient({
      name: extracted.name,
      email: extracted.email !== 'non-fourni@example.com' ? extracted.email : '',
      phone: extracted.phone,
      address: '',
      default_service_id: '',
      notes: ''
    });
    setIsCreateOpen(true);
    setActiveTab('registered');
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
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
              </div>
              <Skeleton className="h-96" />
            </div>
          ) : (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                <Card variant="elevated" className="p-4 sm:p-5">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                    <UserCheck className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{registeredClients.length}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Clients enregistrés</p>
                </Card>

                <Card variant="elevated" className="p-4 sm:p-5">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center mb-2">
                    <Users className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{extractedClients.length}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Clients total (RDV)</p>
                </Card>

                <Card variant="elevated" className="p-4 sm:p-5">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{avgPerClient}€</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Dépense moyenne</p>
                </Card>

                <Card variant="elevated" className="p-4 sm:p-5">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{returningClients}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Clients fidèles</p>
                </Card>
              </div>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <TabsList>
                    <TabsTrigger value="registered">
                      <UserCheck className="w-4 h-4 mr-2" />
                      Enregistrés ({registeredClients.length})
                    </TabsTrigger>
                    <TabsTrigger value="history">
                      <Users className="w-4 h-4 mr-2" />
                      Historique RDV ({extractedClients.length})
                    </TabsTrigger>
                  </TabsList>

                  <div className="flex gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher..."
                        value={searchClient}
                        onChange={(e) => setSearchClient(e.target.value)}
                        className="pl-9 w-full sm:w-64"
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
                            <Label>Prestation par défaut</Label>
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
                            {services.length === 0 && (
                              <p className="text-xs text-muted-foreground">
                                Créez d'abord une prestation personnalisée dans Configuration → Prestations
                              </p>
                            )}
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
                            Créer le client
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {/* Registered Clients Tab */}
                <TabsContent value="registered">
                  <Card variant="elevated" className="p-4 sm:p-6">
                    {filteredRegistered.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                          <UserCheck className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h4 className="font-medium text-foreground mb-1">
                          {searchClient ? 'Aucun client trouvé' : 'Aucun client enregistré'}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          {searchClient
                            ? 'Essayez avec un autre terme'
                            : 'Créez votre premier client avec une prestation personnalisée'}
                        </p>
                        {!searchClient && (
                          <Button onClick={() => setIsCreateOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Nouveau client
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredRegistered.map((client) => (
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
                                <p className="font-medium text-foreground truncate">{client.name}</p>
                                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                                  {client.phone && (
                                    <a href={`tel:${client.phone}`} className="flex items-center gap-1 hover:text-primary">
                                      <Phone className="w-3 h-3" />
                                      {client.phone}
                                    </a>
                                  )}
                                  {client.email && (
                                    <a href={`mailto:${client.email}`} className="flex items-center gap-1 hover:text-primary">
                                      <Mail className="w-3 h-3" />
                                      <span className="truncate max-w-[150px]">{client.email}</span>
                                    </a>
                                  )}
                                </div>
                                {client.default_service && (
                                  <p className="text-xs text-primary mt-1">
                                    {client.default_service.name} • {formatDuration(client.default_service.duration_minutes)} • {client.default_service.price}€
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
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
                </TabsContent>

                {/* History Tab */}
                <TabsContent value="history">
                  <Card variant="elevated" className="p-4 sm:p-6">
                    <p className="text-sm text-muted-foreground mb-4">
                      Clients extraits automatiquement de vos réservations. Cliquez sur "Enregistrer" pour leur attacher une prestation personnalisée.
                    </p>
                    {filteredExtracted.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                          <Users className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h4 className="font-medium text-foreground mb-1">
                          {searchClient ? 'Aucun client trouvé' : 'Aucun client pour le moment'}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {searchClient
                            ? 'Essayez avec un autre terme de recherche'
                            : 'Vos clients apparaîtront ici après leur première réservation'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredExtracted.map((client) => (
                          <div
                            key={client.phone}
                            className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-secondary/20 rounded-xl hover:bg-secondary/40 transition-colors"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-semibold text-muted-foreground">
                                  {client.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-foreground truncate">{client.name}</p>
                                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                                  <a href={`tel:${client.phone}`} className="flex items-center gap-1 hover:text-primary">
                                    <Phone className="w-3 h-3" />
                                    {client.phone}
                                  </a>
                                  {client.email && client.email !== 'non-fourni@example.com' && (
                                    <a href={`mailto:${client.email}`} className="flex items-center gap-1 hover:text-primary">
                                      <Mail className="w-3 h-3" />
                                      <span className="truncate max-w-[150px]">{client.email}</span>
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-6 sm:gap-8 pl-13 sm:pl-0">
                              <div className="text-center">
                                <p className="font-semibold text-foreground">{client.appointments}</p>
                                <p className="text-xs text-muted-foreground">Visites</p>
                              </div>
                              <div className="text-center">
                                <p className="font-semibold text-foreground">{client.totalSpent}€</p>
                                <p className="text-xs text-muted-foreground">Total</p>
                              </div>
                              <div className="text-center hidden sm:block">
                                <p className="font-semibold text-foreground">
                                  {format(parseISO(client.lastVisit), 'd MMM yyyy', { locale: fr })}
                                </p>
                                <p className="text-xs text-muted-foreground">Dernière visite</p>
                              </div>
                              <Button variant="outline" size="sm" onClick={() => handleConvertClient(client)}>
                                <UserCheck className="w-4 h-4 mr-1" />
                                Enregistrer
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </main>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingClient} onOpenChange={(open) => !open && setEditingClient(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Modifier le client</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
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
              <Label>Prestation par défaut</Label>
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
