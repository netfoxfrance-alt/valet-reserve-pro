import { useState, useEffect, useRef } from 'react';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, ArrowLeft, ArrowDown, Check, X, Calendar, Users, BarChart3, 
  Clock, Car, Droplets, Building2, Home, Shirt, Sparkles, Zap, 
  Globe, Palette, Eye, Shield, ChevronRight, Settings, Phone,
  MapPin, Instagram, Mail, Star, Facebook, MessageCircle,
  FileText, UserCheck, Layout, MousePointer2, Plus
} from 'lucide-react';
import mockupBanner from '@/assets/mockup-banner-v2.jpg';
import mockupCarCleaning from '@/assets/mockup-car-cleaning.jpg';
import mockupLogoClean from '@/assets/mockup-logo-cleaning.png';
import gocleanLogo from '@/assets/gocleaning-logo.png';
import sofaBanner from '@/assets/sofa-cleaning-banner.jpg';

const TOTAL_SLIDES = 10;

export default function Presentation() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const containerRef = useRef<HTMLDivElement>(null);

  const goTo = (index: number) => {
    if (index < 0 || index >= TOTAL_SLIDES || index === currentSlide) return;
    setDirection(index > currentSlide ? 'next' : 'prev');
    setCurrentSlide(index);
  };

  const next = () => goTo(currentSlide + 1);
  const prev = () => goTo(currentSlide - 1);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentSlide]);

  // Touch swipe
  const touchStart = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => { touchStart.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { diff > 0 ? next() : prev(); }
  };

  return (
    <div 
      ref={containerRef}
      className="h-screen w-screen overflow-hidden bg-foreground relative select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides */}
      <div className="h-full w-full relative">
        <SlideTransition active={currentSlide === 0} direction={direction}>
          <SlideCover />
        </SlideTransition>
        <SlideTransition active={currentSlide === 1} direction={direction}>
          <SlideProblem />
        </SlideTransition>
        <SlideTransition active={currentSlide === 2} direction={direction}>
          <SlideSolution />
        </SlideTransition>
        <SlideTransition active={currentSlide === 3} direction={direction}>
          <SlideModes />
        </SlideTransition>
        <SlideTransition active={currentSlide === 4} direction={direction}>
          <SlideMetiers />
        </SlideTransition>
        <SlideTransition active={currentSlide === 5} direction={direction}>
          <SlideBenefits />
        </SlideTransition>
        <SlideTransition active={currentSlide === 6} direction={direction}>
          <SlideSimplicity />
        </SlideTransition>
        <SlideTransition active={currentSlide === 7} direction={direction}>
          <SlideFeatures />
        </SlideTransition>
        <SlideTransition active={currentSlide === 8} direction={direction}>
          <SlideTrial />
        </SlideTransition>
        <SlideTransition active={currentSlide === 9} direction={direction}>
          <SlideContact />
        </SlideTransition>
      </div>

      {/* Navigation bar */}
      <div className="absolute bottom-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between px-4 sm:px-8 py-4 bg-gradient-to-t from-black/60 to-transparent">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white/70 hover:text-white hover:bg-white/10 rounded-full"
            onClick={prev}
            disabled={currentSlide === 0}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          {/* Dots */}
          <div className="flex gap-1.5 sm:gap-2">
            {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === currentSlide 
                    ? 'w-8 bg-white' 
                    : 'w-1.5 bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>

          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white/70 hover:text-white hover:bg-white/10 rounded-full"
            onClick={next}
            disabled={currentSlide === TOTAL_SLIDES - 1}
          >
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Slide counter */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-8 z-50">
        <span className="text-white/40 text-xs font-mono">
          {String(currentSlide + 1).padStart(2, '0')} / {TOTAL_SLIDES}
        </span>
      </div>
    </div>
  );
}

/* ──── Transition wrapper ──── */
function SlideTransition({ active, direction, children }: { active: boolean; direction: 'next' | 'prev'; children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { if (active) setMounted(true); }, [active]);
  if (!mounted && !active) return null;

  return (
    <div
      className={`absolute inset-0 transition-all duration-700 ease-out ${
        active 
          ? 'opacity-100 translate-x-0 scale-100' 
          : 'opacity-0 pointer-events-none ' + (direction === 'next' ? '-translate-x-8 scale-[0.98]' : 'translate-x-8 scale-[0.98]')
      }`}
    >
      {children}
    </div>
  );
}

