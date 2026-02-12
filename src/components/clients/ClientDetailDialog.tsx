import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Client } from '@/hooks/useClients';
import { useClientHistory } from '@/hooks/useClientHistory';
import { useClientInvoices } from '@/hooks/useClientInvoices';
import { useClientServices } from '@/hooks/useClientServices';
import { useMyCustomServices } from '@/hooks/useCustomServices';
import { Phone, Mail, MapPin, Euro, Calendar, TrendingUp, Clock, Sparkles, FileText, FileCheck } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

const statusColorMap: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  pending_validation: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-slate-100 text-slate-600',
  cancelled: 'bg-red-100 text-red-600',
};

const invoiceStatusColorMap: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600',
  sent: 'bg-blue-100 text-blue-700',
  accepted: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-600',
  paid: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-600',
};

interface ClientDetailDialogProps {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ClientDetailDialog({ client, open, onOpenChange }: ClientDetailDialogProps) {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === 'en' ? enUS : fr;
  const { appointments, loading: loadingAppointments, stats } = useClientHistory(client?.id || null);
  const { invoices, loading: loadingInvoices, stats: invoiceStats } = useClientInvoices(client?.id || null);
  const { serviceIds } = useClientServices(client?.id || null);
  const { services } = useMyCustomServices();

  // Resolve service objects from IDs
  const clientServices = services.filter(s => serviceIds.includes(s.id));

  if (!client) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg font-bold text-primary">{client.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}</span>
            </div>
            <div>
              <p className="text-xl font-semibold">{client.name}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full ${client.source === 'booking' ? 'bg-blue-500/10 text-blue-600' : 'bg-muted text-muted-foreground'}`}>
                {client.source === 'booking' ? t('clientDetail.viaBooking') : t('clientDetail.manualAdd')}
              </span>
            </div>
          </DialogTitle>
          <DialogDescription className="sr-only">{client.name}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div className="flex flex-wrap gap-4 text-sm">
            {client.phone && <a href={`tel:${client.phone}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary"><Phone className="w-4 h-4" />{client.phone}</a>}
            {client.email && <a href={`mailto:${client.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary"><Mail className="w-4 h-4" />{client.email}</a>}
            {client.address && <span className="flex items-center gap-2 text-muted-foreground"><MapPin className="w-4 h-4" />{client.address}</span>}
          </div>

          {clientServices.length > 0 && (
            <div className="bg-primary/5 rounded-xl p-4">
              <p className="text-sm text-muted-foreground mb-2">{t('clientDetail.defaultService')}</p>
              <div className="space-y-1.5">
                {clientServices.map(svc => (
                  <p key={svc.id} className="font-medium text-primary flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />{svc.name} • {svc.duration_minutes}min • {svc.price}€
                  </p>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card variant="elevated" className="p-3 text-center"><Calendar className="w-5 h-5 mx-auto text-primary mb-1" /><p className="text-xl font-bold">{stats.totalAppointments}</p><p className="text-xs text-muted-foreground">{t('clientDetail.reservations')}</p></Card>
            <Card variant="elevated" className="p-3 text-center"><Euro className="w-5 h-5 mx-auto text-green-600 mb-1" /><p className="text-xl font-bold">{stats.totalRevenue}€</p><p className="text-xs text-muted-foreground">{t('clientDetail.revenueServices')}</p></Card>
            <Card variant="elevated" className="p-3 text-center"><FileText className="w-5 h-5 mx-auto text-blue-600 mb-1" /><p className="text-xl font-bold">{invoiceStats.totalInvoices}</p><p className="text-xs text-muted-foreground">{t('clientDetail.invoicesLabel')}</p></Card>
            <Card variant="elevated" className="p-3 text-center"><FileCheck className="w-5 h-5 mx-auto text-purple-600 mb-1" /><p className="text-xl font-bold">{invoiceStats.totalQuotes}</p><p className="text-xs text-muted-foreground">{t('clientDetail.quotesLabel')}</p></Card>
          </div>

          {client.notes && (
            <div className="bg-secondary/30 rounded-xl p-4">
              <p className="text-sm text-muted-foreground mb-1">{t('common.notes')}</p>
              <p className="text-foreground">{client.notes}</p>
            </div>
          )}

          <Tabs defaultValue="appointments" className="w-full">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="appointments">{t('clientDetail.services')}</TabsTrigger>
              <TabsTrigger value="invoices">{t('clientDetail.invoicesAndQuotes')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="appointments" className="mt-4">
              {loadingAppointments ? (
                <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}</div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground"><Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" /><p>{t('clientDetail.noServices')}</p></div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {appointments.map((apt) => {
                    const price = apt.custom_price || apt.pack?.price || 0;
                    const serviceName = apt.custom_service?.name || apt.pack?.name || 'Service';
                    return (
                      <div key={apt.id} className="flex items-center justify-between gap-3 p-3 bg-secondary/20 rounded-xl">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{serviceName}</p>
                          <p className="text-sm text-muted-foreground">{format(parseISO(apt.appointment_date), 'd MMMM yyyy', { locale: dateLocale })}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="font-semibold text-foreground">{price}€</span>
                          <Badge className={`${statusColorMap[apt.status] || statusColorMap.pending} text-xs`}>{t(`status.${apt.status}`)}</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="invoices" className="mt-4">
              {loadingInvoices ? (
                <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}</div>
              ) : invoices.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground"><FileText className="w-8 h-8 mx-auto mb-2 opacity-50" /><p>{t('clientDetail.noInvoices')}</p></div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {invoices.map((inv) => {
                    const isInvoice = inv.type === 'invoice';
                    return (
                      <div key={inv.id} className="flex items-center justify-between gap-3 p-3 bg-secondary/20 rounded-xl">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`p-2 rounded-lg ${isInvoice ? 'bg-blue-100' : 'bg-purple-100'}`}>
                            {isInvoice ? <FileText className="w-4 h-4 text-blue-600" /> : <FileCheck className="w-4 h-4 text-purple-600" />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">{inv.number}</p>
                            <p className="text-sm text-muted-foreground">{format(parseISO(inv.issue_date), 'd MMMM yyyy', { locale: dateLocale })}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="font-semibold text-foreground">{inv.total.toFixed(2)}€</span>
                          <Badge className={`${invoiceStatusColorMap[inv.status] || invoiceStatusColorMap.draft} text-xs`}>{t(`invoices.${inv.status}`)}</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}