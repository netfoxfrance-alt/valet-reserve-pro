import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Logo } from '@/components/ui/Logo';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Clock, ArrowRight, Star, Car } from 'lucide-react';
import { Center, Pack } from '@/hooks/useCenter';
import { CenterCustomization, defaultCustomization } from '@/types/customization';
import { useMemo } from 'react';

interface CenterLandingProps {
  center: Center;
  packs: Pack[];
  onStartBooking: () => void;
  onSelectPack?: (pack: Pack) => void;
  hasPacks: boolean;
  isPro: boolean;
}

export function CenterLanding({ center, packs, onStartBooking, onSelectPack, hasPacks, isPro }: CenterLandingProps) {
  // Check if center is currently open (simple check based on current hour)
  const now = new Date();
  const currentHour = now.getHours();
  const isOpen = currentHour >= 9 && currentHour < 19;

  // Get customization with fallback to defaults
  const customization: CenterCustomization = useMemo(() => {
    const c = center.customization || defaultCustomization;
    return {
      colors: { ...defaultCustomization.colors, ...(c.colors || {}) },
      texts: { ...defaultCustomization.texts, ...(c.texts || {}) },
      layout: { ...defaultCustomization.layout, ...(c.layout || {}) },
      cover_url: c.cover_url ?? null,
    };
  }, [center.customization]);

  // Generate CSS variables for custom colors
  const customStyles = useMemo(() => ({
    '--custom-primary': customization.colors.primary,
    '--custom-secondary': customization.colors.secondary,
    '--custom-accent': customization.colors.accent,
  } as React.CSSProperties), [customization.colors]);

  return (
    <div 
      className={`min-h-screen flex flex-col ${customization.layout.dark_mode ? 'dark' : ''}`}
      style={{
        ...customStyles,
        backgroundColor: customization.layout.dark_mode ? customization.colors.secondary : undefined,
      }}
    >
      {/* Cover Image */}
      <div 
        className="relative w-full h-40 sm:h-52"
        style={{
          background: customization.cover_url 
            ? `url(${customization.cover_url}) center/cover no-repeat`
            : `linear-gradient(135deg, ${customization.colors.primary}, ${customization.colors.secondary})`,
        }}
      />

      {/* Main Content */}
      <main className={`flex-1 px-4 pb-24 ${customization.layout.dark_mode ? 'bg-gray-900' : 'bg-background'}`}>
        <div className="max-w-2xl mx-auto">
          {/* Logo overlapping cover */}
          <div className="relative -mt-12 mb-4">
            {center.logo_url ? (
              <img 
                src={center.logo_url} 
                alt={center.name} 
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 shadow-lg"
                style={{ 
                  borderColor: customization.layout.dark_mode ? customization.colors.secondary : 'white',
                }}
              />
            ) : (
              <div 
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center border-4 shadow-lg"
                style={{ 
                  backgroundColor: customization.colors.primary,
                  borderColor: customization.layout.dark_mode ? customization.colors.secondary : 'white',
                }}
              >
                <Car className="w-10 h-10 text-white" />
              </div>
            )}
          </div>

          {/* Center Name + Badge */}
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h1 
              className="text-2xl sm:text-3xl font-bold tracking-tight"
              style={{ color: customization.layout.dark_mode ? 'white' : undefined }}
            >
              {center.name}
            </h1>
            {isOpen ? (
              <Badge 
                className="border-0"
                style={{ backgroundColor: customization.colors.accent + '20', color: customization.colors.accent }}
              >
                Ouvert
              </Badge>
            ) : (
              <Badge variant="secondary">Fermé</Badge>
            )}
          </div>

          {/* Tagline or default subtitle */}
          <div 
            className="flex items-center gap-2 mb-6"
            style={{ color: customization.layout.dark_mode ? '#9ca3af' : undefined }}
          >
            <span>{customization.texts.tagline || 'Lavage auto'}</span>
            <span>•</span>
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span>4.8</span>
          </div>

          {/* Info Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
            {customization.layout.show_address && center.address && (
              <Card 
                className="p-4 text-center"
                style={{
                  backgroundColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.05)' : undefined,
                  borderColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.1)' : undefined,
                }}
              >
                <MapPin className="w-5 h-5 mx-auto mb-2" style={{ color: customization.colors.primary }} />
                <p 
                  className="text-sm truncate"
                  style={{ color: customization.layout.dark_mode ? 'white' : undefined }}
                >
                  {center.address}
                </p>
              </Card>
            )}
            {customization.layout.show_hours && (
              <Card 
                className="p-4 text-center"
                style={{
                  backgroundColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.05)' : undefined,
                  borderColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.1)' : undefined,
                }}
              >
                <Clock className="w-5 h-5 mx-auto mb-2" style={{ color: customization.colors.primary }} />
                <p 
                  className="text-sm"
                  style={{ color: customization.layout.dark_mode ? 'white' : undefined }}
                >
                  9h - 19h
                </p>
              </Card>
            )}
            {customization.layout.show_phone && center.phone && (
              <Card 
                className="p-4 text-center"
                style={{
                  backgroundColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.05)' : undefined,
                  borderColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.1)' : undefined,
                }}
              >
                <Phone className="w-5 h-5 mx-auto mb-2" style={{ color: customization.colors.primary }} />
                <a 
                  href={`tel:${center.phone}`}
                  className="text-sm transition-colors"
                  style={{ color: customization.layout.dark_mode ? 'white' : undefined }}
                >
                  {center.phone}
                </a>
              </Card>
            )}
          </div>

          {/* Formules Section - Only for Pro with packs */}
          {isPro && packs.length > 0 && (
            <div className="mb-8">
              <h2 
                className="text-lg font-semibold mb-4"
                style={{ color: customization.layout.dark_mode ? 'white' : undefined }}
              >
                Nos formules
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {packs.slice(0, 6).map((pack) => {
                  const hasVariants = pack.price_variants && pack.price_variants.length > 0;
                  const minPrice = hasVariants 
                    ? Math.min(...pack.price_variants.map(v => v.price))
                    : pack.price;

                  return (
                    <Card 
                      key={pack.id}
                      className="p-4 sm:p-5 transition-all cursor-pointer group"
                      style={{
                        backgroundColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.05)' : undefined,
                        borderColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.1)' : undefined,
                      }}
                      onClick={() => onSelectPack?.(pack)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p 
                            className="font-semibold transition-colors"
                            style={{ color: customization.layout.dark_mode ? 'white' : undefined }}
                          >
                            {pack.name}
                          </p>
                          {pack.description && (
                            <p 
                              className="text-xs line-clamp-1 mt-0.5"
                              style={{ color: customization.layout.dark_mode ? '#9ca3af' : undefined }}
                            >
                              {pack.description}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p 
                            className="text-lg sm:text-xl font-bold"
                            style={{ color: customization.colors.primary }}
                          >
                            {hasVariants ? `${minPrice}€` : `${pack.price}€`}
                          </p>
                          {hasVariants && (
                            <p 
                              className="text-xs"
                              style={{ color: customization.layout.dark_mode ? '#9ca3af' : undefined }}
                            >
                              à partir de
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {hasVariants && (
                        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border/50">
                          {pack.price_variants.slice(0, 4).map((v, i) => (
                            <span 
                              key={i} 
                              className="text-xs px-2 py-1 rounded"
                              style={{ 
                                backgroundColor: customization.colors.primary + '15',
                                color: customization.layout.dark_mode ? 'white' : undefined,
                              }}
                            >
                              {v.name}: {v.price}€
                            </span>
                          ))}
                          {pack.price_variants.length > 4 && (
                            <span 
                              className="text-xs px-2 py-1"
                              style={{ color: customization.layout.dark_mode ? '#9ca3af' : undefined }}
                            >
                              +{pack.price_variants.length - 4}
                            </span>
                          )}
                        </div>
                      )}
                      
                      {pack.duration && (
                        <p 
                          className="text-xs mt-2"
                          style={{ color: customization.layout.dark_mode ? '#9ca3af' : undefined }}
                        >
                          <Clock className="w-3 h-3 inline mr-1" />
                          {pack.duration}
                        </p>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Welcome message if available */}
          {center.welcome_message && (
            <div 
              className="mb-8 p-4 rounded-xl"
              style={{ backgroundColor: customization.colors.primary + '10' }}
            >
              <p 
                className="text-sm text-center"
                style={{ color: customization.layout.dark_mode ? '#d1d5db' : undefined }}
              >
                {center.welcome_message}
              </p>
            </div>
          )}

          {/* Additional info if no address or phone */}
          {!center.address && !center.phone && !center.welcome_message && (
            <div 
              className="mb-8 p-4 rounded-xl"
              style={{ backgroundColor: customization.colors.primary + '10' }}
            >
              <p 
                className="text-sm text-center"
                style={{ color: customization.layout.dark_mode ? '#d1d5db' : undefined }}
              >
                Spécialiste du nettoyage et de l'esthétique automobile.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Fixed CTA Button at bottom */}
      <div 
        className="fixed bottom-0 left-0 right-0 p-4 backdrop-blur-sm border-t"
        style={{ 
          backgroundColor: customization.layout.dark_mode ? 'rgba(17,24,39,0.95)' : 'rgba(255,255,255,0.95)',
          borderColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.1)' : undefined,
        }}
      >
        <div className="max-w-2xl mx-auto">
          <Button 
            size="lg" 
            onClick={onStartBooking}
            className="w-full rounded-xl text-base py-6 text-white"
            style={{ backgroundColor: customization.colors.primary }}
          >
            {customization.texts.cta_button || (isPro && hasPacks ? 'Réserver un créneau' : 'Demander un devis')}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer 
        className="pb-24 pt-4 px-4 text-center"
        style={{ backgroundColor: customization.layout.dark_mode ? '#111827' : undefined }}
      >
        <p 
          className="text-xs"
          style={{ color: customization.layout.dark_mode ? '#6b7280' : undefined }}
        >
          Propulsé par <span className="font-medium">CleaningPage</span>
        </p>
      </footer>
    </div>
  );
}