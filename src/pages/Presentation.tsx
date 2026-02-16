import { useState, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, Check, Calendar, Users, BarChart3, 
  Clock, Globe, Palette, Phone,
  MousePointer2, Receipt, Plus,
  Instagram, Facebook, Mail,
  ChevronLeft, ChevronRight, Sparkles
} from 'lucide-react';
import mockupCarCleaning from '@/assets/mockup-car-cleaning.jpg';
import mockupLogoClean from '@/assets/mockup-logo-cleaning.png';
import sofaBanner from '@/assets/sofa-cleaning-banner.jpg';
import presCarDetailing from '@/assets/pres-car-detailing.png';
import presDashReservations from '@/assets/pres-dashboard-reservations.png';
import presDashCalendar from '@/assets/pres-dashboard-calendar.png';
import presDashClients from '@/assets/pres-dashboard-clients.png';
import presDashFicheClient from '@/assets/pres-dashboard-fiche-client.png';
import presDashInvoices from '@/assets/pres-dashboard-invoices.png';
import presDashStats from '@/assets/pres-dashboard-stats.png';

const TOTAL_SLIDES = 13;

/* ─── Slide transition wrapper ─── */
function SlideWrapper({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <div
      className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ease-out ${
        active ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
      }`}
    >
      <div className="w-full h-full overflow-y-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-12 flex items-center justify-center">
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
        <div className="animate-fade-in-up bg-secondary/20 rounded-3xl p-5 sm:p-6" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
            Vous avez des prestations fixes ?
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-5">
            Mettez-les directement sur votre page et vos clients peuvent réserver facilement.
          </p>
          {/* Two service cards */}
          <div className="space-y-3">
            <div className="rounded-2xl overflow-hidden shadow-lg ring-1 ring-border/10">
              <img src={presCarDetailing} alt="Lavage complet" className="w-full h-36 sm:h-40 object-cover" />
            </div>
            <div className="bg-card rounded-2xl p-4 shadow-sm border border-border/30 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">Lavage canapé</p>
                <p className="text-xs text-muted-foreground mt-0.5">Nettoyage en profondeur</p>
              </div>
              <p className="text-xl font-bold text-foreground">80€</p>
            </div>
          </div>
        </div>

        {/* Right: Custom quotes */}
        <div className="animate-fade-in-up bg-secondary/20 rounded-3xl p-5 sm:p-6" style={{ animationDelay: '0.4s' }}>
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
            Vous faites des prestations sur devis personnalisé ?
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-5">
            Créez une prestation sur mesure pour un client. Une fois faite, il pourra s'identifier sur votre page pour réserver sa propre prestation.
          </p>
          {/* Mockup: client greeting */}
          <div className="bg-card rounded-2xl shadow-sm ring-1 ring-border/20 p-5">
            <p className="text-base sm:text-lg font-bold text-foreground mb-1">Bonjour Sophie ! 👋</p>
            <p className="text-sm text-muted-foreground mb-4">Votre prestation personnalisée :</p>
            <div className="bg-secondary/40 rounded-xl p-4 flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-foreground">Nettoyage complet maison</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3" /> 90 min
                </p>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-foreground">75€</p>
            </div>
            <button className="w-full bg-neutral-600 text-white py-3 rounded-xl text-sm font-semibold mb-2">
              Choisir un créneau
            </button>
            <p className="text-xs text-muted-foreground text-center underline">Ce n'est pas moi</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Dashboard screenshot slides ─── */

function DashboardScreenshotSlide({ 
  title, subtitle, image, imageAlt 
}: { title: string; subtitle: string; image: string; imageAlt: string }) {
  return (
    <div className="max-w-5xl mx-auto w-full">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="animate-fade-in-up text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground tracking-tight mb-2">
          {title}
        </h2>
        <p className="animate-fade-in-up stagger-1 text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">
          {subtitle}
        </p>
      </div>
      <div className="animate-fade-in-up stagger-2">
        <div className="bg-card rounded-2xl shadow-2xl overflow-hidden border border-border/40 max-w-4xl mx-auto">
          <div className="bg-secondary/50 px-4 py-2.5 flex items-center gap-3 border-b border-border/30">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="text-[11px] text-muted-foreground">cleaningpage.com/ <span className="text-foreground font-medium">dashboard</span></div>
            </div>
          </div>
          <img src={image} alt={imageAlt} className="w-full" />
        </div>
      </div>
    </div>
  );
}

function DashboardDoubleSlide({ 
  title, subtitle, image1, image2, label1, label2 
}: { title: string; subtitle: string; image1: string; image2: string; label1: string; label2: string }) {
  return (
    <div className="max-w-6xl mx-auto w-full">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="animate-fade-in-up text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground tracking-tight mb-2">
          {title}
        </h2>
        <p className="animate-fade-in-up stagger-1 text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">
          {subtitle}
        </p>
      </div>
      <div className="animate-fade-in-up stagger-2 grid sm:grid-cols-2 gap-4 sm:gap-6 max-w-5xl mx-auto">
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">{label1}</p>
          <div className="bg-card rounded-2xl shadow-xl overflow-hidden border border-border/40">
            <img src={image1} alt={label1} className="w-full" />
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">{label2}</p>
          <div className="bg-card rounded-2xl shadow-xl overflow-hidden border border-border/40">
            <img src={image2} alt={label2} className="w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

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
    <SlideCover />,                    // 1
    <SlideNeeds />,                    // 2
    <SlideSolution />,                 // 3
    <SlideCustomize />,                // 4
    <SlideModes />,                    // 5
    // Dashboard slides (6-10)
    <DashboardScreenshotSlide 
      title="Gérez vos réservations" 
      subtitle="Vos réservations s'ajoutent automatiquement. Suivez tout en un coup d'œil."
      image={presDashReservations}
      imageAlt="Réservations"
    />,
    <DashboardScreenshotSlide 
      title="Votre planning, connecté à Google Agenda" 
      subtitle="Vos rendez-vous s'ajoutent dans votre planning, synchronisable avec Google Agenda si vous le souhaitez."
      image={presDashCalendar}
      imageAlt="Calendrier"
    />,
    <DashboardDoubleSlide 
      title="Suivez vos clients en détail" 
      subtitle="Chaque client a sa fiche complète : historique, chiffre d'affaires, factures et prestations."
      image1={presDashClients}
      image2={presDashFicheClient}
      label1="Liste des clients"
      label2="Fiche client détaillée"
    />,
    <DashboardScreenshotSlide 
      title="Factures & Devis" 
      subtitle="Créez vos factures et devis en quelques clics. Ils se rattachent automatiquement au client."
      image={presDashInvoices}
      imageAlt="Factures & Devis"
    />,
    <DashboardScreenshotSlide 
      title="Statistiques & plus encore" 
      subtitle="Suivez votre activité en temps réel. D'autres fonctionnalités complémentaires sont intégrées à votre espace."
      image={presDashStats}
      imageAlt="Statistiques"
    />,
    // Benefits & CTA (11-13)
    <SlideBenefits />,
    <SlideTrial />,
    <SlideContact />,
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
