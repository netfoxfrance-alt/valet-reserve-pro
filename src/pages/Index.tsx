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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import mockupBanner from '@/assets/mockup-banner-v2.jpg';
import sofaBanner from '@/assets/sofa-cleaning-banner.jpg';
import gocleanLogo from '@/assets/gocleaning-logo.png';
import mockupCarCleaning from '@/assets/mockup-car-cleaning.jpg';
import mockupLogoClean from '@/assets/mockup-logo-cleaning.png';
import mockupInterior from '@/assets/mockup-interior-cleaning.png';
import mockupExterior from '@/assets/mockup-exterior-cleaning.png';
import mockupWindowCleaning from '@/assets/mockup-window-cleaning.png';
import mockupTerraceCleaning from '@/assets/mockup-terrace-cleaning.png';
import mockupPrestigeBanner from '@/assets/mockup-prestige-banner.png';

import iconReservations from '@/assets/icons/icon-reservations.webp';
import iconAgenda from '@/assets/icons/icon-agenda.webp';
import iconFactures from '@/assets/icons/icon-factures.webp';
import iconClients from '@/assets/icons/icon-clients.webp';
import iconMaPage from '@/assets/icons/icon-mapage.webp';
import iconFormules from '@/assets/icons/icon-formules.webp';
import iconDemandes from '@/assets/icons/icon-demandes.webp';
import iconStatistiques from '@/assets/icons/icon-statistiques.webp';

import tabReservations from '@/assets/icons/tab-reservations.webp';
import tabAgenda from '@/assets/icons/tab-agenda.webp';
import tabClients from '@/assets/icons/tab-clients.webp';
import tabFactures from '@/assets/icons/tab-factures.webp';
import tabStats from '@/assets/icons/tab-stats.png';
import tabMaPage from '@/assets/icons/tab-mapage.webp';
import tabFormules from '@/assets/icons/tab-formules.webp';

