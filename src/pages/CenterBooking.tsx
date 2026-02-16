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
import { AlertCircle, ChevronLeft, Check, Clock, FileText } from 'lucide-react';
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
  | 'quote-detail'
  | 'quote-form'
  | 'quote-confirmation'
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
      case 'quote-detail':
        if (packs.length > 1) {
          setCurrentStep('select-pack');
        } else {
          setCurrentStep('landing');
        }
        break;
      case 'quote-form':
        setCurrentStep('quote-detail');
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
    
    // Quote-based pack → show detail page
    if (pack.pricing_type === 'quote') {
      setCurrentStep('quote-detail');
      return;
    }
    
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

  const handleQuoteSubmit = async (data: ContactRequestData) => {
    if (!center || !selectedPack) return;
    
    setContactData(data);
    
    const { error } = await createContactRequest({
      center_id: center.id,
      client_name: data.name,
      client_email: data.email,
      client_phone: data.phone,
      client_address: data.address,
      message: data.message,
      request_type: 'quote',
      service_name: selectedPack.name,
    });
    
    if (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer votre demande. Veuillez réessayer.',
        variant: 'destructive',
      });
      return;
    }
    
    setCurrentStep('quote-confirmation');
  };
  
  const showBackButton = currentStep !== 'landing' && currentStep !== 'confirmation' && currentStep !== 'contact-confirmation' && currentStep !== 'quote-confirmation';

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
    console.error('[CenterBooking] Error loading center:', { slug, error, center, userAgent: navigator.userAgent });
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
          <Button variant="outline" onClick={() => window.location.reload()} className="mr-2">
            Réessayer
          </Button>
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

  // Quote detail page (Apple-style presentation like the reference screenshots)
  if (currentStep === 'quote-detail' && selectedPack) {
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left: Main content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Hero image */}
                {selectedPack.image_url && (
                  <div className="rounded-2xl overflow-hidden shadow-lg">
                    <img
                      src={selectedPack.image_url}
                      alt={selectedPack.name}
                      className="w-full aspect-[16/9] object-cover"
                      loading="lazy"
                    />
                  </div>
                )}

                {/* Title (mobile only - desktop shows in sidebar) */}
                <div className="lg:hidden">
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                    {selectedPack.name}
                  </h1>
                </div>

                {/* About section */}
                {selectedPack.description && (
                  <Card variant="elevated" className="p-6 sm:p-8 rounded-2xl">
                    <h2 className="text-xl font-bold text-foreground mb-4">À propos du service</h2>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {selectedPack.description}
                    </p>
                  </Card>
                )}

                {/* Features */}
                {selectedPack.features && selectedPack.features.length > 0 && (
                  <Card variant="elevated" className="p-6 sm:p-8 rounded-2xl">
                    <h2 className="text-xl font-bold text-foreground mb-4">Ce qui est inclus</h2>
                    <ul className="space-y-3">
                      {selectedPack.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}
              </div>

              {/* Right: Sticky sidebar */}
              <div className="lg:col-span-1">
                <div className="lg:sticky lg:top-8">
                  <Card variant="elevated" className="p-6 rounded-2xl space-y-5">
                    <h2 className="text-xl font-bold text-foreground hidden lg:block">{selectedPack.name}</h2>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="w-4 h-4" />
                        <span>Tarification sur devis</span>
                      </div>
                      {selectedPack.duration && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>Durée estimée : {selectedPack.duration}</span>
                        </div>
                      )}
                    </div>

                    <Button 
                      variant="premium" 
                      size="xl" 
                      className="w-full"
                      onClick={() => setCurrentStep('quote-form')}
                    >
                      Obtenir un devis
                    </Button>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Quote request form
  if (currentStep === 'quote-form' && selectedPack) {
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
            <ContactRequestForm 
              onSubmit={handleQuoteSubmit} 
              isSubmitting={submittingContact}
              title={`Demander un devis · ${selectedPack.name}`}
              subtitle="Décrivez votre besoin, nous vous envoyons un devis personnalisé."
              submitLabel="Envoyer ma demande de devis"
            />
          </div>
        </main>
      </div>
    );
  }

  // Quote confirmation
  if (currentStep === 'quote-confirmation' && contactData) {
    return (
      <div className="min-h-screen bg-background">
        <BookingHeader centerName={center.name} />
        <main className="px-4 pb-16 pt-8">
          <div className="max-w-4xl mx-auto">
            <ContactConfirmation 
              clientName={contactData.name} 
              centerName={center.name}
              title="Demande de devis envoyée !"
              message="Nous étudions votre demande et vous envoyons un devis personnalisé dans les plus brefs délais."
            />
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
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {packs.map((pack) => {
                  const isQuote = pack.pricing_type === 'quote';
                  const hasVariants = !isQuote && pack.price_variants && pack.price_variants.length > 0;
                  const minPrice = hasVariants 
                    ? Math.min(...pack.price_variants.map(v => v.price))
                    : pack.price;
                  const priceLabel = isQuote ? 'Sur devis' : (hasVariants ? `dès ${minPrice}€` : `${pack.price}€`);

                  return (
                    <div 
                      key={pack.id}
                      className="group cursor-pointer"
                      onClick={() => handleSelectPack(pack)}
                    >
                      {/* Image */}
                      <div className="relative rounded-2xl overflow-hidden mb-2.5 transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-xl" style={{ aspectRatio: '4/3' }}>
                        {pack.image_url ? (
                          <>
                            <img
                              src={pack.image_url}
                              alt={pack.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            <div className="absolute bottom-0 inset-x-0 p-4">
                              {pack.description && (
                                <p className="text-white/70 text-xs mb-0.5 line-clamp-1">{pack.description}</p>
                              )}
                              <p className="text-white font-bold text-base sm:text-lg leading-tight mb-0.5">
                                {pack.name}
                              </p>
                              <p className="text-white/90 font-semibold text-lg sm:text-xl">
                                {hasVariants ? `dès ${minPrice}€` : `${pack.price}€`}
                              </p>
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full flex flex-col justify-end p-4 bg-gradient-to-br from-secondary/60 to-secondary/20 border border-border/40 rounded-2xl">
                            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-auto mt-3">
                              <span className="text-xl font-bold text-primary">
                                {pack.name.charAt(0)}
                              </span>
                            </div>
                            {pack.description && (
                              <p className="text-muted-foreground text-xs mb-0.5 line-clamp-1">{pack.description}</p>
                            )}
                            <p className="font-bold text-base sm:text-lg text-foreground leading-tight mb-0.5">
                              {pack.name}
                            </p>
                            <p className="font-semibold text-lg text-primary">
                              {hasVariants ? `dès ${minPrice}€` : `${pack.price}€`}
                            </p>
                          </div>
                        )}
                      </div>
                      {/* Info below */}
                      <div className="flex items-center justify-between px-1">
                        {pack.duration && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {pack.duration}
                          </p>
                        )}
                        {hasVariants && (
                          <p className="text-xs text-muted-foreground">
                            {pack.price_variants.length} options
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Variant Selection */}
          {currentStep === 'select-variant' && selectedPack && (
            <div className="max-w-3xl mx-auto">
              {/* Hero image */}
              {selectedPack.image_url && (
                <div className="rounded-2xl overflow-hidden mb-8 shadow-lg">
                  <img
                    src={selectedPack.image_url}
                    alt={selectedPack.name}
                    className="w-full aspect-[16/9] sm:aspect-[2/1] object-cover"
                    loading="lazy"
                  />
                </div>
              )}

              {/* Title & description */}
              <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                  {selectedPack.name}
                </h1>
                {selectedPack.description && (
                  <p className="text-muted-foreground text-base">
                    {selectedPack.description}
                  </p>
                )}
              </div>

              {/* Features as specs row */}
              {selectedPack.features && selectedPack.features.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                  {selectedPack.features.map((feature, i) => (
                    <div 
                      key={i} 
                      className="flex items-center gap-2.5 p-3 rounded-xl bg-secondary/30"
                    >
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Duration info */}
              {selectedPack.duration && (
                <div className="flex items-center gap-2 text-muted-foreground mb-6">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Durée estimée : {selectedPack.duration}</span>
                </div>
              )}

              {/* Variant selection heading */}
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-foreground">
                  Sélectionnez votre catégorie
                </h2>
              </div>

              {/* Variants grid - Apple style cards */}
              <div className="grid grid-cols-2 gap-3">
                {selectedPack.price_variants.map((variant, index) => (
                  <Card 
                    key={index}
                    variant="elevated"
                    className={`p-4 sm:p-5 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
                      selectedVariant?.name === variant.name ? 'ring-2 ring-primary shadow-lg' : ''
                    }`}
                    onClick={() => handleSelectVariant(variant)}
                  >
                    <p className="font-semibold text-sm sm:text-base text-foreground uppercase tracking-wide mb-1">
                      {variant.name}
                    </p>
                    {selectedPack.duration && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mb-3">
                        <Clock className="w-3 h-3" />
                        {selectedPack.duration}
                      </p>
                    )}
                    <p className="text-2xl sm:text-3xl font-bold text-foreground">
                      {variant.price}€
                    </p>
                  </Card>
                ))}
              </div>
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