import { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export function SubscriptionBanner() {
  const { subscription, session } = useAuth();
  const [loading, setLoading] = useState(false);

  // Only show if user had a trial/subscription before but is currently not subscribed
  if (subscription.subscribed || !subscription.hadTrial) return null;

  const handleReactivate = async () => {
    if (!session?.access_token) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      if (error || !data?.url) {
        console.error('Checkout error:', error);
        return;
      }
      window.location.href = data.url;
    } catch (err) {
      console.error('Reactivation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div className="flex items-start gap-3 flex-1">
        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-amber-900 dark:text-amber-200 text-sm sm:text-base">
            Votre abonnement est inactif
          </p>
          <p className="text-amber-700 dark:text-amber-400 text-xs sm:text-sm mt-0.5">
            Votre page publique est fermée et vos clients ne peuvent plus réserver. Réactivez votre abonnement pour reprendre votre activité.
          </p>
        </div>
      </div>
      <Button
        onClick={handleReactivate}
        disabled={loading}
        className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl whitespace-nowrap flex-shrink-0"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : null}
        Réactiver mon abonnement
      </Button>
    </div>
  );
}
