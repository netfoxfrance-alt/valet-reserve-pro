import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail, Clock } from 'lucide-react';
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
      <Card className="p-5 rounded-2xl mb-6 border-primary/30 shadow-sm">
        <p className="text-base font-semibold text-foreground mb-1">
          Bonjour {found.first_name} ! 👋
        </p>
        {found.service_name ? (
          <>
            <p className="text-sm text-muted-foreground mb-3">
              Votre prestation personnalisée :
            </p>
            <div className="flex items-center justify-between p-3 rounded-xl bg-primary/10 mb-3">
              <div>
                <p className="font-semibold text-foreground">{found.service_name}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Clock className="w-3.5 h-3.5" />
                  {found.service_duration_minutes} min
                </p>
              </div>
              <p className="text-xl font-bold text-primary">{found.service_price}€</p>
            </div>
            <Button
              onClick={() => onRecognizedClient(found)}
              className="w-full h-11 font-semibold rounded-xl"
            >
              Choisir un créneau
            </Button>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Choisissez votre formule ci-dessous.
          </p>
        )}
        <button
          onClick={() => { setFound(null); setShowLookup(false); setEmail(''); }}
          className="w-full text-center text-xs mt-2 underline text-muted-foreground"
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
        className="w-full py-3 px-4 rounded-2xl text-sm font-medium mb-6 transition-all border border-border bg-muted/30 text-muted-foreground hover:bg-muted/50"
      >
        🔑 Vous avez une formule personnalisée ? Identifiez-vous
      </button>
    );
  }

  return (
    <Card className="p-4 rounded-2xl mb-6">
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
          Email non reconnu. Vous pouvez choisir une formule ci-dessous.
        </p>
      )}
    </Card>
  );
}
