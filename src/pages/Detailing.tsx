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
import heroDetailingPhoto from '@/assets/hero-detailing-pro.png';
import gocleanLogo from '@/assets/gocleaning-logo.png';
import sfAutoLogo from '@/assets/sf-auto-logo.png';
import citadineImg from '@/assets/citadine.png';
import berlineImg from '@/assets/berline.png';
import suvImg from '@/assets/suv.png';
import mockupCarCleaning from '@/assets/mockup-car-cleaning.jpg';
import mockupLogoClean from '@/assets/mockup-logo-cleaning.png';
import mockupInterior from '@/assets/mockup-interior-cleaning.png';
import mockupExterior from '@/assets/mockup-exterior-cleaning.png';
import heroDetailingPro from '@/assets/hero-detailing-pro.jpg';
import agendaMockup from '@/assets/detailing-agenda-mockup.jpg';
import statsMockup from '@/assets/detailing-stats-mockup.jpg';
import bookingPremium from '@/assets/detailing-booking-mockup.png';
import agendaPremium from '@/assets/detailing-agenda-premium.jpg';
import statsPremium from '@/assets/detailing-stats-premium.jpg';

import iconReservations from '@/assets/icons/icon-reservations.png';
import iconAgenda from '@/assets/icons/icon-agenda.png';
import iconFactures from '@/assets/icons/icon-factures.png';
import iconClients from '@/assets/icons/icon-clients.png';
import iconMaPage from '@/assets/icons/icon-mapage.png';
import iconFormules from '@/assets/icons/icon-formules.png';
import iconDemandes from '@/assets/icons/icon-demandes.png';
import iconStatistiques from '@/assets/icons/icon-statistiques.png';

import appIconStats from '@/assets/icons/app-stats.png';
import appIconReservations from '@/assets/icons/app-reservations.png';
import appIconAgenda from '@/assets/icons/app-agenda.png';
import appIconClients from '@/assets/icons/app-clients.png';
import appIconInvoices from '@/assets/icons/app-invoices.png';
import appIconMaPage from '@/assets/icons/app-mapage.png';
import appIconFormules from '@/assets/icons/app-formules.png';

const heroAppIcons = [
  { src: appIconAgenda, label: 'Agenda' },
  { src: appIconReservations, label: 'Réservations' },
  { src: appIconClients, label: 'Clients' },
  { src: appIconInvoices, label: 'Factures' },
  { src: appIconStats, label: 'Statistiques' },
  { src: appIconMaPage, label: 'Ma Page' },
  { src: appIconFormules, label: 'Formules' },
];

const dashboardIcons = [
  { icon: iconReservations, label: 'Réservations' },
  { icon: iconAgenda, label: 'Agenda' },
  { icon: iconMaPage, label: 'Ma Page' },
  { icon: iconFactures, label: 'Factures' },
  { icon: iconClients, label: 'Clients' },
  { icon: iconFormules, label: 'Formules' },
  { icon: iconDemandes, label: 'Demandes' },
  { icon: iconStatistiques, label: 'Statistiques' },
];

import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { trackEvent } from '@/lib/analytics';

