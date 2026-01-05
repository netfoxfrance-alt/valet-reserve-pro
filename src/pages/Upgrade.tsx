import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Logo } from '@/components/ui/Logo';
import { Check, ArrowLeft, Sparkles, Shield, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { FeatureShowcase } from '@/components/upgrade/FeatureShowcase';

export default function Upgrade() {
  const [isLoading, setIsLoading] = useState(false);
  const { session, subscription, user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  // If user is subscribed, redirect to dashboard
  useEffect(() => {
    if (subscription.subscribed) {
      window.location.href = '/dashboard';
    }
  }, [subscription.subscribed]);

  // Check for payment status in URL
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    if (paymentStatus === 'success') {
      toast({
        title: 'Essai activé !',
        description: 'Bienvenue ! Votre essai gratuit de 30 jours est actif.',
      });
    } else if (paymentStatus === 'cancelled') {
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


  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Accueil</span>
          </Link>
          <Logo size="md" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-foreground tracking-tight mb-4">
            Débloquez tout le potentiel
            <br />
            <span className="text-muted-foreground">de CleaningPage Pro</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Automatisez vos réservations, gérez votre planning et développez votre activité.
          </p>
        </div>

        {/* Pricing Card */}
        <Card className="max-w-lg mx-auto p-8 rounded-2xl ring-2 ring-foreground mb-12 relative overflow-hidden">
          {/* Premium trial banner */}
          <div className="absolute top-0 left-0 right-0 bg-foreground text-primary-foreground py-2.5 px-4 text-center">
            <p className="text-sm font-medium">Essayez 30 jours gratuitement</p>
          </div>
          
          <div className="text-center mb-6 pt-10">
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
            className="w-full rounded-full bg-emerald-500 hover:bg-emerald-600 text-white"
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
              'Commencer l\'essai gratuit'
            )}
          </Button>
          
          <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
            <Shield className="w-3 h-3" />
            Paiement sécurisé par Stripe
          </div>
        </Card>

        {/* Features Showcase with Mockups */}
        <FeatureShowcase />

        {/* Value proposition - Apple style */}
        <div className="mt-32 mb-24 max-w-3xl mx-auto text-center">
          {/* Overline */}
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground/60 mb-10">
            CleaningPage Pro vous apporte
          </p>
          
          {/* Main value props */}
          <div className="space-y-0 mb-16">
            <p className="text-3xl sm:text-4xl md:text-5xl font-semibold text-foreground tracking-tight leading-tight">
              Un gain de temps.
            </p>
            <p className="text-3xl sm:text-4xl md:text-5xl font-semibold text-foreground tracking-tight leading-tight">
              Une meilleure conversion.
            </p>
            <p className="text-3xl sm:text-4xl md:text-5xl font-semibold text-foreground tracking-tight leading-tight">
              Une activité plus organisée.
            </p>
          </div>
          
          {/* Subtle divider */}
          <div className="w-12 h-px bg-border mx-auto mb-12" />
          
          {/* Trial CTA */}
          <div className="space-y-6">
          <p className="text-xl sm:text-2xl text-muted-foreground font-light">
              Essayez gratuitement pendant 30 jours,
              <br />
              et jugez par vous-même.
            </p>
            
            <Button 
              size="lg" 
              className="rounded-full bg-emerald-500 hover:bg-emerald-600 text-white px-12 h-14 text-lg font-medium shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300"
              onClick={handleUpgrade}
              disabled={isLoading || subscription.subscribed}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Redirection...
                </>
              ) : subscription.subscribed ? (
                'Déjà abonné Pro'
              ) : (
                'Tester Gratuitement'
              )}
            </Button>
            
            <p className="text-sm text-muted-foreground/50">
              Sans engagement · Annulez à tout moment
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
