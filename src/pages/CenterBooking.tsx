import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BookingHeader } from '@/components/booking/BookingHeader';
import { CalendarPicker } from '@/components/booking/CalendarPicker';
import { ClientForm, ClientData } from '@/components/booking/ClientForm';
import { ConfirmationView } from '@/components/booking/ConfirmationView';
import { CenterLanding, RecognizedClient } from '@/components/booking/CenterLanding';
import { ContactRequestForm, ContactRequestData } from '@/components/booking/ContactRequestForm';
import { ClientLookupInline } from '@/components/booking/ClientLookupInline';
import { ContactConfirmation } from '@/components/booking/ContactConfirmation';
import { useCenterBySlug, Pack, PriceVariant } from '@/hooks/useCenter';
import { useCreateAppointment } from '@/hooks/useAppointments';
import { useCreateContactRequest } from '@/hooks/useContactRequests';
import { AlertCircle, ChevronLeft, Check, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useSEO } from '@/hooks/useSEO';
import { LocalBusinessSchema } from '@/components/seo/LocalBusinessSchema';

type BookingStep = 
  | 'landing'
  | 'contact-form'
  | 'contact-confirmation'
  | 'select-pack'
  | 'select-variant'
  | 'calendar'
  | 'client-info'
  | 'confirmation';

