import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Sparkles, ArrowRight, Calendar, Users, BarChart3, Link2, 
  Zap, Shield, Clock, Check, Car, Droplets, MapPin, Phone, 
  Star, Settings, LogOut, ChevronRight
} from 'lucide-react';

export default function Index() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [dashboardTab, setDashboardTab] = useState<'reservations' | 'formules' | 'stats' | 'settings'>('reservations');

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="w-full py-5 px-6 border-b border-border/50">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-foreground rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-xl text-foreground tracking-tight">OCLINKO</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm">
                Se connecter
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="sm">
                S'inscrire
              </Button>
            </Link>
          </div>
        </div>
      </header>
      
      {/* Hero */}
      <section className="py-24 md:py-36 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="opacity-0 animate-fade-in-up inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            Utilisé par +50 centres
          </div>
          <h1 className="opacity-0 animate-fade-in-up stagger-1 text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground tracking-tight mb-6 leading-tight">
            Tout votre business de nettoyage,
            <br />
            <span className="text-muted-foreground">dans un seul espace.</span>
          </h1>
          <p className="opacity-0 animate-fade-in-up stagger-2 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Votre page pro personnalisée en ligne, qui prend les rendez-vous et organise votre planning.
          </p>
          <div className="opacity-0 animate-fade-in-up stagger-3 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="xl" className="rounded-full px-8">
                Créer mon espace gratuit
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
          <p className="opacity-0 animate-fade-in-up stagger-4 text-sm text-muted-foreground mt-6">
            Sans engagement · Version gratuite disponible
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 md:py-36 px-6 bg-secondary/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-lg text-muted-foreground">
              Des outils simples pour gérer votre activité au quotidien.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card variant="elevated" className="p-6 rounded-2xl hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Agenda intelligent</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Gérez vos rendez-vous et vos créneaux disponibles en quelques clics.
              </p>
            </Card>

            <Card variant="elevated" className="p-6 rounded-2xl hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Base clients</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Gardez une trace de tous vos clients et de leur historique.
              </p>
            </Card>

            <Card variant="elevated" className="p-6 rounded-2xl hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Statistiques</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Suivez votre activité et analysez vos performances.
              </p>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Demo Link */}
      <section className="py-24 md:py-36 px-6">
        <div className="max-w-3xl mx-auto">
          <Card variant="elevated" className="p-8 md:p-10 rounded-2xl">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center flex-shrink-0">
                <Link2 className="w-8 h-8 text-foreground" />
              </div>
              <div className="text-center md:text-left flex-1">
                <h3 className="text-xl font-semibold text-foreground mb-2">Votre lien unique</h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Chaque professionnel obtient son propre lien à partager avec ses clients.
                </p>
                <div className="inline-flex items-center gap-2 bg-secondary/60 px-4 py-2.5 rounded-full font-mono text-sm">
                  <span className="text-muted-foreground">oclinko.app/c/</span>
                  <span className="text-primary font-semibold">votre-centre</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Interactive Mockups Carousel */}
      <section className="py-24 md:py-36 px-6 bg-secondary/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight mb-4">
              Découvrez l'expérience
            </h2>
            <p className="text-lg text-muted-foreground">
              Une interface pensée pour vous et vos clients.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center gap-2 mb-8">
            <button
              onClick={() => setActiveSlide(0)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeSlide === 0 
                  ? 'bg-foreground text-white' 
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
              }`}
            >
              Votre page centre
            </button>
            <button
              onClick={() => setActiveSlide(1)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeSlide === 1 
                  ? 'bg-foreground text-white' 
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
              }`}
            >
              Votre espace dashboard
            </button>
          </div>

          {/* Carousel Container */}
          <div className="overflow-hidden rounded-2xl">
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${activeSlide * 100}%)` }}
            >
              {/* Slide 1: Client Page Mockup */}
              <div className="w-full flex-shrink-0 px-4">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-border/60">
                  {/* Browser Bar */}
                  <div className="bg-secondary/50 px-4 py-3 flex items-center gap-3 border-b border-border/40">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
                      <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
                      <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
                    </div>
                    <div className="flex-1 bg-white rounded-md px-3 py-1 text-xs text-muted-foreground">
                      oclinko.app/c/clean-auto-pro
                    </div>
                  </div>

                  {/* Page Content */}
                  <div className="p-6">
                    {/* Cover & Logo */}
                    <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/5 rounded-xl mb-4 relative">
                      <div className="absolute -bottom-6 left-6 w-16 h-16 bg-white rounded-xl shadow-lg flex items-center justify-center border border-border/40">
                        <Car className="w-8 h-8 text-primary" />
                      </div>
                    </div>

                    <div className="mt-8 mb-6">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-foreground">Clean Auto Pro</h3>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Ouvert</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Lavage auto</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                          <span>4.8</span>
                          <span className="text-xs">(127 avis)</span>
                        </div>
                      </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      <div className="bg-secondary/50 rounded-lg p-3 text-center">
                        <MapPin className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">12 rue du Lavage</p>
                      </div>
                      <div className="bg-secondary/50 rounded-lg p-3 text-center">
                        <Clock className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">9h - 19h</p>
                      </div>
                      <div className="bg-secondary/50 rounded-lg p-3 text-center">
                        <Phone className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">06 12 34 56 78</p>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-6">
                      Spécialiste du nettoyage automobile depuis 10 ans. Service de qualité et satisfaction garantie.
                    </p>

                    {/* Formules */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-foreground mb-3">Nos formules</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {[
                          { name: 'Lavage simple', price: '15€' },
                          { name: 'Nettoyage intérieur', price: '35€' },
                          { name: 'Formule complète', price: '65€' },
                          { name: 'Premium détail', price: '120€' },
                        ].map((item) => (
                          <div key={item.name} className="bg-secondary/30 rounded-lg p-3 text-center">
                            <p className="text-xs font-medium text-foreground mb-1">{item.name}</p>
                            <p className="text-sm font-semibold text-primary">{item.price}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Booking Form Preview */}
                    <div className="bg-secondary/30 rounded-xl p-4">
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="bg-white rounded-lg p-2 text-center text-xs text-muted-foreground border border-border/40">
                          📅 Date
                        </div>
                        <div className="bg-white rounded-lg p-2 text-center text-xs text-muted-foreground border border-border/40">
                          🕐 Heure
                        </div>
                        <div className="bg-white rounded-lg p-2 text-center text-xs text-muted-foreground border border-border/40">
                          🚗 Véhicule
                        </div>
                      </div>
                      <div className="bg-primary text-white rounded-lg py-2 text-center text-sm font-medium">
                        Réserver
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide 2: Dashboard Mockup */}
              <div className="w-full flex-shrink-0 px-4">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-border/60">
                  {/* Browser Bar */}
                  <div className="bg-secondary/50 px-4 py-3 flex items-center gap-3 border-b border-border/40">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
                      <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
                      <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
                    </div>
                    <div className="flex-1 bg-white rounded-md px-3 py-1 text-xs text-muted-foreground">
                      oclinko.app/dashboard
                    </div>
                  </div>

                  {/* Dashboard Layout */}
                  <div className="flex min-h-[400px]">
                    {/* Sidebar */}
                    <div className="w-48 bg-secondary/30 border-r border-border/40 p-4 flex-shrink-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-semibold">OCLINKO</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-6 truncate">/clean-auto-pro</p>

                      <nav className="space-y-1">
                        {[
                          { icon: Calendar, label: 'Réservations', active: dashboardTab === 'reservations', tab: 'reservations' as const },
                          { icon: Droplets, label: 'Formules', active: dashboardTab === 'formules', tab: 'formules' as const },
                          { icon: BarChart3, label: 'Statistiques', active: dashboardTab === 'stats', tab: 'stats' as const },
                          { icon: Settings, label: 'Paramètres', active: dashboardTab === 'settings', tab: 'settings' as const },
                        ].map((item) => (
                          <button
                            key={item.label}
                            onClick={() => setDashboardTab(item.tab)}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors ${
                              item.active 
                                ? 'bg-white text-foreground shadow-sm' 
                                : 'text-muted-foreground hover:bg-white/50'
                            }`}
                          >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                          </button>
                        ))}
                      </nav>

                      <div className="mt-auto pt-6">
                        <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                          <LogOut className="w-4 h-4" />
                          Déconnexion
                        </button>
                      </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 p-6">
                      {dashboardTab === 'reservations' && (
                        <>
                          <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-foreground">Réservations</h3>
                            <div className="bg-secondary px-3 py-1 rounded-full text-xs">
                              <span className="font-semibold text-primary">8</span>
                              <span className="text-muted-foreground">/12 aujourd'hui</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            {[
                              { name: 'Jean Martin', vehicle: 'Audi A4', time: '10:00', status: 'Confirmé', color: 'green' },
                              { name: 'Marie Dupont', vehicle: 'BMW X3', time: '11:30', status: 'En attente', color: 'yellow' },
                              { name: 'Pierre Bernard', vehicle: 'Renault Clio', time: '14:00', status: 'Arrivé', color: 'blue' },
                            ].map((booking, i) => (
                              <div key={i} className="flex items-center gap-3 bg-secondary/30 rounded-lg p-3">
                                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-xs font-semibold text-primary">
                                  {booking.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground truncate">{booking.name}</p>
                                  <p className="text-xs text-muted-foreground">{booking.vehicle} • {booking.time}</p>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  booking.color === 'green' ? 'bg-green-100 text-green-700' :
                                  booking.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-blue-100 text-blue-700'
                                }`}>
                                  {booking.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </>
                      )}

                      {dashboardTab === 'formules' && (
                        <>
                          <h3 className="text-lg font-semibold text-foreground mb-6">Vos formules</h3>
                          <div className="space-y-3">
                            {[
                              { name: 'Lavage simple', desc: 'Extérieur uniquement', price: '15€' },
                              { name: 'Nettoyage intérieur', desc: 'Aspiration et nettoyage', price: '35€' },
                              { name: 'Formule complète', desc: 'Intérieur + extérieur', price: '65€' },
                            ].map((pack, i) => (
                              <div key={i} className="flex items-center gap-4 bg-secondary/30 rounded-lg p-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                  <Droplets className="w-6 h-6 text-primary" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-foreground">{pack.name}</p>
                                  <p className="text-xs text-muted-foreground">{pack.desc}</p>
                                </div>
                                <p className="text-sm font-semibold text-primary">{pack.price}</p>
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                              </div>
                            ))}
                          </div>
                        </>
                      )}

                      {dashboardTab === 'stats' && (
                        <>
                          <h3 className="text-lg font-semibold text-foreground mb-6">Statistiques</h3>
                          <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-secondary/30 rounded-lg p-4">
                              <p className="text-xs text-muted-foreground mb-1">Ce mois</p>
                              <p className="text-2xl font-semibold text-foreground">127</p>
                              <p className="text-xs text-green-600">+12% vs mois dernier</p>
                            </div>
                            <div className="bg-secondary/30 rounded-lg p-4">
                              <p className="text-xs text-muted-foreground mb-1">Chiffre d'affaires</p>
                              <p className="text-2xl font-semibold text-foreground">4 850€</p>
                              <p className="text-xs text-green-600">+8% vs mois dernier</p>
                            </div>
                          </div>
                          <div className="bg-secondary/30 rounded-lg p-4">
                            <p className="text-xs text-muted-foreground mb-3">Répartition des formules</p>
                            <div className="space-y-2">
                              {[
                                { name: 'Formule complète', pct: 45 },
                                { name: 'Nettoyage intérieur', pct: 30 },
                                { name: 'Lavage simple', pct: 25 },
                              ].map((item, i) => (
                                <div key={i}>
                                  <div className="flex justify-between text-xs mb-1">
                                    <span className="text-foreground">{item.name}</span>
                                    <span className="text-muted-foreground">{item.pct}%</span>
                                  </div>
                                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-primary rounded-full transition-all"
                                      style={{ width: `${item.pct}%` }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      {dashboardTab === 'settings' && (
                        <>
                          <h3 className="text-lg font-semibold text-foreground mb-6">Paramètres</h3>
                          <div className="space-y-4">
                            <div className="bg-secondary/30 rounded-lg p-4">
                              <p className="text-xs text-muted-foreground mb-2">Logo du centre</p>
                              <div className="w-16 h-16 bg-white rounded-lg border border-border/40 flex items-center justify-center">
                                <Car className="w-8 h-8 text-muted-foreground" />
                              </div>
                            </div>
                            <div className="bg-secondary/30 rounded-lg p-4">
                              <p className="text-xs text-muted-foreground mb-2">Informations</p>
                              <p className="text-sm font-medium text-foreground">Clean Auto Pro</p>
                              <p className="text-xs text-muted-foreground">12 rue du Lavage, 75001 Paris</p>
                            </div>
                            <div className="bg-secondary/30 rounded-lg p-4">
                              <p className="text-xs text-muted-foreground mb-2">Horaires</p>
                              <p className="text-sm text-foreground">Lun - Sam : 9h - 19h</p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Toggle Button */}
          <div className="flex justify-center mt-8">
            <Button 
              variant="outline" 
              onClick={() => setActiveSlide(activeSlide === 0 ? 1 : 0)}
              className="rounded-full"
            >
              {activeSlide === 0 ? 'Voir le dashboard' : 'Voir la page centre'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {[0, 1].map((i) => (
              <button
                key={i}
                onClick={() => setActiveSlide(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  activeSlide === i ? 'bg-foreground w-6' : 'bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 md:py-36 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight mb-4">
              Deux offres, un objectif
            </h2>
            <p className="text-lg text-muted-foreground">
              Développez votre clientèle, à votre rythme.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Free Plan */}
            <Card variant="elevated" className="p-8 rounded-2xl hover:shadow-xl transition-shadow duration-300">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-foreground mb-1">Oclinko Free</h3>
                <p className="text-muted-foreground text-sm">Présence en ligne simplifiée</p>
              </div>
              
              <div className="mb-6">
                <span className="text-4xl font-semibold text-foreground">Gratuit</span>
                <span className="text-muted-foreground ml-2">pour toujours</span>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-foreground text-sm">Page professionnelle personnalisée</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-foreground text-sm">Formulaire de demande simple</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-foreground text-sm">Notifications par email</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-foreground text-sm">Lien unique partageable</span>
                </li>
              </ul>
              
              <Link to="/auth">
                <Button variant="outline" size="lg" className="w-full rounded-full">
                  Commencer gratuitement
                </Button>
              </Link>
            </Card>

            {/* Pro Plan */}
            <Card variant="elevated" className="p-8 rounded-2xl ring-2 ring-foreground relative hover:shadow-xl transition-shadow duration-300">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-foreground text-white px-4 py-1 rounded-full text-sm font-medium">
                Recommandé
              </div>
              <div className="absolute top-4 right-4 bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-medium">
                Sans engagement
              </div>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-foreground mb-1">Oclinko Pro</h3>
                <p className="text-muted-foreground text-sm">Automatisation complète</p>
              </div>
              
              <div className="mb-6">
                <span className="text-4xl font-semibold text-foreground">49€</span>
                <span className="text-muted-foreground ml-2">/ mois</span>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-foreground text-sm">Personnalisation complète de la page</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-foreground text-sm">Questionnaire intelligent inclus</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-foreground text-sm">Agenda intégré avec créneaux</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-foreground text-sm">Prise de RDV qualifiés directement</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-foreground text-sm">Tableau de bord pour organiser</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-foreground text-sm">Accès à la base de données client</span>
                </li>
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
      <section className="py-24 md:py-36 px-6 bg-secondary/30">
        <div className="max-w-4xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-6">
            <Card variant="elevated" className="p-6 rounded-2xl text-center hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <p className="font-semibold text-foreground mb-1">Sans commission</p>
              <p className="text-sm text-muted-foreground">Vos revenus restent vos revenus</p>
            </Card>
            <Card variant="elevated" className="p-6 rounded-2xl text-center hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <p className="font-semibold text-foreground mb-1">Prêt en 5 min</p>
              <p className="text-sm text-muted-foreground">Configuration ultra rapide</p>
            </Card>
            <Card variant="elevated" className="p-6 rounded-2xl text-center hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <p className="font-semibold text-foreground mb-1">Pour tous les pros</p>
              <p className="text-sm text-muted-foreground">Detailing, lavage, esthétique auto</p>
            </Card>
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-24 md:py-36 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight mb-6">
            Prêt à simplifier votre quotidien ?
          </h2>
          <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
            Rejoignez les professionnels qui gagnent du temps chaque jour.
          </p>
          <Link to="/auth">
            <Button size="xl" className="rounded-full px-8">
              Créer mon espace gratuit
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border/50">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
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
