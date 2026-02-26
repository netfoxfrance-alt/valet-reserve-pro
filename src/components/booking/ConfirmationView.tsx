import { useState } from 'react';
import { Pack } from '@/types/booking';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock as ClockIcon, Calendar, MapPin, CreditCard, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';

interface ConfirmationViewProps {
  pack: Pack;
  date: Date;
  time: string;
  clientName: string;
  centerName?: string;
  centerAddress?: string | null;
  depositEnabled?: boolean;
  depositAmount?: number;
  appointmentId?: string;
}

export function ConfirmationView({ pack, date, time, clientName, centerName = "Centre", centerAddress, depositEnabled, depositAmount, appointmentId }: ConfirmationViewProps) {
  const [payingDeposit, setPayingDeposit] = useState(false);
  const [depositError, setDepositError] = useState<string | null>(null);

  const handlePayDeposit = async () => {
    if (!appointmentId) return;
    setPayingDeposit(true);
    setDepositError(null);

    try {
      const { data, error } = await supabase.functions.invoke('create-deposit-checkout', {
        body: { appointment_id: appointmentId },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL');
      }
    } catch (err) {
      console.error('Deposit error:', err);
      setDepositError('Impossible de créer le paiement. Veuillez réessayer.');
    } finally {
      setPayingDeposit(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto text-center animate-scale-in">
      <div className="mb-8">
        <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">{depositEnabled ? '💳' : '⏳'}</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-2 tracking-tight">
          {depositEnabled ? 'Dernière étape : l\'acompte' : 'Demande envoyée !'}
        </h2>
        <p className="text-muted-foreground">
          {depositEnabled 
            ? `Merci ${clientName.split(' ')[0]}, pour confirmer votre rendez-vous, réglez l'acompte ci-dessous.`
            : `Merci ${clientName.split(' ')[0]}, votre demande de rendez-vous a bien été enregistrée.`
          }
        </p>
      </div>

      {depositEnabled && depositAmount ? (
        <Card className="p-6 mb-6 bg-primary/5 border-primary/20">
          <div className="flex items-center justify-center gap-3 mb-4">
            <CreditCard className="w-6 h-6 text-primary" />
            <span className="text-2xl font-bold text-foreground">{depositAmount}€</span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Votre rendez-vous sera automatiquement confirmé après le paiement.
          </p>
          {depositError && (
            <p className="text-sm text-destructive mb-3">{depositError}</p>
          )}
          <Button
            variant="premium"
            size="xl"
            className="w-full"
            onClick={handlePayDeposit}
            disabled={payingDeposit}
          >
            {payingDeposit ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Redirection...</>
            ) : (
              <>Payer l'acompte de {depositAmount}€</>
            )}
          </Button>
        </Card>
      ) : (
        <Card className="p-4 mb-6 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
          <p className="text-amber-800 dark:text-amber-200 text-sm font-medium">
            📋 Votre demande est en attente de validation.<br/>
            Vous recevrez un email de confirmation dès que le prestataire aura validé votre créneau.
          </p>
        </Card>
      )}
      
      <Card variant="elevated" className="p-6 text-left mb-6">
        <h3 className="font-semibold text-lg text-foreground mb-4">
          Récapitulatif
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">
                {format(date, "EEEE d MMMM yyyy", { locale: fr })}
              </p>
              <p className="text-sm text-muted-foreground">
                à {time}
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
              <ClockIcon className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">
                Pack {pack.name}
              </p>
              <p className="text-sm text-muted-foreground">
                Durée estimée : {pack.duration}
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">
                {centerName}
              </p>
              {centerAddress && (
                <p className="text-sm text-muted-foreground">
                  {centerAddress}
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Prix estimé</span>
            <span className="text-2xl font-bold text-foreground">{pack.price}€</span>
          </div>
          {depositEnabled && depositAmount && (
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-muted-foreground">Acompte à régler</span>
              <span className="text-lg font-semibold text-primary">{depositAmount}€</span>
            </div>
          )}
        </div>
      </Card>
      
      <p className="text-sm text-muted-foreground">
        {depositEnabled 
          ? 'Un email récapitulatif vous sera envoyé après le paiement.'
          : <>Un email récapitulatif vous a été envoyé.<br />Vous serez notifié dès que votre demande sera validée.</>
        }
      </p>
    </div>
  );
}