/* ──── Slide layouts ──── */
function SlideLayout({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`h-full w-full flex flex-col items-center justify-center px-6 sm:px-12 lg:px-20 ${className}`}>
      {children}
    </div>
  );
}

/* ──── SLIDE 1: Cover ──── */
function SlideCover() {
  return (
    <div className="h-full w-full bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      
      {/* Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]" />

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        <div className="mb-8 animate-fade-in">
          <Logo size="xl" variant="light" />
        </div>
        
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-semibold text-white tracking-tight mb-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          La plateforme complète pour les professionnels du nettoyage
        </h1>
        
        <p className="text-lg sm:text-xl text-white/50 mb-12 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          Vitrine, réservation et gestion centralisée.
        </p>

        <div className="flex justify-center gap-6 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          {['Pro', 'Minimal', 'Complet'].map((label) => (
            <span key={label} className="text-xs sm:text-sm text-white/30 tracking-[0.2em] uppercase font-medium">{label}</span>
          ))}
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 animate-bounce">
        <ArrowDown className="w-5 h-5 text-white/20" />
      </div>
    </div>
  );
}

/* ──── SLIDE 2: Problem ──── */
function SlideProblem() {
  const problems = [
    { icon: Globe, text: 'Un site vitrine statique qui ne convertit pas' },
    { icon: MessageCircle, text: 'Des demandes dispersées entre WhatsApp, téléphone et email' },
    { icon: Calendar, text: 'Un planning géré manuellement, source d\'erreurs' },
    { icon: Clock, text: 'Du temps perdu dans l\'administratif au lieu du terrain' },
  ];

  return (
    <div className="h-full w-full bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex flex-col items-center justify-center relative overflow-hidden px-6 sm:px-12">
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-red-500/5 rounded-full blur-[100px]" />
      
      <div className="relative z-10 max-w-2xl mx-auto">
        <p className="text-xs sm:text-sm text-red-400/80 uppercase tracking-[0.25em] font-medium mb-4 animate-fade-in">Le constat</p>
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-semibold text-white tracking-tight mb-10 animate-fade-in-up">
          Les entreprises de nettoyage aujourd'hui
        </h2>
        
        <div className="space-y-5">
          {problems.map((p, i) => (
            <div 
              key={i} 
              className="flex items-center gap-4 animate-fade-in-up"
              style={{ animationDelay: `${0.2 + i * 0.15}s` }}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
              </div>
              <p className="text-sm sm:text-lg text-white/80">{p.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 animate-fade-in-up" style={{ animationDelay: '1s' }}>
          <p className="text-xl sm:text-2xl text-white/60 font-light italic">
            "Un site seul ne suffit plus."
          </p>
        </div>
      </div>
    </div>
  );
}

/* ──── SLIDE 3: Solution ──── */
function SlideSolution() {
  const features = [
    { icon: Palette, label: 'Page web personnalisable' },
    { icon: Calendar, label: 'Système de réservation' },
    { icon: MessageCircle, label: 'Gestion des demandes' },
    { icon: Users, label: 'Suivi client' },
    { icon: BarChart3, label: 'Planning centralisé' },
  ];

  return (
    <div className="h-full w-full bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center relative overflow-hidden px-6 sm:px-12">
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px]" />
      
      <div className="relative z-10 max-w-5xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: text */}
          <div>
            <p className="text-xs sm:text-sm text-emerald-400/80 uppercase tracking-[0.25em] font-medium mb-4 animate-fade-in">La solution</p>
            <h2 className="text-2xl sm:text-4xl font-semibold text-white tracking-tight mb-8 animate-fade-in-up">
              CleaningPage combine tout ce dont vous avez besoin
            </h2>
            
            <div className="space-y-4">
              {features.map((f, i) => (
                <div 
                  key={i}
                  className="flex items-center gap-4 animate-fade-in-up"
                  style={{ animationDelay: `${0.2 + i * 0.1}s` }}
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <f.icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <p className="text-sm sm:text-base text-white/80">{f.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Dashboard mockup */}
          <div className="hidden lg:block animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <div className="bg-zinc-800/50 rounded-2xl p-1 ring-1 ring-white/10 shadow-2xl">
              <div className="bg-zinc-900 rounded-xl overflow-hidden">
                {/* Top bar */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  <div className="flex-1 mx-4">
                    <div className="bg-white/5 rounded-lg h-6 max-w-xs mx-auto flex items-center justify-center">
                      <span className="text-[10px] text-white/30">app.cleaningpage.com/dashboard</span>
                    </div>
                  </div>
                </div>
                {/* Dashboard content mockup */}
                <div className="p-6 space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1 bg-white/5 rounded-xl p-4">
                      <p className="text-[10px] text-white/40 mb-1">Réservations</p>
                      <p className="text-2xl font-bold text-white">47</p>
                      <p className="text-[10px] text-emerald-400">+12% ce mois</p>
                    </div>
                    <div className="flex-1 bg-white/5 rounded-xl p-4">
                      <p className="text-[10px] text-white/40 mb-1">Revenu</p>
                      <p className="text-2xl font-bold text-white">4 280€</p>
                      <p className="text-[10px] text-emerald-400">+8% ce mois</p>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-xs text-white/40 mb-3">Prochains rendez-vous</p>
                    {['Nettoyage intérieur — 14:00', 'Detailing complet — 16:30', 'Lustrage — 17:45'].map((rdv, i) => (
                      <div key={i} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-xs text-white/60">{rdv}</span>
                      </div>
                    ))}
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

/* ──── SLIDE 4: Modes ──── */
function SlideModes() {
  return (
    <div className="h-full w-full bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center relative overflow-hidden px-6 sm:px-12">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-500/5 rounded-full blur-[120px]" />
      
      <div className="relative z-10 max-w-4xl mx-auto w-full">
        <div className="text-center mb-12">
          <p className="text-xs sm:text-sm text-blue-400/80 uppercase tracking-[0.25em] font-medium mb-4 animate-fade-in">Fonctionnement</p>
          <h2 className="text-2xl sm:text-4xl font-semibold text-white tracking-tight animate-fade-in-up">
            Deux modes, un seul outil
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
          {/* Mode 1 */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 sm:p-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5">
              <Calendar className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-3">Mode 1 — Réservation directe</h3>
            <p className="text-sm text-white/50 leading-relaxed mb-4">
              Le client choisit sa formule, sélectionne un créneau et réserve en autonomie.
            </p>
            <div className="space-y-2">
              {['Idéal pour le detailing auto', 'Formules prédéfinies', 'Réservation instantanée'].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-xs text-white/60">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mode 2 */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 sm:p-8 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-5">
              <FileText className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-3">Mode 2 — Sur devis personnalisé</h3>
            <p className="text-sm text-white/50 leading-relaxed mb-4">
              Vous créez une prestation sur mesure pour votre client. Il la retrouve et réserve via son email.
            </p>
            <div className="space-y-2">
              {['Idéal pour vitres, maison, bureaux', 'Prestation personnalisée', 'Le client réserve quand il veut'].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span className="text-xs text-white/60">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──── SLIDE 5: Métiers ──── */
function SlideMetiers() {
  const metiers = [
    { icon: Car, label: 'Nettoyage automobile', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    { icon: Eye, label: 'Nettoyage de vitres', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    { icon: Building2, label: 'Nettoyage de bureaux', color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
    { icon: Home, label: 'Nettoyage de maison', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    { icon: Shirt, label: 'Nettoyage textile', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
  ];

  return (
    <div className="h-full w-full bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center relative overflow-hidden px-6 sm:px-12">
      <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-[100px]" />
      
      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <p className="text-xs sm:text-sm text-violet-400/80 uppercase tracking-[0.25em] font-medium mb-4 animate-fade-in">Universalité</p>
        <h2 className="text-2xl sm:text-4xl font-semibold text-white tracking-tight mb-10 animate-fade-in-up">
          Pour quels métiers ?
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5 mb-10">
          {metiers.map((m, i) => (
            <div 
              key={i}
              className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 sm:p-6 flex flex-col items-center gap-3 animate-fade-in-up"
              style={{ animationDelay: `${0.2 + i * 0.1}s` }}
            >
              <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${m.color}`}>
                <m.icon className="w-6 h-6" />
              </div>
              <p className="text-xs sm:text-sm text-white/70 font-medium">{m.label}</p>
            </div>
          ))}
        </div>

        <p className="text-base sm:text-lg text-white/40 italic animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
          "La plateforme s'adapte au modèle économique, pas l'inverse."
        </p>
      </div>
    </div>
  );
}

/* ──── SLIDE 6: Benefits ──── */
function SlideBenefits() {
  const benefits = [
    { icon: Shield, label: 'Professionnaliser son image', desc: 'Une page pro qui inspire confiance' },
    { icon: Layout, label: 'Centraliser son activité', desc: 'Tout au même endroit' },
    { icon: Clock, label: 'Gagner du temps', desc: 'Automatiser les tâches répétitives' },
    { icon: Settings, label: 'Structurer son organisation', desc: 'Planning, suivi, statistiques' },
    { icon: UserCheck, label: 'Améliorer son suivi client', desc: 'Historique et fidélisation' },
  ];

  return (
    <div className="h-full w-full bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center relative overflow-hidden px-6 sm:px-12">
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px]" />
      
      <div className="relative z-10 max-w-3xl mx-auto">
        <p className="text-xs sm:text-sm text-amber-400/80 uppercase tracking-[0.25em] font-medium mb-4 animate-fade-in">Les bénéfices</p>
        <h2 className="text-2xl sm:text-4xl font-semibold text-white tracking-tight mb-10 animate-fade-in-up">
          Ce que vous gagnez
        </h2>

        <div className="space-y-4 sm:space-y-5">
          {benefits.map((b, i) => (
            <div 
              key={i}
              className="flex items-start gap-4 sm:gap-5 bg-white/[0.03] border border-white/10 rounded-2xl p-4 sm:p-5 animate-fade-in-up"
              style={{ animationDelay: `${0.2 + i * 0.12}s` }}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                <b.icon className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-medium text-white mb-0.5">{b.label}</p>
                <p className="text-xs sm:text-sm text-white/40">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ──── SLIDE 7: Simplicity ──── */
function SlideSimplicity() {
  return (
    <div className="h-full w-full bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center relative overflow-hidden px-6 sm:px-12">
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px]" />
      
      <div className="relative z-10 max-w-5xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Mockup CleaningPage */}
          <div className="animate-fade-in-up order-2 lg:order-1" style={{ animationDelay: '0.3s' }}>
            <div className="relative mx-auto w-[260px] sm:w-[300px]">
              <div className="bg-zinc-800/60 rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-white/10">
                {/* Banner */}
                <div className="h-24 relative overflow-hidden">
                  <img src={mockupCarCleaning} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-800/40 to-transparent" />
                </div>
                {/* Logo */}
                <div className="flex justify-center -mt-8 relative z-10 mb-2">
                  <div className="w-16 h-16 rounded-2xl shadow-xl ring-4 ring-zinc-800 overflow-hidden">
                    <img src={mockupLogoClean} alt="Logo" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="px-4 pb-4 text-center">
                  <h3 className="text-sm font-bold text-white mb-0.5">Clean Premium</h3>
                  <p className="text-[9px] text-white/40 mb-3">Detailing automobile haut de gamme</p>
                  <div className="flex justify-center mb-3">
                    <span className="inline-flex items-center gap-1.5 text-[8px] border border-emerald-500/30 text-emerald-400 px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      Ouvert
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-white/5 rounded-lg p-2.5 border border-white/5">
                      <p className="text-[9px] text-white/60 mb-0.5">Express</p>
                      <p className="text-sm font-bold text-white">35€</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2.5 border border-white/5">
                      <p className="text-[9px] text-white/60 mb-0.5">Complet</p>
                      <p className="text-sm font-bold text-white">89€</p>
                    </div>
                  </div>
                  <button className="w-full bg-white text-zinc-900 py-2.5 rounded-xl text-xs font-semibold">
                    Réserver
                  </button>
                </div>
              </div>
              
              {/* Floating widget */}
              <div className="absolute -top-3 -right-3 sm:-right-8 animate-float">
                <div className="bg-zinc-800 rounded-xl p-2.5 shadow-lg ring-1 ring-white/10">
                  <div className="flex items-center gap-2">
                    <MousePointer2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-[9px] text-white/60">Drag & drop</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: text */}
          <div className="order-1 lg:order-2">
            <p className="text-xs sm:text-sm text-emerald-400/80 uppercase tracking-[0.25em] font-medium mb-4 animate-fade-in">Simplicité</p>
            <h2 className="text-2xl sm:text-4xl font-semibold text-white tracking-tight mb-8 animate-fade-in-up">
              Simple et intuitif
            </h2>
            
            <div className="space-y-5">
              {[
                { icon: Zap, label: 'Mise en place rapide', desc: 'Configurez votre page en quelques minutes' },
                { icon: Shield, label: 'Aucun besoin technique', desc: 'Interface pensée pour les pros du terrain' },
                { icon: Settings, label: 'Modifiable à tout moment', desc: 'Ajustez vos formules, horaires, visuels quand vous voulez' },
              ].map((item, i) => (
                <div 
                  key={i}
                  className="flex items-start gap-4 animate-fade-in-up"
                  style={{ animationDelay: `${0.3 + i * 0.15}s` }}
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-medium text-white">{item.label}</p>
                    <p className="text-xs text-white/40">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──── SLIDE 8: Features ──── */
function SlideFeatures() {
  const features = [
    { icon: Palette, label: 'Page personnalisable' },
    { icon: Calendar, label: 'Réservation en ligne' },
    { icon: UserCheck, label: 'Attribution de prestations' },
    { icon: Clock, label: 'Planning intégré' },
    { icon: MessageCircle, label: 'Centralisation des demandes' },
    { icon: Phone, label: 'Ajout manuel des réservations' },
    { icon: Users, label: 'Suivi client' },
    { icon: BarChart3, label: 'Statistiques' },
  ];

  return (
    <div className="h-full w-full bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center relative overflow-hidden px-6 sm:px-12">
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px]" />
      
      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <p className="text-xs sm:text-sm text-blue-400/80 uppercase tracking-[0.25em] font-medium mb-4 animate-fade-in">Fonctionnalités</p>
        <h2 className="text-2xl sm:text-4xl font-semibold text-white tracking-tight mb-10 animate-fade-in-up">
          Tout ce qu'il vous faut
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {features.map((f, i) => (
            <div 
              key={i}
              className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col items-center gap-3 animate-fade-in-up hover:bg-white/[0.06] transition-colors"
              style={{ animationDelay: `${0.15 + i * 0.08}s` }}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <f.icon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
              </div>
              <p className="text-[10px] sm:text-xs text-white/60 font-medium text-center leading-tight">{f.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ──── SLIDE 9: Trial ──── */
function SlideTrial() {
  return (
    <div className="h-full w-full bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center relative overflow-hidden px-6 sm:px-12">
      {/* Big glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[150px]" />
      </div>
      
      <div className="relative z-10 max-w-xl mx-auto text-center">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-8 animate-fade-in">
          <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-400" />
        </div>
        
        <h2 className="text-3xl sm:text-5xl font-semibold text-white tracking-tight mb-6 animate-fade-in-up">
          Essayez gratuitement
        </h2>
        
        <div className="space-y-4 mb-10">
          {[
            { text: '30 jours offerts', highlight: true },
            { text: 'Sans engagement', highlight: false },
            { text: 'Toutes les fonctionnalités incluses', highlight: false },
          ].map((item, i) => (
            <div 
              key={i}
              className="flex items-center justify-center gap-3 animate-fade-in-up"
              style={{ animationDelay: `${0.3 + i * 0.15}s` }}
            >
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Check className="w-4 h-4 text-emerald-400" />
              </div>
              <p className={`text-base sm:text-lg ${item.highlight ? 'text-white font-medium' : 'text-white/60'}`}>
                {item.text}
              </p>
            </div>
          ))}
        </div>

        <div className="animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
          <a href="/auth">
            <Button 
              size="xl" 
              className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/25 px-12"
            >
              Commencer l'essai gratuit
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}

/* ──── SLIDE 10: Contact ──── */
function SlideContact() {
  return (
    <div className="h-full w-full bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center relative overflow-hidden px-6 sm:px-12">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px]" />
      
      <div className="relative z-10 max-w-lg mx-auto text-center">
        <div className="mb-8 animate-fade-in">
          <Logo size="xl" variant="light" />
        </div>
        
        <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight mb-3 animate-fade-in-up">
          Prêt à structurer votre activité ?
        </h2>
        <p className="text-sm sm:text-base text-white/40 mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          Rejoignez les professionnels du nettoyage qui utilisent CleaningPage pour gérer et développer leur entreprise.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <a href="/auth">
            <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white w-full sm:w-auto">
              Commencer gratuitement
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </a>
          <a href="/">
            <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 w-full sm:w-auto">
              Voir le site
            </Button>
          </a>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <p className="text-xs text-white/30">
            contact@cleaningpage.com
          </p>
        </div>
      </div>
    </div>
  );
}
