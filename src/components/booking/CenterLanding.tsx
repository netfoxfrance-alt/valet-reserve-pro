import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, MapPin, Phone, ArrowRight } from 'lucide-react';
import { Center } from '@/hooks/useCenter';

interface CenterLandingProps {
  center: Center;
  onStartBooking: () => void;
  hasPacks: boolean;
  isPro: boolean;
}

export function CenterLanding({ center, onStartBooking, hasPacks, isPro }: CenterLandingProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="w-full py-6 px-4 border-b border-border">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          {center.logo_url ? (
            <img 
              src={center.logo_url} 
              alt={center.name} 
              className="w-12 h-12 rounded-xl object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
          )}
          <span className="font-semibold text-xl text-foreground tracking-tight">{center.name}</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-12 md:py-20">
        <div className="max-w-2xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-4">
              Bienvenue chez {center.name}
            </h1>
            {center.welcome_message && (
              <p className="text-lg text-muted-foreground max-w-lg mx-auto">
                {center.welcome_message}
              </p>
            )}
          </div>

          {/* Info Card */}
          <Card variant="elevated" className="p-6 md:p-8 mb-8">
            <div className="space-y-4">
              {center.address && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Adresse</p>
                    <p className="text-foreground">{center.address}</p>
                  </div>
                </div>
              )}
              
              {center.phone && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Téléphone</p>
                    <a 
                      href={`tel:${center.phone}`} 
                      className="text-foreground hover:text-primary transition-colors"
                    >
                      {center.phone}
                    </a>
                  </div>
                </div>
              )}

              {!center.address && !center.phone && (
                <p className="text-muted-foreground text-center py-4">
                  Spécialiste du nettoyage et de l'esthétique automobile.
                </p>
              )}
            </div>
          </Card>

          {/* CTA Button */}
          <div className="text-center">
            {isPro && hasPacks ? (
              <>
                <Button 
                  variant="premium" 
                  size="xl" 
                  onClick={onStartBooking}
                  className="w-full sm:w-auto"
                >
                  Prendre rendez-vous
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <p className="text-sm text-muted-foreground mt-4">
                  Répondez à quelques questions pour obtenir une recommandation personnalisée
                </p>
              </>
            ) : (
              <>
                <Button 
                  variant="premium" 
                  size="xl" 
                  onClick={onStartBooking}
                  className="w-full sm:w-auto"
                >
                  Demander un devis
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <p className="text-sm text-muted-foreground mt-4">
                  Envoyez-nous votre demande, nous vous recontactons rapidement
                </p>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border mt-auto">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            Propulsé par OCLINKO
          </p>
        </div>
      </footer>
    </div>
  );
}
