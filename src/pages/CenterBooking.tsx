import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
import { AlertCircle, ChevronLeft, Check, Clock, FileText, MapPin, Home, Building2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useSEO } from '@/hooks/useSEO';
import { LocalBusinessSchema } from '@/components/seo/LocalBusinessSchema';

// ── Types ────────────────────────────────────────────────
interface SelectedOption {
  id: string;
  name: string;
  price: number;
  duration_minutes: number;
}

// ── Rich description renderer ────────────────────────────
function RichDescription({ text }: { text: string }) {
  if (text.includes('<') && text.includes('>')) {
    return (
      <div 
        className="max-w-none [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-foreground [&_h1]:mt-6 [&_h1]:mb-3 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mt-5 [&_h3]:mb-2 [&_p]:text-muted-foreground [&_p]:leading-relaxed [&_p]:mb-1 [&_p:empty]:min-h-[0.75em] [&_p:empty]:mb-1 [&_strong]:text-foreground [&_strong]:font-semibold [&_em]:italic [&_u]:underline [&_ul]:space-y-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_li]:text-muted-foreground [&_ol]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4 [&_hr]:my-6 [&_hr]:border-border text-sm"
        dangerouslySetInnerHTML={{ __html: text }}
      />
    );
  }
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
  | 'select-options'
  | 'calendar'
  | 'client-info'
  | 'confirmation';

export default function CenterBooking() {
  const { slug } = useParams<{ slug: string }>();

  const parseDurationString = (duration: string): number => {
    const hoursMatch = duration.match(/(\d+)h/);
    const minutesMatch = duration.match(/(\d+)(?:min|m(?!h))/);
    const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
    const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;
    return hours * 60 + minutes || 60;
  };

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
  const [lastAppointmentId, setLastAppointmentId] = useState<string | null>(null);
  const [recognizedClient, setRecognizedClient] = useState<RecognizedClient | null>(null);
  
  // New: options & location
  const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([]);
  const [availableOptions, setAvailableOptions] = useState<SelectedOption[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<'on_site' | 'at_home' | null>(null);
  const [autoSubmitting, setAutoSubmitting] = useState(false);

  const isPro = center?.subscription_plan === 'pro' || center?.subscription_plan === 'trial';
  
  // SEO
  const extractCity = (address: string | null): string | null => {
    if (!address) return null;
    const parts = address.split(',').map(p => p.trim());
    if (parts.length >= 2) {
      const cityPart = parts[parts.length - 1];
      const cityWithoutPostal = cityPart.replace(/^\d{5}\s*/, '').trim();
      return cityWithoutPostal || parts[parts.length - 2];
    }
    return parts[0];
  };

  const city = center?.customization?.seo?.city || (center ? extractCity(center.address) : null);
  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
  const customSeo = center?.customization?.seo;
  
  const seoTitle = customSeo?.title 
    || (center 
      ? `${center.name}${city ? ` - Nettoyage à ${city}` : ' - Nettoyage professionnel'} | CleaningPage`
      : 'CleaningPage - Service de nettoyage professionnel');
  
  const seoDescription = customSeo?.description
    || (center
      ? `${center.name}${city ? ` à ${city}` : ''} : réservez votre nettoyage professionnel en ligne. Devis gratuit, prise de rendez-vous rapide. ${city ? `Nettoyage ${city} - ` : ''}Service de qualité.`
      : 'CleaningPage - Réservez votre nettoyage professionnel en ligne. Devis gratuit et prise de rendez-vous rapide.');
  
  const ogImage = center?.customization?.cover_url || center?.logo_url || undefined;
  
  useSEO({
    title: seoTitle,
    description: seoDescription,
    canonical: pageUrl,
    ogImage,
    keywords: customSeo?.keywords || undefined,
  });

  // Fetch pack options when a pack is selected
  useEffect(() => {
    if (!selectedPack) { setAvailableOptions([]); return; }
    
    const fetchOptions = async () => {
      // Get linked option IDs
      const { data: links } = await supabase
        .from('pack_option_links')
        .select('option_id')
        .eq('pack_id', selectedPack.id);
      
      if (!links || links.length === 0) { setAvailableOptions([]); return; }
      
      const optionIds = links.map(l => l.option_id);
      const { data: options } = await supabase
        .from('service_options')
        .select('id, name, price, duration_minutes')
        .in('id', optionIds)
        .eq('active', true)
        .order('sort_order');
      
      setAvailableOptions((options || []) as SelectedOption[]);
    };
    fetchOptions();
  }, [selectedPack]);

  // ── Price calculations ─────────────────────────────────
  const basePrice = selectedVariant?.price || selectedPack?.price || 0;
  const optionsTotal = selectedOptions.reduce((sum, o) => sum + o.price, 0);
  const totalPrice = basePrice + optionsTotal;
  const optionsDuration = selectedOptions.reduce((sum, o) => sum + o.duration_minutes, 0);

  // ── Location helpers ───────────────────────────────────
  const needsLocationChoice = selectedPack?.location_type === 'both';
  const needsAddress = selectedLocation === 'at_home' || selectedPack?.location_type === 'at_home';

  // ── Navigation ─────────────────────────────────────────
  const goToPrevStep = () => {
    switch (currentStep) {
      case 'contact-form':
        setCurrentStep('landing');
        break;
      case 'pack-detail':
        if (packs.length > 1) setCurrentStep('select-pack');
        else setCurrentStep('landing');
        break;
      case 'quote-detail':
        if (packs.length > 1) setCurrentStep('select-pack');
        else setCurrentStep('landing');
        break;
      case 'quote-form':
        setCurrentStep('quote-detail');
        break;
      case 'select-pack':
        setCurrentStep('landing');
        break;
      case 'select-options':
        setCurrentStep('pack-detail');
        break;
      case 'calendar':
        if (recognizedClient?.service_id) {
          setCurrentStep('landing');
        } else if (availableOptions.length > 0 || needsLocationChoice) {
          setCurrentStep('select-options');
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
    if (client.service_id) setCurrentStep('calendar');
  };

  const handleStartBooking = () => {
    if (isPro && packs.length > 0) {
      if (packs.length === 1) {
        const pack = packs[0];
        setSelectedPack(pack);
        if (pack.pricing_type === 'quote') setCurrentStep('quote-detail');
        else setCurrentStep('pack-detail');
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
    setSelectedOptions([]);
    // Auto-set location for non-both packs
    if (pack.location_type === 'on_site') setSelectedLocation('on_site');
    else if (pack.location_type === 'at_home') setSelectedLocation('at_home');
    else setSelectedLocation(null);
    
    if (pack.pricing_type === 'quote') {
      setCurrentStep('quote-detail');
      return;
    }
    setCurrentStep('pack-detail');
  };

  const handleSelectVariant = (variant: PriceVariant) => {
    setSelectedVariant(variant);
  };

  // After pack-detail → decide next step
  const handleProceedFromDetail = () => {
    // Show options step if there are options to pick OR location choice needed
    if (availableOptions.length > 0 || needsLocationChoice) {
      setCurrentStep('select-options');
    } else {
      setCurrentStep('calendar');
    }
  };

  // After options → calendar
  const handleProceedFromOptions = () => {
    setCurrentStep('calendar');
  };

  const handleDateSelect = async (date: Date, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);

    // Recognized client with custom service → use server-side RPC
    if (recognizedClient?.client_id && recognizedClient?.service_id) {
      setAutoSubmitting(true);
      const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

      try {
        const { data: rpcResult, error: rpcError } = await supabase.rpc('create_recognized_appointment', {
          p_center_id: center!.id,
          p_client_id: recognizedClient.client_id,
          p_service_id: recognizedClient.service_id,
          p_appointment_date: formattedDate,
          p_appointment_time: time,
          p_vehicle_type: 'custom',
          p_notes: null,
        });

        setAutoSubmitting(false);

        if (rpcError) {
          let msg = 'Impossible de créer le rendez-vous.';
          const errMsg = rpcError.message || '';
          if (errMsg.includes('TIME_SLOT_OCCUPIED')) msg = 'Ce créneau est déjà occupé. Veuillez choisir un autre horaire.';
          else if (errMsg.includes('CLIENT_NOT_FOUND')) msg = 'Client introuvable. Veuillez réessayer.';
          else if (errMsg.includes('SERVICE_NOT_FOUND')) msg = 'Prestation introuvable ou désactivée.';
          else if (errMsg.includes('CLIENT_PROFILE_INCOMPLETE')) msg = 'Votre profil est incomplet. Veuillez contacter le professionnel.';
          toast({ title: 'Erreur', description: msg, variant: 'destructive' });
          return;
        }

        if (rpcResult && rpcResult.length > 0) {
          const row = rpcResult[0];
          setLastAppointmentId(row.appointment_id);
          setClientData({
            name: row.client_name || recognizedClient.client_name || '',
            email: row.client_email || recognizedClient.client_email || '',
            phone: row.client_phone || recognizedClient.client_phone || '',
            address: row.client_address || recognizedClient.client_address || '',
            notes: '',
          });

          const isDepositActive = center?.deposit_enabled && center?.stripe_connect_status === 'active';
          if (!isDepositActive) {
            const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
            const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
            fetch(`${SUPABASE_URL}/functions/v1/send-booking-emails`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` },
              body: JSON.stringify({
                center_id: center!.id,
                client_name: row.client_name,
                client_email: row.client_email,
                client_phone: row.client_phone,
                pack_name: row.service_name || recognizedClient.service_name || 'Prestation personnalisée',
                price: row.service_price || recognizedClient.service_price || 0,
                appointment_date: formattedDate,
                appointment_time: time,
                email_type: 'request_received',
              }),
            }).catch(err => console.warn('[Booking Email] Error:', err));
          }
        }

        setCurrentStep('confirmation');
        return;
      } catch (err) {
        setAutoSubmitting(false);
        console.error('[RecognizedBooking] Error:', err);
        toast({ title: 'Erreur', description: 'Impossible de créer le rendez-vous. Veuillez réessayer.', variant: 'destructive' });
        return;
      }
    }

    setCurrentStep('client-info');
  };
  
  const handleClientSubmit = async (data: ClientData) => {
    if (!center || !selectedDate || !selectedTime) return;
    
    setClientData(data);
    
    // Recognized client with custom service
    if (recognizedClient?.service_id && recognizedClient?.client_id) {
      const formattedDate = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
      
      const { data: rpcResult, error: rpcError } = await supabase.rpc('create_recognized_appointment', {
        p_center_id: center.id,
        p_client_id: recognizedClient.client_id,
        p_service_id: recognizedClient.service_id,
        p_appointment_date: formattedDate,
        p_appointment_time: selectedTime,
        p_vehicle_type: 'custom',
        p_notes: data.notes || null,
      });

      if (rpcError) {
        let msg = 'Impossible de créer le rendez-vous.';
        const errMsg = rpcError.message || '';
        if (errMsg.includes('TIME_SLOT_OCCUPIED')) msg = 'Ce créneau est déjà occupé.';
        else if (errMsg.includes('CLIENT_PROFILE_INCOMPLETE')) msg = 'Votre profil est incomplet.';
        toast({ title: 'Erreur', description: msg, variant: 'destructive' });
        return;
      }

      if (rpcResult && rpcResult.length > 0) {
        setLastAppointmentId(rpcResult[0].appointment_id);
      }
      setCurrentStep('confirmation');
      return;
    }
    
    // Standard pack flow
    if (!selectedPack) return;
    
    const isDepositActive = center.deposit_enabled && center.stripe_connect_status === 'active';
    
    // Build selected_options JSON for the appointment
    const optionsPayload = selectedOptions.length > 0 
      ? selectedOptions.map(o => ({ id: o.id, name: o.name, price: o.price, duration_minutes: o.duration_minutes }))
      : [];

    // Build notes with location info
    const locationNote = selectedLocation === 'at_home' ? '📍 À domicile' : selectedLocation === 'on_site' ? '📍 Sur place' : '';
    const optionsNote = selectedOptions.length > 0 
      ? `Options : ${selectedOptions.map(o => `${o.name} (+${o.price}€)`).join(', ')}`
      : '';
    const fullNotes = [data.notes, locationNote, optionsNote].filter(Boolean).join('\n');
    
    const { error, appointmentId } = await createAppointment({
      center_id: center.id,
      pack_id: selectedPack.id,
      client_name: data.name,
      client_email: data.email,
      client_phone: data.phone,
      client_address: data.address,
      vehicle_type: selectedVariant?.name || 'berline',
      appointment_date: `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`,
      appointment_time: selectedTime,
      notes: fullNotes,
      duration: selectedPack.duration || '1h',
      pack_name: selectedPack.name,
      variant_name: selectedVariant?.name,
      price: totalPrice,
      skip_email: isDepositActive,
      selected_options: optionsPayload,
    });
    
    if (error) {
      toast({ title: 'Erreur', description: error, variant: 'destructive' });
      return;
    }
    
    if (appointmentId) setLastAppointmentId(appointmentId);
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
      toast({ title: 'Erreur', description: 'Impossible d\'envoyer votre demande. Veuillez réessayer.', variant: 'destructive' });
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
      toast({ title: 'Erreur', description: 'Impossible d\'envoyer votre demande. Veuillez réessayer.', variant: 'destructive' });
      return;
    }
    setCurrentStep('quote-confirmation');
  };
  
  const showBackButton = currentStep !== 'landing' && currentStep !== 'confirmation' && currentStep !== 'contact-confirmation' && currentStep !== 'quote-confirmation';

  // Loading
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

  // Error
  if (error || !center) {
    console.error('[CenterBooking] Error loading center:', { slug, error, center, userAgent: navigator.userAgent });
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card variant="elevated" className="p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-xl font-semibold text-foreground mb-2">Centre non trouvé</h1>
          <p className="text-muted-foreground mb-6">Ce lien n'existe pas ou a été désactivé.</p>
          <Button variant="outline" onClick={() => window.location.reload()} className="mr-2">Réessayer</Button>
          <Link to="/"><Button variant="outline">Retour à l'accueil</Button></Link>
        </Card>
      </div>
    );
  }

  // Subscription expired
  if (!isPro) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card variant="elevated" className="p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-semibold text-foreground mb-2">Page temporairement indisponible</h1>
          <p className="text-muted-foreground mb-6">Cette page n'est plus accessible pour le moment.</p>
          <Link to="/"><Button variant="outline">Retour à l'accueil</Button></Link>
        </Card>
      </div>
    );
  }

  const openingHours = availability?.map(a => ({
    dayOfWeek: a.day_of_week,
    opens: a.start_time,
    closes: a.end_time,
  })) || [];

  // ═══════════════════════════════════════════════════════
  // LANDING
  // ═══════════════════════════════════════════════════════
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

  // ═══════════════════════════════════════════════════════
  // CONTACT FORM (free plan)
  // ═══════════════════════════════════════════════════════
  if (currentStep === 'contact-form') {
    return (
      <div className="min-h-screen bg-background">
        <BookingHeader centerName={center.name} />
        <main className="px-4 pb-16 pt-8">
          <div className="max-w-4xl mx-auto">
            {showBackButton && (
              <div className="mb-6">
                <Button variant="ghost" size="sm" onClick={goToPrevStep} className="text-muted-foreground hover:text-foreground">
                  <ChevronLeft className="w-4 h-4 mr-1" />Retour
                </Button>
              </div>
            )}
            <ContactRequestForm onSubmit={handleContactSubmit} isSubmitting={submittingContact} />
          </div>
        </main>
      </div>
    );
  }

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

  // ═══════════════════════════════════════════════════════
  // PACK DETAIL (fixed price)
  // ═══════════════════════════════════════════════════════
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
                <Button variant="ghost" size="sm" onClick={goToPrevStep} className="text-muted-foreground hover:text-foreground">
                  <ChevronLeft className="w-4 h-4 mr-1" />Retour
                </Button>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-start">
              {/* Left: Image */}
              {selectedPack.image_url ? (
                <div className="rounded-3xl overflow-hidden">
                  <img src={selectedPack.image_url} alt={selectedPack.name} className="w-full aspect-[4/3] object-cover" loading="lazy" />
                </div>
              ) : (
                <div className="rounded-3xl bg-secondary/20 aspect-[4/3] flex items-center justify-center">
                  <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <span className="text-3xl font-bold text-primary">{selectedPack.name.charAt(0)}</span>
                  </div>
                </div>
              )}

              {/* Right: Info + Tarifs */}
              <div className="flex flex-col justify-center space-y-5 lg:py-4">
                <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-foreground tracking-tight leading-[1.1]">
                  {selectedPack.name}
                </h1>

                {/* Pricing card with variant selection + images */}
                <Card variant="elevated" className="p-5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Tarifs (TTC)</p>
                  {hasVariants ? (
                    <div className="space-y-2">
                      {selectedPack.price_variants.map((variant, i) => (
                        <div 
                          key={i} 
                          className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                            selectedVariant?.name === variant.name 
                              ? 'bg-primary/10 ring-2 ring-primary' 
                              : 'hover:bg-secondary/50'
                          }`}
                          onClick={() => handleSelectVariant(variant)}
                        >
                          {variant.image_url && (
                            <img src={variant.image_url} alt={variant.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                          )}
                          <span className="text-sm font-medium text-foreground flex-1">{variant.name}</span>
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

                {/* Location badge */}
                {selectedPack.location_type && selectedPack.location_type !== 'on_site' && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {selectedPack.location_type === 'at_home' ? <Home className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                    <span>{selectedPack.location_type === 'at_home' ? 'À domicile' : 'Sur place ou à domicile'}</span>
                  </div>
                )}

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
                  onClick={handleProceedFromDetail}
                >
                  {availableOptions.length > 0 ? 'Continuer' : 'Réserver'}
                </Button>
                {hasVariants && !selectedVariant && (
                  <p className="text-xs text-muted-foreground">Sélectionnez une catégorie ci-dessus</p>
                )}
              </div>
            </div>

            {/* Description */}
            {selectedPack.description && (
              <div className="mt-12 lg:mt-16 max-w-3xl">
                <RichDescription text={selectedPack.description} />
              </div>
            )}

            {/* Features */}
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
          </div>
        </main>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  // SELECT OPTIONS + LOCATION
  // ═══════════════════════════════════════════════════════
  if (currentStep === 'select-options' && selectedPack) {
    const canProceed = !needsLocationChoice || selectedLocation !== null;

    return (
      <div className="min-h-screen bg-background">
        <BookingHeader centerName={center.name} />
        <main className="px-4 sm:px-6 pb-16 pt-8">
          <div className="max-w-2xl mx-auto">
            {showBackButton && (
              <div className="mb-6">
                <Button variant="ghost" size="sm" onClick={goToPrevStep} className="text-muted-foreground hover:text-foreground">
                  <ChevronLeft className="w-4 h-4 mr-1" />Retour
                </Button>
              </div>
            )}

            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Personnalisez votre prestation
              </h1>
              <p className="text-muted-foreground">
                {selectedPack.name}
                {selectedVariant && ` · ${selectedVariant.name}`}
                {` · ${basePrice}€`}
              </p>
            </div>

            <div className="space-y-8">
              {/* Location choice */}
              {needsLocationChoice && (
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-4">Lieu d'intervention</h2>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setSelectedLocation('on_site')}
                      className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all duration-200 ${
                        selectedLocation === 'on_site'
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border hover:border-primary/40 hover:bg-secondary/30'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        selectedLocation === 'on_site' ? 'bg-primary/10' : 'bg-secondary/50'
                      }`}>
                        <Building2 className={`w-5 h-5 ${selectedLocation === 'on_site' ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <span className={`text-sm font-medium ${selectedLocation === 'on_site' ? 'text-foreground' : 'text-muted-foreground'}`}>
                        Sur place
                      </span>
                    </button>
                    <button
                      onClick={() => setSelectedLocation('at_home')}
                      className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all duration-200 ${
                        selectedLocation === 'at_home'
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border hover:border-primary/40 hover:bg-secondary/30'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        selectedLocation === 'at_home' ? 'bg-primary/10' : 'bg-secondary/50'
                      }`}>
                        <Home className={`w-5 h-5 ${selectedLocation === 'at_home' ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <span className={`text-sm font-medium ${selectedLocation === 'at_home' ? 'text-foreground' : 'text-muted-foreground'}`}>
                        À domicile
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Options selection */}
              {availableOptions.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-1">Options supplémentaires</h2>
                  <p className="text-sm text-muted-foreground mb-4">Ajoutez des services complémentaires à votre prestation.</p>
                  <div className="space-y-2">
                    {availableOptions.map(opt => {
                      const isSelected = selectedOptions.some(o => o.id === opt.id);
                      return (
                        <label
                          key={opt.id}
                          className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? 'border-primary bg-primary/5 shadow-sm'
                              : 'border-border hover:border-primary/40 hover:bg-secondary/20'
                          }`}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedOptions(prev => [...prev, opt]);
                              } else {
                                setSelectedOptions(prev => prev.filter(o => o.id !== opt.id));
                              }
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">{opt.name}</p>
                            {opt.duration_minutes > 0 && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Clock className="w-3 h-3" />+{opt.duration_minutes}min
                              </p>
                            )}
                          </div>
                          <span className="text-sm font-bold text-foreground whitespace-nowrap">+{opt.price}€</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Total + CTA */}
            <div className="mt-8 pt-6 border-t border-border">
              {selectedOptions.length > 0 && (
                <div className="mb-4 space-y-1">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{selectedPack.name}{selectedVariant ? ` · ${selectedVariant.name}` : ''}</span>
                    <span>{basePrice}€</span>
                  </div>
                  {selectedOptions.map(opt => (
                    <div key={opt.id} className="flex justify-between text-sm text-muted-foreground">
                      <span>{opt.name}</span>
                      <span>+{opt.price}€</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-base font-bold text-foreground pt-2 border-t border-border/50">
                    <span>Total</span>
                    <span>{totalPrice}€</span>
                  </div>
                </div>
              )}

              <Button 
                variant="premium" 
                size="xl" 
                className="w-full"
                disabled={!canProceed}
                onClick={handleProceedFromOptions}
              >
                Choisir un créneau
              </Button>
              {!canProceed && (
                <p className="text-xs text-muted-foreground text-center mt-2">Veuillez choisir le lieu d'intervention</p>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  // QUOTE DETAIL
  // ═══════════════════════════════════════════════════════
  if (currentStep === 'quote-detail' && selectedPack) {
    return (
      <div className="min-h-screen bg-background">
        <BookingHeader centerName={center.name} />
        <main className="px-4 sm:px-6 pb-16 pt-8">
          <div className="max-w-5xl mx-auto">
            {showBackButton && (
              <div className="mb-6">
                <Button variant="ghost" size="sm" onClick={goToPrevStep} className="text-muted-foreground hover:text-foreground">
                  <ChevronLeft className="w-4 h-4 mr-1" />Retour
                </Button>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-start">
              {selectedPack.image_url ? (
                <div className="rounded-3xl overflow-hidden">
                  <img src={selectedPack.image_url} alt={selectedPack.name} className="w-full aspect-[4/3] object-cover" loading="lazy" />
                </div>
              ) : (
                <div className="rounded-3xl bg-secondary/20 aspect-[4/3] flex items-center justify-center">
                  <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <span className="text-3xl font-bold text-primary">{selectedPack.name.charAt(0)}</span>
                  </div>
                </div>
              )}

              <div className="flex flex-col justify-center space-y-5 lg:py-4">
                <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-foreground tracking-tight leading-[1.1]">
                  {selectedPack.name}
                </h1>
                <Card variant="elevated" className="p-5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Tarif</p>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm text-foreground">Prix</span>
                    <span className="text-lg font-bold text-primary">Sur devis</span>
                  </div>
                </Card>
                {selectedPack.duration && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" /><span>Durée estimée : {selectedPack.duration}</span>
                  </div>
                )}
                <Button variant="premium" size="xl" className="w-full sm:w-auto sm:px-12 mt-2" onClick={() => setCurrentStep('quote-form')}>
                  Obtenir un devis
                </Button>
              </div>
            </div>

            {selectedPack.description && (
              <div className="mt-12 lg:mt-16 max-w-3xl">
                <RichDescription text={selectedPack.description} />
              </div>
            )}

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
          </div>
        </main>
      </div>
    );
  }

  // Quote form
  if (currentStep === 'quote-form' && selectedPack) {
    return (
      <div className="min-h-screen bg-background">
        <BookingHeader centerName={center.name} />
        <main className="px-4 pb-16 pt-8">
          <div className="max-w-4xl mx-auto">
            {showBackButton && (
              <div className="mb-6">
                <Button variant="ghost" size="sm" onClick={goToPrevStep} className="text-muted-foreground hover:text-foreground">
                  <ChevronLeft className="w-4 h-4 mr-1" />Retour
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

  // Pack data for calendar/confirmation
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
        price: totalPrice,
        features: selectedPack.features || [],
      } : null;

  // Total duration including options
  const totalDurationMinutes = recognizedClient?.service_duration_minutes 
    || ((selectedPack?.duration ? parseDurationString(selectedPack.duration) : 60) + optionsDuration);

  return (
    <div className="min-h-screen bg-background">
      <BookingHeader centerName={center.name} />
      
      <main className="px-4 pb-16 pt-8">
        <div className="max-w-4xl mx-auto">
          {showBackButton && (
            <div className="mb-6">
              <Button variant="ghost" size="sm" onClick={goToPrevStep} className="text-muted-foreground hover:text-foreground">
                <ChevronLeft className="w-4 h-4 mr-1" />Retour
              </Button>
            </div>
          )}
          
          {/* Pack Selection */}
          {currentStep === 'select-pack' && (
            <div>
              <div className="text-center mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Choisissez votre formule</h1>
                <p className="text-muted-foreground">Sélectionnez la prestation qui vous convient</p>
              </div>

              {!recognizedClient && (
                <ClientLookupInline
                  centerId={center.id}
                  onRecognizedClient={(client) => {
                    setRecognizedClient(client);
                    if (client.service_id) setCurrentStep('calendar');
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

                  return (
                    <div key={pack.id} className="group cursor-pointer" onClick={() => handleSelectPack(pack)}>
                      <div className="relative rounded-2xl overflow-hidden mb-2.5 transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-xl" style={{ aspectRatio: '4/3' }}>
                        {pack.image_url ? (
                          <>
                            <img src={pack.image_url} alt={pack.name} className="w-full h-full object-cover" loading="lazy" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            <div className="absolute bottom-0 inset-x-0 p-4">
                              <p className="text-white font-bold text-base sm:text-lg leading-tight mb-0.5">{pack.name}</p>
                              <p className="text-white/90 font-semibold text-lg sm:text-xl">
                                {isQuote ? 'Sur devis' : hasVariants ? `dès ${minPrice}€` : `${pack.price}€`}
                              </p>
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full flex flex-col justify-end p-4 bg-gradient-to-br from-secondary/60 to-secondary/20 border border-border/40 rounded-2xl">
                            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-auto mt-3">
                              <span className="text-xl font-bold text-primary">{pack.name.charAt(0)}</span>
                            </div>
                            <p className="font-bold text-base sm:text-lg text-foreground leading-tight mb-0.5">{pack.name}</p>
                            <p className="font-semibold text-lg text-primary">
                              {isQuote ? 'Sur devis' : hasVariants ? `dès ${minPrice}€` : `${pack.price}€`}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between px-1">
                        {pack.duration && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />{pack.duration}
                          </p>
                        )}
                        {hasVariants && (
                          <p className="text-xs text-muted-foreground">{pack.price_variants.length} options</p>
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
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Choisissez votre créneau</h1>
                <p className="text-muted-foreground">
                  {packData.name}
                  {selectedVariant && ` · ${selectedVariant.name}`}
                  {selectedOptions.length > 0 && ` + ${selectedOptions.length} option${selectedOptions.length > 1 ? 's' : ''}`}
                  {` · ${packData.price}€`}
                </p>
              </div>
              <CalendarPicker 
                duration={packData.duration} 
                onSelect={handleDateSelect} 
                centerId={center?.id}
                serviceDurationMinutes={totalDurationMinutes}
              />
            </div>
          )}
          
          {/* Client Info */}
          {currentStep === 'client-info' && (
            <ClientForm 
              onSubmit={handleClientSubmit} 
              isSubmitting={submitting}
              requireAddress={needsAddress}
              defaultValues={recognizedClient ? {
                name: recognizedClient.client_name || '',
                phone: recognizedClient.client_phone || '',
                email: recognizedClient.client_email || '',
                address: recognizedClient.client_address || '',
              } : undefined}
            />
          )}
          
          {/* Confirmation */}
          {currentStep === 'confirmation' && packData && selectedDate && selectedTime && clientData && (() => {
            const isDepositEnabled = center?.deposit_enabled && center?.stripe_connect_status === 'active';
            let depositAmount: number | undefined;
            if (isDepositEnabled) {
              const servicePrice = packData.price;
              const depositType = center?.deposit_type || 'percentage';
              const depositValue = center?.deposit_value || 30;
              depositAmount = depositType === 'percentage' 
                ? Math.round(servicePrice * (depositValue / 100) * 100) / 100
                : depositValue;
            }
            return (
              <ConfirmationView 
                pack={packData}
                date={selectedDate}
                time={selectedTime}
                clientName={clientData.name}
                centerName={center.name}
                centerAddress={center.address}
                depositEnabled={isDepositEnabled}
                depositAmount={depositAmount}
                appointmentId={lastAppointmentId || undefined}
                cancellationPolicy={(center?.cancellation_policy as 'no_refund' | 'no_refund_48h') || 'no_refund'}
                selectedOptions={selectedOptions}
                selectedLocation={selectedLocation}
              />
            );
          })()}
        </div>
      </main>
    </div>
  );
}