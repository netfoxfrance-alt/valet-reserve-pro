import { useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

export default function DepositCancel() {
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get('appointment_id');

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card variant="elevated" className="p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-amber-500" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Paiement annulé
        </h1>
        <p className="text-muted-foreground mb-4">
          L'acompte n'a pas été réglé. Votre rendez-vous reste en attente de paiement.
        </p>
        {appointmentId && (
          <Button
            variant="premium"
            onClick={() => window.location.href = `/deposit-payment?appointment_id=${appointmentId}`}
          >
            Réessayer le paiement
          </Button>
        )}
      </Card>
    </div>
  );
}
