import { useState } from 'react';
import { BookingHeader } from '@/components/booking/BookingHeader';
import { ProgressBar } from '@/components/booking/ProgressBar';
import { QuestionCard } from '@/components/booking/QuestionCard';
import { OptionButton } from '@/components/booking/OptionButton';
import { PackRecommendation } from '@/components/booking/PackRecommendation';
import { CalendarPicker } from '@/components/booking/CalendarPicker';
import { ClientForm, ClientData } from '@/components/booking/ClientForm';
import { ConfirmationView } from '@/components/booking/ConfirmationView';
import { BookingAnswers, Pack, VehicleType, CleaningObjective, VehicleCondition, TimePreference } from '@/types/booking';
import { recommendPack } from '@/lib/packs';
import { Car, Truck, Target, RefreshCw, FileCheck, Sparkles, Droplets, Sun, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

type BookingStep = 
  | 'vehicle-type'
  | 'objective'
  | 'condition'
  | 'interior'
  | 'exterior'
  | 'time-preference'
  | 'recommendation'
  | 'calendar'
  | 'client-info'
  | 'confirmation';

const stepOrder: BookingStep[] = [
  'vehicle-type',
  'objective',
  'condition',
  'interior',
  'exterior',
  'time-preference',
  'recommendation',
  'calendar',
  'client-info',
  'confirmation',
];

export default function Booking() {
  const [currentStep, setCurrentStep] = useState<BookingStep>('vehicle-type');
  const [answers, setAnswers] = useState<BookingAnswers>({});
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [clientData, setClientData] = useState<ClientData | null>(null);
  
  const currentStepIndex = stepOrder.indexOf(currentStep);
  const questionSteps = 6; // First 6 steps are questions
  
  const goToNextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < stepOrder.length) {
      setCurrentStep(stepOrder[nextIndex]);
    }
  };
  
  const goToPrevStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(stepOrder[prevIndex]);
    }
  };
  
  const handleVehicleType = (type: VehicleType) => {
    setAnswers({ ...answers, vehicleType: type });
    goToNextStep();
  };
  
  const handleObjective = (objective: CleaningObjective) => {
    setAnswers({ ...answers, objective });
    goToNextStep();
  };
  
  const handleCondition = (condition: VehicleCondition) => {
    setAnswers({ ...answers, condition });
    goToNextStep();
  };
  
  const handleInterior = (interior: boolean) => {
    setAnswers({ ...answers, interior });
    goToNextStep();
  };
  
  const handleExterior = (exterior: boolean) => {
    setAnswers({ ...answers, exterior });
    goToNextStep();
  };
  
  const handleTimePreference = (preference: TimePreference) => {
    setAnswers({ ...answers, timePreference: preference });
    const pack = recommendPack({ ...answers, timePreference: preference });
    setSelectedPack(pack);
    goToNextStep();
  };
  
  const handlePackSelect = () => {
    goToNextStep();
  };
  
  const handleDateSelect = (date: Date, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    goToNextStep();
  };
  
  const handleClientSubmit = (data: ClientData) => {
    setClientData(data);
    goToNextStep();
  };
  
  const showBackButton = currentStepIndex > 0 && currentStep !== 'confirmation';
  
  return (
    <div className="min-h-screen bg-background">
      <BookingHeader />
      
      <main className="px-4 pb-16 pt-8">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          {showBackButton && (
            <div className="mb-6">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={goToPrevStep}
                className="text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Retour
              </Button>
            </div>
          )}
          
          {/* Progress bar for question steps */}
          {currentStepIndex < questionSteps && (
            <ProgressBar currentStep={currentStepIndex + 1} totalSteps={questionSteps} />
          )}
          
          {/* Step content */}
          {currentStep === 'vehicle-type' && (
            <QuestionCard 
              question="Quel type de véhicule ?"
              subtitle="Sélectionnez la catégorie de votre véhicule"
            >
              <OptionButton
                label="Citadine"
                description="Twingo, 208, Polo..."
                icon={<Car className="w-5 h-5" />}
                selected={answers.vehicleType === 'citadine'}
                onClick={() => handleVehicleType('citadine')}
              />
              <OptionButton
                label="Berline"
                description="308, Golf, Série 3..."
                icon={<Car className="w-5 h-5" />}
                selected={answers.vehicleType === 'berline'}
                onClick={() => handleVehicleType('berline')}
              />
              <OptionButton
                label="SUV / 4x4"
                description="Peugeot 3008, Tiguan, X3..."
                icon={<Truck className="w-5 h-5" />}
                selected={answers.vehicleType === 'suv'}
                onClick={() => handleVehicleType('suv')}
              />
              <OptionButton
                label="Utilitaire"
                description="Kangoo, Partner, Transit..."
                icon={<Truck className="w-5 h-5" />}
                selected={answers.vehicleType === 'utilitaire'}
                onClick={() => handleVehicleType('utilitaire')}
              />
            </QuestionCard>
          )}
          
          {currentStep === 'objective' && (
            <QuestionCard 
              question="Quel est votre objectif ?"
              subtitle="Cela nous aide à vous proposer le bon service"
            >
              <OptionButton
                label="Entretien régulier"
                description="Garder mon véhicule propre"
                icon={<RefreshCw className="w-5 h-5" />}
                selected={answers.objective === 'entretien'}
                onClick={() => handleObjective('entretien')}
              />
              <OptionButton
                label="Préparation à la revente"
                description="Maximiser la valeur de mon véhicule"
                icon={<Target className="w-5 h-5" />}
                selected={answers.objective === 'revente'}
                onClick={() => handleObjective('revente')}
              />
              <OptionButton
                label="Fin de leasing"
                description="Restitution du véhicule"
                icon={<FileCheck className="w-5 h-5" />}
                selected={answers.objective === 'leasing'}
                onClick={() => handleObjective('leasing')}
              />
              <OptionButton
                label="Remise à neuf"
                description="Récupérer l'éclat d'origine"
                icon={<Sparkles className="w-5 h-5" />}
                selected={answers.objective === 'remise-neuf'}
                onClick={() => handleObjective('remise-neuf')}
              />
            </QuestionCard>
          )}
          
          {currentStep === 'condition' && (
            <QuestionCard 
              question="État actuel du véhicule ?"
              subtitle="Soyez honnête, cela nous aide à prévoir le temps nécessaire"
            >
              <OptionButton
                label="Légèrement sale"
                description="Quelques traces, poussière légère"
                selected={answers.condition === 'leger'}
                onClick={() => handleCondition('leger')}
              />
              <OptionButton
                label="Sale"
                description="Taches, poussière, quelques odeurs"
                selected={answers.condition === 'sale'}
                onClick={() => handleCondition('sale')}
              />
              <OptionButton
                label="Très sale"
                description="Encrassement important, taches incrustées"
                selected={answers.condition === 'tres-sale'}
                onClick={() => handleCondition('tres-sale')}
              />
            </QuestionCard>
          )}
          
          {currentStep === 'interior' && (
            <QuestionCard 
              question="Nettoyage intérieur ?"
              subtitle="Sièges, tableau de bord, vitres intérieures..."
            >
              <OptionButton
                label="Oui"
                description="L'intérieur a besoin d'être nettoyé"
                icon={<Sparkles className="w-5 h-5" />}
                selected={answers.interior === true}
                onClick={() => handleInterior(true)}
              />
              <OptionButton
                label="Non"
                description="L'intérieur est correct"
                selected={answers.interior === false}
                onClick={() => handleInterior(false)}
              />
            </QuestionCard>
          )}
          
          {currentStep === 'exterior' && (
            <QuestionCard 
              question="Nettoyage extérieur ?"
              subtitle="Carrosserie, vitres, jantes..."
            >
              <OptionButton
                label="Oui"
                description="L'extérieur a besoin d'être nettoyé"
                icon={<Droplets className="w-5 h-5" />}
                selected={answers.exterior === true}
                onClick={() => handleExterior(true)}
              />
              <OptionButton
                label="Non"
                description="L'extérieur est correct"
                selected={answers.exterior === false}
                onClick={() => handleExterior(false)}
              />
            </QuestionCard>
          )}
          
          {currentStep === 'time-preference' && (
            <QuestionCard 
              question="Quand souhaitez-vous ?"
              subtitle="Nous adaptons nos disponibilités"
            >
              <OptionButton
                label="Flexible"
                description="Je peux m'adapter à vos créneaux"
                icon={<Clock className="w-5 h-5" />}
                selected={answers.timePreference === 'flexible'}
                onClick={() => handleTimePreference('flexible')}
              />
              <OptionButton
                label="Rapide"
                description="J'ai besoin d'un créneau au plus vite"
                icon={<Zap className="w-5 h-5" />}
                selected={answers.timePreference === 'rapide'}
                onClick={() => handleTimePreference('rapide')}
              />
            </QuestionCard>
          )}
          
          {currentStep === 'recommendation' && selectedPack && (
            <PackRecommendation pack={selectedPack} onSelect={handlePackSelect} />
          )}
          
          {currentStep === 'calendar' && selectedPack && (
            <CalendarPicker duration={selectedPack.duration} onSelect={handleDateSelect} />
          )}
          
          {currentStep === 'client-info' && (
            <ClientForm onSubmit={handleClientSubmit} />
          )}
          
          {currentStep === 'confirmation' && selectedPack && selectedDate && selectedTime && clientData && (
            <ConfirmationView 
              pack={selectedPack}
              date={selectedDate}
              time={selectedTime}
              clientName={clientData.name}
            />
          )}
        </div>
      </main>
    </div>
  );
}
