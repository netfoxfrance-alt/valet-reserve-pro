import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, ArrowRight, Calendar, Clock, Star, CheckCircle2 } from 'lucide-react';

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="w-full py-6 px-4 border-b border-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-xl text-foreground tracking-tight">AUTOCARE</span>
          </div>
          <Link to="/auth">
            <Button variant="ghost">
              Espace Pro
            </Button>
          </Link>
        </div>
      </header>
      
      {/* Hero */}
      <section className="py-20 md:py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight mb-6 animate-fade-in-up">
            La réservation intelligente
            <br />
            <span className="text-muted-foreground">pour un véhicule impeccable.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in-up stagger-1">
            Réservez le nettoyage adapté à votre véhicule en moins de 2 minutes.
            Simple. Rapide. Sans complication.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up stagger-2">
            <Link to="/booking">
              <Button variant="premium" size="xl">
                Réserver maintenant
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="outline" size="xl">
                Je suis professionnel
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Features */}
      <section className="py-20 px-4 bg-surface-subtle">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-muted-foreground text-lg">
              Un processus simple en 3 étapes.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card variant="elevated" className="p-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Star className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">1. Décrivez votre besoin</h3>
              <p className="text-muted-foreground">
                Répondez à quelques questions simples sur votre véhicule et vos attentes.
              </p>
            </Card>
            
            <Card variant="elevated" className="p-8 text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">2. Recevez une recommandation</h3>
              <p className="text-muted-foreground">
                Notre système intelligent vous propose le pack le plus adapté à vos besoins.
              </p>
            </Card>
            
            <Card variant="elevated" className="p-8 text-center">
              <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-8 h-8 text-secondary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">3. Réservez votre créneau</h3>
              <p className="text-muted-foreground">
                Choisissez le jour et l'heure qui vous conviennent. C'est confirmé instantanément.
              </p>
            </Card>
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-20 md:py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Prêt à retrouver l'éclat de votre véhicule ?
          </h2>
          <p className="text-lg text-muted-foreground mb-10">
            Réservez en quelques clics. Aucun engagement.
          </p>
          <Link to="/booking">
            <Button variant="premium" size="xl">
              Commencer la réservation
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">AUTOCARE</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 AUTOCARE. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}
