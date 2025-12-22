import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

interface ContactConfirmationProps {
  clientName: string;
  centerName?: string;
}

export function ContactConfirmation({ clientName, centerName }: ContactConfirmationProps) {
  return (
    <div className="w-full max-w-lg mx-auto text-center animate-scale-in">
      <div className="mb-8">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-2 tracking-tight">
          Demande envoyée !
        </h2>
        <p className="text-muted-foreground">
          Merci {clientName.split(' ')[0]}, votre demande a bien été transmise.
        </p>
      </div>
      
      <Card variant="elevated" className="p-6 text-center mb-6">
        <p className="text-foreground mb-2">
          <strong>{centerName || 'Le professionnel'}</strong> reviendra vers vous rapidement.
        </p>
        <p className="text-sm text-muted-foreground">
          Nous traitons généralement les demandes sous 24h.
        </p>
      </Card>
      
      <Button 
        variant="secondary" 
        size="lg"
        onClick={() => window.location.reload()}
      >
        Faire une autre demande
      </Button>
    </div>
  );
}
