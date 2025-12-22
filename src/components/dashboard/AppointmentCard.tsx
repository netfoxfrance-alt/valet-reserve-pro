import { Appointment } from '@/types/booking';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Car } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface AppointmentCardProps {
  appointment: Appointment;
}

const statusConfig = {
  confirmed: { label: 'Confirmé', className: 'bg-primary/10 text-primary' },
  pending: { label: 'En attente', className: 'bg-accent/10 text-accent' },
  completed: { label: 'Terminé', className: 'bg-muted text-muted-foreground' },
  cancelled: { label: 'Annulé', className: 'bg-destructive/10 text-destructive' },
};

const vehicleLabels = {
  citadine: 'Citadine',
  berline: 'Berline',
  suv: 'SUV / 4x4',
  utilitaire: 'Utilitaire',
};

export function AppointmentCard({ appointment }: AppointmentCardProps) {
  const status = statusConfig[appointment.status];
  
  return (
    <Card variant="elevated" className="p-5 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium text-foreground">{appointment.clientName}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Car className="w-4 h-4" />
            <span>{vehicleLabels[appointment.vehicleType]}</span>
          </div>
        </div>
        <Badge className={cn("font-medium", status.className)}>
          {status.label}
        </Badge>
      </div>
      
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{format(new Date(appointment.date), "d MMMM", { locale: fr })}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{appointment.time}</span>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
        <div>
          <span className="text-sm text-muted-foreground">Pack </span>
          <span className="text-sm font-medium text-foreground">{appointment.pack.name}</span>
        </div>
        <span className="font-semibold text-foreground">{appointment.pack.price}€</span>
      </div>
    </Card>
  );
}
