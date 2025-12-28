import { useState } from 'react';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { MobileSidebar } from '@/components/dashboard/MobileSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, TrendingUp, Clock, User, Phone, Check, X } from 'lucide-react';
import { useMyAppointments, Appointment } from '@/hooks/useAppointments';
import { useMyCenter } from '@/hooks/useCenter';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

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

function AppointmentCard({ appointment, onUpdateStatus }: { 
  appointment: Appointment; 
  onUpdateStatus: (id: string, status: Appointment['status']) => void;
}) {
  const status = statusConfig[appointment.status] || statusConfig.pending;
  const date = parseISO(appointment.appointment_date);
  
  let dateLabel = format(date, "EEEE d MMMM", { locale: fr });
  if (isToday(date)) dateLabel = "Aujourd'hui";
  if (isTomorrow(date)) dateLabel = "Demain";

  return (
    <Card variant="elevated" className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-foreground" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-foreground truncate">{appointment.client_name}</p>
            <p className="text-sm text-muted-foreground">
              {vehicleLabels[appointment.vehicle_type] || appointment.vehicle_type}
            </p>
          </div>
        </div>
        <Badge variant={status.variant} className="flex-shrink-0">{status.label}</Badge>
      </div>
      
      <div className="space-y-2 text-sm mb-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{dateLabel} à {appointment.appointment_time.slice(0, 5)}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Phone className="w-4 h-4 flex-shrink-0" />
          <a href={`tel:${appointment.client_phone}`} className="hover:text-primary truncate">
            {appointment.client_phone}
          </a>
        </div>
        {appointment.pack && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{appointment.pack.name} - {appointment.pack.price}€</span>
          </div>
        )}
      </div>
      
      {appointment.status === 'pending' && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onUpdateStatus(appointment.id, 'confirmed')}
          >
            <Check className="w-4 h-4 mr-1" />
            Confirmer
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onUpdateStatus(appointment.id, 'cancelled')}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
      
      {appointment.status === 'confirmed' && (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => onUpdateStatus(appointment.id, 'completed')}
        >
          Marquer comme terminé
        </Button>
      )}
    </Card>
  );
}

export default function Dashboard() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { appointments, loading, updateStatus } = useMyAppointments();
  const { center } = useMyCenter();
  
  const todayAppointments = appointments.filter(a => {
    const date = parseISO(a.appointment_date);
    return isToday(date) && a.status !== 'cancelled';
  });
  
  const upcomingAppointments = appointments.filter(a => {
    const date = parseISO(a.appointment_date);
    return date >= new Date() && a.status !== 'cancelled';
  });

  const handleUpdateStatus = async (id: string, status: Appointment['status']) => {
    await updateStatus(id, status);
  };

  const stats = [
    { name: "Aujourd'hui", value: todayAppointments.length.toString(), icon: Calendar, color: 'bg-primary/10 text-primary' },
    { name: 'À venir', value: upcomingAppointments.length.toString(), icon: TrendingUp, color: 'bg-accent/10 text-accent' },
    { name: 'Total', value: appointments.length.toString(), icon: Users, color: 'bg-secondary text-secondary-foreground' },
  ];
  
  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <MobileSidebar open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} />
      
      <div className="lg:pl-64">
        <DashboardHeader 
          title="Rendez-vous" 
          subtitle={center?.name}
          onMenuClick={() => setMobileMenuOpen(true)}
        />
        
        <main className="p-4 lg:p-8">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {stats.map((stat) => (
              <Card key={stat.name} variant="elevated" className="p-4 sm:p-5">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{stat.name}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Appointments section */}
          <div className="mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground">Prochaines réservations</h2>
            <p className="text-sm text-muted-foreground">Gérez vos réservations à venir</p>
          </div>
          
          {loading ? (
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} variant="elevated" className="p-4 sm:p-5">
                  <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl mb-4" />
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </Card>
              ))}
            </div>
          ) : upcomingAppointments.length === 0 ? (
            <Card variant="elevated" className="p-6 sm:p-8 text-center">
              <Calendar className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Aucun rendez-vous à venir</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Partagez votre lien de réservation pour recevoir vos premiers clients.
              </p>
            </Card>
          ) : (
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingAppointments.map((appointment) => (
                <AppointmentCard 
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
