import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { User, Phone, MessageSquare, MapPin } from 'lucide-react';

export interface ContactRequestData {
  name: string;
  phone: string;
  address: string;
  message: string;
}

interface ContactRequestFormProps {
  onSubmit: (data: ContactRequestData) => void;
  isSubmitting: boolean;
}

export function ContactRequestForm({ onSubmit, isSubmitting }: ContactRequestFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, phone, address, message });
  };

  return (
    <div className="w-full max-w-lg mx-auto animate-scale-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight mb-2">
          Demander un devis
        </h2>
        <p className="text-muted-foreground">
          Décrivez votre besoin, nous vous recontactons rapidement.
        </p>
      </div>

      <Card variant="elevated" className="p-6 md:p-8">
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
                placeholder="Décrivez votre véhicule et votre besoin..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="pl-12 min-h-[100px] rounded-xl resize-none"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            variant="premium" 
            size="xl" 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Envoi en cours...' : 'Envoyer ma demande'}
          </Button>
        </form>
      </Card>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Nous vous recontactons généralement sous 24h.
      </p>
    </div>
  );
}
