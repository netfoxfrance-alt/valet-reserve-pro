import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Check, ExternalLink, Unplug, Loader2, Mail, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'react-router-dom';

interface CalendarSyncSectionProps {
  centerId: string;
  icalToken?: string | null;
  onRefreshToken?: () => Promise<void>;
  googleCalendarConnected?: boolean;
  googleCalendarEmail?: string | null;
  onDisconnectGoogle?: () => Promise<void>;
}

export function CalendarSyncSection({ 
  centerId, 
  icalToken, 
  onRefreshToken,
  googleCalendarConnected = false,
  googleCalendarEmail = null,
  onDisconnectGoogle,
}: CalendarSyncSectionProps) {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // Handle Google OAuth return
  useEffect(() => {
    const googleParam = searchParams.get('google');
    if (googleParam === 'success') {
      toast({ title: '✅ Google Agenda connecté !', description: 'Vos rendez-vous confirmés seront automatiquement ajoutés.' });
      searchParams.delete('google');
      setSearchParams(searchParams, { replace: true });
    } else if (googleParam === 'error') {
      const reason = searchParams.get('reason');
      let desc = 'Impossible de connecter Google Agenda.';
      if (reason === 'no_refresh_token') {
        desc = 'Veuillez révoquer l\'accès dans votre compte Google puis réessayer.';
      }
      toast({ title: 'Erreur de connexion', description: desc, variant: 'destructive' });
      searchParams.delete('google');
      searchParams.delete('reason');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams]);

  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnectGoogle = async () => {
    setIsConnecting(true);
    try {
      const { data, error } = await (await import('@/integrations/supabase/client')).supabase.functions.invoke('google-calendar-connect', {
        body: { center_id: centerId },
      });

      if (error || !data?.url) {
        toast({ title: 'Erreur', description: 'Impossible de démarrer la connexion Google.', variant: 'destructive' });
        return;
      }

      window.location.href = data.url;
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de démarrer la connexion Google.', variant: 'destructive' });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectGoogle = async () => {
    if (!onDisconnectGoogle) return;
    setIsDisconnecting(true);
    try {
      await onDisconnectGoogle();
      toast({ title: 'Google Agenda déconnecté', description: 'La synchronisation automatique est désactivée.' });
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de déconnecter.', variant: 'destructive' });
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <section className="mb-6 sm:mb-8">
      <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-1 sm:mb-2">
        Synchronisation Google Agenda
      </h2>
      <p className="text-sm text-muted-foreground mb-4 sm:mb-6">
        {googleCalendarConnected 
          ? 'Vos rendez-vous confirmés sont automatiquement ajoutés à votre agenda.'
          : 'Connectez votre Google Agenda pour synchroniser automatiquement vos rendez-vous.'
        }
      </p>



      <Card variant="elevated" className="p-4 sm:p-6">
        <div className="space-y-5">
          {/* Google Calendar Connection */}
          <div className="flex flex-col items-center gap-4 py-2">
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center",
              googleCalendarConnected ? "bg-emerald-500/10" : "bg-primary/10"
            )}>
              <Calendar className={cn(
                "w-7 h-7",
                googleCalendarConnected ? "text-emerald-500" : "text-primary"
              )} />
            </div>

            {googleCalendarConnected ? (
              <div className="text-center space-y-3 w-full">
                <div className="flex items-center justify-center gap-2 text-sm text-foreground">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span className="font-medium">Connecté</span>
                </div>
                {googleCalendarEmail && (
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{googleCalendarEmail}</span>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDisconnectGoogle}
                  disabled={isDisconnecting}
                  className="text-destructive hover:text-destructive"
                >
                  {isDisconnecting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Unplug className="w-4 h-4 mr-2" />
                  )}
                  Déconnecter
                </Button>
              </div>
            ) : (
              <Button
                size="lg"
                onClick={handleConnectGoogle}
                disabled={isConnecting}
                className="w-full sm:w-auto gap-2"
              >
                {isConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
                Connecter Google Agenda
              </Button>
            )}
          </div>

          {/* Benefits list */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Chaque RDV confirmé est ajouté automatiquement</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Notification sur votre téléphone</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Infos client incluses dans l'événement</span>
            </div>
          </div>

          {/* Info box */}
          {!googleCalendarConnected && (
            <details className="group bg-muted/50 rounded-xl p-3">
              <summary className="flex items-center gap-2.5 text-xs cursor-pointer select-none text-muted-foreground hover:text-foreground transition-colors list-none [&::-webkit-details-marker]:hidden">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-primary text-[10px] font-bold">i</span>
                </div>
                <span className="font-medium">À lire avant de connecter</span>
                <ChevronRight className="w-3.5 h-3.5 ml-auto transition-transform duration-200 group-open:rotate-90 text-muted-foreground/50" />
              </summary>
              <div className="mt-3 pl-[30px] space-y-2.5 text-xs text-muted-foreground">
                <p>
                  Google peut afficher un avertissement indiquant que l'application n'est pas vérifiée. <strong className="text-foreground">Ignorez-le</strong>, il s'agit simplement de l'autorisation d'accès à votre agenda.
                </p>
                <p className="font-medium text-foreground text-[11px] tracking-wide uppercase">Étapes de connexion</p>
                <ol className="space-y-1.5 list-decimal list-inside leading-relaxed">
                  <li>Sélectionnez votre compte Google</li>
                  <li>Appuyez sur <strong className="text-foreground">« Paramètres avancés »</strong></li>
                  <li>Puis sur <strong className="text-foreground">« Accéder à CleaningPage »</strong></li>
                  <li>Autorisez l'accès à votre agenda</li>
                </ol>
              </div>
            </details>
          )}

        </div>
      </Card>
    </section>
  );
}
