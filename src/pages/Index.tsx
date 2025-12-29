import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Logo } from '@/components/ui/Logo';
import { 
  ArrowRight, Calendar, Users, BarChart3, Link2, 
  Zap, Shield, Clock, Check, Car, Droplets, MapPin, Phone, 
  Star, Settings, LogOut, ChevronRight, Globe, Palette, Eye
} from 'lucide-react';

export default function Index() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [dashboardTab, setDashboardTab] = useState<'reservations' | 'mypage' | 'formules' | 'stats' | 'settings'>('reservations');

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="w-full py-4 px-4 sm:px-6 border-b border-border/50 sticky top-0 bg-background/95 backdrop-blur-sm z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo size="lg" />
          </div>
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
      
      {/* Hero */}
      <section className="py-16 sm:py-24 md:py-36 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="opacity-0 animate-fade-in-up inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs sm:text-sm font-medium mb-6 sm:mb-8">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            Utilisé par +50 centres
          </div>
          <h1 className="opacity-0 animate-fade-in-up stagger-1 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground tracking-tight mb-4 sm:mb-6 leading-tight px-2">
            Tout votre business de nettoyage,
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>
            <span className="text-muted-foreground">dans un seul espace.</span>
          </h1>
          <p className="opacity-0 animate-fade-in-up stagger-2 text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2">
            Votre page pro personnalisée en ligne, qui prend les rendez-vous et organise votre planning.
          </p>
          <div className="opacity-0 animate-fade-in-up stagger-3 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Link to="/auth" className="w-full sm:w-auto">
              <Button size="lg" className="rounded-full px-6 sm:px-8 w-full sm:w-auto text-sm sm:text-base">
                Créer mon espace gratuit
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </Button>
            </Link>
          </div>
          <p className="opacity-0 animate-fade-in-up stagger-4 text-xs sm:text-sm text-muted-foreground mt-5 sm:mt-6">
            Sans engagement · Version gratuite disponible
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 md:py-36 px-4 sm:px-6 bg-secondary/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground tracking-tight mb-3 sm:mb-4 px-2">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground px-2">
              Des outils simples pour gérer votre activité au quotidien.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
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
      <section className="py-16 sm:py-24 md:py-36 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <Card variant="elevated" className="p-6 sm:p-8 md:p-10 rounded-2xl">
            <div className="flex flex-col items-center gap-4 sm:gap-6 text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-secondary rounded-2xl flex items-center justify-center flex-shrink-0">
                <Link2 className="w-7 h-7 sm:w-8 sm:h-8 text-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">Votre lien unique</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-4 leading-relaxed">
                  Chaque professionnel obtient son propre lien à partager avec ses clients.
                </p>
                <div className="inline-flex flex-wrap items-center justify-center gap-1 bg-secondary/60 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full font-mono text-xs sm:text-sm">
                  <span className="text-muted-foreground break-all">cleaningpage.com/c/</span>
                  <span className="text-primary font-semibold">votre-centre</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Interactive Mockups Carousel */}
      <section className="py-16 sm:py-24 md:py-36 px-4 sm:px-6 bg-secondary/30 overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground tracking-tight mb-3 sm:mb-4 px-2">
              Découvrez l'expérience
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground px-2">
              Une interface pensée pour vous et vos clients.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center gap-2 mb-6 sm:mb-8 px-2">
            <button
              onClick={() => setActiveSlide(0)}
              className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${
                activeSlide === 0 
                  ? 'bg-foreground text-primary-foreground' 
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
              }`}
            >
              Page centre
            </button>
            <button
              onClick={() => setActiveSlide(1)}
              className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${
                activeSlide === 1 
                  ? 'bg-foreground text-primary-foreground' 
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
              }`}
            >
              Dashboard
            </button>
          </div>

          {/* Carousel Container */}
          <div className="overflow-hidden rounded-xl sm:rounded-2xl -mx-4 sm:mx-0">
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${activeSlide * 100}%)` }}
            >
              {/* Slide 1: Client Page Mockup */}
              <div className="w-full flex-shrink-0 px-2 sm:px-4">
                <div className="bg-card rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl overflow-hidden border border-border/60">
                  {/* Browser Bar - Hidden on mobile */}
                  <div className="hidden sm:flex bg-secondary/50 px-4 py-3 items-center gap-3 border-b border-border/40">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
                      <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
                      <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
                    </div>
                    <div className="flex-1 bg-background rounded-md px-3 py-1 text-xs text-muted-foreground truncate">
                      cleaningpage.com/c/clean-auto-pro
                    </div>
                  </div>

                  {/* Page Content */}
                  <div className="p-4 sm:p-6">
                    {/* Cover & Logo */}
                    <div className="h-24 sm:h-32 bg-gradient-to-r from-primary/20 to-primary/5 rounded-lg sm:rounded-xl mb-4 relative">
                      <div className="absolute -bottom-5 sm:-bottom-6 left-4 sm:left-6 w-12 h-12 sm:w-16 sm:h-16 bg-card rounded-lg sm:rounded-xl shadow-lg flex items-center justify-center border border-border/40">
                        <Car className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                      </div>
                    </div>

                    <div className="mt-6 sm:mt-8 mb-4 sm:mb-6">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base sm:text-lg font-semibold text-foreground">Clean Auto Pro</h3>
                        <span className="text-[10px] sm:text-xs bg-green-100 text-green-700 px-1.5 sm:px-2 py-0.5 rounded-full">Ouvert</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                        <span>Lavage auto</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-yellow-400 text-yellow-400" />
                          <span>4.8</span>
                        </div>
                      </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
                      <div className="bg-secondary/50 rounded-lg p-2 sm:p-3 text-center">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mx-auto mb-1 text-muted-foreground" />
                        <p className="text-[10px] sm:text-xs text-muted-foreground truncate">12 rue du Lavage</p>
                      </div>
                      <div className="bg-secondary/50 rounded-lg p-2 sm:p-3 text-center">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 mx-auto mb-1 text-muted-foreground" />
                        <p className="text-[10px] sm:text-xs text-muted-foreground">9h - 19h</p>
                      </div>
                      <div className="bg-secondary/50 rounded-lg p-2 sm:p-3 text-center">
                        <Phone className="w-3 h-3 sm:w-4 sm:h-4 mx-auto mb-1 text-muted-foreground" />
                        <p className="text-[10px] sm:text-xs text-muted-foreground">06 12 34 56</p>
                      </div>
                    </div>

                    {/* Formules - Simplified on mobile */}
                    <div className="mb-4 sm:mb-6">
                      <h4 className="text-xs sm:text-sm font-semibold text-foreground mb-2 sm:mb-3">Nos formules</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { name: 'Lavage simple', price: '15€' },
                          { name: 'Nettoyage intérieur', price: '35€' },
                          { name: 'Formule complète', price: '65€' },
                          { name: 'Premium', price: '120€' },
                        ].map((item) => (
                          <div key={item.name} className="bg-secondary/30 rounded-lg p-2 sm:p-3 text-center">
                            <p className="text-[10px] sm:text-xs font-medium text-foreground mb-0.5 sm:mb-1 truncate">{item.name}</p>
                            <p className="text-xs sm:text-sm font-semibold text-primary">{item.price}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Booking Button */}
                    <div className="bg-primary text-primary-foreground rounded-lg py-2.5 sm:py-3 text-center text-xs sm:text-sm font-medium">
                      Réserver un créneau
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide 2: Dashboard Mockup */}
              <div className="w-full flex-shrink-0 px-2 sm:px-4">
                
                {/* MOBILE VERSION - Phone mockup style */}
                <div className="sm:hidden mx-auto max-w-[280px]">
                  <div className="bg-card rounded-[2rem] shadow-2xl overflow-hidden border-4 border-foreground/10 relative">
                    {/* Phone notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-foreground/10 rounded-b-2xl" />
                    
                    {/* Screen content */}
                    <div className="pt-8 pb-16 px-4 min-h-[400px] bg-background">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2">
                          <Logo size="md" />
                          <div>
                            <p className="text-xs font-semibold text-foreground">Clean Auto Pro</p>
                            <p className="text-[10px] text-muted-foreground">Aujourd'hui</p>
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                          <Users className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                      
                      {/* Stats cards */}
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="bg-secondary/50 rounded-xl p-3">
                          <p className="text-[10px] text-muted-foreground">RDV du jour</p>
                          <p className="text-xl font-bold text-foreground">8</p>
                          <p className="text-[10px] text-green-600">+2 nouveaux</p>
                        </div>
                        <div className="bg-secondary/50 rounded-xl p-3">
                          <p className="text-[10px] text-muted-foreground">CA du jour</p>
                          <p className="text-xl font-bold text-foreground">340€</p>
                          <p className="text-[10px] text-green-600">+15%</p>
                        </div>
                      </div>
                      
                      {/* Upcoming bookings */}
                      <p className="text-xs font-semibold text-foreground mb-2">Prochains RDV</p>
                      <div className="space-y-2">
                        {[
                          { name: 'Jean M.', time: '10:00', pack: 'Complet', color: 'green' },
                          { name: 'Marie D.', time: '11:30', pack: 'Intérieur', color: 'yellow' },
                          { name: 'Pierre B.', time: '14:00', pack: 'Simple', color: 'blue' },
                        ].map((booking, i) => (
                          <div key={i} className="flex items-center gap-3 bg-secondary/30 rounded-xl p-3">
                            <div className={`w-1 h-10 rounded-full ${
                              booking.color === 'green' ? 'bg-green-500' :
                              booking.color === 'yellow' ? 'bg-yellow-500' : 'bg-blue-500'
                            }`} />
                            <div className="flex-1">
                              <p className="text-xs font-medium text-foreground">{booking.name}</p>
                              <p className="text-[10px] text-muted-foreground">{booking.pack}</p>
                            </div>
                            <p className="text-xs font-semibold text-foreground">{booking.time}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Bottom navigation */}
                    <div className="absolute bottom-0 left-0 right-0 bg-card border-t border-border/40 px-6 py-3">
                      <div className="flex justify-around">
                        {[
                          { icon: Calendar, active: true },
                          { icon: Droplets, active: false },
                          { icon: BarChart3, active: false },
                          { icon: Settings, active: false },
                        ].map((item, i) => (
                          <div key={i} className={`p-2 rounded-xl ${item.active ? 'bg-primary/10' : ''}`}>
                            <item.icon className={`w-5 h-5 ${item.active ? 'text-primary' : 'text-muted-foreground'}`} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* DESKTOP VERSION - Browser mockup */}
                <div className="hidden sm:block bg-card rounded-2xl shadow-2xl overflow-hidden border border-border/60">
                  {/* Browser Bar */}
                  <div className="bg-secondary/50 px-4 py-3 flex items-center gap-3 border-b border-border/40">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
                      <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
                      <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
                    </div>
                    <div className="flex-1 bg-background rounded-md px-3 py-1 text-xs text-muted-foreground">
                      cleaningpage.com/dashboard
                    </div>
                  </div>

                  {/* Dashboard Layout */}
                  <div className="flex min-h-[400px]">
                    {/* Sidebar */}
                    <div className="w-48 bg-secondary/30 border-r border-border/40 p-4 flex-shrink-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Logo size="md" />
                      </div>
                      <p className="text-xs text-muted-foreground mb-6 truncate">/clean-auto-pro</p>

                      <nav className="space-y-1">
                        {[
                          { icon: Calendar, label: 'Réservations', active: dashboardTab === 'reservations', tab: 'reservations' as const },
                          { icon: Globe, label: 'Ma Page', active: dashboardTab === 'mypage', tab: 'mypage' as const },
                          { icon: Droplets, label: 'Formules', active: dashboardTab === 'formules', tab: 'formules' as const },
                          { icon: BarChart3, label: 'Statistiques', active: dashboardTab === 'stats', tab: 'stats' as const },
                          { icon: Settings, label: 'Paramètres', active: dashboardTab === 'settings', tab: 'settings' as const },
                        ].map((item) => (
                          <button
                            key={item.label}
                            onClick={() => setDashboardTab(item.tab)}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors ${
                              item.active 
                                ? 'bg-card text-foreground shadow-sm' 
                                : 'text-muted-foreground hover:bg-card/50'
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

                      {dashboardTab === 'mypage' && (
                        <>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-foreground">Ma Page</h3>
                            <button className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-lg">
                              Enregistrer
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            {/* Preview */}
                            <div>
                              <p className="text-xs text-muted-foreground mb-2">Aperçu</p>
                              <div className="bg-secondary/30 rounded-xl p-3 h-[280px] flex items-center justify-center">
                                <div className="w-[120px] bg-card rounded-xl shadow-lg overflow-hidden border border-border/40">
                                  <div className="h-12 bg-gradient-to-r from-primary to-primary/60" />
                                  <div className="p-2 -mt-3">
                                    <div className="w-6 h-6 bg-primary rounded-lg mx-auto flex items-center justify-center mb-1 border-2 border-white">
                                      <Car className="w-3 h-3 text-white" />
                                    </div>
                                    <p className="text-[8px] font-semibold text-center text-foreground">Clean Auto</p>
                                    <p className="text-[6px] text-muted-foreground text-center mb-2">Lavage premium</p>
                                    <div className="space-y-1">
                                      <div className="bg-secondary/50 rounded p-1 text-center">
                                        <p className="text-[6px] text-foreground">Simple</p>
                                        <p className="text-[7px] font-semibold text-primary">15€</p>
                                      </div>
                                      <div className="bg-secondary/50 rounded p-1 text-center">
                                        <p className="text-[6px] text-foreground">Complet</p>
                                        <p className="text-[7px] font-semibold text-primary">65€</p>
                                      </div>
                                    </div>
                                    <div className="mt-2 bg-primary text-white text-[6px] text-center py-1 rounded">
                                      Réserver
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Customization */}
                            <div>
                              <p className="text-xs text-muted-foreground mb-2">Personnalisation</p>
                              
                              {/* Tabs */}
                              <div className="flex gap-1 mb-3 bg-secondary/50 p-1 rounded-lg">
                                {[
                                  { icon: Palette, label: 'Couleurs', active: true },
                                  { icon: MapPin, label: 'Textes', active: false },
                                  { icon: Eye, label: 'Affichage', active: false },
                                  { icon: Car, label: 'Image', active: false },
                                ].map((tab) => (
                                  <div 
                                    key={tab.label}
                                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-[9px] ${
                                      tab.active ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'
                                    }`}
                                  >
                                    <tab.icon className="w-2.5 h-2.5" />
                                    <span className="hidden lg:inline">{tab.label}</span>
                                  </div>
                                ))}
                              </div>

                              <div className="space-y-2.5">
                                {/* Color presets */}
                                <div className="bg-secondary/30 rounded-lg p-2.5">
                                  <p className="text-[10px] text-muted-foreground mb-2">Thèmes prédéfinis</p>
                                  <div className="grid grid-cols-3 gap-1.5">
                                    {[
                                      { name: 'Bleu', colors: ['#3b82f6', '#1e293b', '#10b981'] },
                                      { name: 'Rouge', colors: ['#ef4444', '#1c1917', '#f59e0b'] },
                                      { name: 'Vert', colors: ['#22c55e', '#14532d', '#3b82f6'] },
                                      { name: 'Violet', colors: ['#8b5cf6', '#1e1b4b', '#ec4899'] },
                                      { name: 'Orange', colors: ['#f97316', '#431407', '#06b6d4'] },
                                      { name: 'Rose', colors: ['#ec4899', '#500724', '#8b5cf6'] },
                                    ].map((theme) => (
                                      <div 
                                        key={theme.name}
                                        className={`p-1.5 rounded border cursor-pointer ${theme.name === 'Bleu' ? 'border-primary ring-1 ring-primary/20' : 'border-border/50 hover:border-muted-foreground/50'}`}
                                      >
                                        <div className="flex gap-0.5 mb-1">
                                          {theme.colors.map((c, i) => (
                                            <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }} />
                                          ))}
                                        </div>
                                        <p className="text-[8px] text-muted-foreground text-center">{theme.name}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Custom colors */}
                                <div className="bg-secondary/30 rounded-lg p-2.5">
                                  <p className="text-[10px] text-muted-foreground mb-2">Couleurs personnalisées</p>
                                  <div className="grid grid-cols-3 gap-2">
                                    {[
                                      { label: 'Principale', color: '#3b82f6' },
                                      { label: 'Secondaire', color: '#1e293b' },
                                      { label: 'Accent', color: '#10b981' },
                                    ].map((item) => (
                                      <div key={item.label} className="text-center">
                                        <div 
                                          className="w-6 h-6 rounded-lg mx-auto mb-1 border border-border/50"
                                          style={{ backgroundColor: item.color }}
                                        />
                                        <p className="text-[8px] text-muted-foreground">{item.label}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                
                                {/* Toggle options preview */}
                                <div className="bg-secondary/30 rounded-lg p-2.5">
                                  <p className="text-[10px] text-muted-foreground mb-2">Options d'affichage</p>
                                  <div className="space-y-1.5">
                                    {[
                                      { label: 'Horaires', enabled: true },
                                      { label: 'Adresse', enabled: true },
                                      { label: 'Téléphone', enabled: true },
                                      { label: 'Formulaire contact', enabled: false },
                                      { label: 'Mode sombre', enabled: false },
                                    ].map((opt) => (
                                      <div key={opt.label} className="flex items-center justify-between">
                                        <p className="text-[9px] text-foreground">{opt.label}</p>
                                        <div className={`w-6 h-3 rounded-full relative ${opt.enabled ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
                                          <div className={`absolute top-0.5 w-2 h-2 bg-white rounded-full ${opt.enabled ? 'right-0.5' : 'left-0.5'}`} />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
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
                              <div className="w-16 h-16 bg-card rounded-lg border border-border/40 flex items-center justify-center">
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
          <div className="flex justify-center mt-6 sm:mt-8">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setActiveSlide(activeSlide === 0 ? 1 : 0)}
              className="rounded-full text-xs sm:text-sm"
            >
              {activeSlide === 0 ? 'Voir le dashboard' : 'Voir la page centre'}
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
            </Button>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-4 sm:mt-6">
            {[0, 1].map((i) => (
              <button
                key={i}
                onClick={() => setActiveSlide(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  activeSlide === i ? 'bg-foreground w-5 sm:w-6' : 'bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 sm:py-24 md:py-36 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground tracking-tight mb-3 sm:mb-4 px-2">
              Deux offres, un objectif
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground px-2">
              Développez votre clientèle, à votre rythme.
            </p>
          </div>
          
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 max-w-4xl mx-auto">
            {/* Free Plan */}
            <Card variant="elevated" className="p-5 sm:p-8 rounded-xl sm:rounded-2xl hover:shadow-xl transition-shadow duration-300">
              <div className="mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-1">CleaningPage Free</h3>
                <p className="text-muted-foreground text-xs sm:text-sm">Présence en ligne simplifiée</p>
              </div>
              
              <div className="mb-4 sm:mb-6">
                <span className="text-3xl sm:text-4xl font-semibold text-foreground">Gratuit</span>
                <span className="text-muted-foreground text-sm sm:text-base ml-2">pour toujours</span>
              </div>
              
              <ul className="space-y-2.5 sm:space-y-3 mb-6 sm:mb-8">
                {[
                  'Page professionnelle personnalisée',
                  'Formulaire de demande simple',
                  'Notifications par email',
                  'Lien unique partageable',
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 sm:gap-3">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary" />
                    </div>
                    <span className="text-foreground text-xs sm:text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Link to="/auth">
                <Button variant="outline" size="lg" className="w-full rounded-full text-sm">
                  Commencer gratuitement
                </Button>
              </Link>
            </Card>

            {/* Pro Plan */}
            <Card variant="elevated" className="p-5 sm:p-8 rounded-xl sm:rounded-2xl ring-2 ring-foreground relative hover:shadow-xl transition-shadow duration-300">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-foreground text-primary-foreground px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap">
                Recommandé
              </div>
              <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-primary/10 text-primary px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium">
                Sans engagement
              </div>
              
              <div className="mb-4 sm:mb-6 mt-2 sm:mt-0">
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-1">CleaningPage Pro</h3>
                <p className="text-muted-foreground text-xs sm:text-sm">Automatisation complète</p>
              </div>
              
              <div className="mb-4 sm:mb-6">
                <span className="text-3xl sm:text-4xl font-semibold text-foreground">49€</span>
                <span className="text-muted-foreground text-sm sm:text-base ml-2">/ mois</span>
              </div>
              
              <ul className="space-y-2.5 sm:space-y-3 mb-6 sm:mb-8">
                {[
                  'Personnalisation complète',
                  'Questionnaire intelligent',
                  'Agenda avec créneaux',
                  'Prise de RDV qualifiés',
                  'Tableau de bord',
                  'Base de données client',
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 sm:gap-3">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary" />
                    </div>
                    <span className="text-foreground text-xs sm:text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Link to="/auth">
                <Button size="lg" className="w-full rounded-full text-sm">
                  Essayer Pro
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust signals */}
      <section className="py-16 sm:py-24 md:py-36 px-4 sm:px-6 bg-secondary/30">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-2xl mx-auto">
            <Card variant="elevated" className="p-5 sm:p-6 rounded-xl sm:rounded-2xl text-center hover:shadow-xl transition-shadow duration-300">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <p className="font-semibold text-foreground text-sm sm:text-base mb-1">Sans commission</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Vos revenus restent vos revenus</p>
            </Card>
            <Card variant="elevated" className="p-5 sm:p-6 rounded-xl sm:rounded-2xl text-center hover:shadow-xl transition-shadow duration-300">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <p className="font-semibold text-foreground text-sm sm:text-base mb-1">Prêt en 5 min</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Configuration ultra rapide</p>
            </Card>
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-16 sm:py-24 md:py-36 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground tracking-tight mb-4 sm:mb-6 px-2">
            Prêt à développer votre activité ?
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground mb-8 sm:mb-10 leading-relaxed px-2">
            Gagnez du temps et attirez plus de clients chaque jour.
          </p>
          <Link to="/auth">
            <Button size="lg" className="rounded-full px-6 sm:px-8 text-sm sm:text-base">
              Créer mon espace gratuit
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-6 sm:py-8 px-4 sm:px-6 border-t border-border/50">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <Logo size="md" />
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            © 2024 CleaningPage. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}