const dashboardIcons = [
  { icon: iconReservations, label: 'Réservations' },
  { icon: iconAgenda, label: 'Agenda' },
  { icon: iconFactures, label: 'Factures' },
  { icon: iconClients, label: 'Clients' },
  { icon: iconMaPage, label: 'Ma Page' },
  { icon: iconFormules, label: 'Formules' },
  { icon: iconDemandes, label: 'Demandes' },
  { icon: iconStatistiques, label: 'Statistiques' },
];
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function Index() {
  const [dashboardTab, setDashboardTab] = useState<'reservations' | 'calendar' | 'clients' | 'invoices' | 'stats' | 'mypage' | 'formules'>('reservations');
  const [showClientDetail, setShowClientDetail] = useState(false);
  const [mobileTab, setMobileTab] = useState<'reservations' | 'mypage' | 'formules' | 'stats' | 'settings' | 'dispo'>('mypage');
  const [mockupTab, setMockupTab] = useState<'design' | 'formules' | 'elements' | 'seo'>('design');
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [mockupPageStyle, setMockupPageStyle] = useState<'banner' | 'minimal'>('minimal');
  const { toast } = useToast();
  const { t } = useTranslation();

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
        title: t('common.error'),
        description: t('landing.startError'),
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
            <LanguageSwitcher variant="ghost" />
            <Link to="/auth">
              <Button size="sm" className="text-xs sm:text-sm px-3 sm:px-4">
                {t('landing.login')}
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
                {t('landing.heroTitle1')}
                <br />
                <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">{t('landing.heroTitle2')}</span>
              </h1>
              
              <div className="opacity-0 animate-fade-in-up stagger-2 max-w-lg mx-auto lg:mx-0 mb-8 space-y-1">
                <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed">{t('landing.heroDescLine1')}</p>
                <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed">{t('landing.heroDescLine2')}</p>
                <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed">{t('landing.heroDescLine3')}</p>
              </div>
              
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
                     {t('mockup.loading')}
                    </>
                  ) : (
                    <>
                      {t('landing.tryFree30')}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="opacity-0 animate-fade-in-up stagger-4 flex items-center gap-6 justify-center lg:justify-start text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>{t('landing.free30days')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>{t('landing.noCommitment')}</span>
                </div>
              </div>
            </div>

            {/* Mobile: Text + CTA above mockup */}
            <div className="text-center lg:hidden">
              <h1 className="opacity-0 animate-fade-in-up text-3xl sm:text-4xl font-semibold text-foreground tracking-tight mb-4 leading-[1.1]">
                {t('landing.heroTitle1')}
                <br />
                <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">{t('landing.heroTitle2')}</span>
              </h1>
              
              <div className="opacity-0 animate-fade-in-up stagger-1 max-w-sm mx-auto mb-6 space-y-1">
                <p className="text-base text-muted-foreground leading-relaxed">{t('landing.heroDescMobile1')}</p>
                <p className="text-base text-muted-foreground leading-relaxed">{t('landing.heroDescMobile2')}</p>
                <p className="text-base text-muted-foreground leading-relaxed">{t('landing.heroDescMobile3')}</p>
              </div>

              <Button 
                size="lg" 
                className="w-full text-base px-8 shadow-lg shadow-emerald-500/25 bg-emerald-500 hover:bg-emerald-600 mb-4"
                onClick={handleStartTrial}
                disabled={isCheckoutLoading}
              >
                {isCheckoutLoading ? (
                  <>
                     <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                     {t('mockup.loading')}
                  </>
                ) : (
                    <>
                      {t('landing.tryFree30')}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              
              <div className="flex items-center gap-4 justify-center text-sm text-muted-foreground mb-8">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>{t('landing.free30days')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>{t('landing.noCommitment')}</span>
                </div>
              </div>
            </div>

             {/* Right: Two Mockup Cards side by side */}
            <div className="flex justify-center lg:justify-end mt-8 lg:mt-0">
              <div className="relative w-[340px] sm:w-[440px] md:w-[560px] lg:w-[620px] h-[480px] sm:h-[500px] md:h-[520px]">
                
                {/* Dashboard Mockup Card - Behind, right */}
                <div className="absolute top-0 right-0 lg:top-2 lg:right-0 z-10">
                  <div 
                    className="bg-card rounded-[2rem] overflow-hidden w-[220px] sm:w-[260px] lg:w-[300px] shadow-2xl shadow-black/15 ring-1 ring-border/40"
                    style={{ transform: 'rotate(3deg)' }}
                  >
                    {/* Dashboard Header */}
                    <div className="px-4 lg:px-5 pt-4 pb-3">
                      {/* Center name */}
                      <h3 className="text-sm lg:text-base font-bold text-foreground leading-tight mb-2">GOCLEANING</h3>
                      {/* Copy link */}
                      <div className="flex items-center gap-2 bg-secondary/40 rounded-xl px-2.5 py-1.5">
                        <Share2 className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[9px] lg:text-[10px] text-muted-foreground font-mono">/gocleaning</span>
                        <div className="ml-auto w-4 h-4 lg:w-5 lg:h-5 rounded-md bg-background/80 flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <rect x="9" y="9" width="13" height="13" rx="2" />
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    {/* Icon Grid */}
                    <div className="px-4 lg:px-5 pb-5 pt-2">
                      <div className="grid grid-cols-3 gap-x-3 gap-y-4 lg:gap-x-4 lg:gap-y-5">
                        {dashboardIcons.map((item) => (
                          <div key={item.label} className="flex flex-col items-center gap-1.5">
                            <img
                              src={item.icon}
                              alt={item.label}
                              className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 object-contain"
                            />
                            <span className="text-[8px] sm:text-[9px] lg:text-[10px] font-medium text-muted-foreground text-center leading-tight truncate max-w-[70px]">
                              {item.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Page Card - In front, left */}
                <div className="absolute top-10 sm:top-8 left-0 lg:top-6 lg:left-4 z-20">
                  <div 
                    className="bg-card rounded-[2rem] overflow-hidden w-[220px] sm:w-[250px] lg:w-[280px] shadow-2xl shadow-black/20 ring-1 ring-border/40"
                    style={{ transform: 'rotate(-3deg)' }}
                  >
                    {/* Minimal Header - Logo + Call button */}
                    <div className="flex items-center justify-between px-3 lg:px-4 pt-3 pb-2">
                      <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl overflow-hidden shadow-sm">
                        <img src={gocleanLogo} alt="GoCleaning Logo" className="w-full h-full object-cover" />
                      </div>
                      <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-zinc-600 flex items-center justify-center shadow-sm">
                        <Phone className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-white" />
                      </div>
                    </div>

                    <div className="border-t border-border/30" />
                    
                    <div className="px-4 pb-4 pt-4 text-center">
                      <h3 className="text-sm lg:text-base font-bold text-foreground mb-0.5 tracking-wide">GO CLEANING</h3>
                      <p className="text-[8px] lg:text-[9px] text-muted-foreground leading-relaxed mb-2">
                        Expert du nettoyage automobile depuis 2018
                      </p>
                      
                      <div className="flex justify-center mb-2">
                        <span className="inline-flex items-center gap-1 text-[9px] bg-white border border-border/60 text-emerald-600 px-2.5 py-1 rounded-full font-medium shadow-sm">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                          {t('mockup.open')}
                        </span>
                      </div>
                      
                      {/* Social icons */}
                      <div className="flex justify-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-secondary/50 rounded-full flex items-center justify-center">
                          <Instagram className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                        <div className="w-8 h-8 bg-secondary/50 rounded-full flex items-center justify-center">
                          <svg className="w-3.5 h-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.88-2.88 2.89 2.89 0 0 1 2.88-2.88c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.16 15a6.34 6.34 0 0 0 6.33 6.33 6.34 6.34 0 0 0 6.33-6.33V8.73a8.19 8.19 0 0 0 4.77 1.53V6.81a4.82 4.82 0 0 1-1-.12z"/></svg>
                        </div>
                      </div>

                      {/* Contact bar */}
                      <div className="bg-secondary/40 rounded-xl px-3 py-2 flex items-center gap-2 mb-3">
                        <Mail className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                        <span className="text-[8px] lg:text-[9px] text-muted-foreground">Formule personnalisée ? Identifiez-vous</span>
                      </div>

                      {/* Opening hours */}
                      <div className="flex items-center gap-1.5 mb-3 px-1">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[9px] text-emerald-600 font-medium">{t('mockup.open')}</span>
                        <span className="text-[9px] text-muted-foreground">· Ferme à 19h00</span>
                      </div>
                      
                      {/* Formules */}
                      <div className="mb-3">
                        <p className="text-[11px] lg:text-xs font-bold text-foreground text-left mb-2">Nos formules</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <div className="rounded-xl overflow-hidden relative aspect-square">
                              <img src={mockupExterior} alt="Lavage complet" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                              <div className="absolute bottom-0 left-0 p-2">
                                <p className="text-[8px] lg:text-[9px] font-bold text-white leading-tight uppercase tracking-wide">Lavage complet</p>
                                <p className="text-[9px] lg:text-[10px] font-bold text-emerald-400">dès 65€</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 mt-1 px-0.5">
                              <Clock className="w-2.5 h-2.5 text-muted-foreground" />
                              <span className="text-[8px] text-muted-foreground">1h</span>
                            </div>
                          </div>
                          <div>
                            <div className="rounded-xl overflow-hidden relative aspect-square">
                              <img src={mockupInterior} alt="Nettoyage intérieur" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                              <div className="absolute bottom-0 left-0 p-2">
                                <p className="text-[8px] lg:text-[9px] font-bold text-white leading-tight">Nettoyage intérieur</p>
                                <p className="text-[9px] lg:text-[10px] font-bold text-emerald-400">dès 50€</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 mt-1 px-0.5">
                              <Clock className="w-2.5 h-2.5 text-muted-foreground" />
                              <span className="text-[8px] text-muted-foreground">1h</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <button className="w-full bg-zinc-500 text-white rounded-xl py-2.5 text-[10px] font-semibold">
                        Réserver
                      </button>
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
              {t('landing.section1Title')}
            </h2>
            <p className="opacity-0 animate-fade-in-up stagger-1 text-muted-foreground text-sm sm:text-base lg:text-lg max-w-lg mx-auto">
              {t('landing.section1Desc')}
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
                  <p className="text-[9px] text-muted-foreground mb-1.5 font-medium">{t('mockup.colors')}</p>
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
                  <p className="text-[9px] text-muted-foreground mb-1.5 font-medium">{t('mockup.availability')}</p>
                  <div className="space-y-1">
                    {[
                      { day: t('mockup.mon'), hours: '9h-18h', active: true },
                      { day: t('mockup.sat'), hours: t('mockup.closed'), active: false },
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
                    <p className="text-[9px] text-muted-foreground">{t('mockup.text')}</p>
                    <p className="text-[10px] font-medium text-foreground">{t('mockup.addText')}</p>
                  </div>
                </div>
                
                {/* Galerie */}
                <div className="bg-card rounded-xl p-3 shadow-lg ring-1 ring-border/30">
                  <p className="text-[9px] text-muted-foreground mb-1.5 font-medium">{t('mockup.gallery')}</p>
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

              {/* Central Page Preview - Mobile - Banner Style */}
              <div className="relative mx-auto w-[280px]">
                <div className="bg-card rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-border/20">
                  {/* Banner */}
                  <div className="h-28 relative">
                    <img src={mockupPrestigeBanner} alt="Service Prestige" className="w-full h-full object-cover" />
                    <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 z-20">
                      <div className="w-14 h-14 rounded-2xl shadow-xl ring-3 ring-card overflow-hidden">
                        <img src={mockupLogoClean} alt="Logo" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-5 pb-5 pt-10 text-center">
                    <h3 className="text-sm font-bold text-foreground mb-0.5">SERVICE PRESTIGE</h3>
                    <p className="text-[9px] text-muted-foreground leading-relaxed mb-2">
                      Expertise & Excellence in Luxury Cleaning
                    </p>
                    
                    <div className="flex justify-center mb-3">
                      <span className="inline-flex items-center gap-1.5 text-[9px] bg-white border border-emerald-200 text-emerald-600 px-2.5 py-1 rounded-full font-medium shadow-sm">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        {t('mockup.open')}
                      </span>
                    </div>
                    
                    {/* Formules section with images */}
                    <div className="text-left mb-4">
                      <h4 className="text-xs font-semibold text-foreground mb-2">{t('mockup.ourPackages')}</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-xl overflow-hidden bg-card shadow-sm ring-1 ring-border/20">
                          <div className="aspect-[4/3] overflow-hidden">
                            <img src={mockupWindowCleaning} alt="Nettoyage de vitres" className="w-full h-full object-cover" />
                          </div>
                          <div className="px-2 py-1.5">
                            <p className="text-[9px] font-semibold text-foreground leading-tight">Nettoyage de vitres</p>
                            <p className="text-[9px] font-medium text-muted-foreground italic">Sur devis</p>
                          </div>
                        </div>
                        <div className="rounded-xl overflow-hidden bg-card shadow-sm ring-1 ring-border/20">
                          <div className="aspect-[4/3] overflow-hidden">
                            <img src={mockupTerraceCleaning} alt="Nettoyage de terrasses" className="w-full h-full object-cover" />
                          </div>
                          <div className="px-2 py-1.5">
                            <p className="text-[9px] font-semibold text-foreground leading-tight">Nettoyage de terrasses</p>
                            <p className="text-[9px] font-medium text-muted-foreground italic">Sur devis</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <button className="w-full bg-neutral-800 text-white py-3 rounded-xl text-sm font-semibold shadow-lg">
                       {t('mockup.bookNow')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Desktop Layout */}
            <div className="hidden sm:block relative">
              <div className="relative max-w-5xl mx-auto">
                
                {/* Central Page Preview - Banner Style */}
                <div className="relative mx-auto w-[320px] lg:w-[340px]">
                  <div className="bg-card rounded-[2.5rem] overflow-hidden shadow-2xl ring-1 ring-border/20">
                    {/* Banner */}
                    <div className="h-32 lg:h-36 relative">
                      <img src={mockupPrestigeBanner} alt="Service Prestige" className="w-full h-full object-cover" />
                      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 z-20">
                        <div className="w-16 h-16 rounded-2xl shadow-xl ring-4 ring-card overflow-hidden">
                          <img src={mockupLogoClean} alt="Logo" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="px-6 pb-6 pt-11 text-center">
                      <h3 className="text-base font-bold text-foreground mb-0.5 tracking-wide">SERVICE PRESTIGE</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                        Expertise & Excellence in Luxury Cleaning
                      </p>
                      
                      {/* Open badge */}
                      <div className="flex justify-center mb-4">
                        <span className="inline-flex items-center gap-2 text-xs bg-white dark:bg-card border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 px-4 py-1.5 rounded-full font-medium shadow-sm">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                           {t('mockup.open')}
                        </span>
                      </div>
                      
                      {/* Social icons row */}
                      <div className="flex justify-center gap-3 mb-5">
                        {[Instagram, Facebook, Mail].map((Icon, i) => (
                          <div key={i} className="w-10 h-10 rounded-full flex items-center justify-center bg-card border-2 border-foreground/20">
                            <Icon className="w-4.5 h-4.5 text-foreground" />
                          </div>
                        ))}
                      </div>
                      
                      {/* Formules section with images */}
                      <div className="text-left mb-5">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-base font-semibold text-foreground">{t('mockup.ourPackages')}</h4>
                          <span className="text-xs text-primary font-medium">{t('mockup.seeAll')}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-xl overflow-hidden bg-card shadow-sm ring-1 ring-border/20">
                            <div className="aspect-[4/3] overflow-hidden">
                              <img src={mockupWindowCleaning} alt="Nettoyage de vitres" className="w-full h-full object-cover" />
                            </div>
                            <div className="px-2.5 py-2">
                              <p className="text-[10px] lg:text-xs font-semibold text-foreground leading-tight">Nettoyage de vitres</p>
                              <p className="text-[11px] lg:text-sm font-medium text-muted-foreground italic">Sur devis</p>
                            </div>
                          </div>
                          <div className="rounded-xl overflow-hidden bg-card shadow-sm ring-1 ring-border/20">
                            <div className="aspect-[4/3] overflow-hidden">
                              <img src={mockupTerraceCleaning} alt="Nettoyage de terrasses" className="w-full h-full object-cover" />
                            </div>
                            <div className="px-2.5 py-2">
                              <p className="text-[10px] lg:text-xs font-semibold text-foreground leading-tight">Nettoyage de terrasses</p>
                              <p className="text-[11px] lg:text-sm font-medium text-muted-foreground italic">Sur devis</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* CTA Button */}
                      <button className="w-full bg-neutral-800 dark:bg-neutral-700 text-white py-4 rounded-2xl text-base font-semibold shadow-lg">
                        {t('mockup.bookNow')}
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
                    <p className="text-[10px] text-muted-foreground mb-2 font-medium">{t('mockup.colors')}</p>
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
                    <p className="text-[10px] text-muted-foreground mb-2 font-medium">{t('mockup.availability')}</p>
                    <div className="space-y-1.5">
                      {[
                        { day: t('mockup.mon'), hours: '9h-18h', active: true },
                        { day: t('mockup.tue'), hours: '9h-18h', active: true },
                        { day: t('mockup.wed'), hours: '14h-18h', active: true },
                        { day: t('mockup.sat'), hours: t('mockup.closed'), active: false },
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
                    <p className="text-[10px] text-muted-foreground mb-2 font-medium">{t('mockup.packages')}</p>
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
                        {t('mockup.add')}
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
                      <p className="text-[10px] text-muted-foreground">{t('mockup.text')}</p>
                      <p className="text-xs font-medium text-foreground">{t('mockup.addContent')}</p>
                    </div>
                  </div>
                </div>
                
                {/* Images/Gallery - Bottom Right */}
                <div 
                  className="absolute bottom-8 lg:bottom-12 right-8 lg:right-16 z-30 animate-float"
                  style={{ animationDelay: '0.5s' }}
                >
                  <div className="bg-card rounded-2xl p-3 shadow-xl ring-1 ring-border/30 backdrop-blur-sm">
                    <p className="text-[10px] text-muted-foreground mb-2 font-medium">{t('mockup.gallery')}</p>
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
               {t('mockup.shareTitle')}
             </h2>
             <p className="opacity-0 animate-fade-in-up stagger-1 text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
               {t('mockup.shareDesc')}
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
                      cleaningpage.com/<span className="text-primary">{t('mockup.shareYou')}</span>
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
            <span className="text-xs font-medium uppercase tracking-wider">{t('mockup.management')}</span>
          </div>
          
          <h2 className="opacity-0 animate-fade-in-up stagger-1 text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground tracking-tight mb-4">
            {t('landing.section2Title')}
          </h2>
          <p className="opacity-0 animate-fade-in-up stagger-2 text-muted-foreground text-base sm:text-lg mb-8 max-w-2xl leading-relaxed">
            {t('landing.section2Desc')}
          </p>

          {/* Dashboard Tabs Preview - Interactive */}
          <div className="text-center mb-4 opacity-0 animate-fade-in-up stagger-3">
             <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
               <MousePointer2 className="w-4 h-4" />
               {t('mockup.clickTab')}
            </p>
          </div>
          <div className="opacity-0 animate-fade-in-up stagger-3 flex flex-wrap gap-2 sm:gap-3 mb-10 justify-center">
            {[
               { img: tabReservations, label: t('mockup.reservations'), tab: 'reservations' as const, badge: '3' },
               { img: tabAgenda, label: t('mockup.calendar'), tab: 'calendar' as const, badge: null },
               { img: tabClients, label: t('mockup.clients'), tab: 'clients' as const, badge: null },
               { img: tabFactures, label: t('mockup.invoices'), tab: 'invoices' as const, badge: null },
               { img: tabStats, label: t('mockup.statistics'), tab: 'stats' as const, badge: null },
               { img: tabMaPage, label: t('mockup.myPage'), tab: 'mypage' as const, badge: null },
               { img: tabFormules, label: t('mockup.formulas'), tab: 'formules' as const, badge: null },
            ].map((item) => (
              <button 
                key={item.label}
                onClick={() => { setDashboardTab(item.tab); setShowClientDetail(false); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all cursor-pointer ${
                  dashboardTab === item.tab 
                    ? 'bg-foreground text-background shadow-lg' 
                    : 'bg-card border border-border/60 text-foreground hover:bg-secondary/50'
                }`}
              >
                <img src={item.img} alt={item.label} className={`w-5 h-5 object-contain ${dashboardTab === item.tab ? 'brightness-0 invert' : ''}`} />
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
                {/* Main Content Area */}
                <div className="flex-1 p-5 sm:p-6 overflow-y-auto" style={{ background: 'linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--secondary)/0.3) 100%)' }}>
                  
                  {/* === RÉSERVATIONS === */}
                  {dashboardTab === 'reservations' && (
                    <>
                      <div className="flex items-center justify-between mb-6">
                        <div>
                           <h3 className="text-lg font-semibold text-foreground tracking-tight">{t('mockup.reservations')}</h3>
                           <p className="text-xs text-muted-foreground mt-0.5">{t('mockup.wednesday')} 11 {t('mockup.february2026').toLowerCase()}</p>
                         </div>
                         <button className="bg-blue-500 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-lg shadow-blue-500/25 hover:bg-blue-600 transition-colors">
                           {t('mockup.newBooking')}
                         </button>
                      </div>

                      {/* KPI row — clean widget style */}
                      <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="rounded-2xl p-4 bg-card border border-border/30 shadow-sm">
                           <p className="text-[11px] text-muted-foreground mb-1">{t('mockup.today')}</p>
                           <p className="text-3xl font-bold tracking-tight leading-none text-foreground">5</p>
                           <div className="flex items-center gap-1.5 mt-2">
                             <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                             <p className="text-[10px] text-muted-foreground font-medium">2 {t('mockup.pendingCount')}</p>
                           </div>
                         </div>
                         <div className="rounded-2xl p-4 bg-card border border-border/30 shadow-sm">
                           <p className="text-[11px] text-muted-foreground mb-1">{t('mockup.thisWeek')}</p>
                           <p className="text-3xl font-bold tracking-tight leading-none text-foreground">23</p>
                           <p className="text-[10px] text-muted-foreground mt-2">{t('mockup.includingRequests', { count: 4 })}</p>
                         </div>
                         <div className="rounded-2xl p-4 bg-card border border-border/30 shadow-sm">
                           <p className="text-[11px] text-muted-foreground mb-1">{t('mockup.dailyRevenue')}</p>
                           <p className="text-3xl font-bold tracking-tight leading-none text-foreground">340€</p>
                           <p className="text-[10px] text-emerald-600 font-semibold mt-2">↑ 15%</p>
                         </div>
                      </div>

                      {/* Segmented control */}
                      <div className="flex gap-0 bg-secondary/50 rounded-full p-1 mb-5 w-fit">
                         <span className="text-[11px] font-semibold bg-card shadow-sm px-4 py-1.5 rounded-full">{t('mockup.upcoming')}</span>
                         <span className="text-[11px] font-medium text-muted-foreground px-4 py-1.5 rounded-full cursor-pointer hover:text-foreground transition-colors">{t('mockup.requestsTab')}</span>
                         <span className="text-[11px] font-medium text-muted-foreground px-4 py-1.5 rounded-full cursor-pointer hover:text-foreground transition-colors">{t('mockup.past')}</span>
                      </div>

                      <div className="space-y-2">
                        {[
                           { name: 'Jean Martin', service: 'Nettoyage Complet', time: '10:00', duration: '1h30', price: '89€', status: t('mockup.confirmed'), statusBg: 'bg-emerald-500', initials: 'JM', avatarBg: 'bg-blue-500' },
                           { name: 'Marie Dupont', service: 'Express', time: '11:30', duration: '45min', price: '35€', status: t('mockup.pending'), statusBg: 'bg-orange-500', initials: 'MD', avatarBg: 'bg-pink-500' },
                           { name: 'Pierre Bernard', service: 'Rénovation Premium', time: '14:00', duration: '3h', price: '159€', status: t('mockup.confirmed'), statusBg: 'bg-emerald-500', initials: 'PB', avatarBg: 'bg-amber-500' },
                           { name: t('mockup.incomingRequest'), service: t('mockup.couchCleaning'), time: '—', duration: '—', price: t('mockup.onQuote'), status: t('mockup.request'), statusBg: 'bg-blue-500', initials: '?', avatarBg: 'bg-indigo-500' },
                           { name: 'Sophie Leroy', service: 'Pack Intérieur', time: '16:30', duration: '1h', price: '65€', status: t('mockup.confirmed'), statusBg: 'bg-emerald-500', initials: 'SL', avatarBg: 'bg-violet-500' },
                        ].map((booking, i) => (
                          <div key={i} className="flex items-center gap-3.5 bg-card rounded-2xl p-3.5 border border-border/20 hover:shadow-md transition-all cursor-pointer">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0 ${booking.avatarBg}`}>
                              {booking.initials}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-semibold text-foreground truncate">{booking.name}</p>
                              <p className="text-[11px] text-muted-foreground mt-0.5">{booking.service} · {booking.time} · {booking.duration}</p>
                            </div>
                            <span className="text-[13px] font-bold text-foreground hidden sm:block tabular-nums">{booking.price}</span>
                            <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold text-white ${booking.statusBg}`}>
                              {booking.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* === CALENDRIER === */}
                  {dashboardTab === 'calendar' && (
                    <div className="flex flex-col gap-4 h-full">
                      {/* Google Agenda connection banner */}
                      <div className="flex items-center justify-between bg-card rounded-2xl p-3.5 border border-border/20 shadow-sm">
                        <div className="flex items-center gap-3">
                          <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                          <div>
                            <p className="text-[12px] font-semibold text-foreground">{t('mockup.connectGoogle')}</p>
                            <p className="text-[10px] text-muted-foreground">{t('mockup.syncAuto')}</p>
                          </div>
                        </div>
                        <button className="text-[11px] text-white font-semibold bg-blue-500 px-3.5 py-1.5 rounded-full shadow-sm shadow-blue-500/25 hover:bg-blue-600 transition-colors shrink-0">{t('mockup.connect')}</button>
                      </div>

                      <div className="flex gap-6 flex-1">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-5">
                          <div className="flex items-center gap-3">
                            <button className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center hover:bg-secondary transition-colors">
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <h3 className="text-base font-semibold text-foreground min-w-[130px] text-center">{t('mockup.february2026')}</h3>
                            <button className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center hover:bg-secondary transition-colors">
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                          <button className="text-[11px] text-white font-semibold bg-blue-500 px-3.5 py-1.5 rounded-full shadow-sm shadow-blue-500/25 hover:bg-blue-600 transition-colors">{t('common.today')}</button>
                        </div>

                        <div className="grid grid-cols-7 gap-1 mb-2">
                          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                            <div key={i} className="text-center text-[11px] font-semibold text-muted-foreground py-1">{d}</div>
                          ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                          {[26, 27, 28, 29, 30, 31].map((d, i) => (
                            <div key={`prev-${i}`} className="aspect-square rounded-2xl flex flex-col items-center justify-start pt-2 text-[11px] text-muted-foreground/25">
                              <span>{d}</span>
                            </div>
                          ))}
                          {Array.from({ length: 28 }, (_, i) => i + 1).map(d => {
                            const hasAppointments = [3, 5, 8, 11, 12, 15, 18, 22, 25].includes(d);
                            const isSelected = d === 11;
                            const count = d === 11 ? 3 : d === 15 ? 2 : d === 22 ? 4 : 1;
                            return (
                              <div key={d} className={`aspect-square rounded-2xl flex flex-col items-center justify-start pt-2 text-[11px] relative cursor-pointer transition-all ${
                                isSelected ? 'bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/30' : 'hover:bg-secondary/50'
                              }`}>
                                <span>{d}</span>
                                {hasAppointments && (
                                  <div className="flex gap-0.5 mt-1">
                                    {Array.from({ length: Math.min(count, 3) }).map((_, j) => (
                                      <div key={j} className={`w-1.5 h-1.5 rounded-full ${
                                        isSelected ? 'bg-white/70' :
                                        j === 0 ? 'bg-emerald-500' : j === 1 ? 'bg-orange-400' : 'bg-blue-500'
                                      }`} />
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        <div className="flex gap-5 mt-4 pt-3 border-t border-border/20">
                          {[
                            { color: 'bg-emerald-500', label: t('mockup.confirmed') },
                            { color: 'bg-orange-400', label: t('mockup.pending') },
                            { color: 'bg-blue-500', label: t('mockup.completed') },
                          ].map(l => (
                            <div key={l.label} className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${l.color}`} />
                              <span className="text-[10px] text-muted-foreground font-medium">{l.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right: Selected Day Detail */}
                      <div className="w-48 hidden lg:flex flex-col border-l border-border/20 pl-5">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                            <span className="text-[10px] text-white font-bold">11</span>
                          </div>
                          <p className="text-sm font-semibold text-foreground">{t('mockup.wednesday')}</p>
                        </div>
                        <p className="text-[11px] text-muted-foreground mb-4">3 {t('mockup.appointmentsCount')} · 340€</p>
                        <div className="space-y-2.5 flex-1">
                          {[
                            { time: '10:00', name: 'Jean M.', service: 'Complet · 89€', color: 'bg-emerald-500', initials: 'JM' },
                            { time: '11:30', name: 'Marie D.', service: 'Express · 35€', color: 'bg-orange-400', initials: 'MD' },
                            { time: '14:00', name: 'Pierre B.', service: 'Rénovation · 159€', color: 'bg-emerald-500', initials: 'PB' },
                          ].map((rdv, i) => (
                            <div key={i} className="bg-card rounded-xl p-2.5 border border-border/20 hover:shadow-sm transition-all cursor-pointer">
                              <div className="flex items-center gap-2 mb-1">
                                <div className={`w-1.5 h-1.5 rounded-full ${rdv.color}`} />
                                <span className="text-[11px] font-semibold text-foreground">{rdv.time}</span>
                              </div>
                              <p className="text-[11px] font-medium text-foreground">{rdv.name}</p>
                              <p className="text-[10px] text-muted-foreground">{rdv.service}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      </div>
                    </div>
                  )}

                  {/* === CLIENTS === */}
                  {dashboardTab === 'clients' && (
                    <>
                      {!showClientDetail ? (
                        <>
                          <div className="flex items-center justify-between mb-6">
                            <div>
                              <h3 className="text-lg font-semibold text-foreground tracking-tight">{t('mockup.clients')}</h3>
                              <p className="text-xs text-muted-foreground mt-0.5">142 {t('mockup.registeredClients')}</p>
                            </div>
                            <button className="bg-blue-500 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-lg shadow-blue-500/25 hover:bg-blue-600 transition-colors">
                              {t('mockup.add')}
                            </button>
                          </div>

                          {/* Stats overview at top */}
                          <div className="grid grid-cols-3 gap-3 mb-5">
                            {[
                              { value: '142', label: t('mockup.clients') },
                              { value: '8 640€', label: t('mockup.totalRevenue') },
                              { value: '61€', label: t('mockup.avgBasket') },
                            ].map((s, i) => (
                              <div key={i} className="rounded-2xl p-3 sm:p-4 bg-card border border-border/30 shadow-sm text-center">
                                <p className="text-lg sm:text-xl font-bold text-foreground tracking-tight">{s.value}</p>
                                <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
                              </div>
                            ))}
                          </div>

                          {/* Search */}
                          <div className="relative mb-5">
                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                            <div className="bg-card rounded-2xl pl-11 pr-4 py-3 text-xs text-muted-foreground/50 border border-border/20 shadow-sm">
                              {t('mockup.searchClient')}
                            </div>
                          </div>

                          {/* Hint */}
                          <p className="text-[11px] text-center text-muted-foreground mb-3 flex items-center justify-center gap-1.5">
                            <MousePointer2 className="w-3 h-3" />
                            {t('mockup.clickClientHint')}
                          </p>

                          <div className="space-y-2">
                            {[
                              { name: 'Sophie Leroy', rdvCount: 15, totalSpent: '1 420€', lastVisit: t('common.today'), initials: 'SL', avatarBg: 'bg-violet-500' },
                              { name: 'Jean Martin', rdvCount: 12, totalSpent: '1 068€', lastVisit: '10 fév', initials: 'JM', avatarBg: 'bg-blue-500' },
                              { name: 'Marie Dupont', rdvCount: 8, totalSpent: '520€', lastVisit: '8 fév', initials: 'MD', avatarBg: 'bg-pink-500' },
                              { name: 'Pierre Bernard', rdvCount: 3, totalSpent: '477€', lastVisit: '2 fév', initials: 'PB', avatarBg: 'bg-amber-500' },
                            ].map((client, i) => (
                              <div key={i} onClick={() => setShowClientDetail(true)} className="flex items-center gap-3.5 bg-card rounded-2xl p-3.5 border border-border/15 hover:shadow-md transition-all cursor-pointer group">
                                <div className={`w-11 h-11 rounded-full flex items-center justify-center text-[12px] font-bold text-white shrink-0 ${client.avatarBg}`}>
                                  {client.initials}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[13px] font-semibold text-foreground truncate">{client.name}</p>
                                  <p className="text-[11px] text-muted-foreground mt-0.5">{client.rdvCount} {t('mockup.visits')} · {t('mockup.lastVisitLabel')} {client.lastVisit}</p>
                                </div>
                                <div className="text-right hidden sm:block">
                                  <p className="text-[13px] font-bold text-foreground tabular-nums">{client.totalSpent}</p>
                                  <p className="text-[10px] text-muted-foreground">{t('mockup.totalRevenue')}</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors shrink-0" />
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        /* === CLIENT DETAIL VIEW === */
                        <div className="animate-fade-in">
                          {/* Back button */}
                          <button onClick={() => setShowClientDetail(false)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4 transition-colors">
                            <ChevronLeft className="w-4 h-4" />
                            {t('mockup.backToClients')}
                          </button>

                          {/* Client header */}
                          <div className="flex items-center gap-4 mb-5">
                            <div className="w-14 h-14 rounded-full bg-violet-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
                              SL
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-semibold text-foreground">Sophie Leroy</h3>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                                <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                  <Phone className="w-3 h-3" /> 06 12 34 56 78
                                </span>
                                <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                  <Mail className="w-3 h-3" /> sophie.leroy@email.com
                                </span>
                                <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                  <MapPin className="w-3 h-3" /> 12 rue de Rivoli, 75001
                                </span>
                              </div>
                            </div>
                            <span className="text-[10px] bg-blue-500/10 text-blue-600 px-2.5 py-1 rounded-full font-medium shrink-0 hidden sm:inline">{t('mockup.viaBooking')}</span>
                          </div>

                          {/* Client KPIs */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                            {[
                              { value: '15', label: t('mockup.reservations') },
                              { value: '1 420€', label: t('mockup.totalRevenue') },
                              { value: '3', label: t('mockup.invoices') },
                              { value: '1', label: t('mockup.quotes') },
                            ].map((s, i) => (
                              <div key={i} className="rounded-2xl p-3 bg-card border border-border/30 shadow-sm text-center">
                                <p className="text-xl font-bold text-foreground tracking-tight">{s.value}</p>
                                <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
                              </div>
                            ))}
                          </div>

                          {/* Default service */}
                          <div className="bg-primary/5 border border-primary/15 rounded-2xl p-3.5 mb-5">
                            <p className="text-[10px] text-muted-foreground mb-1">{t('mockup.defaultService')}</p>
                            <p className="text-[13px] font-semibold text-foreground flex items-center gap-2">
                              <Sparkles className="w-3.5 h-3.5 text-primary" />
                              Nettoyage Complet · 1h30 · 89€
                            </p>
                          </div>

                          {/* Notes */}
                          <div className="bg-secondary/30 rounded-2xl p-3.5 mb-5">
                            <p className="text-[10px] text-muted-foreground mb-1">{t('mockup.notes')}</p>
                            <p className="text-[12px] text-foreground">{t('mockup.loyalClientNote')}</p>
                          </div>

                          {/* Tabs: Prestations / Factures */}
                          <div className="flex gap-0 bg-secondary/50 rounded-full p-1 mb-4 w-fit">
                            <span className="text-[11px] font-semibold bg-card shadow-sm px-4 py-1.5 rounded-full">{t('mockup.services')}</span>
                            <span className="text-[11px] font-medium text-muted-foreground px-4 py-1.5 rounded-full cursor-pointer hover:text-foreground transition-colors">{t('mockup.invoicesQuotes')}</span>
                          </div>

                          {/* Appointments history */}
                          <div className="space-y-2 max-h-[200px] overflow-y-auto">
                            {[
                              { service: 'Nettoyage Complet', date: '11 fév 2026 à 10:00', price: '89€', status: 'Confirmé', statusBg: 'bg-emerald-500' },
                              { service: 'Nettoyage Complet', date: '28 jan 2026 à 09:30', price: '89€', status: 'Terminé', statusBg: 'bg-secondary' },
                              { service: 'Lavage Express', date: '15 jan 2026 à 14:00', price: '35€', status: 'Terminé', statusBg: 'bg-secondary' },
                              { service: 'Rénovation Premium', date: '22 déc 2025 à 10:00', price: '159€', status: 'Terminé', statusBg: 'bg-secondary' },
                              { service: 'Nettoyage Complet', date: '5 déc 2025 à 11:00', price: '89€', status: 'Terminé', statusBg: 'bg-secondary' },
                            ].map((apt, i) => (
                              <div key={i} className="flex items-center justify-between gap-3 p-3 bg-card rounded-xl border border-border/15">
                                <div className="flex-1 min-w-0">
                                  <p className="text-[12px] font-medium text-foreground truncate">{apt.service}</p>
                                  <p className="text-[10px] text-muted-foreground">{apt.date}</p>
                                </div>
                                <span className="text-[12px] font-bold text-foreground tabular-nums">{apt.price}</span>
                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold ${apt.statusBg === 'bg-emerald-500' ? 'bg-emerald-500 text-white' : 'bg-secondary text-muted-foreground'}`}>
                                  {apt.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* === FACTURES & DEVIS === */}
                  {dashboardTab === 'invoices' && (
                    <>
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground tracking-tight">{t('mockup.invoicesQuotes')}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">{t('mockup.manageDocuments')}</p>
                        </div>
                        <div className="flex gap-2">
                          <button className="bg-secondary/60 text-foreground px-3.5 py-2 rounded-full text-xs font-semibold hover:bg-secondary transition-colors">{t('mockup.quotes')}</button>
                          <button className="bg-blue-500 text-white px-3.5 py-2 rounded-full text-xs font-semibold shadow-sm shadow-blue-500/25">{t('mockup.newInvoice')}</button>
                        </div>
                      </div>

                      {/* KPIs — clean */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                        <div className="rounded-2xl p-4 bg-card border border-border/30 shadow-sm">
                          <p className="text-[11px] text-muted-foreground mb-1">{t('mockup.invoices')}</p>
                          <p className="text-2xl font-bold tracking-tight leading-none text-foreground">24</p>
                        </div>
                        <div className="rounded-2xl p-4 bg-card border border-border/30 shadow-sm">
                          <p className="text-[11px] text-muted-foreground mb-1">{t('mockup.quotes')}</p>
                          <p className="text-2xl font-bold tracking-tight leading-none text-foreground">8</p>
                        </div>
                        <div className="rounded-2xl p-4 bg-card border border-border/30 shadow-sm">
                          <p className="text-[11px] text-muted-foreground mb-1">{t('mockup.pending')}</p>
                          <p className="text-2xl font-bold tracking-tight leading-none text-foreground">680€</p>
                        </div>
                        <div className="rounded-2xl p-4 bg-card border border-border/30 shadow-sm">
                          <p className="text-[11px] text-muted-foreground mb-1">{t('mockup.collected')}</p>
                          <p className="text-2xl font-bold tracking-tight leading-none text-foreground">3 240€</p>
                        </div>
                      </div>

                      {/* Segmented control */}
                      <div className="flex gap-0 bg-secondary/50 rounded-full p-1 mb-5 w-fit">
                        <span className="text-[11px] font-semibold bg-card shadow-sm px-4 py-1.5 rounded-full">{t('mockup.all')}</span>
                        <span className="text-[11px] font-medium text-muted-foreground px-4 py-1.5 rounded-full cursor-pointer">{t('mockup.invoices')}</span>
                        <span className="text-[11px] font-medium text-muted-foreground px-4 py-1.5 rounded-full cursor-pointer">{t('mockup.quotes')}</span>
                      </div>

                      {/* Invoice list */}
                      <div className="space-y-2">
                        {[
                          { number: 'FAC-2026-012', client: 'Jean Martin', date: '10 fév', total: '89,00 €', status: t('mockup.paid'), statusBg: 'bg-emerald-500' },
                          { number: 'FAC-2026-011', client: 'Marie Dupont', date: '8 fév', total: '159,00 €', status: t('mockup.sent'), statusBg: 'bg-blue-500' },
                          { number: 'DEV-2026-005', client: 'Pierre Bernard', date: '5 fév', total: '320,00 €', status: t('mockup.pending'), statusBg: 'bg-orange-500' },
                          { number: 'FAC-2026-010', client: 'Sophie Leroy', date: '3 fév', total: '65,00 €', status: t('mockup.paid'), statusBg: 'bg-emerald-500' },
                        ].map((inv, i) => (
                          <div key={i} className="flex items-center gap-3.5 bg-card rounded-2xl px-4 py-3.5 border border-border/15 hover:shadow-md transition-all cursor-pointer">
                            <div className={`w-2 h-8 rounded-full ${inv.statusBg}`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-semibold text-foreground">{inv.number}</p>
                              <p className="text-[11px] text-muted-foreground mt-0.5">{inv.client} · {inv.date}</p>
                            </div>
                            <span className="text-[13px] font-bold text-foreground tabular-nums">{inv.total}</span>
                            <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold text-white ${inv.statusBg}`}>{inv.status}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* === STATISTIQUES === */}
                  {dashboardTab === 'stats' && (
                    <>
                      {/* Month navigation */}
                      <div className="flex items-center justify-between mb-6">
                        <button className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center hover:bg-secondary transition-colors">
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <h3 className="text-lg font-semibold text-foreground tracking-tight">{t('mockup.january2025')}</h3>
                        <button className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center hover:bg-secondary transition-colors">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      {/* KPIs — clean white cards with borders */}
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="rounded-2xl p-4 bg-card border border-border/30 shadow-sm">
                          <p className="text-[11px] text-muted-foreground mb-1">{t('mockup.reservations')}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-3xl font-bold tracking-tight leading-none text-foreground">24</p>
                            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">↑12%</span>
                          </div>
                        </div>
                        <div className="rounded-2xl p-4 bg-card border border-border/30 shadow-sm">
                          <p className="text-[11px] text-muted-foreground mb-1">{t('mockup.revenue')}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-3xl font-bold tracking-tight leading-none text-foreground">8 450€</p>
                            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">↑18%</span>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="rounded-2xl p-4 bg-card border border-border/30 shadow-sm">
                          <p className="text-[11px] text-muted-foreground mb-1">{t('mockup.clients')}</p>
                          <p className="text-3xl font-bold tracking-tight leading-none text-foreground">18</p>
                        </div>
                        <div className="rounded-2xl p-4 bg-card border border-border/30 shadow-sm">
                          <p className="text-[11px] text-muted-foreground mb-1">{t('mockup.avgBasketStat')}</p>
                          <p className="text-3xl font-bold tracking-tight leading-none text-foreground">352€</p>
                        </div>
                      </div>

                      {/* Segmented control */}
                      <div className="flex gap-0 bg-secondary/50 rounded-full p-1 mb-5 w-fit">
                        <span className="text-[11px] font-semibold bg-card shadow-sm px-4 py-1.5 rounded-full">{t('mockup.evolution')}</span>
                        <span className="text-[11px] font-medium text-muted-foreground px-4 py-1.5 rounded-full cursor-pointer hover:text-foreground transition-colors">{t('mockup.servicesTab')}</span>
                      </div>

                      {/* Charts row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Line chart — Réservations par semaine */}
                        <div className="bg-card rounded-2xl p-5 border border-border/15 shadow-sm">
                          <p className="text-sm font-semibold text-foreground mb-4">{t('mockup.weeklyBookings')}</p>
                          <div className="relative h-32">
                            <svg viewBox="0 0 300 100" className="w-full h-full" preserveAspectRatio="none">
                              <defs>
                                <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.15" />
                                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                                </linearGradient>
                              </defs>
                              {[25, 50, 75].map(y => (
                                <line key={y} x1="0" y1={y} x2="300" y2={y} stroke="hsl(var(--border))" strokeWidth="0.3" />
                              ))}
                              {/* Y-axis labels */}
                              <text x="2" y="18" fill="hsl(var(--muted-foreground))" fontSize="7" opacity="0.6">8</text>
                              <text x="2" y="35" fill="hsl(var(--muted-foreground))" fontSize="7" opacity="0.6">6</text>
                              <text x="2" y="55" fill="hsl(var(--muted-foreground))" fontSize="7" opacity="0.6">4</text>
                              <text x="2" y="78" fill="hsl(var(--muted-foreground))" fontSize="7" opacity="0.6">2</text>
                              <text x="2" y="98" fill="hsl(var(--muted-foreground))" fontSize="7" opacity="0.6">0</text>
                              {/* Area */}
                              <path d="M20,80 C50,75 70,68 100,55 C130,42 160,35 190,30 C220,28 250,25 280,22 L280,100 L20,100 Z" fill="url(#lineGrad)" />
                              {/* Line */}
                              <path d="M20,80 C50,75 70,68 100,55 C130,42 160,35 190,30 C220,28 250,25 280,22" fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" />
                              <circle cx="280" cy="22" r="3.5" fill="#3B82F6" />
                            </svg>
                            <div className="flex justify-between mt-2 px-2">
                              {['9 déc', '16 déc', '23 déc', '30 déc', '6 jan', '13 jan', '20 jan'].map(m => (
                                <span key={m} className="text-[8px] text-muted-foreground">{m}</span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Bar chart — CA par mois */}
                        <div className="bg-card rounded-2xl p-5 border border-border/15 shadow-sm">
                          <div className="flex items-center justify-between mb-4">
                            <p className="text-sm font-semibold text-foreground">{t('mockup.monthlyRevenue')}</p>
                            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+18%</span>
                          </div>
                          <div className="relative h-32">
                            <svg viewBox="0 0 300 100" className="w-full h-full" preserveAspectRatio="none">
                              {[25, 50, 75].map(y => (
                                <line key={y} x1="0" y1={y} x2="300" y2={y} stroke="hsl(var(--border))" strokeWidth="0.3" />
                              ))}
                              {/* Y-axis labels */}
                              <text x="2" y="8" fill="hsl(var(--muted-foreground))" fontSize="7" opacity="0.6">10k</text>
                              <text x="2" y="30" fill="hsl(var(--muted-foreground))" fontSize="7" opacity="0.6">7.5k</text>
                              <text x="2" y="53" fill="hsl(var(--muted-foreground))" fontSize="7" opacity="0.6">5k</text>
                              <text x="2" y="78" fill="hsl(var(--muted-foreground))" fontSize="7" opacity="0.6">2.5k</text>
                              <text x="2" y="98" fill="hsl(var(--muted-foreground))" fontSize="7" opacity="0.6">0</text>
                              {/* Bars with rounded tops */}
                              {[
                                { x: 40, h: 45 },
                                { x: 80, h: 50 },
                                { x: 120, h: 48 },
                                { x: 160, h: 55 },
                                { x: 200, h: 60 },
                                { x: 240, h: 70 },
                              ].map((bar, i) => (
                                <rect key={i} x={bar.x} y={100 - bar.h} width="22" height={bar.h} rx="6" ry="6" fill={i === 5 ? '#10B981' : '#10B981'} opacity={i === 5 ? 1 : 0.4} />
                              ))}
                              {/* Dashed target line */}
                              <line x1="30" y1="35" x2="270" y2="35" stroke="#10B981" strokeWidth="1" strokeDasharray="4,3" opacity="0.5" />
                            </svg>
                            <div className="flex justify-between mt-2 px-5">
                              {['août', 'sept.', 'oct.', 'nov.', 'déc.', 'janv.'].map((m, i) => (
                                <span key={m} className={`text-[8px] ${i === 5 ? 'text-foreground font-bold' : 'text-muted-foreground'}`}>{m}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* === MA PAGE === */}
                  {dashboardTab === 'mypage' && (
                    <div className="h-full flex flex-col">
                      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left: iPhone-style Preview */}
                        <div className="flex flex-col order-2 lg:order-1">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-base font-semibold text-foreground tracking-tight">{t('mockup.preview')}</span>
                            <div className="flex gap-2">
                              <div className="w-8 h-8 bg-secondary/40 rounded-full flex items-center justify-center cursor-pointer hover:bg-secondary transition-colors">
                                <Phone className="w-4 h-4 text-muted-foreground" />
                              </div>
                              <div className="w-8 h-8 bg-secondary/40 rounded-full flex items-center justify-center cursor-pointer hover:bg-secondary transition-colors">
                                <Globe className="w-4 h-4 text-muted-foreground" />
                              </div>
                            </div>
                          </div>
                          
                          {/* iPhone frame */}
                          <div className="flex-1 flex justify-center">
                            <div className="w-full max-w-[280px] sm:max-w-[300px] bg-foreground/5 rounded-[2.5rem] shadow-2xl border border-border/15 p-2.5 relative" style={{ boxShadow: '0 25px 60px -12px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.04)' }}>
                              {/* Dynamic Island */}
                              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-20 h-[18px] bg-foreground rounded-full z-10" />
                              
                              <div className="rounded-[2rem] overflow-hidden bg-card h-[440px] sm:h-[500px] overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                                {mockupPageStyle === 'banner' ? (
                                  <>
                                    <div className="h-32 relative">
                                      <img src={mockupBanner} alt="" className="w-full h-full object-cover" />
                                      <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent" />
                                      <div className="absolute top-4 left-4">
                                        <div className="w-10 h-10 rounded-xl shadow-lg overflow-hidden bg-card ring-2 ring-white/30">
                                          <img src={gocleanLogo} alt="" className="w-full h-full object-cover" />
                                        </div>
                                      </div>
                                      <div className="absolute top-4 right-4">
                                        <div className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center shadow-sm">
                                          <Phone className="w-3.5 h-3.5 text-foreground" />
                                        </div>
                                      </div>
                                    </div>
                                    <div className="px-5 pt-4 pb-5">
                                      <h3 className="text-[15px] font-bold text-foreground text-center mb-0.5 tracking-tight">GOCLEANING</h3>
                                      <p className="text-[9px] text-muted-foreground text-center mb-2">{t('mockup.premiumAutoParis')}</p>
                                      <div className="flex items-center justify-center gap-2 mb-1.5">
                                        <span className="inline-flex items-center gap-1 text-[9px] text-emerald-600 font-semibold"><span className="w-1 h-1 bg-emerald-500 rounded-full" />{t('mockup.open')}</span>
                                        <span className="text-[9px] text-muted-foreground">· {t('mockup.closesAt')}</span>
                                      </div>
                                      <div className="flex items-center justify-center gap-0.5 mb-4">
                                        {[...Array(5)].map((_, i) => <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />)}
                                        <span className="text-[9px] text-muted-foreground ml-1 font-medium">4.9</span>
                                      </div>
                                      <div className="flex justify-center gap-3 mb-5">
                                        {[Instagram, Facebook, Globe].map((Icon, i) => (
                                          <div key={i} className="w-7 h-7 rounded-full bg-secondary/40 flex items-center justify-center"><Icon className="w-3 h-3 text-muted-foreground" /></div>
                                        ))}
                                      </div>
                                      <p className="text-[10px] font-semibold text-foreground mb-2 tracking-tight">{t('mockup.ourPackages')}</p>
                                      <div className="grid grid-cols-2 gap-2 mb-4">
                                        {[{ name: 'Express', price: '35€' }, { name: 'Complet', price: '89€' }].map((f, i) => (
                                          <div key={i} className="rounded-2xl overflow-hidden relative h-[85px] shadow-sm">
                                            <img src={mockupCarCleaning} alt="" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                                            <div className="absolute bottom-2.5 left-3">
                                              <p className="text-[9px] text-white/80 font-medium">{f.name}</p>
                                              <p className="text-[13px] text-white font-bold leading-tight">{f.price}</p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                      <button className="w-full bg-foreground text-background py-3 rounded-2xl text-[11px] font-semibold shadow-sm">{t('mockup.book')}</button>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    {/* Minimal: clean navbar */}
                                    <div className="flex items-center justify-between px-4 pt-8 pb-3">
                                      <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg overflow-hidden shadow-sm">
                                          <img src={gocleanLogo} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <span className="text-[11px] font-bold text-foreground tracking-tight">GOCLEANING</span>
                                      </div>
                                      <div className="w-7 h-7 rounded-full bg-foreground flex items-center justify-center">
                                        <Phone className="w-3 h-3 text-background" />
                                      </div>
                                    </div>
                                    <div className="w-full h-px bg-border/10" />
                                    
                                    <div className="px-5 pt-5 pb-5">
                                      {/* Brand info */}
                                      <h3 className="text-[17px] font-bold text-foreground mb-0.5 tracking-tight leading-tight">GOCLEANING</h3>
                                      <p className="text-[10px] text-muted-foreground mb-2.5 leading-relaxed">{t('mockup.premiumAutoFull')}</p>
                                      
                                      <div className="flex items-center gap-3 mb-2">
                                        <div className="flex items-center gap-1">
                                          <span className="inline-flex items-center gap-1 text-[9px] text-emerald-600 font-semibold"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />{t('mockup.open')}</span>
                                          <span className="text-[9px] text-muted-foreground">· {t('mockup.closesAt')}</span>
                                        </div>
                                      </div>
                                      
                                      <div className="flex items-center gap-1 mb-4">
                                        {[...Array(5)].map((_, i) => <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />)}
                                        <span className="text-[9px] text-muted-foreground ml-1 font-medium">4.9 (122 {t('mockup.reviews')})</span>
                                      </div>

                                      {/* Social icons */}
                                      <div className="flex gap-2 mb-5">
                                        {[Instagram, Facebook, Globe].map((Icon, i) => (
                                          <div key={i} className="w-8 h-8 rounded-xl bg-secondary/30 flex items-center justify-center border border-border/10 hover:bg-secondary/50 transition-colors cursor-pointer">
                                            <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                                          </div>
                                        ))}
                                      </div>
                                      
                                      {/* Formules */}
                                      <p className="text-[10px] font-semibold text-foreground mb-2.5 tracking-tight">{t('mockup.ourPackages')}</p>
                                      <div className="grid grid-cols-2 gap-2 mb-3">
                                        {[
                                          { name: 'Express', desc: 'Extérieur', price: '35€' },
                                          { name: 'Complet', desc: 'Int. + Ext.', price: '89€' },
                                          { name: 'Premium', desc: 'Rénovation', price: '159€' },
                                          { name: 'Canapé', desc: 'Textile', price: '79€' },
                                        ].map((f, i) => (
                                          <div key={i} className="rounded-2xl overflow-hidden relative h-[80px] shadow-sm group cursor-pointer">
                                            <img src={i < 2 ? mockupCarCleaning : sofaBanner} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                                            <div className="absolute bottom-2 left-2.5 right-2.5">
                                              <p className="text-[8px] text-white/70 font-medium">{f.desc}</p>
                                              <div className="flex items-baseline justify-between">
                                                <p className="text-[10px] text-white font-semibold">{f.name}</p>
                                                <p className="text-[11px] text-white font-bold">{f.price}</p>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                      
                                      <button className="w-full bg-foreground text-background py-3 rounded-2xl text-[11px] font-semibold shadow-sm mt-2">{t('mockup.book')}</button>
                                    </div>
                                  </>
                                )}
                              </div>
                              
                              {/* Home indicator */}
                              <div className="flex justify-center pt-1.5 pb-0.5">
                                <div className="w-24 h-1 bg-muted-foreground/15 rounded-full" />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right: Customization controls */}
                        <div className="flex flex-col order-1 lg:order-2">
                          <span className="text-base font-semibold text-foreground mb-4 tracking-tight">{t('mockup.customization')}</span>
                          
                          {/* Tabs with icons */}
                          <div className="flex items-center justify-between border-b border-border/15 mb-5">
                            {[
                              { id: 'design', label: t('mockup.design'), icon: <Palette className="w-4 h-4" /> },
                              { id: 'formules', label: t('mockup.formulas'), icon: <Tag className="w-4 h-4" /> },
                              { id: 'elements', label: t('mockup.elements'), icon: <Settings className="w-4 h-4" /> },
                              { id: 'seo', label: t('mockup.seo'), icon: <Globe className="w-4 h-4" /> },
                            ].map(tab => (
                              <button key={tab.id} onClick={() => setMockupTab(tab.id as any)}
                                className={`flex flex-col items-center gap-1.5 pb-3 px-3 transition-colors border-b-2 ${mockupTab === tab.id ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                              >
                                {tab.icon}
                                <span className="text-[11px] font-medium">{tab.label}</span>
                              </button>
                            ))}
                          </div>
                          
                          <div className="overflow-y-auto max-h-[450px] pr-1">
                            {mockupTab === 'design' && (
                              <div className="space-y-7">
                                {/* Banner */}
                                <div>
                                  <p className="text-sm font-semibold text-foreground mb-3">Bannière</p>
                                  <div className="rounded-2xl overflow-hidden mb-3 shadow-sm border border-border/10">
                                    <img src={mockupBanner} alt="Banner" className="w-full h-32 object-cover" />
                                  </div>
                                  <button className="text-[12px] font-medium text-foreground bg-secondary/40 hover:bg-secondary px-4 py-2 rounded-xl transition-colors flex items-center gap-2 border border-border/10">
                                    <Upload className="w-3.5 h-3.5" /> Changer
                                  </button>
                                </div>
                                
                                {/* Logo note */}
                                <p className="text-[11px] text-muted-foreground">Le logo se configure dans Paramètres → Informations</p>

                                {/* Color palettes */}
                                <div>
                                  <p className="text-sm font-semibold text-foreground mb-4">Couleurs</p>
                                  <div className="flex gap-4 flex-wrap mb-5">
                                    {[
                                      { name: 'Bleu', colors: ['#3B82F6', '#1D4ED8'] },
                                      { name: 'Rouge', colors: ['#EF4444', '#991B1B'] },
                                      { name: 'Vert', colors: ['#10B981', '#047857'] },
                                      { name: 'Violet', colors: ['#8B5CF6', '#6D28D9'] },
                                      { name: 'Orange', colors: ['#F59E0B', '#B45309'] },
                                    ].map((palette, i) => (
                                      <div key={i} className="flex flex-col items-center gap-1.5 cursor-pointer group">
                                        <div className={`flex -space-x-1 ${i === 2 ? 'ring-2 ring-foreground ring-offset-2 ring-offset-background rounded-full' : ''}`}>
                                          <div className="w-6 h-6 rounded-full border-2 border-card shadow-sm" style={{ backgroundColor: palette.colors[0] }} />
                                          <div className="w-6 h-6 rounded-full border-2 border-card shadow-sm" style={{ backgroundColor: palette.colors[1] }} />
                                        </div>
                                        <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors font-medium">{palette.name}</span>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Individual color controls */}
                                  <div className="grid grid-cols-3 gap-3">
                                    {[
                                      { label: 'Principale', color: '#10B981', hex: '#10B981' },
                                      { label: 'Titres', color: '#111827', hex: '#111827' },
                                      { label: 'Texte', color: '#6B7280', hex: '#6b7280' },
                                    ].map((item, i) => (
                                      <div key={i}>
                                        <p className="text-[10px] text-muted-foreground mb-1.5">{item.label}</p>
                                        <div className="flex items-center gap-2 bg-secondary/20 rounded-xl px-2.5 py-2 border border-border/10 cursor-pointer hover:border-border/30 transition-colors">
                                          <div className="w-5 h-5 rounded-lg shadow-sm shrink-0" style={{ backgroundColor: item.color }} />
                                          <span className="text-[10px] text-muted-foreground font-mono">{item.hex}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Style de page */}
                                <div>
                                  <p className="text-sm font-semibold text-foreground mb-3">Style de page</p>
                                  <div className="grid grid-cols-2 gap-3">
                                    <div onClick={() => setMockupPageStyle('banner')} className={`rounded-2xl p-4 cursor-pointer transition-colors ${mockupPageStyle === 'banner' ? 'border-2 border-foreground' : 'border border-border/20 hover:border-border/40'}`}>
                                      <div className="h-16 bg-secondary/30 rounded-xl mb-2 overflow-hidden">
                                        <div className="w-full h-8 bg-secondary/60" />
                                        <div className="flex justify-center -mt-3">
                                          <div className="w-6 h-6 rounded-lg bg-secondary border-2 border-card" />
                                        </div>
                                      </div>
                                      <p className={`text-[11px] text-center ${mockupPageStyle === 'banner' ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'}`}>Banner</p>
                                    </div>
                                    <div onClick={() => setMockupPageStyle('minimal')} className={`rounded-2xl p-4 cursor-pointer transition-colors ${mockupPageStyle === 'minimal' ? 'border-2 border-foreground' : 'border border-border/20 hover:border-border/40'}`}>
                                      <div className="h-16 bg-foreground rounded-xl mb-2 flex items-center justify-center">
                                        <div className="w-10 h-1 bg-white/40 rounded-full" />
                                      </div>
                                      <p className={`text-[11px] text-center ${mockupPageStyle === 'minimal' ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'}`}>Minimal</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Dark mode */}
                                <div className="flex items-center justify-between py-1">
                                  <div>
                                    <p className="text-[12px] font-semibold text-foreground">Mode sombre</p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">Proposer un thème sombre</p>
                                  </div>
                                  <div className="w-10 h-[22px] bg-secondary border border-border/30 rounded-full relative cursor-pointer">
                                    <div className="absolute left-[3px] top-[3px] w-4 h-4 bg-white rounded-full shadow-sm border border-border/10" />
                                  </div>
                                </div>
                              </div>
                            )}

                            {mockupTab === 'formules' && (
                              <div className="space-y-2.5">
                                <p className="text-[12px] text-muted-foreground mb-2">Formules visibles sur votre page</p>
                                {['Lavage Express · 35€', 'Nettoyage Complet · 89€', 'Rénovation Premium · 159€'].map((f, i) => (
                                  <div key={i} className="flex items-center justify-between bg-secondary/20 rounded-xl p-3.5 border border-border/10">
                                    <span className="text-[12px] font-medium text-foreground">{f}</span>
                                    <div className={`w-10 h-[22px] rounded-full relative transition-colors cursor-pointer ${i < 2 ? 'bg-foreground' : 'bg-secondary border border-border/30'}`}>
                                      <div className={`absolute top-[3px] w-4 h-4 bg-white rounded-full shadow-sm transition-all ${i < 2 ? 'right-[3px]' : 'left-[3px]'}`} />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {mockupTab === 'elements' && (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="text-[12px] text-muted-foreground">Éléments de votre page</p>
                                  <button className="text-[11px] font-medium text-foreground bg-secondary/40 hover:bg-secondary px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 border border-border/10">
                                    <Plus className="w-3.5 h-3.5" /> Ajouter
                                  </button>
                                </div>

                                {/* Blocks */}
                                {[
                                  { icon: <Phone className="w-4 h-4" />, name: 'Téléphone', desc: '06 12 34 56 78', hasStyle: true, styleIdx: 0 },
                                  { icon: <Clock className="w-4 h-4" />, name: 'Horaires', desc: 'Configurés dans Paramètres → Disponibilités', hasStyle: true, styleIdx: 0 },
                                  { icon: <MapPin className="w-4 h-4" />, name: 'Adresse', desc: '12 rue de Paris, 75001 Paris', hasStyle: true, styleIdx: 2 },
                                  { icon: <Tag className="w-4 h-4" />, name: 'Nos formules', desc: null, hasStyle: false },
                                  { icon: <Star className="w-4 h-4" />, name: 'Avis Google', desc: null, hasStyle: false, hasGoogleDetail: true },
                                  { icon: <ImagePlus className="w-4 h-4" />, name: 'Galerie photos', desc: null, hasStyle: false },
                                  { icon: <Instagram className="w-4 h-4" />, name: 'Instagram', desc: null, hasStyle: false, off: true },
                                ].map((block, idx) => (
                                  <div key={idx} className="bg-card rounded-2xl border border-border/10 p-4">
                                    <div className="flex items-center gap-3">
                                      <svg className="w-4 h-4 text-muted-foreground/30 cursor-grab shrink-0" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/></svg>
                                      <div className="w-8 h-8 rounded-xl bg-secondary/40 flex items-center justify-center text-muted-foreground shrink-0">
                                        {block.icon}
                                      </div>
                                      <span className="text-[12px] font-semibold text-foreground flex-1">{block.name}</span>
                                      <div className="flex items-center gap-2">
                                        {!block.off && (
                                          <>
                                            <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground/25 rotate-90 cursor-pointer hover:text-muted-foreground transition-colors" />
                                            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/25 -rotate-90 cursor-pointer hover:text-muted-foreground transition-colors" />
                                          </>
                                        )}
                                        <div className={`w-10 h-[22px] rounded-full relative cursor-pointer ${block.off ? 'bg-secondary border border-border/30' : 'bg-foreground'}`}>
                                          <div className={`absolute top-[3px] w-4 h-4 bg-white rounded-full shadow-sm ${block.off ? 'left-[3px] border border-border/10' : 'right-[3px]'}`} />
                                        </div>
                                        {!block.off && (
                                          <svg className="w-4 h-4 text-red-400/60 cursor-pointer hover:text-red-500 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                                        )}
                                      </div>
                                    </div>
                                    
                                    {block.desc && (
                                      <p className="text-[10px] text-muted-foreground mt-2 ml-[60px]">{block.desc}</p>
                                    )}
                                    
                                    {block.hasStyle && (
                                      <div className="flex items-center gap-2 mt-2.5 ml-[60px]">
                                        <span className="text-[10px] text-muted-foreground">Style :</span>
                                        {['Minimal', 'Pill', 'Carte'].map((s, i) => (
                                          <span key={s} className={`text-[10px] px-3 py-1 rounded-full cursor-pointer transition-colors ${i === block.styleIdx ? 'bg-foreground text-background font-semibold' : 'bg-secondary/40 text-muted-foreground hover:bg-secondary'}`}>{s}</span>
                                        ))}
                                      </div>
                                    )}

                                    {block.hasGoogleDetail && (
                                      <div className="ml-[60px] mt-2.5 space-y-2">
                                        <div className="flex items-center gap-1.5">
                                          <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                                          <span className="text-[10px] font-semibold text-foreground">Google</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                          <div>
                                            <p className="text-[9px] text-muted-foreground mb-1">Note</p>
                                            <div className="bg-secondary/20 rounded-lg px-2.5 py-1.5 border border-border/10 text-[10px] font-medium text-foreground">4,7</div>
                                          </div>
                                          <div>
                                            <p className="text-[9px] text-muted-foreground mb-1">Avis</p>
                                            <div className="bg-secondary/20 rounded-lg px-2.5 py-1.5 border border-border/10 text-[10px] font-medium text-foreground">122</div>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            {mockupTab === 'seo' && (
                              <div className="space-y-4">
                                <p className="text-[12px] text-muted-foreground">Référencement Google</p>
                                <div>
                                  <p className="text-[11px] text-muted-foreground mb-1.5">Titre</p>
                                  <div className="bg-secondary/20 rounded-xl px-3.5 py-2.5 border border-border/10 text-[12px] text-foreground font-medium">GOCLEANING - Nettoyage Auto Paris</div>
                                </div>
                                <div>
                                  <p className="text-[11px] text-muted-foreground mb-1.5">Description</p>
                                  <div className="bg-secondary/20 rounded-xl px-3.5 py-2.5 border border-border/10 text-[12px] text-foreground">Service de nettoyage automobile premium à domicile.</div>
                                </div>
                                <div className="bg-white rounded-2xl p-5 border border-border/15 shadow-sm">
                                  <p className="text-[10px] text-muted-foreground mb-2.5 font-medium uppercase tracking-wider">Aperçu Google</p>
                                  <p className="text-[14px] text-blue-600 font-medium hover:underline cursor-pointer">GOCLEANING - Nettoyage Auto Paris</p>
                                  <p className="text-[11px] text-emerald-700 mt-0.5">cleaningpage.com/gocleaning</p>
                                  <p className="text-[11px] text-muted-foreground mt-1">Service de nettoyage automobile premium à domicile.</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {dashboardTab === 'formules' && (
                    <>
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground tracking-tight">{t('mockup.formulasAndServices')}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">{t('mockup.manageOffers')}</p>
                        </div>
                        <button className="bg-blue-500 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-lg shadow-blue-500/25 hover:bg-blue-600 transition-colors">
                          {t('mockup.add')}
                        </button>
                      </div>

                      <p className="text-xs font-semibold text-foreground mb-2.5">{t('mockup.formulas')}</p>
                      <div className="space-y-2 mb-6">
                        {[
                          { name: 'Lavage Express', desc: `${t('mockup.exteriorOnly')} · 45min`, price: '35€', color: 'from-blue-500 to-blue-600' },
                          { name: 'Nettoyage Complet', desc: `${t('mockup.intExt')} · 1h30`, price: '89€', color: 'from-emerald-500 to-emerald-600' },
                          { name: 'Rénovation Premium', desc: `${t('mockup.polishCeramic')} · 3h`, price: '159€', color: 'from-purple-500 to-purple-600' },
                        ].map((pack, i) => (
                          <div key={i} className="flex items-center gap-3.5 bg-card rounded-2xl p-3.5 border border-border/15 hover:shadow-md transition-all cursor-pointer group">
                            <div className={`w-10 h-10 bg-gradient-to-br ${pack.color} rounded-xl flex items-center justify-center shrink-0 shadow-sm`}>
                              <Car className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-semibold text-foreground">{pack.name}</p>
                              <p className="text-[11px] text-muted-foreground mt-0.5">{pack.desc}</p>
                            </div>
                            <span className="text-[14px] font-bold text-foreground tabular-nums">{pack.price}</span>
                            <div className="w-9 h-5 bg-emerald-500 rounded-full relative shrink-0 cursor-pointer">
                              <div className="absolute right-[3px] top-[3px] w-3.5 h-3.5 bg-white rounded-full shadow-sm" />
                            </div>
                          </div>
                        ))}
                      </div>

                      <p className="text-xs font-semibold text-foreground mb-1.5">{t('mockup.customServices')}</p>
                      <p className="text-[11px] text-muted-foreground mb-2.5">{t('mockup.customRates')}</p>
                      <div className="space-y-2">
                        {[
                          { name: 'Nettoyage canapé 3 places', client: 'Marie Dupont', duration: '2h', price: '120€', avatarBg: 'bg-pink-500', initials: 'MD' },
                          { name: 'Détachage moquette salon', client: 'Pierre Bernard', duration: '1h30', price: '80€', avatarBg: 'bg-amber-500', initials: 'PB' },
                        ].map((service, i) => (
                          <div key={i} className="flex items-center gap-3.5 bg-card rounded-2xl p-3.5 border border-border/15 hover:shadow-md transition-all cursor-pointer group">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0 ${service.avatarBg}`}>
                              {service.initials}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-semibold text-foreground">{service.name}</p>
                              <p className="text-[11px] text-muted-foreground mt-0.5">{t('mockup.forClient')} {service.client} · {service.duration}</p>
                            </div>
                            <span className="text-[14px] font-bold text-foreground tabular-nums">{service.price}</span>
                            <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors shrink-0" />
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
               {t('landing.pricingTitle')}
             </h2>
             <p className="text-base sm:text-lg text-muted-foreground px-2">
               {t('landing.pricingDesc')}
             </p>
          </div>
          
          <div className="max-w-lg mx-auto">
            {/* Pro Plan - Single offer */}
            <Card variant="elevated" className="p-5 sm:p-8 rounded-xl sm:rounded-2xl ring-2 ring-foreground relative hover:shadow-xl transition-shadow duration-300 overflow-hidden">
              {/* Premium trial banner */}
              <div className="absolute top-0 left-0 right-0 bg-foreground text-primary-foreground py-2 sm:py-2.5 px-4 text-center">
                <p className="text-xs sm:text-sm font-medium">{t('landing.trialBanner')}</p>
              </div>
              
              <div className="mb-4 sm:mb-6 mt-8 sm:mt-10">
                 <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-1">{t('landing.proName')}</h3>
                 <p className="text-muted-foreground text-xs sm:text-sm">{t('landing.proDesc')}</p>
              </div>
              
              <div className="mb-4 sm:mb-6">
                <span className="text-3xl sm:text-4xl font-semibold text-foreground">29€</span>
                 <span className="text-muted-foreground text-sm sm:text-base ml-2">{t('landing.perMonth')}</span>
                 <p className="text-xs text-muted-foreground mt-1">{t('landing.afterTrial')}</p>
              </div>
              
              <ul className="space-y-2.5 sm:space-y-3 mb-6 sm:mb-8">
                 {(t('landing.features', { returnObjects: true }) as string[]).map((feature: string) => (
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
                     {t('mockup.loading')}
                  </>
                ) : (
                  <>
                     {t('landing.tryFree30')}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
              
              <p className="text-center text-xs text-muted-foreground mt-3">{t('landing.noCommitmentCancel')}</p>
            </Card>
          </div>
        </div>
      </section>

      
      {/* FAQ */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground tracking-tight mb-10 text-center">
            FAQ
          </h2>
          <Accordion type="single" collapsible className="w-full space-y-3">
            {([1,2,3,4,5,6,7,8] as const).map((i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border border-border/50 rounded-2xl px-5 data-[state=open]:bg-secondary/20 transition-colors">
                <AccordionTrigger className="text-left text-sm sm:text-base font-medium hover:no-underline py-5">
                  {t(`landing.faq.q${i}`)}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line pb-5">
                  {t(`landing.faq.a${i}`)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
           <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground tracking-tight mb-4 sm:mb-6 px-2">
             {t('landing.ctaTitle')}
           </h2>
           <p className="text-base sm:text-lg text-muted-foreground mb-8 sm:mb-10 leading-relaxed px-2">
             {t('landing.pricingDesc')}
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
                 {t('mockup.loading')}
              </>
            ) : (
              <>
                {t('landing.tryFree30')}
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 sm:py-10 px-4 sm:px-6 border-t border-border/50">
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-3">
          <div className="flex items-center gap-4 text-xs text-muted-foreground/60">
             <Link to="/confidentialite" className="hover:text-muted-foreground transition-colors">{t('landing.privacy')}</Link>
             <span>·</span>
             <Link to="/cgv" className="hover:text-muted-foreground transition-colors">{t('landing.terms')}</Link>
             <span>·</span>
             <Link to="/mentions-legales" className="hover:text-muted-foreground transition-colors">{t('landing.legalNotices')}</Link>
           </div>
           <p className="text-xs text-muted-foreground/40">
             {t('landing.allRightsReserved')}
           </p>
        </div>
      </footer>
    </div>
  );
}
