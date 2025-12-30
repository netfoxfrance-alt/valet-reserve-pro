import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Logo } from '@/components/ui/Logo';
import { 
  Check, ArrowLeft, Calendar, BarChart3, Package, Clock, 
  Users, Sparkles, Shield, Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export default function Upgrade() {
  const [isLoading, setIsLoading] = useState(false);
  const { session, subscription, checkSubscription } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  // Determine where to go back based on subscription
  const backUrl = subscription.subscribed ? '/dashboard' : '/dashboard/my-page';

  // Check for payment status in URL
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    if (paymentStatus === 'cancelled') {
      toast({
        title: 'Paiement annulé',
        description: 'Vous pouvez réessayer quand vous le souhaitez.',
        variant: 'destructive',
      });
    }
  }, [searchParams, toast]);

  const handleUpgrade = async () => {
    if (!session?.access_token) {
      toast({
        title: 'Erreur',
        description: 'Vous devez être connecté pour passer à Pro.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.url) {
        window.open(data.url, '_blank');
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer la session de paiement. Veuillez réessayer.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const proFeatures = [
    { icon: Calendar, title: 'Réservation automatique 24h/24', desc: 'Vos clients réservent en ligne, même quand vous dormez' },
    { icon: Clock, title: 'Agenda intégré avec créneaux', desc: 'Gérez vos disponibilités en temps réel' },
    { icon: Package, title: 'Offres illimitées', desc: 'Présentez toutes vos formules avec variantes de prix' },
    { icon: BarChart3, title: 'Statistiques détaillées', desc: 'Suivez votre CA, vos réservations et votre croissance' },
    { icon: Users, title: 'Base de données clients', desc: 'Historique complet de tous vos clients' },
    { icon: Sparkles, title: 'Qualification avancée', desc: 'Qualifiez automatiquement vos prospects' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to={backUrl} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Retour</span>
          </Link>
          <Logo size="md" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Passez à la vitesse supérieure
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-foreground tracking-tight mb-4">
            Débloquez tout le potentiel
            <br />
            <span className="text-muted-foreground">de CleaningPage Pro</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Automatisez vos réservations, gérez votre planning et développez votre activité avec des outils professionnels.
          </p>
        </div>

        {/* Pricing Card */}
        <Card className="max-w-lg mx-auto p-8 rounded-2xl ring-2 ring-primary mb-12">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-2">CleaningPage Pro</h2>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-bold text-foreground">39€</span>
              <span className="text-muted-foreground">/ mois</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Sans engagement · Annulez à tout moment</p>
          </div>

          <ul className="space-y-3 mb-8">
            {[
              'Tableau de bord complet',
              'Réservation automatique 24h/24',
              'Agenda intégré avec créneaux',
              'Gestion du planning',
              'Base de données clients',
              'Statistiques détaillées',
              'Offres illimitées et personnalisables',
              'Qualification client avancée',
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                <span className="text-foreground text-sm">{feature}</span>
              </li>
            ))}
          </ul>

          <Button 
            size="lg" 
            className="w-full rounded-full"
            onClick={handleUpgrade}
            disabled={isLoading || subscription.subscribed}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Redirection...
              </>
            ) : subscription.subscribed ? (
              'Déjà abonné Pro'
            ) : (
              'Passer à Pro'
            )}
          </Button>
          
          <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
            <Shield className="w-3 h-3" />
            Paiement sécurisé par Stripe
          </div>
        </Card>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {proFeatures.map((feature) => (
            <div key={feature.title} className="bg-secondary/30 rounded-xl p-5">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-medium text-foreground mb-1">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* FAQ or reassurance */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            Des questions ? Contactez-nous à{' '}
            <a href="mailto:contact@cleaningpage.com" className="text-primary hover:underline">
              contact@cleaningpage.com
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
