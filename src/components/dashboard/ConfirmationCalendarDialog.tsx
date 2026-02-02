import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Calendar, CalendarPlus } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { generateAppointmentCalendarUrl } from '@/lib/calendarUtils';
import type { Appointment } from '@/hooks/useAppointments';

interface ConfirmationCalendarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
  centerAddress?: string;
}

export function ConfirmationCalendarDialog({
  open,
  onOpenChange,
  appointment,
  centerAddress,
}: ConfirmationCalendarDialogProps) {
  if (!appointment) return null;

  const serviceName = appointment.custom_service?.name || appointment.pack?.name;
  const price = appointment.custom_price ?? appointment.custom_service?.price ?? appointment.pack?.price;
  const date = parseISO(appointment.appointment_date);
  const formattedDate = format(date, "EEEE d MMMM", { locale: fr });
  const time = appointment.appointment_time.slice(0, 5);

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
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-emerald-600">
            <Check className="w-5 h-5" />
            Rendez-vous confirmé !
          </DialogTitle>
          <DialogDescription className="sr-only">
            Le rendez-vous a été confirmé avec succès
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-xl p-4">
            <p className="font-semibold text-foreground">{appointment.client_name}</p>
            {serviceName && (
              <p className="text-sm text-muted-foreground">
                {serviceName}{price !== undefined && ` - ${price}€`}
              </p>
            )}
            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-2">
              <Calendar className="w-4 h-4" />
              <span className="capitalize">{formattedDate}</span> à {time}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button className="flex-1" onClick={handleAddToCalendar}>
              <CalendarPlus className="w-4 h-4 mr-2" />
              Ajouter à mon agenda
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fermer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
