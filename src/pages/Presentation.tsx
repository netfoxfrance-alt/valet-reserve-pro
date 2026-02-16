import { useState, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, Check, Calendar, Users, BarChart3, 
  Clock, Sparkles, Globe, Palette, Shield, Phone,
  MousePointer2, FileText, Receipt, Plus,
  Instagram, Facebook, Mail, Droplets, MapPin,
  CalendarDays, Star, Settings, Link2, ExternalLink,
  ChevronLeft, ChevronRight, Eye, Type
} from 'lucide-react';
import mockupBanner from '@/assets/mockup-banner-v2.jpg';
import mockupCarCleaning from '@/assets/mockup-car-cleaning.jpg';
import mockupLogoClean from '@/assets/mockup-logo-cleaning.png';
import gocleanLogo from '@/assets/gocleaning-logo.png';
import sofaBanner from '@/assets/sofa-cleaning-banner.jpg';

const TOTAL_SLIDES = 9;

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
      <div className="mb-6 animate-fade-in">
        <Logo size="xl" />
      </div>
      <h1 className="animate-fade-in-up stagger-1 text-3xl sm:text-5xl lg:text-6xl font-semibold text-foreground tracking-tight mb-6 leading-[1.1]">
        La plateforme complète pour les professionnels du nettoyage
      </h1>
      <p className="animate-fade-in-up stagger-2 text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto mb-10">
        Vitrine, réservation et gestion centralisée. Tout dans un seul outil.
      </p>
      <div className="animate-fade-in-up stagger-3 flex items-center gap-6 justify-center text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-500" />
          <span>30 jours offerts</span>
        </div>
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-500" />
          <span>Sans engagement</span>
        </div>
      </div>
    </div>
  );
}