export default function Detailing() {
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [dashboardTab, setDashboardTab] = useState<'reservations' | 'calendar' | 'clients' | 'invoices' | 'stats' | 'mypage' | 'formules'>('stats');
  const [showClientDetail, setShowClientDetail] = useState(false);
  const [mockupTab, setMockupTab] = useState<'design' | 'formules' | 'elements' | 'seo'>('design');
  const [mockupPageStyle, setMockupPageStyle] = useState<'banner' | 'minimal'>('minimal');
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleStartTrial = async () => {
    trackEvent('cta_start_trial');
    setIsCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-guest-checkout');
      if (error) throw new Error(error.message);
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

  const TrialButton = ({ className = '' }: { className?: string }) => (
    <Button
      size="lg"
      className={`text-base px-8 shadow-lg shadow-emerald-500/25 bg-emerald-500 hover:bg-emerald-600 ${className}`}
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
  );

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

      {/* Hero Section — taap.it inspired */}
      <section className="relative overflow-hidden bg-background">
        <div className="relative min-h-[90vh] sm:min-h-[88vh]">
          
          {/* Floating widgets — LEFT side (desktop only) */}
          <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-[300px] xl:w-[360px] z-10">
            <div 
              className="absolute top-[18%] left-[8%] xl:left-[12%] w-[220px] opacity-0"
              style={{ animation: 'hero-float-in-left 0.8s cubic-bezier(0.16,1,0.3,1) 0.4s forwards', transform: 'rotate(-6deg)' }}
            >
              <div className="bg-card rounded-2xl shadow-card p-4 border border-border/50">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-xl overflow-hidden"><img src={appIconAgenda} alt="" className="w-full h-full" /></div>
                  <span className="text-xs font-semibold text-foreground">Agenda</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-[10px]">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-muted-foreground">10:00 — Lavage complet</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span className="text-muted-foreground">14:00 — Polish carrosserie</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span className="text-muted-foreground">16:30 — Detailing intérieur</span>
                  </div>
                </div>
              </div>
            </div>

            <div 
              className="absolute bottom-[22%] left-[3%] xl:left-[6%] w-[200px] opacity-0"
              style={{ animation: 'hero-float-in-left 0.8s cubic-bezier(0.16,1,0.3,1) 0.7s forwards', transform: 'rotate(3deg)' }}
            >
              <div className="bg-card rounded-2xl shadow-card p-4 border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-xl overflow-hidden"><img src={appIconClients} alt="" className="w-full h-full" /></div>
                  <div>
                    <span className="text-[11px] font-semibold text-foreground block">Marc D.</span>
                    <span className="text-[9px] text-muted-foreground">Client fidèle · 12 RDV</span>
                  </div>
                </div>
                <div className="flex gap-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Floating widgets — RIGHT side (desktop only) — Stats card only */}
          <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-[300px] xl:w-[360px] z-10">
            <div 
              className="absolute top-[14%] right-[6%] xl:right-[10%] w-[210px] opacity-0"
              style={{ animation: 'hero-float-in-right 0.8s cubic-bezier(0.16,1,0.3,1) 0.5s forwards', transform: 'rotate(5deg)' }}
            >
              <div className="bg-card rounded-2xl shadow-card p-4 border border-border/50">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-xl overflow-hidden"><img src={appIconStats} alt="" className="w-full h-full" /></div>
                  <span className="text-xs font-semibold text-foreground">Ce mois</span>
                </div>
                <div className="text-2xl font-bold text-foreground mb-0.5">4 280 €</div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-600">
                  <ArrowRight className="w-3 h-3 rotate-[-45deg]" />
                  <span>+23% vs mois dernier</span>
                </div>
              </div>
            </div>
          </div>

          {/* Center: Text + CTA */}
          <div className="relative z-20 max-w-2xl mx-auto px-4 sm:px-6 text-center pt-14 sm:pt-20 lg:pt-24">
            <h1 className="opacity-0 animate-fade-in-up text-[2rem] sm:text-[2.75rem] md:text-[3.25rem] lg:text-[3.75rem] font-bold text-foreground tracking-[-0.03em] leading-[1.06] mb-5 sm:mb-6">
              Le logiciel pour les pros du{' '}
              <span className="text-emerald-500">detailing auto</span>
            </h1>
            <p className="opacity-0 animate-fade-in-up stagger-1 text-muted-foreground text-[15px] sm:text-base sm:leading-relaxed max-w-md mx-auto mb-8 sm:mb-10">
              Réservation en ligne, gestion clients, facturation — tout ce qu'il vous faut pour piloter votre activité.
            </p>
            <div className="opacity-0 animate-fade-in-up stagger-2">
              <TrialButton />
            </div>
          </div>

          {/* Mobile: Compact widgets + phone mockup */}
          <div className="lg:hidden relative mt-8 pb-6 px-4">
            <div className="flex items-start gap-3 sm:gap-4 justify-center">
              {/* Left widgets stack */}
              <div className="flex flex-col gap-2.5 mt-4 opacity-0" style={{ animation: 'hero-float-in-left 0.8s cubic-bezier(0.16,1,0.3,1) 0.5s forwards' }}>
                <div className="bg-card rounded-xl shadow-card p-2.5 border border-border/50 w-[130px] sm:w-[150px]">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-6 h-6 rounded-lg overflow-hidden"><img src={appIconAgenda} alt="" className="w-full h-full" /></div>
                    <span className="text-[9px] font-semibold text-foreground">Agenda</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[8px]">
                      <div className="w-1 h-1 rounded-full bg-emerald-500" />
                      <span className="text-muted-foreground">10:00 — Lavage</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[8px]">
                      <div className="w-1 h-1 rounded-full bg-blue-500" />
                      <span className="text-muted-foreground">14:00 — Polish</span>
                    </div>
                  </div>
                </div>
                <div className="bg-card rounded-xl shadow-card p-2.5 border border-border/50 w-[130px] sm:w-[150px]">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-lg overflow-hidden"><img src={appIconStats} alt="" className="w-full h-full" /></div>
                    <span className="text-[9px] font-semibold text-foreground">Ce mois</span>
                  </div>
                  <div className="text-sm font-bold text-foreground">4 280 €</div>
                  <div className="flex items-center gap-1 text-[8px] text-emerald-600">
                    <ArrowRight className="w-2 h-2 rotate-[-45deg]" />
                    <span>+23%</span>
                  </div>
                </div>
                <div className="bg-card rounded-xl shadow-card p-2.5 border border-border/50 w-[130px] sm:w-[150px]">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg overflow-hidden"><img src={appIconClients} alt="" className="w-full h-full" /></div>
                    <div>
                      <span className="text-[9px] font-semibold text-foreground block">Marc D.</span>
                      <span className="text-[7px] text-muted-foreground">Client fidèle · 12 RDV</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: mini phone mockup */}
              <div className="opacity-0" style={{ animation: 'hero-float-in-right 0.8s cubic-bezier(0.16,1,0.3,1) 0.6s forwards' }}>
                <div className="bg-[hsl(var(--border))] rounded-[1.5rem] p-[3px] shadow-xl">
                  <div className="bg-card rounded-[1.3rem] overflow-hidden w-[150px] sm:w-[170px]">
                    {/* Notch */}
                    <div className="flex justify-center pt-1.5 pb-0.5">
                      <div className="w-12 h-2.5 bg-secondary rounded-full" />
                    </div>
                    {/* Mini header bar */}
                    <div className="mx-2 mt-1 bg-secondary/40 rounded-lg px-2 py-1 flex items-center justify-between border border-border/20">
                      <div className="flex items-center gap-1">
                        <div className="w-3.5 h-3.5 rounded-full overflow-hidden bg-white flex items-center justify-center">
                          <img src={sfAutoLogo} alt="" className="w-3 h-3 object-contain" />
                        </div>
                        <span className="text-[6px] font-bold text-foreground">SF AUTO</span>
                      </div>
                      <div className="flex gap-[2px]">
                        <div className="w-[3px] h-[3px] bg-muted-foreground/40 rounded-full" />
                        <div className="w-[3px] h-[3px] bg-muted-foreground/40 rounded-full" />
                        <div className="w-[3px] h-[3px] bg-muted-foreground/40 rounded-full" />
                      </div>
                    </div>
                    <div className="px-2 pb-2 pt-1.5">
                      {/* Name + stars */}
                      <div className="text-center mb-1">
                        <h3 className="text-[8px] font-extrabold text-foreground tracking-wide">SF AUTO</h3>
                        <div className="flex justify-center gap-[1px] mt-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-2 h-2 fill-amber-400 text-amber-400" />
                          ))}
                          <span className="text-[5px] text-muted-foreground ml-0.5 mt-[1px]">4.9</span>
                        </div>
                        <p className="text-[5px] text-muted-foreground mt-0.5">Detailing premium · Lyon</p>
                      </div>
                      {/* Section title */}
                      <p className="text-[6px] text-foreground font-semibold mb-1">Que voulez-vous laver ?</p>
                      {/* Vehicle grid — 3 square cards */}
                      <div className="grid grid-cols-3 gap-1">
                        {[
                          { name: 'Citadine', img: citadineImg },
                          { name: 'Berline', img: berlineImg },
                          { name: 'SUV', img: suvImg },
                        ].map((v) => (
                          <div key={v.name} className="rounded-lg overflow-hidden relative aspect-square">
                            <img src={v.img} alt={v.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                            <span className="absolute bottom-[2px] left-[3px] text-[5px] font-semibold text-white leading-none">{v.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Divider line */}
          <div className="absolute bottom-0 left-0 right-0 z-30">
            <div className="w-full h-px bg-border/40" />
          </div>

          {/* Phone mockup — RIGHT side with "Ma Page" widget overlapping */}
          <div 
            className="hidden lg:block absolute bottom-0 right-[8%] xl:right-[12%] z-20 opacity-0"
            style={{ animation: 'hero-float-in-right 1s cubic-bezier(0.16,1,0.3,1) 0.6s forwards', transform: 'rotate(2deg)' }}
          >
            <div className="relative">
              {/* Phone shell */}
              <div className="bg-[hsl(var(--border))] rounded-t-[2.5rem] p-[5px] shadow-2xl shadow-foreground/10">
                <div className="bg-card rounded-t-[2.2rem] overflow-hidden w-[240px] xl:w-[270px]">
                  {/* Notch */}
                  <div className="flex justify-center pt-2 pb-1">
                    <div className="w-20 h-4 bg-secondary rounded-full" />
                  </div>
                  {/* Header bar — logo prominent + call button */}
                  <div className="mx-3 mt-1 flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl overflow-hidden bg-white flex items-center justify-center shadow-sm border border-border/20">
                      <img src={sfAutoLogo} alt="" className="w-7 h-7 object-contain" />
                    </div>
                    <div className="flex items-center gap-1 bg-foreground text-background rounded-full px-2.5 py-1 text-[8px] font-medium">
                      <Phone className="w-2.5 h-2.5" />
                      Appeler
                    </div>
                  </div>
                  <div className="px-3 pt-3 pb-2">
                    {/* Name + stars row */}
                    <div className="text-center mb-1">
                      <h3 className="text-[13px] font-extrabold text-foreground tracking-tight">SF AUTO</h3>
                    </div>
                    <div className="flex justify-center items-center gap-[2px] mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                      ))}
                      <span className="text-[7px] text-muted-foreground ml-1">4.9 (127)</span>
                    </div>
                    <p className="text-[7px] text-muted-foreground text-center mb-2">Detailing premium · Lyon 3ème</p>
                    {/* Social icons */}
                    <div className="flex justify-center gap-1.5 mb-3">
                      <div className="w-5 h-5 bg-secondary/50 rounded-full flex items-center justify-center">
                        <Instagram className="w-2.5 h-2.5 text-muted-foreground" />
                      </div>
                      <div className="w-5 h-5 bg-secondary/50 rounded-full flex items-center justify-center">
                        <Facebook className="w-2.5 h-2.5 text-muted-foreground" />
                      </div>
                      <div className="w-5 h-5 bg-secondary/50 rounded-full flex items-center justify-center">
                        <Globe className="w-2.5 h-2.5 text-muted-foreground" />
                      </div>
                    </div>
                    {/* Separator */}
                    <div className="w-full h-px bg-border/30 mb-2.5" />
                    {/* Section title */}
                    <p className="text-[9px] text-foreground font-semibold mb-2">Que voulez-vous laver ?</p>
                    {/* Vehicle grid — 3 square cards */}
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { name: 'Citadine', img: citadineImg },
                        { name: 'Berline', img: berlineImg },
                        { name: 'SUV', img: suvImg },
                      ].map((v) => (
                        <div key={v.name} className="rounded-xl overflow-hidden relative aspect-square shadow-sm border border-border/10">
                          <img src={v.img} alt={v.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                          <span className="absolute bottom-1 left-0 right-0 text-center text-[8px] font-semibold text-white leading-none">{v.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* "Ma Page" widget overlapping the phone mockup */}
              <div 
                className="absolute -left-[100px] xl:-left-[110px] top-[28%] w-[150px] opacity-0"
                style={{ animation: 'hero-float-in-left 0.7s cubic-bezier(0.16,1,0.3,1) 1.1s forwards', transform: 'rotate(-3deg)' }}
              >
                <div className="bg-card rounded-2xl shadow-card p-3 border border-border/50">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg overflow-hidden"><img src={appIconMaPage} alt="" className="w-full h-full" /></div>
                    <div>
                      <span className="text-[10px] font-semibold text-foreground block">Ma Page</span>
                      <span className="text-[9px] text-muted-foreground">En ligne ✓</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Section 01 — Page de réservation en ligne */}
      <section className="py-20 sm:py-28 lg:py-36 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left: Text */}
            <div className="opacity-0 animate-fade-in-up">
              <span className="text-xs font-medium text-muted-foreground/60 tracking-[0.2em] uppercase mb-4 block">01 — Réservation en ligne</span>
              <h2 className="text-3xl sm:text-4xl md:text-[2.75rem] font-semibold text-foreground tracking-tight mb-8 leading-[1.08]">
                Vos clients réservent<br />sans vous
              </h2>
              <ul className="space-y-5 mb-10">
                {[
                  'Réservation 24h/24, sans appel',
                  'Parcours simple : choix, créneau, paiement',
                  'Acompte et paiement en ligne intégrés',
                  'Confirmation et rappels automatiques',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3.5">
                    <Check className="w-4 h-4 text-muted-foreground/50 flex-shrink-0 mt-1" strokeWidth={1.5} />
                    <span className="text-muted-foreground text-[15px] leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-foreground text-[15px] leading-relaxed mb-8">
                Une expérience fluide pour vos clients, zéro gestion pour vous.
              </p>
              <TrialButton />
            </div>
            {/* Right: Phone mockup frame */}
            <div className="opacity-0 animate-fade-in-up stagger-2 flex justify-center lg:justify-end">
              <div className="relative" style={{ transform: 'rotate(-2deg)' }}>
                {/* Phone frame */}
                <div className="bg-[#e8e8e8] rounded-[2.5rem] p-[6px] shadow-2xl shadow-black/25">
                  {/* Side button right */}
                  <div className="absolute right-[-3px] top-28 w-[3px] h-8 bg-[#d0d0d0] rounded-r-sm" />
                  <div className="bg-white rounded-[2.2rem] overflow-hidden w-[260px] sm:w-[280px] lg:w-[300px]">
                    {/* Notch */}
                    <div className="flex justify-center pt-2 pb-1">
                      <div className="w-24 h-5 bg-[#e8e8e8] rounded-full" />
                    </div>
                    {/* App content */}
                    <div className="px-3.5 lg:px-4">
                      {/* Header */}
                      <div className="flex items-center justify-between py-2">
                        <div className="w-9 h-9 rounded-full overflow-hidden ring-1 ring-border/30 bg-black">
                          <img src={gocleanLogo} alt="GoCleaning Logo" className="w-full h-full object-cover" />
                        </div>
                        <button className="flex items-center gap-1.5 bg-zinc-600 text-white rounded-full px-3 py-1.5 text-[9px] font-medium">
                          <Phone className="w-3 h-3" />
                          Appeler
                        </button>
                      </div>
                      <div className="border-t border-border/20" />
                      {/* Profile */}
                      <div className="pt-4 pb-2 text-center">
                        <h3 className="text-base lg:text-lg font-extrabold text-foreground tracking-wide">GO CLEANING</h3>
                        <p className="text-[9px] lg:text-[10px] text-muted-foreground mt-0.5">Expert du nettoyage automobile depuis 2018</p>
                      </div>
                      {/* Social */}
                      <div className="flex justify-center gap-3 mb-3">
                        <div className="w-9 h-9 bg-secondary/20 rounded-full flex items-center justify-center border border-border/30">
                          <Instagram className="w-4 h-4 text-foreground/60" />
                        </div>
                        <div className="w-9 h-9 bg-secondary/20 rounded-full flex items-center justify-center border border-border/30">
                          <svg className="w-4 h-4 text-foreground/60" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.88-2.88 2.89 2.89 0 0 1 2.88-2.88c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.16 15a6.34 6.34 0 0 0 6.33 6.33 6.34 6.34 0 0 0 6.33-6.33V8.73a8.19 8.19 0 0 0 4.77 1.53V6.81a4.82 4.82 0 0 1-1-.12z"/></svg>
                        </div>
                      </div>
                      {/* Contact bar */}
                      <div className="bg-muted/20 rounded-2xl px-3.5 py-2.5 mb-3 flex items-center gap-2 border border-border/20">
                        <Mail className="w-3.5 h-3.5 text-muted-foreground/60" />
                        <span className="text-[10px] text-muted-foreground">Formule personnalisée ? Identifiez-vous</span>
                      </div>
                      {/* Hours */}
                      <div className="flex items-center justify-between mb-4 px-0.5">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-muted-foreground/50" />
                          <span className="text-[10px] text-emerald-600 font-semibold">Ouvert</span>
                          <span className="text-[10px] text-muted-foreground">· Ferme à 19h00</span>
                        </div>
                        <ChevronRight className="w-3 h-3 text-muted-foreground/40 rotate-90" />
                      </div>
                      {/* Formules */}
                      <p className="text-sm font-bold text-foreground mb-2.5">Nos formules</p>
                      <div className="grid grid-cols-2 gap-2.5 mb-4">
                        <div className="rounded-2xl overflow-hidden relative aspect-square">
                          <img src={mockupExterior} alt="Lavage complet" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                          <div className="absolute bottom-0 left-0 p-2.5">
                            <p className="text-[11px] font-bold text-white leading-tight uppercase">Lavage complet</p>
                            <span className="text-[12px] font-bold text-white">dès 65€</span>
                          </div>
                        </div>
                        <div className="rounded-2xl overflow-hidden relative aspect-square">
                          <img src={mockupInterior} alt="Nettoyage intérieur" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                          <div className="absolute bottom-0 left-0 p-2.5">
                            <p className="text-[11px] font-bold text-white leading-tight">Nettoyage intérieur</p>
                            <span className="text-[12px] font-bold text-white">dès 50€</span>
                          </div>
                        </div>
                      </div>
                      {/* CTA */}
                      <button className="w-full bg-emerald-500 text-white rounded-2xl py-3 text-[12px] font-semibold tracking-wide mb-4">Réserver</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 02 — Agenda connecté — Planity style card layout */}
      <section className="py-20 sm:py-28 lg:py-36 px-4 sm:px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-0 bg-card rounded-[2rem] overflow-hidden shadow-xl shadow-black/5 ring-1 ring-border/10">
            {/* Left: Text */}
            <div className="p-10 sm:p-12 lg:p-16 flex flex-col justify-center opacity-0 animate-fade-in-up">
              <span className="text-xs font-medium text-muted-foreground/60 tracking-[0.2em] uppercase mb-4 block">02 — Agenda connecté</span>
              <h2 className="text-3xl sm:text-4xl md:text-[2.75rem] font-semibold text-foreground tracking-tight mb-8 leading-[1.08]">
                Un planning toujours à jour
              </h2>
              <ul className="space-y-5 mb-10">
                {[
                  'Créneaux synchronisés automatiquement',
                  'Accessible sur mobile et ordinateur',
                  'Plus de double réservation',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3.5">
                    <Check className="w-4 h-4 text-muted-foreground/50 flex-shrink-0 mt-1" strokeWidth={1.5} />
                    <span className="text-muted-foreground text-[15px] leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-foreground text-[15px] leading-relaxed mb-8">
                Vous gardez le contrôle, sans effort.
              </p>
              <div>
                <TrialButton />
              </div>
            </div>
            {/* Right: Premium lifestyle photo */}
            <div className="relative overflow-hidden min-h-[360px] lg:min-h-0 opacity-0 animate-fade-in-up stagger-2">
              <img
                src={agendaPremium}
                alt="Agenda sur smartphone tenu en main"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>



      {/* Section 4: Gérez votre activité */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Label */}
          <div className="flex items-center gap-2 text-muted-foreground mb-4 opacity-0 animate-fade-in-up">
            <Shield className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">{t('mockup.management')}</span>
          </div>
          
          <h2 className="opacity-0 animate-fade-in-up stagger-1 text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground tracking-tight mb-4">
            Pilotez toute votre activité depuis un seul tableau de bord.
          </h2>
          <p className="opacity-0 animate-fade-in-up stagger-2 text-muted-foreground text-base sm:text-lg mb-8 max-w-2xl leading-relaxed">
            Visualisez, analysez et optimisez en temps réel.
          </p>

          {/* Dashboard Tabs Preview - Interactive Icons with progress bar */}
          {(() => {
            const tabs = [
              { img: iconStatistiques, label: t('mockup.statistics'), tab: 'stats' as const },
              { img: iconReservations, label: t('mockup.reservations'), tab: 'reservations' as const },
              { img: iconAgenda, label: t('mockup.calendar'), tab: 'calendar' as const },
              { img: iconClients, label: t('mockup.clients'), tab: 'clients' as const },
              { img: iconFactures, label: t('mockup.invoices'), tab: 'invoices' as const },
              { img: iconMaPage, label: t('mockup.myPage'), tab: 'mypage' as const },
              { img: iconFormules, label: t('mockup.formulas'), tab: 'formules' as const },
            ];
            const activeIndex = tabs.findIndex(t => t.tab === dashboardTab);
            return (
              <div className="opacity-0 animate-fade-in-up stagger-3 mb-10">
                {/* Progress bar */}
                <div className="flex max-w-5xl mx-auto mb-6">
                  {tabs.map((item, i) => (
                    <button
                      key={item.tab}
                      onClick={() => { setDashboardTab(item.tab); setShowClientDetail(false); }}
                      className="flex-1 group cursor-pointer"
                    >
                      <div className={`h-[3px] w-full rounded-full transition-all duration-500 ${
                        i === activeIndex ? 'bg-foreground' : i < activeIndex ? 'bg-foreground/25' : 'bg-border'
                      }`} />
                    </button>
                  ))}
                </div>
                {/* Icons + labels */}
                <div className="flex items-start justify-center gap-2 sm:gap-4 md:gap-6">
                  {tabs.map((item, i) => (
                    <button
                      key={item.tab}
                      onClick={() => { setDashboardTab(item.tab); setShowClientDetail(false); }}
                      className="group flex flex-col items-center gap-2 cursor-pointer transition-all duration-300"
                    >
                      <div className={`relative rounded-[22%] transition-all duration-300 ${
                        i === activeIndex
                          ? 'scale-110 shadow-lg ring-2 ring-foreground/20 ring-offset-2 ring-offset-background'
                          : 'opacity-60 hover:opacity-100 hover:scale-105 hover:shadow-md'
                      }`}>
                        <img
                          src={item.img}
                          alt={item.label}
                          className="w-11 h-11 sm:w-14 sm:h-14 object-contain"
                        />
                      </div>
                      <span className={`text-[10px] sm:text-xs font-medium transition-colors duration-300 text-center leading-tight max-w-[60px] sm:max-w-[80px] ${
                        i === activeIndex ? 'text-foreground' : 'text-muted-foreground/60'
                      }`}>
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}

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

                      {/* KPI row */}
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

                          <div className="relative mb-5">
                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                            <div className="bg-card rounded-2xl pl-11 pr-4 py-3 text-xs text-muted-foreground/50 border border-border/20 shadow-sm">
                              {t('mockup.searchClient')}
                            </div>
                          </div>

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
                        <div className="animate-fade-in">
                          <button onClick={() => setShowClientDetail(false)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4 transition-colors">
                            <ChevronLeft className="w-4 h-4" />
                            {t('mockup.backToClients')}
                          </button>

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

                          <div className="bg-primary/5 border border-primary/15 rounded-2xl p-3.5 mb-5">
                            <p className="text-[10px] text-muted-foreground mb-1">{t('mockup.defaultService')}</p>
                            <p className="text-[13px] font-semibold text-foreground flex items-center gap-2">
                              <Sparkles className="w-3.5 h-3.5 text-primary" />
                              Nettoyage Complet · 1h30 · 89€
                            </p>
                          </div>

                          <div className="bg-secondary/30 rounded-2xl p-3.5 mb-5">
                            <p className="text-[10px] text-muted-foreground mb-1">{t('mockup.notes')}</p>
                            <p className="text-[12px] text-foreground">{t('mockup.loyalClientNote')}</p>
                          </div>

                          <div className="flex gap-0 bg-secondary/50 rounded-full p-1 mb-4 w-fit">
                            <span className="text-[11px] font-semibold bg-card shadow-sm px-4 py-1.5 rounded-full">{t('mockup.services')}</span>
                            <span className="text-[11px] font-medium text-muted-foreground px-4 py-1.5 rounded-full cursor-pointer hover:text-foreground transition-colors">{t('mockup.invoicesQuotes')}</span>
                          </div>

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

                      <div className="flex gap-0 bg-secondary/50 rounded-full p-1 mb-5 w-fit">
                        <span className="text-[11px] font-semibold bg-card shadow-sm px-4 py-1.5 rounded-full">{t('mockup.all')}</span>
                        <span className="text-[11px] font-medium text-muted-foreground px-4 py-1.5 rounded-full cursor-pointer">{t('mockup.invoices')}</span>
                        <span className="text-[11px] font-medium text-muted-foreground px-4 py-1.5 rounded-full cursor-pointer">{t('mockup.quotes')}</span>
                      </div>

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
                      <div className="flex items-center justify-between mb-6">
                        <button className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center hover:bg-secondary transition-colors">
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <h3 className="text-lg font-semibold text-foreground tracking-tight">{t('mockup.january2025')}</h3>
                        <button className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center hover:bg-secondary transition-colors">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

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

                      <div className="flex gap-0 bg-secondary/50 rounded-full p-1 mb-5 w-fit">
                        <span className="text-[11px] font-semibold bg-card shadow-sm px-4 py-1.5 rounded-full">{t('mockup.evolution')}</span>
                        <span className="text-[11px] font-medium text-muted-foreground px-4 py-1.5 rounded-full cursor-pointer hover:text-foreground transition-colors">{t('mockup.servicesTab')}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-card rounded-2xl p-5 border border-border/15 shadow-sm">
                          <p className="text-sm font-semibold text-foreground mb-4">{t('mockup.weeklyBookings')}</p>
                          <div className="relative h-32">
                            <svg viewBox="0 0 300 100" className="w-full h-full" preserveAspectRatio="none">
                              <defs>
                                <linearGradient id="detailingLineGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.15" />
                                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                                </linearGradient>
                              </defs>
                              {[25, 50, 75].map(y => (
                                <line key={y} x1="0" y1={y} x2="300" y2={y} stroke="hsl(var(--border))" strokeWidth="0.3" />
                              ))}
                              <text x="2" y="18" fill="hsl(var(--muted-foreground))" fontSize="7" opacity="0.6">8</text>
                              <text x="2" y="35" fill="hsl(var(--muted-foreground))" fontSize="7" opacity="0.6">6</text>
                              <text x="2" y="55" fill="hsl(var(--muted-foreground))" fontSize="7" opacity="0.6">4</text>
                              <text x="2" y="78" fill="hsl(var(--muted-foreground))" fontSize="7" opacity="0.6">2</text>
                              <text x="2" y="98" fill="hsl(var(--muted-foreground))" fontSize="7" opacity="0.6">0</text>
                              <path d="M20,80 C50,75 70,68 100,55 C130,42 160,35 190,30 C220,28 250,25 280,22 L280,100 L20,100 Z" fill="url(#detailingLineGrad)" />
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
                              <text x="2" y="8" fill="hsl(var(--muted-foreground))" fontSize="7" opacity="0.6">10k</text>
                              <text x="2" y="30" fill="hsl(var(--muted-foreground))" fontSize="7" opacity="0.6">7.5k</text>
                              <text x="2" y="53" fill="hsl(var(--muted-foreground))" fontSize="7" opacity="0.6">5k</text>
                              <text x="2" y="78" fill="hsl(var(--muted-foreground))" fontSize="7" opacity="0.6">2.5k</text>
                              <text x="2" y="98" fill="hsl(var(--muted-foreground))" fontSize="7" opacity="0.6">0</text>
                              {[
                                { x: 40, h: 45 },
                                { x: 80, h: 50 },
                                { x: 120, h: 48 },
                                { x: 160, h: 55 },
                                { x: 200, h: 60 },
                                { x: 240, h: 70 },
                              ].map((bar, i) => (
                                <rect key={i} x={bar.x} y={100 - bar.h} width="22" height={bar.h} rx="6" ry="6" fill="#10B981" opacity={i === 5 ? 1 : 0.4} />
                              ))}
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
                          
                          <div className="flex-1 flex justify-center items-center">
                            <div className="relative w-[260px] sm:w-[280px]">
                              <div className="bg-foreground/5 rounded-[2.8rem] p-[10px] shadow-[0_25px_60px_-12px_rgba(0,0,0,0.18),0_0_0_1px_rgba(0,0,0,0.05)] ring-[6px] ring-foreground/[0.03]">
                                <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-[90px] h-[22px] bg-foreground rounded-full z-10" />
                                
                                <div className="rounded-[2.2rem] overflow-hidden bg-card" style={{ aspectRatio: '9/19.5', scrollbarWidth: 'none' }}>
                                  <div className="h-full overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                                    <div className="flex items-center justify-between px-4 pt-10 pb-3">
                                      <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-xl overflow-hidden shadow-sm ring-1 ring-border/20">
                                          <img src={gocleanLogo} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <span className="text-[11px] font-bold text-foreground tracking-tight">GOCLEANING</span>
                                      </div>
                                      <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center">
                                        <Phone className="w-3.5 h-3.5 text-background" />
                                      </div>
                                    </div>
                                    <div className="w-full h-px bg-border/15" />
                                    
                                    <div className="px-5 pt-5 pb-6">
                                      <h3 className="text-[17px] font-bold text-foreground mb-0.5 tracking-tight leading-tight">GOCLEANING</h3>
                                      <p className="text-[10px] text-muted-foreground mb-2.5 leading-relaxed">{t('mockup.premiumAutoFull')}</p>
                                      
                                      <div className="flex items-center gap-3 mb-1.5">
                                        <span className="inline-flex items-center gap-1 text-[9px] text-emerald-600 font-semibold">
                                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                          {t('mockup.open')}
                                        </span>
                                        <span className="text-[9px] text-muted-foreground">· {t('mockup.closesAt')}</span>
                                      </div>
                                      
                                      <div className="flex items-center gap-1 mb-4">
                                        {[...Array(5)].map((_, i) => <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />)}
                                        <span className="text-[9px] text-muted-foreground ml-1 font-medium">4.9 (122 {t('mockup.reviews')})</span>
                                      </div>

                                      <div className="flex gap-2.5 mb-5">
                                        {[Instagram, Facebook, Globe].map((Icon, i) => (
                                          <div key={i} className="w-8 h-8 rounded-xl bg-secondary/30 flex items-center justify-center border border-border/10">
                                            <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                                          </div>
                                        ))}
                                      </div>
                                      
                                      <p className="text-[11px] font-semibold text-foreground mb-2.5 tracking-tight">{t('mockup.ourPackages')}</p>
                                      <div className="grid grid-cols-2 gap-2 mb-3">
                                        {[
                                          { name: 'Express', desc: 'Extérieur', price: '35€', img: mockupExterior },
                                          { name: 'Complet', desc: 'Int. + Ext.', price: '89€', img: mockupCarCleaning },
                                          { name: 'Premium', desc: 'Rénovation', price: '159€', img: mockupInterior },
                                          { name: 'Canapé', desc: 'Textile', price: '79€', img: sofaBanner },
                                        ].map((f, i) => (
                                          <div key={i} className="rounded-2xl overflow-hidden relative h-[80px] shadow-sm group cursor-pointer">
                                            <img src={f.img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
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
                                  </div>
                                </div>
                                
                                <div className="flex justify-center pt-1.5 pb-0.5">
                                  <div className="w-24 h-1 bg-muted-foreground/15 rounded-full" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col order-1 lg:order-2">
                          <span className="text-base font-semibold text-foreground mb-4 tracking-tight">{t('mockup.customization')}</span>
                          
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
                                <div>
                                  <p className="text-sm font-semibold text-foreground mb-3">Bannière</p>
                                  <div className="rounded-2xl overflow-hidden mb-3 shadow-sm border border-border/10">
                                    <img src={mockupBanner} alt="Banner" className="w-full h-32 object-cover" />
                                  </div>
                                  <button className="text-[12px] font-medium text-foreground bg-secondary/40 hover:bg-secondary px-4 py-2 rounded-xl transition-colors flex items-center gap-2 border border-border/10">
                                    <Upload className="w-3.5 h-3.5" /> Changer
                                  </button>
                                </div>
                                
                                <p className="text-[11px] text-muted-foreground">Le logo se configure dans Paramètres → Informations</p>

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
      <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 bg-secondary/20">
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
            <Card variant="elevated" className="p-5 sm:p-8 rounded-xl sm:rounded-2xl ring-2 ring-foreground relative hover:shadow-xl transition-shadow duration-300 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 bg-foreground text-primary-foreground py-2 sm:py-2.5 px-4 text-center">
                <p className="text-xs sm:text-sm font-medium">{t('landing.trialBanner')}</p>
              </div>
              <div className="mb-4 sm:mb-6 mt-8 sm:mt-10">
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-1">{t('landing.proName')}</h3>
                <p className="text-muted-foreground text-xs sm:text-sm">{t('landing.proDesc')}</p>
              </div>
              <div className="mb-4 sm:mb-6">
                <span className="text-3xl sm:text-4xl font-semibold text-foreground">39€</span>
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
            {([1, 2, 3, 4, 5, 6, 7, 8] as const).map((i) => (
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
            Prêt à digitaliser votre activité de detailing ?
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground mb-8 sm:mb-10 leading-relaxed px-2">
            Rejoignez les professionnels qui gagnent du temps et des clients grâce à CleaningPage.
          </p>
          <TrialButton className="rounded-full px-6 sm:px-8" />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-10 px-4 sm:px-6 border-t border-border/50">
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-3">
          <div className="flex items-center gap-4 text-xs text-muted-foreground/60">
            <Link to="/confidentialite" className="hover:text-muted-foreground transition-colors">{t('landing.privacy')}</Link>
            <span>·</span>
            <Link to="/cgu" className="hover:text-muted-foreground transition-colors">{t('landing.terms')}</Link>
            <span>·</span>
            <Link to="/mentions-legales" className="hover:text-muted-foreground transition-colors">{t('landing.legalNotices')}</Link>
          </div>
          <p className="text-xs text-muted-foreground/40">{t('landing.allRightsReserved')}</p>
        </div>
      </footer>
    </div>
  );
}
