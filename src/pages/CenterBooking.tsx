import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BookingHeader } from '@/components/booking/BookingHeader';
import { ProgressBar } from '@/components/booking/ProgressBar';
import { QuestionCard } from '@/components/booking/QuestionCard';
import { OptionButton } from '@/components/booking/OptionButton';
import { PackRecommendation } from '@/components/booking/PackRecommendation';
import { CalendarPicker } from '@/components/booking/CalendarPicker';
import { ClientForm, ClientData } from '@/components/booking/ClientForm';
import { ConfirmationView } from '@/components/booking/ConfirmationView';
import { CenterLanding } from '@/components/booking/CenterLanding';
import { ContactRequestForm, ContactRequestData } from '@/components/booking/ContactRequestForm';
import { ContactConfirmation } from '@/components/booking/ContactConfirmation';
import { BookingAnswers, VehicleType, CleaningObjective, VehicleCondition, TimePreference } from '@/types/booking';
import { useCenterBySlug, Pack } from '@/hooks/useCenter';
import { useCreateAppointment } from '@/hooks/useAppointments';
import { useCreateContactRequest } from '@/hooks/useContactRequests';
import { Car, Truck, Target, RefreshCw, FileCheck, Sparkles, Droplets, Clock, Zap, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

type BookingStep = 
  | 'landing'
  | 'contact-form'
  | 'contact-confirmation'
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

// Recommandation de pack basée sur les réponses
function recommendPack(answers: BookingAnswers, packs: Pack[]): Pack | null {
  if (packs.length === 0) return null;
  
  const sortedPacks = [...packs].sort((a, b) => a.price - b.price);
  const { objective, condition, interior, exterior } = answers;
  
  if (objective === 'remise-neuf' || objective === 'revente') {
    return sortedPacks[sortedPacks.length - 1]; // Le plus cher
  }
  
  if (condition === 'tres-sale') {
    return sortedPacks[sortedPacks.length - 1];
  }
  
  if (condition === 'sale' || (interior && exterior)) {
    return sortedPacks[Math.floor(sortedPacks.length / 2)] || sortedPacks[0];
  }
  
  if (objective === 'leasing') {
    return sortedPacks[Math.floor(sortedPacks.length / 2)] || sortedPacks[0];
  }
  
  return sortedPacks[0]; // Le moins cher
}

export default function CenterBooking() {
  const { slug } = useParams<{ slug: string }>();
  const { center, packs, loading, error } = useCenterBySlug(slug || '');
  const { createAppointment, loading: submitting } = useCreateAppointment();
  const { createContactRequest, loading: submittingContact } = useCreateContactRequest();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState<BookingStep>('landing');
  const [answers, setAnswers] = useState<BookingAnswers>({});
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [contactData, setContactData] = useState<ContactRequestData | null>(null);
  
  // Determine if center is Pro (has subscription_plan === 'pro')
  const isPro = center?.subscription_plan === 'pro';
  
  const goToPrevStep = () => {
    if (currentStep === 'contact-form') {
      setCurrentStep('landing');
    } else if (currentStep === 'vehicle-type') {
      setCurrentStep('landing');
    } else {
      // Pro flow navigation
      const proSteps: BookingStep[] = ['landing', 'vehicle-type', 'objective', 'condition', 'interior', 'exterior', 'time-preference', 'recommendation', 'calendar', 'client-info', 'confirmation'];
      const currentIndex = proSteps.indexOf(currentStep);
      if (currentIndex > 0) {
        setCurrentStep(proSteps[currentIndex - 1]);
      }
    }
  };

  const handleStartBooking = () => {
    if (isPro && packs.length > 0) {
      // Pro flow: start questionnaire
      setCurrentStep('vehicle-type');
    } else {
      // Free flow: show contact form
      setCurrentStep('contact-form');
    }
  };
  
  const handleVehicleType = (type: VehicleType) => {
    setAnswers({ ...answers, vehicleType: type });
    setCurrentStep('objective');
  };
  
  const handleObjective = (objective: CleaningObjective) => {
    setAnswers({ ...answers, objective });
    setCurrentStep('condition');
  };
  
  const handleCondition = (condition: VehicleCondition) => {
    setAnswers({ ...answers, condition });
    setCurrentStep('interior');
  };
  
  const handleInterior = (interior: boolean) => {
    setAnswers({ ...answers, interior });
    setCurrentStep('exterior');
  };
  
  const handleExterior = (exterior: boolean) => {
    setAnswers({ ...answers, exterior });
    setCurrentStep('time-preference');
  };
  
  const handleTimePreference = (preference: TimePreference) => {
    const newAnswers = { ...answers, timePreference: preference };
    setAnswers(newAnswers);
    const pack = recommendPack(newAnswers, packs);
    setSelectedPack(pack);
    setCurrentStep('recommendation');
  };
  
  const handlePackSelect = () => {
    setCurrentStep('calendar');
  };
  
  const handleDateSelect = (date: Date, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setCurrentStep('client-info');
  };
  
  const handleClientSubmit = async (data: ClientData) => {
    if (!center || !selectedPack || !selectedDate || !selectedTime) return;
    
    setClientData(data);
    
    const { error } = await createAppointment({
      center_id: center.id,
      pack_id: selectedPack.id,
      client_name: data.name,
      client_email: data.email,
      client_phone: data.phone,
      vehicle_type: answers.vehicleType || 'berline',
      appointment_date: selectedDate.toISOString().split('T')[0],
      appointment_time: selectedTime,
      notes: data.notes,
    });
    
    if (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de créer le rendez-vous. Veuillez réessayer.',
        variant: 'destructive',
      });
      return;
    }
    
    setCurrentStep('confirmation');
  };

  const handleContactSubmit = async (data: ContactRequestData) => {
    if (!center) return;
    
    setContactData(data);
    
    const { error } = await createContactRequest({
      center_id: center.id,
      client_name: data.name,
      client_phone: data.phone,
      message: data.message,
    });
    
    if (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer votre demande. Veuillez réessayer.',
        variant: 'destructive',
      });
      return;
    }
    
    setCurrentStep('contact-confirmation');
  };
  
  const showBackButton = currentStep !== 'landing' && currentStep !== 'confirmation' && currentStep !== 'contact-confirmation';
  
  // Calculate progress for Pro questionnaire
  const proQuestionSteps = ['vehicle-type', 'objective', 'condition', 'interior', 'exterior', 'time-preference'];
  const isInQuestionFlow = proQuestionSteps.includes(currentStep);
  const currentQuestionNumber = proQuestionSteps.indexOf(currentStep) + 1;
  const totalQuestionSteps = proQuestionSteps.length;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="px-4 py-8 max-w-4xl mx-auto">
          <Skeleton className="h-12 w-48 mb-8" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !center) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card variant="elevated" className="p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-xl font-semibold text-foreground mb-2">Centre non trouvé</h1>
          <p className="text-muted-foreground mb-6">
            Ce lien n'existe pas ou a été désactivé.
          </p>
          <Link to="/">
            <Button variant="outline">Retour à l'accueil</Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Landing page
  if (currentStep === 'landing') {
    return (
      <CenterLanding 
        center={center} 
        onStartBooking={handleStartBooking}
        hasPacks={packs.length > 0}
        isPro={isPro}
      />
    );
  }

  // Free flow: Contact form
  if (currentStep === 'contact-form') {
    return (
      <div className="min-h-screen bg-background">
        <BookingHeader centerName={center.name} />
        <main className="px-4 pb-16 pt-8">
          <div className="max-w-4xl mx-auto">
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
            <ContactRequestForm onSubmit={handleContactSubmit} isSubmitting={submittingContact} />
          </div>
        </main>
      </div>
    );
  }

  // Free flow: Contact confirmation
  if (currentStep === 'contact-confirmation' && contactData) {
    return (
      <div className="min-h-screen bg-background">
        <BookingHeader centerName={center.name} />
        <main className="px-4 pb-16 pt-8">
          <div className="max-w-4xl mx-auto">
            <ContactConfirmation clientName={contactData.name} centerName={center.name} />
          </div>
        </main>
      </div>
    );
  }

  // Convert Pack from hook to Pack type expected by PackRecommendation
  const packForRecommendation = selectedPack ? {
    id: selectedPack.id,
    name: selectedPack.name,
    description: selectedPack.description || '',
    duration: selectedPack.duration || '1h',
    price: selectedPack.price,
    features: selectedPack.features || [],
  } : null;
  
  return (
    <div className="min-h-screen bg-background">
      <BookingHeader centerName={center.name} welcomeMessage={center.welcome_message} />
      
      <main className="px-4 pb-16 pt-8">
        <div className="max-w-4xl mx-auto">
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
          
          {isInQuestionFlow && (
            <ProgressBar currentStep={currentQuestionNumber} totalSteps={totalQuestionSteps} />
          )}
          
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
          
          {currentStep === 'recommendation' && packForRecommendation && (
            <PackRecommendation pack={packForRecommendation} onSelect={handlePackSelect} />
          )}
          
          {currentStep === 'calendar' && packForRecommendation && (
            <CalendarPicker duration={packForRecommendation.duration} onSelect={handleDateSelect} />
          )}
          
          {currentStep === 'client-info' && (
            <ClientForm onSubmit={handleClientSubmit} isSubmitting={submitting} />
          )}
          
          {currentStep === 'confirmation' && packForRecommendation && selectedDate && selectedTime && clientData && (
            <ConfirmationView 
              pack={packForRecommendation}
              date={selectedDate}
              time={selectedTime}
              clientName={clientData.name}
              centerName={center.name}
              centerAddress={center.address}
            />
          )}
        </div>
      </main>
    </div>
  );
}
