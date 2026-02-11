import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Logo } from '@/components/ui/Logo';
import { 
  ArrowRight, Calendar, Users, BarChart3, Link2, 
  Shield, Clock, Check, X, Car, Droplets, MapPin, Phone, 
  Star, Settings, LogOut, ChevronRight, ChevronLeft, Globe, Palette, Eye,
  Instagram, MessageCircle, Share2, ExternalLink, Sparkles, Mail, Loader2,
  Zap, Crown, ImagePlus, Upload, Tag, CalendarDays, Plus, Facebook, Type, MousePointer2
} from 'lucide-react';
import mockupBanner from '@/assets/mockup-banner-v2.jpg';
import sofaBanner from '@/assets/sofa-cleaning-banner.jpg';
import gocleanLogo from '@/assets/gocleaning-logo.png';
import mockupCarCleaning from '@/assets/mockup-car-cleaning.jpg';
import mockupLogoClean from '@/assets/mockup-logo-cleaning.png';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function Index() {
  const [dashboardTab, setDashboardTab] = useState<'reservations' | 'calendar' | 'clients' | 'invoices' | 'stats' | 'mypage' | 'formules'>('reservations');
  const [mobileTab, setMobileTab] = useState<'reservations' | 'mypage' | 'formules' | 'stats' | 'settings' | 'dispo'>('mypage');
  const [mockupTab, setMockupTab] = useState<'design' | 'formules' | 'elements' | 'seo'>('design');
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

            {/* Right: Main Page Card + Stats Widgets - Linktree Style */}
            <div className="flex justify-center lg:justify-end mt-8 lg:mt-0">
              <div className="relative w-[340px] sm:w-[420px] md:w-[520px] h-[640px] sm:h-[540px] md:h-[600px]">
                
                {/* Main Page Card - Full CleaningPage profile like the reference */}
                <div className="absolute top-8 sm:top-4 left-1/2 -translate-x-1/2 z-20">
                  <div 
                    className="bg-card rounded-[2rem] overflow-hidden w-[250px] sm:w-[270px] shadow-2xl shadow-black/20 ring-1 ring-border/40"
                    style={{ transform: 'rotate(-3deg)' }}
                  >
                    {/* Banner */}
                    <div className="h-28 relative">
                      <div className="absolute inset-0 overflow-hidden">
                        <img 
                          src={mockupBanner} 
                          alt="Service preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Logo overlay - premium style like reference */}
                      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 z-20">
                        <div className="w-20 h-20 rounded-[1.25rem] shadow-2xl ring-[6px] ring-card overflow-hidden">
                          <img src={gocleanLogo} alt="GoCleaning Logo" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="px-4 pb-5 pt-12 text-center">
                      {/* Name & Description */}
                      <h3 className="text-base font-bold text-foreground mb-1">GOCLEANING</h3>
                      <p className="text-[10px] text-muted-foreground leading-relaxed mb-3 px-2">
                        Nettoyage automobile premium à domicile, 7j/7. Qualité garantie.
                      </p>
                      
                      {/* Ouvert badge */}
                      <div className="flex justify-center mb-3">
                        <span className="inline-flex items-center gap-1.5 text-[10px] bg-white border border-border/60 text-emerald-600 px-3 py-1.5 rounded-full font-medium shadow-sm">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                          Ouvert
                        </span>
                      </div>
                      
                      {/* Social icons row */}
                      <div className="flex justify-center gap-2 mb-4">
                        <div className="w-9 h-9 bg-secondary/60 rounded-xl flex items-center justify-center hover:bg-secondary transition-colors cursor-pointer">
                          <Instagram className="w-4 h-4 text-foreground" />
                        </div>
                        <div className="w-9 h-9 bg-secondary/60 rounded-xl flex items-center justify-center hover:bg-secondary transition-colors cursor-pointer">
                          <svg className="w-4 h-4 text-foreground" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                          </svg>
                        </div>
                        <div className="w-9 h-9 bg-secondary/60 rounded-xl flex items-center justify-center hover:bg-secondary transition-colors cursor-pointer">
                          <MessageCircle className="w-4 h-4 text-foreground" />
                        </div>
                        <div className="w-9 h-9 bg-secondary/60 rounded-xl flex items-center justify-center hover:bg-secondary transition-colors cursor-pointer">
                          <Mail className="w-4 h-4 text-foreground" />
                        </div>
                      </div>
                      
                      {/* Contact info */}
                      <div className="space-y-1.5 mb-4 text-left px-1">
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          <span>06 12 34 56 78</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>Lun - Sam : 9h00 - 19h00</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          <span>12 rue de la Paix, 75002 Paris</span>
                        </div>
                      </div>
                      
                      {/* Formules section */}
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-foreground text-left mb-2">Nos formules</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-secondary/30 rounded-xl p-3 text-left border border-border/30">
                            <p className="text-[11px] font-medium text-foreground mb-0.5">Express</p>
                            <p className="text-sm font-bold text-muted-foreground">35€</p>
                          </div>
                          <div className="bg-secondary/30 rounded-xl p-3 text-left border border-border/30">
                            <p className="text-[11px] font-medium text-foreground mb-0.5">Complet</p>
                            <p className="text-sm font-bold text-muted-foreground">89€</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* CTA */}
                      <button className="w-full bg-zinc-800 hover:bg-zinc-900 text-white rounded-xl py-3 text-xs font-semibold transition-colors">
                        Réserver maintenant
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Widget: Revenue Stats - Top Right */}
                <div className="absolute -top-2 sm:top-2 right-0 sm:right-10 z-10">
                  <div 
                    className="bg-card rounded-2xl p-2.5 sm:p-3.5 shadow-xl shadow-black/10 ring-1 ring-border/30"
                    style={{ transform: 'rotate(5deg)' }}
                  >
                    <div className="flex items-center gap-2 sm:gap-2.5">
                      <div className="w-7 h-7 sm:w-9 sm:h-9 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                        <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm sm:text-lg font-bold text-foreground">4 280€</p>
                        <p className="text-[8px] sm:text-[9px] text-muted-foreground">ce mois-ci</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Widget: Reservations Stats - Bottom Left */}
                <div className="absolute -bottom-6 sm:bottom-24 -left-2 sm:left-6 z-30">
                  <div 
                    className="bg-card rounded-2xl p-2.5 sm:p-3.5 shadow-xl shadow-black/10 ring-1 ring-border/30"
                    style={{ transform: 'rotate(-7deg)' }}
                  >
                    <div className="flex items-center gap-2 sm:gap-2.5">
                      <div className="w-7 h-7 sm:w-9 sm:h-9 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm sm:text-lg font-bold text-foreground">47</p>
                        <p className="text-[8px] sm:text-[9px] text-muted-foreground">réservations</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Widget: Views Stats - Bottom Right */}
                <div className="absolute -bottom-6 sm:bottom-12 -right-2 sm:right-12 z-30">
                  <div 
                    className="bg-card rounded-2xl p-2.5 sm:p-3.5 shadow-xl shadow-black/10 ring-1 ring-border/30"
                    style={{ transform: 'rotate(4deg)' }}
                  >
                    <div className="flex items-center gap-2 sm:gap-2.5">
                      <div className="w-7 h-7 sm:w-9 sm:h-9 bg-amber-500/10 rounded-xl flex items-center justify-center">
                        <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm sm:text-lg font-bold text-foreground">1.2k</p>
                        <p className="text-[8px] sm:text-[9px] text-muted-foreground">vues ce mois</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Widget: Rating - Top Left */}
                <div className="absolute top-0 sm:top-20 left-0 sm:left-4 z-10">
                  <div 
                    className="bg-card rounded-xl px-2.5 py-2 sm:px-3 sm:py-2.5 shadow-lg shadow-black/10 ring-1 ring-border/30"
                    style={{ transform: 'rotate(-4deg)' }}
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-400 text-amber-400" />
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-foreground">4.9</p>
                        <p className="text-[7px] sm:text-[8px] text-muted-foreground">312 avis</p>
                      </div>
                    </div>
                  </div>
                </div>
                
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Section 1: Personnalisez votre page - Apple Style Visual */}
      <section className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 border-t border-border/30 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          {/* Section Header - Minimal Apple style */}
          <div className="text-center mb-10 sm:mb-16 lg:mb-20">
            <h2 className="opacity-0 animate-fade-in-up text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground tracking-tight mb-3 sm:mb-4">
              Personnalisez votre page en quelques clics.
            </h2>
            <p className="opacity-0 animate-fade-in-up stagger-1 text-muted-foreground text-sm sm:text-base lg:text-lg max-w-lg mx-auto">
              Modifiez visuellement votre page à votre image et ajoutez facilement vos informations, liens et disponibilités...
            </p>
          </div>

          {/* Visual Composition - Premium Mockup */}
          <div className="opacity-0 animate-fade-in-up stagger-2">
            {/* Mobile Layout */}
            <div className="sm:hidden">
              {/* Mobile Widgets Grid - ABOVE mockup */}
              <div className="grid grid-cols-2 gap-3 max-w-[280px] mx-auto mb-6">
                {/* Colors - with cursor */}
                <div className="bg-card rounded-xl p-3 shadow-lg ring-1 ring-border/30 relative">
                  <p className="text-[9px] text-muted-foreground mb-1.5 font-medium">Couleurs</p>
                  <div className="flex gap-1.5">
                    {['bg-emerald-500', 'bg-blue-500', 'bg-violet-500'].map((bg, i) => (
                      <div key={i} className={`w-5 h-5 ${bg} rounded-full ${i === 0 ? 'ring-2 ring-foreground ring-offset-1 ring-offset-card' : ''}`} />
                    ))}
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-red-500 via-green-500 to-purple-500 flex items-center justify-center">
                      <Plus className="w-2.5 h-2.5 text-white" />
                    </div>
                  </div>
                  {/* Cursor icon */}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 animate-pulse">
                    <MousePointer2 className="w-5 h-5 text-foreground drop-shadow-md" />
                  </div>
                </div>
                
                {/* Disponibilités */}
                <div className="bg-card rounded-xl p-3 shadow-lg ring-1 ring-border/30">
                  <p className="text-[9px] text-muted-foreground mb-1.5 font-medium">Disponibilités</p>
                  <div className="space-y-1">
                    {[
                      { day: 'Lun', hours: '9h-18h', active: true },
                      { day: 'Sam', hours: 'Fermé', active: false },
                    ].map((d, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <span className="text-[8px] w-5 text-muted-foreground">{d.day}</span>
                        <span className={`text-[8px] flex-1 ${d.active ? 'text-foreground' : 'text-muted-foreground'}`}>{d.hours}</span>
                        <div className={`w-5 h-2.5 rounded-full ${d.active ? 'bg-emerald-500' : 'bg-secondary'}`} />
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Texte */}
                <div className="bg-card rounded-xl p-3 shadow-lg ring-1 ring-border/30 flex items-center gap-2">
                  <div className="w-6 h-6 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Type className="w-3 h-3 text-primary" />
                  </div>
                  <div>
                    <p className="text-[9px] text-muted-foreground">Texte</p>
                    <p className="text-[10px] font-medium text-foreground">Ajouter</p>
                  </div>
                </div>
                
                {/* Galerie */}
                <div className="bg-card rounded-xl p-3 shadow-lg ring-1 ring-border/30">
                  <p className="text-[9px] text-muted-foreground mb-1.5 font-medium">Galerie</p>
                  <div className="flex gap-1">
                    <div className="w-7 h-7 bg-secondary rounded overflow-hidden">
                      <img src={mockupCarCleaning} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="w-7 h-7 bg-secondary rounded overflow-hidden">
                      <img src={sofaBanner} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="w-7 h-7 bg-secondary/60 rounded flex items-center justify-center border border-dashed border-border">
                      <Plus className="w-3 h-3 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Central Page Preview - Mobile - BELOW widgets */}
              <div className="relative mx-auto w-[280px]">
                <div className="bg-card rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-border/20">
                  {/* Banner with real car cleaning image */}
                  <div className="h-24 relative overflow-hidden rounded-t-[2rem]">
                    <img 
                      src={mockupCarCleaning} 
                      alt="Nettoyage automobile professionnel" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                  
                  {/* Logo - Prominent */}
                  <div className="flex justify-center -mt-10 relative z-30 mb-3">
                    <div className="w-20 h-20 bg-white rounded-2xl shadow-2xl flex items-center justify-center ring-4 ring-white overflow-hidden">
                      <img 
                        src={mockupLogoClean} 
                        alt="Clean Premium logo" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  
                  <div className="px-5 pb-5 text-center">
                    <h3 className="text-lg font-bold text-foreground mb-1">Clean Premium</h3>
                    <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                      Nettoyage premium à domicile, 7j/7.
                    </p>
                    
                    {/* Open badge */}
                    <div className="flex justify-center mb-4">
                      <span className="inline-flex items-center gap-1.5 text-[10px] bg-white dark:bg-card border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full font-medium shadow-sm">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        Ouvert
                      </span>
                    </div>
                    
                    {/* Social icons row */}
                    <div className="flex justify-center gap-2 mb-4">
                      {[Instagram, Facebook, Mail].map((Icon, i) => (
                        <div key={i} className="w-9 h-9 rounded-full flex items-center justify-center bg-card border-2 border-foreground/20">
                          <Icon className="w-4 h-4 text-foreground" />
                        </div>
                      ))}
                    </div>
                    
                    {/* Formules section */}
                    <div className="text-left mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-foreground">Nos formules</h4>
                        <span className="text-[10px] text-primary font-medium">Voir tout →</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-card border border-border/60 rounded-lg p-3">
                          <p className="text-xs font-semibold text-foreground mb-0.5">Express</p>
                          <p className="text-base font-bold text-muted-foreground">35€</p>
                        </div>
                        <div className="bg-card border border-border/60 rounded-lg p-3">
                          <p className="text-xs font-semibold text-foreground mb-0.5">Complet</p>
                          <p className="text-base font-bold text-muted-foreground">89€</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* CTA Button */}
                    <button className="w-full bg-neutral-800 dark:bg-neutral-700 text-white py-3 rounded-xl text-sm font-semibold shadow-lg">
                      Réserver maintenant
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Desktop Layout */}
            <div className="hidden sm:block relative">
              <div className="relative max-w-5xl mx-auto">
                
                {/* Central Page Preview - Premium & Complete */}
                <div className="relative mx-auto w-[320px] lg:w-[340px]">
                  <div className="bg-card rounded-[2.5rem] overflow-hidden shadow-2xl ring-1 ring-border/20">
                    {/* Banner with real car cleaning image */}
                    <div className="h-28 lg:h-32 relative overflow-hidden rounded-t-[2.5rem]">
                      <img 
                        src={mockupCarCleaning} 
                        alt="Nettoyage automobile professionnel" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                    
                    {/* Logo - Prominent, outside banner */}
                    <div className="flex justify-center -mt-12 relative z-30 mb-4">
                      <div className="w-24 h-24 bg-white rounded-2xl shadow-2xl flex items-center justify-center ring-4 ring-white overflow-hidden">
                        <img 
                          src={mockupLogoClean} 
                          alt="Clean Premium logo" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    
                    <div className="px-6 pb-6 text-center">
                      <h3 className="text-xl font-bold text-foreground mb-1">Clean Premium</h3>
                      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                        Nettoyage premium à domicile, 7j/7.
                      </p>
                      
                      {/* Open badge */}
                      <div className="flex justify-center mb-5">
                        <span className="inline-flex items-center gap-2 text-xs bg-white dark:bg-card border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 px-4 py-1.5 rounded-full font-medium shadow-sm">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                          Ouvert
                        </span>
                      </div>
                      
                      {/* Social icons row */}
                      <div className="flex justify-center gap-3 mb-6">
                        {[
                          { icon: Instagram, style: 'border-2 border-foreground/20' },
                          { icon: null, isTiktok: true, style: 'border-2 border-foreground/20' },
                          { icon: Facebook, style: 'border-2 border-foreground/20' },
                          { icon: Mail, style: 'border-2 border-foreground/20' },
                        ].map((item, i) => (
                          <div key={i} className={`w-11 h-11 rounded-full flex items-center justify-center bg-card ${item.style}`}>
                            {item.isTiktok ? (
                              <svg className="w-5 h-5 text-foreground" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                              </svg>
                            ) : item.icon && (
                              <item.icon className="w-5 h-5 text-foreground" />
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {/* Contact info - Simplified */}
                      <div className="space-y-3 mb-6 text-left">
                        <div className="flex items-center gap-3 text-sm text-foreground">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span>06 12 34 56 78</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-primary">
                          <Droplets className="w-4 h-4 text-primary" />
                          <span className="font-medium">Voir nos produits utilisés →</span>
                        </div>
                      </div>
                      
                      {/* Formules section - "Voir toutes" style */}
                      <div className="text-left mb-5">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-base font-semibold text-foreground">Nos formules</h4>
                          <span className="text-xs text-primary font-medium">Voir tout →</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-card border border-border/60 rounded-xl p-4">
                            <p className="text-sm font-semibold text-foreground mb-1">Express</p>
                            <p className="text-lg font-bold text-muted-foreground">35€</p>
                          </div>
                          <div className="bg-card border border-border/60 rounded-xl p-4">
                            <p className="text-sm font-semibold text-foreground mb-1">Complet</p>
                            <p className="text-lg font-bold text-muted-foreground">89€</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* CTA Button */}
                      <button className="w-full bg-neutral-800 dark:bg-neutral-700 text-white py-4 rounded-2xl text-base font-semibold shadow-lg">
                        Réserver maintenant
                      </button>
                    </div>
                  </div>
                </div>

                {/* Floating Elements - Desktop only */}
                
                {/* Colors palette with color picker - Top Left */}
                <div 
                  className="absolute top-12 lg:top-16 left-4 lg:left-12 z-30 animate-float"
                  style={{ animationDelay: '0s' }}
                >
                  <div className="bg-card rounded-2xl p-4 shadow-xl ring-1 ring-border/30 backdrop-blur-sm relative">
                    <p className="text-[10px] text-muted-foreground mb-2 font-medium">Couleurs</p>
                    <div className="flex gap-2">
                      {['bg-emerald-500', 'bg-blue-500', 'bg-violet-500'].map((bg, i) => (
                        <div key={i} className={`w-7 h-7 ${bg} rounded-full ${i === 0 ? 'ring-2 ring-foreground ring-offset-2 ring-offset-card' : ''} shadow-sm`} />
                      ))}
                      {/* Color picker button */}
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 shadow-sm flex items-center justify-center">
                        <Plus className="w-3.5 h-3.5 text-white drop-shadow-md" />
                      </div>
                    </div>
                    {/* Cursor icon */}
                    <div className="absolute -bottom-2 -right-2 animate-pulse">
                      <MousePointer2 className="w-6 h-6 text-foreground drop-shadow-lg" />
                    </div>
                  </div>
                </div>
                
                {/* Calendar / Availability with hours - Top Right */}
                <div 
                  className="absolute top-8 lg:top-12 right-4 lg:right-12 z-30 animate-float"
                  style={{ animationDelay: '0.15s' }}
                >
                  <div className="bg-card rounded-2xl p-4 shadow-xl ring-1 ring-border/30 backdrop-blur-sm">
                    <p className="text-[10px] text-muted-foreground mb-2 font-medium">Disponibilités</p>
                    <div className="space-y-1.5">
                      {[
                        { day: 'Lun', hours: '9h-18h', active: true },
                        { day: 'Mar', hours: '9h-18h', active: true },
                        { day: 'Mer', hours: '14h-18h', active: true },
                        { day: 'Sam', hours: 'Fermé', active: false },
                      ].map((d, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-[9px] w-6 text-muted-foreground">{d.day}</span>
                          <span className={`text-[9px] w-12 ${d.active ? 'text-foreground' : 'text-muted-foreground'}`}>{d.hours}</span>
                          <div className={`w-6 h-3 rounded-full ${d.active ? 'bg-emerald-500' : 'bg-secondary'} relative transition-colors`}>
                            <div className={`absolute w-2 h-2 bg-white rounded-full top-0.5 shadow-sm transition-all ${d.active ? 'right-0.5' : 'left-0.5'}`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Formulas editor - Left Middle */}
                <div 
                  className="absolute top-1/2 -translate-y-1/2 left-0 lg:left-4 z-30 animate-float hidden lg:block"
                  style={{ animationDelay: '0.25s' }}
                >
                  <div className="bg-card rounded-2xl p-4 shadow-xl ring-1 ring-border/30 backdrop-blur-sm w-40">
                    <p className="text-[10px] text-muted-foreground mb-2 font-medium">Formules</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-foreground font-medium">Express</span>
                        <span className="text-primary font-bold">35€</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-foreground font-medium">Complet</span>
                        <span className="text-primary font-bold">89€</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-foreground font-medium">Premium</span>
                        <span className="text-primary font-bold">129€</span>
                      </div>
                      <button className="w-full text-[10px] text-primary font-medium py-1.5 border border-dashed border-primary/40 rounded-lg mt-1 hover:bg-primary/5 transition-colors">
                        + Ajouter
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Text block - Bottom Left */}
                <div 
                  className="absolute bottom-8 lg:bottom-12 left-8 lg:left-16 z-30 animate-float"
                  style={{ animationDelay: '0.4s' }}
                >
                  <div className="bg-card rounded-2xl px-4 py-3 shadow-xl ring-1 ring-border/30 backdrop-blur-sm flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Type className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Texte</p>
                      <p className="text-xs font-medium text-foreground">Ajouter du contenu</p>
                    </div>
                  </div>
                </div>
                
                {/* Images/Gallery - Bottom Right */}
                <div 
                  className="absolute bottom-8 lg:bottom-12 right-8 lg:right-16 z-30 animate-float"
                  style={{ animationDelay: '0.5s' }}
                >
                  <div className="bg-card rounded-2xl p-3 shadow-xl ring-1 ring-border/30 backdrop-blur-sm">
                    <p className="text-[10px] text-muted-foreground mb-2 font-medium">Galerie</p>
                    <div className="flex gap-1.5">
                      <div className="w-10 h-10 bg-secondary rounded-lg overflow-hidden">
                        <img src={mockupCarCleaning} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="w-10 h-10 bg-secondary rounded-lg overflow-hidden">
                        <img src={sofaBanner} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="w-10 h-10 bg-secondary/60 rounded-lg flex items-center justify-center border-2 border-dashed border-border">
                        <Plus className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                </div>
                
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Partagez votre lien - Minimal Apple Style */}
      <section className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 bg-secondary/30">
        <div className="max-w-3xl mx-auto text-center">
          {/* Section Header */}
          <div className="mb-12 sm:mb-16">
            <h2 className="opacity-0 animate-fade-in-up text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground tracking-tight mb-3 sm:mb-4">
              Partagez votre lien de partout.
            </h2>
            <p className="opacity-0 animate-fade-in-up stagger-1 text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
              et convertissez vos visiteurs en réservations.
            </p>
          </div>

          {/* Minimal Visual Composition */}
          <div className="opacity-0 animate-fade-in-up stagger-2 relative">
            {/* Central URL Card */}
            <div className="relative mx-auto max-w-sm">
              <div className="bg-card rounded-2xl p-5 sm:p-6 shadow-2xl ring-1 ring-border/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                    <Link2 className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-sm sm:text-base font-semibold text-foreground truncate">
                      cleaningpage.com/<span className="text-primary">vous</span>
                    </p>
                  </div>
                </div>
                
                {/* Minimal channel icons row */}
                <div className="flex items-center justify-center gap-4">
                  {/* Google */}
                  <div className="w-10 h-10 bg-secondary/60 rounded-xl flex items-center justify-center hover:bg-secondary transition-colors">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </div>
                  {/* Instagram */}
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-xl flex items-center justify-center shadow-md">
                    <Instagram className="w-5 h-5 text-white" />
                  </div>
                  {/* TikTok */}
                  <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-md">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                    </svg>
                  </div>
                  {/* QR */}
                  <div className="w-10 h-10 bg-foreground rounded-xl flex items-center justify-center shadow-md">
                    <svg className="w-5 h-5 text-background" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7" rx="1"/>
                      <rect x="14" y="3" width="7" height="7" rx="1"/>
                      <rect x="3" y="14" width="7" height="7" rx="1"/>
                      <path d="M14 14h3v3h-3zM17 17h4v4h-4zM14 17v4"/>
                    </svg>
                  </div>
                  {/* More */}
                  <div className="w-10 h-10 bg-secondary/60 rounded-xl flex items-center justify-center text-muted-foreground">
                    <span className="text-xs font-medium">+5</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Gérez votre activité */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Label */}
          <div className="flex items-center gap-2 text-muted-foreground mb-4 opacity-0 animate-fade-in-up">
            <Shield className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Gestion</span>
          </div>
          
          <h2 className="opacity-0 animate-fade-in-up stagger-1 text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground tracking-tight mb-4">
            Gérez votre activité
          </h2>
          <p className="opacity-0 animate-fade-in-up stagger-2 text-muted-foreground text-base sm:text-lg mb-8 max-w-2xl leading-relaxed">
            Réservations, calendrier, clients, factures, statistiques... Un tableau de bord complet pour piloter votre activité.
          </p>

          {/* Dashboard Tabs Preview - Interactive */}
          <div className="opacity-0 animate-fade-in-up stagger-3 flex flex-wrap gap-2 sm:gap-3 mb-10 justify-center">
            {[
              { icon: Calendar, label: 'Réservations', tab: 'reservations' as const, badge: '3' },
              { icon: CalendarDays, label: 'Calendrier', tab: 'calendar' as const, badge: null },
              { icon: Users, label: 'Clients', tab: 'clients' as const, badge: null },
              { icon: Star, label: 'Factures', tab: 'invoices' as const, badge: null },
              { icon: BarChart3, label: 'Statistiques', tab: 'stats' as const, badge: null },
              { icon: Globe, label: 'Ma Page', tab: 'mypage' as const, badge: null },
              { icon: Droplets, label: 'Formules', tab: 'formules' as const, badge: null },
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
                <span className="hidden sm:inline">{item.label}</span>
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

              {/* Dashboard Content */}
              <div className="flex min-h-[480px]">
                {/* Sidebar */}
                <div className="w-52 bg-secondary/30 border-r border-border/40 p-4 flex-shrink-0 hidden md:flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <Logo size="md" />
                  </div>
                  <p className="text-xs text-muted-foreground mb-5 truncate">clean-auto-pro</p>

                  {/* Sidebar Groups */}
                  <nav className="flex-1 space-y-4">
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground/70 font-medium mb-1.5 px-2">Activité</p>
                      <div className="space-y-0.5">
                        {[
                          { icon: Calendar, label: 'Réservations', tab: 'reservations' as const, badge: '3' },
                          { icon: CalendarDays, label: 'Calendrier', tab: 'calendar' as const },
                        ].map((item) => (
                          <button
                            key={item.label}
                            onClick={() => setDashboardTab(item.tab)}
                            className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-xs transition-all ${
                              dashboardTab === item.tab 
                                ? 'bg-foreground text-background font-medium' 
                                : 'text-muted-foreground hover:bg-card/50'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <item.icon className="w-3.5 h-3.5" />
                              {item.label}
                            </div>
                            {item.badge && (
                              <span className="bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                                {item.badge}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground/70 font-medium mb-1.5 px-2">Clients</p>
                      <div className="space-y-0.5">
                        {[
                          { icon: Users, label: 'Clients', tab: 'clients' as const },
                          { icon: Star, label: 'Factures & Devis', tab: 'invoices' as const },
                        ].map((item) => (
                          <button
                            key={item.label}
                            onClick={() => setDashboardTab(item.tab)}
                            className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-all ${
                              dashboardTab === item.tab 
                                ? 'bg-foreground text-background font-medium' 
                                : 'text-muted-foreground hover:bg-card/50'
                            }`}
                          >
                            <item.icon className="w-3.5 h-3.5" />
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground/70 font-medium mb-1.5 px-2">Configuration</p>
                      <div className="space-y-0.5">
                        {[
                          { icon: Globe, label: 'Ma Page', tab: 'mypage' as const },
                          { icon: Droplets, label: 'Formules', tab: 'formules' as const },
                        ].map((item) => (
                          <button
                            key={item.label}
                            onClick={() => setDashboardTab(item.tab)}
                            className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-all ${
                              dashboardTab === item.tab 
                                ? 'bg-foreground text-background font-medium' 
                                : 'text-muted-foreground hover:bg-card/50'
                            }`}
                          >
                            <item.icon className="w-3.5 h-3.5" />
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground/70 font-medium mb-1.5 px-2">Insights</p>
                      <div className="space-y-0.5">
                        <button
                          onClick={() => setDashboardTab('stats')}
                          className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-all ${
                            dashboardTab === 'stats' 
                              ? 'bg-foreground text-background font-medium' 
                              : 'text-muted-foreground hover:bg-card/50'
                          }`}
                        >
                          <BarChart3 className="w-3.5 h-3.5" />
                          Statistiques
                        </button>
                      </div>
                    </div>
                  </nav>

                  {/* Link at bottom */}
                  <div className="mt-4 pt-3 border-t border-border/40">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Link2 className="w-3.5 h-3.5" />
                      <span className="text-[10px]">Votre lien</span>
                    </div>
                    <p className="text-[9px] text-muted-foreground mt-1 truncate">cleaningpage.com/clean-auto...</p>
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
                  
                  {/* === RÉSERVATIONS === */}
                  {dashboardTab === 'reservations' && (
                    <>
                      <div className="flex items-center justify-between mb-5">
                        <div>
                          <h3 className="text-base sm:text-lg font-semibold text-foreground">Réservations</h3>
                          <p className="text-[10px] text-muted-foreground">11 février 2026</p>
                        </div>
                        <button className="bg-foreground text-background px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5">
                          <Plus className="w-3 h-3" />
                          Nouveau RDV
                        </button>
                      </div>

                      {/* KPI row */}
                      <div className="grid grid-cols-3 gap-3 mb-5">
                        <div className="bg-card rounded-xl p-3 border border-border/40">
                          <p className="text-[10px] text-muted-foreground mb-1">Aujourd'hui</p>
                          <p className="text-2xl font-bold text-foreground tracking-tight">5</p>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            <p className="text-[9px] text-emerald-600 font-medium">2 à confirmer</p>
                          </div>
                        </div>
                        <div className="bg-card rounded-xl p-3 border border-border/40">
                          <p className="text-[10px] text-muted-foreground mb-1">Cette semaine</p>
                          <p className="text-2xl font-bold text-foreground tracking-tight">23</p>
                          <p className="text-[9px] text-muted-foreground mt-1">dont 4 demandes</p>
                        </div>
                        <div className="bg-card rounded-xl p-3 border border-border/40">
                          <p className="text-[10px] text-muted-foreground mb-1">CA du jour</p>
                          <p className="text-2xl font-bold text-foreground tracking-tight">340€</p>
                          <p className="text-[9px] text-emerald-600 font-medium mt-1">↑ 15% vs mardi dernier</p>
                        </div>
                      </div>

                      {/* Tabs filter */}
                      <div className="flex gap-1 bg-secondary/30 rounded-lg p-0.5 mb-4 w-fit">
                        <span className="text-[10px] font-medium bg-background shadow-sm px-3 py-1 rounded-md">Prochains</span>
                        <span className="text-[10px] font-medium text-muted-foreground px-3 py-1 rounded-md cursor-pointer">Demandes</span>
                        <span className="text-[10px] font-medium text-muted-foreground px-3 py-1 rounded-md cursor-pointer">Passés</span>
                      </div>

                      <div className="space-y-2">
                        {[
                          { name: 'Jean Martin', service: 'Nettoyage Complet', time: '10:00', duration: '1h30', price: '89€', status: 'Confirmé', statusColor: 'emerald', avatar: 'JM' },
                          { name: 'Marie Dupont', service: 'Express', time: '11:30', duration: '45min', price: '35€', status: 'En attente', statusColor: 'amber', avatar: 'MD' },
                          { name: 'Pierre Bernard', service: 'Rénovation Premium', time: '14:00', duration: '3h', price: '159€', status: 'Confirmé', statusColor: 'emerald', avatar: 'PB' },
                          { name: 'Demande entrante', service: 'Nettoyage canapé', time: '—', duration: '—', price: 'Sur devis', status: 'Demande', statusColor: 'blue', avatar: '?' },
                          { name: 'Sophie Leroy', service: 'Pack Intérieur', time: '16:30', duration: '1h', price: '65€', status: 'Confirmé', statusColor: 'emerald', avatar: 'SL' },
                        ].map((booking, i) => (
                          <div key={i} className={`flex items-center gap-3 rounded-xl p-3 transition-colors cursor-pointer ${
                            booking.statusColor === 'blue' ? 'bg-blue-50/50 border border-blue-100' : 'bg-card border border-border/30 hover:border-border/60'
                          }`}>
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0 ${
                              booking.statusColor === 'blue' ? 'bg-blue-100 text-blue-700' : 'bg-secondary text-foreground'
                            }`}>
                              {booking.avatar}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-foreground truncate">{booking.name}</p>
                              </div>
                              <p className="text-[10px] text-muted-foreground">{booking.service} · {booking.time} · {booking.duration}</p>
                            </div>
                            <span className="text-sm font-semibold text-foreground hidden sm:block">{booking.price}</span>
                            <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${
                              booking.statusColor === 'emerald' ? 'bg-emerald-50 text-emerald-700' : 
                              booking.statusColor === 'amber' ? 'bg-amber-50 text-amber-700' :
                              'bg-blue-50 text-blue-700'
                            }`}>
                              {booking.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* === CALENDRIER === */}
                  {dashboardTab === 'calendar' && (
                    <div className="flex gap-5 h-full">
                      {/* Left: Calendar Grid */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <button className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center">
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <h3 className="text-sm sm:text-base font-semibold text-foreground min-w-[120px] text-center capitalize">Février 2026</h3>
                            <button className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center">
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                          <span className="text-[10px] text-primary font-medium cursor-pointer">Aujourd'hui</span>
                        </div>

                        <div className="grid grid-cols-7 gap-0.5 mb-1">
                          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                            <div key={i} className="text-center text-[10px] font-medium text-muted-foreground py-1">{d}</div>
                          ))}
                        </div>
                        <div className="grid grid-cols-7 gap-0.5">
                          {/* Jan overflow */}
                          {[26, 27, 28, 29, 30, 31].map((d, i) => (
                            <div key={`prev-${i}`} className="aspect-square rounded-lg flex flex-col items-center justify-start pt-1.5 text-[11px] opacity-25">
                              <span>{d}</span>
                            </div>
                          ))}
                          {/* Feb days */}
                          {Array.from({ length: 28 }, (_, i) => i + 1).map(d => {
                            const hasAppointments = [3, 5, 8, 11, 12, 15, 18, 22, 25].includes(d);
                            const isSelected = d === 11;
                            const count = d === 11 ? 3 : d === 15 ? 2 : d === 22 ? 4 : 1;
                            return (
                              <div key={d} className={`aspect-square rounded-lg flex flex-col items-center justify-start pt-1.5 text-[11px] relative cursor-pointer transition-all ${
                                isSelected ? 'bg-foreground text-background font-semibold ring-0' : 'hover:bg-secondary/50'
                              }`}>
                                <span>{d}</span>
                                {hasAppointments && (
                                  <div className="flex gap-px mt-0.5">
                                    {Array.from({ length: Math.min(count, 3) }).map((_, j) => (
                                      <div key={j} className={`w-1 h-1 rounded-full ${
                                        isSelected ? 'bg-background/70' :
                                        j === 0 ? 'bg-emerald-500' : j === 1 ? 'bg-amber-400' : 'bg-blue-400'
                                      }`} />
                                    ))}
                                    {count > 3 && <span className={`text-[6px] ml-px ${isSelected ? 'text-background/70' : 'text-muted-foreground'}`}>+</span>}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Legend */}
                        <div className="flex gap-4 mt-3 pt-3 border-t border-border/40">
                          {[
                            { color: 'bg-emerald-500', label: 'Confirmé' },
                            { color: 'bg-amber-400', label: 'Attente' },
                            { color: 'bg-blue-400', label: 'Terminé' },
                          ].map(l => (
                            <div key={l.label} className="flex items-center gap-1.5">
                              <div className={`w-1.5 h-1.5 rounded-full ${l.color}`} />
                              <span className="text-[9px] text-muted-foreground">{l.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right: Selected Day Detail */}
                      <div className="w-44 hidden lg:flex flex-col border-l border-border/40 pl-4">
                        <p className="text-xs font-semibold text-foreground mb-1">Mer. 11 février</p>
                        <p className="text-[10px] text-muted-foreground mb-3">3 rendez-vous</p>
                        <div className="space-y-2 flex-1">
                          {[
                            { time: '10:00', name: 'Jean M.', service: 'Complet', color: 'emerald' },
                            { time: '11:30', name: 'Marie D.', service: 'Express', color: 'amber' },
                            { time: '14:00', name: 'Pierre B.', service: 'Rénovation', color: 'emerald' },
                          ].map((rdv, i) => (
                            <div key={i} className="flex gap-2 items-start">
                              <div className={`w-0.5 h-full min-h-[32px] rounded-full ${rdv.color === 'emerald' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                              <div>
                                <p className="text-[10px] font-medium text-foreground">{rdv.time} — {rdv.name}</p>
                                <p className="text-[9px] text-muted-foreground">{rdv.service}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* === CLIENTS === */}
                  {dashboardTab === 'clients' && (
                    <>
                      <div className="flex items-center justify-between mb-5">
                        <div>
                          <h3 className="text-base sm:text-lg font-semibold text-foreground">Clients</h3>
                          <p className="text-[10px] text-muted-foreground">142 clients enregistrés</p>
                        </div>
                        <button className="bg-foreground text-background px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5">
                          <Plus className="w-3 h-3" />
                          Nouveau
                        </button>
                      </div>

                      {/* Search */}
                      <div className="relative mb-4">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                        <div className="bg-card rounded-xl pl-9 pr-3 py-2.5 text-xs text-muted-foreground border border-border/40">
                          Rechercher par nom, téléphone ou email...
                        </div>
                      </div>

                      {/* Client cards - Apple style */}
                      <div className="space-y-2">
                        {[
                          { name: 'Jean Martin', phone: '06 12 34 56 78', email: 'jean.martin@email.com', rdvCount: 12, lastVisit: '10 fév', service: 'Nettoyage Complet', totalSpent: '1 068€', source: 'booking', initials: 'JM', color: 'bg-blue-100 text-blue-700' },
                          { name: 'Marie Dupont', phone: '07 98 76 54 32', email: 'marie@email.com', rdvCount: 8, lastVisit: '8 fév', service: 'Express', totalSpent: '520€', source: 'booking', initials: 'MD', color: 'bg-rose-100 text-rose-700' },
                          { name: 'Pierre Bernard', phone: '06 55 44 33 22', email: null, rdvCount: 3, lastVisit: '2 fév', service: 'Rénovation', totalSpent: '477€', source: 'manual', initials: 'PB', color: 'bg-amber-100 text-amber-700' },
                          { name: 'Sophie Leroy', phone: '06 11 22 33 44', email: 'sophie@mail.fr', rdvCount: 15, lastVisit: '11 fév', service: 'Pack Intérieur', totalSpent: '1 420€', source: 'booking', initials: 'SL', color: 'bg-violet-100 text-violet-700' },
                        ].map((client, i) => (
                          <div key={i} className="flex items-center gap-3 bg-card rounded-xl p-3 border border-border/30 hover:border-border/60 transition-all cursor-pointer group">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0 ${client.color}`}>
                              {client.initials}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-foreground truncate">{client.name}</p>
                                <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-medium ${
                                  client.source === 'booking' ? 'bg-blue-50 text-blue-600' : 'bg-secondary text-muted-foreground'
                                }`}>{client.source === 'booking' ? 'Résa' : 'Manuel'}</span>
                              </div>
                              <div className="flex gap-3 text-[10px] text-muted-foreground mt-0.5">
                                <span>{client.rdvCount} RDV</span>
                                <span>·</span>
                                <span>Dernier : {client.lastVisit}</span>
                                <span className="hidden sm:inline">·</span>
                                <span className="hidden sm:inline text-emerald-600 font-medium">{client.totalSpent}</span>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-foreground transition-colors shrink-0" />
                          </div>
                        ))}
                      </div>

                      {/* Client detail peek - shows what clicking does */}
                      <div className="mt-4 bg-card rounded-xl border border-border/30 p-4">
                        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-border/30">
                          <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold">JM</div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">Jean Martin</p>
                            <p className="text-[10px] text-muted-foreground">Client depuis mars 2025 · 12 rendez-vous</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="text-center">
                            <p className="text-lg font-bold text-foreground">12</p>
                            <p className="text-[9px] text-muted-foreground">RDV total</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-foreground">1 068€</p>
                            <p className="text-[9px] text-muted-foreground">CA généré</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-foreground">89€</p>
                            <p className="text-[9px] text-muted-foreground">Panier moy.</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* === FACTURES & DEVIS === */}
                  {dashboardTab === 'invoices' && (
                    <>
                      <div className="flex items-center justify-between mb-5">
                        <div>
                          <h3 className="text-base sm:text-lg font-semibold text-foreground">Factures & Devis</h3>
                          <p className="text-[10px] text-muted-foreground">Gérez vos documents comptables</p>
                        </div>
                        <div className="flex gap-2">
                          <button className="bg-card border border-border/40 text-foreground px-3 py-1.5 rounded-lg text-xs font-medium">Devis</button>
                          <button className="bg-foreground text-background px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5">
                            <Plus className="w-3 h-3" />
                            Facture
                          </button>
                        </div>
                      </div>

                      {/* KPIs */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                        <div className="bg-card rounded-xl p-3 border border-border/40">
                          <p className="text-[10px] text-muted-foreground mb-1">Factures</p>
                          <p className="text-2xl font-bold text-foreground tracking-tight">24</p>
                        </div>
                        <div className="bg-card rounded-xl p-3 border border-border/40">
                          <p className="text-[10px] text-muted-foreground mb-1">Devis</p>
                          <p className="text-2xl font-bold text-foreground tracking-tight">8</p>
                        </div>
                        <div className="bg-card rounded-xl p-3 border border-border/40">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-[10px] text-muted-foreground">En attente</p>
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                          </div>
                          <p className="text-2xl font-bold text-amber-600 tracking-tight">680€</p>
                        </div>
                        <div className="bg-card rounded-xl p-3 border border-border/40">
                          <p className="text-[10px] text-muted-foreground mb-1">Encaissé</p>
                          <p className="text-2xl font-bold text-emerald-600 tracking-tight">3 240€</p>
                        </div>
                      </div>

                      {/* Tabs */}
                      <div className="flex gap-1 bg-secondary/30 rounded-lg p-0.5 mb-4 w-fit">
                        <span className="text-[10px] font-medium bg-background shadow-sm px-3 py-1 rounded-md">Tout</span>
                        <span className="text-[10px] font-medium text-muted-foreground px-3 py-1 rounded-md cursor-pointer">Factures</span>
                        <span className="text-[10px] font-medium text-muted-foreground px-3 py-1 rounded-md cursor-pointer">Devis</span>
                      </div>

                      {/* Invoice list - Apple style table */}
                      <div className="bg-card rounded-xl border border-border/30 overflow-hidden">
                        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 px-3 py-2 border-b border-border/30 text-[9px] uppercase tracking-wider text-muted-foreground font-medium">
                          <span>Document</span>
                          <span className="hidden sm:block">Date</span>
                          <span>Montant</span>
                          <span>Statut</span>
                        </div>
                        {[
                          { number: 'FAC-2026-012', client: 'Jean Martin', date: '10 fév 2026', total: '89,00 €', status: 'Payé', type: 'invoice' },
                          { number: 'FAC-2026-011', client: 'Marie Dupont', date: '8 fév 2026', total: '159,00 €', status: 'Envoyé', type: 'invoice' },
                          { number: 'DEV-2026-005', client: 'Pierre Bernard', date: '5 fév 2026', total: '320,00 €', status: 'En attente', type: 'quote' },
                          { number: 'FAC-2026-010', client: 'Sophie Leroy', date: '3 fév 2026', total: '65,00 €', status: 'Payé', type: 'invoice' },
                        ].map((inv, i) => (
                          <div key={i} className="grid grid-cols-[1fr_auto_auto_auto] gap-3 px-3 py-2.5 border-b border-border/20 last:border-0 hover:bg-secondary/20 transition-colors cursor-pointer items-center">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${
                                  inv.type === 'invoice' ? 'bg-blue-50 text-blue-600' : 'bg-violet-50 text-violet-600'
                                }`}>{inv.type === 'invoice' ? 'FAC' : 'DEV'}</span>
                                <span className="text-xs font-medium text-foreground">{inv.number}</span>
                              </div>
                              <p className="text-[10px] text-muted-foreground mt-0.5">{inv.client}</p>
                            </div>
                            <span className="text-[10px] text-muted-foreground hidden sm:block">{inv.date}</span>
                            <span className="text-xs font-semibold text-foreground tabular-nums">{inv.total}</span>
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${
                              inv.status === 'Payé' ? 'bg-emerald-50 text-emerald-700' :
                              inv.status === 'Envoyé' ? 'bg-blue-50 text-blue-700' :
                              'bg-amber-50 text-amber-700'
                            }`}>{inv.status}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* === STATISTIQUES === */}
                  {dashboardTab === 'stats' && (
                    <>
                      <div className="flex items-center justify-between mb-5">
                        <div>
                          <h3 className="text-base sm:text-lg font-semibold text-foreground">Statistiques</h3>
                          <p className="text-[10px] text-muted-foreground">Vue d'ensemble de votre activité</p>
                        </div>
                        <div className="flex gap-1 bg-secondary/30 rounded-lg p-0.5">
                          <span className="text-[10px] font-medium text-muted-foreground px-2.5 py-1 rounded-md cursor-pointer">Semaine</span>
                          <span className="text-[10px] font-medium bg-background shadow-sm px-2.5 py-1 rounded-md">Mois</span>
                          <span className="text-[10px] font-medium text-muted-foreground px-2.5 py-1 rounded-md cursor-pointer">Année</span>
                        </div>
                      </div>

                      {/* KPIs */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                        {[
                          { value: '4 850€', label: 'Chiffre d\'affaires', change: '+18%', icon: '↑' },
                          { value: '127', label: 'Réservations', change: '+12%', icon: '↑' },
                          { value: '89', label: 'Clients actifs', change: '+5', icon: '↑' },
                          { value: '54€', label: 'Panier moyen', change: '+3€', icon: '↑' },
                        ].map((stat, i) => (
                          <div key={i} className="bg-card rounded-xl p-3 border border-border/40">
                            <p className="text-[10px] text-muted-foreground mb-1">{stat.label}</p>
                            <p className="text-xl font-bold text-foreground tracking-tight">{stat.value}</p>
                            <p className="text-[9px] text-emerald-600 font-medium mt-1">{stat.icon} {stat.change}</p>
                          </div>
                        ))}
                      </div>

                      {/* Revenue Chart - SVG line chart for Apple feel */}
                      <div className="bg-card rounded-xl p-4 mb-4 border border-border/40">
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-xs font-semibold text-foreground">Chiffre d'affaires</p>
                          <p className="text-xs text-muted-foreground">6 derniers mois</p>
                        </div>
                        <div className="relative h-32">
                          <svg viewBox="0 0 300 100" className="w-full h-full" preserveAspectRatio="none">
                            <defs>
                              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="hsl(var(--foreground))" stopOpacity="0.15" />
                                <stop offset="100%" stopColor="hsl(var(--foreground))" stopOpacity="0" />
                              </linearGradient>
                            </defs>
                            {/* Grid lines */}
                            {[20, 40, 60, 80].map(y => (
                              <line key={y} x1="0" y1={y} x2="300" y2={y} stroke="hsl(var(--border))" strokeWidth="0.5" strokeDasharray="4 4" />
                            ))}
                            {/* Area fill */}
                            <path d="M0,75 L50,60 L100,65 L150,50 L200,35 L250,22 L300,15 L300,100 L0,100 Z" fill="url(#chartGrad)" />
                            {/* Line */}
                            <path d="M0,75 L50,60 L100,65 L150,50 L200,35 L250,22 L300,15" fill="none" stroke="hsl(var(--foreground))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            {/* Dots */}
                            {[[0,75],[50,60],[100,65],[150,50],[200,35],[250,22],[300,15]].map(([x,y], i) => (
                              <circle key={i} cx={x} cy={y} r={i === 6 ? 4 : 2.5} fill="hsl(var(--background))" stroke="hsl(var(--foreground))" strokeWidth="1.5" />
                            ))}
                          </svg>
                          {/* X-axis labels */}
                          <div className="flex justify-between mt-2">
                            {['Sept', 'Oct', 'Nov', 'Déc', 'Jan', 'Fév'].map(m => (
                              <span key={m} className="text-[9px] text-muted-foreground">{m}</span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Bottom row: Service distribution + top clients */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-card rounded-xl p-4 border border-border/40">
                          <p className="text-xs font-semibold text-foreground mb-3">Répartition services</p>
                          <div className="space-y-2.5">
                            {[
                              { name: 'Nettoyage Complet', pct: 38, amount: '1 843€', color: 'bg-foreground' },
                              { name: 'Express', pct: 28, amount: '1 358€', color: 'bg-foreground/60' },
                              { name: 'Rénovation', pct: 20, amount: '970€', color: 'bg-foreground/40' },
                              { name: 'Prestations perso', pct: 14, amount: '679€', color: 'bg-foreground/20' },
                            ].map((s, i) => (
                              <div key={i}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[10px] text-foreground font-medium">{s.name}</span>
                                  <span className="text-[10px] text-muted-foreground">{s.pct}% · {s.amount}</span>
                                </div>
                                <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                                  <div className={`h-full ${s.color} rounded-full transition-all`} style={{ width: `${s.pct}%` }} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="bg-card rounded-xl p-4 border border-border/40">
                          <p className="text-xs font-semibold text-foreground mb-3">Top clients</p>
                          <div className="space-y-2.5">
                            {[
                              { name: 'Sophie Leroy', visits: 15, total: '1 420€' },
                              { name: 'Jean Martin', visits: 12, total: '1 068€' },
                              { name: 'Marie Dupont', visits: 8, total: '520€' },
                            ].map((c, i) => (
                              <div key={i} className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-muted-foreground w-4">{i + 1}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[11px] font-medium text-foreground truncate">{c.name}</p>
                                  <p className="text-[9px] text-muted-foreground">{c.visits} visites</p>
                                </div>
                                <span className="text-[11px] font-semibold text-foreground">{c.total}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* === MA PAGE === */}
                  {dashboardTab === 'mypage' && (
                    <div className="h-full flex flex-col">
                      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        {/* Left: Live Preview */}
                        <div className="flex flex-col min-h-[300px] sm:min-h-[380px] order-2 lg:order-1">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs sm:text-sm font-medium text-foreground">Aperçu en direct</span>
                            <div className="flex items-center gap-1.5">
                              <div className="w-6 h-6 bg-foreground rounded-md flex items-center justify-center">
                                <Phone className="w-3 h-3 text-background" />
                              </div>
                              <div className="w-6 h-6 bg-secondary rounded-md flex items-center justify-center">
                                <svg className="w-3 h-3 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <rect x="2" y="3" width="20" height="14" rx="2" />
                                  <path d="M8 21h8" /><path d="M12 17v4" />
                                </svg>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex-1 bg-secondary/20 rounded-2xl overflow-hidden border border-border/30">
                            <div className="bg-card h-full overflow-y-auto">
                              <div className="h-28 relative">
                                <img src={mockupBanner} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute left-1/2 -translate-x-1/2 -bottom-7">
                                  <div className="w-16 h-16 rounded-2xl shadow-lg ring-4 ring-card overflow-hidden">
                                    <img src={gocleanLogo} alt="" className="w-full h-full object-cover" />
                                  </div>
                                </div>
                              </div>
                              <div className="px-4 pt-10 pb-4">
                                <h3 className="text-sm font-bold text-foreground text-center mb-0.5">GOCLEANING</h3>
                                <p className="text-[9px] text-muted-foreground text-center mb-2">Nettoyage automobile premium à domicile</p>
                                <div className="flex justify-center mb-3">
                                  <span className="inline-flex items-center gap-1 text-[8px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-medium">
                                    <span className="w-1 h-1 bg-emerald-500 rounded-full" />Ouvert
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 gap-1.5 mb-3">
                                  <div className="bg-secondary/30 rounded-lg p-2 text-left border border-border/20">
                                    <p className="text-[9px] font-medium">Express</p>
                                    <p className="text-[11px] font-bold text-muted-foreground">35€</p>
                                  </div>
                                  <div className="bg-secondary/30 rounded-lg p-2 text-left border border-border/20">
                                    <p className="text-[9px] font-medium">Complet</p>
                                    <p className="text-[11px] font-bold text-muted-foreground">89€</p>
                                  </div>
                                </div>
                                <button className="w-full bg-neutral-800 text-white py-2 rounded-xl text-[10px] font-semibold">Réserver</button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right: Customization controls */}
                        <div className="flex flex-col order-1 lg:order-2">
                          <span className="text-xs sm:text-sm font-medium text-foreground mb-3">Personnalisation</span>
                          <div className="bg-card rounded-xl border border-border/40 flex-1 overflow-hidden">
                            <div className="flex items-center justify-around border-b border-border/40 py-2 px-2">
                              {[
                                { id: 'design', icon: Palette, label: 'Design' },
                                { id: 'formules', icon: Tag, label: 'Formules' },
                                { id: 'elements', icon: Plus, label: 'Éléments' },
                                { id: 'seo', icon: Globe, label: 'SEO' },
                              ].map(tab => (
                                <div key={tab.id} onClick={() => setMockupTab(tab.id as any)}
                                  className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl cursor-pointer transition-colors ${mockupTab === tab.id ? 'bg-secondary/50 text-foreground' : 'text-muted-foreground hover:text-foreground/70'}`}
                                >
                                  <tab.icon className="w-4 h-4" />
                                  <span className="text-[9px] font-medium">{tab.label}</span>
                                </div>
                              ))}
                            </div>
                            <div className="p-3 space-y-3 overflow-y-auto max-h-[280px]">
                              {mockupTab === 'design' && (
                                <>
                                  <div>
                                    <p className="text-[10px] font-medium text-foreground mb-2">Bannière</p>
                                    <div className="rounded-lg overflow-hidden mb-2">
                                      <img src={mockupBanner} alt="Banner" className="w-full h-16 object-cover" />
                                    </div>
                                    <button className="text-[10px] font-medium text-foreground bg-secondary/50 px-3 py-1.5 rounded-full border border-border/40">Changer</button>
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-medium text-foreground mb-2">Couleur principale</p>
                                    <div className="grid grid-cols-6 gap-2">
                                      {[
                                        { c: '#3B82F6' }, { c: '#EF4444' }, { c: '#10B981', selected: true },
                                        { c: '#8B5CF6' }, { c: '#F97316' }, { c: '#EC4899' },
                                      ].map((color, i) => (
                                        <div key={i} className={`w-7 h-7 rounded-full cursor-pointer ring-offset-2 ring-offset-background transition-all ${color.selected ? 'ring-2 ring-foreground scale-110' : 'hover:scale-105'}`}
                                          style={{ backgroundColor: color.c }} />
                                      ))}
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-medium text-foreground mb-2">Mise en page</p>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div className="bg-secondary/30 rounded-lg p-2 border-2 border-foreground text-center">
                                        <p className="text-[9px] font-medium">Bannière</p>
                                      </div>
                                      <div className="bg-secondary/30 rounded-lg p-2 border border-border/40 text-center cursor-pointer">
                                        <p className="text-[9px] font-medium text-muted-foreground">Minimal</p>
                                      </div>
                                    </div>
                                  </div>
                                </>
                              )}
                              {mockupTab === 'formules' && (
                                <div className="space-y-2">
                                  <p className="text-[10px] text-muted-foreground">Formules visibles sur votre page</p>
                                  {['Lavage Express · 35€', 'Nettoyage Complet · 89€', 'Rénovation Premium · 159€'].map((f, i) => (
                                    <div key={i} className="flex items-center justify-between bg-secondary/40 rounded-lg p-2.5 border border-border/30">
                                      <span className="text-[10px] font-medium text-foreground">{f}</span>
                                      <div className={`w-7 h-4 rounded-full relative ${i < 2 ? 'bg-emerald-500' : 'bg-secondary border border-border/40'}`}>
                                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm ${i < 2 ? 'right-0.5' : 'left-0.5'}`} />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {mockupTab === 'elements' && (
                                <div className="space-y-2">
                                  <p className="text-[10px] text-muted-foreground">Éléments de votre page</p>
                                  {['Instagram', 'Téléphone', 'Horaires', 'Adresse', 'Galerie'].map((el, i) => (
                                    <div key={i} className="flex items-center gap-2 bg-secondary/30 rounded-lg p-2 border border-border/30">
                                      <span className="text-[9px] font-medium text-foreground flex-1">{el}</span>
                                      <div className="w-6 h-3 bg-emerald-500 rounded-full relative">
                                        <div className="absolute right-0.5 top-0.5 w-2 h-2 bg-white rounded-full" />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {mockupTab === 'seo' && (
                                <div className="space-y-3">
                                  <p className="text-[10px] text-muted-foreground">Référencement Google</p>
                                  <div>
                                    <p className="text-[9px] text-muted-foreground mb-1">Titre</p>
                                    <div className="bg-secondary/30 rounded-lg px-2.5 py-1.5 border border-border/40 text-[10px] text-foreground">GOCLEANING - Nettoyage Auto Paris</div>
                                  </div>
                                  <div>
                                    <p className="text-[9px] text-muted-foreground mb-1">Description</p>
                                    <div className="bg-secondary/30 rounded-lg px-2.5 py-1.5 border border-border/40 text-[10px] text-foreground">Service de nettoyage automobile premium à domicile, 7j/7.</div>
                                  </div>
                                  {/* Google preview */}
                                  <div className="bg-secondary/20 rounded-lg p-3 border border-border/30">
                                    <p className="text-[9px] text-muted-foreground mb-1.5">Aperçu Google</p>
                                    <p className="text-[11px] text-blue-700 font-medium">GOCLEANING - Nettoyage Auto Paris</p>
                                    <p className="text-[9px] text-emerald-700">cleaningpage.com/gocleaning</p>
                                    <p className="text-[9px] text-muted-foreground">Service de nettoyage automobile premium à domicile, 7j/7.</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* === FORMULES === */}
                  {dashboardTab === 'formules' && (
                    <>
                      <div className="flex items-center justify-between mb-5">
                        <div>
                          <h3 className="text-base sm:text-lg font-semibold text-foreground">Formules & Prestations</h3>
                          <p className="text-[10px] text-muted-foreground">Gérez vos offres et tarifs</p>
                        </div>
                        <button className="bg-foreground text-background px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5">
                          <Plus className="w-3 h-3" />
                          Ajouter
                        </button>
                      </div>

                      <p className="text-xs font-semibold text-foreground mb-2">Formules</p>
                      <div className="space-y-2 mb-5">
                        {[
                          { name: 'Lavage Express', desc: 'Extérieur uniquement · 45min', price: '35€', active: true },
                          { name: 'Nettoyage Complet', desc: 'Intérieur + extérieur · 1h30', price: '89€', active: true },
                          { name: 'Rénovation Premium', desc: 'Polish + céramique · 3h', price: '159€', active: true },
                        ].map((pack, i) => (
                          <div key={i} className="flex items-center gap-3 bg-card rounded-xl p-3 border border-border/30 hover:border-border/60 transition-all cursor-pointer group">
                            <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center shrink-0">
                              <Car className="w-4 h-4 text-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground">{pack.name}</p>
                              <p className="text-[10px] text-muted-foreground">{pack.desc}</p>
                            </div>
                            <span className="text-sm font-bold text-foreground">{pack.price}</span>
                            <div className="w-7 h-4 bg-emerald-500 rounded-full relative shrink-0">
                              <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full shadow-sm" />
                            </div>
                          </div>
                        ))}
                      </div>

                      <p className="text-xs font-semibold text-foreground mb-2">Prestations personnalisées</p>
                      <p className="text-[10px] text-muted-foreground mb-2">Tarifs sur mesure, liés à vos clients</p>
                      <div className="space-y-2">
                        {[
                          { name: 'Nettoyage canapé 3 places', client: 'Pour : Marie Dupont', duration: '2h', price: '120€' },
                          { name: 'Détachage moquette salon', client: 'Pour : Pierre Bernard', duration: '1h30', price: '80€' },
                        ].map((service, i) => (
                          <div key={i} className="flex items-center gap-3 bg-card rounded-xl p-3 border border-border/30 hover:border-border/60 transition-all cursor-pointer group">
                            <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center shrink-0">
                              <Users className="w-4 h-4 text-violet-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground">{service.name}</p>
                              <p className="text-[10px] text-muted-foreground">{service.client} · {service.duration}</p>
                            </div>
                            <span className="text-sm font-bold text-foreground">{service.price}</span>
                            <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-foreground transition-colors shrink-0" />
                          </div>
                        ))}
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
