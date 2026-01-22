import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Client } from '@/hooks/useClients';
import { useClientHistory } from '@/hooks/useClientHistory';
import { Phone, Mail, MapPin, Euro, Calendar, TrendingUp, Clock, Sparkles } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'En attente', color: 'bg-amber-100 text-amber-700' },
  confirmed: { label: 'Confirmé', color: 'bg-emerald-100 text-emerald-700' },
  completed: { label: 'Terminé', color: 'bg-slate-100 text-slate-600' },
  cancelled: { label: 'Annulé', color: 'bg-red-100 text-red-600' },
};

interface ClientDetailDialogProps {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ClientDetailDialog({ client, open, onOpenChange }: ClientDetailDialogProps) {
  const { appointments, loading, stats } = useClientHistory(client?.id || null);

  if (!client) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg font-bold text-primary">
                {client.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-xl font-semibold">{client.name}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                client.source === 'booking' 
                  ? 'bg-blue-500/10 text-blue-600' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {client.source === 'booking' ? 'Via réservation' : 'Ajout manuel'}
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Contact Info */}
          <div className="flex flex-wrap gap-4 text-sm">
            {client.phone && (
              <a href={`tel:${client.phone}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                <Phone className="w-4 h-4" />
                {client.phone}
              </a>
            )}
            {client.email && (
              <a href={`mailto:${client.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                <Mail className="w-4 h-4" />
                {client.email}
              </a>
            )}
            {client.address && (
              <span className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                {client.address}
              </span>
            )}
          </div>

          {/* Default Service */}
          {client.default_service && (
            <div className="bg-primary/5 rounded-xl p-4">
              <p className="text-sm text-muted-foreground mb-1">Prestation par défaut</p>
              <p className="font-medium text-primary flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                {client.default_service.name} • {client.default_service.duration_minutes}min • {client.default_service.price}€
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card variant="elevated" className="p-3 text-center">
              <Calendar className="w-5 h-5 mx-auto text-primary mb-1" />
              <p className="text-xl font-bold">{stats.totalAppointments}</p>
              <p className="text-xs text-muted-foreground">Réservations</p>
            </Card>
            <Card variant="elevated" className="p-3 text-center">
              <Euro className="w-5 h-5 mx-auto text-green-600 mb-1" />
              <p className="text-xl font-bold">{stats.totalRevenue}€</p>
              <p className="text-xs text-muted-foreground">CA total</p>
            </Card>
            <Card variant="elevated" className="p-3 text-center">
              <TrendingUp className="w-5 h-5 mx-auto text-blue-600 mb-1" />
              <p className="text-xl font-bold">{stats.avgPrice}€</p>
              <p className="text-xs text-muted-foreground">Panier moyen</p>
            </Card>
            <Card variant="elevated" className="p-3 text-center">
              <Clock className="w-5 h-5 mx-auto text-purple-600 mb-1" />
              <p className="text-xl font-bold">
                {stats.lastVisit ? format(parseISO(stats.lastVisit), 'd MMM', { locale: fr }) : '-'}
              </p>
              <p className="text-xs text-muted-foreground">Dernière visite</p>
            </Card>
          </div>

          {/* Notes */}
          {client.notes && (
            <div className="bg-secondary/30 rounded-xl p-4">
              <p className="text-sm text-muted-foreground mb-1">Notes</p>
              <p className="text-foreground">{client.notes}</p>
            </div>
          )}

          {/* Appointment History */}
          <div>
            <h4 className="font-semibold text-foreground mb-3">Historique des prestations</h4>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Aucune prestation pour ce client</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {appointments.map((apt) => {
                  const status = statusConfig[apt.status] || statusConfig.pending;
                  const price = apt.custom_price || apt.pack?.price || 0;
                  const serviceName = apt.custom_service?.name || apt.pack?.name || 'Service';
                  
                  return (
                    <div
                      key={apt.id}
                      className="flex items-center justify-between gap-3 p-3 bg-secondary/20 rounded-xl"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{serviceName}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(parseISO(apt.appointment_date), 'd MMMM yyyy', { locale: fr })} à {apt.appointment_time.slice(0, 5)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="font-semibold text-foreground">{price}€</span>
                        <Badge className={`${status.color} text-xs`}>{status.label}</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
