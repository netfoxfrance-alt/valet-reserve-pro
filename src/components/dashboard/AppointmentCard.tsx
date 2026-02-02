import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Car } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface AppointmentCardProps {
  appointment: {
    id: string;
    client_name: string;
    vehicle_type: string;
    appointment_date: string;
    appointment_time: string;
    status: string;
    custom_price?: number | null;
    pack?: { name: string; price: number } | null;
    custom_service?: { name: string; price: number } | null;
  };
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending_validation: { label: 'En attente', className: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400' },
  pending: { label: 'En attente', className: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400' },
  confirmed: { label: 'Confirmé', className: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400' },
  completed: { label: 'Terminé', className: 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400' },
  cancelled: { label: 'Annulé', className: 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400' },
  refused: { label: 'Refusé', className: 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400' },
};

const vehicleLabels: Record<string, string> = {
  citadine: 'Citadine',
  berline: 'Berline',
  suv: 'SUV / 4x4',
  utilitaire: 'Utilitaire',
  standard: 'Standard',
};

export function AppointmentCard({ appointment }: AppointmentCardProps) {
  const status = statusConfig[appointment.status] || statusConfig.pending;
  
  // Robust price fallback: custom_price > custom_service.price > pack.price
  const price = appointment.custom_price ?? appointment.custom_service?.price ?? appointment.pack?.price ?? 0;
  const serviceName = appointment.custom_service?.name || appointment.pack?.name || 'Service';
  
  return (
    <Card variant="elevated" className="p-5 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium text-foreground">{appointment.client_name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Car className="w-4 h-4" />
            <span>{vehicleLabels[appointment.vehicle_type] || appointment.vehicle_type}</span>
          </div>
        </div>
        <Badge className={cn("font-medium", status.className)}>
          {status.label}
        </Badge>
      </div>
      
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{format(new Date(appointment.appointment_date), "d MMMM", { locale: fr })}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{appointment.appointment_time.slice(0, 5)}</span>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
        <div>
          <span className="text-sm text-muted-foreground">Service </span>
          <span className="text-sm font-medium text-foreground">{serviceName}</span>
        </div>
        <span className="font-semibold text-foreground">{price}€</span>
      </div>
    </Card>
  );
}
