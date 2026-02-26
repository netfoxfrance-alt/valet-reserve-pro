import { Card } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

export default function DepositSuccess() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card variant="elevated" className="p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Paiement confirmé !
        </h1>
        <p className="text-muted-foreground mb-2">
          Votre acompte a bien été réglé.
        </p>
        <p className="text-sm text-muted-foreground">
          Votre rendez-vous est maintenant <strong className="text-emerald-600">confirmé</strong>. 
          Vous recevrez un email de confirmation.
        </p>
      </Card>
    </div>
  );
}
