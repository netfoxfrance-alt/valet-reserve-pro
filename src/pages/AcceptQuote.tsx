import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Check, AlertCircle, Loader2, FileCheck } from 'lucide-react';

interface QuoteResult {
  success: boolean;
  already_accepted: boolean;
  quote_number: string;
  client_name: string;
  total: number;
  center_name: string;
}

export default function AcceptQuote() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<QuoteResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Lien invalide');
      setLoading(false);
      return;
    }

    const acceptQuote = async () => {
      try {
        const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/accept-quote?token=${token}`
        );
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Erreur lors de la validation');
          return;
        }

        setResult(data);
      } catch (err) {
        setError('Impossible de contacter le serveur');
      } finally {
        setLoading(false);
      }
    };

    acceptQuote();
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center rounded-2xl shadow-lg">
        {loading && (
          <>
            <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin mb-4" />
            <h1 className="text-xl font-semibold text-foreground">Validation en cours...</h1>
            <p className="text-muted-foreground mt-2">Merci de patienter</p>
          </>
        )}

        {!loading && error && (
          <>
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="text-xl font-semibold text-foreground mb-2">Erreur</h1>
            <p className="text-muted-foreground">{error}</p>
          </>
        )}

        {!loading && result && (
          <>
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/50 rounded-full flex items-center justify-center mx-auto mb-4">
              {result.already_accepted ? (
                <FileCheck className="w-8 h-8 text-emerald-600" />
              ) : (
                <Check className="w-8 h-8 text-emerald-600" />
              )}
            </div>
            <h1 className="text-xl font-semibold text-foreground mb-2">
              {result.already_accepted ? 'Devis déjà accepté' : 'Devis accepté !'}
            </h1>
            <p className="text-muted-foreground mb-6">
              {result.already_accepted
                ? `Vous avez déjà validé ce devis.`
                : `Merci ${result.client_name}, votre devis a bien été validé.`}
            </p>
            
            <div className="bg-secondary/50 rounded-xl p-4 space-y-2 text-left">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Devis</span>
                <span className="font-medium">{result.quote_number}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Professionnel</span>
                <span className="font-medium">{result.center_name}</span>
              </div>
              <div className="flex justify-between text-sm border-t pt-2 mt-2">
                <span className="text-muted-foreground">Montant TTC</span>
                <span className="font-bold text-lg">{result.total.toFixed(2)}€</span>
              </div>
            </div>

            {!result.already_accepted && (
              <p className="text-sm text-muted-foreground mt-6">
                {result.center_name} a été notifié de votre acceptation.
              </p>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
