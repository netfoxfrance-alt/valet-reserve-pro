import { useState, useEffect, useRef } from 'react';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, ArrowLeft, ArrowDown, Check, Calendar, Users, BarChart3, 
  Clock, Car, Building2, Home, Shirt, Sparkles, Zap, 
  Globe, Palette, Eye, Shield, Settings, Phone,
  MousePointer2, FileText, UserCheck, MessageCircle, Receipt, Layout
} from 'lucide-react';
import mockupCarCleaning from '@/assets/mockup-car-cleaning.jpg';
import mockupLogoClean from '@/assets/mockup-logo-cleaning.png';

const TOTAL_SLIDES = 9;

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

  const touchStart = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => { touchStart.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { diff > 0 ? next() : prev(); }
  };

  const slides = [
    <SlideCover key={0} />,
    <SlideNeeds key={1} />,
    <SlideSolution key={2} />,
    <SlideCustomize key={3} />,
    <SlideModes key={4} />,
    <SlideBenefits key={5} />,
    <SlideFeatures key={6} />,
    <SlideTrial key={7} />,
    <SlideContact key={8} />,
  ];

  return (
    <div 
      ref={containerRef}
      className="h-screen w-screen overflow-hidden bg-foreground relative select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="h-full w-full relative">
        {slides.map((slide, i) => (
          <SlideTransition key={i} active={currentSlide === i} direction={direction}>
            {slide}
          </SlideTransition>
        ))}
      </div>

      {/* Navigation */}
      <div className="absolute bottom-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between px-4 sm:px-8 py-4 bg-gradient-to-t from-black/60 to-transparent">
          <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10 rounded-full" onClick={prev} disabled={currentSlide === 0}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex gap-1.5 sm:gap-2">
            {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
              <button key={i} onClick={() => goTo(i)} className={`h-1.5 rounded-full transition-all duration-500 ${i === currentSlide ? 'w-8 bg-white' : 'w-1.5 bg-white/30 hover:bg-white/50'}`} />
            ))}
          </div>
          <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10 rounded-full" onClick={next} disabled={currentSlide === TOTAL_SLIDES - 1}>
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="absolute top-4 right-4 sm:top-6 sm:right-8 z-50">
        <span className="text-white/40 text-xs font-mono">{String(currentSlide + 1).padStart(2, '0')} / {TOTAL_SLIDES}</span>
      </div>
    </div>
  );
}

/* ──── Transition ──── */
function SlideTransition({ active, direction, children }: { active: boolean; direction: 'next' | 'prev'; children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { if (active) setMounted(true); }, [active]);
  if (!mounted && !active) return null;
  return (
    <div className={`absolute inset-0 transition-all duration-700 ease-out ${active ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 pointer-events-none ' + (direction === 'next' ? '-translate-x-8 scale-[0.98]' : 'translate-x-8 scale-[0.98]')}`}>
      {children}
    </div>
  );
}

/* ──── Shared ──── */
const slideBg = "h-full w-full bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center relative overflow-hidden px-6 sm:px-12";

function Tag({ children, color = 'emerald' }: { children: string; color?: string }) {
  const colors: Record<string, string> = {
    emerald: 'text-emerald-400/80',
    red: 'text-red-400/80',
    blue: 'text-blue-400/80',
    amber: 'text-amber-400/80',
    violet: 'text-violet-400/80',
  };
  return <p className={`text-xs sm:text-sm uppercase tracking-[0.25em] font-medium mb-4 animate-fade-in ${colors[color]}`}>{children}</p>;
}

/* ═══════ SLIDE 1: Cover ═══════ */
function SlideCover() {
  return (
    <div className="h-full w-full bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]" />

      <div className="relative z-10 text-center max-w-2xl mx-auto px-6">
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
          {['Pro', 'Minimal', 'Complet'].map((l) => (
            <span key={l} className="text-xs sm:text-sm text-white/30 tracking-[0.2em] uppercase font-medium">{l}</span>
          ))}
        </div>
      </div>

      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 animate-bounce">
        <ArrowDown className="w-5 h-5 text-white/20" />
      </div>
    </div>
  );
}

