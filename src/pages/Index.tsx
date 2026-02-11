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

      {/* Section 3: Gérez votre activité — Widget Grid */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="opacity-0 animate-fade-in-up text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground tracking-tight mb-3 sm:mb-4">
              Tout pour gérer votre activité.
            </h2>
            <p className="opacity-0 animate-fade-in-up stagger-1 text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">
              Un tableau de bord complet avec tout ce dont vous avez besoin, accessible en un clic.
            </p>
          </div>

          <div className="opacity-0 animate-fade-in-up stagger-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">

            {/* Widget 1: Réservations */}
            <div className="bg-card rounded-2xl p-5 sm:p-6 border border-border/40 hover:shadow-xl hover:border-border/60 transition-all duration-300 group cursor-pointer">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Réservations</h3>
                  <p className="text-[11px] text-muted-foreground">Gérez vos rendez-vous</p>
                </div>
              </div>
              {/* Mini visual */}
              <div className="space-y-2">
                {[
                  { name: 'Jean M.', time: '10:00', service: 'Complet', status: 'Confirmé', statusColor: 'bg-emerald-500', avatarBg: 'bg-blue-500' },
                  { name: 'Marie D.', time: '11:30', service: 'Express', status: 'En attente', statusColor: 'bg-orange-400', avatarBg: 'bg-pink-500' },
                  { name: 'Pierre B.', time: '14:00', service: 'Premium', status: 'Confirmé', statusColor: 'bg-emerald-500', avatarBg: 'bg-amber-500' },
                ].map((r, i) => (
                  <div key={i} className="flex items-center gap-2.5 bg-secondary/30 rounded-xl p-2.5 border border-border/10">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0 ${r.avatarBg}`}>
                      {r.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-foreground truncate">{r.name}</p>
                      <p className="text-[9px] text-muted-foreground">{r.time} · {r.service}</p>
                    </div>
                    <span className={`text-[8px] px-2 py-0.5 rounded-full font-semibold text-white ${r.statusColor}`}>{r.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Widget 2: Calendrier */}
            <div className="bg-card rounded-2xl p-5 sm:p-6 border border-border/40 hover:shadow-xl hover:border-border/60 transition-all duration-300 group cursor-pointer">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-500/10 rounded-2xl flex items-center justify-center">
                  <CalendarDays className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Calendrier</h3>
                  <p className="text-[11px] text-muted-foreground">Planifiez votre semaine</p>
                </div>
              </div>
              {/* Mini calendar grid */}
              <div className="bg-secondary/20 rounded-xl p-3 border border-border/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold text-foreground">Février 2026</span>
                  <div className="flex gap-1">
                    <ChevronLeft className="w-3 h-3 text-muted-foreground" />
                    <ChevronRight className="w-3 h-3 text-muted-foreground" />
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-0.5 mb-1">
                  {['L','M','M','J','V','S','D'].map((d,i) => (
                    <div key={i} className="text-center text-[7px] font-semibold text-muted-foreground py-0.5">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-0.5">
                  {[26,27,28,29,30,31].map(d => (
                    <div key={`p${d}`} className="aspect-square rounded-lg flex items-center justify-center text-[8px] text-muted-foreground/20">{d}</div>
                  ))}
                  {Array.from({length: 28}, (_, i) => i + 1).map(d => {
                    const hasAppt = [3,5,8,11,15,22].includes(d);
                    const isToday = d === 11;
                    return (
                      <div key={d} className={`aspect-square rounded-lg flex flex-col items-center justify-center text-[8px] relative ${
                        isToday ? 'bg-blue-500 text-white font-bold' : 'text-foreground'
                      }`}>
                        {d}
                        {hasAppt && !isToday && <div className="w-1 h-1 bg-blue-500 rounded-full mt-0.5" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Widget 3: Clients (CRM) */}
            <div className="bg-card rounded-2xl p-5 sm:p-6 border border-border/40 hover:shadow-xl hover:border-border/60 transition-all duration-300 group cursor-pointer">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-violet-500/10 rounded-2xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-violet-500" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Fichier clients</h3>
                  <p className="text-[11px] text-muted-foreground">Historique et suivi</p>
                </div>
              </div>
              {/* Mini client list */}
              <div className="space-y-2">
                {[
                  { name: 'Sophie Leroy', visits: '15 visites', spent: '1 420€', initials: 'SL', bg: 'bg-violet-500' },
                  { name: 'Jean Martin', visits: '12 visites', spent: '1 068€', initials: 'JM', bg: 'bg-blue-500' },
                  { name: 'Marie Dupont', visits: '8 visites', spent: '520€', initials: 'MD', bg: 'bg-pink-500' },
                ].map((c, i) => (
                  <div key={i} className="flex items-center gap-2.5 bg-secondary/30 rounded-xl p-2.5 border border-border/10">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0 ${c.bg}`}>
                      {c.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-foreground truncate">{c.name}</p>
                      <p className="text-[9px] text-muted-foreground">{c.visits}</p>
                    </div>
                    <span className="text-[10px] font-bold text-foreground tabular-nums">{c.spent}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Widget 4: Factures & Devis */}
            <div className="bg-card rounded-2xl p-5 sm:p-6 border border-border/40 hover:shadow-xl hover:border-border/60 transition-all duration-300 group cursor-pointer">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Factures & Devis</h3>
                  <p className="text-[11px] text-muted-foreground">Créez en quelques clics</p>
                </div>
              </div>
              {/* Mini invoice list */}
              <div className="space-y-2">
                {[
                  { num: 'FAC-012', client: 'Jean Martin', amount: '89€', status: 'Payé', color: 'bg-emerald-500' },
                  { num: 'FAC-011', client: 'Marie Dupont', amount: '159€', status: 'Envoyé', color: 'bg-blue-500' },
                  { num: 'DEV-005', client: 'Pierre B.', amount: '320€', status: 'Brouillon', color: 'bg-orange-400' },
                ].map((inv, i) => (
                  <div key={i} className="flex items-center gap-2.5 bg-secondary/30 rounded-xl p-2.5 border border-border/10">
                    <div className={`w-1.5 h-7 rounded-full shrink-0 ${inv.color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-foreground">{inv.num}</p>
                      <p className="text-[9px] text-muted-foreground">{inv.client}</p>
                    </div>
                    <span className="text-[10px] font-bold text-foreground tabular-nums">{inv.amount}</span>
                    <span className={`text-[8px] px-2 py-0.5 rounded-full font-semibold text-white ${inv.color}`}>{inv.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Widget 5: Statistiques */}
            <div className="bg-card rounded-2xl p-5 sm:p-6 border border-border/40 hover:shadow-xl hover:border-border/60 transition-all duration-300 group cursor-pointer">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-500/10 rounded-2xl flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Statistiques</h3>
                  <p className="text-[11px] text-muted-foreground">Suivez vos performances</p>
                </div>
              </div>
              {/* Mini chart */}
              <div className="bg-secondary/20 rounded-xl p-3 border border-border/10 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold text-foreground">Chiffre d'affaires</span>
                  <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+18%</span>
                </div>
                <svg viewBox="0 0 200 60" className="w-full h-16">
                  <defs>
                    <linearGradient id="widgetGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,50 C20,48 35,42 60,38 C85,34 100,30 130,25 C155,20 175,15 200,10 L200,60 L0,60 Z" fill="url(#widgetGrad)" />
                  <path d="M0,50 C20,48 35,42 60,38 C85,34 100,30 130,25 C155,20 175,15 200,10" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="200" cy="10" r="3" fill="#10B981" />
                </svg>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: '8 450€', label: 'CA' },
                  { value: '24', label: 'RDV' },
                  { value: '352€', label: 'Moy.' },
                ].map((s, i) => (
                  <div key={i} className="text-center">
                    <p className="text-[12px] font-bold text-foreground">{s.value}</p>
                    <p className="text-[8px] text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Widget 6: Personnalisation */}
            <div className="bg-card rounded-2xl p-5 sm:p-6 border border-border/40 hover:shadow-xl hover:border-border/60 transition-all duration-300 group cursor-pointer">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-pink-500/10 rounded-2xl flex items-center justify-center">
                  <Palette className="w-5 h-5 text-pink-500" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Personnalisation</h3>
                  <p className="text-[11px] text-muted-foreground">Votre page à votre image</p>
                </div>
              </div>
              {/* Mini customization preview */}
              <div className="bg-secondary/20 rounded-xl p-3 border border-border/10 mb-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-xl overflow-hidden shadow-sm ring-1 ring-border/20">
                    <img src={gocleanLogo} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-foreground">GOCLEANING</p>
                    <p className="text-[8px] text-muted-foreground">Votre page pro</p>
                  </div>
                </div>
                <div className="h-8 rounded-lg overflow-hidden shadow-sm mb-2.5">
                  <img src={mockupBanner} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[8px] text-muted-foreground">Couleur :</span>
                  {['#3B82F6', '#EF4444', '#10B981', '#8B5CF6', '#F59E0B'].map((c, i) => (
                    <div key={i} className={`w-4 h-4 rounded-full ${i === 2 ? 'ring-1 ring-foreground ring-offset-1 ring-offset-background' : ''}`} style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Widget 7: Formules — spans full width on mobile, normal on desktop */}
            <div className="bg-card rounded-2xl p-5 sm:p-6 border border-border/40 hover:shadow-xl hover:border-border/60 transition-all duration-300 group cursor-pointer sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-indigo-500/10 rounded-2xl flex items-center justify-center">
                  <Tag className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Formules & Tarifs</h3>
                  <p className="text-[11px] text-muted-foreground">Créez vos offres</p>
                </div>
              </div>
              {/* Mini formules */}
              <div className="space-y-2">
                {[
                  { name: 'Lavage Express', price: '35€', duration: '45min', color: 'from-blue-500 to-blue-600' },
                  { name: 'Nettoyage Complet', price: '89€', duration: '1h30', color: 'from-emerald-500 to-emerald-600' },
                  { name: 'Rénovation Premium', price: '159€', duration: '3h', color: 'from-purple-500 to-purple-600' },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5 bg-secondary/30 rounded-xl p-2.5 border border-border/10">
                    <div className={`w-7 h-7 bg-gradient-to-br ${f.color} rounded-lg flex items-center justify-center shrink-0`}>
                      <Car className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-foreground">{f.name}</p>
                      <p className="text-[9px] text-muted-foreground">{f.duration}</p>
                    </div>
                    <span className="text-[11px] font-bold text-foreground tabular-nums">{f.price}</span>
                  </div>
                ))}
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
