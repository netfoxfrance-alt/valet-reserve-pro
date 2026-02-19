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

// Rich description renderer — supports HTML (from TipTap) and legacy markdown
function RichDescription({ text }: { text: string }) {
  // If text contains HTML tags, render as HTML
  if (text.includes('<') && text.includes('>')) {
    return (
      <div 
      className="prose prose-sm prose-neutral max-w-none [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-foreground [&_h1]:mt-6 [&_h1]:mb-2 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mt-6 [&_h2]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mt-4 [&_h3]:mb-1 [&_p]:text-muted-foreground [&_p]:leading-relaxed [&_strong]:text-foreground [&_ul]:space-y-1 [&_li]:text-muted-foreground"
        dangerouslySetInnerHTML={{ __html: text }} 
      />
    );
  }

  // Legacy markdown fallback
  const lines = text.split('\n');
  return (
    <div className="space-y-3">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-2" />;
        if (trimmed.startsWith('## ')) return <h3 key={i} className="text-xl font-bold text-foreground mt-6 mb-2">{trimmed.slice(3)}</h3>;
        if (trimmed.startsWith('### ')) return <h4 key={i} className="text-lg font-semibold text-foreground mt-4 mb-1">{trimmed.slice(4)}</h4>;
        if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
          return (
            <div key={i} className="flex items-start gap-2 pl-1">
              <span className="text-primary mt-1.5 text-xs">●</span>
              <span className="text-muted-foreground">{renderInline(trimmed.slice(2))}</span>
            </div>
          );
        }
        return <p key={i} className="text-muted-foreground leading-relaxed">{renderInline(trimmed)}</p>;
      })}
    </div>
  );
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

