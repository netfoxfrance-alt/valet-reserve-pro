// Feature showcase with minimalist mockup illustrations

// Mockup illustration for calendar/booking
const BookingMockup = () => (
  <div className="relative w-full h-32 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-3 overflow-hidden">
    {/* Mini calendar grid */}
    <div className="grid grid-cols-7 gap-1 mb-2">
      {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => (
        <div key={i} className="text-[8px] text-muted-foreground text-center font-medium">{day}</div>
      ))}
    </div>
    <div className="grid grid-cols-7 gap-1">
      {Array.from({ length: 14 }, (_, i) => (
        <div 
          key={i} 
          className={`aspect-square rounded text-[8px] flex items-center justify-center ${
            i === 5 || i === 8 || i === 12 
              ? 'bg-primary text-white font-medium' 
              : 'bg-background/60 text-muted-foreground'
          }`}
        >
          {i + 1}
        </div>
      ))}
    </div>
    {/* Notification badge */}
    <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
  </div>
);

// Mockup illustration for agenda/schedule
const AgendaMockup = () => (
  <div className="relative w-full h-32 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10 rounded-xl p-3 overflow-hidden">
    {/* Time slots */}
    <div className="space-y-1.5">
      {[
        { time: '09:00', name: 'Jean D.', active: false },
        { time: '10:30', name: 'Marie L.', active: true },
        { time: '14:00', name: 'Libre', active: false },
      ].map((slot, i) => (
        <div 
          key={i} 
          className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-[10px] ${
            slot.active 
              ? 'bg-primary text-white' 
              : 'bg-background/80'
          }`}
        >
          <span className="font-medium">{slot.time}</span>
          <span className={slot.active ? 'text-white/90' : 'text-muted-foreground'}>{slot.name}</span>
        </div>
      ))}
    </div>
    {/* Clock indicator */}
    <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full border-2 border-primary/30 flex items-center justify-center">
      <div className="w-0.5 h-2 bg-primary/50 rounded-full origin-bottom rotate-45" />
    </div>
  </div>
);

// Mockup illustration for packs/offers
const PacksMockup = () => (
  <div className="relative w-full h-32 bg-gradient-to-br from-amber-50 to-orange-100/50 dark:from-amber-950/20 dark:to-orange-900/10 rounded-xl p-3 overflow-hidden">
    {/* Pack cards */}
    <div className="flex gap-2">
      {[
        { name: 'Essentiel', price: '29€' },
        { name: 'Premium', price: '49€', featured: true },
      ].map((pack, i) => (
        <div 
          key={i} 
          className={`flex-1 rounded-lg p-2 text-center ${
            pack.featured 
              ? 'bg-primary text-white ring-2 ring-primary/30' 
              : 'bg-background/80'
          }`}
        >
          <div className="text-[9px] font-medium mb-1">{pack.name}</div>
          <div className={`text-sm font-bold ${pack.featured ? 'text-white' : 'text-foreground'}`}>
            {pack.price}
          </div>
        </div>
      ))}
    </div>
    {/* Features dots */}
    <div className="mt-2 flex gap-1">
      {[1, 2, 3, 4].map((_, i) => (
        <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary/40" />
      ))}
    </div>
  </div>
);

// Mockup illustration for statistics
const StatsMockup = () => (
  <div className="relative w-full h-32 bg-gradient-to-br from-emerald-50 to-green-100/50 dark:from-emerald-950/20 dark:to-green-900/10 rounded-xl p-3 overflow-hidden">
    {/* Chart bars */}
    <div className="flex items-end gap-1.5 h-16">
      {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
        <div 
          key={i} 
          className="flex-1 bg-primary/80 rounded-t transition-all"
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
    {/* Stats label */}
    <div className="mt-2 flex justify-between items-center">
      <span className="text-[9px] text-muted-foreground">Cette semaine</span>
      <div className="flex items-center gap-1">
        <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-b-[6px] border-l-transparent border-r-transparent border-b-green-500" />
        <span className="text-[10px] font-medium text-green-600">+24%</span>
      </div>
    </div>
  </div>
);

// Mockup illustration for client database
const ClientsMockup = () => (
  <div className="relative w-full h-32 bg-gradient-to-br from-violet-50 to-purple-100/50 dark:from-violet-950/20 dark:to-purple-900/10 rounded-xl p-3 overflow-hidden">
    {/* Client rows */}
    <div className="space-y-1.5">
      {[
        { initials: 'JD', name: 'Jean Dupont', visits: '12 visites' },
        { initials: 'ML', name: 'Marie Leroux', visits: '8 visites' },
        { initials: 'PB', name: 'Pierre Blanc', visits: '5 visites' },
      ].map((client, i) => (
        <div key={i} className="flex items-center gap-2 px-1">
          <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[7px] font-medium text-primary">
            {client.initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[9px] font-medium text-foreground truncate">{client.name}</div>
            <div className="text-[7px] text-muted-foreground">{client.visits}</div>
          </div>
        </div>
      ))}
    </div>
    {/* Search icon */}
    <div className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-background/80 flex items-center justify-center">
      <svg className="w-2.5 h-2.5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8" strokeWidth="2" />
        <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  </div>
);

// Mockup illustration for qualification
const QualificationMockup = () => (
  <div className="relative w-full h-32 bg-gradient-to-br from-rose-50 to-pink-100/50 dark:from-rose-950/20 dark:to-pink-900/10 rounded-xl p-3 overflow-hidden">
    {/* Form fields mockup */}
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded border-2 border-primary bg-primary flex items-center justify-center">
          <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="text-[9px] text-foreground">Type de véhicule</div>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded border-2 border-primary bg-primary flex items-center justify-center">
          <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="text-[9px] text-foreground">État intérieur</div>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded border-2 border-muted-foreground/30" />
        <div className="text-[9px] text-muted-foreground">Animaux ?</div>
      </div>
    </div>
    {/* Sparkle */}
    <div className="absolute top-2 right-2">
      <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
      </svg>
    </div>
  </div>
);

const features = [
  {
    title: 'Réservation automatique',
    subtitle: '24h/24, 7j/7',
    description: 'Vos clients réservent en ligne à tout moment, même quand vous dormez.',
    Mockup: BookingMockup,
  },
  {
    title: 'Agenda intégré',
    subtitle: 'Créneaux en temps réel',
    description: 'Gérez vos disponibilités et synchronisez automatiquement votre planning.',
    Mockup: AgendaMockup,
  },
  {
    title: 'Offres personnalisables',
    subtitle: 'Formules & variantes',
    description: 'Créez vos packs avec différentes options et tarifs selon le véhicule.',
    Mockup: PacksMockup,
  },
  {
    title: 'Statistiques détaillées',
    subtitle: 'Tableau de bord complet',
    description: 'Suivez votre chiffre d\'affaires, vos réservations et votre croissance.',
    Mockup: StatsMockup,
  },
  {
    title: 'Base clients',
    subtitle: 'Historique complet',
    description: 'Retrouvez l\'historique de tous vos clients et leurs préférences.',
    Mockup: ClientsMockup,
  },
  {
    title: 'Qualification avancée',
    subtitle: 'Questionnaire intelligent',
    description: 'Qualifiez automatiquement vos prospects avec des questions ciblées.',
    Mockup: QualificationMockup,
  },
];

export function FeatureShowcase() {
  return (
    <div className="py-12">
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-semibold text-foreground mb-3">
          Tout ce dont vous avez besoin
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Des outils professionnels pour automatiser votre activité et gagner du temps chaque jour.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <div
            key={feature.title}
            className="group bg-background rounded-2xl border border-border/50 p-5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
          >
            {/* Mockup illustration */}
            <div className="mb-4 transform group-hover:scale-[1.02] transition-transform duration-300">
              <feature.Mockup />
            </div>

            {/* Content */}
            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <h3 className="font-semibold text-foreground">{feature.title}</h3>
                <span className="text-xs text-primary font-medium">{feature.subtitle}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
