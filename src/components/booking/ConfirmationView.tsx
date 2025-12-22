import { Pack } from '@/types/booking';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Calendar, Clock, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ConfirmationViewProps {
  pack: Pack;
  date: Date;
  time: string;
  clientName: string;
  centerName?: string;
  centerAddress?: string | null;
}

export function ConfirmationView({ pack, date, time, clientName, centerName = "Centre", centerAddress }: ConfirmationViewProps) {
  return (
    <div className="w-full max-w-lg mx-auto text-center animate-scale-in">
      <div className="mb-8">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-2 tracking-tight">
          Réservation confirmée
        </h2>
        <p className="text-muted-foreground">
          Merci {clientName.split(' ')[0]}, votre rendez-vous est enregistré.
        </p>
      </div>
      
      <Card variant="elevated" className="p-6 text-left mb-6">
        <h3 className="font-semibold text-lg text-foreground mb-4">
          Récapitulatif
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">
                {format(date, "EEEE d MMMM yyyy", { locale: fr })}
              </p>
              <p className="text-sm text-muted-foreground">
                à {time}
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">
                Pack {pack.name}
              </p>
              <p className="text-sm text-muted-foreground">
                Durée estimée : {pack.duration}
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">
                {centerName}
              </p>
              {centerAddress && (
                <p className="text-sm text-muted-foreground">
                  {centerAddress}
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Prix estimé</span>
            <span className="text-2xl font-bold text-foreground">{pack.price}€</span>
          </div>
        </div>
      </Card>
      
      <p className="text-sm text-muted-foreground mb-6">
        Un email de confirmation vous a été envoyé.<br />
        Vous pouvez modifier ou annuler jusqu'à 24h avant.
      </p>
      
      <Button variant="secondary" size="lg">
        Ajouter au calendrier
      </Button>
    </div>
  );
}
