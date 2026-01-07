import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Logo } from '@/components/ui/Logo';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MapPin, Phone, Clock, ArrowRight, Star, Car, User, MessageSquare, Send, CheckCircle, Instagram, Mail } from 'lucide-react';
import { Center, Pack } from '@/hooks/useCenter';
import { CenterCustomization, defaultCustomization } from '@/types/customization';
import { useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CenterLandingProps {
  center: Center;
  packs: Pack[];
  onStartBooking: () => void;
  onSelectPack?: (pack: Pack) => void;
  hasPacks: boolean;
  isPro: boolean;
}

export function CenterLanding({ center, packs, onStartBooking, onSelectPack, hasPacks, isPro }: CenterLandingProps) {
  const { toast } = useToast();
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactSent, setContactSent] = useState(false);

  // Check if center is currently open (simple check based on current hour)
  const now = new Date();
  const currentHour = now.getHours();
  const isOpen = currentHour >= 9 && currentHour < 19;

  // Get customization with fallback to defaults
  const customization: CenterCustomization = useMemo(() => {
    const c = center.customization || defaultCustomization;
    return {
      colors: { ...defaultCustomization.colors, ...(c.colors || {}) },
      texts: { ...defaultCustomization.texts, ...(c.texts || {}) },
      layout: { ...defaultCustomization.layout, ...(c.layout || {}) },
      social: { ...defaultCustomization.social, ...(c.social || {}) },
      seo: { ...defaultCustomization.seo, ...(c.seo || {}) },
      cover_url: c.cover_url ?? null,
      gallery_images: c.gallery_images ?? [],
    };
  }, [center.customization]);

  // Generate CSS variables for custom colors
  const customStyles = useMemo(() => ({
    '--custom-primary': customization.colors.primary,
    '--custom-secondary': customization.colors.secondary,
    '--custom-accent': customization.colors.accent,
  } as React.CSSProperties), [customization.colors]);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactPhone.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('contact_requests')
        .insert({
          center_id: center.id,
          client_name: contactName.trim(),
          client_phone: contactPhone.trim(),
          message: contactMessage.trim() || null,
        });

      if (error) throw error;

      setContactSent(true);
      toast({ title: 'Demande envoyée', description: 'Nous vous recontacterons rapidement.' });
    } catch (error) {
      console.error('Contact submit error:', error);
      toast({ title: 'Erreur', description: "Impossible d'envoyer la demande.", variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className={`min-h-screen flex flex-col ${customization.layout.dark_mode ? 'dark' : ''}`}
      style={{
        ...customStyles,
        backgroundColor: customization.layout.dark_mode ? customization.colors.secondary : undefined,
      }}
    >
      {/* Cover Image */}
      <div 
        className="relative w-full h-40 sm:h-52"
        style={{
          background: customization.cover_url 
            ? `url(${customization.cover_url}) center/cover no-repeat`
            : `linear-gradient(135deg, ${customization.colors.primary}, ${customization.colors.secondary})`,
        }}
      />

      {/* Main Content */}
      <main className={`flex-1 px-4 pb-24 ${customization.layout.dark_mode ? 'bg-gray-900' : 'bg-background'}`}>
        <div className="max-w-2xl mx-auto">
          {/* Logo overlapping cover */}
          <div className="relative -mt-12 mb-4">
            {center.logo_url ? (
              <img 
                src={center.logo_url} 
                alt={center.name} 
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 shadow-lg"
                style={{ 
                  borderColor: customization.layout.dark_mode ? customization.colors.secondary : 'white',
                }}
              />
            ) : (
              <div 
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center border-4 shadow-lg"
                style={{ 
                  backgroundColor: customization.colors.primary,
                  borderColor: customization.layout.dark_mode ? customization.colors.secondary : 'white',
                }}
              >
                <Car className="w-10 h-10 text-white" />
              </div>
            )}
          </div>

          {/* Center Name + Badge */}
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h1 
              className="text-2xl sm:text-3xl font-bold tracking-tight"
              style={{ color: customization.layout.dark_mode ? 'white' : undefined }}
            >
              {center.name}
            </h1>
            {isOpen ? (
              <Badge 
                className="border-0"
                style={{ backgroundColor: customization.colors.accent + '20', color: customization.colors.accent }}
              >
                Ouvert
              </Badge>
            ) : (
              <Badge variant="secondary">Fermé</Badge>
            )}
          </div>

          {/* Tagline or default subtitle */}
          <div 
            className="flex items-center gap-2 mb-4"
            style={{ color: customization.layout.dark_mode ? '#9ca3af' : undefined }}
          >
            <span>{customization.texts.tagline || 'Lavage auto professionnel'}</span>
            <span>•</span>
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span>4.8</span>
          </div>

          {/* Social Links */}
          {(customization.social.instagram || customization.social.tiktok || customization.social.facebook || customization.social.email) && (
            <div className="flex items-center gap-3 mb-6">
              {customization.social.instagram && (
                <a
                  href={`https://instagram.com/${customization.social.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg transition-colors hover:scale-110"
                  style={{ 
                    backgroundColor: customization.colors.primary + '15',
                    color: customization.layout.dark_mode ? 'white' : customization.colors.primary 
                  }}
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {customization.social.tiktok && (
                <a
                  href={`https://tiktok.com/@${customization.social.tiktok}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg transition-colors hover:scale-110"
                  style={{ 
                    backgroundColor: customization.colors.primary + '15',
                    color: customization.layout.dark_mode ? 'white' : customization.colors.primary 
                  }}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </a>
              )}
              {customization.social.facebook && (
                <a
                  href={`https://facebook.com/${customization.social.facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg transition-colors hover:scale-110"
                  style={{ 
                    backgroundColor: customization.colors.primary + '15',
                    color: customization.layout.dark_mode ? 'white' : customization.colors.primary 
                  }}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              )}
              {customization.social.email && (
                <a
                  href={`mailto:${customization.social.email}`}
                  className="p-2 rounded-lg transition-colors hover:scale-110"
                  style={{ 
                    backgroundColor: customization.colors.primary + '15',
                    color: customization.layout.dark_mode ? 'white' : customization.colors.primary 
                  }}
                >
                  <Mail className="w-5 h-5" />
                </a>
              )}
            </div>
          )}

          {/* Info Cards Row */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3 mb-6 sm:mb-8">
            {customization.layout.show_address && center.address && (
              <Card 
                className="p-3 sm:p-4 flex items-center gap-3 sm:block sm:text-center"
                style={{
                  backgroundColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.05)' : undefined,
                  borderColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.1)' : undefined,
                }}
              >
                <MapPin className="w-5 h-5 flex-shrink-0 sm:mx-auto sm:mb-2" style={{ color: customization.colors.primary }} />
                <p 
                  className="text-sm truncate flex-1"
                  style={{ color: customization.layout.dark_mode ? 'white' : undefined }}
                >
                  {center.address}
                </p>
              </Card>
            )}
            {customization.layout.show_hours && (
              <Card 
                className="p-3 sm:p-4 flex items-center gap-3 sm:block sm:text-center"
                style={{
                  backgroundColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.05)' : undefined,
                  borderColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.1)' : undefined,
                }}
              >
                <Clock className="w-5 h-5 flex-shrink-0 sm:mx-auto sm:mb-2" style={{ color: customization.colors.primary }} />
                <p 
                  className="text-sm"
                  style={{ color: customization.layout.dark_mode ? 'white' : undefined }}
                >
                  9h - 19h
                </p>
              </Card>
            )}
            {customization.layout.show_phone && center.phone && (
              <Card 
                className="p-3 sm:p-4 flex items-center gap-3 sm:block sm:text-center"
                style={{
                  backgroundColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.05)' : undefined,
                  borderColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.1)' : undefined,
                }}
              >
                <Phone className="w-5 h-5 flex-shrink-0 sm:mx-auto sm:mb-2" style={{ color: customization.colors.primary }} />
                <a 
                  href={`tel:${center.phone}`}
                  className="text-sm transition-colors flex-1"
                  style={{ color: customization.layout.dark_mode ? 'white' : undefined }}
                >
                  {center.phone}
                </a>
              </Card>
            )}
          </div>

          {/* Formules Section - Only for Pro with packs */}
          {isPro && packs.length > 0 && (
            <div className="mb-8">
              <h2 
                className="text-lg font-semibold mb-4"
                style={{ color: customization.layout.dark_mode ? 'white' : undefined }}
              >
                Nos formules
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {packs.slice(0, 6).map((pack) => {
                  const hasVariants = pack.price_variants && pack.price_variants.length > 0;
                  const minPrice = hasVariants 
                    ? Math.min(...pack.price_variants.map(v => v.price))
                    : pack.price;

                  return (
                    <Card 
                      key={pack.id}
                      className="p-4 sm:p-5 transition-all cursor-pointer group"
                      style={{
                        backgroundColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.05)' : undefined,
                        borderColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.1)' : undefined,
                      }}
                      onClick={() => onSelectPack?.(pack)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p 
                            className="font-semibold transition-colors"
                            style={{ color: customization.layout.dark_mode ? 'white' : undefined }}
                          >
                            {pack.name}
                          </p>
                          {pack.description && (
                            <p 
                              className="text-xs line-clamp-1 mt-0.5"
                              style={{ color: customization.layout.dark_mode ? '#9ca3af' : undefined }}
                            >
                              {pack.description}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p 
                            className="text-lg sm:text-xl font-bold"
                            style={{ color: customization.colors.primary }}
                          >
                            {hasVariants ? `${minPrice}€` : `${pack.price}€`}
                          </p>
                          {hasVariants && (
                            <p 
                              className="text-xs"
                              style={{ color: customization.layout.dark_mode ? '#9ca3af' : undefined }}
                            >
                              à partir de
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {hasVariants && (
                        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border/50">
                          {pack.price_variants.slice(0, 4).map((v, i) => (
                            <span 
                              key={i} 
                              className="text-xs px-2 py-1 rounded"
                              style={{ 
                                backgroundColor: customization.colors.primary + '15',
                                color: customization.layout.dark_mode ? 'white' : undefined,
                              }}
                            >
                              {v.name}: {v.price}€
                            </span>
                          ))}
                          {pack.price_variants.length > 4 && (
                            <span 
                              className="text-xs px-2 py-1"
                              style={{ color: customization.layout.dark_mode ? '#9ca3af' : undefined }}
                            >
                              +{pack.price_variants.length - 4}
                            </span>
                          )}
                        </div>
                      )}
                      
                      {pack.duration && (
                        <p 
                          className="text-xs mt-2"
                          style={{ color: customization.layout.dark_mode ? '#9ca3af' : undefined }}
                        >
                          <Clock className="w-3 h-3 inline mr-1" />
                          {pack.duration}
                        </p>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Gallery Section */}
          {customization.layout.show_gallery && customization.gallery_images && customization.gallery_images.length > 0 && (
            <div className="mb-8">
              <h2 
                className="text-lg font-semibold mb-4"
                style={{ color: customization.layout.dark_mode ? 'white' : undefined }}
              >
                Nos réalisations
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {customization.gallery_images.slice(0, 8).map((url, index) => (
                  <div 
                    key={index} 
                    className="aspect-square rounded-lg overflow-hidden"
                  >
                    <img
                      src={url}
                      alt={`Réalisation ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Welcome message if available */}
          {center.welcome_message && (
            <div 
              className="mb-8 p-4 rounded-xl"
              style={{ backgroundColor: customization.colors.primary + '10' }}
            >
              <p 
                className="text-sm text-center"
                style={{ color: customization.layout.dark_mode ? '#d1d5db' : undefined }}
              >
                {center.welcome_message}
              </p>
            </div>
          )}

          {/* Additional info if no address or phone */}
          {!center.address && !center.phone && !center.welcome_message && (
            <div 
              className="mb-8 p-4 rounded-xl"
              style={{ backgroundColor: customization.colors.primary + '10' }}
            >
              <p 
                className="text-sm text-center"
                style={{ color: customization.layout.dark_mode ? '#d1d5db' : undefined }}
              >
                Spécialiste du nettoyage et de l'esthétique automobile.
              </p>
            </div>
          )}

          {/* Contact Form Section */}
          {customization.layout.show_contact_form && (
            <div className="mb-8">
              <h2 
                className="text-lg font-semibold mb-4"
                style={{ color: customization.layout.dark_mode ? 'white' : undefined }}
              >
                Nous contacter
              </h2>
              
              {contactSent ? (
                <Card 
                  className="p-6 text-center"
                  style={{
                    backgroundColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.05)' : undefined,
                    borderColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.1)' : undefined,
                  }}
                >
                  <CheckCircle 
                    className="w-12 h-12 mx-auto mb-3" 
                    style={{ color: customization.colors.accent }}
                  />
                  <p 
                    className="font-medium mb-1"
                    style={{ color: customization.layout.dark_mode ? 'white' : undefined }}
                  >
                    Demande envoyée !
                  </p>
                  <p 
                    className="text-sm"
                    style={{ color: customization.layout.dark_mode ? '#9ca3af' : undefined }}
                  >
                    Nous vous recontacterons rapidement.
                  </p>
                </Card>
              ) : (
                <Card 
                  className="p-5"
                  style={{
                    backgroundColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.05)' : undefined,
                    borderColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.1)' : undefined,
                  }}
                >
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label 
                        htmlFor="contact-name"
                        style={{ color: customization.layout.dark_mode ? '#d1d5db' : undefined }}
                      >
                        Votre nom *
                      </Label>
                      <div className="relative">
                        <User 
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" 
                          style={{ color: customization.layout.dark_mode ? '#6b7280' : undefined }}
                        />
                        <Input
                          id="contact-name"
                          type="text"
                          placeholder="Jean Dupont"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          className="pl-10"
                          style={{
                            backgroundColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.1)' : undefined,
                            borderColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.2)' : undefined,
                            color: customization.layout.dark_mode ? 'white' : undefined,
                          }}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label 
                        htmlFor="contact-phone"
                        style={{ color: customization.layout.dark_mode ? '#d1d5db' : undefined }}
                      >
                        Téléphone *
                      </Label>
                      <div className="relative">
                        <Phone 
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" 
                          style={{ color: customization.layout.dark_mode ? '#6b7280' : undefined }}
                        />
                        <Input
                          id="contact-phone"
                          type="tel"
                          placeholder="06 12 34 56 78"
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          className="pl-10"
                          style={{
                            backgroundColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.1)' : undefined,
                            borderColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.2)' : undefined,
                            color: customization.layout.dark_mode ? 'white' : undefined,
                          }}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label 
                        htmlFor="contact-message"
                        style={{ color: customization.layout.dark_mode ? '#d1d5db' : undefined }}
                      >
                        Message (optionnel)
                      </Label>
                      <div className="relative">
                        <MessageSquare 
                          className="absolute left-3 top-3 w-4 h-4" 
                          style={{ color: customization.layout.dark_mode ? '#6b7280' : undefined }}
                        />
                        <Textarea
                          id="contact-message"
                          placeholder="Décrivez votre besoin..."
                          value={contactMessage}
                          onChange={(e) => setContactMessage(e.target.value)}
                          className="pl-10 min-h-[80px] resize-none"
                          style={{
                            backgroundColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.1)' : undefined,
                            borderColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.2)' : undefined,
                            color: customization.layout.dark_mode ? 'white' : undefined,
                          }}
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full text-white"
                      style={{ backgroundColor: customization.colors.primary }}
                    >
                      {isSubmitting ? 'Envoi...' : 'Envoyer ma demande'}
                      <Send className="w-4 h-4 ml-2" />
                    </Button>
                  </form>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Fixed CTA Button at bottom */}
      <div 
        className="fixed bottom-0 left-0 right-0 p-4 backdrop-blur-sm border-t"
        style={{ 
          backgroundColor: customization.layout.dark_mode ? 'rgba(17,24,39,0.95)' : 'rgba(255,255,255,0.95)',
          borderColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.1)' : undefined,
        }}
      >
        <div className="max-w-2xl mx-auto">
          <Button 
            size="lg" 
            onClick={onStartBooking}
            className="w-full rounded-xl text-base py-6 text-white"
            style={{ backgroundColor: customization.colors.primary }}
          >
            {customization.texts.cta_button || (isPro && hasPacks ? 'Réserver un créneau' : 'Demander un devis')}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer 
        className="pb-24 pt-4 px-4 text-center"
        style={{ backgroundColor: customization.layout.dark_mode ? '#111827' : undefined }}
      >
        <p 
          className="text-xs"
          style={{ color: customization.layout.dark_mode ? '#6b7280' : undefined }}
        >
          Propulsé par <span className="font-medium">CleaningPage</span>
        </p>
      </footer>
    </div>
  );
}