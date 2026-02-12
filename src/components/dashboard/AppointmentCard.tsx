import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Car } from 'lucide-react';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

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

const statusColorMap: Record<string, string> = {
  pending_validation: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400',
  pending: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400',
  confirmed: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
  completed: 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400',
  cancelled: 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400',
  refused: 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400',
};

export function AppointmentCard({ appointment }: AppointmentCardProps) {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === 'en' ? enUS : fr;
  const statusColor = statusColorMap[appointment.status] || statusColorMap.pending;
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
            <span>{t(`vehicles.${appointment.vehicle_type}`) || appointment.vehicle_type}</span>
          </div>
        </div>
        <Badge className={cn("font-medium", statusColor)}>
          {t(`status.${appointment.status}`)}
        </Badge>
      </div>
      
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{format(new Date(appointment.appointment_date), "d MMMM", { locale: dateLocale })}</span>
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