import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Logo } from '@/components/ui/Logo';
import { 
  ArrowRight, Calendar, Users, BarChart3, Link2, 
  Shield, Clock, Check, Car, MapPin, Phone, 
  Star, Globe, MessageSquare
} from 'lucide-react';

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="w-full py-4 px-4 sm:px-6 border-b border-border/50 sticky top-0 bg-background/95 backdrop-blur-sm z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <Logo size="xl" />
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="text-xs sm:text-sm px-2 sm:px-4">
                Connexion
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="text-xs sm:text-sm px-3 sm:px-4">
                S'inscrire
              </Button>
            </Link>
          </div>
        </div>
      </header>
      
      {/* Hero with integrated mockup */}
      <section className="py-12 sm:py-20 md:py-28 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left: Text */}
            <div className="text-center lg:text-left">
              <div className="opacity-0 animate-fade-in-up inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs sm:text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                Utilisé par +50 centres
              </div>
              
              <h1 className="opacity-0 animate-fade-in-up stagger-1 text-3xl sm:text-4xl md:text-5xl font-semibold text-foreground tracking-tight mb-4 leading-tight">
                Votre vitrine digitale
                <br />
                <span className="text-muted-foreground">prête en 5 minutes.</span>
              </h1>
              
              <p className="opacity-0 animate-fade-in-up stagger-2 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
                Créez votre page gratuitement. Passez Pro pour automatiser vos réservations, gérer vos clients et suivre vos statistiques.
              </p>
              
              <div className="opacity-0 animate-fade-in-up stagger-3 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-6">
                <Link to="/auth">
                  <Button size="lg" className="rounded-full px-8 w-full sm:w-auto">
                    Créer ma page gratuitement
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
              
              {/* Unique link preview */}
              <div className="opacity-0 animate-fade-in-up stagger-4 inline-flex items-center gap-2 bg-secondary/60 px-4 py-2.5 rounded-full">
                <Link2 className="w-4 h-4 text-muted-foreground" />
                <span className="font-mono text-sm">
                  <span className="text-muted-foreground">cleaningpage.com/c/</span>
                  <span className="text-primary font-semibold">votre-centre</span>
                </span>
              </div>
            </div>
            
            {/* Right: Page Mockup */}
            <div className="opacity-0 animate-fade-in-up stagger-3 flex justify-center lg:justify-end">
              <div className="w-full max-w-[320px] sm:max-w-[360px]">
                <div className="bg-card rounded-2xl shadow-2xl overflow-hidden border border-border/60">
                  {/* Cover & Logo */}
                  <div className="h-24 sm:h-28 bg-gradient-to-r from-primary/20 to-primary/5 relative">
                    <div className="absolute -bottom-6 left-5 w-14 h-14 bg-card rounded-xl shadow-lg flex items-center justify-center border border-border/40">
                      <Car className="w-7 h-7 text-primary" />
                    </div>
                  </div>

                  <div className="p-5 pt-10">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-foreground">Clean Auto Pro</h3>
                      <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Ouvert</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                      <span>Lavage auto</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>4.8</span>
                      </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="bg-secondary/50 rounded-lg p-2 text-center">
                        <MapPin className="w-3.5 h-3.5 mx-auto mb-1 text-muted-foreground" />
                        <p className="text-[10px] text-muted-foreground">Paris 15e</p>
                      </div>
                      <div className="bg-secondary/50 rounded-lg p-2 text-center">
                        <Clock className="w-3.5 h-3.5 mx-auto mb-1 text-muted-foreground" />
                        <p className="text-[10px] text-muted-foreground">9h - 19h</p>
                      </div>
                      <div className="bg-secondary/50 rounded-lg p-2 text-center">
                        <Phone className="w-3.5 h-3.5 mx-auto mb-1 text-muted-foreground" />
                        <p className="text-[10px] text-muted-foreground">06 12 34</p>
                      </div>
                    </div>

                    {/* Formules */}
                    <div className="mb-4">
                      <h4 className="text-xs font-semibold text-foreground mb-2">Nos formules</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { name: 'Lavage simple', price: '15€' },
                          { name: 'Intérieur', price: '35€' },
                          { name: 'Complet', price: '65€' },
                          { name: 'Premium', price: '120€' },
                        ].map((item) => (
                          <div key={item.name} className="bg-secondary/30 rounded-lg p-2 text-center">
                            <p className="text-[10px] font-medium text-foreground mb-0.5">{item.name}</p>
                            <p className="text-xs font-semibold text-primary">{item.price}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Booking Button */}
                    <div className="bg-primary text-primary-foreground rounded-xl py-3 text-center text-sm font-medium">
                      Réserver un créneau
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comment ça marche - 3 steps */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-secondary/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight mb-3">
              Comment ça marche
            </h2>
            <p className="text-muted-foreground">
              Trois étapes pour être visible en ligne.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                step: 1,
                icon: Globe,
                title: 'Créez votre page',
                description: 'Ajoutez vos infos, vos formules et personnalisez votre vitrine.',
              },
              {
                step: 2,
                icon: Link2,
                title: 'Partagez votre lien',
                description: 'cleaningpage.com/c/votre-centre à partager partout.',
              },
              {
                step: 3,
                icon: Users,
                title: 'Recevez des clients',
                description: 'Demandes de contact ou réservations automatiques.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="relative inline-flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-card rounded-2xl shadow-lg flex items-center justify-center border border-border/40">
                    <item.icon className="w-7 h-7 text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-foreground text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight mb-3">
              Pourquoi passer Pro ?
            </h2>
            <p className="text-muted-foreground">
              Gagnez du temps et des clients chaque jour.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-3 gap-6">
            <Card variant="elevated" className="p-6 rounded-2xl hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Fini les appels pour prendre RDV</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Vos clients réservent en ligne, 24h/24, même quand vous travaillez.
              </p>
            </Card>

            <Card variant="elevated" className="p-6 rounded-2xl hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Tout votre historique client</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Retrouvez chaque client en un clic. Plus besoin de carnets ou de mémoire.
              </p>
            </Card>

            <Card variant="elevated" className="p-6 rounded-2xl hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Suivez votre croissance</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Visualisez vos performances en temps réel. CA, réservations, formules populaires.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-secondary/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight mb-3">
              Choisissez votre formule
            </h2>
            <p className="text-muted-foreground">
              Commencez gratuitement, évoluez quand vous êtes prêt.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
            {/* Free Plan */}
            <Card variant="elevated" className="p-6 sm:p-8 rounded-2xl hover:shadow-xl transition-shadow duration-300">
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 bg-secondary px-3 py-1 rounded-full text-xs font-medium text-muted-foreground mb-3">
                  <Globe className="w-3.5 h-3.5" />
                  Votre vitrine digitale
                </div>
                <h3 className="text-xl font-semibold text-foreground">Free</h3>
              </div>
              
              <div className="mb-6">
                <span className="text-4xl font-semibold text-foreground">Gratuit</span>
                <span className="text-muted-foreground ml-2">pour toujours</span>
              </div>
              
              <ul className="space-y-3 mb-8">
                {[
                  'Page professionnelle personnalisée',
                  'Informations de contact visibles',
                  'Formulaire de demande simple',
                  'Lien unique partageable',
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-secondary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Link to="/auth">
                <Button variant="outline" size="lg" className="w-full rounded-full">
                  Commencer gratuitement
                </Button>
              </Link>
            </Card>

            {/* Pro Plan */}
            <Card variant="elevated" className="p-6 sm:p-8 rounded-2xl ring-2 ring-primary relative hover:shadow-xl transition-shadow duration-300">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                Recommandé
              </div>
              
              <div className="mb-6 mt-2">
                <div className="inline-flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full text-xs font-medium text-primary mb-3">
                  <Calendar className="w-3.5 h-3.5" />
                  Votre business automatisé
                </div>
                <h3 className="text-xl font-semibold text-foreground">Pro</h3>
              </div>
              
              <div className="mb-6">
                <span className="text-4xl font-semibold text-foreground">49€</span>
                <span className="text-muted-foreground ml-2">/ mois</span>
                <p className="text-xs text-muted-foreground mt-1">Sans engagement</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                {[
                  'Tout ce qui est inclus dans Free',
                  'Réservations automatiques 24/7',
                  'Gestion complète des clients',
                  'Statistiques détaillées',
                  'Présentation des formules avec prix',
                  'Personnalisation avancée',
                ].map((feature, i) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className={`w-5 h-5 ${i === 0 ? 'bg-secondary' : 'bg-primary/10'} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <Check className={`w-3 h-3 ${i === 0 ? 'text-muted-foreground' : 'text-primary'}`} />
                    </div>
                    <span className={`text-sm ${i === 0 ? 'text-muted-foreground' : 'text-foreground'}`}>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Link to="/auth">
                <Button size="lg" className="w-full rounded-full">
                  Essayer Pro
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust signals */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Card variant="elevated" className="p-5 rounded-xl text-center hover:shadow-lg transition-shadow duration-300">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <p className="font-semibold text-foreground text-sm mb-0.5">Sans commission</p>
              <p className="text-xs text-muted-foreground">Vos revenus restent vos revenus</p>
            </Card>
            <Card variant="elevated" className="p-5 rounded-xl text-center hover:shadow-lg transition-shadow duration-300">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <p className="font-semibold text-foreground text-sm mb-0.5">Prêt en 5 min</p>
              <p className="text-xs text-muted-foreground">Configuration ultra rapide</p>
            </Card>
            <Card variant="elevated" className="p-5 rounded-xl text-center hover:shadow-lg transition-shadow duration-300 col-span-2 sm:col-span-1">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <p className="font-semibold text-foreground text-sm mb-0.5">Support réactif</p>
              <p className="text-xs text-muted-foreground">On répond en quelques heures</p>
            </Card>
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-secondary/30">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight mb-4">
            Créez votre vitrine en 5 minutes
          </h2>
          <p className="text-muted-foreground mb-8">
            Gratuit, sans engagement.
          </p>
          <Link to="/auth">
            <Button size="lg" className="rounded-full px-8">
              Créer ma page gratuitement
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 border-t border-border/50">
        <div className="max-w-5xl mx-auto flex items-center justify-center">
          <p className="text-sm text-muted-foreground">
            © 2024 CleaningPage. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}
