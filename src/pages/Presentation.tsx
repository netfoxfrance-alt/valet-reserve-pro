import { useState, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { 
  ArrowRight, Check, Calendar, Users, BarChart3, 
  Clock, Globe, Palette, Phone,
  MousePointer2, Receipt, Plus,
  Instagram, Facebook, Mail,
  ChevronLeft, ChevronRight, Sparkles,
  Search, Star, FileText, TrendingUp,
  MapPin, Bookmark
} from 'lucide-react';
import mockupCarCleaning from '@/assets/mockup-car-cleaning.jpg';
import mockupLogoClean from '@/assets/mockup-logo-cleaning.png';
import sofaBanner from '@/assets/sofa-cleaning-banner.jpg';
import presCarDetailing from '@/assets/pres-car-detailing.png';

const TOTAL_SLIDES = 13;

/* ─── Slide transition wrapper ─── */
function SlideWrapper({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <div
      className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ease-out ${
        active ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
      }`}
    >
      <div className="w-full h-full overflow-y-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-10 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SLIDE COMPONENTS
   ═══════════════════════════════════════════════ */

function SlideCover() {
  const { t } = useTranslation();
  return (
    <div className="max-w-3xl mx-auto text-center">
      <div className="mb-8 animate-fade-in">
        <Logo size="xl" />
      </div>
      <h1 className="animate-fade-in-up stagger-1 text-3xl sm:text-5xl lg:text-6xl font-semibold text-foreground tracking-tight mb-6 leading-[1.1]">
        {t('presentation.coverTitle')}
      </h1>
      <p className="animate-fade-in-up stagger-2 text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto mb-10">
        {t('presentation.coverSubtitle')}
      </p>
      <div className="animate-fade-in-up stagger-3">
        <div className="inline-flex items-center gap-8 bg-secondary/40 rounded-full px-8 py-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center">
              <Check className="w-3 h-3 text-emerald-500" />
            </div>
            <span className="text-sm font-medium text-foreground">{t('presentation.daysOffered')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center">
              <Check className="w-3 h-3 text-emerald-500" />
            </div>
            <span className="text-sm font-medium text-foreground">{t('presentation.noCommitment')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SlideNeeds() {
  const { t } = useTranslation();
  const needs = [
    { icon: Globe, label: t('presentation.need1') },
    { icon: Calendar, label: t('presentation.need2') },
    { icon: Clock, label: t('presentation.need3') },
    { icon: Users, label: t('presentation.need4') },
    { icon: Receipt, label: t('presentation.need5') },
  ];

  return (
    <div className="max-w-3xl mx-auto w-full">
      <div className="text-center mb-10 sm:mb-12">
        <p className="animate-fade-in-up text-sm font-semibold text-primary tracking-widest uppercase mb-4">{t('presentation.needsLabel')}</p>
        <h2 className="animate-fade-in-up stagger-1 text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground tracking-tight">
          {t('presentation.needsTitle')}
        </h2>
      </div>
      <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 max-w-2xl mx-auto">
        {needs.map((n, i) => (
          <div 
            key={i} 
            className="flex items-center gap-4 bg-secondary/30 rounded-2xl p-5 animate-fade-in-up" 
            style={{ animationDelay: `${0.15 + i * 0.08}s` }}
          >
            <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center flex-shrink-0 shadow-sm">
              <n.icon className="w-5 h-5 text-foreground" />
            </div>
            <p className="text-sm sm:text-[15px] font-medium text-foreground leading-snug">{n.label}</p>
          </div>
        ))}
      </div>
      <p className="animate-fade-in-up text-center text-sm text-muted-foreground mt-8 max-w-md mx-auto" style={{ animationDelay: '0.7s' }}>
        {t('presentation.needsFooter')}
      </p>
    </div>
  );
}

function SlideSolution() {
  const { t } = useTranslation();
  const pillars = [
    { icon: Globe, label: t('presentation.pillar1Title'), desc: t('presentation.pillar1Desc'), color: 'bg-blue-500/10', iconColor: 'text-blue-600' },
    { icon: Calendar, label: t('presentation.pillar2Title'), desc: t('presentation.pillar2Desc'), color: 'bg-emerald-500/10', iconColor: 'text-emerald-600' },
    { icon: BarChart3, label: t('presentation.pillar3Title'), desc: t('presentation.pillar3Desc'), color: 'bg-violet-500/10', iconColor: 'text-violet-600' },
  ];

  return (
    <div className="max-w-4xl mx-auto w-full text-center">
      <p className="animate-fade-in-up text-sm font-semibold text-primary tracking-widest uppercase mb-4">{t('presentation.solutionLabel')}</p>
      <h2 className="animate-fade-in-up stagger-1 text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground tracking-tight mb-3">
        {t('presentation.solutionTitle')}
      </h2>
      <p className="animate-fade-in-up stagger-2 text-muted-foreground text-sm sm:text-base max-w-md mx-auto mb-12 sm:mb-14">
        {t('presentation.solutionSubtitle')}
      </p>
      <div className="grid sm:grid-cols-3 gap-5 sm:gap-6">
        {pillars.map((p, i) => (
          <div 
            key={i} 
            className="bg-card rounded-2xl p-6 sm:p-8 text-center border border-border/40 shadow-sm hover:shadow-md transition-shadow animate-fade-in-up" 
            style={{ animationDelay: `${0.25 + i * 0.12}s` }}
          >
            <div className={`w-14 h-14 rounded-2xl ${p.color} flex items-center justify-center mx-auto mb-5`}>
              <p.icon className={`w-7 h-7 ${p.iconColor}`} />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">{p.label}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SlideCustomize() {
  const { t } = useTranslation();
  return (
    <div className="max-w-5xl mx-auto w-full">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="animate-fade-in-up text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground tracking-tight mb-3">
          {t('presentation.customizeTitle')}
        </h2>
        <p className="animate-fade-in-up stagger-1 text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">
          {t('presentation.customizeSubtitle')}
        </p>
      </div>
      <div className="animate-fade-in-up stagger-2">
        <div className="relative max-w-4xl mx-auto flex items-center justify-center">
          {/* Central Phone Mockup */}
          <div className="relative mx-auto w-[240px] sm:w-[260px]">
            <div className="bg-card rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-border/20">
              <div className="h-20 sm:h-24 relative overflow-hidden rounded-t-[2rem]">
                <img src={mockupCarCleaning} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              <div className="flex justify-center -mt-8 relative z-30 mb-2">
                <div className="w-16 h-16 bg-white rounded-xl shadow-2xl flex items-center justify-center ring-4 ring-white overflow-hidden">
                  <img src={mockupLogoClean} alt="Logo" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="px-4 pb-4 text-center">
                <h3 className="text-sm font-bold text-foreground mb-0.5">Clean Premium</h3>
                <p className="text-[10px] text-muted-foreground mb-2">{t('presentation.customizePremiumDesc')}</p>
                <div className="flex justify-center mb-3">
                  <span className="inline-flex items-center gap-1.5 text-[9px] bg-white border border-emerald-200 text-emerald-600 px-3 py-1 rounded-full font-medium">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    {t('presentation.customizeOpen')}
                  </span>
                </div>
                <div className="flex justify-center gap-2 mb-3">
                  {[Instagram, Facebook, Mail].map((Icon, i) => (
                    <div key={i} className="w-8 h-8 rounded-full flex items-center justify-center bg-card border border-foreground/20">
                      <Icon className="w-3.5 h-3.5 text-foreground" />
                    </div>
                  ))}
                </div>
                <div className="text-left mb-3">
                  <h4 className="text-xs font-semibold text-foreground mb-2">{t('presentation.customizeOurFormulas')}</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-card border border-border/60 rounded-lg p-2">
                      <p className="text-[10px] font-semibold text-foreground">Express</p>
                      <p className="text-sm font-bold text-muted-foreground">35€</p>
                    </div>
                    <div className="bg-card border border-border/60 rounded-lg p-2">
                      <p className="text-[10px] font-semibold text-foreground">Complet</p>
                      <p className="text-sm font-bold text-muted-foreground">89€</p>
                    </div>
                  </div>
                </div>
                <button className="w-full bg-neutral-800 text-white py-2.5 rounded-xl text-xs font-semibold">
                  {t('presentation.customizeBookNow')}
                </button>
              </div>
            </div>
          </div>

          {/* Floating widgets - desktop only */}
          <div className="hidden sm:block">
            <div className="absolute top-8 left-4 lg:left-16 z-30 animate-float" style={{ animationDelay: '0s' }}>
              <div className="bg-card rounded-xl p-3 shadow-xl ring-1 ring-border/30 relative">
                <p className="text-[9px] text-muted-foreground mb-1.5 font-medium">{t('presentation.customizeColors')}</p>
                <div className="flex gap-1.5">
                  {['bg-emerald-500', 'bg-blue-500', 'bg-violet-500'].map((bg, i) => (
                    <div key={i} className={`w-6 h-6 ${bg} rounded-full ${i === 0 ? 'ring-2 ring-foreground ring-offset-2 ring-offset-card' : ''} shadow-sm`} />
                  ))}
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-red-500 via-yellow-500 to-purple-500 shadow-sm flex items-center justify-center">
                    <Plus className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div className="absolute -bottom-1.5 -right-1.5">
                  <MousePointer2 className="w-5 h-5 text-foreground drop-shadow-lg" />
                </div>
              </div>
            </div>

            <div className="absolute top-4 right-4 lg:right-16 z-30 animate-float" style={{ animationDelay: '0.15s' }}>
              <div className="bg-card rounded-xl p-3 shadow-xl ring-1 ring-border/30">
                <p className="text-[9px] text-muted-foreground mb-1.5 font-medium">{t('presentation.customizeAvailability')}</p>
                <div className="space-y-1">
                  {[
                    { day: 'Lun', hours: '9h-18h', active: true },
                    { day: 'Mar', hours: '9h-18h', active: true },
                    { day: 'Mer', hours: '14h-18h', active: true },
                    { day: 'Sam', hours: '—', active: false },
                  ].map((d, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className="text-[8px] w-5 text-muted-foreground">{d.day}</span>
                      <span className={`text-[8px] w-10 ${d.active ? 'text-foreground' : 'text-muted-foreground'}`}>{d.hours}</span>
                      <div className={`w-5 h-2.5 rounded-full ${d.active ? 'bg-emerald-500' : 'bg-secondary'} relative`}>
                        <div className={`absolute w-1.5 h-1.5 bg-white rounded-full top-0.5 ${d.active ? 'right-0.5' : 'left-0.5'}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="absolute bottom-16 left-4 lg:left-12 z-30 animate-float" style={{ animationDelay: '0.25s' }}>
              <div className="bg-card rounded-xl p-3 shadow-xl ring-1 ring-border/30 w-32">
                <p className="text-[9px] text-muted-foreground mb-1.5 font-medium">{t('presentation.customizeFormulas')}</p>
                <div className="space-y-1.5">
                  {[
                    { name: 'Express', price: '35€' },
                    { name: 'Complet', price: '89€' },
                    { name: 'Premium', price: '129€' },
                  ].map((f, i) => (
                    <div key={i} className="flex justify-between items-center text-[10px]">
                      <span className="text-foreground font-medium">{f.name}</span>
                      <span className="font-bold">{f.price}</span>
                    </div>
                  ))}
                  <button className="w-full text-[9px] text-muted-foreground font-medium py-1 border border-dashed border-border rounded-md mt-0.5">
                    {t('presentation.customizeAddFormula')}
                  </button>
                </div>
              </div>
            </div>

            <div className="absolute bottom-8 right-4 lg:right-12 z-30 animate-float" style={{ animationDelay: '0.4s' }}>
              <div className="bg-card rounded-xl p-2.5 shadow-xl ring-1 ring-border/30">
                <p className="text-[8px] text-muted-foreground mb-1 font-medium">{t('presentation.customizeGallery')}</p>
                <div className="flex gap-1">
                  <div className="w-7 h-7 bg-secondary rounded overflow-hidden">
                    <img src={mockupCarCleaning} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="w-7 h-7 bg-secondary rounded overflow-hidden">
                    <img src={sofaBanner} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="w-7 h-7 bg-secondary/60 rounded flex items-center justify-center border border-dashed border-border">
                    <Plus className="w-2.5 h-2.5 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SlideModes() {
  const { t } = useTranslation();
  return (
    <div className="max-w-5xl mx-auto w-full">
      <div className="text-center mb-8 sm:mb-10">
        <h2 className="animate-fade-in-up text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground tracking-tight">
          {t('presentation.modesTitle')}
        </h2>
      </div>
      <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
        {/* Left: Fixed services */}
        <div className="animate-fade-in-up bg-card rounded-3xl p-5 sm:p-6 border border-border/40 shadow-sm" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
            {t('presentation.modesFixedTitle')}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-5">
            {t('presentation.modesFixedDesc')}
          </p>
          <div className="space-y-3">
            <div className="rounded-2xl overflow-hidden shadow-md ring-1 ring-border/10 relative">
              <img src={presCarDetailing} alt="Detailing auto" className="w-full h-28 sm:h-32 object-cover" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                <div className="flex items-end justify-between">
                  <p className="text-xs font-semibold text-white">{t('presentation.modesFixedService1')}</p>
                  <p className="text-sm font-bold text-white">{t('presentation.modesFixedPrice1')}</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-md ring-1 ring-border/10 relative">
              <img src={sofaBanner} alt="Sofa cleaning" className="w-full h-28 sm:h-32 object-cover" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                <div className="flex items-end justify-between">
                  <p className="text-xs font-semibold text-white">{t('presentation.modesFixedService2')}</p>
                  <p className="text-sm font-bold text-white">{t('presentation.modesFixedPrice2')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Custom quotes */}
        <div className="animate-fade-in-up bg-card rounded-3xl p-5 sm:p-6 border border-border/40 shadow-sm" style={{ animationDelay: '0.4s' }}>
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
            {t('presentation.modesCustomTitle')}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-5">
            {t('presentation.modesCustomDesc')}
          </p>
          <div className="bg-secondary/30 rounded-2xl p-5">
            <p className="text-base sm:text-lg font-bold text-foreground mb-1">{t('presentation.modesCustomGreeting')}</p>
            <p className="text-sm text-muted-foreground mb-4">{t('presentation.modesCustomSubtext')}</p>
            <div className="bg-card rounded-xl p-4 flex items-center justify-between mb-4 border border-border/30 shadow-sm">
              <div>
                <p className="text-sm font-semibold text-foreground">{t('presentation.modesCustomService')}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3" /> {t('presentation.modesCustomDuration')}
                </p>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-foreground">{t('presentation.modesCustomPrice')}</p>
            </div>
            <button className="w-full bg-neutral-800 text-white py-3 rounded-xl text-sm font-semibold mb-2">
              {t('presentation.modesCustomCTA')}
            </button>
            <p className="text-xs text-muted-foreground text-center underline">{t('presentation.modesCustomNotMe')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   DASHBOARD JSX MOCKUP SLIDES
   ═══════════════════════════════════════════════ */

function MockSidebar({ active, items }: { active: string; items: string[] }) {
  const icons = [Calendar, Calendar, Mail, Users, FileText, BarChart3];
  const badges: Record<number, string> = { 0: '3', 2: '2' };
  return (
    <div className="w-44 flex-shrink-0 bg-card border-r border-border/30 py-4 px-3 flex-col hidden lg:flex">
      <p className="text-xs font-bold text-foreground mb-0.5 px-1">CleaningPage</p>
      <p className="text-[9px] text-muted-foreground mb-4 px-1">clean-auto-pro</p>
      <div className="space-y-0.5">
        {items.map((label, i) => {
          const Icon = icons[i];
          const badge = badges[i];
          return (
            <div key={label} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] ${active === label ? 'bg-foreground text-background font-semibold' : 'text-muted-foreground hover:bg-secondary/50'}`}>
              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="flex-1 truncate">{label}</span>
              {badge && <span className={`text-[9px] w-4 h-4 rounded-full flex items-center justify-center ${active === label ? 'bg-background text-foreground' : 'bg-foreground text-background'} font-bold`}>{badge}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MockDashboardShell({ active, children, title, subtitle, sidebarItems }: { active: string; children: React.ReactNode; title: string; subtitle: string; sidebarItems: string[] }) {
  return (
    <div className="max-w-5xl mx-auto w-full">
      <div className="text-center mb-5 sm:mb-6">
        <h2 className="animate-fade-in-up text-xl sm:text-2xl md:text-3xl font-semibold text-foreground tracking-tight mb-1.5">
          {title}
        </h2>
        <p className="animate-fade-in-up stagger-1 text-muted-foreground text-xs sm:text-sm max-w-lg mx-auto">
          {subtitle}
        </p>
      </div>
      <div className="animate-fade-in-up stagger-2">
        <div className="bg-card rounded-2xl shadow-2xl overflow-hidden border border-border/40 max-w-4xl mx-auto">
          <div className="bg-secondary/50 px-4 py-2 flex items-center gap-3 border-b border-border/30">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="text-[10px] text-muted-foreground bg-background/60 rounded-md px-3 py-0.5">cleaningpage.com/<span className="text-foreground font-medium">dashboard</span></div>
            </div>
          </div>
          <div className="flex min-h-[340px] sm:min-h-[380px]">
            <MockSidebar active={active} items={sidebarItems} />
            <div className="flex-1 p-4 sm:p-5 overflow-hidden bg-background">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Slide 6: Réservations ─── */
function SlideReservations() {
  const { t } = useTranslation();
  const sidebarItems = t('presentation.sidebarItems', { returnObjects: true }) as string[];
  const appointments = [
    { initials: 'JM', color: 'bg-blue-500', name: 'Jean Martin', service: 'Nettoyage Complet · 10:00 · 1h30', price: '89€', status: t('presentation.dashConfirmed'), statusColor: 'bg-emerald-500' },
    { initials: 'MD', color: 'bg-pink-400', name: 'Marie Dupont', service: 'Express · 11:30 · 45min', price: '35€', status: t('presentation.dashPending'), statusColor: 'bg-amber-500' },
    { initials: 'PB', color: 'bg-orange-500', name: 'Pierre Bernard', service: 'Rénovation Premium · 14:00 · 3h', price: '159€', status: t('presentation.dashConfirmed'), statusColor: 'bg-emerald-500' },
    { initials: '?', color: 'bg-blue-400', name: t('presentation.dashIncomingRequest'), service: `${t('presentation.modesFixedService2')} · — · —`, price: t('presentation.dashOnQuote'), status: t('presentation.dashRequest'), statusColor: 'bg-blue-500' },
    { initials: 'SL', color: 'bg-violet-500', name: 'Sophie Leroy', service: 'Pack Intérieur · 16:30 · 1h', price: '65€', status: t('presentation.dashConfirmed'), statusColor: 'bg-emerald-500' },
  ];

  return (
    <MockDashboardShell active={sidebarItems[0]} title={t('presentation.dashReservationsTitle')} subtitle={t('presentation.dashReservationsSubtitle')} sidebarItems={sidebarItems}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm sm:text-base font-semibold text-foreground">{t('presentation.dashReservationsLabel')}</p>
          <p className="text-[10px] text-muted-foreground">Mercredi 11 février 2026</p>
        </div>
        <button className="bg-primary text-primary-foreground text-[10px] font-semibold px-3 py-1.5 rounded-lg">{t('presentation.dashNewBooking')}</button>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-card border border-border/40 rounded-xl p-2.5">
          <p className="text-[9px] text-muted-foreground">{t('presentation.dashToday')}</p>
          <p className="text-lg font-bold text-foreground">5</p>
          <p className="text-[8px] text-emerald-500 flex items-center gap-0.5"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> 2 {t('presentation.dashPendingCount')}</p>
        </div>
        <div className="bg-card border border-border/40 rounded-xl p-2.5">
          <p className="text-[9px] text-muted-foreground">{t('presentation.dashThisWeek')}</p>
          <p className="text-lg font-bold text-foreground">23</p>
          <p className="text-[8px] text-muted-foreground">{t('presentation.dashIncludingRequests')}</p>
        </div>
        <div className="bg-card border border-border/40 rounded-xl p-2.5">
          <p className="text-[9px] text-muted-foreground">{t('presentation.dashDailyRevenue')}</p>
          <p className="text-lg font-bold text-foreground">340€</p>
          <p className="text-[8px] text-emerald-500">↑ 15%</p>
        </div>
      </div>
      <div className="flex gap-3 mb-2 border-b border-border/30 pb-1.5">
        {[t('presentation.dashUpcoming'), t('presentation.dashRequests'), t('presentation.dashPast')].map((tab, i) => (
          <span key={tab} className={`text-[10px] pb-1 ${i === 0 ? 'text-foreground font-semibold border-b-2 border-foreground' : 'text-muted-foreground'}`}>{tab}</span>
        ))}
      </div>
      <div className="space-y-0">
        {appointments.map((a, i) => (
          <div key={i} className="flex items-center gap-2.5 py-2 border-b border-border/20 last:border-0">
            <div className={`w-7 h-7 rounded-full ${a.color} flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0`}>{a.initials}</div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-foreground truncate">{a.name}</p>
              <p className="text-[9px] text-muted-foreground truncate">{a.service}</p>
            </div>
            <p className="text-[11px] font-bold text-foreground flex-shrink-0">{a.price}</p>
            <span className={`${a.statusColor} text-white text-[8px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0`}>{a.status}</span>
          </div>
        ))}
      </div>
    </MockDashboardShell>
  );
}

/* ─── Slide 7: Calendrier ─── */
function SlideCalendar() {
  const { t } = useTranslation();
  const sidebarItems = t('presentation.sidebarItems', { returnObjects: true }) as string[];
  const calDays = t('presentation.calendarDays', { returnObjects: true }) as string[];
  const weeks = [
    [26, 27, 28, 29, 30, 31, 1],
    [2, 3, 4, 5, 6, 7, 8],
    [9, 10, 11, 12, 13, 14, 15],
    [16, 17, 18, 19, 20, 21, 22],
    [23, 24, 25, 26, 27, 28, null],
  ];
  const dotsMap: Record<number, string[]> = {
    3: ['bg-emerald-500'], 5: ['bg-emerald-500'], 8: ['bg-emerald-500'],
    11: ['bg-emerald-500', 'bg-amber-500', 'bg-emerald-500'],
    12: ['bg-emerald-500'], 15: ['bg-emerald-500', 'bg-emerald-500'],
    18: ['bg-emerald-500'],
    22: ['bg-emerald-500', 'bg-amber-500', 'bg-blue-500'],
    25: ['bg-emerald-500'],
  };

  return (
    <MockDashboardShell active={sidebarItems[1]} title={t('presentation.dashCalendarTitle')} subtitle={t('presentation.dashCalendarSubtitle')} sidebarItems={sidebarItems}>
      <div className="flex items-center gap-2 bg-secondary/40 rounded-xl p-2.5 mb-3">
        <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm">
          <span className="text-[10px] font-bold">G</span>
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-semibold text-foreground">{t('presentation.dashConnectGoogle')}</p>
          <p className="text-[8px] text-muted-foreground">{t('presentation.dashSyncAuto')}</p>
        </div>
        <span className="text-primary text-[9px] font-semibold">{t('presentation.dashConnect')}</span>
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-muted-foreground">‹</span>
            <span className="text-xs font-semibold text-foreground">{t('presentation.dashFebruary2026')}</span>
            <span className="text-[10px] text-muted-foreground">›</span>
          </div>
          <div className="grid grid-cols-7 gap-0">
            {calDays.map((d, i) => (
              <div key={i} className="text-center text-[8px] font-semibold text-muted-foreground py-1">{d}</div>
            ))}
            {weeks.flat().map((day, i) => {
              const isToday = day === 11;
              const isCurrentMonth = day !== null && (i < 7 ? day > 20 ? false : true : true);
              const dots = day ? dotsMap[day] : undefined;
              return (
                <div key={i} className={`text-center py-1.5 relative ${isToday ? 'bg-blue-500 rounded-lg' : ''}`}>
                  <span className={`text-[9px] ${isToday ? 'text-white font-bold' : !isCurrentMonth || !day ? 'text-muted-foreground/40' : 'text-foreground'}`}>
                    {day || ''}
                  </span>
                  {dots && !isToday && (
                    <div className="flex gap-0.5 justify-center mt-0.5">
                      {dots.map((c, j) => <div key={j} className={`w-1 h-1 rounded-full ${c}`} />)}
                    </div>
                  )}
                  {isToday && (
                    <div className="flex gap-0.5 justify-center mt-0.5">
                      <div className="w-1 h-1 rounded-full bg-white" />
                      <div className="w-1 h-1 rounded-full bg-white" />
                      <div className="w-1 h-1 rounded-full bg-white" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-3 mt-2">
            {[{ c: 'bg-emerald-500', l: t('presentation.dashConfirmed') }, { c: 'bg-amber-500', l: t('presentation.dashPending') }, { c: 'bg-blue-500', l: t('presentation.dashCompleted') }].map((item) => (
              <div key={item.l} className="flex items-center gap-1">
                <div className={`w-1.5 h-1.5 rounded-full ${item.c}`} />
                <span className="text-[8px] text-muted-foreground">{item.l}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="w-32 flex-shrink-0 hidden sm:block">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center text-white text-[9px] font-bold">11</span>
            <div>
              <p className="text-[10px] font-semibold text-foreground">{t('presentation.dashWednesday')}</p>
              <p className="text-[8px] text-muted-foreground">3 {t('presentation.dashAppointments')} · 340€</p>
            </div>
          </div>
          <div className="space-y-2">
            {[
              { time: '10:00', name: 'Jean M.', desc: 'Complet · 89€', c: 'bg-emerald-500' },
              { time: '11:30', name: 'Marie D.', desc: 'Express · 35€', c: 'bg-amber-500' },
              { time: '14:00', name: 'Pierre B.', desc: 'Rénovation · 159€', c: 'bg-emerald-500' },
            ].map((rdv, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${rdv.c} mt-1 flex-shrink-0`} />
                <div>
                  <p className="text-[10px] font-bold text-foreground">{rdv.time}</p>
                  <p className="text-[9px] text-foreground font-medium">{rdv.name}</p>
                  <p className="text-[8px] text-muted-foreground">{rdv.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MockDashboardShell>
  );
}

/* ─── Slide 8: Clients ─── */
function SlideClients() {
  const { t } = useTranslation();
  const sidebarItems = t('presentation.sidebarItems', { returnObjects: true }) as string[];
  const clients = [
    { initials: 'SL', color: 'bg-violet-500', name: 'Sophie Leroy', visits: `15 ${t('presentation.dashVisits')} · ${t('presentation.dashLastVisit')} ${t('presentation.dashToday')}`, ca: '1 420€' },
    { initials: 'JM', color: 'bg-blue-500', name: 'Jean Martin', visits: `12 ${t('presentation.dashVisits')} · ${t('presentation.dashLastVisit')} 10 fév`, ca: '1 068€' },
    { initials: 'MD', color: 'bg-pink-400', name: 'Marie Dupont', visits: `8 ${t('presentation.dashVisits')} · ${t('presentation.dashLastVisit')} 8 fév`, ca: '520€' },
    { initials: 'PB', color: 'bg-orange-500', name: 'Pierre Bernard', visits: `3 ${t('presentation.dashVisits')} · ${t('presentation.dashLastVisit')} 2 fév`, ca: '477€' },
  ];

  return (
    <MockDashboardShell active={sidebarItems[3]} title={t('presentation.dashClientsTitle')} subtitle={t('presentation.dashClientsSubtitle')} sidebarItems={sidebarItems}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-foreground">{t('presentation.dashClientsLabel')}</p>
          <p className="text-[10px] text-muted-foreground">142 {t('presentation.dashRegisteredClients')}</p>
        </div>
        <button className="bg-primary text-primary-foreground text-[10px] font-semibold px-3 py-1.5 rounded-lg">+ {t('common.add')}</button>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-card border border-border/40 rounded-xl p-2.5 text-center">
          <p className="text-lg font-bold text-foreground">142</p>
          <p className="text-[9px] text-muted-foreground">{t('presentation.dashClientsLabel')}</p>
        </div>
        <div className="bg-card border border-border/40 rounded-xl p-2.5 text-center">
          <p className="text-lg font-bold text-foreground">8 640€</p>
          <p className="text-[9px] text-muted-foreground">{t('presentation.dashTotalRevenue')}</p>
        </div>
        <div className="bg-card border border-border/40 rounded-xl p-2.5 text-center">
          <p className="text-lg font-bold text-foreground">61€</p>
          <p className="text-[9px] text-muted-foreground">{t('presentation.dashAvgBasket')}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 bg-secondary/30 rounded-lg px-2.5 py-1.5 mb-2">
        <Search className="w-3 h-3 text-muted-foreground" />
        <span className="text-[10px] text-muted-foreground">{t('presentation.dashSearchClient')}</span>
      </div>
      <p className="text-[9px] text-muted-foreground text-center mb-2">{t('presentation.dashClickClientHint')}</p>
      <div className="space-y-0">
        {clients.map((c, i) => (
          <div key={i} className="flex items-center gap-2.5 py-2 border-b border-border/20 last:border-0">
            <div className={`w-7 h-7 rounded-full ${c.color} flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0`}>{c.initials}</div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-foreground">{c.name}</p>
              <p className="text-[9px] text-muted-foreground">{c.visits}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-[11px] font-bold text-foreground">{c.ca}</p>
              <p className="text-[8px] text-muted-foreground">{t('presentation.dashTotalRevenue')}</p>
            </div>
            <ChevronRight className="w-3 h-3 text-muted-foreground/40 flex-shrink-0" />
          </div>
        ))}
      </div>
    </MockDashboardShell>
  );
}

/* ─── Slide 9: Fiche Client ─── */
function SlideFicheClient() {
  const { t } = useTranslation();
  const sidebarItems = t('presentation.sidebarItems', { returnObjects: true }) as string[];
  return (
    <MockDashboardShell active={sidebarItems[3]} title={t('presentation.dashFicheTitle')} subtitle={t('presentation.dashFicheSubtitle')} sidebarItems={sidebarItems}>
      <p className="text-[9px] text-muted-foreground mb-2 flex items-center gap-1"><ChevronLeft className="w-3 h-3" /> {t('presentation.dashBackToClients')}</p>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-violet-500 flex items-center justify-center text-white text-sm font-bold">SL</div>
        <div className="flex-1">
          <p className="text-sm font-bold text-foreground">Sophie Leroy</p>
          <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
            <span className="flex items-center gap-0.5"><Phone className="w-2.5 h-2.5" /> 06 12 34 56 78</span>
            <span className="flex items-center gap-0.5"><Mail className="w-2.5 h-2.5" /> sophie.leroy@email.com</span>
            <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" /> 12 rue de Rivoli, 75001</span>
          </div>
        </div>
        <span className="text-[9px] text-muted-foreground border border-border/40 px-2 py-0.5 rounded-full">{t('presentation.dashViaBooking')}</span>
      </div>
      <div className="grid grid-cols-4 gap-2 mb-3">
        {[
          { v: '15', l: t('presentation.dashReservationsKpi') },
          { v: '1 420€', l: t('presentation.dashTotalRevenue') },
          { v: '3', l: t('presentation.dashInvoicesKpi') },
          { v: '1', l: t('presentation.dashQuotesKpi') },
        ].map((k) => (
          <div key={k.l} className="bg-card border border-border/40 rounded-xl p-2 text-center">
            <p className="text-sm font-bold text-foreground">{k.v}</p>
            <p className="text-[8px] text-muted-foreground">{k.l}</p>
          </div>
        ))}
      </div>
      <div className="bg-secondary/30 rounded-xl p-3 mb-2">
        <p className="text-[8px] text-muted-foreground mb-1">{t('presentation.dashDefaultService')}</p>
        <p className="text-[11px] font-semibold text-foreground flex items-center gap-1"><Sparkles className="w-3 h-3" /> Nettoyage Complet · 1h30 · 89€</p>
      </div>
      <div className="bg-secondary/20 rounded-xl p-3 mb-3">
        <p className="text-[8px] text-muted-foreground mb-1">{t('presentation.dashNotes')}</p>
        <p className="text-[10px] text-foreground">{t('presentation.dashLoyalNote')}</p>
      </div>
      <div className="flex gap-3 mb-2">
        {[t('presentation.dashServices'), t('presentation.dashInvoicesAndQuotes')].map((tab, i) => (
          <span key={tab} className={`text-[10px] pb-1 ${i === 0 ? 'text-foreground font-semibold border-b-2 border-foreground' : 'text-muted-foreground'}`}>{tab}</span>
        ))}
      </div>
      <div className="space-y-0">
        {[
          { name: 'Nettoyage Complet', date: '11 fév 2026 à 10:00', price: '89€', status: t('presentation.dashConfirmed'), sc: 'bg-emerald-500' },
          { name: 'Nettoyage Complet', date: '28 jan 2026 à 09:30', price: '89€', status: t('presentation.dashCompleted'), sc: 'bg-muted-foreground' },
          { name: 'Lavage Express', date: '15 jan 2026 à 14:00', price: '35€', status: t('presentation.dashCompleted'), sc: 'bg-muted-foreground' },
        ].map((h, i) => (
          <div key={i} className="flex items-center justify-between py-1.5 border-b border-border/20 last:border-0">
            <div>
              <p className="text-[10px] font-semibold text-foreground">{h.name}</p>
              <p className="text-[8px] text-muted-foreground">{h.date}</p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-bold text-foreground">{h.price}</p>
              <span className={`${h.sc} text-white text-[7px] font-semibold px-1.5 py-0.5 rounded-full`}>{h.status}</span>
            </div>
          </div>
        ))}
      </div>
    </MockDashboardShell>
  );
}

/* ─── Slide 10: Factures & Devis ─── */
function SlideInvoices() {
  const { t } = useTranslation();
  const sidebarItems = t('presentation.sidebarItems', { returnObjects: true }) as string[];
  const invoices = [
    { num: 'FAC-2026-012', client: 'Jean Martin · 10 fév', amount: '89,00 €', status: t('presentation.dashPaid'), sc: 'bg-emerald-500', bar: 'bg-emerald-500' },
    { num: 'FAC-2026-011', client: 'Marie Dupont · 8 fév', amount: '159,00 €', status: t('presentation.dashSent'), sc: 'bg-blue-500', bar: 'bg-blue-500' },
    { num: 'DEV-2026-005', client: 'Pierre Bernard · 5 fév', amount: '320,00 €', status: t('presentation.dashPending'), sc: 'bg-amber-500', bar: 'bg-amber-500' },
    { num: 'FAC-2026-010', client: 'Sophie Leroy · 3 fév', amount: '65,00 €', status: t('presentation.dashPaid'), sc: 'bg-emerald-500', bar: 'bg-emerald-500' },
  ];

  return (
    <MockDashboardShell active={sidebarItems[4]} title={t('presentation.dashInvoicesTitle')} subtitle={t('presentation.dashInvoicesSubtitle')} sidebarItems={sidebarItems}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-foreground">{t('presentation.dashInvoicesTitle')}</p>
          <p className="text-[10px] text-muted-foreground">{t('presentation.dashManageDocuments')}</p>
        </div>
        <div className="flex gap-1.5">
          <button className="bg-card border border-border/50 text-foreground text-[10px] font-semibold px-3 py-1.5 rounded-lg">{t('presentation.dashQuotesBtn')}</button>
          <button className="bg-primary text-primary-foreground text-[10px] font-semibold px-3 py-1.5 rounded-lg">{t('presentation.dashNewInvoice')}</button>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2 mb-3">
        {[
          { label: t('presentation.dashInvoicesTab'), value: '24' },
          { label: t('presentation.dashQuotesTab'), value: '8' },
          { label: t('presentation.dashPendingLabel'), value: '680€' },
          { label: t('presentation.dashCollected'), value: '3 240€' },
        ].map((k) => (
          <div key={k.label} className="bg-card border border-border/40 rounded-xl p-2.5">
            <p className="text-[9px] text-muted-foreground">{k.label}</p>
            <p className="text-sm font-bold text-foreground">{k.value}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-3 mb-2 border-b border-border/30 pb-1.5">
        {[t('presentation.dashAll'), t('presentation.dashInvoicesTab'), t('presentation.dashQuotesTab')].map((tab, i) => (
          <span key={tab} className={`text-[10px] pb-1 ${i === 0 ? 'text-foreground font-semibold border-b-2 border-foreground' : 'text-muted-foreground'}`}>{tab}</span>
        ))}
      </div>
      <div className="space-y-0">
        {invoices.map((inv, i) => (
          <div key={i} className="flex items-center gap-2.5 py-2 border-b border-border/20 last:border-0">
            <div className={`w-1 h-8 ${inv.bar} rounded-full flex-shrink-0`} />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-foreground">{inv.num}</p>
              <p className="text-[9px] text-muted-foreground">{inv.client}</p>
            </div>
            <p className="text-[11px] font-bold text-foreground flex-shrink-0">{inv.amount}</p>
            <span className={`${inv.sc} text-white text-[8px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0`}>{inv.status}</span>
          </div>
        ))}
      </div>
    </MockDashboardShell>
  );
}

/* ─── Slide 11: Statistiques ─── */
function SlideStats() {
  const { t } = useTranslation();
  const sidebarItems = t('presentation.sidebarItems', { returnObjects: true }) as string[];
  const months = t('presentation.dashMonths', { returnObjects: true }) as string[];

  return (
    <MockDashboardShell active={sidebarItems[5]} title={t('presentation.dashStatsTitle')} subtitle={t('presentation.dashStatsSubtitle')} sidebarItems={sidebarItems}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] text-muted-foreground">‹</span>
        <p className="text-sm font-bold text-foreground">{t('presentation.dashJanuary2025')}</p>
        <span className="text-[10px] text-muted-foreground">›</span>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-card border border-border/40 rounded-xl p-3">
          <p className="text-[9px] text-muted-foreground">{t('presentation.dashReservationsStat')}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-xl font-bold text-foreground">24</p>
            <span className="text-[9px] text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full font-semibold">↑12%</span>
          </div>
        </div>
        <div className="bg-card border border-border/40 rounded-xl p-3">
          <p className="text-[9px] text-muted-foreground">{t('presentation.dashRevenue')}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-xl font-bold text-foreground">8 450€</p>
            <span className="text-[9px] text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full font-semibold">↑18%</span>
          </div>
        </div>
        <div className="bg-card border border-border/40 rounded-xl p-3">
          <p className="text-[9px] text-muted-foreground">{t('presentation.dashClientsStat')}</p>
          <p className="text-xl font-bold text-foreground">18</p>
        </div>
        <div className="bg-card border border-border/40 rounded-xl p-3">
          <p className="text-[9px] text-muted-foreground">{t('presentation.dashAvgBasketStat')}</p>
          <p className="text-xl font-bold text-foreground">352€</p>
        </div>
      </div>
      <div className="flex gap-3 mb-2">
        {[t('presentation.dashEvolution'), t('presentation.dashServicesTab')].map((tab, i) => (
          <span key={tab} className={`text-[10px] pb-1 ${i === 0 ? 'text-foreground font-semibold border-b-2 border-foreground' : 'text-muted-foreground'}`}>{tab}</span>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {/* Réservations par semaine — courbe */}
        <div className="bg-card border border-border/40 rounded-xl p-3">
          <p className="text-[9px] font-semibold text-foreground mb-2">{t('presentation.dashWeeklyBookings')}</p>
          <div className="h-20 relative">
            <svg viewBox="0 0 200 80" className="w-full h-full" preserveAspectRatio="none">
              {/* Grid lines */}
              {[20, 40, 60].map(y => (
                <line key={y} x1="0" y1={y} x2="200" y2={y} stroke="currentColor" className="text-border" strokeWidth="0.5" strokeDasharray="3,3" />
              ))}
              {/* Area fill */}
              <path d="M0,65 L33,55 L66,45 L100,40 L133,30 L166,25 L200,18 L200,80 L0,80 Z" fill="hsl(221 83% 53% / 0.1)" />
              {/* Line curve */}
              <polyline
                points="0,65 33,55 66,45 100,40 133,30 166,25 200,18"
                fill="none"
                stroke="hsl(221 83% 53%)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Data points */}
              {[[0,65],[33,55],[66,45],[100,40],[133,30],[166,25],[200,18]].map(([cx,cy], i) => (
                <circle key={i} cx={cx} cy={cy} r="3" fill="white" stroke="hsl(221 83% 53%)" strokeWidth="2" />
              ))}
            </svg>
          </div>
          <div className="flex justify-between mt-1">
            {['S1','S2','S3','S4','S5','S6','S7'].map(s => (
              <span key={s} className="text-[6px] text-muted-foreground flex-1 text-center">{s}</span>
            ))}
          </div>
        </div>
        {/* CA par mois — colonnes vertes */}
        <div className="bg-card border border-border/40 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[9px] font-semibold text-foreground">{t('presentation.dashMonthlyRevenue')}</p>
            <span className="text-[8px] text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full font-semibold">+18%</span>
          </div>
          <div className="h-20 flex items-end gap-1.5">
            {[
              { h: 45, val: '5.2k' },
              { h: 40, val: '4.8k' },
              { h: 50, val: '6.1k' },
              { h: 48, val: '5.9k' },
              { h: 55, val: '7.0k' },
              { h: 75, val: '8.5k' },
            ].map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <span className="text-[5px] text-emerald-600 font-semibold mb-0.5">{bar.val}</span>
                <div
                  className={`w-full rounded-t-sm ${i === 5 ? 'bg-emerald-500' : 'bg-emerald-500/40'}`}
                  style={{ height: `${bar.h}%` }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1">
            {months.map((m) => (
              <span key={m} className="text-[6px] text-muted-foreground flex-1 text-center">{m}</span>
            ))}
          </div>
        </div>
      </div>
    </MockDashboardShell>
  );
}

/* ═══════════════════════════════════════════════
   BENEFITS & CTA SLIDES
   ═══════════════════════════════════════════════ */

function SlideBenefits() {
  const { t } = useTranslation();
  const benefits = [
    { label: t('presentation.benefit1Title'), desc: t('presentation.benefit1Desc') },
    { label: t('presentation.benefit2Title'), desc: t('presentation.benefit2Desc') },
    { label: t('presentation.benefit3Title'), desc: t('presentation.benefit3Desc') },
    { label: t('presentation.benefit4Title'), desc: t('presentation.benefit4Desc') },
    { label: t('presentation.benefit5Title'), desc: t('presentation.benefit5Desc') },
  ];

  return (
    <div className="max-w-3xl mx-auto w-full">
      <div className="text-center mb-10 sm:mb-12">
        <p className="animate-fade-in-up text-sm font-semibold text-emerald-600 tracking-widest uppercase mb-4">{t('presentation.benefitsLabel')}</p>
        <h2 className="animate-fade-in-up stagger-1 text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground tracking-tight">
          {t('presentation.benefitsTitle')}
        </h2>
      </div>
      <div className="space-y-3 sm:space-y-4">
        {benefits.map((b, i) => (
          <div key={i} className="flex items-center gap-4 sm:gap-5 bg-secondary/30 rounded-2xl p-5 animate-fade-in-up" style={{ animationDelay: `${0.1 + i * 0.08}s` }}>
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
              <Check className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm sm:text-base font-semibold text-foreground">{b.label}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">{b.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SlideTrial() {
  const { t } = useTranslation();
  return (
    <div className="max-w-xl mx-auto text-center">
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-8 animate-fade-in">
        <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-500" />
      </div>
      <h2 className="animate-fade-in-up text-3xl sm:text-4xl md:text-5xl font-semibold text-foreground tracking-tight mb-6">
        {t('presentation.trialTitle')}
      </h2>
      <div className="space-y-3 mb-10">
        {[t('presentation.trialPoint1'), t('presentation.trialPoint2'), t('presentation.trialPoint3')].map((text, i) => (
          <div key={i} className="flex items-center justify-center gap-3 animate-fade-in-up" style={{ animationDelay: `${0.2 + i * 0.1}s` }}>
            <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Check className="w-4 h-4 text-emerald-500" />
            </div>
            <p className={`text-base sm:text-lg ${i === 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{text}</p>
          </div>
        ))}
      </div>
      <div className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
        <Link to="/auth">
          <Button size="xl" className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/25 px-12">
            {t('presentation.trialCTA')}
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

function SlideContact() {
  const { t } = useTranslation();
  return (
    <div className="max-w-lg mx-auto text-center">
      <Logo size="xl" />
      <p className="text-lg text-muted-foreground mt-6 mb-8">
        {t('presentation.contactJoin')}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
        <Link to="/auth">
          <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white w-full sm:w-auto">
            {t('presentation.contactStartFree')}
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </Link>
        <Link to="/">
          <Button size="lg" variant="outline" className="w-full sm:w-auto">
            {t('presentation.contactViewSite')}
          </Button>
        </Link>
      </div>
      <p className="text-sm text-muted-foreground">contact@cleaningpage.com</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN PRESENTATION COMPONENT
   ═══════════════════════════════════════════════ */

export default function Presentation() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const touchStartX = useRef(0);
  const { t } = useTranslation();

  const goTo = useCallback((index: number) => {
    setCurrentSlide(Math.max(0, Math.min(TOTAL_SLIDES - 1, index)));
  }, []);

  const next = useCallback(() => goTo(currentSlide + 1), [currentSlide, goTo]);
  const prev = useCallback(() => goTo(currentSlide - 1), [currentSlide, goTo]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [next, prev]);

  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { diff > 0 ? next() : prev(); }
  };

  const slides = [
    <SlideCover />,
    <SlideNeeds />,
    <SlideSolution />,
    <SlideCustomize />,
    <SlideModes />,
    <SlideReservations />,
    <SlideCalendar />,
    <SlideClients />,
    <SlideFicheClient />,
    <SlideInvoices />,
    <SlideStats />,
    <SlideBenefits />,
    <SlideTrial />,
  ];

  return (
    <div 
      className="h-screen w-screen bg-background flex flex-col overflow-hidden select-none"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <header className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border/30 bg-background z-50">
        <Link to="/" className="flex items-center">
          <Logo size="lg" />
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground hidden sm:block">
            {currentSlide + 1} / {TOTAL_SLIDES}
          </span>
          <LanguageSwitcher />
          <Link to="/auth">
            <Button size="sm" className="text-xs px-4">
              {t('presentation.headerStart')}
            </Button>
          </Link>
        </div>
      </header>

      <div className="flex-1 relative">
        {slides.map((slide, i) => (
          <SlideWrapper key={i} active={currentSlide === i}>
            {slide}
          </SlideWrapper>
        ))}

        {currentSlide > 0 && (
          <button
            onClick={prev}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-40 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-card border border-border/60 shadow-lg flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
        )}
        {currentSlide < TOTAL_SLIDES - 1 && (
          <button
            onClick={next}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-40 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-card border border-border/60 shadow-lg flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>
        )}
      </div>

      <div className="flex-shrink-0 flex items-center justify-center gap-1.5 py-3 bg-background border-t border-border/30">
        {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-300 ${
              i === currentSlide 
                ? 'w-6 h-2 bg-foreground' 
                : 'w-2 h-2 bg-border hover:bg-muted-foreground/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
