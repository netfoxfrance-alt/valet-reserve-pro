import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Logo } from '@/components/ui/Logo';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Clock, ArrowRight, Star, Car } from 'lucide-react';
import { Center, Pack } from '@/hooks/useCenter';

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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Cover Image */}
      <div className="relative w-full h-40 sm:h-52 bg-gradient-to-br from-secondary to-muted">
        {/* Could be replaced with center.cover_url if added */}
      </div>

      {/* Main Content */}
      <main className="flex-1 px-4 pb-24">
        <div className="max-w-2xl mx-auto">
          {/* Logo overlapping cover */}
          <div className="relative -mt-12 mb-4">
            {center.logo_url ? (
              <img 
                src={center.logo_url} 
                alt={center.name} 
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-background shadow-lg"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-card rounded-2xl flex items-center justify-center border-4 border-background shadow-lg">
                <Car className="w-10 h-10 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Center Name + Badge */}
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              {center.name}
            </h1>
            {isOpen ? (
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0">
                Ouvert
              </Badge>
            ) : (
              <Badge variant="secondary">Fermé</Badge>
            )}
          </div>

          {/* Subtitle with rating */}
          <div className="flex items-center gap-2 text-muted-foreground mb-6">
            <span>Lavage auto</span>
            <span>•</span>
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span>4.8</span>
          </div>

          {/* Info Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
            {center.address && (
              <Card className="p-4 text-center bg-card border border-border">
                <MapPin className="w-5 h-5 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-foreground truncate">{center.address}</p>
              </Card>
            )}
            <Card className="p-4 text-center bg-card border border-border">
              <Clock className="w-5 h-5 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-foreground">9h - 19h</p>
            </Card>
            {center.phone && (
              <Card className="p-4 text-center bg-card border border-border">
                <Phone className="w-5 h-5 mx-auto text-muted-foreground mb-2" />
                <a 
                  href={`tel:${center.phone}`}
                  className="text-sm text-foreground hover:text-primary transition-colors"
                >
                  {center.phone}
                </a>
              </Card>
            )}
          </div>

          {/* Formules Section - Only for Pro with packs */}
          {isPro && packs.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-foreground mb-4">Nos formules</h2>
              <div className="grid grid-cols-2 gap-3">
                {packs.slice(0, 6).map((pack) => (
                  <Card 
                    key={pack.id}
                    className="p-4 sm:p-5 text-center bg-card border border-border hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer group"
                    onClick={() => onSelectPack?.(pack)}
                  >
                    <p className="font-medium text-foreground group-hover:text-primary transition-colors mb-1">
                      {pack.name}
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-foreground">
                      {pack.price}€
                    </p>
                    {pack.duration && (
                      <p className="text-xs text-muted-foreground mt-1">{pack.duration}</p>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Welcome message if available */}
          {center.welcome_message && (
            <div className="mb-8 p-4 bg-secondary/30 rounded-xl">
              <p className="text-muted-foreground text-sm text-center">
                {center.welcome_message}
              </p>
            </div>
          )}

          {/* Additional info if no address or phone */}
          {!center.address && !center.phone && !center.welcome_message && (
            <div className="mb-8 p-4 bg-secondary/30 rounded-xl">
              <p className="text-muted-foreground text-sm text-center">
                Spécialiste du nettoyage et de l'esthétique automobile.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Fixed CTA Button at bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border">
        <div className="max-w-2xl mx-auto">
          <Button 
            variant="default" 
            size="lg" 
            onClick={onStartBooking}
            className="w-full rounded-xl text-base py-6"
          >
            {isPro && hasPacks ? 'Réserver un créneau' : 'Demander un devis'}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="pb-24 pt-4 px-4 text-center">
        <p className="text-xs text-muted-foreground">
          Propulsé par <span className="font-medium">CleaningPage</span>
        </p>
      </footer>
    </div>
  );
}