type BookingStep = 
  | 'landing'
  | 'contact-form'
  | 'contact-confirmation'
  | 'pack-detail'
  | 'quote-detail'
  | 'quote-form'
  | 'quote-confirmation'
  | 'select-pack'
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
      case 'pack-detail':
        if (packs.length > 1) {
          setCurrentStep('select-pack');
        } else {
          setCurrentStep('landing');
        }
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
      case 'calendar':
        if (recognizedClient?.service_id) {
          setCurrentStep('landing');
        } else if (selectedPack?.pricing_type === 'quote') {
          setCurrentStep('quote-detail');
        } else {
          setCurrentStep('pack-detail');
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
        if (pack.pricing_type === 'quote') {
          setCurrentStep('quote-detail');
        } else {
          setCurrentStep('pack-detail');
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
    
    // Quote-based pack → show quote detail page
    if (pack.pricing_type === 'quote') {
      setCurrentStep('quote-detail');
      return;
    }
    
    // All fixed-price packs → show detail page
    setCurrentStep('pack-detail');
  };

  const handleSelectVariant = (variant: PriceVariant) => {
    setSelectedVariant(variant);
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
      images: data.images,
      client_type: data.client_type,
      company_name: data.company_name,
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
      images: data.images,
      client_type: data.client_type,
      company_name: data.company_name,
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

  // Fixed-price pack detail page (inspired by reference design)
  if (currentStep === 'pack-detail' && selectedPack) {
    const hasVariants = selectedPack.price_variants && selectedPack.price_variants.length > 0;
    const minPrice = hasVariants 
      ? Math.min(...selectedPack.price_variants.map(v => v.price))
      : selectedPack.price;

    return (
      <div className="min-h-screen bg-background">
        <BookingHeader centerName={center.name} />
        <main className="px-4 sm:px-6 pb-16 pt-8">
          <div className="max-w-5xl mx-auto">
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

            {/* Hero: Image left + Info right on desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-start">
              {/* Left: Image */}
              {selectedPack.image_url ? (
                <div className="rounded-3xl overflow-hidden">
                  <img
                    src={selectedPack.image_url}
                    alt={selectedPack.name}
                    className="w-full aspect-[4/3] object-cover"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="rounded-3xl bg-secondary/20 aspect-[4/3] flex items-center justify-center">
                  <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <span className="text-3xl font-bold text-primary">{selectedPack.name.charAt(0)}</span>
                  </div>
                </div>
              )}

              {/* Right: Info + Tarifs + CTA */}
              <div className="flex flex-col justify-center space-y-5 lg:py-4">
                <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-foreground tracking-tight leading-[1.1]">
                  {selectedPack.name}
                </h1>

                {selectedPack.description && !selectedPack.description.includes('\n') && !selectedPack.description.includes('<') && (
                  <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                    {selectedPack.description}
                  </p>
                )}

                {/* Pricing card with variant selection */}
                <Card variant="elevated" className="p-5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Tarifs (TTC)</p>
                  {hasVariants ? (
                    <div className="space-y-2">
                      {selectedPack.price_variants.map((variant, i) => (
                        <div 
                          key={i} 
                          className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                            selectedVariant?.name === variant.name 
                              ? 'bg-primary/10 ring-2 ring-primary' 
                              : 'hover:bg-secondary/50'
                          }`}
                          onClick={() => setSelectedVariant(variant)}
                        >
                          <span className="text-sm font-medium text-foreground">{variant.name}</span>
                          <span className="text-base font-bold text-foreground">{variant.price}€</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm text-foreground">Prix</span>
                      <span className="text-2xl font-bold text-foreground">{selectedPack.price}€</span>
                    </div>
                  )}
                </Card>

                {selectedPack.duration && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Durée estimée : {selectedPack.duration}</span>
                  </div>
                )}

                <Button 
                  variant="premium" 
                  size="xl" 
                  className="w-full sm:w-auto sm:px-12 mt-2"
                  disabled={hasVariants && !selectedVariant}
                  onClick={() => setCurrentStep('calendar')}
                >
                  Réserver
                </Button>
                {hasVariants && !selectedVariant && (
                  <p className="text-xs text-muted-foreground">Sélectionnez une catégorie ci-dessus</p>
                )}
              </div>
            </div>

            {/* Features grid */}
            {selectedPack.features && selectedPack.features.length > 0 && (
              <div className="mt-12 lg:mt-16">
                <h2 className="text-xl font-semibold text-foreground mb-6">Ce qui est inclus</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {selectedPack.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/30">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Full description */}
            {selectedPack.description && (selectedPack.description.includes('\n') || selectedPack.description.includes('<')) && (
              <div className="mt-12 lg:mt-16 max-w-3xl">
                <h2 className="text-xl font-semibold text-foreground mb-4">À propos</h2>
                <RichDescription text={selectedPack.description} />
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // Quote detail page (Apple-style presentation)
  if (currentStep === 'quote-detail' && selectedPack) {
    return (
      <div className="min-h-screen bg-background">
        <BookingHeader centerName={center.name} />
        <main className="px-4 sm:px-6 pb-16 pt-8">
          <div className="max-w-5xl mx-auto">
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

            {/* Hero: Image left + Info right on desktop, stacked on mobile */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-start">
              {/* Left: Image */}
              {selectedPack.image_url ? (
                <div className="rounded-3xl overflow-hidden">
                  <img
                    src={selectedPack.image_url}
                    alt={selectedPack.name}
                    className="w-full aspect-[4/3] object-cover"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="rounded-3xl bg-secondary/20 aspect-[4/3] flex items-center justify-center">
                  <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <span className="text-3xl font-bold text-primary">{selectedPack.name.charAt(0)}</span>
                  </div>
                </div>
              )}

              {/* Right: Name, description, CTA */}
              <div className="flex flex-col justify-center space-y-5 lg:py-4">
                <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-foreground tracking-tight leading-[1.1]">
                  {selectedPack.name}
                </h1>

                {selectedPack.description && (
                  <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                    {selectedPack.description.split('\n')[0].replace(/[*#\-]/g, '').trim()}
                  </p>
                )}

                <Card variant="elevated" className="p-5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Tarif</p>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm text-foreground">Prix</span>
                    <span className="text-lg font-bold text-primary">Sur devis</span>
                  </div>
                </Card>

                {selectedPack.duration && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Durée estimée : {selectedPack.duration}</span>
                  </div>
                )}

                <Button 
                  variant="premium" 
                  size="xl" 
                  className="w-full sm:w-auto sm:px-12 mt-2"
                  onClick={() => setCurrentStep('quote-form')}
                >
                  Obtenir un devis
                </Button>
              </div>
            </div>

            {/* Features section */}
            {selectedPack.features && selectedPack.features.length > 0 && (
              <div className="mt-12 lg:mt-16">
                <h2 className="text-xl font-semibold text-foreground mb-6">Ce qui est inclus</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {selectedPack.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/30">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Full description below */}
            {selectedPack.description && (selectedPack.description.includes('\n') || selectedPack.description.includes('<')) && (
              <div className="mt-12 lg:mt-16 max-w-3xl">
                <h2 className="text-xl font-semibold text-foreground mb-4">À propos</h2>
                <RichDescription text={selectedPack.description} />
              </div>
            )}
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
              precisionMessage={center.quote_form_message || undefined}
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
                                {isQuote ? 'Sur devis' : hasVariants ? `dès ${minPrice}€` : `${pack.price}€`}
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
                              {isQuote ? 'Sur devis' : hasVariants ? `dès ${minPrice}€` : `${pack.price}€`}
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