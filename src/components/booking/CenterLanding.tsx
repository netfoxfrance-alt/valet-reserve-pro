import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { MapPin, Phone, Clock, User, MessageSquare, Send, CheckCircle, Instagram, Mail, Link2, ShoppingBag, BookOpen, Video, Calendar, FileText, ExternalLink, X, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { Center, Pack } from '@/hooks/useCenter';
import { CenterCustomization, CustomLink, defaultCustomization, PageBlock, defaultBlocks, migrateToBlocks } from '@/types/customization';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export interface RecognizedClient {
  client_id: string;
  first_name: string;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  client_address: string | null;
  service_id: string | null;
  service_name: string | null;
  service_price: number | null;
  service_duration_minutes: number | null;
}

interface CenterLandingProps {
  center: Center;
  packs: Pack[];
  onStartBooking: () => void;
  onSelectPack?: (pack: Pack) => void;
  onRecognizedClient?: (client: RecognizedClient) => void;
  hasPacks: boolean;
  isPro: boolean;
  isPreview?: boolean;
}

// Days in French
const DAYS_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

// Default hours for display
const DEFAULT_HOURS = [
  { day: 1, start: '09:00', end: '19:00', enabled: true },
  { day: 2, start: '09:00', end: '19:00', enabled: true },
  { day: 3, start: '09:00', end: '19:00', enabled: true },
  { day: 4, start: '09:00', end: '19:00', enabled: true },
  { day: 5, start: '09:00', end: '19:00', enabled: true },
  { day: 6, start: '09:00', end: '19:00', enabled: true },
  { day: 0, start: '09:00', end: '19:00', enabled: false },
];

export function CenterLanding({ center, packs, onStartBooking, onSelectPack, onRecognizedClient, hasPacks, isPro, isPreview = false }: CenterLandingProps) {
  const { toast } = useToast();
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [hoursOpen, setHoursOpen] = useState(false);
  
  // Client recognition state
  const [showClientLookup, setShowClientLookup] = useState(false);
  const [lookupEmail, setLookupEmail] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [recognizedClient, setRecognizedClient] = useState<RecognizedClient | null>(null);
  const [lookupNotFound, setLookupNotFound] = useState(false);

  // Check if client recognition is enabled
  const clientRecognitionEnabled = (center.customization as any)?.settings?.client_recognition !== false;

  // Check if center is currently open
  const now = new Date();
  const currentDay = now.getDay();
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTimeString = `${currentHour.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')}`;

  // Get today's hours
  const todayHours = DEFAULT_HOURS.find(h => h.day === currentDay);
  const isOpen = todayHours?.enabled && currentTimeString >= todayHours.start && currentTimeString < todayHours.end;

  // Get next opening info
  const getNextOpeningInfo = () => {
    if (isOpen && todayHours) {
      return { type: 'closing', time: todayHours.end };
    }
    
    // Find next open day
    for (let i = 1; i <= 7; i++) {
      const nextDay = (currentDay + i) % 7;
      const nextHours = DEFAULT_HOURS.find(h => h.day === nextDay);
      if (nextHours?.enabled) {
        const dayName = i === 1 ? 'Demain' : DAYS_FR[nextDay];
        return { type: 'opening', day: dayName, time: nextHours.start };
      }
    }
    return null;
  };

  const nextInfo = getNextOpeningInfo();

  // Get customization with fallback to defaults
  const customization: CenterCustomization = useMemo(() => {
    const c = center.customization || defaultCustomization;
    return {
      colors: { ...defaultCustomization.colors, ...(c.colors || {}) },
      texts: { ...defaultCustomization.texts, ...(c.texts || {}) },
      layout: { ...defaultCustomization.layout, ...(c.layout || {}) },
      social: { ...defaultCustomization.social, ...(c.social || {}) },
      seo: { ...defaultCustomization.seo, ...(c.seo || {}) },
      settings: { ...defaultCustomization.settings, ...(c.settings || {}) },
      cover_url: c.cover_url ?? null,
      gallery_images: c.gallery_images ?? [],
      visible_pack_ids: c.visible_pack_ids ?? [],
      custom_links: c.custom_links ?? [],
      blocks: migrateToBlocks(c),
    };
  }, [center.customization]);

  // Get sorted, enabled blocks - respects user-defined order
  const activeBlocks = useMemo(() => {
    return [...customization.blocks]
      .filter(b => b.enabled)
      .sort((a, b) => a.order - b.order);
  }, [customization.blocks]);

  // Quick action blocks (phone, address) - displayed at the top
  // In minimal header mode, phone is already in the header bar, so exclude it
  const quickActions = useMemo(() => {
    const isMinimal = (customization.layout.header_style || 'banner') === 'minimal';
    return activeBlocks.filter(b => {
      if (b.type === 'phone' && isMinimal) return false;
      return ['phone', 'address'].includes(b.type);
    });
  }, [activeBlocks, customization.layout.header_style]);

  // All other blocks in user-defined order (excluding quick actions)
  const orderedBlocks = useMemo(() => {
    return activeBlocks.filter(b => !['phone', 'address'].includes(b.type));
  }, [activeBlocks]);

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
      <div className="grid grid-cols-1 gap-2">
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

  // Formules block renderer
  const renderFormules = (block: PageBlock) => {
    if (!isPro || packs.length === 0) return null;

    const visiblePacks = customization.visible_pack_ids?.length > 0
      ? packs.filter(p => customization.visible_pack_ids.includes(p.id))
      : packs;
    
    if (visiblePacks.length === 0) return null;

    return (
      <div key={block.id} className="mb-10">
        <h2 
          className="text-xl font-semibold mb-5 tracking-tight"
          style={{ color: textColors.primary }}
        >
          {block.title}
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

  // Gallery block renderer
  const renderGallery = (block: PageBlock) => {
    const images = block.images || [];
    if (images.length === 0) return null;

    const openLightbox = (index: number) => {
      setLightboxImages(images);
      setLightboxIndex(index);
      setLightboxOpen(true);
    };

    return (
      <div key={block.id} className="mb-10">
        <h2 
          className="text-xl font-semibold mb-5 tracking-tight"
          style={{ color: textColors.primary }}
        >
          {block.title}
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
                alt={`${block.title} ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Text block renderer
  const renderTextBlock = (block: PageBlock) => {
    if (!block.content) return null;

    return (
      <div key={block.id} className="mb-10">
        <h2 
          className="text-xl font-semibold mb-4 tracking-tight"
          style={{ color: textColors.primary }}
        >
          {block.title}
        </h2>
        <p 
          className="text-sm sm:text-base leading-relaxed whitespace-pre-line"
          style={{ color: textColors.secondary }}
        >
          {block.content}
        </p>
      </div>
    );
  };

  // Links block renderer
  const renderLinks = (block: PageBlock) => {
    return (
      <div key={block.id} className="mb-6">
        <h2 
          className="text-lg font-semibold mb-4 tracking-tight"
          style={{ color: textColors.primary }}
        >
          {block.title}
        </h2>
        {renderCustomLinks()}
      </div>
    );
  };

  // Contact block renderer
  const renderContact = (block: PageBlock) => {
    return (
      <div key={block.id} className="mb-10">
        <h2 
          className="text-xl font-semibold mb-5 tracking-tight"
          style={{ color: textColors.primary }}
        >
          {block.title}
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
                <Label style={{ color: textColors.secondary }}>Email *</Label>
                <div className="relative">
                  <Mail 
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" 
                    style={{ color: textColors.secondary }}
                  />
                  <Input
                    type="email"
                    placeholder="jean.dupont@email.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
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

  // Render individual info block with its own style
  const renderInfoBlock = (block: PageBlock, content: string | null, icon: React.ReactNode, href?: string) => {
    if (!content) return null;
    
    const style = block.infoStyle || 'minimal';
    const Wrapper = href ? 'a' : 'div';
    const wrapperProps = href ? { href, ...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {}) } : {};

    // Style: Minimal - clean, understated
    if (style === 'minimal') {
      return (
        <Wrapper
          {...wrapperProps}
          className="flex items-center gap-2 text-sm transition-opacity hover:opacity-70"
          style={{ color: textColors.secondary }}
        >
          <span className="w-5 h-5 flex items-center justify-center" style={{ color: customization.colors.primary }}>
            {icon}
          </span>
          <span>{content}</span>
        </Wrapper>
      );
    }

    // Style: Pill - compact badge
    if (style === 'pill') {
      return (
        <Wrapper
          {...wrapperProps}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ 
            backgroundColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
            color: textColors.primary,
          }}
        >
          <span style={{ color: customization.colors.primary }}>{icon}</span>
          <span>{content}</span>
        </Wrapper>
      );
    }

    // Style: Card - full card with label
    return (
      <Wrapper
        {...wrapperProps}
        className="flex items-center gap-3 p-4 rounded-2xl transition-all hover:scale-[1.01] active:scale-[0.99]"
        style={{ 
          backgroundColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.05)' : 'white',
          border: `1px solid ${customization.layout.dark_mode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'}`,
          boxShadow: customization.layout.dark_mode ? 'none' : '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: customization.colors.primary + '15' }}
        >
          <span style={{ color: customization.colors.primary }}>{icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium" style={{ color: textColors.primary }}>{content}</p>
        </div>
        {href && <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: textColors.secondary }} />}
      </Wrapper>
    );
  };

  // Render phone block - Always as a nice button
  const renderPhone = (block: PageBlock) => {
    if (!center.phone) return null;
    
    return (
      <div key={block.id} className="mb-4">
        <a
          href={`tel:${center.phone}`}
          className="flex items-center justify-center gap-3 w-full py-3.5 px-5 rounded-2xl font-medium text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg"
          style={{ 
            backgroundColor: customization.colors.primary + '12',
            color: customization.colors.primary,
            border: `1px solid ${customization.colors.primary}25`,
          }}
        >
          <Phone className="w-5 h-5" />
          <span>Appeler · {center.phone}</span>
        </a>
      </div>
    );
  };

  // Render address block - Nice button style
  const renderAddress = (block: PageBlock) => {
    if (!center.address) return null;
    
    return (
      <div key={block.id} className="mb-4">
        <a
          href={`https://maps.google.com/?q=${encodeURIComponent(center.address)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 w-full py-3.5 px-5 rounded-2xl font-medium text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg"
          style={{ 
            backgroundColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
            color: textColors.primary,
            border: `1px solid ${customization.layout.dark_mode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'}`,
          }}
        >
          <MapPin className="w-5 h-5" style={{ color: customization.colors.primary }} />
          <span className="truncate">{center.address}</span>
        </a>
      </div>
    );
  };

  // Render collapsible hours block (Google Maps style)
  const renderHours = (block: PageBlock) => {
    const formatTime = (time: string) => time.replace(':', 'h');

    return (
      <div key={block.id} className="mb-6 relative z-10">
        <Collapsible open={hoursOpen} onOpenChange={setHoursOpen}>
          <div 
            className="rounded-2xl overflow-hidden"
            style={{
              backgroundColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.05)' : 'white',
              border: `1px solid ${customization.layout.dark_mode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'}`,
            }}
          >
            <CollapsibleTrigger asChild>
              <button 
                className="flex items-center gap-3 w-full text-left p-4 transition-colors hover:bg-black/5"
                style={{ color: textColors.secondary }}
              >
                <span 
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: customization.colors.primary + '15' }}
                >
                  <Clock className="w-5 h-5" style={{ color: customization.colors.primary }} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className={cn("font-medium", isOpen ? "text-green-600" : "text-red-500")}>
                    {isOpen ? 'Ouvert' : 'Fermé'}
                  </span>
                  {nextInfo && (
                    <span className="ml-1.5" style={{ color: textColors.secondary }}>
                      {isOpen 
                        ? `· Ferme à ${formatTime(nextInfo.time)}`
                        : `· Ouvre ${nextInfo.day} à ${formatTime(nextInfo.time!)}`
                      }
                    </span>
                  )}
                </span>
                <ChevronDown 
                  className={cn(
                    "w-5 h-5 flex-shrink-0 transition-transform duration-200",
                    hoursOpen && "rotate-180"
                  )} 
                  style={{ color: textColors.secondary }}
                />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div 
                className="px-4 pb-4 space-y-2 border-t"
                style={{ 
                  borderColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                }}
              >
                <div className="pt-3">
                  {/* Reorder: Monday first */}
                  {[1, 2, 3, 4, 5, 6, 0].map(dayNum => {
                    const dayHours = DEFAULT_HOURS.find(h => h.day === dayNum);
                    const isToday = dayNum === currentDay;
                    
                    return (
                      <div 
                        key={dayNum}
                        className={cn(
                          "flex justify-between text-sm py-1.5",
                          isToday && "font-semibold"
                        )}
                        style={{ color: isToday ? textColors.primary : textColors.secondary }}
                      >
                        <span>{DAYS_FR[dayNum]}</span>
                        <span className={!dayHours?.enabled ? "text-red-500" : ""}>
                          {dayHours?.enabled 
                            ? `${formatTime(dayHours.start)} - ${formatTime(dayHours.end)}`
                            : 'Fermé'
                          }
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      </div>
    );
  };

  // Render reviews block (Google / TripAdvisor)
  const renderReviews = (block: PageBlock) => {
    const isGoogle = block.reviewPlatform === 'google';
    const rating = block.reviewRating || 5;
    const count = block.reviewCount || 0;
    const url = block.reviewUrl?.trim();

    // Use URL directly - only add https:// if no protocol specified
    const absoluteUrl = !url ? null 
      : (url.startsWith('http://') || url.startsWith('https://')) ? url 
      : `https://${url}`;

    const Wrapper = absoluteUrl ? 'a' : 'div';
    const wrapperProps = absoluteUrl ? { 
      href: absoluteUrl, 
      target: '_blank', 
      rel: 'noopener noreferrer' 
    } : {};

    return (
      <div key={block.id} className="mb-4">
        <Wrapper
          {...wrapperProps}
          className="flex items-center gap-3 p-4 rounded-2xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group cursor-pointer"
          style={{
            backgroundColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.05)' : 'white',
            borderColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
          }}
        >
          {/* Platform icon */}
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-white shadow-sm">
            {isGoogle ? (
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            ) : (
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#00AF87">
                <path d="M12.006 4.295c-2.67 0-5.338.784-7.645 2.353H0l1.963 2.135a5.997 5.997 0 0 0 4.04 10.43 5.976 5.976 0 0 0 4.075-1.6L12 19.705l1.922-2.09a5.972 5.972 0 0 0 4.072 1.598 5.997 5.997 0 0 0 4.04-10.43L24 6.647h-4.35a13.573 13.573 0 0 0-7.644-2.352zM12 6.255a11.31 11.31 0 0 1 4.786 1.058 5.976 5.976 0 0 0-9.573 0A11.31 11.31 0 0 1 12 6.255zm-6.003 3.088a4.008 4.008 0 1 1 0 8.017 4.008 4.008 0 0 1 0-8.017zm12.006 0a4.008 4.008 0 1 1 0 8.017 4.008 4.008 0 0 1 0-8.017zM5.997 11.21a2.143 2.143 0 1 0 0 4.286 2.143 2.143 0 0 0 0-4.286zm12.006 0a2.143 2.143 0 1 0 0 4.286 2.143 2.143 0 0 0 0-4.286z"/>
              </svg>
            )}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm" style={{ color: textColors.primary }}>
              {isGoogle ? 'Voir nos avis Google' : 'Voir nos avis TripAdvisor'}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              {/* Stars */}
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={cn(
                      "w-3.5 h-3.5",
                      i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"
                    )}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>
              <span className="font-semibold text-sm" style={{ color: textColors.primary }}>{rating}</span>
              <span className="text-xs" style={{ color: textColors.secondary }}>({count} avis)</span>
            </div>
          </div>
          
          {/* External link icon */}
          {absoluteUrl && (
            <ExternalLink className="w-4 h-4 opacity-40 group-hover:opacity-70 transition-opacity flex-shrink-0" style={{ color: textColors.secondary }} />
          )}
        </Wrapper>
      </div>
    );
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactPhone.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('contact_requests')
        .insert({
          center_id: center.id,
          client_name: contactName.trim(),
          client_email: contactEmail.trim().toLowerCase(),
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

  // Client email lookup handler
  const handleClientLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupEmail.trim() || !center.id) return;
    
    setLookupLoading(true);
    setLookupNotFound(false);
    setRecognizedClient(null);
    
    try {
      const { data, error } = await supabase.rpc('lookup_client_by_email', {
        p_center_id: center.id,
        p_email: lookupEmail.trim(),
      });
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const client = data[0] as RecognizedClient;
        setRecognizedClient(client);
      } else {
        setLookupNotFound(true);
      }
    } catch (err) {
      console.error('Client lookup error:', err);
      setLookupNotFound(true);
    } finally {
      setLookupLoading(false);
    }
  };


  const renderBlock = (block: PageBlock) => {
    switch (block.type) {
      case 'formules':
        return renderFormules(block);
      case 'gallery':
        return renderGallery(block);
      case 'text_block':
        return renderTextBlock(block);
      case 'links':
        return renderLinks(block);
      case 'contact':
        return renderContact(block);
      case 'hours':
        return renderHours(block);
      case 'address':
        return renderAddress(block);
      case 'phone':
        return renderPhone(block);
      case 'reviews':
        return renderReviews(block);
      default:
        return null;
    }
  };

  // Social icons
  const socialLinks = [
    { key: 'instagram', url: customization.social.instagram ? `https://instagram.com/${customization.social.instagram}` : null, icon: Instagram },
    { key: 'tiktok', url: customization.social.tiktok ? `https://tiktok.com/@${customization.social.tiktok}` : null, icon: () => (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
      </svg>
    )},
    { key: 'facebook', url: customization.social.facebook ? `https://facebook.com/${customization.social.facebook}` : null, icon: () => (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    )},
    { key: 'email', url: customization.social.email ? `mailto:${customization.social.email}` : null, icon: Mail },
  ].filter(s => s.url);

  // Check if there's a cover image
  const hasCover = Boolean(customization.cover_url);
  const headerStyle = customization.layout.header_style || 'banner';
  const isMinimalHeader = headerStyle === 'minimal';

  return (
    <div 
      className="min-h-screen transition-colors duration-300"
      style={{ 
        ...customStyles,
        backgroundColor: customization.layout.dark_mode ? '#0f0f0f' : '#fafafa',
      }}
    >

      {/* Header Section */}
      {isMinimalHeader ? (
        // Minimal header - discrete bar with logo + phone CTA
        <div 
          className="border-b"
          style={{
            backgroundColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.03)' : 'white',
            borderColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          }}
        >
          <div className={cn("max-w-5xl mx-auto px-4 py-3", !isPreview && "lg:px-8")}>
            <div className="flex items-center justify-between gap-3">
              {/* Left: Logo + Name */}
              <div className="flex items-center gap-3 min-w-0">
                {center.logo_url && (
                  <div className="flex-shrink-0 rounded-xl overflow-hidden">
                    <img
                      src={center.logo_url}
                      alt={center.name}
                      className="max-w-[100px] max-h-[36px] lg:max-w-[120px] lg:max-h-[40px] w-auto h-auto object-contain"
                    />
                  </div>
                )}
                {!center.logo_url && (
                  <h1 
                    className="text-base font-semibold tracking-tight truncate"
                    style={{ color: textColors.primary }}
                  >
                    {center.name}
                  </h1>
                )}
              </div>
              
              {/* Right: Phone CTA */}
              {center.phone && (
                <a
                  href={`tel:${center.phone}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:opacity-90 active:scale-[0.97] flex-shrink-0"
                  style={{ 
                    backgroundColor: customization.colors.primary,
                    color: 'white',
                  }}
                >
                  <Phone className="w-4 h-4" />
                  <span className="hidden sm:inline">Appeler</span>
                </a>
              )}
            </div>
          </div>
        </div>
      ) : hasCover ? (
        // With cover image (banner style)
        <div className="relative mb-6">
          <img
            src={customization.cover_url!}
            alt="Cover"
            className="w-full h-48 sm:h-56 lg:h-72 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          
          {/* Overlay header content */}
          <div className="absolute bottom-0 left-0 right-0 pb-6">
            <div className="max-w-5xl mx-auto px-4 lg:px-8">
              <div className="flex items-end gap-4">
                {center.logo_url && (
                  <div className="flex-shrink-0 rounded-2xl overflow-hidden shadow-md">
                    <img
                      src={center.logo_url}
                      alt={center.name}
                      className="max-w-[100px] max-h-[60px] lg:max-w-[140px] lg:max-h-[80px] w-auto h-auto object-contain"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight truncate">
                    {center.name}
                  </h1>
                  {customization.texts.tagline && (
                    <p className="text-sm text-white/80 truncate">
                      {customization.texts.tagline}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Without cover image - Clean minimal header (banner style without image)
        <div 
          className="pt-8 pb-6 mb-6"
          style={{
            background: customization.layout.dark_mode 
              ? 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)'
              : 'linear-gradient(180deg, rgba(0,0,0,0.02) 0%, transparent 100%)',
          }}
        >
          <div className={cn("max-w-5xl mx-auto px-4", !isPreview && "lg:px-8")}>
            <div className={cn(
              "flex flex-col items-center text-center",
              !isPreview && "lg:flex-row lg:text-left lg:items-center lg:gap-6"
            )}>
               {center.logo_url && (
                <div className={cn("mb-4 rounded-2xl overflow-hidden inline-block", !isPreview && "lg:mb-0")}>
                  <img
                    src={center.logo_url}
                    alt={center.name}
                    className={cn(
                      "max-w-[160px] max-h-[80px] w-auto h-auto object-contain",
                      !isPreview && "lg:max-w-[180px] lg:max-h-[90px]"
                    )}
                  />
                </div>
              )}
              <div className="flex-1">
                <h1 
                  className={cn(
                    "text-2xl font-bold tracking-tight mb-1",
                    !isPreview && "lg:text-3xl"
                  )}
                  style={{ color: textColors.primary }}
                >
                  {center.name}
                </h1>
                {customization.texts.tagline && (
                  <p 
                    className={cn("text-sm mb-3", !isPreview && "lg:text-base")}
                    style={{ color: textColors.secondary }}
                  >
                    {customization.texts.tagline}
                  </p>
                )}
                {/* Open Status */}
                <div 
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium",
                    isOpen ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-500"
                  )}
                >
                  <span className={cn("w-2 h-2 rounded-full", isOpen ? "bg-green-500" : "bg-red-500")} />
                  {isOpen ? 'Ouvert' : 'Fermé'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Minimal header: add name, tagline and status below the bar */}
      {isMinimalHeader && (
        <div className={cn("max-w-5xl mx-auto px-4 pt-6 pb-2", !isPreview && "lg:px-8")}>
          <div className={cn("flex flex-col items-center text-center", !isPreview && "lg:items-start lg:text-left")}>
            <h1 
              className={cn("text-2xl font-bold tracking-tight mb-1", !isPreview && "lg:text-3xl")}
              style={{ color: textColors.primary }}
            >
              {center.name}
            </h1>
            {customization.texts.tagline && (
              <p 
                className={cn("text-sm mb-3", !isPreview && "lg:text-base")}
                style={{ color: textColors.secondary }}
              >
                {customization.texts.tagline}
              </p>
            )}
            <div 
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium",
                isOpen ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-500"
              )}
            >
              <span className={cn("w-2 h-2 rounded-full", isOpen ? "bg-green-500" : "bg-red-500")} />
              {isOpen ? 'Ouvert' : 'Fermé'}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className={cn("max-w-5xl mx-auto px-4", !isPreview && "lg:px-8")}>
        {/* Open status badge (when cover exists) */}
        {hasCover && !isMinimalHeader && (
          <div className={cn("flex justify-center mb-4", !isPreview && "lg:justify-start")}>
            <div 
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium",
                isOpen ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-500"
              )}
            >
              <span className={cn("w-2 h-2 rounded-full", isOpen ? "bg-green-500" : "bg-red-500")} />
              {isOpen ? 'Ouvert' : 'Fermé'}
            </div>
          </div>
        )}

        {/* Social Icons */}
        {socialLinks.length > 0 && (
          <div className={cn("flex justify-center gap-3 mb-6", !isPreview && "lg:justify-start")}>
            {socialLinks.map(({ key, url, icon: Icon }) => (
              <a
                key={key}
                href={url!}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                style={{
                  backgroundColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  color: textColors.secondary,
                }}
              >
                <Icon />
              </a>
            ))}
          </div>
        )}

        {/* Quick Action Buttons (Phone, Address) */}
        {quickActions.length > 0 && (
          <div className={cn("flex flex-col gap-3 mb-8", !isPreview && "lg:flex-row")}>
            {quickActions.map(block => (
              <div key={block.id} className={cn(!isPreview && "lg:flex-1")}>
                {renderBlock(block)}
              </div>
            ))}
          </div>
        )}

        {/* Client Recognition Section */}
        {isPro && clientRecognitionEnabled && !recognizedClient && (
          <div className="mb-8">
            {!showClientLookup ? (
              <button
                onClick={() => setShowClientLookup(true)}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl text-sm font-medium transition-all duration-300 hover:scale-[1.01]"
                style={{
                  backgroundColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  color: textColors.secondary,
                  border: `1px solid ${customization.layout.dark_mode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'}`,
                }}
              >
                <Mail className="w-4 h-4" />
                Formule personnalisée ? Identifiez-vous
              </button>
            ) : (
              <Card
                className="p-5 rounded-2xl"
                style={{
                  backgroundColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.05)' : 'white',
                  borderColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
                }}
              >
                <p className="text-sm font-medium mb-3" style={{ color: textColors.primary }}>
                  Entrez votre adresse email
                </p>
                <form onSubmit={handleClientLookup} className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: textColors.secondary }} />
                    <Input
                      type="email"
                      placeholder="vous@exemple.fr"
                      value={lookupEmail}
                      onChange={(e) => { setLookupEmail(e.target.value); setLookupNotFound(false); }}
                      className="pl-11 h-11 rounded-xl"
                      style={{
                        backgroundColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.1)' : 'white',
                        borderColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.2)' : undefined,
                        color: textColors.primary,
                      }}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={lookupLoading || !lookupEmail.trim()}
                    className="h-11 px-5 rounded-xl text-white font-medium"
                    style={{ backgroundColor: customization.colors.primary }}
                  >
                    {lookupLoading ? '...' : 'Valider'}
                  </Button>
                </form>
                {lookupNotFound && (
                  <p className="text-sm mt-3" style={{ color: textColors.secondary }}>
                    Email non reconnu. Vous pouvez réserver normalement ci-dessous.
                  </p>
                )}
              </Card>
            )}
          </div>
        )}

        {/* Recognized Client Card */}
        {recognizedClient && (
          <div className="mb-8">
            <Card
              className="p-6 rounded-2xl"
              style={{
                backgroundColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.05)' : 'white',
                borderColor: customization.colors.primary + '40',
                boxShadow: `0 0 0 1px ${customization.colors.primary}20`,
              }}
            >
              <p className="text-lg font-semibold mb-1" style={{ color: textColors.primary }}>
                Bonjour {recognizedClient.first_name} ! 👋
              </p>
              {recognizedClient.service_name ? (
                <>
                  <p className="text-sm mb-4" style={{ color: textColors.secondary }}>
                    Votre prestation personnalisée :
                  </p>
                  <div
                    className="flex items-center justify-between p-4 rounded-xl mb-4"
                    style={{
                      backgroundColor: customization.colors.primary + '10',
                    }}
                  >
                    <div>
                      <p className="font-semibold" style={{ color: textColors.primary }}>
                        {recognizedClient.service_name}
                      </p>
                      <p className="text-sm flex items-center gap-1 mt-1" style={{ color: textColors.secondary }}>
                        <Clock className="w-3.5 h-3.5" />
                        {recognizedClient.service_duration_minutes} min
                      </p>
                    </div>
                    <p className="text-2xl font-bold" style={{ color: customization.colors.primary }}>
                      {recognizedClient.service_price}€
                    </p>
                  </div>
                  <Button
                    onClick={() => onRecognizedClient?.(recognizedClient)}
                    className="w-full h-12 text-base font-semibold rounded-xl text-white"
                    style={{ backgroundColor: customization.colors.primary }}
                  >
                    Choisir un créneau
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm mb-4" style={{ color: textColors.secondary }}>
                    Choisissez votre formule ci-dessous.
                  </p>
                  <Button
                    onClick={() => {
                      onRecognizedClient?.(recognizedClient);
                      onStartBooking();
                    }}
                    className="w-full h-12 text-base font-semibold rounded-xl text-white"
                    style={{ backgroundColor: customization.colors.primary }}
                  >
                    Voir les formules
                  </Button>
                </>
              )}
              <button
                onClick={() => { setRecognizedClient(null); setShowClientLookup(false); setLookupEmail(''); }}
                className="w-full text-center text-xs mt-3 underline"
                style={{ color: textColors.secondary }}
              >
                Ce n'est pas moi
              </button>
            </Card>
          </div>
        )}

        {/* All blocks in user-defined order */}
        <div className="space-y-6">
          {orderedBlocks.map(block => renderBlock(block))}
        </div>

        {/* Footer */}
        <div className="text-center pt-8 mt-8 pb-24 border-t" style={{ borderColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }}>
          <p className="text-xs" style={{ color: textColors.secondary }}>
            Propulsé par <span className="font-medium">CleaningPage</span>
          </p>
        </div>
      </div>

      {/* Fixed CTA Bar - Apple Premium Style */}
      {hasPacks && isPro && (
        <div 
          className={cn(
            "bottom-0 left-0 right-0 z-50 border-t backdrop-blur-xl safe-area-pb",
            isPreview ? "sticky" : "fixed"
          )}
          style={{ 
            backgroundColor: customization.layout.dark_mode 
              ? 'rgba(15, 15, 15, 0.85)' 
              : 'rgba(255, 255, 255, 0.85)',
            borderColor: customization.layout.dark_mode 
              ? 'rgba(255, 255, 255, 0.1)' 
              : 'rgba(0, 0, 0, 0.06)',
          }}
        >
          <div className="max-w-5xl mx-auto px-4 py-3">
            <Button
              onClick={onStartBooking}
              className="w-full lg:w-auto lg:min-w-[200px] lg:mx-auto lg:block h-12 text-base font-semibold rounded-xl transition-all duration-300 hover:opacity-90 active:scale-[0.98]"
              style={{ 
                backgroundColor: customization.colors.primary,
                color: 'white',
              }}
            >
              {customization.texts.cta_button || 'Réserver'}
            </Button>
          </div>
        </div>
      )}

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl p-0 bg-black border-none">
          <div className="relative">
            <img
              src={lightboxImages[lightboxIndex]}
              alt={`Image ${lightboxIndex + 1}`}
              className="w-full h-auto max-h-[80vh] object-contain"
            />
            
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {lightboxImages.length > 1 && (
              <>
                <button
                  onClick={() => setLightboxIndex((lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setLightboxIndex((lightboxIndex + 1) % lightboxImages.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-black/50 text-white text-sm">
              {lightboxIndex + 1} / {lightboxImages.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
