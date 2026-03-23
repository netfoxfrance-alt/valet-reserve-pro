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

      {/* Hero Section - Same mockup, new text */}
      <section className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left: Text - Desktop */}
            <div className="text-center lg:text-left hidden lg:block">
              <h1 className="opacity-0 animate-fade-in-up stagger-1 text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-semibold text-foreground tracking-tight mb-4 sm:mb-6 leading-[1.08]">
                La solution de réservation en ligne pour les professionnels du{' '}
                <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">detailing auto</span>
              </h1>

              <div className="opacity-0 animate-fade-in-up stagger-2 max-w-lg mx-auto lg:mx-0 mb-8">
                <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed">
                  Offrez à vos clients une expérience simple, rapide et professionnelle et gérez votre activité en toute simplicité.
                </p>
              </div>

              <div className="opacity-0 animate-fade-in-up stagger-3 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-8">
                <TrialButton />
              </div>

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
              <h1 className="opacity-0 animate-fade-in-up text-3xl sm:text-4xl font-semibold text-foreground tracking-tight mb-4 leading-[1.08]">
                La solution de réservation en ligne pour les pros du{' '}
                <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">detailing auto</span>
              </h1>

              <div className="opacity-0 animate-fade-in-up stagger-1 max-w-sm mx-auto mb-6">
                <p className="text-base text-muted-foreground leading-relaxed">
                  Offrez à vos clients une expérience simple et professionnelle, et gérez votre activité en toute simplicité.
                </p>
              </div>

              <TrialButton className="w-full mb-4" />

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

            {/* Right: Same Two Mockup Cards */}
            <div className="flex justify-center lg:justify-end mt-8 lg:mt-0">
              <div className="relative w-[340px] sm:w-[440px] md:w-[560px] lg:w-[620px] h-[480px] sm:h-[500px] md:h-[520px]">
                {/* Dashboard Mockup Card */}
                <div className="absolute top-0 right-0 lg:top-2 lg:right-0 z-10">
                  <div className="bg-card rounded-[2rem] overflow-hidden w-[220px] sm:w-[260px] lg:w-[300px] shadow-2xl shadow-black/15 ring-1 ring-border/40" style={{ transform: 'rotate(3deg)' }}>
                    <div className="px-4 lg:px-5 pt-4 pb-3">
                      <h3 className="text-sm lg:text-base font-bold text-foreground leading-tight mb-2">GOCLEANING</h3>
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
                    <div className="px-4 lg:px-5 pb-5 pt-2">
                      <div className="grid grid-cols-3 gap-x-3 gap-y-4 lg:gap-x-4 lg:gap-y-5">
                        {dashboardIcons.map((item) => (
                          <div key={item.label} className="flex flex-col items-center gap-1.5">
                            <img src={item.icon} alt={item.label} className="w-10 h-10 sm:w-11 sm:h-11 lg:w-14 lg:h-14 object-contain" />
                            <span className="text-[8px] sm:text-[9px] lg:text-[10px] font-medium text-muted-foreground text-center leading-tight truncate max-w-[70px]">{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Page Card */}
                <div className="absolute top-10 sm:top-8 left-0 lg:top-6 lg:left-4 z-20">
                  <div className="bg-card rounded-[2rem] overflow-hidden w-[220px] sm:w-[250px] lg:w-[280px] shadow-2xl shadow-black/20 ring-1 ring-border/40" style={{ transform: 'rotate(-3deg)' }}>
                    <div className="flex items-center justify-between px-3 lg:px-4 py-2.5">
                      <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-xl overflow-hidden ring-1 ring-border/30">
                        <img src={gocleanLogo} alt="GoCleaning Logo" className="w-full h-full object-cover" />
                      </div>
                      <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-zinc-700 flex items-center justify-center">
                        <Phone className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>
                    <div className="border-t border-border/40" />
                    <div className="px-3.5 lg:px-4 pb-3 pt-4 text-center">
                      <h3 className="text-sm lg:text-base font-extrabold text-foreground tracking-wide">GO CLEANING</h3>
                      <p className="text-[8px] lg:text-[9px] text-muted-foreground mb-2">Expert du nettoyage automobile depuis 2018</p>
                      <div className="flex justify-center items-center gap-2 mb-2">
                        <span className="inline-flex items-center gap-1 text-[9px] border border-emerald-200 text-emerald-600 px-2 py-0.5 rounded-full font-semibold">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                          {t('mockup.open')}
                        </span>
                        <span className="inline-flex items-center gap-0.5 text-[8px] text-muted-foreground">
                          <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                          <span className="font-semibold text-foreground/70">4.9</span>
                        </span>
                      </div>
                      <div className="flex justify-center gap-2 mb-2.5">
                        <div className="w-8 h-8 bg-secondary/30 rounded-full flex items-center justify-center border border-border/40">
                          <Instagram className="w-3.5 h-3.5 text-foreground/70" />
                        </div>
                        <div className="w-8 h-8 bg-secondary/30 rounded-full flex items-center justify-center border border-border/40">
                          <svg className="w-3.5 h-3.5 text-foreground/70" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.88-2.88 2.89 2.89 0 0 1 2.88-2.88c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.16 15a6.34 6.34 0 0 0 6.33 6.33 6.34 6.34 0 0 0 6.33-6.33V8.73a8.19 8.19 0 0 0 4.77 1.53V6.81a4.82 4.82 0 0 1-1-.12z"/></svg>
                        </div>
                      </div>
                      <div className="mb-2.5">
                        <p className="text-[11px] lg:text-xs font-bold text-foreground text-left mb-2">Nos formules</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="rounded-2xl overflow-hidden ring-1 ring-border/30">
                            <div className="relative aspect-[4/3]">
                              <img src={mockupExterior} alt="Lavage complet" className="w-full h-full object-cover" />
                            </div>
                            <div className="p-2 bg-card">
                              <p className="text-[9px] lg:text-[10px] font-bold text-foreground leading-tight">Lavage complet</p>
                              <div className="flex items-center justify-between mt-0.5">
                                <span className="text-[10px] lg:text-[11px] font-bold text-emerald-600">dès 65€</span>
                                <span className="text-[7px] text-muted-foreground flex items-center gap-0.5"><Clock className="w-2 h-2" />1h</span>
                              </div>
                            </div>
                          </div>
                          <div className="rounded-2xl overflow-hidden ring-1 ring-border/30">
                            <div className="relative aspect-[4/3]">
                              <img src={mockupInterior} alt="Nettoyage intérieur" className="w-full h-full object-cover" />
                            </div>
                            <div className="p-2 bg-card">
                              <p className="text-[9px] lg:text-[10px] font-bold text-foreground leading-tight">Nettoyage intérieur</p>
                              <div className="flex items-center justify-between mt-0.5">
                                <span className="text-[10px] lg:text-[11px] font-bold text-emerald-600">dès 50€</span>
                                <span className="text-[7px] text-muted-foreground flex items-center gap-0.5"><Clock className="w-2 h-2" />1h</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <button className="w-full bg-emerald-500 text-white rounded-xl py-2 text-[10px] font-semibold">Réserver</button>
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
            {/* Right: Coded mockup card like hero */}
            <div className="opacity-0 animate-fade-in-up stagger-2 flex justify-center lg:justify-end">
              <div className="bg-card rounded-[2rem] overflow-hidden w-[260px] sm:w-[280px] lg:w-[300px] shadow-2xl shadow-black/20 ring-1 ring-border/40" style={{ transform: 'rotate(-2deg)' }}>
                <div className="flex items-center justify-between px-3.5 lg:px-4 py-2.5">
                  <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-xl overflow-hidden ring-1 ring-border/30">
                    <img src={gocleanLogo} alt="GoCleaning Logo" className="w-full h-full object-cover" />
                  </div>
                  <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-zinc-700 flex items-center justify-center">
                    <Phone className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
                <div className="border-t border-border/40" />
                <div className="px-3.5 lg:px-4 pb-4 pt-4 text-center">
                  <h3 className="text-sm lg:text-base font-extrabold text-foreground tracking-wide">GO CLEANING</h3>
                  <p className="text-[8px] lg:text-[9px] text-muted-foreground mb-2">Expert du nettoyage automobile depuis 2018</p>
                  <div className="flex justify-center items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 text-[9px] border border-emerald-200 text-emerald-600 px-2 py-0.5 rounded-full font-semibold">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      {t('mockup.open')}
                    </span>
                    <span className="inline-flex items-center gap-0.5 text-[8px] text-muted-foreground">
                      <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                      <span className="font-semibold text-foreground/70">4.9</span>
                    </span>
                  </div>
                  <div className="flex justify-center gap-2 mb-2.5">
                    <div className="w-8 h-8 bg-secondary/30 rounded-full flex items-center justify-center border border-border/40">
                      <Instagram className="w-3.5 h-3.5 text-foreground/70" />
                    </div>
                    <div className="w-8 h-8 bg-secondary/30 rounded-full flex items-center justify-center border border-border/40">
                      <svg className="w-3.5 h-3.5 text-foreground/70" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.88-2.88 2.89 2.89 0 0 1 2.88-2.88c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.16 15a6.34 6.34 0 0 0 6.33 6.33 6.34 6.34 0 0 0 6.33-6.33V8.73a8.19 8.19 0 0 0 4.77 1.53V6.81a4.82 4.82 0 0 1-1-.12z"/></svg>
                    </div>
                  </div>
                  <div className="bg-muted/30 rounded-xl px-3 py-2 mb-3 flex items-center gap-2">
                    <Mail className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[9px] text-muted-foreground">Formule personnalisée ? Identifiez-vous</span>
                  </div>
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[9px] text-emerald-600 font-medium">Ouvert</span>
                    <span className="text-[9px] text-muted-foreground">· Ferme à 19h00</span>
                  </div>
                  <div className="mb-3">
                    <p className="text-[11px] lg:text-xs font-bold text-foreground text-left mb-2">Nos formules</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-2xl overflow-hidden relative aspect-[3/4]">
                        <img src={mockupExterior} alt="Lavage complet" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 p-2.5">
                          <p className="text-[10px] lg:text-[11px] font-bold text-white leading-tight uppercase">Lavage complet</p>
                          <span className="text-[11px] lg:text-xs font-bold text-white/90">dès 65€</span>
                        </div>
                      </div>
                      <div className="rounded-2xl overflow-hidden relative aspect-[3/4]">
                        <img src={mockupInterior} alt="Nettoyage intérieur" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 p-2.5">
                          <p className="text-[10px] lg:text-[11px] font-bold text-white leading-tight">Nettoyage intérieur</p>
                          <span className="text-[11px] lg:text-xs font-bold text-white/90">dès 50€</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl py-2.5 text-[11px] font-semibold tracking-wide transition-colors">Réserver</button>
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

      {/* Section 03 — Développez votre activité — Planity image 2 style */}
      <section className="py-20 sm:py-28 lg:py-36 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left: Lifestyle photo */}
            <div className="opacity-0 animate-fade-in-up order-2 lg:order-1">
              <div className="rounded-3xl overflow-hidden shadow-xl shadow-black/5">
                <img
                  src={statsPremium}
                  alt="Suivi statistiques sur ordinateur portable"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
            {/* Right: Text */}
            <div className="opacity-0 animate-fade-in-up stagger-2 order-1 lg:order-2">
              <span className="text-xs font-medium text-muted-foreground/60 tracking-[0.2em] uppercase mb-4 block">03 — Pilotage</span>
              <h2 className="text-3xl sm:text-4xl md:text-[2.75rem] font-semibold text-foreground tracking-tight mb-8 leading-[1.08]">
                Plus qu'un outil, un levier de croissance
              </h2>
              <ul className="space-y-5 mb-10">
                {[
                  'Toutes vos réservations et vos clients regroupés',
                  'Suivi de votre activité en temps réel',
                  'Données et statistiques accessibles simplement',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3.5">
                    <Check className="w-4 h-4 text-muted-foreground/50 flex-shrink-0 mt-1" strokeWidth={1.5} />
                    <span className="text-muted-foreground text-[15px] leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-foreground text-[15px] leading-relaxed mb-8">
                Votre logiciel detailing devient un véritable outil de pilotage et de rentabilité.
              </p>
              <div>
                <TrialButton />
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
