import { useState, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/button';
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
  return (
    <div className="max-w-3xl mx-auto text-center">
      <div className="mb-8 animate-fade-in">
        <Logo size="xl" />
      </div>
      <h1 className="animate-fade-in-up stagger-1 text-3xl sm:text-5xl lg:text-6xl font-semibold text-foreground tracking-tight mb-6 leading-[1.1]">
        La plateforme complète pour les professionnels du nettoyage
      </h1>
      <p className="animate-fade-in-up stagger-2 text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto mb-10">
        Vitrine, réservation et gestion centralisée. Tout dans un seul outil.
      </p>
      <div className="animate-fade-in-up stagger-3">
        <div className="inline-flex items-center gap-8 bg-secondary/40 rounded-full px-8 py-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center">
              <Check className="w-3 h-3 text-emerald-500" />
            </div>
            <span className="text-sm font-medium text-foreground">30 jours offerts</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center">
              <Check className="w-3 h-3 text-emerald-500" />
            </div>
            <span className="text-sm font-medium text-foreground">Sans engagement</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SlideNeeds() {
  const needs = [
    { icon: Globe, label: 'Présenter son entreprise et ses prestations' },
    { icon: Calendar, label: 'Un système de réservation en ligne' },
    { icon: Clock, label: 'Un agenda pour organiser son planning' },
    { icon: Users, label: 'Un suivi de ses clients et de son activité' },
    { icon: Receipt, label: 'Un outil pour les factures et devis' },
  ];

  return (
    <div className="max-w-3xl mx-auto w-full">
      <div className="text-center mb-10 sm:mb-12">
        <p className="animate-fade-in-up text-sm font-semibold text-primary tracking-widest uppercase mb-4">Le constat</p>
        <h2 className="animate-fade-in-up stagger-1 text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground tracking-tight">
          Aujourd'hui, une entreprise de nettoyage a besoin de :
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
        Il faut un site, beaucoup d'outils éparpillés... et du temps pour tout gérer.
      </p>
    </div>
  );
}

function SlideSolution() {
  const pillars = [
    { icon: Globe, label: 'Une page web', desc: 'Faite pour convertir vos visiteurs en clients', color: 'bg-blue-500/10', iconColor: 'text-blue-600' },
    { icon: Calendar, label: 'Un système de rendez-vous', desc: 'Réservation en ligne + gestion du planning', color: 'bg-emerald-500/10', iconColor: 'text-emerald-600' },
    { icon: BarChart3, label: 'Un espace de gestion', desc: 'Clients, statistiques, factures, devis', color: 'bg-violet-500/10', iconColor: 'text-violet-600' },
  ];

  return (
    <div className="max-w-4xl mx-auto w-full text-center">
      <p className="animate-fade-in-up text-sm font-semibold text-primary tracking-widest uppercase mb-4">La solution</p>
      <h2 className="animate-fade-in-up stagger-1 text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground tracking-tight mb-3">
        CleaningPage combine tout ce dont vous avez besoin
      </h2>
      <p className="animate-fade-in-up stagger-2 text-muted-foreground text-sm sm:text-base max-w-md mx-auto mb-12 sm:mb-14">
        Un seul outil. Pas dix.
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
  return (
    <div className="max-w-5xl mx-auto w-full">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="animate-fade-in-up text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground tracking-tight mb-3">
          Personnalisez votre page sans aucune compétence technique
        </h2>
        <p className="animate-fade-in-up stagger-1 text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">
          Ajoutez votre logo, vos couleurs, vos prestations. Modifiez tout, à tout moment.
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
                <p className="text-[10px] text-muted-foreground mb-2">Nettoyage premium à domicile, 7j/7.</p>
                <div className="flex justify-center mb-3">
                  <span className="inline-flex items-center gap-1.5 text-[9px] bg-white border border-emerald-200 text-emerald-600 px-3 py-1 rounded-full font-medium">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    Ouvert
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
                  <h4 className="text-xs font-semibold text-foreground mb-2">Nos formules</h4>
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
                  Réserver maintenant
                </button>
              </div>
            </div>
          </div>

          {/* Floating widgets - desktop only */}
          <div className="hidden sm:block">
            <div className="absolute top-8 left-4 lg:left-16 z-30 animate-float" style={{ animationDelay: '0s' }}>
              <div className="bg-card rounded-xl p-3 shadow-xl ring-1 ring-border/30 relative">
                <p className="text-[9px] text-muted-foreground mb-1.5 font-medium">Couleurs</p>
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
                <p className="text-[9px] text-muted-foreground mb-1.5 font-medium">Disponibilités</p>
                <div className="space-y-1">
                  {[
                    { day: 'Lun', hours: '9h-18h', active: true },
                    { day: 'Mar', hours: '9h-18h', active: true },
                    { day: 'Mer', hours: '14h-18h', active: true },
                    { day: 'Sam', hours: 'Fermé', active: false },
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
                <p className="text-[9px] text-muted-foreground mb-1.5 font-medium">Formules</p>
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
                    + Ajouter
                  </button>
                </div>
              </div>
            </div>

            <div className="absolute bottom-8 right-4 lg:right-12 z-30 animate-float" style={{ animationDelay: '0.4s' }}>
              <div className="bg-card rounded-xl p-2.5 shadow-xl ring-1 ring-border/30">
                <p className="text-[8px] text-muted-foreground mb-1 font-medium">Galerie</p>
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
  return (
    <div className="max-w-5xl mx-auto w-full">
      <div className="text-center mb-8 sm:mb-10">
        <h2 className="animate-fade-in-up text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground tracking-tight">
          Adapté à tout type d'entreprise de nettoyage
        </h2>
      </div>
      <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
        {/* Left: Fixed services */}
        <div className="animate-fade-in-up bg-card rounded-3xl p-5 sm:p-6 border border-border/40 shadow-sm" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
            Vous avez des prestations fixes ?
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-5">
            Mettez-les directement sur votre page et vos clients peuvent réserver facilement.
          </p>
          {/* Two separate service examples */}
          <div className="space-y-3">
            <div className="rounded-2xl overflow-hidden shadow-md ring-1 ring-border/10 relative">
              <img src={presCarDetailing} alt="Detailing auto" className="w-full h-28 sm:h-32 object-cover" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                <div className="flex items-end justify-between">
                  <p className="text-xs font-semibold text-white">LAVAGE COMPLET</p>
                  <p className="text-sm font-bold text-white">dès 65€</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-md ring-1 ring-border/10 relative">
              <img src={sofaBanner} alt="Nettoyage canapé" className="w-full h-28 sm:h-32 object-cover" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                <div className="flex items-end justify-between">
                  <p className="text-xs font-semibold text-white">NETTOYAGE CANAPÉ</p>
                  <p className="text-sm font-bold text-white">80€</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Custom quotes */}
        <div className="animate-fade-in-up bg-card rounded-3xl p-5 sm:p-6 border border-border/40 shadow-sm" style={{ animationDelay: '0.4s' }}>
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
            Vous faites des prestations sur devis personnalisé ?
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-5">
            Créez une prestation sur mesure pour un client. Une fois faite, il pourra s'identifier sur votre page pour réserver sa propre prestation.
          </p>
          {/* Mockup: client greeting */}
          <div className="bg-secondary/30 rounded-2xl p-5">
            <p className="text-base sm:text-lg font-bold text-foreground mb-1">Bonjour Sophie ! 👋</p>
            <p className="text-sm text-muted-foreground mb-4">Votre prestation personnalisée :</p>
            <div className="bg-card rounded-xl p-4 flex items-center justify-between mb-4 border border-border/30 shadow-sm">
              <div>
                <p className="text-sm font-semibold text-foreground">Nettoyage complet maison</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3" /> 90 min
                </p>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-foreground">75€</p>
            </div>
            <button className="w-full bg-neutral-800 text-white py-3 rounded-xl text-sm font-semibold mb-2">
              Choisir un créneau
            </button>
            <p className="text-xs text-muted-foreground text-center underline">Ce n'est pas moi</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   DASHBOARD JSX MOCKUP SLIDES
   ═══════════════════════════════════════════════ */

/* Shared mini sidebar for dashboard mockups */
function MockSidebar({ active }: { active: string }) {
  const items = [
    { label: 'Réservations', icon: Calendar, badge: '3' },
    { label: 'Calendrier', icon: Calendar },
    { label: 'Demandes', icon: Mail, badge: '2' },
    { label: 'Clients', icon: Users },
    { label: 'Factures & Devis', icon: FileText },
    { label: 'Statistiques', icon: BarChart3 },
  ];
  return (
    <div className="w-44 flex-shrink-0 bg-card border-r border-border/30 py-4 px-3 flex-col hidden lg:flex">
      <p className="text-xs font-bold text-foreground mb-0.5 px-1">CleaningPage</p>
      <p className="text-[9px] text-muted-foreground mb-4 px-1">clean-auto-pro</p>
      <div className="space-y-0.5">
        {items.map((item) => (
          <div key={item.label} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] ${active === item.label ? 'bg-foreground text-background font-semibold' : 'text-muted-foreground hover:bg-secondary/50'}`}>
            <item.icon className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="flex-1 truncate">{item.label}</span>
            {item.badge && <span className={`text-[9px] w-4 h-4 rounded-full flex items-center justify-center ${active === item.label ? 'bg-background text-foreground' : 'bg-foreground text-background'} font-bold`}>{item.badge}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function MockDashboardShell({ active, children, title, subtitle }: { active: string; children: React.ReactNode; title: string; subtitle: string }) {
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
          {/* Browser chrome */}
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
          {/* Content with sidebar */}
          <div className="flex min-h-[340px] sm:min-h-[380px]">
            <MockSidebar active={active} />
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
  const appointments = [
    { initials: 'JM', color: 'bg-blue-500', name: 'Jean Martin', service: 'Nettoyage Complet · 10:00 · 1h30', price: '89€', status: 'Confirmé', statusColor: 'bg-emerald-500' },
    { initials: 'MD', color: 'bg-pink-400', name: 'Marie Dupont', service: 'Express · 11:30 · 45min', price: '35€', status: 'En attente', statusColor: 'bg-amber-500' },
    { initials: 'PB', color: 'bg-orange-500', name: 'Pierre Bernard', service: 'Rénovation Premium · 14:00 · 3h', price: '159€', status: 'Confirmé', statusColor: 'bg-emerald-500' },
    { initials: '?', color: 'bg-blue-400', name: 'Demande entrante', service: 'Nettoyage canapé · — · —', price: 'Sur devis', status: 'Demande', statusColor: 'bg-blue-500' },
    { initials: 'SL', color: 'bg-violet-500', name: 'Sophie Leroy', service: 'Pack Intérieur · 16:30 · 1h', price: '65€', status: 'Confirmé', statusColor: 'bg-emerald-500' },
  ];

  return (
    <MockDashboardShell active="Réservations" title="Gérez vos réservations" subtitle="Vos réservations s'ajoutent automatiquement. Suivez tout en un coup d'œil.">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm sm:text-base font-semibold text-foreground">Réservations</p>
          <p className="text-[10px] text-muted-foreground">Mercredi 11 février 2026</p>
        </div>
        <button className="bg-primary text-primary-foreground text-[10px] font-semibold px-3 py-1.5 rounded-lg">+ Nouveau RDV</button>
      </div>
      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-card border border-border/40 rounded-xl p-2.5">
          <p className="text-[9px] text-muted-foreground">Aujourd'hui</p>
          <p className="text-lg font-bold text-foreground">5</p>
          <p className="text-[8px] text-emerald-500 flex items-center gap-0.5"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> 2 en attente</p>
        </div>
        <div className="bg-card border border-border/40 rounded-xl p-2.5">
          <p className="text-[9px] text-muted-foreground">Cette semaine</p>
          <p className="text-lg font-bold text-foreground">23</p>
          <p className="text-[8px] text-muted-foreground">dont 4 demandes</p>
        </div>
        <div className="bg-card border border-border/40 rounded-xl p-2.5">
          <p className="text-[9px] text-muted-foreground">CA du jour</p>
          <p className="text-lg font-bold text-foreground">340€</p>
          <p className="text-[8px] text-emerald-500">↑ 15%</p>
        </div>
      </div>
      {/* Tabs */}
      <div className="flex gap-3 mb-2 border-b border-border/30 pb-1.5">
        {['Prochains', 'Demandes', 'Passés'].map((t, i) => (
          <span key={t} className={`text-[10px] pb-1 ${i === 0 ? 'text-foreground font-semibold border-b-2 border-foreground' : 'text-muted-foreground'}`}>{t}</span>
        ))}
      </div>
      {/* List */}
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
  const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
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
    <MockDashboardShell active="Calendrier" title="Votre planning, connecté à Google Agenda" subtitle="Vos rendez-vous s'ajoutent dans votre planning, synchronisable avec Google Agenda si vous le souhaitez.">
      {/* Google Agenda banner */}
      <div className="flex items-center gap-2 bg-secondary/40 rounded-xl p-2.5 mb-3">
        <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm">
          <span className="text-[10px] font-bold">G</span>
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-semibold text-foreground">Connecter à Google Agenda</p>
          <p className="text-[8px] text-muted-foreground">Synchronisez vos rendez-vous automatiquement</p>
        </div>
        <span className="text-primary text-[9px] font-semibold">Connecter</span>
      </div>
      <div className="flex gap-3">
        {/* Calendar grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-muted-foreground">‹</span>
            <span className="text-xs font-semibold text-foreground">Février 2026</span>
            <span className="text-[10px] text-muted-foreground">›</span>
          </div>
          <div className="grid grid-cols-7 gap-0">
            {days.map((d, i) => (
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
          {/* Legend */}
          <div className="flex items-center gap-3 mt-2">
            {[{ c: 'bg-emerald-500', l: 'Confirmé' }, { c: 'bg-amber-500', l: 'En attente' }, { c: 'bg-blue-500', l: 'Terminé' }].map((item) => (
              <div key={item.l} className="flex items-center gap-1">
                <div className={`w-1.5 h-1.5 rounded-full ${item.c}`} />
                <span className="text-[8px] text-muted-foreground">{item.l}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Day detail sidebar */}
        <div className="w-32 flex-shrink-0 hidden sm:block">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center text-white text-[9px] font-bold">11</span>
            <div>
              <p className="text-[10px] font-semibold text-foreground">Mercredi</p>
              <p className="text-[8px] text-muted-foreground">3 rendez-vous · 340€</p>
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
  const clients = [
    { initials: 'SL', color: 'bg-violet-500', name: 'Sophie Leroy', visits: '15 visites · Dernier : Aujourd\'hui', ca: '1 420€' },
    { initials: 'JM', color: 'bg-blue-500', name: 'Jean Martin', visits: '12 visites · Dernier : 10 fév', ca: '1 068€' },
    { initials: 'MD', color: 'bg-pink-400', name: 'Marie Dupont', visits: '8 visites · Dernier : 8 fév', ca: '520€' },
    { initials: 'PB', color: 'bg-orange-500', name: 'Pierre Bernard', visits: '3 visites · Dernier : 2 fév', ca: '477€' },
  ];

  return (
    <MockDashboardShell active="Clients" title="Suivez vos clients en détail" subtitle="Chaque client a sa fiche complète : historique, chiffre d'affaires, factures et prestations.">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Clients</p>
          <p className="text-[10px] text-muted-foreground">142 clients enregistrés</p>
        </div>
        <button className="bg-primary text-primary-foreground text-[10px] font-semibold px-3 py-1.5 rounded-lg">+ Ajouter</button>
      </div>
      {/* KPI */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-card border border-border/40 rounded-xl p-2.5 text-center">
          <p className="text-lg font-bold text-foreground">142</p>
          <p className="text-[9px] text-muted-foreground">Clients</p>
        </div>
        <div className="bg-card border border-border/40 rounded-xl p-2.5 text-center">
          <p className="text-lg font-bold text-foreground">8 640€</p>
          <p className="text-[9px] text-muted-foreground">CA total</p>
        </div>
        <div className="bg-card border border-border/40 rounded-xl p-2.5 text-center">
          <p className="text-lg font-bold text-foreground">61€</p>
          <p className="text-[9px] text-muted-foreground">Panier moy.</p>
        </div>
      </div>
      {/* Search */}
      <div className="flex items-center gap-2 bg-secondary/30 rounded-lg px-2.5 py-1.5 mb-2">
        <Search className="w-3 h-3 text-muted-foreground" />
        <span className="text-[10px] text-muted-foreground">Rechercher un client...</span>
      </div>
      <p className="text-[9px] text-muted-foreground text-center mb-2">Cliquez sur un client pour voir sa fiche complète</p>
      {/* List */}
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
              <p className="text-[8px] text-muted-foreground">CA total</p>
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
  return (
    <MockDashboardShell active="Clients" title="La fiche client détaillée" subtitle="Retrouvez l'historique complet, le chiffre d'affaires, les notes et les prestations de chaque client.">
      {/* Back link */}
      <p className="text-[9px] text-muted-foreground mb-2 flex items-center gap-1"><ChevronLeft className="w-3 h-3" /> Retour aux clients</p>
      {/* Client header */}
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
        <span className="text-[9px] text-muted-foreground border border-border/40 px-2 py-0.5 rounded-full">Via réservation</span>
      </div>
      {/* KPI row */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        {[{ v: '15', l: 'Réservations' }, { v: '1 420€', l: 'CA total' }, { v: '3', l: 'Factures' }, { v: '1', l: 'Devis' }].map((k) => (
          <div key={k.l} className="bg-card border border-border/40 rounded-xl p-2 text-center">
            <p className="text-sm font-bold text-foreground">{k.v}</p>
            <p className="text-[8px] text-muted-foreground">{k.l}</p>
          </div>
        ))}
      </div>
      {/* Default service */}
      <div className="bg-secondary/30 rounded-xl p-3 mb-2">
        <p className="text-[8px] text-muted-foreground mb-1">Prestation par défaut</p>
        <p className="text-[11px] font-semibold text-foreground flex items-center gap-1"><Sparkles className="w-3 h-3" /> Nettoyage Complet · 1h30 · 89€</p>
      </div>
      {/* Notes */}
      <div className="bg-secondary/20 rounded-xl p-3 mb-3">
        <p className="text-[8px] text-muted-foreground mb-1">Notes</p>
        <p className="text-[10px] text-foreground">Cliente fidèle, préfère les créneaux du matin. Véhicule : Tesla Model 3 blanc.</p>
      </div>
      {/* History */}
      <div className="flex gap-3 mb-2">
        {['Prestations', 'Factures & Devis'].map((t, i) => (
          <span key={t} className={`text-[10px] pb-1 ${i === 0 ? 'text-foreground font-semibold border-b-2 border-foreground' : 'text-muted-foreground'}`}>{t}</span>
        ))}
      </div>
      <div className="space-y-0">
        {[
          { name: 'Nettoyage Complet', date: '11 fév 2026 à 10:00', price: '89€', status: 'Confirmé', sc: 'bg-emerald-500' },
          { name: 'Nettoyage Complet', date: '28 jan 2026 à 09:30', price: '89€', status: 'Terminé', sc: 'bg-muted-foreground' },
          { name: 'Lavage Express', date: '15 jan 2026 à 14:00', price: '35€', status: 'Terminé', sc: 'bg-muted-foreground' },
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
  const invoices = [
    { num: 'FAC-2026-012', client: 'Jean Martin · 10 fév', amount: '89,00 €', status: 'Payé', sc: 'bg-emerald-500', bar: 'bg-emerald-500' },
    { num: 'FAC-2026-011', client: 'Marie Dupont · 8 fév', amount: '159,00 €', status: 'Envoyé', sc: 'bg-blue-500', bar: 'bg-blue-500' },
    { num: 'DEV-2026-005', client: 'Pierre Bernard · 5 fév', amount: '320,00 €', status: 'En attente', sc: 'bg-amber-500', bar: 'bg-amber-500' },
    { num: 'FAC-2026-010', client: 'Sophie Leroy · 3 fév', amount: '65,00 €', status: 'Payé', sc: 'bg-emerald-500', bar: 'bg-emerald-500' },
  ];

  return (
    <MockDashboardShell active="Factures & Devis" title="Factures & Devis" subtitle="Créez vos factures et devis en quelques clics. Ils se rattachent automatiquement au client.">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Factures & Devis</p>
          <p className="text-[10px] text-muted-foreground">Gérez vos documents</p>
        </div>
        <div className="flex gap-1.5">
          <button className="bg-card border border-border/50 text-foreground text-[10px] font-semibold px-3 py-1.5 rounded-lg">Devis</button>
          <button className="bg-primary text-primary-foreground text-[10px] font-semibold px-3 py-1.5 rounded-lg">+ Facture</button>
        </div>
      </div>
      {/* KPI */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        {[
          { label: 'Factures', value: '24' },
          { label: 'Devis', value: '8' },
          { label: 'En attente', value: '680€' },
          { label: 'Encaissé', value: '3 240€' },
        ].map((k) => (
          <div key={k.label} className="bg-card border border-border/40 rounded-xl p-2.5">
            <p className="text-[9px] text-muted-foreground">{k.label}</p>
            <p className="text-sm font-bold text-foreground">{k.value}</p>
          </div>
        ))}
      </div>
      {/* Tabs */}
      <div className="flex gap-3 mb-2 border-b border-border/30 pb-1.5">
        {['Tout', 'Factures', 'Devis'].map((t, i) => (
          <span key={t} className={`text-[10px] pb-1 ${i === 0 ? 'text-foreground font-semibold border-b-2 border-foreground' : 'text-muted-foreground'}`}>{t}</span>
        ))}
      </div>
      {/* List */}
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
  return (
    <MockDashboardShell active="Statistiques" title="Statistiques & plus encore" subtitle="Suivez votre activité en temps réel. D'autres fonctionnalités complémentaires sont intégrées à votre espace.">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] text-muted-foreground">‹</span>
        <p className="text-sm font-bold text-foreground">Janvier 2025</p>
        <span className="text-[10px] text-muted-foreground">›</span>
      </div>
      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-card border border-border/40 rounded-xl p-3">
          <p className="text-[9px] text-muted-foreground">Réservations</p>
          <div className="flex items-baseline gap-2">
            <p className="text-xl font-bold text-foreground">24</p>
            <span className="text-[9px] text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full font-semibold">↑12%</span>
          </div>
        </div>
        <div className="bg-card border border-border/40 rounded-xl p-3">
          <p className="text-[9px] text-muted-foreground">CA</p>
          <div className="flex items-baseline gap-2">
            <p className="text-xl font-bold text-foreground">8 450€</p>
            <span className="text-[9px] text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full font-semibold">↑18%</span>
          </div>
        </div>
        <div className="bg-card border border-border/40 rounded-xl p-3">
          <p className="text-[9px] text-muted-foreground">Clients</p>
          <p className="text-xl font-bold text-foreground">18</p>
        </div>
        <div className="bg-card border border-border/40 rounded-xl p-3">
          <p className="text-[9px] text-muted-foreground">Panier moyen</p>
          <p className="text-xl font-bold text-foreground">352€</p>
        </div>
      </div>
      {/* Chart area */}
      <div className="flex gap-3 mb-2">
        {['Évolution', 'Services'].map((t, i) => (
          <span key={t} className={`text-[10px] pb-1 ${i === 0 ? 'text-foreground font-semibold border-b-2 border-foreground' : 'text-muted-foreground'}`}>{t}</span>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {/* Line chart mockup */}
        <div className="bg-card border border-border/40 rounded-xl p-3">
          <p className="text-[9px] font-semibold text-foreground mb-2">Réservations par semaine</p>
          <div className="h-20 flex items-end gap-1">
            {[20, 30, 40, 50, 55, 60, 70].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                <div className="w-full bg-blue-500/20 rounded-t" style={{ height: `${h}%` }}>
                  <div className="w-full bg-blue-500 rounded-t" style={{ height: '2px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Bar chart mockup */}
        <div className="bg-card border border-border/40 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[9px] font-semibold text-foreground">CA par mois</p>
            <span className="text-[8px] text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full font-semibold">+18%</span>
          </div>
          <div className="h-20 flex items-end gap-1.5">
            {[45, 40, 50, 48, 55, 75].map((h, i) => (
              <div key={i} className="flex-1">
                <div className={`w-full rounded-t ${i === 5 ? 'bg-emerald-500' : 'bg-emerald-500/30'}`} style={{ height: `${h}%` }} />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1">
            {['août', 'sept.', 'oct.', 'nov.', 'déc.', 'janv.'].map((m) => (
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
  return (
    <div className="max-w-3xl mx-auto w-full">
      <div className="text-center mb-10 sm:mb-12">
        <p className="animate-fade-in-up text-sm font-semibold text-emerald-600 tracking-widest uppercase mb-4">Les bénéfices</p>
        <h2 className="animate-fade-in-up stagger-1 text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground tracking-tight">
          Ce que vous gagnez
        </h2>
      </div>
      <div className="space-y-3 sm:space-y-4">
        {[
          { label: 'Professionnaliser votre image', desc: 'Une page pro qui inspire confiance à vos clients' },
          { label: 'Centraliser votre activité', desc: 'Fini les outils éparpillés, tout est au même endroit' },
          { label: 'Gagner du temps', desc: 'Moins d\'administratif, plus de terrain' },
          { label: 'Structurer votre organisation', desc: 'Planning, suivi client, statistiques' },
          { label: 'Améliorer le suivi client', desc: 'Historique complet et fidélisation' },
        ].map((b, i) => (
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
  return (
    <div className="max-w-xl mx-auto text-center">
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-8 animate-fade-in">
        <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-500" />
      </div>
      <h2 className="animate-fade-in-up text-3xl sm:text-4xl md:text-5xl font-semibold text-foreground tracking-tight mb-6">
        Essayez gratuitement
      </h2>
      <div className="space-y-3 mb-10">
        {['30 jours offerts', 'Sans engagement', 'Toutes les fonctionnalités incluses'].map((text, i) => (
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
            Commencer l'essai gratuit
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

function SlideContact() {
  return (
    <div className="max-w-lg mx-auto text-center">
      <Logo size="xl" />
      <p className="text-lg text-muted-foreground mt-6 mb-8">
        Rejoignez les professionnels du nettoyage qui utilisent CleaningPage.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
        <Link to="/auth">
          <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white w-full sm:w-auto">
            Commencer gratuitement
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </Link>
        <Link to="/">
          <Button size="lg" variant="outline" className="w-full sm:w-auto">
            Voir le site
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
    <SlideCover />,          // 1
    <SlideNeeds />,          // 2
    <SlideSolution />,       // 3
    <SlideCustomize />,      // 4
    <SlideModes />,          // 5
    <SlideReservations />,   // 6
    <SlideCalendar />,       // 7
    <SlideClients />,        // 8
    <SlideFicheClient />,    // 9
    <SlideInvoices />,       // 10
    <SlideStats />,          // 11
    <SlideBenefits />,       // 12
    <SlideTrial />,          // 13
  ];

  return (
    <div 
      className="h-screen w-screen bg-background flex flex-col overflow-hidden select-none"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Top bar */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border/30 bg-background z-50">
        <Link to="/" className="flex items-center">
          <Logo size="lg" />
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground hidden sm:block">
            {currentSlide + 1} / {TOTAL_SLIDES}
          </span>
          <Link to="/auth">
            <Button size="sm" className="text-xs px-4">
              Commencer
            </Button>
          </Link>
        </div>
      </header>

      {/* Slide area */}
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

      {/* Progress dots */}
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
