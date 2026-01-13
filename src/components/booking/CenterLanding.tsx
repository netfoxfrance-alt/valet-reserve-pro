import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { MapPin, Phone, Clock, User, MessageSquare, Send, CheckCircle, Instagram, Mail, Link2, ShoppingBag, BookOpen, Video, Calendar, FileText, ExternalLink, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Center, Pack } from '@/hooks/useCenter';
import { CenterCustomization, CustomLink, defaultCustomization, PageBlock, defaultBlocks, migrateToBlocks } from '@/types/customization';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

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
      blocks: migrateToBlocks(c),
    };
  }, [center.customization]);

  // Get sorted, enabled blocks
  const activeBlocks = useMemo(() => {
    return [...customization.blocks]
      .filter(b => b.enabled)
      .sort((a, b) => a.order - b.order);
  }, [customization.blocks]);

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
      <div key={block.id} className="mb-10">
        <h2 
          className="text-xl font-semibold mb-5 tracking-tight"
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

  // Hours block renderer
  const renderHours = (block: PageBlock) => {
    return (
      <div key={block.id} className="mb-10">
        <h2 
          className="text-xl font-semibold mb-4 tracking-tight"
          style={{ color: textColors.primary }}
        >
          {block.title}
        </h2>
        <Card 
          className="p-4 rounded-2xl"
          style={{
            backgroundColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.05)' : 'white',
            borderColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
          }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: customization.colors.primary + '15' }}
            >
              <Clock className="w-5 h-5" style={{ color: customization.colors.primary }} />
            </div>
            <div>
              <p className="font-medium" style={{ color: textColors.primary }}>Lun - Sam</p>
              <p className="text-sm" style={{ color: textColors.secondary }}>9h00 - 19h00</p>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  // Address block renderer
  const renderAddress = (block: PageBlock) => {
    if (!center.address) return null;
    
    return (
      <div key={block.id} className="mb-10">
        <h2 
          className="text-xl font-semibold mb-4 tracking-tight"
          style={{ color: textColors.primary }}
        >
          {block.title}
        </h2>
        <Card 
          className="p-4 rounded-2xl"
          style={{
            backgroundColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.05)' : 'white',
            borderColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
          }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: customization.colors.primary + '15' }}
            >
              <MapPin className="w-5 h-5" style={{ color: customization.colors.primary }} />
            </div>
            <p className="font-medium" style={{ color: textColors.primary }}>{center.address}</p>
          </div>
        </Card>
      </div>
    );
  };

  // Phone block renderer
  const renderPhone = (block: PageBlock) => {
    if (!center.phone) return null;
    
    return (
      <div key={block.id} className="mb-10">
        <h2 
          className="text-xl font-semibold mb-4 tracking-tight"
          style={{ color: textColors.primary }}
        >
          {block.title}
        </h2>
        <Card 
          className="p-4 rounded-2xl"
          style={{
            backgroundColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.05)' : 'white',
            borderColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
          }}
        >
          <a href={`tel:${center.phone}`} className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: customization.colors.primary + '15' }}
            >
              <Phone className="w-5 h-5" style={{ color: customization.colors.primary }} />
            </div>
            <p className="font-medium" style={{ color: textColors.primary }}>{center.phone}</p>
          </a>
        </Card>
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

  // Render block by type
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

  return (
    <div 
      className="min-h-screen transition-colors duration-300"
      style={{ 
        ...customStyles,
        backgroundColor: customization.layout.dark_mode ? '#0f0f0f' : '#fafafa',
      }}
    >
      <div className="max-w-lg mx-auto px-4 pb-8">
        {/* Cover Image */}
        {customization.cover_url && (
          <div className="relative -mx-4 mb-6">
            <img
              src={customization.cover_url}
              alt="Cover"
              className="w-full h-48 sm:h-56 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        )}

        {/* Header */}
        <div className={cn("text-center", customization.cover_url ? "-mt-16 relative z-10 mb-6" : "pt-8 mb-6")}>
          {center.logo_url && (
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl overflow-hidden border-4 border-white shadow-xl">
              <img
                src={center.logo_url}
                alt={center.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <h1 
            className="text-2xl font-bold tracking-tight mb-1"
            style={{ color: textColors.primary }}
          >
            {center.name}
          </h1>
          
          {customization.texts.tagline && (
            <p 
              className="text-sm mb-4"
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

        {/* Social Icons */}
        {socialLinks.length > 0 && (
          <div className="flex justify-center gap-3 mb-6">
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

        {/* Main CTA */}
        {hasPacks && isPro && (
          <Button
            onClick={onStartBooking}
            className="w-full h-14 text-lg font-semibold rounded-2xl mb-8 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
            style={{ backgroundColor: customization.colors.primary }}
          >
            {customization.texts.cta_button || 'Réserver'}
          </Button>
        )}

        {/* Dynamic Blocks */}
        {activeBlocks.map(block => renderBlock(block))}

        {/* Footer */}
        <div className="text-center pt-8 border-t" style={{ borderColor: customization.layout.dark_mode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }}>
          <p className="text-xs" style={{ color: textColors.secondary }}>
            Propulsé par <span className="font-medium">CleaningPage</span>
          </p>
        </div>
      </div>

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
