import { Pack } from '@/types/booking';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Clock, Star } from 'lucide-react';

interface PackRecommendationProps {
  pack: Pack;
  onSelect: () => void;
}

export function PackRecommendation({ pack, onSelect }: PackRecommendationProps) {
  return (
    <div className="w-full max-w-lg mx-auto animate-scale-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Star className="w-4 h-4" />
          Recommandé pour vous
        </div>
        <h2 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight">
          Votre pack idéal
        </h2>
      </div>
      
      <Card variant="elevated" className="p-8 hover:shadow-xl transition-shadow duration-300">
        <div className="text-center mb-6">
          <h3 className="text-3xl font-bold text-foreground mb-2">
            {pack.name}
          </h3>
          <p className="text-muted-foreground text-lg">
            {pack.description}
          </p>
        </div>
        
        <div className="flex justify-center items-baseline gap-1 mb-6">
          <span className="text-5xl font-bold text-foreground">{pack.price}</span>
          <span className="text-xl text-muted-foreground">€</span>
        </div>
        
        <div className="flex items-center justify-center gap-2 text-muted-foreground mb-8">
          <Clock className="w-5 h-5" />
          <span>Durée estimée : {pack.duration}</span>
        </div>
        
        <ul className="space-y-3 mb-8">
          {pack.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-primary" />
              </div>
              <span className="text-foreground">{feature}</span>
            </li>
          ))}
        </ul>
        
        <Button 
          variant="premium" 
          size="xl" 
          className="w-full"
          onClick={onSelect}
        >
          Réserver ce créneau
        </Button>
      </Card>
      
      <p className="text-center text-sm text-muted-foreground mt-6">
        Prix indicatif • Le montant final peut varier selon l'état du véhicule
      </p>
    </div>
  );
}
