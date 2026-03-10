import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Copy, Check, RefreshCw, ChevronDown, ExternalLink, Unplug, Loader2, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateIcalSubscriptionUrl, generateGoogleCalendarSubscribeUrl } from '@/lib/calendarUtils';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useSearchParams } from 'react-router-dom';

interface CalendarSyncSectionProps {
  centerId: string;
  icalToken: string | null;
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
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const icalUrl = icalToken ? generateIcalSubscriptionUrl(centerId, icalToken) : null;
  const googleSubscribeUrl = icalUrl ? generateGoogleCalendarSubscribeUrl(icalUrl) : null;

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

  const handleConnectGoogle = () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    
    // Build Google OAuth URL
    const redirectUri = `${supabaseUrl}/functions/v1/google-calendar-callback`;
    const scope = 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.email';
    
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope,
      access_type: 'offline',
      prompt: 'consent', // Force consent to always get refresh_token
      state: centerId,
    });

    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
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
      toast({ title: 'Lien régénéré', description: 'Votre ancien lien ne fonctionnera plus.' });
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de régénérer le lien.', variant: 'destructive' });
    } finally {
      setIsRefreshing(false);
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
                className="w-full sm:w-auto gap-2"
              >
                <ExternalLink className="w-4 h-4" />
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
            <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
              <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-primary text-[10px] font-medium">💡</span>
              </div>
              <p>
                En attendant, vous pouvez utiliser le bouton 📅 à côté de chaque rendez-vous pour l'ajouter manuellement.
              </p>
            </div>
          )}

          {/* Advanced options (collapsible) - iCal fallback */}
          <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-between text-muted-foreground hover:text-foreground"
              >
                Options avancées (iCal)
                <ChevronDown className={cn(
                  "w-4 h-4 transition-transform duration-200",
                  isAdvancedOpen && "rotate-180"
                )} />
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="pt-3 space-y-4">
              {/* iCal sync button */}
              {googleSubscribeUrl && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Synchronisation iCal (mise à jour différée)
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Pour Apple Calendar, Outlook ou autre. Les mises à jour peuvent prendre jusqu'à 24h.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      window.open(googleSubscribeUrl, '_blank');
                      toast({ title: 'Google Agenda ouvert', description: 'Cliquez sur "Ajouter" pour finaliser.' });
                    }}
                    className="w-full sm:w-auto gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    S'abonner via iCal
                  </Button>
                </div>
              )}

              {/* Manual copy */}
              {icalUrl && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Copier le lien iCal
                  </label>
                  <div className="flex gap-2">
                    <Input value={icalUrl} readOnly className="font-mono text-xs bg-muted/50" />
                    <Button variant="outline" size="icon" onClick={handleCopy} className="shrink-0">
                      {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              )}

              {/* Regenerate token */}
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
                    Régénérer le lien iCal
                  </Button>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </Card>
    </section>
  );
}
