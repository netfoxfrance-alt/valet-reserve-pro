import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Logo } from '@/components/ui/Logo';
import { 
  ArrowRight, Calendar, Users, BarChart3, Link2, 
  Shield, Clock, Check, Car, Droplets, MapPin, Phone, 
  Star, Settings, LogOut, ChevronRight, Globe, Palette, Eye,
  Instagram, MessageCircle, Share2, ExternalLink, Sparkles, Mail
} from 'lucide-react';
import mockupBanner from '@/assets/mockup-banner-v2.jpg';
import sofaBanner from '@/assets/sofa-cleaning-banner.jpg';

export default function Index() {
  const [dashboardTab, setDashboardTab] = useState<'reservations' | 'mypage' | 'formules' | 'stats' | 'settings'>('mypage');
  const [mobileTab, setMobileTab] = useState<'reservations' | 'mypage' | 'formules' | 'stats' | 'settings' | 'dispo'>('mypage');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="w-full py-4 px-4 sm:px-6 border-b border-border/50 sticky top-0 bg-background/95 backdrop-blur-sm z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <Logo size="lg" />
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
      
      {/* Hero Section */}
      <section className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left: Text - Hidden on mobile, shown on lg+ */}
            <div className="text-center lg:text-left hidden lg:block">
              <h1 className="opacity-0 animate-fade-in-up stagger-1 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground tracking-tight mb-4 sm:mb-6 leading-[1.1]">
                Votre activité.
                <br />
                <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">Un seul lien.</span>
              </h1>
              
              <p className="opacity-0 animate-fade-in-up stagger-2 text-base sm:text-lg md:text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed">
                Présentez vos prestations, recevez des demandes et gérez vos rendez-vous. Le tout dans une page professionnelle à votre image.
              </p>
              
              <div className="opacity-0 animate-fade-in-up stagger-3 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-8">
                <Link to="/auth">
                  <Button size="lg" className="w-full sm:w-auto text-base px-8 shadow-lg shadow-primary/25">
                    Créer ma page gratuitement
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="opacity-0 animate-fade-in-up stagger-4 flex items-center gap-6 justify-center lg:justify-start text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Gratuit</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Prêt en 5 min</span>
                </div>
              </div>
            </div>

            {/* Mobile: Text above mockup */}
            <div className="text-center lg:hidden">
              <h1 className="opacity-0 animate-fade-in-up text-3xl sm:text-4xl font-semibold text-foreground tracking-tight mb-4 leading-[1.1]">
                Votre activité.
                <br />
                <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">Un seul lien.</span>
              </h1>
              
              <p className="opacity-0 animate-fade-in-up stagger-1 text-base text-muted-foreground max-w-sm mx-auto mb-6 leading-relaxed">
                Présentez vos prestations, recevez des demandes et gérez vos rendez-vous.
              </p>
            </div>

            {/* Right: Premium Phone Mockup */}
            <div className="flex justify-center lg:justify-end">
              <div className="animate-float relative">
                {/* Subtle glow */}
                <div className="absolute inset-0 bg-primary/8 blur-[80px] scale-125" />
                
                {/* Phone Frame */}
                <div className="relative bg-zinc-900 rounded-[2.5rem] p-[6px] shadow-2xl">
                  {/* Dynamic Island */}
                  <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full z-20" />
                  
                  <div className="relative bg-card rounded-[2.2rem] overflow-hidden w-[260px] sm:w-[280px]">
                    {/* Status Bar */}
                    <div className="px-6 pt-2.5 pb-0.5 flex items-center justify-between relative z-10">
                      <span className="text-[10px] font-semibold text-foreground">9:41</span>
                      <div className="flex items-center gap-1">
                        <div className="flex gap-[2px]">
                          <div className="w-[2px] h-[8px] bg-foreground rounded-full" />
                          <div className="w-[2px] h-[6px] bg-foreground rounded-full" />
                          <div className="w-[2px] h-[5px] bg-foreground rounded-full" />
                          <div className="w-[2px] h-[3px] bg-foreground/40 rounded-full" />
                        </div>
                        <div className="w-4 h-[8px] bg-foreground rounded-[2px] ml-0.5" />
                      </div>
                    </div>

                    {/* Banner Image */}
                    <div className="h-24 relative">
                      <img 
                        src={mockupBanner} 
                        alt="Service preview" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
                      
                      {/* Logo - overlapping */}
                      <div className="absolute -bottom-4 left-3">
                        <div className="w-11 h-11 bg-foreground rounded-xl shadow-lg flex items-center justify-center border-2 border-card">
                          <span className="text-background font-bold text-xs">CP</span>
                        </div>
                      </div>
                      
                      {/* Social icons top right */}
                      <div className="absolute top-2 right-2 flex gap-1">
                        <div className="w-6 h-6 bg-card/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <Instagram className="w-3 h-3 text-foreground" />
                        </div>
                      </div>
                    </div>

                    <div className="px-3 pb-4 pt-6">
                      {/* Header */}
                      <div className="mb-2">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <h3 className="text-sm font-bold text-foreground">Clean Auto Pro</h3>
                          <span className="text-[8px] bg-green-500/15 text-green-600 px-1.5 py-0.5 rounded-full font-semibold">Ouvert</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                          <span>Lavage auto</span>
                          <span>•</span>
                          <div className="flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium text-foreground">4.9</span>
                          </div>
                          <span className="text-muted-foreground">(312)</span>
                        </div>
                      </div>

                      {/* Action buttons row */}
                      <div className="flex gap-1.5 mb-3">
                        <button className="flex-1 flex items-center justify-center gap-1 bg-foreground text-background rounded-lg py-2 text-[10px] font-medium">
                          <Phone className="w-3 h-3" />
                          Appeler
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-1 bg-secondary text-foreground rounded-lg py-2 text-[10px] font-medium">
                          <MapPin className="w-3 h-3" />
                          Y aller
                        </button>
                        <button className="w-8 flex items-center justify-center bg-secondary text-foreground rounded-lg">
                          <Share2 className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Info cards row */}
                      <div className="flex gap-1.5 mb-3">
                        <div className="flex-1 bg-secondary/60 rounded-lg p-2">
                          <div className="flex items-center gap-1 text-muted-foreground mb-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            <span className="text-[8px] uppercase tracking-wide">Horaires</span>
                          </div>
                          <p className="text-[10px] font-medium text-foreground">9h - 19h</p>
                        </div>
                        <div className="flex-1 bg-secondary/60 rounded-lg p-2">
                          <div className="flex items-center gap-1 text-muted-foreground mb-0.5">
                            <MapPin className="w-2.5 h-2.5" />
                            <span className="text-[8px] uppercase tracking-wide">Adresse</span>
                          </div>
                          <p className="text-[10px] font-medium text-foreground">Paris 15e</p>
                        </div>
                      </div>

                      {/* Services */}
                      <div className="space-y-1.5 mb-3">
                        {[
                          { name: 'Lavage Express', price: '30€' },
                          { name: 'Lavage Complet', price: '70€' },
                          { name: 'Rénovation', price: '150€' },
                        ].map((item) => (
                          <div 
                            key={item.name} 
                            className="flex items-center justify-between bg-secondary/40 rounded-lg px-2.5 py-2"
                          >
                            <span className="text-[10px] font-medium text-foreground">{item.name}</span>
                            <span className="text-[10px] font-bold text-primary">{item.price}</span>
                          </div>
                        ))}
                      </div>

                      {/* Mini calendar preview */}
                      <div className="bg-secondary/40 rounded-lg p-2 mb-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[8px] text-muted-foreground uppercase tracking-wide">Prochain créneau</span>
                          <span className="text-[8px] text-primary font-medium">Voir l'agenda</span>
                        </div>
                        <div className="flex gap-1">
                          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'].map((day, i) => (
                            <div 
                              key={day}
                              className={`flex-1 text-center py-1 rounded text-[8px] ${
                                i === 1 
                                  ? 'bg-primary text-primary-foreground font-semibold' 
                                  : 'bg-background text-foreground'
                              }`}
                            >
                              <div className="font-medium">{day}</div>
                              <div className={i === 1 ? 'text-primary-foreground/80' : 'text-muted-foreground'}>{7 + i}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* CTA Button */}
                      <button className="w-full bg-primary text-primary-foreground rounded-xl py-2.5 text-[11px] font-semibold flex items-center justify-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        Réserver un créneau
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile: CTA below mockup */}
            <div className="lg:hidden text-center mt-8">
              <Link to="/auth">
                <Button size="lg" className="w-full text-base px-8 shadow-lg shadow-primary/25 mb-6">
                  Créer ma page gratuitement
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              
              <div className="flex items-center gap-4 justify-center text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Gratuit</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Prêt en 5 min</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Deux espaces, un seul outil */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 border-t border-border/30">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="opacity-0 animate-fade-in-up text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground tracking-tight mb-4 sm:mb-6 leading-tight">
            Deux espaces,
            <br />
            <span className="text-muted-foreground">un seul outil.</span>
          </h2>
          <p className="opacity-0 animate-fade-in-up stagger-1 text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Une <span className="text-foreground font-medium">page web publique</span> pour vos clients, un <span className="text-foreground font-medium">espace privé</span> pour tout gérer.
          </p>
        </div>
      </section>

      {/* Section: Page Publique */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Label */}
          <div className="flex items-center gap-2 text-muted-foreground mb-4 opacity-0 animate-fade-in-up">
            <Globe className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Page publique</span>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left: Phone Mockup */}
            <div className="flex justify-center lg:justify-start order-2 lg:order-1">
              <div className="animate-float relative">
                {/* Phone Frame */}
                <div className="relative bg-foreground rounded-[2.5rem] p-2 shadow-2xl">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-foreground rounded-b-2xl z-10" />
                  
                  <div className="relative bg-card rounded-[2rem] overflow-hidden w-[280px] sm:w-[300px]">
                    {/* Status Bar */}
                    <div className="bg-card px-6 py-2 flex items-center justify-between">
                      <span className="text-[10px] font-medium text-foreground">9:41</span>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-2 bg-foreground rounded-sm" />
                      </div>
                    </div>

                    {/* Banner Image */}
                    <div className="h-32 relative">
                      <img 
                        src={sofaBanner} 
                        alt="Nettoyage canapé professionnel" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                      
                      {/* Social Icons */}
                      <div className="absolute top-3 right-3 flex gap-1.5">
                        <div className="w-7 h-7 bg-white/90 dark:bg-zinc-800/90 rounded-full flex items-center justify-center backdrop-blur-sm shadow-sm">
                          <Instagram className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300" />
                        </div>
                      </div>
                      
                      {/* Logo */}
                      <div className="absolute -bottom-5 left-4">
                        <div className="w-14 h-14 bg-zinc-900 dark:bg-white rounded-2xl shadow-xl flex items-center justify-center border-4 border-card">
                          <span className="text-white dark:text-zinc-900 font-bold text-lg tracking-tight">SC</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 pt-8">
                      {/* Header */}
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-semibold text-foreground">SofaClean</h3>
                          <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium">Disponible</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mb-1">Nettoyage textile premium • Lyon</p>
                        <div className="flex items-center gap-1 text-[11px]">
                          <Star className="w-3 h-3 fill-foreground text-foreground" />
                          <span className="font-medium text-foreground">4.9</span>
                          <span className="text-muted-foreground">(234 avis)</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 mb-4">
                        <button className="flex-1 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full py-2.5 text-xs font-medium flex items-center justify-center gap-1.5">
                          <Phone className="w-3.5 h-3.5" />
                          Appeler
                        </button>
                        <button className="flex-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-full py-2.5 text-xs font-medium flex items-center justify-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" />
                          Y aller
                        </button>
                        <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                          <Share2 className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                        </div>
                      </div>

                      {/* Info Cards */}
                      <div className="flex gap-2 mb-4">
                        <div className="flex-1 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-2.5">
                          <div className="flex items-center gap-1.5 text-muted-foreground mb-0.5">
                            <Clock className="w-3 h-3" />
                            <span className="text-[9px] uppercase tracking-wide">Horaires</span>
                          </div>
                          <p className="text-[11px] font-semibold text-foreground">8h - 19h</p>
                          <p className="text-[9px] text-muted-foreground">Lun - Sam</p>
                        </div>
                        <div className="flex-1 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-2.5">
                          <div className="flex items-center gap-1.5 text-muted-foreground mb-0.5">
                            <MapPin className="w-3 h-3" />
                            <span className="text-[9px] uppercase tracking-wide">Zone</span>
                          </div>
                          <p className="text-[11px] font-semibold text-foreground">Lyon & 30km</p>
                          <p className="text-[9px] text-muted-foreground">Déplacement offert</p>
                        </div>
                      </div>

                      {/* Services */}
                      <div className="space-y-1.5">
                        {[
                          { name: 'Canapé 2 places', price: '49€' },
                          { name: 'Canapé 3 places', price: '69€' },
                          { name: 'Canapé d\'angle', price: '99€' },
                        ].map((item) => (
                          <div key={item.name} className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50 rounded-xl px-3 py-2.5">
                            <p className="text-[11px] font-medium text-foreground">{item.name}</p>
                            <p className="text-xs font-semibold text-foreground">{item.price}</p>
                          </div>
                        ))}
                      </div>

                      {/* Booking Button */}
                      <button className="w-full mt-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Prendre rendez-vous
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Text + Features */}
            <div className="order-1 lg:order-2">
              <h2 className="opacity-0 animate-fade-in-up text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground tracking-tight mb-4 sm:mb-6">
                Votre vitrine en ligne
              </h2>
              <p className="opacity-0 animate-fade-in-up stagger-1 text-muted-foreground text-base sm:text-lg mb-8 leading-relaxed">
                Ce que vos clients voient quand ils cherchent vos services de nettoyage.
              </p>

              {/* Link Card */}
              <div className="opacity-0 animate-fade-in-up stagger-2 bg-secondary/40 rounded-2xl p-5 sm:p-6 mb-6">
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-3">
                  Un vrai site web pour votre activité
                </h3>
                <p className="text-sm text-muted-foreground mb-4">Votre lien unique :</p>
                <div className="flex items-center gap-2 bg-background rounded-xl px-4 py-3 border border-border/60 mb-4">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">cleaningpage.com/</span>
                  <span className="text-sm text-primary font-semibold">votre-centre</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Partagez-le partout : réseaux sociaux, carte de visite, QR code...
                </p>
              </div>

              {/* Features Pills */}
              <div className="opacity-0 animate-fade-in-up stagger-3">
                <p className="text-sm text-muted-foreground mb-3">Dedans, vos clients trouvent tout ce dont ils ont besoin :</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { icon: Car, label: 'Vos formules' },
                    { icon: Calendar, label: 'Réservations' },
                    { icon: Star, label: 'Avis clients' },
                    { icon: MapPin, label: 'Localisation' },
                    { icon: Phone, label: 'Contact direct' },
                    { icon: Clock, label: 'Horaires' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2 bg-background border border-border/60 rounded-full px-4 py-2">
                      <item.icon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Espace Privé */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          {/* Section Label */}
          <div className="flex items-center gap-2 text-muted-foreground mb-4 opacity-0 animate-fade-in-up">
            <Shield className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Espace privé</span>
          </div>
          
          <h2 className="opacity-0 animate-fade-in-up stagger-1 text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground tracking-tight mb-4">
            Votre outil de gestion
          </h2>
          <p className="opacity-0 animate-fade-in-up stagger-2 text-muted-foreground text-base sm:text-lg mb-8 max-w-2xl leading-relaxed">
            Simple et complet pour gérer réservations, formules, et personnaliser votre page.
          </p>

          {/* Dashboard Tabs Preview - Interactive */}
          <div className="opacity-0 animate-fade-in-up stagger-3 flex flex-wrap gap-2 sm:gap-3 mb-10 justify-center">
            {[
              { icon: Globe, label: 'Ma Page', tab: 'mypage' as const, badge: null },
              { icon: Calendar, label: 'Réservations', tab: 'reservations' as const, badge: '3' },
              { icon: BarChart3, label: 'Statistiques', tab: 'stats' as const, badge: null },
              { icon: Droplets, label: 'Formules', tab: 'formules' as const, badge: null },
              { icon: Settings, label: 'Paramètres', tab: 'settings' as const, badge: null },
            ].map((item) => (
              <button 
                key={item.label}
                onClick={() => setDashboardTab(item.tab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all cursor-pointer ${
                  dashboardTab === item.tab 
                    ? 'bg-foreground text-background shadow-lg' 
                    : 'bg-card border border-border/60 text-foreground hover:bg-secondary/50'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
                {item.badge && (
                  <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Dashboard Browser Mockup */}
          <div className="opacity-0 animate-fade-in-up stagger-4">
            <div className="bg-card rounded-2xl shadow-2xl overflow-hidden border border-border/60 max-w-4xl mx-auto">
              {/* Browser Bar */}
              <div className="bg-secondary/50 px-4 py-3 flex items-center gap-3 border-b border-border/40">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="flex items-center gap-2 bg-background rounded-full px-4 py-1.5 text-xs text-muted-foreground">
                    <Shield className="w-3 h-3" />
                    cleaningpage.com/<span className="text-foreground font-medium">dashboard</span>
                  </div>
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="flex min-h-[420px]">
                {/* Sidebar */}
                <div className="w-56 bg-secondary/30 border-r border-border/40 p-4 flex-shrink-0 hidden md:block">
                  <div className="flex items-center gap-2 mb-1">
                    <Logo size="md" />
                  </div>
                  <p className="text-xs text-muted-foreground mb-6 truncate">clean-auto-pro</p>

                  <nav className="space-y-1">
                    {[
                      { icon: Globe, label: 'Ma Page', tab: 'mypage' as const },
                      { icon: Calendar, label: 'Réservations', tab: 'reservations' as const, badge: '3' },
                      { icon: BarChart3, label: 'Statistiques', tab: 'stats' as const },
                      { icon: Droplets, label: 'Formules', tab: 'formules' as const },
                      { icon: Settings, label: 'Paramètres', tab: 'settings' as const },
                    ].map((item) => (
                      <button
                        key={item.label}
                        onClick={() => setDashboardTab(item.tab)}
                        className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-sm transition-all ${
                          dashboardTab === item.tab 
                            ? 'bg-foreground text-background font-medium' 
                            : 'text-muted-foreground hover:bg-card/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <item.icon className="w-4 h-4" />
                          {item.label}
                        </div>
                        {item.badge && (
                          <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    ))}
                  </nav>

                  {/* Link at bottom */}
                  <div className="mt-8 pt-4 border-t border-border/40">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Link2 className="w-4 h-4" />
                      <span className="text-xs">Votre lien</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1 truncate">cleaningpage.com/clean-auto...</p>
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 p-6">
                  {/* Ma Page Tab */}
                  {dashboardTab === 'mypage' && (
                    <>
                      {/* Tabs */}
                      <div className="flex items-center gap-4 mb-6 text-sm border-b border-border/40 pb-3">
                        <span className="text-muted-foreground">Infos</span>
                        <span className="text-foreground font-medium border-b-2 border-foreground pb-3 -mb-3">Style</span>
                        <span className="text-muted-foreground">Sections</span>
                        <span className="text-muted-foreground">Images</span>
                        <div className="ml-auto flex items-center gap-2">
                          <span className="text-green-500 text-xs flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                            Sync
                          </span>
                          <button className="bg-foreground text-background px-4 py-1.5 rounded-lg text-xs font-medium">
                            Publier
                          </button>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Customization Options */}
                        <div className="space-y-4">
                          {/* Color Picker */}
                          <div className="bg-secondary/40 rounded-xl p-4">
                            <p className="text-sm font-medium text-foreground mb-3">Couleur principale</p>
                            <div className="flex gap-2">
                              {[
                                { color: 'bg-foreground', active: true },
                                { color: 'bg-red-500', active: false },
                                { color: 'bg-orange-500', active: false },
                                { color: 'bg-green-500', active: false },
                                { color: 'bg-blue-500', active: false },
                              ].map((c, i) => (
                                <div 
                                  key={i}
                                  className={`w-8 h-8 ${c.color} rounded-full cursor-pointer ${c.active ? 'ring-2 ring-offset-2 ring-foreground' : ''}`}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Theme Toggle */}
                          <div className="bg-secondary/40 rounded-xl p-4">
                            <p className="text-sm font-medium text-foreground mb-3">Thème</p>
                            <div className="flex gap-2">
                              <button className="flex-1 bg-card text-foreground px-4 py-2 rounded-lg text-sm font-medium shadow-sm">
                                Clair
                              </button>
                              <button className="flex-1 bg-secondary/60 text-muted-foreground px-4 py-2 rounded-lg text-sm">
                                Sombre
                              </button>
                            </div>
                          </div>

                          {/* Button Style */}
                          <div className="bg-secondary/40 rounded-xl p-4">
                            <p className="text-sm font-medium text-foreground mb-3">Bouton d'action</p>
                            <button className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-medium">
                              Réserver un créneau
                            </button>
                          </div>
                        </div>

                        {/* Live Preview */}
                        <div className="hidden md:flex flex-col">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-muted-foreground">Aperçu en direct</span>
                            <Eye className="w-4 h-4 text-muted-foreground" />
                          </div>
                          
                          {/* Mini Phone Preview */}
                          <div className="flex-1 flex items-center justify-center">
                            <div className="relative bg-foreground rounded-[1.5rem] p-1.5 shadow-xl">
                              <div className="bg-card rounded-[1.2rem] overflow-hidden w-[160px]">
                                <div className="h-16 bg-gradient-to-br from-blue-500 to-blue-400 relative">
                                  <div className="absolute -bottom-4 left-3">
                                    <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center border-2 border-card shadow-lg">
                                      <Droplets className="w-5 h-5 text-white" />
                                    </div>
                                  </div>
                                </div>
                                <div className="p-3 pt-6">
                                  <p className="text-[9px] font-semibold text-foreground mb-0.5">Maison Propre</p>
                                  <p className="text-[7px] text-muted-foreground mb-1">Nettoyage à domicile</p>
                                  <div className="flex items-center gap-1 mb-2">
                                    <span className="text-[7px] bg-green-100 text-green-700 px-1 rounded">Ouvert</span>
                                    <Star className="w-2 h-2 fill-yellow-400 text-yellow-400" />
                                    <span className="text-[7px] text-foreground">4.8</span>
                                  </div>
                                  <div className="space-y-1 mb-2">
                                    <div className="flex justify-between text-[7px]">
                                      <span className="text-muted-foreground">Ménage 2h</span>
                                      <span className="font-medium text-foreground">60€</span>
                                    </div>
                                    <div className="flex justify-between text-[7px]">
                                      <span className="text-muted-foreground">Grand ménage</span>
                                      <span className="font-medium text-foreground">120€</span>
                                    </div>
                                  </div>
                                  <button className="w-full bg-blue-500 text-white py-1.5 rounded-lg text-[8px] font-medium">
                                    Réserver
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Réservations Tab */}
                  {dashboardTab === 'reservations' && (
                    <>
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-foreground">Réservations</h3>
                        <div className="text-xs text-muted-foreground">Aujourd'hui</div>
                      </div>

                      {/* Stats cards */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-secondary/50 rounded-xl p-4">
                          <p className="text-xs text-muted-foreground mb-1">RDV du jour</p>
                          <p className="text-3xl font-bold text-foreground">8</p>
                          <p className="text-xs text-green-600">+2 nouveaux</p>
                        </div>
                        <div className="bg-secondary/50 rounded-xl p-4">
                          <p className="text-xs text-muted-foreground mb-1">CA du jour</p>
                          <p className="text-3xl font-bold text-foreground">340€</p>
                          <p className="text-xs text-green-600">+15%</p>
                        </div>
                      </div>

                      <p className="text-sm font-medium text-muted-foreground mb-3">Prochains RDV</p>

                      <div className="space-y-2">
                        {[
                          { name: 'Jean Martin', vehicle: 'Audi A4', time: '10:00', status: 'Confirmé', color: 'green' },
                          { name: 'Marie Dupont', vehicle: 'BMW X3', time: '11:30', status: 'En attente', color: 'yellow' },
                          { name: 'Pierre Bernard', vehicle: 'Renault Clio', time: '14:00', status: 'Arrivé', color: 'blue' },
                        ].map((booking, i) => (
                          <div key={i} className="flex items-center gap-3 bg-secondary/30 rounded-xl p-4">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-sm font-semibold text-primary">
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

                  {/* Statistiques Tab */}
                  {dashboardTab === 'stats' && (
                    <>
                      <h3 className="text-lg font-semibold text-foreground mb-6">Statistiques</h3>
                      
                      <div className="grid grid-cols-4 gap-3 mb-6">
                        {[
                          { value: '127', label: 'Réservations', sub: 'ce mois' },
                          { value: '4 850€', label: "CA", sub: 'ce mois' },
                          { value: '89', label: 'Clients', sub: 'uniques' },
                          { value: '54€', label: 'Panier', sub: 'moyen' },
                        ].map((stat, i) => (
                          <div key={i} className="bg-secondary/40 rounded-xl p-4 text-center">
                            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                            <p className="text-xs text-muted-foreground">{stat.label}</p>
                            <p className="text-[10px] text-muted-foreground/70">{stat.sub}</p>
                          </div>
                        ))}
                      </div>

                      {/* Chart mockup */}
                      <div className="bg-secondary/30 rounded-xl p-4">
                        <p className="text-sm font-medium text-foreground mb-4">Évolution CA (6 mois)</p>
                        <div className="flex items-end justify-between gap-2 h-32">
                          {[35, 48, 42, 55, 68, 85].map((h, i) => (
                            <div 
                              key={i} 
                              className="flex-1 bg-primary/70 rounded-t transition-all hover:bg-primary"
                              style={{ height: `${h}%` }}
                            />
                          ))}
                        </div>
                        <div className="flex justify-between mt-2">
                          {['Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'].map((m) => (
                            <span key={m} className="text-[10px] text-muted-foreground flex-1 text-center">{m}</span>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Formules Tab */}
                  {dashboardTab === 'formules' && (
                    <>
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-foreground">Vos formules</h3>
                        <button className="bg-foreground text-background px-4 py-1.5 rounded-lg text-xs font-medium">
                          + Ajouter
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        {[
                          { name: 'Lavage simple', desc: 'Extérieur uniquement', price: '15€', active: true },
                          { name: 'Nettoyage intérieur', desc: 'Aspiration et nettoyage', price: '35€', active: true },
                          { name: 'Formule complète', desc: 'Intérieur + extérieur', price: '65€', active: true },
                          { name: 'Rénovation premium', desc: 'Polish + céramique', price: '150€', active: false },
                        ].map((pack, i) => (
                          <div key={i} className="flex items-center gap-4 bg-secondary/30 rounded-xl p-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                              <Droplets className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-foreground">{pack.name}</p>
                                {!pack.active && (
                                  <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">Inactif</span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">{pack.desc}</p>
                            </div>
                            <p className="text-sm font-semibold text-primary">{pack.price}</p>
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Paramètres Tab */}
                  {dashboardTab === 'settings' && (
                    <>
                      <h3 className="text-lg font-semibold text-foreground mb-6">Paramètres</h3>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="bg-secondary/40 rounded-xl p-4">
                            <p className="text-sm font-medium text-foreground mb-3">Informations</p>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Nom</span>
                                <span className="text-foreground">Clean Auto Pro</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Email</span>
                                <span className="text-foreground">contact@cleanautopro.fr</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Téléphone</span>
                                <span className="text-foreground">01 23 45 67 89</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-secondary/40 rounded-xl p-4">
                            <p className="text-sm font-medium text-foreground mb-3">Abonnement</p>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-foreground font-medium">CleaningPage Pro</p>
                                <p className="text-xs text-muted-foreground">Renouvellement le 15 Jan</p>
                              </div>
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Actif</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-secondary/40 rounded-xl p-4">
                          <p className="text-sm font-medium text-foreground mb-3">Disponibilités</p>
                          <div className="space-y-2">
                            {[
                              { day: 'Lundi - Vendredi', hours: '9:00 - 19:00', enabled: true },
                              { day: 'Samedi', hours: '9:00 - 17:00', enabled: true },
                              { day: 'Dimanche', hours: 'Fermé', enabled: false },
                            ].map((day) => (
                              <div key={day.day} className="flex items-center justify-between">
                                <span className="text-sm text-foreground">{day.day}</span>
                                <span className={`text-sm ${day.enabled ? 'text-foreground' : 'text-muted-foreground'}`}>
                                  {day.hours}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Pricing Section */}
      <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6">
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
            <Card variant="elevated" className="p-5 sm:p-8 rounded-xl sm:rounded-2xl ring-2 ring-foreground relative hover:shadow-xl transition-shadow duration-300 overflow-hidden">
              {/* Premium trial banner */}
              <div className="absolute top-0 left-0 right-0 bg-foreground text-primary-foreground py-2 sm:py-2.5 px-4 text-center">
                <p className="text-xs sm:text-sm font-medium">15 jours d'essai gratuit</p>
              </div>
              
              <div className="mb-4 sm:mb-6 mt-8 sm:mt-10">
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-1">CleaningPage Pro</h3>
                <p className="text-muted-foreground text-xs sm:text-sm">Automatisation complète</p>
              </div>
              
              <div className="mb-4 sm:mb-6">
                <span className="text-3xl sm:text-4xl font-semibold text-foreground">39€</span>
                <span className="text-muted-foreground text-sm sm:text-base ml-2">/ mois</span>
                <p className="text-xs text-muted-foreground mt-1">après l'essai gratuit</p>
              </div>
              
              <ul className="space-y-2.5 sm:space-y-3 mb-6 sm:mb-8">
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
                  Commencer l'essai gratuit
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              
              <p className="text-center text-xs text-muted-foreground mt-3">Sans engagement · Annulez à tout moment</p>
            </Card>
          </div>
        </div>
      </section>

      
      {/* CTA */}
      <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground tracking-tight mb-4 sm:mb-6 px-2">
            Prêt à développer votre activité ?
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground mb-8 sm:mb-10 leading-relaxed px-2">
            Gagnez du temps et attirez plus de clients chaque jour.
          </p>
          <Link to="/auth">
            <Button size="lg" className="rounded-full px-6 sm:px-8 text-sm sm:text-base">
              Créer ma page gratuitement
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 sm:py-10 px-4 sm:px-6 border-t border-border/50">
        <div className="max-w-5xl mx-auto flex items-center justify-center">
          <p className="text-sm text-muted-foreground">
            © 2024 CleaningPage. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}
