import { useState } from 'react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Users, TrendingUp, Clock, User, Phone, Check, X, Plus, Mail, Car, Filter, Loader2 } from 'lucide-react';
import { useMyAppointments, Appointment } from '@/hooks/useAppointments';
import { useMyCenter, useMyPacks } from '@/hooks/useCenter';
import { format, isToday, isTomorrow, parseISO, startOfDay, isBefore, isAfter, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'En attente', variant: 'secondary' },
  confirmed: { label: 'Confirmé', variant: 'default' },
  completed: { label: 'Terminé', variant: 'outline' },
  cancelled: { label: 'Annulé', variant: 'destructive' },
};

const vehicleLabels: Record<string, string> = {
  citadine: 'Citadine',
  berline: 'Berline',
  suv: 'SUV / 4x4',
  utilitaire: 'Utilitaire',
};

function AppointmentRow({ appointment, onUpdateStatus }: { 
  appointment: Appointment; 
  onUpdateStatus: (id: string, status: Appointment['status']) => void;
}) {
  const status = statusConfig[appointment.status] || statusConfig.pending;
  const date = parseISO(appointment.appointment_date);
  
  let dateLabel = format(date, "EEE d MMM", { locale: fr });
  if (isToday(date)) dateLabel = "Aujourd'hui";
  if (isTomorrow(date)) dateLabel = "Demain";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 bg-card border border-border rounded-xl hover:shadow-sm transition-shadow">
      {/* Client info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-semibold text-primary">
            {appointment.client_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </span>
        </div>
        <div className="min-w-0">
          <p className="font-medium text-foreground truncate">{appointment.client_name}</p>
          <p className="text-sm text-muted-foreground truncate">
            {vehicleLabels[appointment.vehicle_type] || appointment.vehicle_type}
            {appointment.pack && ` • ${appointment.pack.name}`}
          </p>
        </div>
      </div>
      
      {/* Date & time */}
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="text-sm">
          <p className="font-medium text-foreground">{dateLabel}</p>
          <p className="text-muted-foreground">{appointment.appointment_time.slice(0, 5)}</p>
        </div>
        
        {/* Price */}
        {appointment.pack && (
          <div className="text-right hidden sm:block">
            <p className="font-semibold text-foreground">{appointment.pack.price}€</p>
          </div>
        )}
        
        {/* Status badge */}
        <Badge variant={status.variant} className="flex-shrink-0">{status.label}</Badge>
        
        {/* Actions */}
        <div className="flex gap-1">
          {appointment.status === 'pending' && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                onClick={() => onUpdateStatus(appointment.id, 'confirmed')}
              >
                <Check className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => onUpdateStatus(appointment.id, 'cancelled')}
              >
                <X className="w-4 h-4" />
              </Button>
            </>
          )}
          {appointment.status === 'confirmed' && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => onUpdateStatus(appointment.id, 'completed')}
            >
              Terminer
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function AddAppointmentDialog({ onAdd }: { onAdd: (data: any) => Promise<void> }) {
  const { packs } = useMyPacks();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    vehicle_type: 'berline',
    pack_id: '',
    appointment_date: format(new Date(), 'yyyy-MM-dd'),
    appointment_time: '09:00',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.client_name || !form.client_phone) {
      toast.error('Veuillez remplir le nom et téléphone');
      return;
    }
    setLoading(true);
    await onAdd({
      ...form,
      pack_id: form.pack_id || null,
      client_email: form.client_email || 'non-fourni@example.com'
    });
    setLoading(false);
    setOpen(false);
    setForm({
      client_name: '',
      client_email: '',
      client_phone: '',
      vehicle_type: 'berline',
      pack_id: '',
      appointment_date: format(new Date(), 'yyyy-MM-dd'),
      appointment_time: '09:00',
      notes: ''
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle réservation
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Ajouter une réservation</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="client_name">Nom du client *</Label>
              <Input
                id="client_name"
                value={form.client_name}
                onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                placeholder="Jean Dupont"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client_phone">Téléphone *</Label>
              <Input
                id="client_phone"
                value={form.client_phone}
                onChange={(e) => setForm({ ...form, client_phone: e.target.value })}
                placeholder="06 12 34 56 78"
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
              />
            </div>
            <div className="space-y-2">
              <Label>Type de véhicule</Label>
              <Select value={form.vehicle_type} onValueChange={(v) => setForm({ ...form, vehicle_type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="citadine">Citadine</SelectItem>
                  <SelectItem value="berline">Berline</SelectItem>
                  <SelectItem value="suv">SUV / 4x4</SelectItem>
                  <SelectItem value="utilitaire">Utilitaire</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Formule</Label>
              <Select value={form.pack_id} onValueChange={(v) => setForm({ ...form, pack_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {packs.map((pack) => (
                    <SelectItem key={pack.id} value={pack.id}>
                      {pack.name} - {pack.price}€
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="appointment_date">Date *</Label>
              <Input
                id="appointment_date"
                type="date"
                value={form.appointment_date}
                onChange={(e) => setForm({ ...form, appointment_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="appointment_time">Heure *</Label>
              <Input
                id="appointment_time"
                type="time"
                value={form.appointment_time}
                onChange={(e) => setForm({ ...form, appointment_time: e.target.value })}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Informations supplémentaires..."
                rows={2}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Ajouter
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Dashboard() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'today' | 'week' | 'pending'>('all');
  const { appointments, loading, updateStatus, createAppointment } = useMyAppointments();
  const { center } = useMyCenter();
  
  const today = startOfDay(new Date());
  const weekEnd = addDays(today, 7);
  
  const todayAppointments = appointments.filter(a => {
    const date = parseISO(a.appointment_date);
    return isToday(date) && a.status !== 'cancelled';
  });
  
  const pendingAppointments = appointments.filter(a => a.status === 'pending');
  
  const upcomingAppointments = appointments.filter(a => {
    const date = parseISO(a.appointment_date);
    return !isBefore(date, today) && a.status !== 'cancelled';
  });
  
  const weekAppointments = upcomingAppointments.filter(a => {
    const date = parseISO(a.appointment_date);
    return isBefore(date, weekEnd);
  });

  const filteredAppointments = (() => {
    switch (filter) {
      case 'today':
        return todayAppointments;
      case 'week':
        return weekAppointments;
      case 'pending':
        return pendingAppointments;
      default:
        return upcomingAppointments;
    }
  })();

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

  const stats = [
    { name: "Aujourd'hui", value: todayAppointments.length, icon: Calendar, color: 'bg-primary/10 text-primary' },
    { name: 'En attente', value: pendingAppointments.length, icon: Clock, color: 'bg-yellow-100 text-yellow-700' },
    { name: 'Cette semaine', value: weekAppointments.length, icon: TrendingUp, color: 'bg-green-100 text-green-700' },
    { name: 'Total à venir', value: upcomingAppointments.length, icon: Users, color: 'bg-secondary text-secondary-foreground' },
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
        
        <main className="p-4 lg:p-8">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {stats.map((stat) => (
              <Card key={stat.name} variant="elevated" className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.name}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Header with filters and add button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-foreground">Planning</h2>
              <p className="text-sm text-muted-foreground">
                {filteredAppointments.length} réservation{filteredAppointments.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex bg-secondary/50 rounded-lg p-1">
                {[
                  { key: 'all', label: 'Tout' },
                  { key: 'today', label: "Aujourd'hui" },
                  { key: 'week', label: 'Semaine' },
                  { key: 'pending', label: 'En attente' },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key as any)}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                      filter === key 
                        ? 'bg-background text-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <AddAppointmentDialog onAdd={handleAddAppointment} />
            </div>
          </div>
          
          {/* Appointments list */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          ) : filteredAppointments.length === 0 ? (
            <Card variant="elevated" className="p-8 text-center">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Aucune réservation</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {filter === 'all' 
                  ? "Ajoutez une réservation ou partagez votre lien client."
                  : "Aucune réservation pour ce filtre."
                }
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredAppointments.map((appointment) => (
                <AppointmentRow 
                  key={appointment.id} 
                  appointment={appointment} 
                  onUpdateStatus={handleUpdateStatus}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}