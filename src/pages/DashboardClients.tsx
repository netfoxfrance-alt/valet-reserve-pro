import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Checkbox } from '@/components/ui/checkbox';
import { useMyCenter } from '@/hooks/useCenter';
import { useMyClients, Client } from '@/hooks/useClients';
import { useMyCustomServices, formatDuration } from '@/hooks/useCustomServices';
import { useClientServices } from '@/hooks/useClientServices';
import { ClientDetailDialog } from '@/components/clients/ClientDetailDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Search, Phone, Mail, Plus, Pencil, Trash2, Loader2, Eye, Building2, User, ChevronDown, ChevronRight } from 'lucide-react';
import { ClientType } from '@/hooks/useClients';
import { format, parseISO } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

type ClientFilter = 'all' | 'particulier' | 'professionnel';

export default function DashboardClients() {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === 'en' ? enUS : fr;
  const { center } = useMyCenter();
  const { clients, loading, createClient, updateClient, deleteClient } = useMyClients();
  const { services } = useMyCustomServices();
  const { toast } = useToast();

  const [searchClient, setSearchClient] = useState('');
  const [clientFilter, setClientFilter] = useState<ClientFilter>('all');

  // Form states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '', email: '', phone: '', address: '', notes: '',
    client_type: 'particulier' as ClientType,
    company_name: '',
  });
  const [newServiceIds, setNewServiceIds] = useState<string[]>([]);
  const [newServicesOpen, setNewServicesOpen] = useState(false);

  // Edit states
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editForm, setEditForm] = useState({
    name: '', email: '', phone: '', address: '', notes: '',
    client_type: 'particulier' as ClientType,
    company_name: '',
  });
  const [saving, setSaving] = useState(false);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);
  const [editServicesOpen, setEditServicesOpen] = useState(false);

  const { serviceIds: editServiceIds, setServices: saveEditServices } = useClientServices(editingClient?.id || null);

  // Filter clients
  const filteredClients = clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchClient.toLowerCase()) ||
      (c.phone && c.phone.includes(searchClient)) ||
      (c.email && c.email.toLowerCase().includes(searchClient.toLowerCase()));
    const matchesFilter = clientFilter === 'all' || c.client_type === clientFilter;
    return matchesSearch && matchesFilter;
  });

  // Stats
  const totalClients = clients.length;
  const proClients = clients.filter(c => c.client_type === 'professionnel').length;
  const partClients = clients.filter(c => c.client_type === 'particulier').length;

  const resetCreateForm = () => {
    setNewClient({ name: '', email: '', phone: '', address: '', notes: '', client_type: 'particulier', company_name: '' });
    setNewServiceIds([]);
    setNewServicesOpen(false);
  };

  const handleCreate = async () => {
    if (!newClient.name.trim()) {
      toast({ title: "Erreur", description: "Le nom est requis", variant: "destructive" });
      return;
    }
    setCreating(true);
    const { error, data: createdClient } = await createClient({
      name: newClient.name.trim(),
      email: newClient.email.trim() || undefined,
      phone: newClient.phone.trim() || undefined,
      address: newClient.address.trim() || undefined,
      notes: newClient.notes.trim() || undefined,
      client_type: newClient.client_type,
      company_name: newClient.client_type === 'professionnel' ? newClient.company_name.trim() || undefined : undefined,
    } as any);

    if (!error && createdClient && newServiceIds.length > 0) {
      const clientId = (createdClient as any).id;
      if (clientId) {
        await supabase
          .from('client_services')
          .insert(newServiceIds.map(sid => ({ client_id: clientId, service_id: sid })));
      }
    }
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
      notes: client.notes || '',
      client_type: client.client_type || 'particulier',
      company_name: client.company_name || '',
    });
    setEditServicesOpen(false);
  };

  const handleSave = async () => {
    if (!editingClient || !editForm.name.trim()) return;
    setSaving(true);
    const { error } = await updateClient(editingClient.id, {
      name: editForm.name.trim(),
      email: editForm.email.trim() || null,
      phone: editForm.phone.trim() || null,
      address: editForm.address.trim() || null,
      notes: editForm.notes.trim() || null,
      client_type: editForm.client_type,
      company_name: editForm.client_type === 'professionnel' ? editForm.company_name.trim() || null : null,
    });

    if (!error) {
      await saveEditServices(editServiceIds);
    }
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

  const filterButtons: { key: ClientFilter; label: string; count: number }[] = [
    { key: 'all', label: 'Tous', count: totalClients },
    { key: 'particulier', label: 'Particuliers', count: partClients },
    { key: 'professionnel', label: 'Professionnels', count: proClients },
  ];

  return (
    <>
      <DashboardLayout title="Clients" subtitle={center?.name}>
        {loading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
            </div>
            <Skeleton className="h-96 rounded-2xl" />
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
              <Card variant="elevated" className="p-5 rounded-2xl">
                <p className="text-sm font-medium text-muted-foreground mb-1">{t('clients.totalClients')}</p>
                <p className="text-3xl font-bold text-foreground tracking-tight">{totalClients}</p>
              </Card>
              <Card variant="elevated" className="p-5 rounded-2xl">
                <p className="text-sm font-medium text-muted-foreground mb-1">Particuliers</p>
                <p className="text-3xl font-bold text-foreground tracking-tight">{partClients}</p>
              </Card>
              <Card variant="elevated" className="p-5 rounded-2xl">
                <p className="text-sm font-medium text-muted-foreground mb-1">Professionnels</p>
                <p className="text-3xl font-bold text-foreground tracking-tight">{proClients}</p>
              </Card>
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
              {filterButtons.map(f => (
                <button
                  key={f.key}
                  onClick={() => setClientFilter(f.key)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    clientFilter === f.key
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  {f.key === 'professionnel' && <Building2 className="w-3.5 h-3.5" />}
                  {f.key === 'particulier' && <User className="w-3.5 h-3.5" />}
                  {f.label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    clientFilter === f.key ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>{f.count}</span>
                </button>
              ))}
            </div>

            {/* Search + New */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t('clients.searchClient')}
                  value={searchClient}
                  onChange={(e) => setSearchClient(e.target.value)}
                  className="pl-9 h-11 rounded-xl bg-secondary/30 border-0 focus-visible:ring-1"
                />
              </div>
              <Dialog open={isCreateOpen} onOpenChange={(v) => { setIsCreateOpen(v); if (!v) resetCreateForm(); }}>
                <DialogTrigger asChild>
                  <Button className="rounded-xl h-11 shadow-sm">
                    <Plus className="w-4 h-4 mr-2" />
                    {t('clients.newClient')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Nouveau client</DialogTitle>
                    <DialogDescription className="sr-only">Formulaire pour ajouter un nouveau client</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    {/* Type */}
                    <div className="flex gap-2">
                      <Button type="button" variant={newClient.client_type === 'particulier' ? 'default' : 'outline'} size="sm" className="flex-1 gap-2 rounded-xl h-10" onClick={() => setNewClient({ ...newClient, client_type: 'particulier' })}>
                        <User className="w-4 h-4" /> Particulier
                      </Button>
                      <Button type="button" variant={newClient.client_type === 'professionnel' ? 'default' : 'outline'} size="sm" className="flex-1 gap-2 rounded-xl h-10" onClick={() => setNewClient({ ...newClient, client_type: 'professionnel' })}>
                        <Building2 className="w-4 h-4" /> Professionnel
                      </Button>
                    </div>
                    {newClient.client_type === 'professionnel' && (
                      <div className="space-y-2 animate-fade-in">
                        <Label>Nom de la société</Label>
                        <Input placeholder="SARL Dupont" value={newClient.company_name} onChange={(e) => setNewClient({ ...newClient, company_name: e.target.value })} className="h-11 rounded-xl" />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>Nom *</Label>
                      <Input placeholder="Jean Dupont" value={newClient.name} onChange={(e) => setNewClient({ ...newClient, name: e.target.value })} className="h-11 rounded-xl" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Téléphone</Label>
                        <Input placeholder="06 12 34 56 78" value={newClient.phone} onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })} className="h-11 rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input type="email" placeholder="jean@email.com" value={newClient.email} onChange={(e) => setNewClient({ ...newClient, email: e.target.value })} className="h-11 rounded-xl" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Adresse</Label>
                      <Input placeholder="123 rue Example, 75000 Paris" value={newClient.address} onChange={(e) => setNewClient({ ...newClient, address: e.target.value })} className="h-11 rounded-xl" />
                    </div>

                    {/* Collapsible Services */}
                    {services.length > 0 && (
                      <Collapsible open={newServicesOpen} onOpenChange={setNewServicesOpen}>
                        <CollapsibleTrigger asChild>
                          <button className="flex items-center justify-between w-full text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2">
                            <span>Prestations personnalisées {newServiceIds.length > 0 && `(${newServiceIds.length})`}</span>
                            {newServicesOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="space-y-1.5 max-h-40 overflow-y-auto border rounded-xl p-3 mt-1">
                            {services.map((s) => (
                              <label key={s.id} className="flex items-center gap-3 cursor-pointer hover:bg-secondary/30 rounded-lg p-2 transition-colors">
                                <Checkbox checked={newServiceIds.includes(s.id)} onCheckedChange={(checked) => setNewServiceIds(prev => checked ? [...prev, s.id] : prev.filter(id => id !== s.id))} />
                                <span className="text-sm text-foreground">{s.name} · {formatDuration(s.duration_minutes)} · {s.price}€</span>
                              </label>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    )}

                    <div className="space-y-2">
                      <Label>Notes</Label>
                      <Textarea placeholder="Informations supplémentaires..." value={newClient.notes} onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })} className="rounded-xl resize-none" rows={2} />
                    </div>
                    <Button onClick={handleCreate} className="w-full h-11 rounded-xl" disabled={creating}>
                      {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Ajouter le client
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Client List */}
            {filteredClients.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center mx-auto mb-4">
                  <User className="w-7 h-7 text-muted-foreground/50" />
                </div>
                <h4 className="font-semibold text-foreground mb-1">
                  {searchClient || clientFilter !== 'all' ? t('clients.noClientFound') : t('clients.noClients')}
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchClient ? t('clients.tryOtherSearch') : t('clients.clientsAutoAdded')}
                </p>
                {!searchClient && clientFilter === 'all' && (
                  <Button onClick={() => setIsCreateOpen(true)} className="rounded-xl">
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
                    className="group flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-card rounded-2xl border border-border/50 hover:border-primary/20 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => setViewingClient(client)}
                  >
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                        client.client_type === 'professionnel'
                          ? 'bg-blue-500/10'
                          : 'bg-primary/10'
                      }`}>
                        <span className={`text-sm font-bold ${
                          client.client_type === 'professionnel' ? 'text-blue-600' : 'text-primary'
                        }`}>
                          {client.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground truncate">{client.name}</p>
                          {client.client_type === 'professionnel' && (
                            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 shrink-0">PRO</span>
                          )}
                        </div>
                        {client.company_name && (
                          <p className="text-xs text-muted-foreground truncate">{client.company_name}</p>
                        )}
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground mt-0.5">
                          {client.phone && (
                            <a href={`tel:${client.phone}`} className="flex items-center gap-1 hover:text-primary" onClick={(e) => e.stopPropagation()}>
                              <Phone className="w-3 h-3" />{client.phone}
                            </a>
                          )}
                          {client.email && (
                            <a href={`mailto:${client.email}`} className="flex items-center gap-1 hover:text-primary hidden sm:flex" onClick={(e) => e.stopPropagation()}>
                              <Mail className="w-3 h-3" /><span className="truncate max-w-[160px]">{client.email}</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-xl" onClick={(e) => { e.stopPropagation(); setViewingClient(client); }}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-xl" onClick={(e) => { e.stopPropagation(); openEdit(client); }}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-xl" onClick={(e) => { e.stopPropagation(); handleDelete(client.id); }}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </DashboardLayout>

      {/* Edit Dialog */}
      <Dialog open={!!editingClient} onOpenChange={(open) => { if (!open) { setEditingClient(null); setEditServicesOpen(false); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Fiche client</DialogTitle>
            <DialogDescription className="sr-only">Modifier les informations du client</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {editingClient && (
              <p className="text-xs text-muted-foreground">
                Ajouté {editingClient.source === 'booking' ? 'via réservation' : 'manuellement'} le {format(parseISO(editingClient.created_at), 'd MMMM yyyy', { locale: fr })}
              </p>
            )}
            <div className="flex gap-2">
              <Button type="button" variant={editForm.client_type === 'particulier' ? 'default' : 'outline'} size="sm" className="flex-1 gap-2 rounded-xl h-10" onClick={() => setEditForm({ ...editForm, client_type: 'particulier' })}>
                <User className="w-4 h-4" /> Particulier
              </Button>
              <Button type="button" variant={editForm.client_type === 'professionnel' ? 'default' : 'outline'} size="sm" className="flex-1 gap-2 rounded-xl h-10" onClick={() => setEditForm({ ...editForm, client_type: 'professionnel' })}>
                <Building2 className="w-4 h-4" /> Professionnel
              </Button>
            </div>
            {editForm.client_type === 'professionnel' && (
              <div className="space-y-2 animate-fade-in">
                <Label>Nom de la société</Label>
                <Input value={editForm.company_name} onChange={(e) => setEditForm({ ...editForm, company_name: e.target.value })} className="h-11 rounded-xl" />
              </div>
            )}
            <div className="space-y-2">
              <Label>Nom *</Label>
              <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="h-11 rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Téléphone</Label>
                <Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="h-11 rounded-xl" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Adresse</Label>
              <Input value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} className="h-11 rounded-xl" />
            </div>

            {/* Collapsible Services */}
            {services.length > 0 && (
              <Collapsible open={editServicesOpen} onOpenChange={setEditServicesOpen}>
                <CollapsibleTrigger asChild>
                  <button className="flex items-center justify-between w-full text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2">
                    <span>Prestations personnalisées {editServiceIds.length > 0 && `(${editServiceIds.length})`}</span>
                    {editServicesOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto border rounded-xl p-3 mt-1">
                    {services.map((s) => (
                      <label key={s.id} className="flex items-center gap-3 cursor-pointer hover:bg-secondary/30 rounded-lg p-2 transition-colors">
                        <Checkbox checked={editServiceIds.includes(s.id)} onCheckedChange={(checked) => {
                          const newIds = checked ? [...editServiceIds, s.id] : editServiceIds.filter(id => id !== s.id);
                          saveEditServices(newIds);
                        }} />
                        <span className="text-sm text-foreground">{s.name} · {formatDuration(s.duration_minutes)} · {s.price}€</span>
                      </label>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} className="rounded-xl resize-none" rows={2} />
            </div>
            <Button onClick={handleSave} className="w-full h-11 rounded-xl" disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Enregistrer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ClientDetailDialog
        client={viewingClient}
        open={!!viewingClient}
        onOpenChange={(open) => !open && setViewingClient(null)}
      />
    </>
  );
}
