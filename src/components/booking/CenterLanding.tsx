import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { MapPin, Phone, Clock, ArrowRight, Car, User, MessageSquare, Send, CheckCircle, Instagram, Mail, Link2, ShoppingBag, BookOpen, Video, Calendar, FileText, ExternalLink, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Center, Pack } from '@/hooks/useCenter';
import { CenterCustomization, CustomLink, defaultCustomization, PageSection, defaultSections } from '@/types/customization';
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
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Check if center is currently open
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
      visible_pack_ids: c.visible_pack_ids ?? [],
      custom_links: c.custom_links ?? [],
      sections: c.sections ?? defaultSections,
    };
  }, [center.customization]);

  // Migrate legacy gallery_images to first gallery section if needed
  const migratedSections = useMemo(() => {
    const sections = [...customization.sections];
    const legacyImages = customization.gallery_images || [];
    
    // Find the first gallery section
    const gallerySection = sections.find(s => s.type === 'gallery');
    
    // If there are legacy images and the gallery section has no images, migrate
    if (legacyImages.length > 0 && gallerySection && (!gallerySection.images || gallerySection.images.length === 0)) {
      return sections.map(s => 
        s.id === gallerySection.id ? { ...s, images: legacyImages } : s
      );
    }
    
    return sections;
  }, [customization.sections, customization.gallery_images]);

  // Get sorted, enabled sections
  const activeSections = useMemo(() => {
    return [...migratedSections]
      .filter(s => s.enabled)
      .sort((a, b) => a.order - b.order);
  }, [migratedSections]);

  // Get text colors based on dark mode
  const textColors = useMemo(() => ({
    primary: customization.layout.dark_mode ? '#ffffff' : (customization.colors.text_primary || '#111827'),
    secondary: customization.layout.dark_mode ? '#9ca3af' : (customization.colors.text_secondary || '#6b7280'),
  }), [customization]);

  // Generate CSS variables for custom colors
  const customStyles = useMemo(() => ({
    '--custom-primary': customization.colors.primary,
    '--custom-secondary': customization.colors.secondary,
    '--custom-accent': customization.colors.accent,
    '--custom-text-primary': textColors.primary,
    '--custom-text-secondary': textColors.secondary,
  } as React.CSSProperties), [customization.colors, textColors]);

  // Custom Links component
  const renderCustomLinks = () => {
    if (!customization.custom_links || customization.custom_links.length === 0) return null;
    
    const validLinks = customization.custom_links.filter(link => link.title && link.url);
    if (validLinks.length === 0) return null;

    return (
      <div className="grid grid-cols-1 gap-2 mb-8">
        {validLinks.map((link) => {
          const IconComponent = {
            link: Link2,
            shop: ShoppingBag,
            book: BookOpen,
            video: Video,
            calendar: Calendar,
            file: FileText,
          }[link.icon || 'link'] || Link2;

          const absoluteUrl = link.url.startsWith('http://') || link.url.startsWith('https://') 
            ? link.url 
            : `https://${link.url}`;

          return (
            <a
              key={link.id}
              href={absoluteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-2xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group"
              style={{
                backgroundColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.05)' : 'white',
                borderColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
              }}
            >
              <div 
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                style={{ backgroundColor: customization.colors.primary + '15' }}
              >
                <IconComponent className="w-5 h-5" style={{ color: customization.colors.primary }} />
              </div>
              <span 
                className="font-medium flex-1"
                style={{ color: textColors.primary }}
              >
                {link.title}
              </span>
              <ExternalLink className="w-4 h-4 opacity-40 group-hover:opacity-70 transition-opacity" style={{ color: textColors.secondary }} />
            </a>
          );
        })}
      </div>
    );
  };

  // Formules section renderer
  const renderFormules = (section: PageSection) => {
    if (!isPro || packs.length === 0) return null;

    const visiblePacks = customization.visible_pack_ids?.length > 0
      ? packs.filter(p => customization.visible_pack_ids.includes(p.id))
      : packs;
    
    if (visiblePacks.length === 0) return null;

    return (
      <div className="mb-10">
        <h2 
          className="text-xl font-semibold mb-5 tracking-tight"
          style={{ color: textColors.primary }}
        >
          {section.title}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {visiblePacks.slice(0, 6).map((pack, index) => {
            const hasVariants = pack.price_variants && pack.price_variants.length > 0;
            const minPrice = hasVariants 
              ? Math.min(...pack.price_variants.map(v => v.price))
              : pack.price;

            return (
              <Card 
                key={pack.id}
                className="p-4 sm:p-5 transition-all duration-300 cursor-pointer group hover:shadow-xl hover:scale-[1.02] animate-fade-in"
                style={{
                  backgroundColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.05)' : 'white',
                  borderColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
                  animationDelay: `${index * 0.05}s`,
                }}
                onClick={() => onSelectPack?.(pack)}
              >
                <div className="flex flex-col gap-2">
                  <p 
                    className="font-semibold text-sm sm:text-base leading-tight group-hover:text-primary transition-colors"
                    style={{ color: textColors.primary }}
                  >
                    {pack.name}
                  </p>
                  <p 
                    className="text-lg sm:text-xl font-bold"
                    style={{ color: customization.colors.primary }}
                  >
                    {hasVariants ? `${minPrice}€` : `${pack.price}€`}
                  </p>
                </div>
                
                {pack.duration && (
                  <p 
                    className="text-xs mt-3 flex items-center gap-1"
                    style={{ color: textColors.secondary }}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    {pack.duration}
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  // Gallery section renderer - now uses section.images
  const renderGallery = (section: PageSection) => {
    const images = section.images || [];
    if (images.length === 0) return null;

    const openLightbox = (index: number) => {
      setLightboxImages(images);
      setLightboxIndex(index);
      setLightboxOpen(true);
    };

    return (
      <div className="mb-10">
        <h2 
          className="text-xl font-semibold mb-5 tracking-tight"
          style={{ color: textColors.primary }}
        >
          {section.title}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {images.slice(0, 8).map((url, index) => (
            <button 
              key={index} 
              className="aspect-square rounded-xl overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 transition-transform duration-300 hover:scale-[1.03] animate-fade-in"
              style={{ 
                '--tw-ring-color': customization.colors.primary,
                animationDelay: `${index * 0.05}s`,
              } as React.CSSProperties}
              onClick={() => openLightbox(index)}
            >
              <img
                src={url}
                alt={`${section.title} ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    );
  };

  // About section renderer - now uses section.content
  const renderAbout = (section: PageSection) => {
    const content = section.content || '';
    if (!content) return null;

    return (
      <div className="mb-10">
        <h2 
          className="text-xl font-semibold mb-4 tracking-tight"
          style={{ color: textColors.primary }}
        >
          {section.title}
        </h2>
        <p 
          className="text-sm sm:text-base leading-relaxed whitespace-pre-line"
          style={{ color: textColors.secondary }}
        >
          {content}
        </p>
      </div>
    );
  };

  // Contact section renderer
  const renderContact = (section: PageSection) => {
    return (
      <div className="mb-10">
        <h2 
          className="text-xl font-semibold mb-5 tracking-tight"
          style={{ color: textColors.primary }}
        >
          {section.title}
        </h2>
        
        {contactSent ? (
          <Card 
            className="p-8 text-center rounded-2xl"
            style={{
              backgroundColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.05)' : 'white',
              borderColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
            }}
          >
            <CheckCircle 
              className="w-14 h-14 mx-auto mb-4" 
              style={{ color: customization.colors.accent }}
            />
            <p 
              className="font-semibold text-lg mb-1"
              style={{ color: textColors.primary }}
            >
              Demande envoyée !
            </p>
            <p style={{ color: textColors.secondary }}>
              Nous vous recontacterons rapidement.
            </p>
          </Card>
        ) : (
          <Card 
            className="p-5 sm:p-6 rounded-2xl"
            style={{
              backgroundColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.05)' : 'white',
              borderColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
            }}
          >
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label style={{ color: textColors.secondary }}>Votre nom *</Label>
                <div className="relative">
                  <User 
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" 
                    style={{ color: textColors.secondary }}
                  />
                  <Input
                    type="text"
                    placeholder="Jean Dupont"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="pl-11 h-12 rounded-xl"
                    style={{
                      backgroundColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.1)' : 'white',
                      borderColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.2)' : undefined,
                      color: textColors.primary,
                    }}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label style={{ color: textColors.secondary }}>Téléphone *</Label>
                <div className="relative">
                  <Phone 
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" 
                    style={{ color: textColors.secondary }}
                  />
                  <Input
                    type="tel"
                    placeholder="06 12 34 56 78"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="pl-11 h-12 rounded-xl"
                    style={{
                      backgroundColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.1)' : 'white',
                      borderColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.2)' : undefined,
                      color: textColors.primary,
                    }}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label style={{ color: textColors.secondary }}>Message (optionnel)</Label>
                <div className="relative">
                  <MessageSquare 
                    className="absolute left-3.5 top-3.5 w-4 h-4" 
                    style={{ color: textColors.secondary }}
                  />
                  <Textarea
                    placeholder="Décrivez votre besoin..."
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    className="pl-11 min-h-[100px] resize-none rounded-xl"
                    style={{
                      backgroundColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.1)' : 'white',
                      borderColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.2)' : undefined,
                      color: textColors.primary,
                    }}
                  />
                </div>
              </div>

              <Button 
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 text-white font-medium rounded-xl transition-all duration-300 hover:shadow-lg"
                style={{ backgroundColor: customization.colors.primary }}
              >
                {isSubmitting ? 'Envoi...' : 'Envoyer ma demande'}
                <Send className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </Card>
        )}
      </div>
    );
  };

  // Text block section renderer
  const renderTextBlock = (section: PageSection) => {
    if (!section.content) return null;

    return (
      <div className="mb-10">
        <h2 
          className="text-xl font-semibold mb-4 tracking-tight"
          style={{ color: textColors.primary }}
        >
          {section.title}
        </h2>
        <p 
          className="text-sm sm:text-base leading-relaxed whitespace-pre-line"
          style={{ color: textColors.secondary }}
        >
          {section.content}
        </p>
      </div>
    );
  };

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

  // Render section by type
  const renderSection = (section: PageSection, index: number) => {
    const sectionContent = (() => {
      switch (section.type) {
        case 'formules':
          return renderFormules(section);
        case 'gallery':
          return renderGallery(section);
        case 'about':
          return renderAbout(section);
        case 'contact':
          return renderContact(section);
        case 'text_block':
          return renderTextBlock(section);
        default:
          return null;
      }
    })();

    if (!sectionContent) return null;

    // Insert custom links at appropriate positions
    const linksPosition = customization.layout.links_position;
    const showLinksAfter = 
      (linksPosition === 'after_formules' && section.type === 'formules') ||
      (linksPosition === 'after_gallery' && section.type === 'gallery');

    return (
      <div key={section.id}>
        {sectionContent}
        {showLinksAfter && renderCustomLinks()}
      </div>
    );
  };

  return (
    <div 
      className={`min-h-screen flex flex-col ${customization.layout.dark_mode ? 'dark' : ''}`}
      style={{
        ...customStyles,
        backgroundColor: customization.layout.dark_mode ? customization.colors.secondary : '#fafafa',
      }}
    >
      {/* Cover Image with elegant gradient overlay */}
      <div 
        className="relative w-full h-44 sm:h-56"
        style={{
          background: customization.cover_url 
            ? `url(${customization.cover_url}) center/cover no-repeat`
            : `linear-gradient(135deg, ${customization.colors.primary}, ${customization.colors.secondary})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />
      </div>

      {/* Main Content */}
      <main className={`flex-1 px-4 pb-28 ${customization.layout.dark_mode ? 'bg-gray-900' : 'bg-[#fafafa]'}`}>
        <div className="max-w-2xl mx-auto">
          {/* Logo overlapping cover */}
          <div className="relative -mt-14 mb-5">
            {center.logo_url ? (
              <img 
                src={center.logo_url} 
                alt={center.name} 
                className="max-h-24 sm:max-h-28 max-w-[180px] sm:max-w-[220px] w-auto h-auto rounded-2xl object-contain border-4 shadow-xl bg-white"
                style={{ 
                  borderColor: customization.layout.dark_mode ? customization.colors.secondary : 'white',
                }}
              />
            ) : (
              <div 
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl flex items-center justify-center border-4 shadow-xl"
                style={{ 
                  backgroundColor: customization.colors.primary,
                  borderColor: customization.layout.dark_mode ? customization.colors.secondary : 'white',
                }}
              >
                <Car className="w-12 h-12 text-white" />
              </div>
            )}
          </div>

          {/* Center Name + Badge */}
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 
              className="text-2xl sm:text-3xl font-bold tracking-tight"
              style={{ color: textColors.primary }}
            >
              {center.name}
            </h1>
            {isOpen ? (
              <Badge 
                className="border-0 font-medium"
                style={{ backgroundColor: customization.colors.accent + '20', color: customization.colors.accent }}
              >
                Ouvert
              </Badge>
            ) : (
              <Badge variant="secondary" className="font-medium">Fermé</Badge>
            )}
          </div>

          {/* Tagline */}
          {customization.texts.tagline && (
            <p 
              className="mb-5 text-sm sm:text-base"
              style={{ color: textColors.secondary }}
            >
              {customization.texts.tagline}
            </p>
          )}

          {/* Social Links */}
          {(customization.social.instagram || customization.social.tiktok || customization.social.facebook || customization.social.email) && (
            <div className="flex items-center gap-2 mb-7">
              {customization.social.instagram && (
                <a
                  href={`https://instagram.com/${customization.social.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-md"
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
                  className="p-2.5 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-md"
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
                  className="p-2.5 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-md"
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
                  className="p-2.5 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-md"
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

          {/* Custom Links - Position: top */}
          {customization.layout.links_position === 'top' && renderCustomLinks()}

          {/* Info Cards Row */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3 mb-8 sm:mb-10">
            {customization.layout.show_address && center.address && (
              <Card 
                className="p-4 flex items-center gap-3 sm:block sm:text-center rounded-2xl transition-all duration-300 hover:shadow-md"
                style={{
                  backgroundColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.05)' : 'white',
                  borderColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
                }}
              >
                <MapPin className="w-5 h-5 flex-shrink-0 sm:mx-auto sm:mb-2" style={{ color: customization.colors.primary }} />
                <p 
                  className="text-sm truncate flex-1"
                  style={{ color: textColors.primary }}
                >
                  {center.address}
                </p>
              </Card>
            )}
            {customization.layout.show_hours && (
              <Card 
                className="p-4 flex items-center gap-3 sm:block sm:text-center rounded-2xl transition-all duration-300 hover:shadow-md"
                style={{
                  backgroundColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.05)' : 'white',
                  borderColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
                }}
              >
                <Clock className="w-5 h-5 flex-shrink-0 sm:mx-auto sm:mb-2" style={{ color: customization.colors.primary }} />
                <p 
                  className="text-sm"
                  style={{ color: textColors.primary }}
                >
                  9h - 19h
                </p>
              </Card>
            )}
            {customization.layout.show_phone && center.phone && (
              <Card 
                className="p-4 flex items-center gap-3 sm:block sm:text-center rounded-2xl transition-all duration-300 hover:shadow-md"
                style={{
                  backgroundColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.05)' : 'white',
                  borderColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
                }}
              >
                <Phone className="w-5 h-5 flex-shrink-0 sm:mx-auto sm:mb-2" style={{ color: customization.colors.primary }} />
                <a 
                  href={`tel:${center.phone}`}
                  className="text-sm transition-colors flex-1 hover:underline"
                  style={{ color: textColors.primary }}
                >
                  {center.phone}
                </a>
              </Card>
            )}
          </div>

          {/* Dynamic Sections */}
          {activeSections.map((section, index) => renderSection(section, index))}

          {/* Custom Links - Position: bottom (before footer) */}
          {customization.layout.links_position === 'bottom' && renderCustomLinks()}
        </div>
      </main>

      {/* Gallery Lightbox - now uses dynamic lightboxImages */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl w-full p-0 bg-black/95 border-none">
          <div className="relative flex items-center justify-center min-h-[50vh] max-h-[90vh]">
            <button 
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            
            {lightboxImages.length > 1 && (
              <>
                <button 
                  onClick={() => setLightboxIndex((prev) => prev === 0 ? lightboxImages.length - 1 : prev - 1)}
                  className="absolute left-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button 
                  onClick={() => setLightboxIndex((prev) => prev === lightboxImages.length - 1 ? 0 : prev + 1)}
                  className="absolute right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </>
            )}
            
            <img
              src={lightboxImages[lightboxIndex] || ''}
              alt={`Image ${lightboxIndex + 1}`}
              className="max-w-full max-h-[85vh] object-contain"
            />
            
            {lightboxImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium">
                {lightboxIndex + 1} / {lightboxImages.length}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Fixed CTA Button */}
      <div 
        className="fixed bottom-0 left-0 right-0 p-4 backdrop-blur-md border-t z-50"
        style={{ 
          backgroundColor: customization.layout.dark_mode ? 'rgba(17,24,39,0.9)' : 'rgba(255,255,255,0.9)',
          borderColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
        }}
      >
        <div className="max-w-2xl mx-auto">
          <Button 
            size="lg" 
            onClick={onStartBooking}
            className="w-full rounded-2xl text-base font-medium py-6 text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.01]"
            style={{ backgroundColor: customization.colors.primary }}
          >
            {customization.texts.cta_button || 'Réserver'}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer 
        className="pb-28 pt-6 px-4 text-center"
        style={{ backgroundColor: customization.layout.dark_mode ? '#111827' : '#fafafa' }}
      >
        <p 
          className="text-xs"
          style={{ color: textColors.secondary }}
        >
          Propulsé par <span className="font-medium">CleaningPage</span>
        </p>
      </footer>
    </div>
  );
}