/* ═══════ SLIDE 2: Les besoins ═══════ */
function SlideNeeds() {
  const needs = [
    { icon: Globe, label: 'Présenter son entreprise et ses prestations', desc: 'Un site web professionnel qui reflète votre savoir-faire' },
    { icon: Calendar, label: 'Un système de réservation', desc: 'Pour que vos clients réservent en ligne, simplement' },
    { icon: Clock, label: 'Un agenda pour organiser son planning', desc: 'Visualiser et gérer tous vos rendez-vous au même endroit' },
    { icon: Users, label: 'Un suivi de ses clients et de son activité', desc: 'Historique, statistiques et fidélisation' },
    { icon: Receipt, label: 'Un outil pour les factures et devis', desc: 'Créer, envoyer et suivre vos documents en quelques clics' },
  ];

  return (
    <div className={slideBg}>
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[100px]" />

      <div className="relative z-10 max-w-3xl mx-auto">
        <Tag color="amber">Le constat</Tag>
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-semibold text-white tracking-tight mb-4 animate-fade-in-up">
          Aujourd'hui, une entreprise de nettoyage a besoin&nbsp;:
        </h2>
        <p className="text-sm sm:text-base text-white/40 mb-10 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          Il faut un site complet et beaucoup d'outils éparpillés pour tout gérer.
        </p>

        <div className="space-y-4">
          {needs.map((n, i) => (
            <div key={i} className="flex items-start gap-4 animate-fade-in-up" style={{ animationDelay: `${0.2 + i * 0.12}s` }}>
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                <n.icon className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-medium text-white">{n.label}</p>
                <p className="text-xs sm:text-sm text-white/40">{n.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════ SLIDE 3: La solution ═══════ */
function SlideSolution() {
  const pillars = [
    { icon: Globe, label: 'Une page web', desc: 'Faite pour convertir vos visiteurs en clients', color: 'emerald' },
    { icon: Calendar, label: 'Un système de rendez-vous', desc: 'Réservation en ligne + gestion du planning', color: 'blue' },
    { icon: Layout, label: 'Un espace de gestion', desc: 'Clients, statistiques, factures, devis', color: 'violet' },
  ];

  return (
    <div className={slideBg}>
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-4xl mx-auto w-full text-center">
        <Tag>La solution</Tag>
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-semibold text-white tracking-tight mb-4 animate-fade-in-up">
          CleaningPage combine tout ce dont vous avez besoin
        </h2>
        <p className="text-sm sm:text-base text-white/40 mb-12 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          Un seul outil. Pas dix.
        </p>

        <div className="grid sm:grid-cols-3 gap-5 sm:gap-6">
          {pillars.map((p, i) => {
            const colors: Record<string, string> = {
              emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
              blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
              violet: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
            };
            return (
              <div key={i} className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 sm:p-8 text-center animate-fade-in-up" style={{ animationDelay: `${0.3 + i * 0.15}s` }}>
                <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center mx-auto mb-5 ${colors[p.color]}`}>
                  <p.icon className="w-7 h-7" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2">{p.label}</h3>
                <p className="text-xs sm:text-sm text-white/50 leading-relaxed">{p.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══════ SLIDE 4: Personnalisation ═══════ */
function SlideCustomize() {
  return (
    <div className={slideBg}>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-5xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Mockup */}
          <div className="animate-fade-in-up order-2 lg:order-1" style={{ animationDelay: '0.3s' }}>
            <div className="relative mx-auto w-[260px] sm:w-[300px]">
              <div className="bg-zinc-800/60 rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-white/10">
                <div className="h-24 relative overflow-hidden">
                  <img src={mockupCarCleaning} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-800/40 to-transparent" />
                </div>
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

              {/* Floating widgets */}
              <div className="absolute -top-3 -right-3 sm:-right-8 animate-float">
                <div className="bg-zinc-800 rounded-xl p-2.5 shadow-lg ring-1 ring-white/10">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-emerald-400" />
                    <span className="text-[9px] text-white/60">Couleurs</span>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-2 -left-3 sm:-left-8 animate-float" style={{ animationDelay: '1.5s' }}>
                <div className="bg-zinc-800 rounded-xl p-2.5 shadow-lg ring-1 ring-white/10">
                  <div className="flex items-center gap-2">
                    <MousePointer2 className="w-4 h-4 text-blue-400" />
                    <span className="text-[9px] text-white/60">Drag & drop</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="order-1 lg:order-2">
            <Tag>Votre page</Tag>
            <h2 className="text-2xl sm:text-4xl font-semibold text-white tracking-tight mb-4 animate-fade-in-up">
              Personnalisez votre page sans compétence technique
            </h2>
            <p className="text-sm sm:text-base text-white/40 mb-8 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
              Ajoutez votre logo, vos couleurs, vos prestations. Modifiez tout, à tout moment.
            </p>

            <div className="space-y-5">
              {[
                { icon: Zap, label: 'Mise en place en quelques minutes' },
                { icon: Shield, label: 'Aucune compétence technique requise' },
                { icon: Settings, label: 'Modifiable à tout moment' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 animate-fade-in-up" style={{ animationDelay: `${0.3 + i * 0.15}s` }}>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <p className="text-sm sm:text-base text-white/80">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════ SLIDE 5: Deux modes ═══════ */
function SlideModes() {
  return (
    <div className={slideBg}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-500/5 rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-4xl mx-auto w-full">
        <div className="text-center mb-12">
          <Tag color="blue">Fonctionnement</Tag>
          <h2 className="text-2xl sm:text-4xl font-semibold text-white tracking-tight animate-fade-in-up">
            Deux modes, un seul outil
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 sm:p-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5">
              <Calendar className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-3">Réservation directe</h3>
            <p className="text-sm text-white/50 leading-relaxed mb-5">
              Le client choisit sa formule, sélectionne un créneau et réserve en autonomie.
            </p>
            <div className="space-y-2.5">
              {['Idéal pour le detailing auto', 'Formules prédéfinies', 'Réservation instantanée'].map((item, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-white/60">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 sm:p-8 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-5">
              <FileText className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-3">Sur devis personnalisé</h3>
            <p className="text-sm text-white/50 leading-relaxed mb-5">
              Vous créez une prestation sur mesure. Le client la retrouve et réserve via son email.
            </p>
            <div className="space-y-2.5">
              {['Idéal pour vitres, maison, bureaux', 'Prestation sur mesure', 'Le client réserve quand il veut'].map((item, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-white/60">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════ SLIDE 6: Ce que vous gagnez ═══════ */
function SlideBenefits() {
  const benefits = [
    { icon: Shield, label: 'Professionnaliser votre image', desc: 'Une page pro qui inspire confiance à vos clients' },
    { icon: Layout, label: 'Centraliser votre activité', desc: 'Fini les outils éparpillés, tout est au même endroit' },
    { icon: Clock, label: 'Gagner du temps', desc: 'Moins d\'administratif, plus de terrain' },
    { icon: BarChart3, label: 'Structurer votre organisation', desc: 'Planning, suivi client, statistiques' },
    { icon: UserCheck, label: 'Améliorer le suivi client', desc: 'Historique complet et fidélisation' },
  ];

  return (
    <div className={slideBg}>
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-3xl mx-auto">
        <Tag>Les bénéfices</Tag>
        <h2 className="text-2xl sm:text-4xl font-semibold text-white tracking-tight mb-10 animate-fade-in-up">
          Ce que vous gagnez
        </h2>

        <div className="space-y-3 sm:space-y-4">
          {benefits.map((b, i) => (
            <div 
              key={i}
              className="flex items-center gap-4 sm:gap-5 animate-fade-in-up"
              style={{ animationDelay: `${0.2 + i * 0.1}s` }}
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center flex-shrink-0">
                <b.icon className="w-5 h-5 text-white/70" />
              </div>
              <div className="flex-1">
                <p className="text-sm sm:text-base font-medium text-white">{b.label}</p>
                <p className="text-xs sm:text-sm text-white/40">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════ SLIDE 7: Fonctionnalités ═══════ */
function SlideFeatures() {
  const features = [
    { icon: Palette, label: 'Page personnalisable' },
    { icon: Calendar, label: 'Réservation en ligne' },
    { icon: UserCheck, label: 'Attribution de prestations' },
    { icon: Clock, label: 'Planning intégré' },
    { icon: MessageCircle, label: 'Centralisation des demandes' },
    { icon: Phone, label: 'Ajout manuel de RDV' },
    { icon: Users, label: 'Suivi client complet' },
    { icon: BarChart3, label: 'Statistiques' },
    { icon: Receipt, label: 'Factures & devis' },
  ];

  return (
    <div className={slideBg}>
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px]" />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <Tag color="blue">Fonctionnalités</Tag>
        <h2 className="text-2xl sm:text-4xl font-semibold text-white tracking-tight mb-10 animate-fade-in-up">
          Tout ce qu'il vous faut
        </h2>

        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {features.map((f, i) => (
            <div 
              key={i}
              className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col items-center gap-3 animate-fade-in-up"
              style={{ animationDelay: `${0.15 + i * 0.07}s` }}
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center">
                <f.icon className="w-5 h-5 text-white/60" />
              </div>
              <p className="text-[10px] sm:text-xs text-white/60 font-medium text-center leading-tight">{f.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════ SLIDE 8: Essai gratuit ═══════ */
function SlideTrial() {
  return (
    <div className={slideBg}>
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
          {['30 jours offerts', 'Sans engagement', 'Toutes les fonctionnalités incluses'].map((text, i) => (
            <div key={i} className="flex items-center justify-center gap-3 animate-fade-in-up" style={{ animationDelay: `${0.3 + i * 0.15}s` }}>
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Check className="w-4 h-4 text-emerald-400" />
              </div>
              <p className={`text-base sm:text-lg ${i === 0 ? 'text-white font-medium' : 'text-white/60'}`}>{text}</p>
            </div>
          ))}
        </div>

        <div className="animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
          <a href="/auth">
            <Button size="xl" className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/25 px-12">
              Commencer l'essai gratuit
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}

/* ═══════ SLIDE 9: Contact ═══════ */
function SlideContact() {
  return (
    <div className={slideBg}>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-lg mx-auto text-center">
        <div className="mb-8 animate-fade-in">
          <Logo size="xl" variant="light" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight mb-3 animate-fade-in-up">
          Prêt à structurer votre activité ?
        </h2>
        <p className="text-sm sm:text-base text-white/40 mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          Rejoignez les professionnels du nettoyage qui utilisent CleaningPage.
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
          <p className="text-xs text-white/30">contact@cleaningpage.com</p>
        </div>
      </div>
    </div>
  );
}
