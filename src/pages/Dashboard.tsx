import { useState, useEffect } from 'react';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { MobileSidebar } from '@/components/dashboard/MobileSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Calendar, Check, X, Plus, Loader2, ChevronLeft, ChevronRight, Phone, Mail, Users, MoreHorizontal, CalendarPlus, CalendarCheck } from 'lucide-react';
import { useMyAppointments, Appointment } from '@/hooks/useAppointments';
import { useMyCenter, useMyPacks } from '@/hooks/useCenter';
import { useMyClients, Client } from '@/hooks/useClients';
import { useMyCustomServices, formatDuration, CustomService } from '@/hooks/useCustomServices';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import { format, isToday, isTomorrow, parseISO, startOfDay, isBefore, addDays, addMonths, startOfMonth, endOfMonth, isSameMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { sendBookingEmail, getClientEmail, buildEmailPayload, EmailType } from '@/lib/emailService';
import { generateAppointmentCalendarUrl } from '@/lib/calendarUtils';
import { AppointmentDetailDialog } from '@/components/dashboard/AppointmentDetailDialog';
import { ConfirmationCalendarDialog } from '@/components/dashboard/ConfirmationCalendarDialog';

// Apple-style status colors - clean and vibrant
const statusConfig: Record<string, { label: string; color: string }> = {
  pending_validation: { label: 'En attente', color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400' },
  pending: { label: 'En attente', color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400' },
  confirmed: { label: 'Confirmé', color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400' },
  completed: { label: 'Terminé', color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400' },
  cancelled: { label: 'Annulé', color: 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400' },
  refused: { label: 'Refusé', color: 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400' },
};

const vehicleLabels: Record<string, string> = {
  citadine: 'Citadine',
  berline: 'Berline',
  suv: 'SUV / 4x4',
  utilitaire: 'Utilitaire',
  standard: 'Standard',
};

function AppointmentRow({ appointment, centerAddress, isSynced, onUpdateStatus, onConfirmAppointment, onRefuseAppointment, onCancelAppointment, onSendEmail, onViewDetails, onAddToCalendar }: { 
  appointment: Appointment; 
  centerAddress?: string;
  isSynced: boolean;
  onUpdateStatus: (id: string, status: Appointment['status']) => void;
  onConfirmAppointment: (appointment: Appointment) => void;
  onRefuseAppointment: (appointment: Appointment) => void;
  onCancelAppointment: (appointment: Appointment) => void;
  onSendEmail: (appointment: Appointment, kind: 'confirmation' | 'reminder') => void;
  onViewDetails: (appointment: Appointment) => void;
  onAddToCalendar: (appointment: Appointment) => void;
}) {
  const status = statusConfig[appointment.status] || statusConfig.pending_validation;
  const date = parseISO(appointment.appointment_date);
  
  let dateLabel = format(date, "EEE d MMM", { locale: fr });
  if (isToday(date)) dateLabel = "Aujourd'hui";
  if (isTomorrow(date)) dateLabel = "Demain";
  
  const canSendEmail = Boolean(appointment.client_email && appointment.client_email !== 'non-fourni@example.com');
  const hasCustomService = Boolean(appointment.custom_service_id);
  const serviceName = appointment.custom_service?.name || appointment.pack?.name;
  const price = appointment.custom_price ?? appointment.custom_service?.price ?? appointment.pack?.price;

  // Generate Google Calendar URL for this appointment with ALL client info
  const handleAddToCalendar = () => {
    const url = generateAppointmentCalendarUrl({
      id: appointment.id,
      client_name: appointment.client_name,
      client_phone: appointment.client_phone,
      client_email: appointment.client_email,
      client_address: appointment.client_address,
      appointment_date: appointment.appointment_date,
      appointment_time: appointment.appointment_time,
      duration_minutes: appointment.duration_minutes,
      vehicle_type: appointment.vehicle_type,
      notes: appointment.notes,
      pack: appointment.pack ? { name: appointment.pack.name, price: appointment.pack.price } : null,
      custom_service: appointment.custom_service ? { name: appointment.custom_service.name, price: appointment.custom_service.price } : null,
      center_address: centerAddress,
    });
    window.open(url, '_blank');
    onAddToCalendar(appointment);
  };

  return (
    <div 
      className="group flex flex-col sm:flex-row sm:items-center gap-4 p-5 bg-card border border-border/50 rounded-2xl hover:border-border hover:shadow-md transition-all duration-200 cursor-pointer"
      onClick={() => onViewDetails(appointment)}
    >
      {/* Left: Avatar + Client info */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 shadow-sm">
          <span className="text-base font-bold text-primary">
            {appointment.client_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-foreground truncate text-base">{appointment.client_name}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            {appointment.pack && (
              <span className="font-medium text-foreground/80">{appointment.pack.name}</span>
            )}
            <span className="hidden sm:inline">•</span>
            <span className="capitalize">{vehicleLabels[appointment.vehicle_type] || appointment.vehicle_type}</span>
          </div>
        </div>
      </div>
      
      {/* Right: Date, price, status, actions */}
      <div className="flex items-center gap-3 sm:gap-5 flex-wrap sm:flex-nowrap">
        {/* Date & time pill */}
        <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-xl">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <div className="text-sm">
            <span className="font-medium text-foreground">{dateLabel}</span>
            <span className="text-muted-foreground ml-2">{appointment.appointment_time.slice(0, 5)}</span>
          </div>
        </div>
        
        {/* Price - Use fallback logic: custom_price > custom_service.price > pack.price */}
        {(price !== undefined && price !== null) && (
          <div className="hidden sm:block text-right min-w-[60px]">
            <p className="text-lg font-bold text-foreground">{price}€</p>
          </div>
        )}
        
        {/* Status badge - Apple style */}
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status.color}`}>
          {status.label}
        </span>
        
        {/* Actions - stop propagation to prevent opening detail dialog */}
        <div className="flex gap-1 opacity-60 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
          {/* Actions menu (manual emails) - only for confirmed appointments */}
          {appointment.status === 'confirmed' && canSendEmail && serviceName && price !== undefined && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-xl"
                  title="Actions"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuItem onClick={() => onSendEmail(appointment, 'reminder')}>
                  <Mail className="w-4 h-4 mr-2" />
                  Envoyer un email de rappel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {/* Pending validation: Confirm or Refuse */}
          {(appointment.status === 'pending_validation' || appointment.status === 'pending') && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl text-primary hover:text-primary hover:bg-primary/10"
                onClick={() => onConfirmAppointment(appointment)}
                title="Confirmer"
              >
                <Check className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => onRefuseAppointment(appointment)}
                title="Refuser"
              >
                <X className="w-4 h-4" />
              </Button>
            </>
          )}
          {/* Confirmed: Add to calendar, complete, or cancel */}
          {appointment.status === 'confirmed' && (
            <>
              {isSynced ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-xl text-primary hover:text-primary hover:bg-primary/10"
                  onClick={handleAddToCalendar}
                  title="Déjà ajouté à l'agenda (cliquez pour rajouter)"
                >
                  <CalendarCheck className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10"
                  onClick={handleAddToCalendar}
                  title="Ajouter à Google Agenda"
                >
                  <CalendarPlus className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-xl text-xs font-medium"
                onClick={() => onUpdateStatus(appointment.id, 'completed')}
              >
                Terminer
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => onCancelAppointment(appointment)}
                title="Annuler"
              >
                <X className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function AddAppointmentDialog({ onAdd, clients, services }: { 
  onAdd: (data: any) => Promise<void>;
  clients: Client[];
  services: CustomService[];
}) {
  const { packs } = useMyPacks();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  // Service type: 'pack' for classic formulas, 'custom' for personalized services
  const [serviceType, setServiceType] = useState<'pack' | 'custom'>('pack');
  const [form, setForm] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    client_address: '',
    pack_id: '',
    custom_service_id: '',
    custom_price: '',
    appointment_date: format(new Date(), 'yyyy-MM-dd'),
    appointment_time: '09:00',
    notes: ''
  });

  // When a registered client is selected, pre-fill form with their data
  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    if (clientId) {
      const client = clients.find(c => c.id === clientId);
      if (client) {
        setForm({
          ...form,
          client_name: client.name,
          client_email: client.email || '',
          client_phone: client.phone || '',
          client_address: client.address || '',
          // Pre-fill with default service if available
          custom_service_id: client.default_service_id || '',
          custom_price: client.default_service?.price?.toString() || '',
          pack_id: '',
        });
        // If client has a default custom service, select custom type
        if (client.default_service_id) {
          setServiceType('custom');
        }
      }
    } else {
      setForm({
        ...form,
        client_name: '',
        client_email: '',
        client_phone: '',
        client_address: '',
        custom_service_id: '',
        custom_price: '',
        pack_id: '',
      });
      setServiceType('pack');
    }
  };

  // When service type changes, reset the respective field
  const handleServiceTypeChange = (type: 'pack' | 'custom') => {
    setServiceType(type);
    if (type === 'pack') {
      setForm({ ...form, custom_service_id: '', custom_price: '' });
    } else {
      setForm({ ...form, pack_id: '' });
    }
  };

  // When custom service is changed, update price accordingly
  const handleCustomServiceChange = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    setForm({
      ...form,
      custom_service_id: serviceId,
      custom_price: service?.price?.toString() || '',
    });
  };

  // When pack is changed
  const handlePackChange = (packId: string) => {
    setForm({ ...form, pack_id: packId });
  };

  // Get selected service/pack details
  const selectedCustomService = services.find(s => s.id === form.custom_service_id);
  const selectedPack = packs.find(p => p.id === form.pack_id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.client_name || !form.client_phone) {
      toast.error('Veuillez remplir le nom et téléphone');
      return;
    }
    setLoading(true);
    
    const payload: any = {
      client_name: form.client_name,
      client_email: form.client_email || 'non-fourni@example.com',
      client_phone: form.client_phone,
      client_address: form.client_address || undefined,
      appointment_date: form.appointment_date,
      appointment_time: form.appointment_time,
      notes: form.notes || undefined,
      vehicle_type: 'standard',
    };

    // Link client if selected
    if (selectedClientId) {
      payload.client_id = selectedClientId;
    }

    // Add service based on type
    if (serviceType === 'custom' && form.custom_service_id) {
      payload.custom_service_id = form.custom_service_id;
      payload.custom_price = parseFloat(form.custom_price) || selectedCustomService?.price;
      payload.duration_minutes = selectedCustomService?.duration_minutes;
      payload.service_name = selectedCustomService?.name;
    } else if (serviceType === 'pack' && form.pack_id) {
      payload.pack_id = form.pack_id;
    }

    await onAdd(payload);
    setLoading(false);
    setOpen(false);
    // Reset form
    setSelectedClientId('');
    setServiceType('pack');
    setForm({
      client_name: '',
      client_email: '',
      client_phone: '',
      client_address: '',
      pack_id: '',
      custom_service_id: '',
      custom_price: '',
      appointment_date: format(new Date(), 'yyyy-MM-dd'),
      appointment_time: '09:00',
      notes: ''
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle réservation
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Ajouter une réservation</DialogTitle>
          <DialogDescription className="sr-only">
            Formulaire pour créer une nouvelle réservation
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Client selection - if we have registered clients */}
          {clients.length > 0 && (
            <div className="space-y-2">
              <Label>Client enregistré</Label>
              <Select value={selectedClientId || "new"} onValueChange={(v) => handleClientSelect(v === "new" ? "" : v)}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Nouveau client ou sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">Nouveau client</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        <span>{client.name}</span>
                        {client.default_service && (
                          <span className="text-xs text-muted-foreground">
                            ({client.default_service.name})
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Service type selector - toggle between packs and custom services */}
          <div className="space-y-3">
            <Label>Type de prestation</Label>
            <div className="flex bg-muted/60 rounded-xl p-1">
              <button
                type="button"
                onClick={() => handleServiceTypeChange('pack')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  serviceType === 'pack' 
                    ? 'bg-background text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Formules
              </button>
              {services.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleServiceTypeChange('custom')}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    serviceType === 'custom' 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Prestations perso
                </button>
              )}
            </div>

            {/* Pack selector */}
            {serviceType === 'pack' && (
              <div className="space-y-2">
                <Select value={form.pack_id} onValueChange={handlePackChange}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="Sélectionner une formule" />
                  </SelectTrigger>
                  <SelectContent>
                    {packs.map((pack) => (
                      <SelectItem key={pack.id} value={pack.id}>
                        {pack.name} - {pack.price}€
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedPack && (
                  <div className="bg-primary/5 rounded-lg p-3 text-sm">
                    <p className="font-medium text-primary">{selectedPack.name}</p>
                    <p className="text-muted-foreground">
                      {selectedPack.duration || 'Durée variable'} • {selectedPack.price}€
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Custom service selector */}
            {serviceType === 'custom' && services.length > 0 && (
              <div className="space-y-2">
                <Select value={form.custom_service_id} onValueChange={handleCustomServiceChange}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="Sélectionner une prestation" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} - {service.price}€ ({formatDuration(service.duration_minutes)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedCustomService && (
                  <div className="bg-primary/5 rounded-lg p-3 text-sm">
                    <p className="font-medium text-primary">{selectedCustomService.name}</p>
                    <p className="text-muted-foreground">
                      {formatDuration(selectedCustomService.duration_minutes)} • {selectedCustomService.price}€
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Client info - only editable for new clients */}
          <div className="space-y-2">
            <Label htmlFor="client_name">Nom du client *</Label>
            <Input
              id="client_name"
              value={form.client_name}
              onChange={(e) => setForm({ ...form, client_name: e.target.value })}
              placeholder="Jean Dupont"
              className="h-11 rounded-xl"
              disabled={!!selectedClientId}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client_phone">Téléphone *</Label>
              <Input
                id="client_phone"
                value={form.client_phone}
                onChange={(e) => setForm({ ...form, client_phone: e.target.value })}
                placeholder="06 12 34 56 78"
                className="h-11 rounded-xl"
                disabled={!!selectedClientId}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client_email">Email</Label>
              <Input
                id="client_email"
                type="email"
                value={form.client_email}
                onChange={(e) => setForm({ ...form, client_email: e.target.value })}
                placeholder="jean@email.com"
                className="h-11 rounded-xl"
                disabled={!!selectedClientId}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="appointment_date">Date *</Label>
              <Input
                id="appointment_date"
                type="date"
                value={form.appointment_date}
                onChange={(e) => setForm({ ...form, appointment_date: e.target.value })}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="appointment_time">Heure *</Label>
              <Input
                id="appointment_time"
                type="time"
                value={form.appointment_time}
                onChange={(e) => setForm({ ...form, appointment_time: e.target.value })}
                className="h-11 rounded-xl"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Informations supplémentaires..."
              rows={2}
              className="rounded-xl resize-none"
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-xl">
              Annuler
            </Button>
            <Button type="submit" disabled={loading} className="rounded-xl min-w-[120px]">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ajouter'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type FilterType = 'all' | 'today' | 'week' | 'month' | 'pending';

export default function Dashboard() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [justConfirmedAppointment, setJustConfirmedAppointment] = useState<Appointment | null>(null);
  const { appointments, loading, updateStatus, createAppointment } = useMyAppointments();
  const { center } = useMyCenter();
  const { clients } = useMyClients();
  const { services } = useMyCustomServices();
  const { markAsSynced, isSynced: checkIsSynced } = useCalendarSync();
  
  const today = startOfDay(new Date());
  const weekEnd = addDays(today, 7);
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  
  const todayAppointments = appointments.filter(a => {
    const date = parseISO(a.appointment_date);
    return isToday(date) && a.status !== 'cancelled';
  });
  
  const pendingAppointments = appointments.filter(a => 
    a.status === 'pending' || a.status === 'pending_validation'
  );
  
  const upcomingAppointments = appointments.filter(a => {
    const date = parseISO(a.appointment_date);
    return !isBefore(date, today) && a.status !== 'cancelled';
  });
  
  const weekAppointments = upcomingAppointments.filter(a => {
    const date = parseISO(a.appointment_date);
    return isBefore(date, weekEnd);
  });

  const monthAppointments = appointments.filter(a => {
    const date = parseISO(a.appointment_date);
    return isSameMonth(date, currentMonth) && a.status !== 'cancelled';
  });

  const filteredAppointments = (() => {
    switch (filter) {
      case 'today':
        return todayAppointments;
      case 'week':
        return weekAppointments;
      case 'month':
        return monthAppointments;
      case 'pending':
        return pendingAppointments;
      default:
        return upcomingAppointments;
    }
  })();

  // Group appointments by date for better visualization
  const groupedAppointments = filteredAppointments.reduce((groups, appointment) => {
    const date = appointment.appointment_date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(appointment);
    return groups;
  }, {} as Record<string, Appointment[]>);

  const sortedDates = Object.keys(groupedAppointments).sort();

  const handleUpdateStatus = async (id: string, status: Appointment['status']) => {
    const { error } = await updateStatus(id, status);
    if (error) {
      toast.error('Erreur lors de la mise à jour');
    } else {
      toast.success('Statut mis à jour');
    }
  };

  const handleAddAppointment = async (data: any) => {
    const { error } = await createAppointment(data);
    if (error) {
      toast.error('Erreur lors de la création');
    } else {
      toast.success('Réservation ajoutée');
    }
  };

  // Open appointment detail dialog and find associated client
  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setDetailDialogOpen(true);
  };

  // Find the client associated with the selected appointment
  const selectedClient = selectedAppointment 
    ? clients.find(c => 
        c.id === selectedAppointment.client_id || 
        (c.phone && c.phone === selectedAppointment.client_phone) ||
        (c.email && c.email === selectedAppointment.client_email)
      ) || null
    : null;

  const handleSendEmail = async (appointment: Appointment, kind: 'confirmation' | 'reminder') => {
    if (!center) return;
    
    const serviceName = appointment.custom_service?.name || appointment.pack?.name;
    const price = appointment.custom_price ?? appointment.custom_service?.price ?? appointment.pack?.price;
    
    if (!serviceName || price === undefined) {
      toast.error('Informations de prestation manquantes');
      return;
    }

    const clientEmail = await getClientEmail(appointment.client_email, appointment.client_id);
    if (!clientEmail) {
      toast.error("Aucun email client valide");
      return;
    }
    
    const toastId = toast.loading(kind === 'reminder' ? 'Envoi du rappel…' : 'Envoi de la confirmation…');
    
    const payload = buildEmailPayload(
      center.id,
      appointment,
      clientEmail,
      serviceName,
      price,
      kind as EmailType
    );
    
    const result = await sendBookingEmail(payload);
    toast.dismiss(toastId);
    
    if (result.success) {
      toast.success(kind === 'reminder' ? 'Email de rappel envoyé' : 'Email de confirmation envoyé');
    } else {
      toast.error("Échec de l'envoi");
    }
  };

  // Helper to send email for status change (fire-and-forget)
  const sendStatusEmail = async (
    appointment: Appointment,
    emailType: EmailType
  ) => {
    if (!center) return;
    
    const serviceName = appointment.custom_service?.name || appointment.pack?.name;
    const price = appointment.custom_price ?? appointment.custom_service?.price ?? appointment.pack?.price;
    
    if (!serviceName || price === undefined) return;
    
    const clientEmail = await getClientEmail(appointment.client_email, appointment.client_id);
    if (!clientEmail) return;
    
    const payload = buildEmailPayload(
      center.id,
      appointment,
      clientEmail,
      serviceName,
      price,
      emailType
    );
    
    // Fire-and-forget: don't await, don't block UI
    sendBookingEmail(payload).catch(() => {});
  };

  // Confirm appointment: update status + send confirmation email + show calendar dialog
  const handleConfirmAppointment = async (appointment: Appointment) => {
    const { error } = await updateStatus(appointment.id, 'confirmed');
    if (error) {
      toast.error('Erreur lors de la confirmation');
      return;
    }
    // Open confirmation dialog with calendar add option
    setJustConfirmedAppointment(appointment);
    setConfirmDialogOpen(true);
    // Send confirmation email (fire-and-forget)
    sendStatusEmail(appointment, 'confirmation');
  };

  // Refuse appointment: update status + send refusal email
  const handleRefuseAppointment = async (appointment: Appointment) => {
    const { error } = await updateStatus(appointment.id, 'refused');
    if (error) {
      toast.error('Erreur lors du refus');
      return;
    }
    toast.success('Demande refusée');
    sendStatusEmail(appointment, 'refused');
  };

  // Cancel appointment: update status + send cancellation email
  const handleCancelAppointment = async (appointment: Appointment) => {
    const { error } = await updateStatus(appointment.id, 'cancelled');
    if (error) {
      toast.error('Erreur lors de l\'annulation');
      return;
    }
    toast.success('Rendez-vous annulé');
    sendStatusEmail(appointment, 'cancelled');
  };

  const stats = [
    { name: "Aujourd'hui", value: todayAppointments.length, highlight: todayAppointments.length > 0 },
    { name: 'En attente', value: pendingAppointments.length, highlight: pendingAppointments.length > 0, isWarning: true },
    { name: 'Semaine', value: weekAppointments.length, highlight: false },
    { name: 'À venir', value: upcomingAppointments.length, highlight: false },
  ];

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'À venir' },
    { key: 'today', label: "Aujourd'hui" },
    { key: 'week', label: 'Semaine' },
    { key: 'month', label: 'Mois' },
    { key: 'pending', label: 'En attente' },
  ];
  
  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <MobileSidebar open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} />
      
      <div className="lg:pl-64">
        <DashboardHeader 
          title="Réservations" 
          subtitle={center?.name}
          onMenuClick={() => setMobileMenuOpen(true)}
        />
        
        <main className="p-4 lg:p-8 max-w-6xl">
          {/* Stats - Responsive 2x2 grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {stats.map((stat) => (
              <Card 
                key={stat.name} 
                variant="elevated" 
                className="p-4 sm:p-5 rounded-2xl hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-1 sm:mb-2">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">{stat.name}</p>
                  {stat.highlight && (
                    <span className={`w-2 h-2 rounded-full ${stat.isWarning ? 'bg-amber-400' : 'bg-emerald-400'} animate-pulse`} />
                  )}
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">{stat.value}</p>
              </Card>
            ))}
          </div>

          {/* Header with filters */}
          <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-foreground">Planning</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {filteredAppointments.length} réservation{filteredAppointments.length !== 1 ? 's' : ''}
                </p>
              </div>
              <AddAppointmentDialog onAdd={handleAddAppointment} clients={clients} services={services} />
            </div>
            
            {/* Filter tabs - scrollable on mobile */}
            <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="flex bg-muted/60 rounded-xl p-1 shrink-0">
                {filters.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
                      filter === key 
                        ? 'bg-background text-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              
              {/* Month navigation */}
              {filter === 'month' && (
                <div className="flex items-center gap-1 sm:gap-2 ml-auto shrink-0">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl"
                    onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-xs sm:text-sm font-medium min-w-[100px] sm:min-w-[120px] text-center capitalize">
                    {format(currentMonth, 'MMM yyyy', { locale: fr })}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl"
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {/* Appointments list grouped by date */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 rounded-2xl" />
              ))}
            </div>
          ) : filteredAppointments.length === 0 ? (
            <Card variant="elevated" className="p-10 text-center rounded-2xl border-0">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-muted/60 flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-2">Aucune réservation</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                {filter === 'all' 
                  ? "Ajoutez une réservation manuellement ou partagez votre page pour recevoir des demandes."
                  : "Aucune réservation pour cette période."
                }
              </p>
            </Card>
          ) : (
            <div className="space-y-6">
              {sortedDates.map((dateStr) => {
                const date = parseISO(dateStr);
                let dateLabel = format(date, "EEEE d MMMM", { locale: fr });
                if (isToday(date)) dateLabel = "Aujourd'hui";
                if (isTomorrow(date)) dateLabel = "Demain";
                
                return (
                  <div key={dateStr}>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-1 capitalize">
                      {dateLabel}
                    </h3>
                    <div className="space-y-2">
                      {groupedAppointments[dateStr].map((appointment) => (
                        <AppointmentRow 
                          key={appointment.id} 
                          appointment={appointment}
                          centerAddress={center?.address || undefined}
                          isSynced={checkIsSynced(appointment.id)}
                          onUpdateStatus={handleUpdateStatus}
                          onConfirmAppointment={handleConfirmAppointment}
                          onRefuseAppointment={handleRefuseAppointment}
                          onCancelAppointment={handleCancelAppointment}
                          onSendEmail={handleSendEmail}
                          onViewDetails={handleViewDetails}
                          onAddToCalendar={(apt) => markAsSynced(apt.id)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
      
      {/* Appointment Detail Dialog */}
      <AppointmentDetailDialog
        appointment={selectedAppointment}
        client={selectedClient}
        centerAddress={center?.address}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
      />

      {/* Confirmation Calendar Dialog */}
      <ConfirmationCalendarDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        appointment={justConfirmedAppointment}
        centerAddress={center?.address}
        isAlreadySynced={justConfirmedAppointment ? checkIsSynced(justConfirmedAppointment.id) : false}
        onAddToCalendar={() => justConfirmedAppointment && markAsSynced(justConfirmedAppointment.id)}
      />
    </div>
  );
}
