import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, ArrowRight, Calendar, Users, BarChart3, Link2, Zap, Shield, Clock, MessageSquare, Check } from 'lucide-react';

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
            <span className="font-semibold text-xl text-foreground tracking-tight">OCLINKO</span>
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
            Votre lien client
            <br />
            <span className="text-muted-foreground">professionnel en 5 min.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in-up stagger-1">
            Créez votre page pro personnalisée, recevez des demandes clients qualifiées, 
            et développez votre activité sans effort.
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
            Version gratuite disponible • Sans engagement
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
                  Chaque professionnel obtient son propre lien à partager avec ses clients.
                </p>
                <div className="inline-flex items-center gap-2 bg-muted px-4 py-2 rounded-lg font-mono text-sm">
                  <span className="text-muted-foreground">oclinko.app/c/</span>
                  <span className="text-primary font-semibold">votre-centre</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-surface-subtle">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Deux offres, un objectif
            </h2>
            <p className="text-muted-foreground text-lg">
              Développez votre clientèle, à votre rythme.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <Card variant="elevated" className="p-8">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-foreground mb-1">Oclinko Free</h3>
                <p className="text-muted-foreground text-sm">Présence en ligne simplifiée</p>
              </div>
              
              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">Gratuit</span>
                <span className="text-muted-foreground ml-2">pour toujours</span>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">Page professionnelle personnalisée</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">Formulaire de demande simple</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">Notifications par email</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">Lien unique partageable</span>
                </li>
              </ul>
              
              <Link to="/auth">
                <Button variant="outline" size="lg" className="w-full">
                  Commencer gratuitement
                </Button>
              </Link>
            </Card>

            {/* Pro Plan */}
            <Card variant="elevated" className="p-8 ring-2 ring-primary relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                Recommandé
              </div>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-foreground mb-1">Oclinko Pro</h3>
                <p className="text-muted-foreground text-sm">Automatisation complète</p>
              </div>
              
              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">49€</span>
                <span className="text-muted-foreground ml-2">/ mois</span>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">Personnalisation complète de la page</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">Questionnaire intelligent inclus</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">Agenda intégré avec créneaux</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">Prise de RDV qualifiés directement</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">Tableau de bord pour organiser</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">Accès à la base de données client</span>
                </li>
              </ul>
              
              <Link to="/auth">
                <Button variant="premium" size="lg" className="w-full">
                  Essayer Pro
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </Card>
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
                <p className="font-semibold text-foreground">Sans commission</p>
                <p className="text-sm text-muted-foreground">Vos revenus restent vos revenus</p>
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
            Prêt à simplifier votre quotidien ?
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
            <span className="font-semibold text-foreground">OCLINKO</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 OCLINKO. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}
