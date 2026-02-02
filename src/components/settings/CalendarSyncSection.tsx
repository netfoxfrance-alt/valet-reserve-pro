import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Copy, Check, RefreshCw, ChevronDown, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateIcalSubscriptionUrl, generateGoogleCalendarSubscribeUrl } from '@/lib/calendarUtils';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface CalendarSyncSectionProps {
  centerId: string;
  icalToken: string | null;
  onRefreshToken?: () => Promise<void>;
}

export function CalendarSyncSection({ centerId, icalToken, onRefreshToken }: CalendarSyncSectionProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const icalUrl = icalToken ? generateIcalSubscriptionUrl(centerId, icalToken) : null;
  const googleSubscribeUrl = icalUrl ? generateGoogleCalendarSubscribeUrl(icalUrl) : null;

  const handleGoogleSync = () => {
    if (!googleSubscribeUrl) return;
    window.open(googleSubscribeUrl, '_blank');
    toast({ 
      title: 'Google Agenda ouvert', 
      description: 'Cliquez sur "Ajouter" dans la fenêtre Google pour finaliser.' 
    });
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

  return (
    <section className="mb-6 sm:mb-8">
      <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-1 sm:mb-2">
        Synchronisation Google Agenda
      </h2>
      <p className="text-sm text-muted-foreground mb-4 sm:mb-6">
        Synchronisez tous vos rendez-vous en 1 clic.
      </p>
      
      <Card variant="elevated" className="p-4 sm:p-6">
        <div className="space-y-5">
          {/* Main sync button */}
          <div className="flex flex-col items-center gap-4 py-2">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Calendar className="w-7 h-7 text-primary" />
            </div>
            
            <Button
              size="lg"
              onClick={handleGoogleSync}
              disabled={!googleSubscribeUrl}
              className="w-full sm:w-auto gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Synchroniser avec Google Agenda
            </Button>
          </div>

          {/* Benefits list */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Tous vos RDV confirmés seront visibles</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Les nouveaux RDV s'ajoutent automatiquement</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Les modifications et annulations sont synchronisées</span>
            </div>
          </div>

          {/* Info box */}
          <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
            <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-primary text-[10px] font-medium">💡</span>
            </div>
            <p>
              Pour un ajout <strong>instantané</strong> d'un RDV urgent, utilisez le bouton 📅 à côté de chaque rendez-vous dans votre agenda.
            </p>
          </div>

          {/* Advanced options (collapsible) */}
          <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-between text-muted-foreground hover:text-foreground"
              >
                Options avancées
                <ChevronDown className={cn(
                  "w-4 h-4 transition-transform duration-200",
                  isAdvancedOpen && "rotate-180"
                )} />
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="pt-3 space-y-4">
              {/* Manual copy */}
              {icalUrl && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Copier le lien manuellement
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Pour Apple Calendar, Outlook ou autre application calendrier.
                  </p>
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
            </CollapsibleContent>
          </Collapsible>
        </div>
      </Card>
    </section>
  );
}