function SlideNeeds() {
  return (
    <div className="max-w-3xl mx-auto w-full">
      <div className="text-center mb-10 sm:mb-14">
        <h2 className="animate-fade-in-up text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground tracking-tight mb-4">
          Aujourd'hui, une entreprise de nettoyage a besoin de&nbsp;:
        </h2>
        <p className="animate-fade-in-up stagger-1 text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">
          Il faut un site complet et beaucoup d'outils éparpillés pour tout gérer.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4 sm:gap-5 max-w-2xl mx-auto">
        {[
          { icon: Globe, label: 'Présenter son entreprise et ses prestations' },
          { icon: Calendar, label: 'Un système de réservation en ligne' },
          { icon: Clock, label: 'Un agenda pour organiser son planning' },
          { icon: Users, label: 'Un suivi de ses clients et de son activité' },
          { icon: Receipt, label: 'Un outil pour les factures et devis' },
        ].map((n, i) => (
          <div key={i} className="flex items-center gap-4 bg-card border border-border/60 rounded-2xl p-4 sm:p-5 animate-fade-in-up" style={{ animationDelay: `${0.15 + i * 0.1}s` }}>
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
              <n.icon className="w-5 h-5 text-foreground" />
            </div>
            <p className="text-sm sm:text-base font-medium text-foreground">{n.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SlideSolution() {
  return (
    <div className="max-w-4xl mx-auto w-full text-center">
      <h2 className="animate-fade-in-up text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground tracking-tight mb-4">
        CleaningPage combine tout ce dont vous avez besoin
      </h2>
      <p className="animate-fade-in-up stagger-1 text-muted-foreground text-sm sm:text-base max-w-lg mx-auto mb-12 sm:mb-16">
        Un seul outil. Pas dix.
      </p>
      <div className="grid sm:grid-cols-3 gap-5 sm:gap-6">
        {[
          { icon: Globe, label: 'Une page web', desc: 'Faite pour convertir vos visiteurs en clients' },
          { icon: Calendar, label: 'Un système de rendez-vous', desc: 'Réservation en ligne + gestion du planning' },
          { icon: BarChart3, label: 'Un espace de gestion', desc: 'Clients, statistiques, factures, devis' },
        ].map((p, i) => (
          <div key={i} className="bg-card border border-border/60 rounded-2xl p-6 sm:p-8 text-center animate-fade-in-up" style={{ animationDelay: `${0.2 + i * 0.15}s` }}>
            <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-5">
              <p.icon className="w-7 h-7 text-foreground" />
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
          {/* Central Phone Mockup - scaled for slide */}
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
      <div className="text-center mb-6 sm:mb-10">
        <h2 className="animate-fade-in-up text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground tracking-tight mb-3">
          Adapté à tout type d'entreprise de nettoyage
        </h2>
      </div>
      <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
        {/* Left: Fixed services */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
            Vous avez des prestations fixes ?
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-5">
            Mettez-les directement sur votre page et vos clients peuvent réserver facilement.
          </p>
          {/* Mockup: service card like image 2 */}
          <div className="rounded-2xl overflow-hidden shadow-xl ring-1 ring-border/20">
            <div className="relative">
              <div className="grid grid-cols-2 h-44 sm:h-52">
                <div className="relative overflow-hidden">
                  <img src={mockupCarCleaning} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="relative overflow-hidden">
                  <img src={sofaBanner} alt="" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 sm:p-5">
                <p className="text-white font-bold text-base sm:text-lg tracking-wide">LAVAGE COMPLET</p>
                <p className="text-white/90 text-sm sm:text-base font-medium">dès 65€</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Custom quotes */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
            Vous faites des prestations sur devis personnalisé ?
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-5">
            Créez une prestation sur mesure pour un client. Une fois faite, il pourra s'identifier sur votre page pour réserver sa propre prestation.
          </p>
          {/* Mockup: client greeting like image 3 */}
          <div className="bg-card rounded-2xl shadow-xl ring-1 ring-border/20 p-5 sm:p-6">
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

function SlideBenefits() {
  return (
    <div className="max-w-3xl mx-auto w-full">
      <div className="text-center mb-10 sm:mb-14">
        <h2 className="animate-fade-in-up text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground tracking-tight mb-4">
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
          <div key={i} className="flex items-center gap-4 sm:gap-5 bg-card border border-border/60 rounded-2xl p-4 sm:p-5 animate-fade-in-up" style={{ animationDelay: `${0.1 + i * 0.08}s` }}>
            <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
              <Check className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm sm:text-base font-medium text-foreground">{b.label}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">{b.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SlideDashboard() {
  const [dashboardTab, setDashboardTab] = useState<'reservations' | 'calendar' | 'clients' | 'invoices' | 'stats'>('reservations');

  return (
    <div className="max-w-6xl mx-auto w-full">
      <div className="text-center mb-6 sm:mb-10">
        <h2 className="animate-fade-in-up text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground tracking-tight mb-4">
          Tout ce qu'il vous faut pour gérer votre activité
        </h2>
        <p className="animate-fade-in-up stagger-1 text-muted-foreground text-sm sm:text-base max-w-lg mx-auto mb-2">
          Réservations, planning, clients, factures, statistiques — tout au même endroit.
        </p>
        <p className="animate-fade-in-up stagger-2 text-sm text-muted-foreground flex items-center justify-center gap-2">
          <MousePointer2 className="w-4 h-4" />
          Cliquez sur un onglet pour explorer
        </p>
      </div>

      {/* Tabs */}
      <div className="animate-fade-in-up stagger-3 flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8 justify-center">
        {[
          { icon: Calendar, label: 'Réservations', tab: 'reservations' as const, badge: '3' },
          { icon: CalendarDays, label: 'Calendrier', tab: 'calendar' as const, badge: null },
          { icon: Users, label: 'Clients', tab: 'clients' as const, badge: null },
          { icon: Star, label: 'Factures', tab: 'invoices' as const, badge: null },
          { icon: BarChart3, label: 'Statistiques', tab: 'stats' as const, badge: null },
        ].map((item) => (
          <button 
            key={item.label}
            onClick={(e) => { e.stopPropagation(); setDashboardTab(item.tab); }}
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
      <div className="animate-fade-in-up stagger-4">
        <div className="bg-card rounded-2xl shadow-2xl overflow-hidden border border-border/60 max-w-5xl mx-auto">
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

          <div className="p-5 sm:p-6" style={{ background: 'linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--secondary)/0.3) 100%)' }}>
            {dashboardTab === 'reservations' && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground tracking-tight">Réservations</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Mercredi 11 février 2026</p>
                  </div>
                  <button className="bg-blue-500 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-lg shadow-blue-500/25">+ Nouveau</button>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { label: "Aujourd'hui", value: '5', extra: '2 en attente' },
                    { label: 'Cette semaine', value: '23', extra: 'dont 4 demandes' },
                    { label: 'CA du jour', value: '340€', extra: '↑ 15%' },
                  ].map((kpi, i) => (
                    <div key={i} className="rounded-2xl p-4 bg-card border border-border/30 shadow-sm">
                      <p className="text-[11px] text-muted-foreground mb-1">{kpi.label}</p>
                      <p className="text-3xl font-bold tracking-tight leading-none text-foreground">{kpi.value}</p>
                      <p className={`text-[10px] mt-2 ${i === 2 ? 'text-emerald-600 font-semibold' : 'text-muted-foreground'}`}>{kpi.extra}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {[
                    { name: 'Jean Martin', service: 'Nettoyage Complet', time: '10:00 · 1h30', price: '89€', status: 'Confirmé', statusBg: 'bg-emerald-500', initials: 'JM', avatarBg: 'bg-blue-500' },
                    { name: 'Marie Dupont', service: 'Express', time: '11:30 · 45min', price: '35€', status: 'En attente', statusBg: 'bg-orange-500', initials: 'MD', avatarBg: 'bg-pink-500' },
                    { name: 'Pierre Bernard', service: 'Rénovation Premium', time: '14:00 · 3h', price: '159€', status: 'Confirmé', statusBg: 'bg-emerald-500', initials: 'PB', avatarBg: 'bg-amber-500' },
                  ].map((b, i) => (
                    <div key={i} className="flex items-center gap-3.5 bg-card rounded-2xl p-3.5 border border-border/20 hover:shadow-md transition-all cursor-pointer">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0 ${b.avatarBg}`}>{b.initials}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-foreground truncate">{b.name}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{b.service} · {b.time}</p>
                      </div>
                      <span className="text-[13px] font-bold text-foreground hidden sm:block tabular-nums">{b.price}</span>
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold text-white ${b.statusBg}`}>{b.status}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {dashboardTab === 'calendar' && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <button className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center"><ChevronLeft className="w-4 h-4" /></button>
                    <h3 className="text-base font-semibold text-foreground min-w-[130px] text-center">Février 2026</h3>
                    <button className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center"><ChevronRight className="w-4 h-4" /></button>
                  </div>
                  <button className="text-[11px] text-white font-semibold bg-blue-500 px-3.5 py-1.5 rounded-full shadow-sm">Aujourd'hui</button>
                </div>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                    <div key={i} className="text-center text-[11px] font-semibold text-muted-foreground py-1">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 28 }, (_, i) => i + 1).map(d => {
                    const hasAppt = [3, 5, 8, 11, 15, 22, 25].includes(d);
                    const isSelected = d === 11;
                    return (
                      <div key={d} className={`aspect-square rounded-2xl flex flex-col items-center justify-start pt-2 text-[11px] relative cursor-pointer transition-all ${isSelected ? 'bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/30' : 'hover:bg-secondary/50'}`}>
                        <span>{d}</span>
                        {hasAppt && <div className="flex gap-0.5 mt-1"><div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white/70' : 'bg-emerald-500'}`} /></div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {dashboardTab === 'clients' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-foreground">Clients</h3>
                  <button className="bg-blue-500 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-lg shadow-blue-500/25">+ Nouveau client</button>
                </div>
                <div className="space-y-2">
                  {[
                    { name: 'Jean Martin', email: 'jean@email.com', bookings: 12, revenue: '1 068€', initials: 'JM', bg: 'bg-blue-500' },
                    { name: 'Marie Dupont', email: 'marie@email.com', bookings: 8, revenue: '712€', initials: 'MD', bg: 'bg-pink-500' },
                    { name: 'Pierre Bernard', email: 'pierre@email.com', bookings: 5, revenue: '445€', initials: 'PB', bg: 'bg-amber-500' },
                  ].map((c, i) => (
                    <div key={i} className="flex items-center gap-3.5 bg-card rounded-2xl p-3.5 border border-border/20 cursor-pointer hover:shadow-md transition-all">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[11px] font-bold text-white ${c.bg}`}>{c.initials}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-foreground">{c.name}</p>
                        <p className="text-[11px] text-muted-foreground">{c.email}</p>
                      </div>
                      <div className="text-right hidden sm:block">
                        <p className="text-[13px] font-bold text-foreground">{c.revenue}</p>
                        <p className="text-[10px] text-muted-foreground">{c.bookings} réservations</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {dashboardTab === 'invoices' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-foreground">Factures & Devis</h3>
                  <button className="bg-blue-500 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-lg shadow-blue-500/25">+ Nouvelle facture</button>
                </div>
                <div className="space-y-2">
                  {[
                    { number: 'F-2026-001', client: 'Jean Martin', amount: '89€', date: '11 fév 2026', status: 'Payée', statusBg: 'bg-emerald-500' },
                    { number: 'F-2026-002', client: 'Marie Dupont', amount: '35€', date: '10 fév 2026', status: 'En attente', statusBg: 'bg-orange-500' },
                    { number: 'D-2026-001', client: 'Pierre Bernard', amount: '159€', date: '9 fév 2026', status: 'Devis', statusBg: 'bg-blue-500' },
                  ].map((inv, i) => (
                    <div key={i} className="flex items-center gap-3.5 bg-card rounded-2xl p-3.5 border border-border/20 cursor-pointer hover:shadow-md transition-all">
                      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                        <Receipt className="w-5 h-5 text-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-foreground">{inv.number}</p>
                        <p className="text-[11px] text-muted-foreground">{inv.client} · {inv.date}</p>
                      </div>
                      <span className="text-[13px] font-bold text-foreground hidden sm:block">{inv.amount}</span>
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold text-white ${inv.statusBg}`}>{inv.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {dashboardTab === 'stats' && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-6">Statistiques</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  {[
                    { label: 'Réservations', value: '47', change: '+12%' },
                    { label: 'Revenu', value: '4 280€', change: '+8%' },
                    { label: 'Clients', value: '32', change: '+5' },
                    { label: 'Taux conversion', value: '68%', change: '+3%' },
                  ].map((s, i) => (
                    <div key={i} className="rounded-2xl p-4 bg-card border border-border/30 shadow-sm">
                      <p className="text-[11px] text-muted-foreground mb-1">{s.label}</p>
                      <p className="text-2xl font-bold tracking-tight leading-none text-foreground">{s.value}</p>
                      <p className="text-[10px] text-emerald-600 font-semibold mt-2">{s.change}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl p-5 bg-card border border-border/30 shadow-sm">
                  <p className="text-sm font-semibold text-foreground mb-4">Revenu mensuel</p>
                  <div className="flex items-end gap-2 h-32">
                    {[40, 55, 45, 70, 60, 85, 75, 90, 80, 95, 88, 100].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full bg-primary/15 rounded-lg" style={{ height: `${h}%` }}>
                          <div className="w-full bg-primary rounded-lg transition-all" style={{ height: `${h}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-[9px] text-muted-foreground">Jan</span>
                    <span className="text-[9px] text-muted-foreground">Déc</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
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

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [next, prev]);

  // Touch swipe
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
    <SlideBenefits />,
    <SlideDashboard />,
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

        {/* Navigation arrows */}
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
      <div className="flex-shrink-0 flex items-center justify-center gap-2 py-3 bg-background border-t border-border/30">
        {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-300 ${
              i === currentSlide 
                ? 'w-8 h-2.5 bg-foreground' 
                : 'w-2.5 h-2.5 bg-border hover:bg-muted-foreground/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
