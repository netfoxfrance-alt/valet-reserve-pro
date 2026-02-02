import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Copy, Check, ExternalLink, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateIcalSubscriptionUrl } from '@/lib/calendarUtils';
import { cn } from '@/lib/utils';

interface CalendarSyncSectionProps {
  centerId: string;
  icalToken: string | null;
  onRefreshToken?: () => Promise<void>;
}

export function CalendarSyncSection({ centerId, icalToken, onRefreshToken }: CalendarSyncSectionProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const icalUrl = icalToken ? generateIcalSubscriptionUrl(centerId, icalToken) : null;

  const handleCopy = async () => {
    if (!icalUrl) return;
    
    try {
      await navigator.clipboard.writeText(icalUrl);
      setCopied(true);
      toast({ title: 'Lien copié !', description: 'Collez-le dans votre application calendrier.' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de copier le lien.', variant: 'destructive' });
    }
  };

  const handleRefreshToken = async () => {
    if (!onRefreshToken) return;
    setIsRefreshing(true);
    try {
      await onRefreshToken();
      toast({ 
        title: 'Lien régénéré', 
        description: 'Votre ancien lien ne fonctionnera plus. Mettez à jour votre calendrier.' 
      });
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de régénérer le lien.', variant: 'destructive' });
    } finally {
      setIsRefreshing(false);
    }
  };

  const openGoogleCalendarSubscribe = () => {
    // Open Google Calendar's add by URL page
    window.open('https://calendar.google.com/calendar/r/settings/addbyurl', '_blank');
  };

  return (
    <section className="mb-6 sm:mb-8">
      <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-1 sm:mb-2">
        Synchronisation Calendrier
      </h2>
      <p className="text-sm text-muted-foreground mb-4 sm:mb-6">
        Synchronisez automatiquement vos rendez-vous avec Google Agenda, Apple Calendar ou Outlook.
      </p>
      
      <Card variant="elevated" className="p-4 sm:p-6">
        <div className="space-y-4">
          {/* Icon and title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">Abonnement iCal</p>
              <p className="text-sm text-muted-foreground">
                Vos RDV confirmés apparaissent automatiquement
              </p>
            </div>
          </div>

          {/* URL Input */}
          {icalUrl && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Votre lien de synchronisation
              </label>
              <div className="flex gap-2">
                <Input
                  value={icalUrl}
                  readOnly
                  className="font-mono text-xs bg-muted/50"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="rounded-lg bg-muted/50 p-4 space-y-3">
            <p className="text-sm font-medium text-foreground">Comment ça marche ?</p>
            <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
              <li>Copiez le lien ci-dessus</li>
              <li>
                Ouvrez{' '}
                <button
                  onClick={openGoogleCalendarSubscribe}
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  Google Agenda
                  <ExternalLink className="w-3 h-3" />
                </button>
                {' '}→ Paramètres → Ajouter un agenda
              </li>
              <li>Sélectionnez "Depuis une URL" et collez le lien</li>
              <li>Vos rendez-vous confirmés apparaîtront automatiquement !</li>
            </ol>
          </div>

          {/* Info box */}
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-primary text-[10px] font-medium">i</span>
            </div>
            <p>
              Le calendrier se met à jour automatiquement toutes les 12-24h.
              Pour un ajout instantané, utilisez le bouton 📅 sur chaque RDV dans votre agenda.
            </p>
          </div>

          {/* Regenerate token button */}
          {onRefreshToken && (
            <div className="pt-2 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefreshToken}
                disabled={isRefreshing}
                className="text-muted-foreground hover:text-foreground"
              >
                <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} />
                Régénérer le lien (invalide l'ancien)
              </Button>
            </div>
          )}
        </div>
      </Card>
    </section>
  );
}
