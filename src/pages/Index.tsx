import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Logo } from '@/components/ui/Logo';
import { 
  ArrowRight, Calendar, Users, BarChart3, Link2, 
  Shield, Clock, Check, Car, Droplets, MapPin, Phone, 
  Star, Settings, LogOut, ChevronRight, Globe, Palette, Eye,
  Instagram, MessageCircle, Share2, ExternalLink, Sparkles, Mail, Loader2
} from 'lucide-react';
import mockupBanner from '@/assets/mockup-banner-v2.jpg';
import sofaBanner from '@/assets/sofa-cleaning-banner.jpg';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function Index() {
  const [dashboardTab, setDashboardTab] = useState<'reservations' | 'mypage' | 'formules' | 'stats' | 'settings'>('mypage');
  const [mobileTab, setMobileTab] = useState<'reservations' | 'mypage' | 'formules' | 'stats' | 'settings' | 'dispo'>('mypage');
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const { toast } = useToast();

  const handleStartTrial = async () => {
    setIsCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-guest-checkout');
      
      if (error) {
        throw new Error(error.message);
      }

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      console.error('Error creating checkout:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible de démarrer l\'essai. Veuillez réessayer.',
        variant: 'destructive',
      });
      setIsCheckoutLoading(false);
    }
  };

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
                Votre activité de nettoyage.
                <br />
                <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">Un seul lien.</span>
              </h1>
              
              <p className="opacity-0 animate-fade-in-up stagger-2 text-base sm:text-lg md:text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed">
                Présentez vos prestations, recevez des demandes et gérez vos rendez-vous. Le tout dans une page professionnelle à votre image.
              </p>
              
              <div className="opacity-0 animate-fade-in-up stagger-3 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-8">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto text-base px-8 shadow-lg shadow-emerald-500/25 bg-emerald-500 hover:bg-emerald-600"
                  onClick={handleStartTrial}
                  disabled={isCheckoutLoading}
                >
                  {isCheckoutLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Chargement...
                    </>
                  ) : (
                    <>
                      Essayer gratuitement 30 jours
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="opacity-0 animate-fade-in-up stagger-4 flex items-center gap-6 justify-center lg:justify-start text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>30 jours gratuits</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Sans engagement</span>
                </div>
              </div>
            </div>

            {/* Mobile: Text + CTA above mockup */}
            <div className="text-center lg:hidden">
              <h1 className="opacity-0 animate-fade-in-up text-3xl sm:text-4xl font-semibold text-foreground tracking-tight mb-4 leading-[1.1]">
                Votre activité de nettoyage.
                <br />
                <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">Un seul lien.</span>
              </h1>
              
              <p className="opacity-0 animate-fade-in-up stagger-1 text-base text-muted-foreground max-w-sm mx-auto mb-6 leading-relaxed">
                Présentez votre activité, recevez des demandes et gérez vos rendez-vous.
              </p>

              <Button 
                size="lg" 
                className="w-full text-base px-8 shadow-lg shadow-emerald-500/25 bg-emerald-500 hover:bg-emerald-600 mb-4"
                onClick={handleStartTrial}
                disabled={isCheckoutLoading}
              >
                {isCheckoutLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Chargement...
                  </>
                ) : (
                  <>
                    Essayer gratuitement 30 jours
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
              
              <div className="flex items-center gap-4 justify-center text-sm text-muted-foreground mb-8">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>30 jours gratuits</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Sans engagement</span>
                </div>
              </div>
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

          {/* Dashboard Browser Mockup - Real Dashboard Style */}
          <div className="opacity-0 animate-fade-in-up stagger-3">
            <div className="bg-card rounded-2xl shadow-2xl overflow-hidden border border-border/60 max-w-5xl mx-auto">
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

              {/* Dashboard Content - Two Panel Layout */}
              <div className="flex min-h-[520px]">
                {/* Left Panel: Aperçu (Preview) */}
                <div className="flex-1 p-6 border-r border-border/40 bg-secondary/10">
                  {/* Aperçu Header */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-sm font-medium text-foreground">Aperçu</span>
                    <div className="flex items-center gap-2">
                      <button className="w-8 h-8 bg-background border border-border/60 rounded-lg flex items-center justify-center hover:bg-secondary/50 transition-colors">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <rect x="3" y="4" width="18" height="14" rx="2" strokeWidth="2"/>
                          <path d="M8 21h8" strokeWidth="2"/>
                          <path d="M12 18v3" strokeWidth="2"/>
                        </svg>
                      </button>
                      <button className="w-8 h-8 bg-background border border-border/60 rounded-lg flex items-center justify-center hover:bg-secondary/50 transition-colors ml-1">
                        <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Preview Content - Profile Card */}
                  <div className="bg-card rounded-2xl border border-border/40 overflow-hidden shadow-sm max-w-sm mx-auto">
                    {/* Banner */}
                    <div className="h-28 relative">
                      <img 
                        src={mockupBanner} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
                      {/* Logo overlay */}
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
                        <div className="bg-emerald-600 text-white px-4 py-1.5 rounded-lg font-bold text-sm shadow-lg">
                          IMPEC'CAR
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 text-center">
                      <h3 className="text-lg font-bold text-foreground mb-2">IMPEC'CAR</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-4 px-2">
                        réalise, 7/7 et 24/24, le lavage de votre voiture ou tout autre véhicule à l'eau sur le lieu de votre choix
                      </p>

                      {/* Status Badge */}
                      <div className="flex justify-center mb-4">
                        <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium border border-emerald-200 bg-emerald-50 rounded-full px-3 py-1">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                          Ouvert
                        </span>
                      </div>

                      {/* Social Icons */}
                      <div className="flex justify-center gap-3 mb-5">
                        {[Instagram, MessageCircle, Users, Mail].map((Icon, i) => (
                          <div key={i} className="w-10 h-10 bg-secondary/60 rounded-full flex items-center justify-center hover:bg-secondary transition-colors cursor-pointer">
                            <Icon className="w-4 h-4 text-foreground" />
                          </div>
                        ))}
                      </div>

                      {/* Info Items */}
                      <div className="space-y-2 text-left px-2">
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          <span>0687661023</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>Lun - Sam : 9h00 - 19h00</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Panel: Personnalisation */}
                <div className="w-[420px] p-6 bg-background hidden lg:block">
                  <h3 className="text-lg font-semibold text-foreground mb-5">Personnalisation</h3>

                  {/* Tab Icons */}
                  <div className="bg-secondary/40 rounded-2xl p-2 mb-6">
                    <div className="flex">
                      {[
                        { icon: Palette, label: 'Design', active: false },
                        { icon: Droplets, label: 'Formules', active: false },
                        { icon: Sparkles, label: 'Éléments', active: true },
                        { icon: BarChart3, label: 'SEO', active: false },
                      ].map((tab) => (
                        <button 
                          key={tab.label}
                          className={`flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl transition-all ${
                            tab.active 
                              ? 'bg-card shadow-sm' 
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <tab.icon className={`w-5 h-5 ${tab.active ? 'text-foreground' : ''}`} />
                          <span className={`text-[11px] ${tab.active ? 'text-foreground font-medium' : ''}`}>{tab.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Add Element Button */}
                  <div className="border-2 border-dashed border-border/60 rounded-2xl p-8 mb-6 flex flex-col items-center justify-center hover:border-primary/40 hover:bg-secondary/20 transition-colors cursor-pointer">
                    <div className="w-12 h-12 bg-secondary/60 rounded-full flex items-center justify-center mb-3">
                      <span className="text-2xl text-muted-foreground">+</span>
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">Ajouter un élément</p>
                    <p className="text-xs text-muted-foreground">Images, texte, liens, contact...</p>
                  </div>

                  {/* Elements List */}
                  <p className="text-sm text-muted-foreground mb-3">Vos éléments</p>
                  <div className="space-y-3">
                    {/* Phone Block */}
                    <div className="bg-card rounded-xl border border-border/40 p-4">
                      <div className="flex items-center gap-3">
                        <div className="text-muted-foreground cursor-grab">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="9" cy="6" r="1.5"/>
                            <circle cx="15" cy="6" r="1.5"/>
                            <circle cx="9" cy="12" r="1.5"/>
                            <circle cx="15" cy="12" r="1.5"/>
                            <circle cx="9" cy="18" r="1.5"/>
                            <circle cx="15" cy="18" r="1.5"/>
                          </svg>
                        </div>
                        <div className="w-8 h-8 bg-secondary/60 rounded-lg flex items-center justify-center">
                          <Phone className="w-4 h-4 text-foreground" />
                        </div>
                        <span className="flex-1 text-sm font-medium text-foreground">Téléphone</span>
                        <div className="flex items-center gap-1">
                          <button className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground">
                            <ChevronRight className="w-4 h-4 rotate-[-90deg]" />
                          </button>
                          <button className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground">
                            <ChevronRight className="w-4 h-4 rotate-90" />
                          </button>
                        </div>
                        <div className="w-10 h-6 bg-foreground rounded-full relative">
                          <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-background rounded-full" />
                        </div>
                        <button className="w-6 h-6 flex items-center justify-center text-red-400 hover:text-red-500">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-3 ml-14">Téléphone non configuré (Paramètres → Informations)</p>
                      <div className="flex items-center gap-2 mt-3 ml-14">
                        <span className="text-xs text-muted-foreground">Style :</span>
                        {['Minimal', 'Pill', 'Carte'].map((style, i) => (
                          <button 
                            key={style}
                            className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                              i === 0 
                                ? 'bg-foreground text-background' 
                                : 'bg-secondary/60 text-muted-foreground hover:bg-secondary'
                            }`}
                          >
                            {style}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Hours Block */}
                    <div className="bg-card rounded-xl border border-border/40 p-4">
                      <div className="flex items-center gap-3">
                        <div className="text-muted-foreground cursor-grab">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="9" cy="6" r="1.5"/>
                            <circle cx="15" cy="6" r="1.5"/>
                            <circle cx="9" cy="12" r="1.5"/>
                            <circle cx="15" cy="12" r="1.5"/>
                            <circle cx="9" cy="18" r="1.5"/>
                            <circle cx="15" cy="18" r="1.5"/>
                          </svg>
                        </div>
                        <div className="w-8 h-8 bg-secondary/60 rounded-lg flex items-center justify-center">
                          <Clock className="w-4 h-4 text-foreground" />
                        </div>
                        <span className="flex-1 text-sm font-medium text-foreground">Horaires</span>
                        <div className="flex items-center gap-1">
                          <button className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground">
                            <ChevronRight className="w-4 h-4 rotate-[-90deg]" />
                          </button>
                          <button className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground">
                            <ChevronRight className="w-4 h-4 rotate-90" />
                          </button>
                        </div>
                        <div className="w-10 h-6 bg-foreground rounded-full relative">
                          <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-background rounded-full" />
                        </div>
                        <button className="w-6 h-6 flex items-center justify-center text-red-400 hover:text-red-500">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
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
              Un seul plan, tout inclus
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground px-2">
              Essayez gratuitement pendant 30 jours, sans engagement.
            </p>
          </div>
          
          <div className="max-w-lg mx-auto">
            {/* Pro Plan - Single offer */}
            <Card variant="elevated" className="p-5 sm:p-8 rounded-xl sm:rounded-2xl ring-2 ring-foreground relative hover:shadow-xl transition-shadow duration-300 overflow-hidden">
              {/* Premium trial banner */}
              <div className="absolute top-0 left-0 right-0 bg-foreground text-primary-foreground py-2 sm:py-2.5 px-4 text-center">
                <p className="text-xs sm:text-sm font-medium">30 jours d'essai gratuit</p>
              </div>
              
              <div className="mb-4 sm:mb-6 mt-8 sm:mt-10">
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-1">CleaningPage Pro</h3>
                <p className="text-muted-foreground text-xs sm:text-sm">Tout ce qu'il faut pour développer votre activité</p>
              </div>
              
              <div className="mb-4 sm:mb-6">
                <span className="text-3xl sm:text-4xl font-semibold text-foreground">39€</span>
                <span className="text-muted-foreground text-sm sm:text-base ml-2">/ mois</span>
                <p className="text-xs text-muted-foreground mt-1">après les 30 jours d'essai</p>
              </div>
              
              <ul className="space-y-2.5 sm:space-y-3 mb-6 sm:mb-8">
                {[
                  'Page professionnelle personnalisée',
                  'Lien unique partageable',
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
              
              <Button 
                size="lg" 
                className="w-full rounded-full text-sm bg-emerald-500 hover:bg-emerald-600"
                onClick={handleStartTrial}
                disabled={isCheckoutLoading}
              >
                {isCheckoutLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Chargement...
                  </>
                ) : (
                  <>
                    Essayer gratuitement 30 jours
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
              
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
            Essayez gratuitement pendant 30 jours, sans engagement.
          </p>
          <Button 
            size="lg" 
            className="rounded-full px-6 sm:px-8 text-sm sm:text-base bg-emerald-500 hover:bg-emerald-600"
            onClick={handleStartTrial}
            disabled={isCheckoutLoading}
          >
            {isCheckoutLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Chargement...
              </>
            ) : (
              <>
                Essayer gratuitement 30 jours
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </>
            )}
          </Button>
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
