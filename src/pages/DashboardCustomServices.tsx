import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { useMyCustomServices, formatDuration, CustomService } from '@/hooks/useCustomServices';
import { useMyClients } from '@/hooks/useClients';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Clock, FileText, Loader2, Users, ChevronDown, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function DashboardCustomServices() {
  const { t } = useTranslation();
  const { services, loading, createService, updateService, deleteService } = useMyCustomServices();
  const { clients } = useMyClients();
  const { toast } = useToast();

  // New service form state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newHours, setNewHours] = useState(1);
  const [newMinutes, setNewMinutes] = useState(0);
  const [newPrice, setNewPrice] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [newClientIds, setNewClientIds] = useState<string[]>([]);
  const [newClientsOpen, setNewClientsOpen] = useState(false);

  // Edit form state
  const [editingService, setEditingService] = useState<CustomService | null>(null);
  const [editName, setEditName] = useState('');
  const [editHours, setEditHours] = useState(1);
  const [editMinutes, setEditMinutes] = useState(0);
  const [editPrice, setEditPrice] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [editClientIds, setEditClientIds] = useState<string[]>([]);
  const [editClientsOpen, setEditClientsOpen] = useState(false);

  const resetCreateForm = () => {
    setNewName('');
    setNewHours(1);
    setNewMinutes(0);
    setNewPrice('');
    setNewDescription('');
    setNewClientIds([]);
    setNewClientsOpen(false);
  };

  const handleCreate = async () => {
    if (!newName.trim() || !newPrice) {
      toast({ title: t('common.error'), description: t('customServices.nameAndPriceRequired'), variant: "destructive" });
      return;
    }
    setCreating(true);
    const { error, data } = await createService({
      name: newName.trim(),
      duration_minutes: newHours * 60 + newMinutes,
      price: parseFloat(newPrice),
      description: newDescription.trim() || undefined,
    });

    // Link clients to this service
    if (!error && data && newClientIds.length > 0) {
      const serviceId = (data as any).id;
      if (serviceId) {
        await supabase
          .from('client_services')
          .insert(newClientIds.map(cid => ({ client_id: cid, service_id: serviceId })));
      }
    }
    setCreating(false);

    if (error) {
      toast({ title: t('common.error'), description: error, variant: "destructive" });
    } else {
      toast({ title: t('customServices.serviceCreated') });
      resetCreateForm();
      setIsCreateOpen(false);
    }
  };

  const openEdit = async (service: CustomService) => {
    setEditingService(service);
    setEditName(service.name);
    setEditHours(Math.floor(service.duration_minutes / 60));
    setEditMinutes(service.duration_minutes % 60);
    setEditPrice(service.price.toString());
    setEditDescription(service.description || '');
    setEditClientsOpen(false);

    // Fetch linked clients
    const { data } = await supabase
      .from('client_services')
      .select('client_id')
      .eq('service_id', service.id);
    setEditClientIds((data || []).map((r: any) => r.client_id));
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

    // Update client links
    if (!error) {
      // Remove old links
      await supabase
        .from('client_services')
        .delete()
        .eq('service_id', editingService.id);
      // Add new links
      if (editClientIds.length > 0) {
        await supabase
          .from('client_services')
          .insert(editClientIds.map(cid => ({ client_id: cid, service_id: editingService.id })));
      }
    }
    setSaving(false);

    if (error) {
      toast({ title: t('common.error'), description: error, variant: "destructive" });
    } else {
      toast({ title: t('customServices.serviceUpdated') });
      setEditingService(null);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await deleteService(id);
    if (error) {
      toast({ title: t('common.error'), description: error, variant: "destructive" });
    } else {
      toast({ title: t('customServices.serviceDeleted') });
    }
  };

  const ClientSelector = ({ selectedIds, onChange, isOpen, onOpenChange }: {
    selectedIds: string[];
    onChange: (ids: string[]) => void;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
  }) => (
    clients.length > 0 ? (
      <Collapsible open={isOpen} onOpenChange={onOpenChange}>
        <CollapsibleTrigger asChild>
          <button className="flex items-center justify-between w-full text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2">
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Clients liés {selectedIds.length > 0 && `(${selectedIds.length})`}
            </span>
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-1.5 max-h-48 overflow-y-auto border rounded-xl p-3 mt-1">
            {clients.map((c) => (
              <label key={c.id} className="flex items-center gap-3 cursor-pointer hover:bg-secondary/30 rounded-lg p-2 transition-colors">
                <Checkbox
                  checked={selectedIds.includes(c.id)}
                  onCheckedChange={(checked) => onChange(checked ? [...selectedIds, c.id] : selectedIds.filter(id => id !== c.id))}
                />
                <span className="text-sm text-foreground">{c.name}</span>
                {c.client_type === 'professionnel' && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600">PRO</span>
                )}
              </label>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    ) : null
  );

  return (
    <>
      <DashboardLayout title={t('customServices.title')}>
        <div className="max-w-4xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">{t('customServices.customServices')}</h1>
              <p className="text-sm text-muted-foreground mt-1">{t('customServices.createDesc')}</p>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={(v) => { setIsCreateOpen(v); if (!v) resetCreateForm(); }}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto rounded-xl h-11">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('customServices.newService')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{t('customServices.newService')}</DialogTitle>
                  <DialogDescription className="sr-only">Créer une nouvelle prestation</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('customServices.serviceName')}</Label>
                    <Input id="name" placeholder="Ex: Nettoyage vitres bureau" value={newName} onChange={(e) => setNewName(e.target.value)} className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('common.duration')}</Label>
                    <div className="flex gap-3">
                      <div className="flex items-center gap-2 flex-1">
                        <Input type="number" min={0} max={10} value={newHours} onChange={(e) => setNewHours(parseInt(e.target.value) || 0)} className="h-11 rounded-xl text-center" />
                        <span className="text-sm text-muted-foreground">h</span>
                      </div>
                      <div className="flex items-center gap-2 flex-1">
                        <Input type="number" min={0} max={59} step={5} value={newMinutes} onChange={(e) => setNewMinutes(parseInt(e.target.value) || 0)} className="h-11 rounded-xl text-center" />
                        <span className="text-sm text-muted-foreground">min</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">{t('customServices.priceLabel')}</Label>
                    <Input id="price" type="number" min={0} step={0.01} placeholder="85" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">{t('customServices.descriptionOptional')}</Label>
                    <Textarea id="description" placeholder="..." value={newDescription} onChange={(e) => setNewDescription(e.target.value)} className="rounded-xl resize-none" rows={2} />
                  </div>
                  <ClientSelector selectedIds={newClientIds} onChange={setNewClientIds} isOpen={newClientsOpen} onOpenChange={setNewClientsOpen} />
                  <Button onClick={handleCreate} className="w-full h-11 rounded-xl" disabled={creating}>
                    {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {t('customServices.createAction')}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32 rounded-2xl" />
              ))}
            </div>
          ) : services.length === 0 ? (
            <Card variant="elevated" className="rounded-2xl">
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="font-medium text-foreground">{t('customServices.noServices')}</p>
                <p className="text-sm text-muted-foreground mt-1">{t('customServices.createFirst')}</p>
                <Button onClick={() => setIsCreateOpen(true)} className="mt-4 rounded-xl">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('customServices.createService')}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
              {services.map((service) => (
                <Card
                  key={service.id}
                  variant="elevated"
                  className={`rounded-2xl cursor-pointer hover:shadow-md transition-all ${!service.active ? 'opacity-60' : ''}`}
                  onClick={() => openEdit(service)}
                >
                  <CardHeader className="pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base sm:text-lg leading-tight">{service.name}</CardTitle>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" onClick={(e) => { e.stopPropagation(); openEdit(service); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" onClick={(e) => { e.stopPropagation(); handleDelete(service.id); }}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                    <div className="flex items-center gap-3 sm:gap-4 text-sm">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{formatDuration(service.duration_minutes)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-semibold text-emerald-600">
                        {service.price}€
                      </div>
                    </div>
                    {service.description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{service.description}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>

      {/* Edit Dialog */}
      <Dialog open={!!editingService} onOpenChange={(open) => { if (!open) { setEditingService(null); setEditClientsOpen(false); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('customServices.editService')}</DialogTitle>
            <DialogDescription className="sr-only">Modifier la prestation</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="editName">{t('customServices.serviceName')}</Label>
              <Input id="editName" value={editName} onChange={(e) => setEditName(e.target.value)} className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>{t('common.duration')}</Label>
              <div className="flex gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <Input type="number" min={0} max={10} value={editHours} onChange={(e) => setEditHours(parseInt(e.target.value) || 0)} className="h-11 rounded-xl text-center" />
                  <span className="text-sm text-muted-foreground">h</span>
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <Input type="number" min={0} max={59} step={5} value={editMinutes} onChange={(e) => setEditMinutes(parseInt(e.target.value) || 0)} className="h-11 rounded-xl text-center" />
                  <span className="text-sm text-muted-foreground">min</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editPrice">{t('customServices.priceLabel')}</Label>
              <Input id="editPrice" type="number" min={0} step={0.01} value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editDescription">{t('customServices.descriptionOptional')}</Label>
              <Textarea id="editDescription" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="rounded-xl resize-none" rows={2} />
            </div>
            <ClientSelector selectedIds={editClientIds} onChange={setEditClientIds} isOpen={editClientsOpen} onOpenChange={setEditClientsOpen} />
            <Button onClick={handleSave} className="w-full h-11 rounded-xl" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t('common.save')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