export default function CenterBooking() {
  const { slug } = useParams<{ slug: string }>();
  const { center, packs, availability, loading, error } = useCenterBySlug(slug || '');
  const { createAppointment, loading: submitting } = useCreateAppointment();
  const { createContactRequest, loading: submittingContact } = useCreateContactRequest();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState<BookingStep>('landing');
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<PriceVariant | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [contactData, setContactData] = useState<ContactRequestData | null>(null);
  
  // Recognized client state
  const [recognizedClient, setRecognizedClient] = useState<RecognizedClient | null>(null);
  
  // Determine if center is Pro or Trial (has active subscription)
  const isPro = center?.subscription_plan === 'pro' || center?.subscription_plan === 'trial';
  
  // SEO: Extract city from address for local SEO
  const extractCity = (address: string | null): string | null => {
    if (!address) return null;
    // Try to extract city from address (usually after last comma or before postal code)
    const parts = address.split(',').map(p => p.trim());
    if (parts.length >= 2) {
      // Usually format is "Street, Postal City" or "Street, City, Country"
      const cityPart = parts[parts.length - 1];
      // Remove postal code if present (5 digits for France)
      const cityWithoutPostal = cityPart.replace(/^\d{5}\s*/, '').trim();
      return cityWithoutPostal || parts[parts.length - 2];
    }
    return parts[0];
  };

  const city = center?.customization?.seo?.city || (center ? extractCity(center.address) : null);
  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
  
  // Use custom SEO from center or fallback to generated
  const customSeo = center?.customization?.seo;
  
  // SEO title: custom > generated
  const seoTitle = customSeo?.title 
    || (center 
      ? `${center.name}${city ? ` - Nettoyage à ${city}` : ' - Nettoyage professionnel'} | CleaningPage`
      : 'CleaningPage - Service de nettoyage professionnel');
  
  // SEO description: custom > generated
  const seoDescription = customSeo?.description
    || (center
      ? `${center.name}${city ? ` à ${city}` : ''} : réservez votre nettoyage professionnel en ligne. Devis gratuit, prise de rendez-vous rapide. ${city ? `Nettoyage ${city} - ` : ''}Service de qualité.`
      : 'CleaningPage - Réservez votre nettoyage professionnel en ligne. Devis gratuit et prise de rendez-vous rapide.');
  
  useSEO({
    title: seoTitle,
    description: seoDescription,
    canonical: pageUrl,
    ogImage: center?.logo_url || undefined,
    keywords: customSeo?.keywords || undefined,
  });
  const goToPrevStep = () => {
    switch (currentStep) {
      case 'contact-form':
        setCurrentStep('landing');
        break;
      case 'select-pack':
        setCurrentStep('landing');
        break;
      case 'select-variant':
        if (packs.length > 1) {
          setCurrentStep('select-pack');
        } else {
          setCurrentStep('landing');
        }
        break;
      case 'calendar':
        if (recognizedClient?.service_id) {
          // Was in recognized client flow, go back to landing
          setCurrentStep('landing');
        } else if (selectedPack?.price_variants && selectedPack.price_variants.length > 0) {
          setCurrentStep('select-variant');
        } else if (packs.length > 1) {
          setCurrentStep('select-pack');
        } else {
          setCurrentStep('landing');
        }
        break;
      case 'client-info':
        setCurrentStep('calendar');
        break;
      default:
        setCurrentStep('landing');
    }
  };

  const handleRecognizedClient = (client: RecognizedClient) => {
    setRecognizedClient(client);
    if (client.service_id) {
      // Client has a custom service → go directly to calendar
      setCurrentStep('calendar');
    }
    // If no service, CenterLanding calls onStartBooking which goes to pack selection
  };

  const handleStartBooking = () => {
    if (isPro && packs.length > 0) {
      if (packs.length === 1) {
        const pack = packs[0];
        setSelectedPack(pack);
        if (pack.price_variants && pack.price_variants.length > 0) {
          setCurrentStep('select-variant');
        } else {
          setCurrentStep('calendar');
        }
      } else {
        setCurrentStep('select-pack');
      }
    } else {
      setCurrentStep('contact-form');
    }
  };

  const handleSelectPack = (pack: Pack) => {
    setSelectedPack(pack);
    setSelectedVariant(null);
    if (pack.price_variants && pack.price_variants.length > 0) {
      setCurrentStep('select-variant');
    } else {
      setCurrentStep('calendar');
    }
  };

  const handleSelectVariant = (variant: PriceVariant) => {
    setSelectedVariant(variant);
    setCurrentStep('calendar');
  };
  
  const handleDateSelect = (date: Date, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setCurrentStep('client-info');
  };
  
  const handleClientSubmit = async (data: ClientData) => {
    if (!center || !selectedDate || !selectedTime) return;
    
    setClientData(data);
    
    // Recognized client with custom service
    if (recognizedClient?.service_id) {
      const { error } = await createAppointment({
        center_id: center.id,
        pack_id: '', // no pack
        client_name: data.name,
        client_email: data.email,
        client_phone: data.phone,
        client_address: data.address,
        vehicle_type: 'custom',
        appointment_date: `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`,
        appointment_time: selectedTime,
        notes: data.notes,
        duration: `${recognizedClient.service_duration_minutes}min`,
        pack_name: recognizedClient.service_name || 'Prestation personnalisée',
        price: recognizedClient.service_price || 0,
        // Pass custom service data
        custom_service_id: recognizedClient.service_id,
        client_id: recognizedClient.client_id,
        custom_price: recognizedClient.service_price,
      });
      
      if (error) {
        toast({ title: 'Erreur', description: 'Impossible de créer le rendez-vous.', variant: 'destructive' });
        return;
      }
      setCurrentStep('confirmation');
      return;
    }
    
    // Standard pack flow
    if (!selectedPack) return;
    
    const finalPrice = selectedVariant?.price || selectedPack.price;
    
    const { error } = await createAppointment({
      center_id: center.id,
      pack_id: selectedPack.id,
      client_name: data.name,
      client_email: data.email,
      client_phone: data.phone,
      client_address: data.address,
      vehicle_type: selectedVariant?.name || 'berline',
      appointment_date: `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`,
      appointment_time: selectedTime,
      notes: data.notes,
      duration: selectedPack.duration || '1h',
      pack_name: selectedPack.name,
      variant_name: selectedVariant?.name,
      price: finalPrice,
    });
    
    if (error) {
      toast({ title: 'Erreur', description: 'Impossible de créer le rendez-vous.', variant: 'destructive' });
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
      client_email: data.email,
      client_phone: data.phone,
      client_address: data.address,
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

  // Get final price (variant or pack base price)
  const finalPrice = selectedVariant?.price || selectedPack?.price || 0;

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

  // Error state - center not found
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

  // Subscription expired - page inaccessible
  if (!isPro) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card variant="elevated" className="p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-semibold text-foreground mb-2">Page temporairement indisponible</h1>
          <p className="text-muted-foreground mb-6">
            Cette page n'est plus accessible pour le moment.
          </p>
          <Link to="/">
            <Button variant="outline">Retour à l'accueil</Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Prepare opening hours for schema
  const openingHours = availability?.map(a => ({
    dayOfWeek: a.day_of_week,
    opens: a.start_time,
    closes: a.end_time,
  })) || [];

  // Landing page
  if (currentStep === 'landing') {
    return (
      <>
        <LocalBusinessSchema
          name={center.name}
          description={`Service de nettoyage professionnel${city ? ` à ${city}` : ''}`}
          address={center.address || undefined}
          city={city || undefined}
          phone={center.phone || undefined}
          email={center.email || undefined}
          url={pageUrl}
          image={center.logo_url || undefined}
          openingHours={openingHours}
        />
        <CenterLanding 
          center={center}
          packs={packs}
          onStartBooking={handleStartBooking}
          onSelectPack={handleSelectPack}
          onRecognizedClient={handleRecognizedClient}
          hasPacks={packs.length > 0}
          isPro={isPro}
        />
      </>
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

  // Pack data for views (standard or recognized client)
  const packData = recognizedClient?.service_id
    ? {
        id: recognizedClient.service_id,
        name: recognizedClient.service_name || 'Prestation personnalisée',
        description: '',
        duration: `${recognizedClient.service_duration_minutes || 60}min`,
        price: recognizedClient.service_price || 0,
        features: [],
      }
    : selectedPack ? {
        id: selectedPack.id,
        name: selectedPack.name,
        description: selectedPack.description || '',
        duration: selectedPack.duration || '1h',
        price: finalPrice,
        features: selectedPack.features || [],
      } : null;
  
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
          
          {/* Pack Selection */}
          {currentStep === 'select-pack' && (
            <div>
              <div className="text-center mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                  Choisissez votre formule
                </h1>
                <p className="text-muted-foreground">
                  Sélectionnez la prestation qui vous convient
                </p>
              </div>

              {/* Client recognition in pack selection */}
              {!recognizedClient && (
                <ClientLookupInline
                  centerId={center.id}
                  onRecognizedClient={(client) => {
                    setRecognizedClient(client);
                    if (client.service_id) {
                      setCurrentStep('calendar');
                    }
                  }}
                />
              )}
              
              <div className="grid gap-4 sm:grid-cols-2">
                {packs.map((pack) => {
                  const hasVariants = pack.price_variants && pack.price_variants.length > 0;
                  const minPrice = hasVariants 
                    ? Math.min(...pack.price_variants.map(v => v.price))
                    : pack.price;

                  return (
                    <Card 
                      key={pack.id}
                      variant="elevated"
                      className={`p-5 sm:p-6 cursor-pointer transition-all hover:shadow-lg hover:border-primary/40 ${
                        selectedPack?.id === pack.id ? 'border-primary ring-2 ring-primary/20' : ''
                      }`}
                      onClick={() => handleSelectPack(pack)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-lg text-foreground">{pack.name}</h3>
                          {pack.description && (
                            <p className="text-sm text-muted-foreground mt-1">{pack.description}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-foreground">{minPrice}€</p>
                          {hasVariants && (
                            <p className="text-xs text-muted-foreground">à partir de</p>
                          )}
                          {pack.duration && !hasVariants && (
                            <p className="text-sm text-muted-foreground">{pack.duration}</p>
                          )}
                        </div>
                      </div>
                      
                      {hasVariants && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {pack.price_variants.slice(0, 3).map((v, i) => (
                            <span key={i} className="text-xs bg-secondary/50 px-2 py-1 rounded">
                              {v.name}: {v.price}€
                            </span>
                          ))}
                          {pack.price_variants.length > 3 && (
                            <span className="text-xs text-muted-foreground px-2 py-1">
                              +{pack.price_variants.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                      
                      {pack.features && pack.features.length > 0 && (
                        <ul className="space-y-1.5 mt-4 pt-4 border-t border-border/50">
                          {pack.features.slice(0, 4).map((feature, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Check className="w-4 h-4 text-primary flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Variant Selection */}
          {currentStep === 'select-variant' && selectedPack && (
            <div>
              <div className="text-center mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                  {selectedPack.name}
                </h1>
                <p className="text-muted-foreground">
                  Sélectionnez votre catégorie
                </p>
              </div>
              
              <div className="grid gap-3 sm:grid-cols-2">
                {selectedPack.price_variants.map((variant, index) => (
                  <Card 
                    key={index}
                    variant="elevated"
                    className={`p-5 cursor-pointer transition-all hover:shadow-lg hover:border-primary/40 ${
                      selectedVariant?.name === variant.name ? 'border-primary ring-2 ring-primary/20' : ''
                    }`}
                    onClick={() => handleSelectVariant(variant)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-lg text-foreground">{variant.name}</h3>
                        {selectedPack.duration && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <Clock className="w-4 h-4" />
                            {selectedPack.duration}
                          </p>
                        )}
                      </div>
                      <p className="text-2xl font-bold text-foreground">{variant.price}€</p>
                    </div>
                  </Card>
                ))}
              </div>

              {selectedPack.features && selectedPack.features.length > 0 && (
                <Card variant="elevated" className="mt-6 p-5">
                  <p className="text-sm font-medium text-foreground mb-3">Ce qui est inclus :</p>
                  <ul className="grid sm:grid-cols-2 gap-2">
                    {selectedPack.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </div>
          )}
          
          {/* Calendar */}
          {currentStep === 'calendar' && packData && (
            <div>
              <div className="text-center mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                  Choisissez votre créneau
                </h1>
                <p className="text-muted-foreground">
                  {packData.name}
                  {selectedVariant && ` • ${selectedVariant.name}`}
                  {` • ${packData.price}€`}
                </p>
              </div>
              <CalendarPicker duration={packData.duration} onSelect={handleDateSelect} centerId={center?.id} />
            </div>
          )}
          
          {/* Client Info */}
          {currentStep === 'client-info' && (
            <ClientForm 
              onSubmit={handleClientSubmit} 
              isSubmitting={submitting}
              defaultValues={recognizedClient ? {
                name: recognizedClient.client_name || '',
                phone: recognizedClient.client_phone || '',
                email: recognizedClient.client_email || '',
                address: recognizedClient.client_address || '',
              } : undefined}
            />
          )}
          
          {/* Confirmation */}
          {currentStep === 'confirmation' && packData && selectedDate && selectedTime && clientData && (
            <ConfirmationView 
              pack={packData}
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