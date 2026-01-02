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

export default function Index() {
  const [dashboardTab, setDashboardTab] = useState<'reservations' | 'mypage' | 'formules' | 'stats' | 'settings'>('reservations');
  const [mobileTab, setMobileTab] = useState<'reservations' | 'mypage' | 'formules' | 'stats' | 'settings' | 'dispo'>('reservations');

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
      <section className="py-16 sm:py-20 md:py-28 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Text */}
            <div className="text-center lg:text-left">
              <h1 className="opacity-0 animate-fade-in-up text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground tracking-tight mb-4 sm:mb-6 leading-tight">
                Votre page de réservation
                <br />
                <span className="text-muted-foreground">professionnelle.</span>
              </h1>
              <p className="opacity-0 animate-fade-in-up stagger-1 text-base sm:text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8">
                Tout votre service de nettoyage, dans un seul lien. Présentez vos prestations, recevez des demandes et gérez vos rendez-vous.
              </p>
              <div className="opacity-0 animate-fade-in-up stagger-2 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link to="/auth">
                  <Button size="lg" className="w-full sm:w-auto text-base px-8">
                    Commencer gratuitement
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/clean-auto-pro">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8">
                    Voir un exemple
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right: Phone Mockup */}
            <div className="flex justify-center lg:justify-end order-first lg:order-last">
              <div className="animate-float relative">
                {/* Phone Frame */}
                <div className="relative bg-foreground rounded-[2.5rem] p-2 shadow-2xl">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-foreground rounded-b-2xl z-10" />
                  
                  <div className="relative bg-card rounded-[2rem] overflow-hidden w-[260px] sm:w-[280px]">
                    {/* Status Bar */}
                    <div className="bg-card px-6 py-2 flex items-center justify-between">
                      <span className="text-[10px] font-medium text-foreground">9:41</span>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-2 bg-foreground rounded-sm" />
                      </div>
                    </div>

                    {/* Banner Image */}
                    <div className="h-28 relative">
                      <img 
                        src={mockupBanner} 
                        alt="Car wash" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                      
                      {/* Logo */}
                      <div className="absolute -bottom-5 left-4">
                        <div className="w-12 h-12 bg-primary rounded-2xl shadow-lg flex items-center justify-center border-4 border-card">
                          <span className="text-primary-foreground font-bold text-sm">CP</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 pt-7">
                      {/* Header */}
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-foreground">Clean Auto Pro</h3>
                          <span className="text-[8px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">Ouvert</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">Lavage auto • Paris 15e</p>
                      </div>

                      {/* Services */}
                      <div className="space-y-1.5 mb-3">
                        {[
                          { name: 'Lavage Express', price: '30€' },
                          { name: 'Lavage Complet', price: '70€' },
                          { name: 'Rénovation', price: '150€' },
                        ].map((item) => (
                          <div key={item.name} className="flex items-center justify-between bg-secondary/40 rounded-lg px-3 py-2">
                            <p className="text-[10px] font-medium text-foreground">{item.name}</p>
                            <p className="text-[10px] font-semibold text-primary">{item.price}</p>
                          </div>
                        ))}
                      </div>

                      {/* Booking Button */}
                      <div className="bg-primary text-primary-foreground rounded-xl py-2.5 text-center text-xs font-medium shadow-lg flex items-center justify-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        Réserver un créneau
                      </div>
                    </div>
                  </div>
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
                        src={mockupBanner} 
                        alt="Car wash" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                      
                      {/* Instagram Icon */}
                      <div className="absolute top-3 right-3 w-8 h-8 bg-card/90 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <Instagram className="w-4 h-4 text-foreground" />
                      </div>
                      
                      {/* Logo */}
                      <div className="absolute -bottom-5 left-4">
                        <div className="w-14 h-14 bg-primary rounded-2xl shadow-lg flex items-center justify-center border-4 border-card">
                          <span className="text-primary-foreground font-bold text-lg">CP</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 pt-8">
                      {/* Header */}
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-semibold text-foreground">Clean Auto Pro</h3>
                          <span className="text-[9px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Ouvert</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mb-1">Lavage auto • Paris 15e</p>
                        <div className="flex items-center gap-1 text-[11px]">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium text-foreground">4.9</span>
                          <span className="text-muted-foreground">(312 avis)</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 mb-4">
                        <button className="flex-1 bg-foreground text-background rounded-full py-2.5 text-xs font-medium flex items-center justify-center gap-1.5">
                          <Phone className="w-3.5 h-3.5" />
                          Appeler
                        </button>
                        <button className="flex-1 bg-secondary text-foreground rounded-full py-2.5 text-xs font-medium flex items-center justify-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" />
                          Y aller
                        </button>
                        <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                          <Instagram className="w-4 h-4 text-foreground" />
                        </div>
                      </div>

                      {/* Info Cards */}
                      <div className="flex gap-2 mb-4">
                        <div className="flex-1 bg-secondary/60 rounded-xl p-2.5">
                          <div className="flex items-center gap-1.5 text-muted-foreground mb-0.5">
                            <Clock className="w-3 h-3" />
                            <span className="text-[9px] uppercase tracking-wide">Horaires</span>
                          </div>
                          <p className="text-[11px] font-medium text-foreground">9h - 19h</p>
                          <p className="text-[9px] text-muted-foreground">7j/7</p>
                        </div>
                        <div className="flex-1 bg-secondary/60 rounded-xl p-2.5">
                          <div className="flex items-center gap-1.5 text-muted-foreground mb-0.5">
                            <MapPin className="w-3 h-3" />
                            <span className="text-[9px] uppercase tracking-wide">Adresse</span>
                          </div>
                          <p className="text-[11px] font-medium text-foreground">45 Rue du Fg</p>
                          <p className="text-[9px] text-muted-foreground">Paris 15e</p>
                        </div>
                      </div>

                      {/* Services */}
                      <div className="space-y-1.5">
                        {[
                          { name: 'Lavage Express', price: '30€' },
                          { name: 'Lavage Complet', price: '70€' },
                          { name: 'Rénovation', price: '150€' },
                        ].map((item) => (
                          <div key={item.name} className="flex items-center justify-between bg-secondary/40 rounded-xl px-3 py-2.5">
                            <p className="text-[11px] font-medium text-foreground">{item.name}</p>
                            <p className="text-xs font-semibold text-primary">{item.price}</p>
                          </div>
                        ))}
                      </div>

                      {/* Booking Button */}
                      <div className="mt-4 bg-primary text-primary-foreground rounded-xl py-3 text-center text-sm font-medium shadow-lg flex items-center justify-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Réserver un créneau
                      </div>
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
                Ce que vos clients voient quand ils cherchent votre centre de nettoyage.
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

          {/* Dashboard Tabs Preview */}
          <div className="opacity-0 animate-fade-in-up stagger-3 flex flex-wrap gap-2 sm:gap-3 mb-10 justify-center">
            {[
              { icon: Globe, label: 'Ma Page', active: true, badge: null },
              { icon: Calendar, label: 'Réservations', active: false, badge: '3' },
              { icon: BarChart3, label: 'Statistiques', active: false, badge: null },
              { icon: Droplets, label: 'Formules', active: false, badge: null },
              { icon: Settings, label: 'Paramètres', active: false, badge: null },
            ].map((tab) => (
              <div 
                key={tab.label}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                  tab.active 
                    ? 'bg-foreground text-background shadow-lg' 
                    : 'bg-card border border-border/60 text-foreground hover:bg-secondary/50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.badge && (
                  <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {tab.badge}
                  </span>
                )}
              </div>
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
                      { icon: Globe, label: 'Ma Page', active: true },
                      { icon: Calendar, label: 'Réservations', active: false, badge: '3' },
                      { icon: BarChart3, label: 'Statistiques', active: false },
                      { icon: Droplets, label: 'Formules', active: false },
                      { icon: Settings, label: 'Paramètres', active: false },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-sm ${
                          item.active 
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
                      </div>
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
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs text-muted-foreground">Arrondi</span>
                          <div className="flex gap-1">
                            {['S', 'M', 'L'].map((size, i) => (
                              <span 
                                key={size}
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${i === 1 ? 'bg-foreground text-background' : 'bg-secondary text-muted-foreground'}`}
                              >
                                {size}
                              </span>
                            ))}
                          </div>
                        </div>
                        <button className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-medium">
                          Réserver un créneau
                        </button>
                      </div>

                      {/* Typography */}
                      <div className="bg-secondary/40 rounded-xl p-4">
                        <p className="text-sm font-medium text-foreground mb-3">Typographie</p>
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Titres</span>
                            <span className="text-foreground font-medium">SF Pro</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Corps</span>
                            <span className="text-foreground">Inter</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Live Preview */}
                    <div className="hidden md:flex flex-col">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-muted-foreground">Aperçu en direct</span>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <Settings className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                      
                      {/* Mini Phone Preview */}
                      <div className="flex-1 flex items-center justify-center">
                        <div className="relative bg-foreground rounded-[1.5rem] p-1.5 shadow-xl">
                          <div className="bg-card rounded-[1.2rem] overflow-hidden w-[160px]">
                            <div className="h-16 bg-gradient-to-br from-primary to-primary/60 relative">
                              <div className="absolute -bottom-4 left-3">
                                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center border-2 border-card shadow-lg">
                                  <span className="text-primary-foreground font-bold text-[10px]">CP</span>
                                </div>
                              </div>
                            </div>
                            <div className="p-3 pt-6">
                              <p className="text-[9px] font-semibold text-foreground mb-0.5">Clean Auto Pro</p>
                              <div className="flex items-center gap-1 mb-2">
                                <span className="text-[7px] bg-green-100 text-green-700 px-1 rounded">Ouvert</span>
                                <div className="flex items-center gap-0.5">
                                  <Star className="w-2 h-2 fill-yellow-400 text-yellow-400" />
                                  <span className="text-[7px] text-foreground">4.9</span>
                                  <span className="text-[6px] text-muted-foreground">(312)</span>
                                </div>
                              </div>
                              <button className="w-full bg-primary text-primary-foreground py-1.5 rounded-lg text-[8px] font-medium flex items-center justify-center gap-1 mb-2">
                                <Calendar className="w-2 h-2" />
                                Réserver
                              </button>
                              <div className="flex gap-1 mb-2">
                                <div className="flex-1 bg-secondary/60 rounded-lg p-1.5 text-center">
                                  <Clock className="w-2 h-2 mx-auto text-muted-foreground mb-0.5" />
                                  <p className="text-[6px] text-foreground">9h-19h</p>
                                </div>
                                <div className="flex-1 bg-secondary/60 rounded-lg p-1.5 text-center">
                                  <MapPin className="w-2 h-2 mx-auto text-muted-foreground mb-0.5" />
                                  <p className="text-[6px] text-foreground">Paris 15</p>
                                </div>
                              </div>
                              <div className="space-y-1">
                                {[
                                  { name: 'Lavage Express', price: '30€' },
                                  { name: 'Lavage Complet', price: '70€' },
                                ].map((item) => (
                                  <div key={item.name} className="flex items-center justify-between bg-secondary/40 rounded-lg px-2 py-1.5">
                                    <p className="text-[7px] text-foreground">{item.name}</p>
                                    <p className="text-[8px] font-semibold text-primary">{item.price}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
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
