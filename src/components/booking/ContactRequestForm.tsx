import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { User, Phone, MessageSquare, MapPin, Mail, ImagePlus, X, Loader2, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export interface ContactRequestData {
  name: string;
  email: string;
  phone: string;
  address: string;
  message: string;
  images: string[];
}

interface ContactRequestFormProps {
  onSubmit: (data: ContactRequestData) => void;
  isSubmitting: boolean;
  title?: string;
  subtitle?: string;
  submitLabel?: string;
  precisionMessage?: string;
}

export function ContactRequestForm({ onSubmit, isSubmitting, title, subtitle, submitLabel, precisionMessage }: ContactRequestFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [message, setMessage] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setUploading(true);
    const newImages: string[] = [];
    
    for (const file of Array.from(files)) {
      if (file.size > 5 * 1024 * 1024) continue; // 5MB max
      const ext = file.name.split('.').pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      
      const { error } = await supabase.storage
        .from('contact-images')
        .upload(path, file);
      
      if (!error) {
        const { data: urlData } = supabase.storage
          .from('contact-images')
          .getPublicUrl(path);
        newImages.push(urlData.publicUrl);
      }
    }
    
    setImages(prev => [...prev, ...newImages]);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, email, phone, address, message, images });
  };

  return (
    <div className="w-full max-w-lg mx-auto animate-scale-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight mb-2">
          {title || 'Demander un devis'}
        </h2>
        <p className="text-muted-foreground">
          {subtitle || 'Décrivez votre besoin, nous vous recontactons rapidement.'}
        </p>
      </div>

      <Card variant="elevated" className="p-6 md:p-8">
        {precisionMessage && (
          <div className="flex gap-3 p-4 mb-6 bg-primary/5 border border-primary/10 rounded-xl">
            <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-foreground/80 whitespace-pre-wrap">{precisionMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Votre nom *</Label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder="Jean Dupont"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-12 h-12 rounded-xl"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="jean.dupont@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-12 h-12 rounded-xl"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone *</Label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="06 12 34 56 78"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-12 h-12 rounded-xl"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Adresse d'intervention *</Label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="address"
                type="text"
                placeholder="12 rue de Paris, 75001 Paris"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="pl-12 h-12 rounded-xl"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Votre message</Label>
            <div className="relative">
              <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-muted-foreground" />
              <Textarea
                id="message"
                placeholder="Décrivez votre besoin..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="pl-12 min-h-[100px] rounded-xl resize-none"
              />
            </div>
          </div>

          {/* Image upload section */}
          <div className="space-y-3">
            <Label>Photos (optionnel)</Label>
            
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {images.map((url, i) => (
                  <div key={i} className="relative group aspect-square rounded-xl overflow-hidden bg-muted">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3.5 h-3.5 text-foreground" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full h-11 rounded-xl border-dashed"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || images.length >= 6}
            >
              {uploading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Upload en cours...</>
              ) : (
                <><ImagePlus className="w-4 h-4 mr-2" /> Ajouter des photos{images.length > 0 ? ` (${images.length}/6)` : ''}</>
              )}
            </Button>
          </div>

          <Button 
            type="submit" 
            variant="premium" 
            size="xl" 
            className="w-full"
            disabled={isSubmitting || uploading}
          >
            {isSubmitting ? 'Envoi en cours...' : (submitLabel || 'Envoyer ma demande')}
          </Button>
        </form>
      </Card>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Nous vous recontactons généralement sous 24h.
      </p>
    </div>
  );
}
