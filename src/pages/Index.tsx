import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, ArrowRight, Calendar, Users, BarChart3, Link2, Zap, Shield, Clock } from 'lucide-react';

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
            <Button>
              Accéder à mon espace
            </Button>
          </Link>
        </div>
      </header>
      
      {/* Hero */}
      <section className="py-20 md:py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-8 animate-fade-in-up">
            <Zap className="w-4 h-4" />
            Pour les professionnels du detailing auto
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight mb-6 animate-fade-in-up">
            Votre page de réservation
            <br />
            <span className="text-muted-foreground">en 5 minutes.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in-up stagger-1">
            Créez votre lien personnalisé, configurez vos packs et horaires,
            et laissez vos clients réserver en autonomie. Sans commission.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up stagger-2">
            <Link to="/auth">
              <Button variant="premium" size="xl">
                Créer mon espace gratuit
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mt-4 animate-fade-in-up stagger-3">
            Gratuit • Sans engagement • Prêt en 5 minutes
          </p>
        </div>
      </section>
      
      {/* Demo Link */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <Card variant="elevated" className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Link2 className="w-8 h-8 text-primary" />
              </div>
              <div className="text-center md:text-left flex-1">
                <h3 className="text-xl font-semibold text-foreground mb-2">Votre lien unique</h3>
                <p className="text-muted-foreground mb-4">
                  Chaque professionnel obtient son propre lien de réservation à partager avec ses clients.
                </p>
                <div className="inline-flex items-center gap-2 bg-muted px-4 py-2 rounded-lg font-mono text-sm">
                  <span className="text-muted-foreground">autocare.app/c/</span>
                  <span className="text-primary font-semibold">votre-centre</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>
      
      {/* Features */}
      <section className="py-20 px-4 bg-surface-subtle">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-muted-foreground text-lg">
              Un outil simple et complet pour gérer vos réservations.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card variant="elevated" className="p-8">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <Calendar className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Réservations automatiques</h3>
              <p className="text-muted-foreground">
                Vos clients réservent directement en ligne selon vos disponibilités. Plus d'appels, plus de SMS.
              </p>
            </Card>
            
            <Card variant="elevated" className="p-8">
              <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mb-6">
                <Sparkles className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Assistant IA intégré</h3>
              <p className="text-muted-foreground">
                L'IA recommande le pack idéal à vos clients en fonction de leurs besoins. Upsell automatique.
              </p>
            </Card>
            
            <Card variant="elevated" className="p-8">
              <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center mb-6">
                <BarChart3 className="w-7 h-7 text-secondary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Tableau de bord pro</h3>
              <p className="text-muted-foreground">
                Suivez vos rendez-vous, gérez vos packs et configurez vos horaires depuis une interface simple.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works for pros */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Lancez-vous en 3 étapes
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Créez votre compte</h3>
              <p className="text-muted-foreground">
                Inscription gratuite en 30 secondes. Votre espace est prêt immédiatement.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Configurez vos packs</h3>
              <p className="text-muted-foreground">
                Ajoutez vos offres, définissez vos prix et vos disponibilités.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Partagez votre lien</h3>
              <p className="text-muted-foreground">
                Diffusez votre lien sur vos réseaux, votre site ou vos cartes de visite.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust signals */}
      <section className="py-16 px-4 bg-surface-subtle">
        <div className="max-w-4xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              <div>
                <p className="font-semibold text-foreground">100% gratuit</p>
                <p className="text-sm text-muted-foreground">Sans commission sur vos prestations</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3">
              <Clock className="w-8 h-8 text-primary" />
              <div>
                <p className="font-semibold text-foreground">Prêt en 5 min</p>
                <p className="text-sm text-muted-foreground">Configuration ultra rapide</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              <div>
                <p className="font-semibold text-foreground">Pour tous les pros</p>
                <p className="text-sm text-muted-foreground">Detailing, lavage, esthétique auto</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-20 md:py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Prêt à simplifier vos réservations ?
          </h2>
          <p className="text-lg text-muted-foreground mb-10">
            Rejoignez les professionnels qui gagnent du temps chaque jour.
          </p>
          <Link to="/auth">
            <Button variant="premium" size="xl">
              Créer mon espace gratuit
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
