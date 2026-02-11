import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail, Clock, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { RecognizedClient } from '@/components/booking/CenterLanding';

interface ClientLookupInlineProps {
  centerId: string;
  onRecognizedClient: (client: RecognizedClient) => void;
}

export function ClientLookupInline({ centerId, onRecognizedClient }: ClientLookupInlineProps) {
  const [showLookup, setShowLookup] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [found, setFound] = useState<RecognizedClient | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setNotFound(false);
    setFound(null);

    try {
      const { data, error } = await supabase.rpc('lookup_client_by_email', {
        p_center_id: centerId,
        p_email: email.trim(),
      });

      if (error) throw error;

      if (data && data.length > 0) {
        const client = data[0] as RecognizedClient;
        setFound(client);
      } else {
        setNotFound(true);
      }
    } catch (err) {
      console.error('Client lookup error:', err);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  if (found) {
    return (
      <Card variant="elevated" className="p-6 rounded-2xl mb-6 border-primary/20">
        <p className="text-lg font-semibold text-foreground mb-1">
          Bonjour {found.first_name}
        </p>
        {found.service_name ? (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              Votre prestation personnalisée
            </p>
            <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 mb-4">
              <div>
                <p className="font-medium text-foreground">{found.service_name}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                  <Clock className="w-3.5 h-3.5" />
                  {found.service_duration_minutes} min
                </p>
              </div>
              <p className="text-2xl font-semibold tracking-tight text-foreground">{found.service_price}€</p>
            </div>
            <Button
              onClick={() => onRecognizedClient(found)}
              className="w-full h-12 text-sm font-medium rounded-xl"
            >
              Choisir un créneau
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Choisissez votre formule ci-dessous.
          </p>
        )}
        <button
          onClick={() => { setFound(null); setShowLookup(false); setEmail(''); }}
          className="w-full text-center text-xs mt-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          Ce n'est pas moi
        </button>
      </Card>
    );
  }

  if (!showLookup) {
    return (
      <button
        onClick={() => setShowLookup(true)}
        className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl text-sm font-medium mb-6 transition-all bg-secondary/50 text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
      >
        <Mail className="w-4 h-4" />
        Formule personnalisée ? Identifiez-vous
      </button>
    );
  }

  return (
    <Card variant="elevated" className="p-5 rounded-2xl mb-6">
      <p className="text-sm font-medium text-foreground mb-3">
        Entrez votre adresse email
      </p>
      <form onSubmit={handleLookup} className="flex gap-2">
        <div className="relative flex-1">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="email"
            placeholder="vous@exemple.fr"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setNotFound(false); }}
            className="pl-11 h-11 rounded-xl"
            required
          />
        </div>
        <Button
          type="submit"
          disabled={loading || !email.trim()}
          className="h-11 px-5 rounded-xl"
        >
          {loading ? '...' : 'Valider'}
        </Button>
      </form>
      {notFound && (
        <p className="text-sm text-muted-foreground mt-3">
          Email non reconnu. Choisissez une formule ci-dessous.
        </p>
      )}
    </Card>
  );
}
