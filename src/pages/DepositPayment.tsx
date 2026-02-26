import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, CheckCircle2, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function DepositPayment() {
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get('appointment_id');
  const centerId = searchParams.get('center_id');
  const amount = searchParams.get('amount');
  const centerName = searchParams.get('center_name');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    if (!appointmentId) return;
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('create-deposit-checkout', {
        body: { appointment_id: appointmentId },
      });

      if (fnError) throw fnError;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err: any) {
      console.error('Deposit payment error:', err);
      setError('Impossible de créer le paiement. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  if (!appointmentId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card variant="elevated" className="p-8 max-w-md text-center">
          <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-foreground mb-2">Lien invalide</h1>
          <p className="text-muted-foreground">Ce lien de paiement n'est pas valide.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card variant="elevated" className="p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CreditCard className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Paiement de l'acompte
        </h1>
        {centerName && (
          <p className="text-muted-foreground mb-1">{centerName}</p>
        )}
        {amount && (
          <p className="text-3xl font-bold text-primary mb-6">{amount}€</p>
        )}
        <p className="text-sm text-muted-foreground mb-6">
          Pour confirmer votre rendez-vous, veuillez régler l'acompte ci-dessous. 
          Votre rendez-vous sera automatiquement confirmé après le paiement.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-xl text-sm">
            {error}
          </div>
        )}

        <Button
          variant="premium"
          size="xl"
          className="w-full"
          onClick={handlePay}
          disabled={loading}
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Redirection...</>
          ) : (
            <>Payer l'acompte{amount ? ` de ${amount}€` : ''}</>
          )}
        </Button>
      </Card>
    </div>
  );
}
