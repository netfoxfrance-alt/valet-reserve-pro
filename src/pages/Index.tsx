import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Logo } from '@/components/ui/Logo';
import { 
  ArrowRight, Calendar, Users, BarChart3, Link2, 
  Shield, Clock, Check, Car, Droplets, MapPin, Phone, 
  Star, Settings, LogOut, ChevronRight, Globe, Palette, Eye,
  Instagram, MessageCircle, Share2, ExternalLink, Sparkles, Mail, Loader2,
  Zap, Crown, ImagePlus, Upload, Tag, CalendarDays, Plus, Facebook, Type
} from 'lucide-react';
import mockupBanner from '@/assets/mockup-banner-v2.jpg';
import sofaBanner from '@/assets/sofa-cleaning-banner.jpg';
import gocleanLogo from '@/assets/gocleaning-logo.png';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function Index() {
  const [dashboardTab, setDashboardTab] = useState<'reservations' | 'mypage' | 'formules' | 'stats' | 'settings'>('reservations');
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
      <section className="py-24 sm:py-32 px-4 sm:px-6 border-t border-border/30 overflow-hidden">
        <div className="max-w-5xl mx-auto">
          {/* Section Header - Minimal Apple style */}
          <div className="text-center mb-16 sm:mb-20">
            <h2 className="opacity-0 animate-fade-in-up text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground tracking-tight mb-4">
              Personnalisez votre page.
            </h2>
            <p className="opacity-0 animate-fade-in-up stagger-1 text-muted-foreground text-base sm:text-lg max-w-md mx-auto">
              Couleurs, formules, disponibilités. Tout est modifiable.
            </p>
          </div>

          {/* Visual Composition - Clean Apple Style */}
          <div className="opacity-0 animate-fade-in-up stagger-2 relative">
            <div className="relative max-w-4xl mx-auto">
              
              {/* Central Page Preview */}
              <div className="relative mx-auto w-[280px] sm:w-[320px]">
                <div className="bg-card rounded-[2rem] overflow-hidden shadow-xl ring-1 ring-border/30">
                  {/* Banner */}
                  <div className="h-20 sm:h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 relative">
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 z-20">
                      <div className="w-16 h-16 sm:w-18 sm:h-18 bg-white rounded-2xl shadow-lg flex items-center justify-center ring-2 ring-white">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                          <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-5 pt-12 pb-5 text-center">
                    <h3 className="text-lg font-semibold text-foreground mb-0.5">Clean & Shine</h3>
                    <p className="text-xs text-muted-foreground mb-4">Nettoyage auto premium</p>
                    
                    <div className="flex justify-center mb-4">
                      <span className="inline-flex items-center gap-1.5 text-[10px] bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-full font-medium">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        Ouvert
                      </span>
                    </div>
                    
                    {/* Icons row */}
                    <div className="flex justify-center gap-2 mb-5">
                      {[Instagram, Phone, MapPin].map((Icon, i) => (
                        <div key={i} className="w-9 h-9 bg-secondary/50 rounded-lg flex items-center justify-center">
                          <Icon className="w-4 h-4 text-foreground" />
                        </div>
                      ))}
                    </div>
                    
                    {/* Services */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="bg-secondary/40 rounded-xl p-3 text-left">
                        <p className="text-xs font-medium text-foreground">Express</p>
                        <p className="text-sm font-semibold text-primary">35€</p>
                      </div>
                      <div className="bg-secondary/40 rounded-xl p-3 text-left">
                        <p className="text-xs font-medium text-foreground">Premium</p>
                        <p className="text-sm font-semibold text-primary">129€</p>
                      </div>
                    </div>
                    
                    <button className="w-full bg-foreground text-background py-3 rounded-xl text-sm font-medium">
                      Réserver
                    </button>
                  </div>
                </div>
              </div>

              {/* Floating Elements - Minimal & Elegant */}
              
              {/* Colors - Top Left */}
              <div 
                className="absolute top-4 sm:top-8 left-0 sm:left-8 lg:left-16 z-30 animate-float"
                style={{ animationDelay: '0s' }}
              >
                <div className="bg-card rounded-xl p-3 shadow-lg ring-1 ring-border/40">
                  <div className="flex gap-1.5">
                    {['bg-emerald-500', 'bg-blue-500', 'bg-violet-500', 'bg-orange-500'].map((bg, i) => (
                      <div key={i} className={`w-6 h-6 ${bg} rounded-full ${i === 0 ? 'ring-2 ring-foreground ring-offset-1 ring-offset-card' : ''}`} />
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Banner upload - Top Right */}
              <div 
                className="absolute top-2 sm:top-6 right-0 sm:right-8 lg:right-20 z-30 animate-float"
                style={{ animationDelay: '0.2s' }}
              >
                <div className="bg-card rounded-xl p-2.5 shadow-lg ring-1 ring-border/40">
                  <div className="w-20 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
                    <ImagePlus className="w-4 h-4 text-white/90" />
                  </div>
                </div>
              </div>
              
              {/* Calendar - Left Middle */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 -left-2 sm:left-0 lg:left-4 z-30 animate-float hidden sm:block"
                style={{ animationDelay: '0.3s' }}
              >
                <div className="bg-card rounded-xl p-3 shadow-lg ring-1 ring-border/40">
                  <div className="grid grid-cols-5 gap-1">
                    {['L', 'M', 'M', 'J', 'V'].map((d, i) => (
                      <div key={i} className={`w-5 h-5 rounded text-[9px] font-medium flex items-center justify-center ${i < 4 ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'bg-secondary/50 text-muted-foreground'}`}>
                        {d}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Formulas - Right Middle */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 -right-2 sm:right-0 lg:right-4 z-30 animate-float hidden sm:block"
                style={{ animationDelay: '0.4s' }}
              >
                <div className="bg-card rounded-xl p-3 shadow-lg ring-1 ring-border/40 w-36">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-foreground font-medium">Express</span>
                      <span className="text-primary font-semibold">35€</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-foreground font-medium">Premium</span>
                      <span className="text-primary font-semibold">129€</span>
                    </div>
                    <div className="text-[9px] text-primary/70 text-center pt-1 border-t border-dashed border-border/50">
                      + Ajouter
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Add block - Bottom Left */}
              <div 
                className="absolute bottom-0 sm:bottom-8 left-4 sm:left-12 lg:left-20 z-30 animate-float"
                style={{ animationDelay: '0.5s' }}
              >
                <div className="bg-card rounded-xl px-3 py-2 shadow-lg ring-1 ring-border/40 flex items-center gap-2">
                  <div className="w-6 h-6 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Plus className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-[10px] font-medium text-foreground">Ajouter</span>
                </div>
              </div>
              
              {/* Links - Bottom Right */}
              <div 
                className="absolute bottom-0 sm:bottom-8 right-4 sm:right-12 lg:right-20 z-30 animate-float"
                style={{ animationDelay: '0.6s' }}
              >
                <div className="bg-card rounded-xl p-2.5 shadow-lg ring-1 ring-border/40 flex gap-1.5">
                  <div className="w-7 h-7 bg-gradient-to-br from-pink-500 to-orange-500 rounded-lg flex items-center justify-center">
                    <Instagram className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="w-7 h-7 bg-foreground rounded-lg flex items-center justify-center">
                    <Globe className="w-3.5 h-3.5 text-background" />
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Partagez votre lien */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-secondary/30">
        <div className="max-w-5xl mx-auto text-center">
          {/* Section Label */}
          <div className="flex items-center justify-center gap-2 text-muted-foreground mb-4 opacity-0 animate-fade-in-up">
            <Share2 className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Diffusion</span>
          </div>
          
          <h2 className="opacity-0 animate-fade-in-up stagger-1 text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground tracking-tight mb-4">
            Partagez votre lien de partout
          </h2>
          <p className="opacity-0 animate-fade-in-up stagger-2 text-muted-foreground text-base sm:text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
            Un seul lien à partager sur tous vos canaux : réseaux sociaux, carte de visite, QR code, signature email...
          </p>

          {/* Link Preview Card */}
          <div className="opacity-0 animate-fade-in-up stagger-3 max-w-md mx-auto">
            <div className="bg-card rounded-2xl p-6 border border-border/60 shadow-xl">
              <div className="flex items-center gap-3 bg-secondary/40 rounded-xl px-4 py-3 mb-6">
                <Globe className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">cleaningpage.com/</span>
                <span className="text-sm text-primary font-semibold">votre-centre</span>
                <button className="ml-auto p-2 bg-foreground text-background rounded-lg">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
              
              {/* Share options */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { icon: Instagram, label: 'Instagram', color: 'bg-gradient-to-br from-purple-500 to-pink-500' },
                  { icon: MessageCircle, label: 'WhatsApp', color: 'bg-emerald-500' },
                  { label: 'TikTok', color: 'bg-black', isCustomIcon: true },
                  { label: 'QR Code', color: 'bg-foreground', isCustomIcon: true },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center`}>
                      {item.isCustomIcon ? (
                        item.label === 'TikTok' ? (
                          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                          </svg>
                        ) : (
                          <svg className="w-6 h-6 text-background" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                            <path d="M7 7h.01M7 12h.01M7 17h.01M12 7h.01M12 12h.01M12 17h.01M17 7h.01M17 12h.01M17 17h.01"/>
                          </svg>
                        )
                      ) : (
                        <item.icon className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground">{item.label}</span>
                  </div>
                ))}
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
            Réservations, statistiques, formules, paramètres... Tout est centralisé dans votre tableau de bord.
          </p>

          {/* Dashboard Tabs Preview - Interactive (sans Ma Page) */}
          <div className="opacity-0 animate-fade-in-up stagger-3 flex flex-wrap gap-2 sm:gap-3 mb-10 justify-center">
            {[
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
                <div className="flex-1 p-3 sm:p-6">
                  {/* Ma Page Tab */}
                  {dashboardTab === 'mypage' && (
                    <div className="h-full flex flex-col">
                      {/* Main content grid - Preview left, Controls right */}
                      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        {/* Left: Live Preview - Simple card style like real dashboard */}
                        <div className="flex flex-col min-h-[300px] sm:min-h-[400px] order-2 lg:order-1">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs sm:text-sm font-medium text-foreground">Aperçu</span>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-foreground rounded-md flex items-center justify-center">
                                <Phone className="w-3 h-3 text-background" />
                              </div>
                              <div className="w-6 h-6 bg-secondary/60 rounded-md flex items-center justify-center cursor-pointer hover:bg-secondary transition-colors">
                                <svg className="w-3 h-3 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <rect x="2" y="3" width="20" height="14" rx="2" />
                                  <path d="M8 21h8" />
                                  <path d="M12 17v4" />
                                </svg>
                              </div>
                              <div className="w-6 h-6 bg-secondary/60 rounded-md flex items-center justify-center cursor-pointer hover:bg-secondary transition-colors">
                                <svg className="w-3 h-3 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M21 12a9 9 0 0 0-9-9 9 9 0 0 0-9 9" />
                                  <path d="M3 12a9 9 0 0 0 9 9 9 9 0 0 0 9-9" />
                                  <path d="M12 3v18" />
                                  <path d="m8 7 4-4 4 4" />
                                </svg>
                              </div>
                            </div>
                          </div>
                          
                          {/* Preview Container - Style like real public page */}
                          <div className="flex-1 bg-secondary/30 rounded-2xl overflow-hidden">
                            <div className="bg-card h-full overflow-y-auto">
                              {/* Banner with logo overlay */}
                              <div className="h-32 relative">
                                <img 
                                  src={mockupBanner} 
                                  alt="Preview" 
                                  className="w-full h-full object-cover"
                                />
                                {/* Logo centered at bottom of banner */}
                                <div className="absolute left-1/2 -translate-x-1/2 -bottom-8">
                                  <div className="bg-white/95 rounded-2xl p-2 shadow-lg ring-1 ring-black/5">
                                    <div className="w-16 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                                      <span className="text-white font-black text-lg tracking-tight">CP</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="px-5 pt-12 pb-4">
                                {/* Business Name */}
                                <h3 className="text-xl font-bold text-foreground text-center mb-2">Clean Premium</h3>
                                
                                {/* Description */}
                                <p className="text-sm text-muted-foreground text-center leading-relaxed mb-4">
                                  Nettoyage automobile premium à domicile, 7j/7. Qualité professionnelle garantie.
                                </p>
                                
                                {/* Status Badge */}
                                <div className="flex justify-center mb-4">
                                  <span className="inline-flex items-center gap-1.5 text-xs bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full font-medium">
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                                    Ouvert
                                  </span>
                                </div>
                                
                                {/* Social Icons Row */}
                                <div className="flex justify-center gap-3 mb-5">
                                  <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center border border-border/40">
                                    <Instagram className="w-5 h-5 text-foreground" />
                                  </div>
                                  <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center border border-border/40">
                                    <svg className="w-5 h-5 text-foreground" viewBox="0 0 24 24" fill="currentColor">
                                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                                    </svg>
                                  </div>
                                  <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center border border-border/40">
                                    <svg className="w-5 h-5 text-foreground" viewBox="0 0 24 24" fill="currentColor">
                                      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                                    </svg>
                                  </div>
                                  <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center border border-border/40">
                                    <Mail className="w-5 h-5 text-foreground" />
                                  </div>
                                </div>
                                
                                {/* Info Items */}
                                {/* Info Items */}
                                <div className="space-y-2.5 mb-5">
                                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <Phone className="w-4 h-4 flex-shrink-0" />
                                    <span>06 12 34 56 78</span>
                                  </div>
                                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <Clock className="w-4 h-4 flex-shrink-0" />
                                    <span>Lun - Sam : 9h00 - 19h00</span>
                                  </div>
                                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <MapPin className="w-4 h-4 flex-shrink-0" />
                                    <span>12 rue de la Paix, 75002 Paris</span>
                                  </div>
                                </div>
                                
                                {/* Formulas Title */}
                                <h4 className="text-base font-semibold text-foreground mb-3">Nos formules</h4>
                                
                                {/* Formula Cards Grid */}
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                  <div className="bg-card border border-border/40 rounded-xl p-3">
                                    <h5 className="text-sm font-semibold text-foreground mb-1">Express</h5>
                                    <p className="text-base font-bold text-muted-foreground">35€</p>
                                  </div>
                                  <div className="bg-card border border-border/40 rounded-xl p-3">
                                    <h5 className="text-sm font-semibold text-foreground mb-1">Complet</h5>
                                    <p className="text-base font-bold text-muted-foreground">89€</p>
                                  </div>
                                </div>
                                
                                {/* CTA Button - Fixed style like real page */}
                                <button className="w-full bg-neutral-700 hover:bg-neutral-800 text-white py-3.5 rounded-2xl text-sm font-semibold transition-colors">
                                  Réserver maintenant
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right: Customization controls */}
                        <div className="flex flex-col order-1 lg:order-2">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs sm:text-sm font-medium text-foreground">Personnalisation</span>
                          </div>
                          
                          <div className="bg-card rounded-xl border border-border/40 flex-1 overflow-hidden">
                            {/* Tabs - Interactive */}
                            <div className="flex items-center justify-around border-b border-border/40 py-2 px-2">
                              <div 
                                onClick={() => setMockupTab('design')}
                                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl cursor-pointer transition-colors ${mockupTab === 'design' ? 'bg-secondary/50 text-foreground' : 'text-muted-foreground hover:text-foreground/70'}`}
                              >
                                <Palette className="w-4 h-4" />
                                <span className="text-[9px] sm:text-[10px] font-medium">Design</span>
                              </div>
                              <div 
                                onClick={() => setMockupTab('formules')}
                                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl cursor-pointer transition-colors ${mockupTab === 'formules' ? 'bg-secondary/50 text-foreground' : 'text-muted-foreground hover:text-foreground/70'}`}
                              >
                                <Droplets className="w-4 h-4" />
                                <span className="text-[9px] sm:text-[10px] font-medium">Formules</span>
                              </div>
                              <div 
                                onClick={() => setMockupTab('elements')}
                                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl cursor-pointer transition-colors ${mockupTab === 'elements' ? 'bg-secondary/50 text-foreground' : 'text-muted-foreground hover:text-foreground/70'}`}
                              >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
                                <span className="text-[9px] sm:text-[10px] font-medium">Éléments</span>
                              </div>
                              <div 
                                onClick={() => setMockupTab('seo')}
                                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl cursor-pointer transition-colors ${mockupTab === 'seo' ? 'bg-secondary/50 text-foreground' : 'text-muted-foreground hover:text-foreground/70'}`}
                              >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                                <span className="text-[9px] sm:text-[10px] font-medium">SEO</span>
                              </div>
                            </div>

                            <div className="p-3 sm:p-4 space-y-4 overflow-y-auto max-h-[320px]">
                              {/* Design Tab Content */}
                              {mockupTab === 'design' && (
                                <>
                                  {/* Banner Section */}
                                  <div>
                                    <p className="text-[10px] sm:text-xs font-medium text-foreground mb-2">Bannière</p>
                                    <div className="rounded-xl overflow-hidden mb-2">
                                      <img 
                                        src={mockupBanner} 
                                        alt="Banner preview" 
                                        className="w-full h-20 object-cover"
                                      />
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button className="flex items-center gap-1.5 text-[10px] font-medium text-foreground bg-secondary/50 px-3 py-1.5 rounded-full border border-border/40">
                                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                                        Changer
                                      </button>
                                      <button className="text-red-500 p-1.5">
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                                      </button>
                                    </div>
                                  </div>

                                  {/* Colors Section */}
                                  <div>
                                    <p className="text-[10px] sm:text-xs font-medium text-foreground mb-2">Couleurs</p>
                                    <div className="grid grid-cols-3 gap-2 mb-3">
                                      {[
                                        { name: 'Bleu', c1: '#3B82F6', c2: '#1E3A5F' },
                                        { name: 'Rouge', c1: '#EF4444', c2: '#1E1E1E' },
                                        { name: 'Vert', c1: '#10B981', c2: '#064E3B', selected: true },
                                        { name: 'Violet', c1: '#8B5CF6', c2: '#1E3A5F' },
                                        { name: 'Orange', c1: '#F97316', c2: '#7C2D12' },
                                        { name: 'Rose', c1: '#EC4899', c2: '#4A1942' },
                                      ].map((color, i) => (
                                        <div key={i} className={`flex flex-col items-center gap-1 p-2 rounded-xl border cursor-pointer ${color.selected ? 'border-foreground bg-secondary/30' : 'border-border/40'}`}>
                                          <div className="flex gap-1">
                                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color.c1 }} />
                                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color.c2 }} />
                                          </div>
                                          <span className="text-[9px] text-muted-foreground">{color.name}</span>
                                        </div>
                                      ))}
                                    </div>

                                    {/* Custom color inputs */}
                                    <div className="grid grid-cols-3 gap-2">
                                      <div>
                                        <p className="text-[9px] text-muted-foreground mb-1">Principale</p>
                                        <div className="flex items-center gap-1.5 bg-secondary/30 rounded-lg px-2 py-1.5 border border-border/40">
                                          <div className="w-4 h-4 rounded bg-emerald-500" />
                                          <span className="text-[9px] text-foreground">#10B981</span>
                                        </div>
                                      </div>
                                      <div>
                                        <p className="text-[9px] text-muted-foreground mb-1">Titres</p>
                                        <div className="flex items-center gap-1.5 bg-secondary/30 rounded-lg px-2 py-1.5 border border-border/40">
                                          <div className="w-4 h-4 rounded bg-slate-800" />
                                          <span className="text-[9px] text-foreground">#1E293B</span>
                                        </div>
                                      </div>
                                      <div>
                                        <p className="text-[9px] text-muted-foreground mb-1">Texte</p>
                                        <div className="flex items-center gap-1.5 bg-secondary/30 rounded-lg px-2 py-1.5 border border-border/40">
                                          <div className="w-4 h-4 rounded bg-gray-600" />
                                          <span className="text-[9px] text-foreground">#4B5563</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Dark Mode Toggle */}
                                  <div className="flex items-center justify-between bg-secondary/30 rounded-xl p-3 border border-border/40">
                                    <div>
                                      <p className="text-[10px] sm:text-xs font-medium text-foreground">Mode sombre</p>
                                      <p className="text-[9px] text-muted-foreground">Thème sombre pour la page</p>
                                    </div>
                                    <div className="w-9 h-5 bg-secondary rounded-full relative border border-border/40">
                                      <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-muted-foreground/30 rounded-full" />
                                    </div>
                                  </div>
                                </>
                              )}

                              {/* Formules Tab Content */}
                              {mockupTab === 'formules' && (
                                <>
                                  <p className="text-[10px] sm:text-xs text-muted-foreground">Sélectionnez les formules à afficher sur votre page</p>
                                  
                                  <div className="space-y-2">
                                    {[
                                      { name: 'Lavage Express', price: '35€', active: true },
                                      { name: 'Nettoyage Complet', price: '89€', active: true },
                                      { name: 'Rénovation Premium', price: '159€', active: false },
                                      { name: 'Pack Intérieur', price: '65€', active: true },
                                    ].map((pack, i) => (
                                      <div key={i} className="flex items-center justify-between bg-secondary/40 rounded-xl p-3 border border-border/30">
                                        <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                                            <Car className="w-4 h-4 text-emerald-600" />
                                          </div>
                                          <div>
                                            <p className="text-[10px] sm:text-xs font-medium text-foreground">{pack.name}</p>
                                            <p className="text-[9px] text-muted-foreground">{pack.price}</p>
                                          </div>
                                        </div>
                                        <div className={`w-8 h-4.5 rounded-full relative ${pack.active ? 'bg-emerald-500' : 'bg-secondary border border-border/40'}`}>
                                          <div className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full shadow-sm transition-all ${pack.active ? 'right-0.5' : 'left-0.5'}`} />
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  <button className="w-full border-2 border-dashed border-border/60 rounded-xl p-3 text-center hover:border-foreground/30 transition-colors">
                                    <span className="text-[10px] sm:text-xs font-medium text-muted-foreground">+ Créer une nouvelle formule</span>
                                  </button>
                                </>
                              )}

                              {/* Elements Tab Content */}
                              {mockupTab === 'elements' && (
                                <>
                                  {/* Add Element Button */}
                                  <div className="border-2 border-dashed border-border/60 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-foreground/30 transition-colors">
                                    <div className="w-8 h-8 bg-secondary/60 rounded-full flex items-center justify-center mb-2">
                                      <span className="text-lg text-muted-foreground">+</span>
                                    </div>
                                    <p className="text-[10px] sm:text-xs font-medium text-foreground">Ajouter un élément</p>
                                    <p className="text-[9px] text-muted-foreground">Images, texte, liens...</p>
                                  </div>

                                  <div className="space-y-2">
                                    <p className="text-[9px] text-muted-foreground font-medium">Vos éléments</p>
                                    {[
                                      { icon: Instagram, label: 'Instagram' },
                                      { icon: Phone, label: 'Téléphone' },
                                      { icon: Clock, label: 'Horaires' },
                                      { icon: MapPin, label: 'Adresse' },
                                      { icon: ExternalLink, label: 'Boutique' },
                                    ].map((item, i) => (
                                      <div key={i} className="bg-secondary/40 rounded-xl p-2 border border-border/30">
                                        <div className="flex items-center gap-2">
                                          <div className="text-muted-foreground cursor-grab">
                                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/></svg>
                                          </div>
                                          <div className="w-5 h-5 bg-secondary/60 rounded flex items-center justify-center">
                                            <item.icon className="w-3 h-3 text-muted-foreground" />
                                          </div>
                                          <span className="text-[9px] font-medium text-foreground flex-1">{item.label}</span>
                                          <div className="w-6 h-3 bg-emerald-500 rounded-full relative">
                                            <div className="absolute right-0.5 top-0.5 w-2 h-2 bg-white rounded-full" />
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </>
                              )}

                              {/* SEO Tab Content */}
                              {mockupTab === 'seo' && (
                                <>
                                  <p className="text-[10px] sm:text-xs text-muted-foreground mb-2">Optimisez votre référencement Google</p>
                                  
                                  <div className="space-y-3">
                                    <div>
                                      <label className="text-[9px] text-muted-foreground mb-1 block">Titre Google</label>
                                      <div className="bg-secondary/30 rounded-lg px-3 py-2 border border-border/40">
                                        <span className="text-[10px] text-foreground">Clean Premium - Nettoyage Auto Paris</span>
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <label className="text-[9px] text-muted-foreground mb-1 block">Description</label>
                                      <div className="bg-secondary/30 rounded-lg px-3 py-2 border border-border/40">
                                        <span className="text-[10px] text-foreground">Service de nettoyage automobile premium à domicile. Lavage intérieur, extérieur et rénovation.</span>
                                      </div>
                                    </div>

                                    <div>
                                      <label className="text-[9px] text-muted-foreground mb-1 block">Mots-clés</label>
                                      <div className="flex flex-wrap gap-1">
                                        {['nettoyage auto', 'lavage voiture', 'detailing paris'].map((kw, i) => (
                                          <span key={i} className="text-[9px] bg-secondary/50 px-2 py-1 rounded-full text-foreground">{kw}</span>
                                        ))}
                                      </div>
                                    </div>

                                    <div>
                                      <label className="text-[9px] text-muted-foreground mb-1 block">Ville</label>
                                      <div className="bg-secondary/30 rounded-lg px-3 py-2 border border-border/40">
                                        <span className="text-[10px] text-foreground">Paris</span>
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
                      <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4 sm:mb-6">Statistiques</h3>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
                        {[
                          { value: '127', label: 'Réservations', sub: 'ce mois' },
                          { value: '4 850€', label: "CA", sub: 'ce mois' },
                          { value: '89', label: 'Clients', sub: 'uniques' },
                          { value: '54€', label: 'Panier', sub: 'moyen' },
                        ].map((stat, i) => (
                          <div key={i} className="bg-secondary/40 rounded-xl p-2 sm:p-4 text-center">
                            <p className="text-lg sm:text-2xl font-bold text-foreground">{stat.value}</p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">{stat.label}</p>
                            <p className="text-[8px] sm:text-[10px] text-muted-foreground/70">{stat.sub}</p>
                          </div>
                        ))}
                      </div>

                      {/* Chart mockup */}
                      <div className="bg-secondary/30 rounded-xl p-3 sm:p-4">
                        <p className="text-xs sm:text-sm font-medium text-foreground mb-3 sm:mb-4">Évolution CA (6 mois)</p>
                        <div className="flex items-end justify-between gap-1 sm:gap-2 h-24 sm:h-32">
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
                            <span key={m} className="text-[8px] sm:text-[10px] text-muted-foreground flex-1 text-center">{m}</span>
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
