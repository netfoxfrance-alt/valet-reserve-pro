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
      
      {/* Hero - Calendly style */}
      <section className="py-12 sm:py-20 md:py-28 px-4 sm:px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left: Text */}
            <div>
              <div className="opacity-0 animate-fade-in-up inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs sm:text-sm font-medium mb-6 sm:mb-8">
                <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                Simple et gratuit
              </div>
              <h1 className="opacity-0 animate-fade-in-up stagger-1 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground tracking-tight mb-4 sm:mb-6 leading-tight">
                Votre vitrine digitale
                <br />
                <span className="text-muted-foreground">prête en 5 minutes.</span>
              </h1>
              <p className="opacity-0 animate-fade-in-up stagger-2 text-base sm:text-lg md:text-xl text-muted-foreground max-w-lg mb-8 sm:mb-10 leading-relaxed">
                Créez votre page professionnelle, partagez votre lien, recevez des réservations.
              </p>
              <div className="opacity-0 animate-fade-in-up stagger-3 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link to="/auth" className="w-full sm:w-auto">
                  <Button size="lg" className="rounded-full px-6 sm:px-8 w-full sm:w-auto text-sm sm:text-base">
                    Créer ma page gratuitement
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                  </Button>
                </Link>
              </div>
              <p className="opacity-0 animate-fade-in-up stagger-4 text-xs sm:text-sm text-muted-foreground mt-5 sm:mt-6">
                Sans engagement · Aucune carte bancaire requise
              </p>
            </div>

            {/* Right: Floating Page Mockup */}
            <div className="flex justify-center lg:justify-end">
              <div className="animate-float relative">
                {/* Background decorative shapes */}
                <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-secondary rounded-full blur-2xl" />
                
                <div className="relative bg-card rounded-2xl sm:rounded-3xl shadow-mockup overflow-hidden border border-border/50 w-[280px] sm:w-[340px]">
                  {/* Banner Image */}
                  <div className="h-28 sm:h-36 relative">
                    <img 
                      src={mockupBanner} 
                      alt="Car wash" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                    
                    {/* Logo */}
                    <div className="absolute -bottom-4 left-4 sm:left-5">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center border border-border/20">
                        <Droplets className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 pt-7 sm:pt-9">
                    {/* Header */}
                    <div className="mb-3 sm:mb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm sm:text-lg font-semibold text-foreground">Clean Auto Pro</h3>
                        <span className="text-[9px] sm:text-[10px] bg-green-100 text-green-700 px-1.5 sm:px-2 py-0.5 rounded-full font-medium">Ouvert</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground mb-1.5 sm:mb-2">
                        <span>Lavage auto premium</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-yellow-400 text-yellow-400" />
                          <span>4.8</span>
                        </div>
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-relaxed">
                        Spécialiste du nettoyage automobile depuis 2018.
                      </p>
                    </div>

                    {/* Social Icons */}
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-secondary rounded-full flex items-center justify-center">
                        <Instagram className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-foreground" />
                      </div>
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-secondary rounded-full flex items-center justify-center">
                        <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-foreground" />
                      </div>
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-secondary rounded-full flex items-center justify-center">
                        <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-foreground" />
                      </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                      <div className="bg-secondary/50 rounded-lg sm:rounded-xl p-2 sm:p-2.5 text-center">
                        <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 mx-auto mb-0.5 sm:mb-1 text-muted-foreground" />
                        <p className="text-[8px] sm:text-[10px] text-muted-foreground truncate">Paris 15e</p>
                      </div>
                      <div className="bg-secondary/50 rounded-lg sm:rounded-xl p-2 sm:p-2.5 text-center">
                        <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 mx-auto mb-0.5 sm:mb-1 text-muted-foreground" />
                        <p className="text-[8px] sm:text-[10px] text-muted-foreground">9h - 19h</p>
                      </div>
                      <div className="bg-secondary/50 rounded-lg sm:rounded-xl p-2 sm:p-2.5 text-center">
                        <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 mx-auto mb-0.5 sm:mb-1 text-muted-foreground" />
                        <p className="text-[8px] sm:text-[10px] text-muted-foreground">Appeler</p>
                      </div>
                    </div>

                    {/* Formules */}
                    <div className="mb-3 sm:mb-4">
                      <h4 className="text-[10px] sm:text-xs font-semibold text-foreground mb-1.5 sm:mb-2">Nos formules</h4>
                      <div className="space-y-1 sm:space-y-1.5">
                        {[
                          { name: 'Lavage simple', price: '15€' },
                          { name: 'Nettoyage intérieur', price: '35€' },
                          { name: 'Formule complète', price: '65€' },
                        ].map((item) => (
                          <div key={item.name} className="flex items-center justify-between bg-secondary/40 rounded-lg sm:rounded-xl px-2.5 sm:px-3 py-2 sm:py-2.5">
                            <p className="text-[10px] sm:text-[11px] font-medium text-foreground">{item.name}</p>
                            <div className="flex items-center gap-1">
                              <p className="text-[10px] sm:text-xs font-semibold text-foreground">{item.price}</p>
                              <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Booking Button */}
                    <div className="bg-foreground text-background rounded-lg sm:rounded-xl py-2.5 sm:py-3 text-center text-xs sm:text-sm font-medium shadow-lg">
                      Réserver un créneau
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Partagez votre lien, convertissez */}
      <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left: Link Sharing Visual */}
            <div className="flex justify-center">
              <div className="relative w-full max-w-[360px]">
                {/* Central Link Card */}
                <div className="bg-card rounded-2xl shadow-mockup border border-border/60 p-5 sm:p-6 text-center">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Link2 className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2">Votre lien unique</p>
                  <div className="inline-flex items-center gap-1 bg-secondary/60 px-3 py-2 rounded-full font-mono text-xs sm:text-sm mb-4">
                    <span className="text-muted-foreground">cleaningpage.com/c/</span>
                    <span className="text-primary font-semibold">votre-nom</span>
                  </div>
                  <Button size="sm" className="w-full rounded-full text-xs">
                    <Share2 className="w-3 h-3 mr-2" />
                    Copier le lien
                  </Button>
                </div>

                {/* Floating Platform Icons */}
                <div className="absolute -left-3 sm:-left-6 top-1/4 bg-card rounded-xl shadow-lg border border-border/40 p-2.5 sm:p-3">
                  <Instagram className="w-5 h-5 sm:w-6 sm:h-6 text-pink-500" />
                </div>
                <div className="absolute -right-3 sm:-right-6 top-1/3 bg-card rounded-xl shadow-lg border border-border/40 p-2.5 sm:p-3">
                  <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                </div>
                <div className="absolute -left-2 sm:-left-4 bottom-1/4 bg-card rounded-xl shadow-lg border border-border/40 p-2.5 sm:p-3">
                  <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                </div>
                <div className="absolute -right-2 sm:-right-4 bottom-1/3 bg-card rounded-xl shadow-lg border border-border/40 p-2.5 sm:p-3">
                  <ExternalLink className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
                </div>
              </div>
            </div>

            {/* Right: Text */}
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground tracking-tight mb-4 sm:mb-6">
                Partagez votre lien,<br />
                <span className="text-muted-foreground">convertissez.</span>
              </h2>
              <p className="text-muted-foreground mb-6 sm:mb-8 text-base sm:text-lg leading-relaxed">
                Partagez votre lien partout où se trouve votre audience : réseaux sociaux, WhatsApp, carte de visite, Google...
              </p>
              
              <div className="space-y-4 mb-8">
                {[
                  { icon: Eye, text: 'Vos visiteurs voient tout : infos, offres, disponibilités' },
                  { icon: Calendar, text: 'Ils peuvent réserver directement, 24h/24' },
                  { icon: ArrowRight, text: 'D\'un clic, ils passent de visiteur à client' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-secondary rounded-xl flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
                    </div>
                    <p className="text-foreground text-sm sm:text-base">{item.text}</p>
                  </div>
                ))}
              </div>

              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                <Check className="w-4 h-4" />
                100% gratuit
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Organisez et gérez votre business */}
      <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground tracking-tight mb-3 sm:mb-4">
              Tout pour gérer votre activité
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Un tableau de bord complet, simple à utiliser. Concentrez-vous sur votre métier.
            </p>
          </div>

          {/* Features Grid - Compact on mobile */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-12 sm:mb-16">
            {[
              { icon: Calendar, title: 'Réservations', desc: 'Gérez vos RDV en un clic' },
              { icon: BarChart3, title: 'Statistiques', desc: 'Suivez votre CA' },
              { icon: Users, title: 'Clients', desc: 'Historique complet' },
              { icon: Palette, title: 'Ma page', desc: 'Personnalisez tout' },
            ].map((item) => (
              <Card key={item.title} variant="elevated" className="p-3 sm:p-6 rounded-xl sm:rounded-2xl hover:shadow-xl transition-shadow duration-300">
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-secondary rounded-lg sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-4">
                  <item.icon className="w-4 h-4 sm:w-6 sm:h-6 text-foreground" />
                </div>
                <h3 className="text-sm sm:text-lg font-semibold text-foreground mb-0.5 sm:mb-2">{item.title}</h3>
                <p className="text-[10px] sm:text-sm text-muted-foreground leading-snug">{item.desc}</p>
              </Card>
            ))}
          </div>

          {/* Interactive Dashboard Mockup */}
          <div className="hidden sm:block">
            <div className="bg-card rounded-2xl shadow-2xl overflow-hidden border border-border/60">
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
                {/* Sidebar with hint */}
                <div className="w-48 bg-secondary/30 border-r border-border/40 p-4 flex-shrink-0 relative">
                  <div className="flex items-center gap-2 mb-2">
                    <Logo size="md" />
                  </div>
                  <p className="text-xs text-muted-foreground mb-4 truncate">/clean-auto-pro</p>

                  {/* Hint badge inside sidebar */}
                  <div className="mb-3 bg-primary text-primary-foreground px-2 py-1.5 rounded-lg text-[10px] font-medium flex items-center gap-1.5 animate-pulse">
                    <span className="w-1.5 h-1.5 bg-primary-foreground rounded-full" />
                    Cliquez pour explorer ↓
                  </div>

                  <nav className="space-y-1">
                    {[
                      { icon: Calendar, label: 'Réservations', active: dashboardTab === 'reservations', tab: 'reservations' as const },
                      { icon: Globe, label: 'Ma Page', active: dashboardTab === 'mypage', tab: 'mypage' as const },
                      { icon: Droplets, label: 'Formules', active: dashboardTab === 'formules', tab: 'formules' as const },
                      { icon: BarChart3, label: 'Statistiques', active: dashboardTab === 'stats', tab: 'stats' as const },
                      { icon: Clock, label: 'Disponibilités', active: dashboardTab === 'settings', tab: 'settings' as const },
                    ].map((item) => (
                      <button
                        key={item.label}
                        onClick={() => setDashboardTab(item.tab)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all ${
                          item.active 
                            ? 'bg-card text-foreground shadow-sm scale-105' 
                            : 'text-muted-foreground hover:bg-card/50 hover:scale-102'
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
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-foreground">Réservations</h3>
                      <div className="text-xs text-muted-foreground">Aujourd'hui</div>
                    </div>

                    {/* Stats cards */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-secondary/50 rounded-xl p-3">
                        <p className="text-xs text-muted-foreground mb-1">RDV du jour</p>
                        <p className="text-2xl font-bold text-foreground">8</p>
                        <p className="text-xs text-green-600">+2 nouveaux</p>
                      </div>
                      <div className="bg-secondary/50 rounded-xl p-3">
                        <p className="text-xs text-muted-foreground mb-1">CA du jour</p>
                        <p className="text-2xl font-bold text-foreground">340€</p>
                        <p className="text-xs text-green-600">+15%</p>
                      </div>
                    </div>

                    <p className="text-xs font-medium text-muted-foreground mb-2">Prochains RDV</p>

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
                              <div className="w-6 h-6 bg-primary rounded-lg mx-auto flex items-center justify-center mb-1 border-2 border-card">
                                <Car className="w-3 h-3 text-primary-foreground" />
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
                              <div className="mt-2 bg-primary text-primary-foreground text-[6px] text-center py-1 rounded">
                                Réserver
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Customization */}
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Personnalisation</p>
                        
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
                          <div className="bg-secondary/30 rounded-lg p-2.5">
                            <p className="text-[10px] text-muted-foreground mb-2">Thèmes prédéfinis</p>
                            <div className="grid grid-cols-3 gap-1.5">
                              {[
                                { name: 'Bleu', colors: ['#3b82f6', '#1e293b', '#10b981'] },
                                { name: 'Rouge', colors: ['#ef4444', '#1c1917', '#f59e0b'] },
                                { name: 'Vert', colors: ['#22c55e', '#14532d', '#3b82f6'] },
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

                          <div className="bg-secondary/30 rounded-lg p-2.5">
                            <p className="text-[10px] text-muted-foreground mb-2">Options d'affichage</p>
                            <div className="space-y-1.5">
                              {[
                                { label: 'Horaires', enabled: true },
                                { label: 'Adresse', enabled: true },
                                { label: 'Téléphone', enabled: true },
                              ].map((opt) => (
                                <div key={opt.label} className="flex items-center justify-between">
                                  <p className="text-[9px] text-foreground">{opt.label}</p>
                                  <div className={`w-6 h-3 rounded-full relative ${opt.enabled ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
                                    <div className={`absolute top-0.5 w-2 h-2 bg-card rounded-full ${opt.enabled ? 'right-0.5' : 'left-0.5'}`} />
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
                    <h3 className="text-lg font-semibold text-foreground mb-4">Statistiques</h3>
                    
                    {/* Stats cards with icons like real dashboard */}
                    <div className="grid grid-cols-4 gap-3 mb-4">
                      {[
                        { icon: Calendar, value: '127', label: 'Réservations ce mois', color: 'bg-secondary' },
                        { icon: () => <span className="text-sm font-bold">€</span>, value: '4 850€', label: "Chiffre d'affaires", color: 'bg-green-100' },
                        { icon: Users, value: '89', label: 'Clients uniques', color: 'bg-blue-100' },
                        { icon: BarChart3, value: '54€', label: 'Panier moyen', color: 'bg-purple-100' },
                      ].map((stat, i) => (
                        <div key={i} className="bg-card border border-border/40 rounded-xl p-3">
                          <div className={`w-8 h-8 ${stat.color} rounded-lg flex items-center justify-center mb-2`}>
                            <stat.icon className="w-4 h-4 text-foreground" />
                          </div>
                          <p className="text-lg font-bold text-foreground">{stat.value}</p>
                          <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 mb-4 bg-secondary/50 p-1 rounded-lg w-fit">
                      {['Évolution', 'Formules', 'Clients'].map((tab, i) => (
                        <div key={tab} className={`px-3 py-1 rounded text-xs ${i === 0 ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'}`}>
                          {tab}
                        </div>
                      ))}
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {/* Area chart mockup */}
                      <div className="bg-card border border-border/40 rounded-xl p-3">
                        <p className="text-xs font-medium text-foreground mb-3">Réservations par semaine</p>
                        <div className="h-24 flex items-end gap-1">
                          {[10, 15, 8, 25, 45, 80, 95, 70, 40].map((h, i) => (
                            <div key={i} className="flex-1 bg-gradient-to-t from-primary/20 to-primary/5 rounded-t" style={{ height: `${h}%` }}>
                              <div className="w-full h-0.5 bg-primary rounded-full" />
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-[8px] text-muted-foreground">10 nov.</span>
                          <span className="text-[8px] text-muted-foreground">29 déc.</span>
                        </div>
                      </div>

                      {/* Bar chart mockup */}
                      <div className="bg-card border border-border/40 rounded-xl p-3">
                        <p className="text-xs font-medium text-foreground mb-3">CA par mois</p>
                        <div className="h-24 flex items-end gap-2">
                          {[15, 25, 35, 20, 45, 90].map((h, i) => (
                            <div key={i} className="flex-1 bg-foreground rounded-t transition-all hover:bg-primary" style={{ height: `${h}%` }} />
                          ))}
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-[8px] text-muted-foreground">juil.</span>
                          <span className="text-[8px] text-muted-foreground">déc.</span>
                        </div>
                      </div>
                    </div>

                    {/* Summary row */}
                    <div className="bg-card border border-border/40 rounded-xl p-3">
                      <p className="text-xs font-medium text-foreground mb-2">Récapitulatif global</p>
                      <div className="grid grid-cols-4 gap-2 text-center">
                        {[
                          { value: '127', label: 'Total réservations' },
                          { value: '4 850€', label: 'CA total' },
                          { value: '98', label: 'Terminées' },
                          { value: '1.4', label: 'Visites/client' },
                        ].map((item, i) => (
                          <div key={i}>
                            <p className="text-sm font-bold text-foreground">{item.value}</p>
                            <p className="text-[9px] text-muted-foreground">{item.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {dashboardTab === 'settings' && (
                  <>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Disponibilités</h3>
                    <p className="text-xs text-muted-foreground mb-4">Définissez vos créneaux de disponibilité</p>
                    
                    <div className="space-y-2">
                      {[
                        { day: 'Lundi', hours: '9:00 - 19:00', enabled: true },
                        { day: 'Mardi', hours: '9:00 - 19:00', enabled: true },
                        { day: 'Mercredi', hours: '9:00 - 19:00', enabled: true },
                        { day: 'Jeudi', hours: '9:00 - 19:00', enabled: true },
                        { day: 'Vendredi', hours: '9:00 - 19:00', enabled: true },
                        { day: 'Samedi', hours: '9:00 - 17:00', enabled: true },
                        { day: 'Dimanche', hours: 'Fermé', enabled: false },
                      ].map((day) => (
                        <div key={day.day} className="flex items-center justify-between bg-secondary/30 rounded-lg px-3 py-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-3 rounded-full relative ${day.enabled ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
                              <div className={`absolute top-0.5 w-2 h-2 bg-card rounded-full ${day.enabled ? 'right-0.5' : 'left-0.5'}`} />
                            </div>
                            <span className="text-xs font-medium text-foreground">{day.day}</span>
                          </div>
                          <span className={`text-xs ${day.enabled ? 'text-foreground' : 'text-muted-foreground'}`}>{day.hours}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

          {/* Mobile Dashboard Preview */}
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
                
                {/* Tab Content */}
                {mobileTab === 'reservations' && (
                  <>
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
                  </>
                )}

                {mobileTab === 'formules' && (
                  <>
                    <p className="text-xs font-semibold text-foreground mb-3">Vos formules</p>
                    <div className="space-y-2">
                      {[
                        { name: 'Lavage simple', price: '15€', desc: 'Extérieur' },
                        { name: 'Intérieur', price: '35€', desc: 'Aspiration' },
                        { name: 'Complet', price: '65€', desc: 'Int. + Ext.' },
                        { name: 'Premium', price: '120€', desc: 'Tout inclus' },
                      ].map((pack, i) => (
                        <div key={i} className="flex items-center gap-3 bg-secondary/30 rounded-xl p-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Droplets className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-medium text-foreground">{pack.name}</p>
                            <p className="text-[10px] text-muted-foreground">{pack.desc}</p>
                          </div>
                          <p className="text-xs font-semibold text-primary">{pack.price}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {mobileTab === 'stats' && (
                  <>
                    <p className="text-xs font-semibold text-foreground mb-3">Statistiques</p>
                    
                    {/* Global summary */}
                    <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-3 mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] text-muted-foreground">Chiffre d'affaires total</span>
                        <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">+23%</span>
                      </div>
                      <p className="text-xl font-bold text-foreground">12 480 €</p>
                      <p className="text-[9px] text-muted-foreground">287 prestations réalisées</p>
                    </div>
                    
                    {/* Stats grid */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="bg-secondary/50 rounded-xl p-2.5">
                        <p className="text-[9px] text-muted-foreground">Ce mois</p>
                        <p className="text-base font-bold text-foreground">127</p>
                        <p className="text-[9px] text-green-600">+12% vs M-1</p>
                      </div>
                      <div className="bg-secondary/50 rounded-xl p-2.5">
                        <p className="text-[9px] text-muted-foreground">Panier moyen</p>
                        <p className="text-base font-bold text-foreground">43,50€</p>
                        <p className="text-[9px] text-green-600">+5%</p>
                      </div>
                      <div className="bg-secondary/50 rounded-xl p-2.5">
                        <p className="text-[9px] text-muted-foreground">Nouveaux clients</p>
                        <p className="text-base font-bold text-foreground">34</p>
                        <p className="text-[9px] text-muted-foreground">ce mois</p>
                      </div>
                      <div className="bg-secondary/50 rounded-xl p-2.5">
                        <p className="text-[9px] text-muted-foreground">Taux conversion</p>
                        <p className="text-base font-bold text-foreground">78%</p>
                        <p className="text-[9px] text-green-600">+3%</p>
                      </div>
                    </div>
                    
                    {/* Mini graph */}
                    <div className="bg-secondary/30 rounded-xl p-3 mb-3">
                      <p className="text-[10px] text-muted-foreground mb-2">Évolution CA (6 mois)</p>
                      <div className="flex items-end justify-between gap-1 h-12">
                        {[35, 48, 42, 55, 68, 85].map((h, i) => (
                          <div 
                            key={i} 
                            className="flex-1 bg-primary/70 rounded-t transition-all hover:bg-primary"
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between mt-1">
                        {['Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'].map((m) => (
                          <span key={m} className="text-[7px] text-muted-foreground">{m}</span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Répartition */}
                    <div className="bg-secondary/30 rounded-xl p-3">
                      <p className="text-[10px] text-muted-foreground mb-2">Répartition formules</p>
                      <div className="space-y-1.5">
                        {[
                          { name: 'Complet', pct: 45, color: 'bg-primary' },
                          { name: 'Intérieur', pct: 30, color: 'bg-blue-500' },
                          { name: 'Simple', pct: 25, color: 'bg-green-500' },
                        ].map((item, i) => (
                          <div key={i}>
                            <div className="flex justify-between text-[9px] mb-0.5">
                              <span className="text-foreground">{item.name}</span>
                              <span className="text-muted-foreground">{item.pct}%</span>
                            </div>
                            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                              <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {mobileTab === 'dispo' && (
                  <>
                    <p className="text-xs font-semibold text-foreground mb-3">Disponibilités</p>
                    <div className="space-y-1.5">
                      {[
                        { day: 'Lundi', hours: '9:00 - 19:00', enabled: true },
                        { day: 'Mardi', hours: '9:00 - 19:00', enabled: true },
                        { day: 'Mercredi', hours: '9:00 - 19:00', enabled: true },
                        { day: 'Jeudi', hours: '9:00 - 19:00', enabled: true },
                        { day: 'Vendredi', hours: '9:00 - 19:00', enabled: true },
                        { day: 'Samedi', hours: '9:00 - 17:00', enabled: true },
                        { day: 'Dimanche', hours: 'Fermé', enabled: false },
                      ].map((day) => (
                        <div key={day.day} className="flex items-center justify-between bg-secondary/30 rounded-lg px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-5 h-2.5 rounded-full relative ${day.enabled ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
                              <div className={`absolute top-0.5 w-1.5 h-1.5 bg-card rounded-full ${day.enabled ? 'right-0.5' : 'left-0.5'}`} />
                            </div>
                            <span className="text-[10px] font-medium text-foreground">{day.day}</span>
                          </div>
                          <span className={`text-[10px] ${day.enabled ? 'text-foreground' : 'text-muted-foreground'}`}>{day.hours}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 bg-secondary/30 rounded-xl p-3">
                      <p className="text-[10px] text-muted-foreground mb-2">Créneaux par jour</p>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-foreground">8</span>
                        <span className="text-[10px] text-muted-foreground">créneaux disponibles</span>
                      </div>
                    </div>
                  </>
                )}

                {mobileTab === 'mypage' && (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-foreground">Ma Page</p>
                      <button className="text-[9px] bg-primary text-primary-foreground px-2 py-1 rounded-md">
                        Enregistrer
                      </button>
                    </div>
                    
                    {/* Customization tabs */}
                    <div className="flex gap-1 mb-2 bg-secondary/50 p-0.5 rounded-lg">
                      {[
                        { icon: Palette, label: 'Couleurs', active: true },
                        { icon: MapPin, label: 'Textes', active: false },
                        { icon: Eye, label: 'Affichage', active: false },
                      ].map((tab) => (
                        <div 
                          key={tab.label}
                          className={`flex-1 flex items-center justify-center gap-1 py-1 rounded text-[8px] ${
                            tab.active ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'
                          }`}
                        >
                          <tab.icon className="w-2.5 h-2.5" />
                          <span>{tab.label}</span>
                        </div>
                      ))}
                    </div>

                    {/* Customization options */}
                    <div className="space-y-1.5 mb-2">
                      <div className="bg-secondary/30 rounded-lg p-2">
                        <p className="text-[9px] text-muted-foreground mb-1">Thèmes</p>
                        <div className="flex gap-1">
                          {[
                            { name: 'Bleu', colors: ['#3b82f6', '#1e293b'] },
                            { name: 'Vert', colors: ['#22c55e', '#14532d'] },
                            { name: 'Rouge', colors: ['#ef4444', '#1c1917'] },
                          ].map((theme) => (
                            <div 
                              key={theme.name}
                              className={`flex-1 p-1 rounded border ${theme.name === 'Bleu' ? 'border-primary ring-1 ring-primary/20' : 'border-border/50'}`}
                            >
                              <div className="flex gap-0.5 mb-0.5">
                                {theme.colors.map((c, i) => (
                                  <div key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: c }} />
                                ))}
                              </div>
                              <p className="text-[7px] text-muted-foreground text-center">{theme.name}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="bg-secondary/30 rounded-lg p-2">
                        <p className="text-[9px] text-muted-foreground mb-1">Affichage</p>
                        <div className="grid grid-cols-3 gap-1">
                          {['Horaires', 'Adresse', 'Tel'].map((opt) => (
                            <div key={opt} className="flex items-center gap-1">
                              <div className="w-5 h-2.5 bg-primary rounded-full relative">
                                <div className="absolute right-0.5 top-0.5 w-1.5 h-1.5 bg-card rounded-full" />
                              </div>
                              <p className="text-[7px] text-foreground">{opt}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Preview below */}
                    <div className="bg-secondary/30 rounded-lg p-2">
                      <p className="text-[9px] text-muted-foreground mb-1.5">Aperçu en direct</p>
                      <div className="bg-card rounded-lg overflow-hidden border border-border/40">
                        <div className="h-10 bg-gradient-to-r from-primary to-primary/60 relative">
                          <div className="absolute -bottom-2 left-2">
                            <div className="w-5 h-5 bg-primary rounded-md flex items-center justify-center border-2 border-card shadow">
                              <Car className="w-2.5 h-2.5 text-primary-foreground" />
                            </div>
                          </div>
                        </div>
                        <div className="p-2 pt-3">
                          <p className="text-[8px] font-semibold text-foreground">Clean Auto Pro</p>
                          <p className="text-[6px] text-muted-foreground mb-1.5">Lavage premium • ⭐ 4.8</p>
                          <div className="flex gap-1 mb-1.5">
                            {[MapPin, Clock, Phone].map((Icon, i) => (
                              <div key={i} className="flex-1 bg-secondary/50 rounded p-1 flex items-center justify-center">
                                <Icon className="w-2 h-2 text-muted-foreground" />
                              </div>
                            ))}
                          </div>
                          <div className="space-y-0.5">
                            {['Simple', 'Complet'].map((name) => (
                              <div key={name} className="flex justify-between bg-secondary/40 rounded px-1.5 py-1">
                                <span className="text-[6px] text-foreground">{name}</span>
                                <span className="text-[6px] font-semibold text-primary">{name === 'Simple' ? '15€' : '65€'}</span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-1.5 bg-foreground text-background text-[7px] text-center py-1 rounded font-medium">
                            Réserver
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {mobileTab === 'settings' && (
                  <>
                    <p className="text-xs font-semibold text-foreground mb-3">Paramètres</p>
                    <div className="space-y-2">
                      <div className="bg-secondary/30 rounded-xl p-3">
                        <p className="text-[10px] text-muted-foreground mb-1">Centre</p>
                        <p className="text-xs font-medium text-foreground">Clean Auto Pro</p>
                        <p className="text-[10px] text-muted-foreground">12 rue du Lavage, Paris</p>
                      </div>
                      <div className="bg-secondary/30 rounded-xl p-3 flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Car className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground">Logo</p>
                          <p className="text-xs text-foreground">Modifier</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              {/* Bottom navigation */}
              <div className="absolute bottom-0 left-0 right-0 bg-card border-t border-border/40 px-2 pb-2 pt-1">
                <div className="flex justify-around">
                  {[
                    { icon: Calendar, tab: 'reservations' as const, label: 'RDV' },
                    { icon: Globe, tab: 'mypage' as const, label: 'Page' },
                    { icon: Droplets, tab: 'formules' as const, label: 'Packs' },
                    { icon: BarChart3, tab: 'stats' as const, label: 'Stats' },
                    { icon: Clock, tab: 'dispo' as const, label: 'Dispo' },
                    { icon: Settings, tab: 'settings' as const, label: 'Config' },
                  ].map((item) => (
                    <button 
                      key={item.tab}
                      onClick={() => setMobileTab(item.tab)}
                      className={`flex flex-col items-center gap-0.5 p-1 rounded-xl transition-all ${mobileTab === item.tab ? 'bg-primary/10 scale-110' : 'hover:bg-secondary/50'}`}
                    >
                      <item.icon className={`w-3.5 h-3.5 ${mobileTab === item.tab ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className={`text-[6px] ${mobileTab === item.tab ? 'text-primary font-medium' : 'text-muted-foreground'}`}>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Hint badge below the phone */}
            <div className="mt-4 flex justify-center">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs font-medium animate-bounce">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                Touchez le menu en bas
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
