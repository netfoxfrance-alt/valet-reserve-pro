import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Appointment } from '@/hooks/useAppointments';
import { Client } from '@/hooks/useClients';
import { useClientHistory } from '@/hooks/useClientHistory';
import { 
  Phone, Mail, MapPin, Euro, Calendar, TrendingUp, Clock, 
  Car, FileText, ExternalLink, User, CalendarPlus, Copy, Check
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { useState } from 'react';
import { generateAppointmentCalendarUrl } from '@/lib/calendarUtils';
import { useTranslation } from 'react-i18next';

const statusColors: Record<string, string> = {
  pending_validation: 'bg-amber-100 text-amber-700',
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-slate-100 text-slate-600',
  cancelled: 'bg-red-100 text-red-600',
  refused: 'bg-red-100 text-red-600',
};

interface AppointmentDetailDialogProps {
  appointment: Appointment | null;
  client: Client | null;
  centerAddress?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AppointmentDetailDialog({ 
  appointment, 
  client, 
  centerAddress,
  open, 
  onOpenChange 
}: AppointmentDetailDialogProps) {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === 'en' ? enUS : fr;
  const { appointments: clientHistory, loading, stats } = useClientHistory(client?.id || null);
  const [copiedPhone, setCopiedPhone] = useState(false);

  if (!appointment) return null;

  const statusColor = statusColors[appointment.status] || statusColors.pending;
  const price = appointment.custom_price ?? appointment.custom_service?.price ?? appointment.pack?.price ?? 0;
  const serviceName = appointment.custom_service?.name || appointment.pack?.name || t('customServices.title');

  const handleCopyPhone = async () => {
    const phone = client?.phone || appointment.client_phone;
    if (!phone) return;
    await navigator.clipboard.writeText(phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

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
  };

  const displayPhone = client?.phone || appointment.client_phone;
  const displayEmail = client?.email || appointment.client_email;
  const displayAddress = client?.address || appointment.client_address;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <DialogTitle className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg font-bold text-primary">
                  {appointment.client_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-xl font-semibold">{appointment.client_name}</p>
                <Badge className={`${statusColor} text-xs mt-1`}>{t(`status.${appointment.status}`)}</Badge>
              </div>
            </DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddToCalendar}
              className="gap-2"
            >
              <CalendarPlus className="w-4 h-4" />
              <span className="hidden sm:inline">{t('appointmentDetail.addToCalendar')}</span>
            </Button>
          </div>
          <DialogDescription className="sr-only">
            {t('appointmentDetail.detailsFor', { name: appointment.client_name })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Appointment Details */}
          <Card variant="elevated" className="p-4">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              {t('appointmentDetail.appointmentDetails')}
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">{t('common.date')}</p>
                <p className="font-medium text-foreground">
                  {format(parseISO(appointment.appointment_date), 'EEEE d MMMM yyyy', { locale: dateLocale })}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">{t('common.time')}</p>
                <p className="font-medium text-foreground">{appointment.appointment_time.slice(0, 5)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t('appointmentDetail.service')}</p>
                <p className="font-medium text-foreground">{serviceName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t('common.price')}</p>
                <p className="font-bold text-lg text-foreground">{price}€</p>
              </div>
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">{t('appointmentDetail.vehicle')}</p>
                  <p className="font-medium text-foreground">
                    {t(`vehicles.${appointment.vehicle_type}`, { defaultValue: appointment.vehicle_type })}
                  </p>
                </div>
              </div>
              {appointment.duration_minutes && (
                <div>
                  <p className="text-muted-foreground">{t('common.duration')}</p>
                  <p className="font-medium text-foreground">{appointment.duration_minutes} min</p>
                </div>
              )}
            </div>
            {appointment.notes && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-muted-foreground text-sm mb-1 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  {t('common.notes')}
                </p>
                <p className="text-foreground">{appointment.notes}</p>
              </div>
            )}
          </Card>

          {/* Contact Info */}
          <Card variant="elevated" className="p-4">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              {t('appointmentDetail.clientContact')}
            </h4>
            <div className="space-y-3">
              {displayPhone && (
                <div className="flex items-center justify-between gap-2">
                  <a 
                    href={`tel:${displayPhone}`} 
                    className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Phone className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-medium">{displayPhone}</span>
                    <ExternalLink className="w-3 h-3 text-muted-foreground" />
                  </a>
                  <Button variant="ghost" size="sm" onClick={handleCopyPhone} className="h-8 px-2">
                    {copiedPhone ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              )}
              {displayEmail && displayEmail !== 'non-fourni@example.com' && (
                <a href={`mailto:${displayEmail}`} className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-blue-500" />
                  </div>
                  <span className="font-medium">{displayEmail}</span>
                  <ExternalLink className="w-3 h-3 text-muted-foreground" />
                </a>
              )}
              {displayAddress && (
                <div className="flex items-center gap-2 text-foreground">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-emerald-500" />
                  </div>
                  <span>{displayAddress}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Client Stats */}
          {client && (
            <>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card variant="elevated" className="p-3 text-center">
                  <Calendar className="w-5 h-5 mx-auto text-primary mb-1" />
                  <p className="text-xl font-bold">{stats.totalAppointments}</p>
                  <p className="text-xs text-muted-foreground">{t('appointmentDetail.bookings')}</p>
                </Card>
                <Card variant="elevated" className="p-3 text-center">
                  <Euro className="w-5 h-5 mx-auto text-green-600 mb-1" />
                  <p className="text-xl font-bold">{stats.totalRevenue}€</p>
                  <p className="text-xs text-muted-foreground">{t('appointmentDetail.totalRevenue')}</p>
                </Card>
                <Card variant="elevated" className="p-3 text-center">
                  <TrendingUp className="w-5 h-5 mx-auto text-blue-600 mb-1" />
                  <p className="text-xl font-bold">{stats.avgPrice}€</p>
                  <p className="text-xs text-muted-foreground">{t('appointmentDetail.avgBasket')}</p>
                </Card>
                <Card variant="elevated" className="p-3 text-center">
                  <Clock className="w-5 h-5 mx-auto text-purple-600 mb-1" />
                  <p className="text-xl font-bold">
                    {stats.lastVisit ? format(parseISO(stats.lastVisit), 'd MMM', { locale: dateLocale }) : '-'}
                  </p>
                  <p className="text-xs text-muted-foreground">{t('appointmentDetail.lastVisit')}</p>
                </Card>
              </div>

              {client.notes && (
                <div className="bg-secondary/30 rounded-xl p-4">
                  <p className="text-sm text-muted-foreground mb-1">{t('appointmentDetail.clientNotes')}</p>
                  <p className="text-foreground">{client.notes}</p>
                </div>
              )}

              <div>
                <h4 className="font-semibold text-foreground mb-3">{t('appointmentDetail.serviceHistory')}</h4>
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}
                  </div>
                ) : clientHistory.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>{t('appointmentDetail.noServices')}</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {clientHistory.slice(0, 5).map((apt) => {
                      const aptStatusColor = statusColors[apt.status] || statusColors.pending;
                      const aptPrice = apt.custom_price || apt.pack?.price || 0;
                      const aptServiceName = apt.custom_service?.name || apt.pack?.name || 'Service';
                      
                      return (
                        <div key={apt.id} className="flex items-center justify-between gap-3 p-3 bg-secondary/20 rounded-xl">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">{aptServiceName}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(parseISO(apt.appointment_date), 'd MMMM yyyy', { locale: dateLocale })}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="font-semibold text-foreground">{aptPrice}€</span>
                            <Badge className={`${aptStatusColor} text-xs`}>{t(`status.${apt.status}`)}</Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          {!client && (
            <div className="text-center py-4 text-muted-foreground bg-muted/30 rounded-xl">
              <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{t('appointmentDetail.clientNotInFile')}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
