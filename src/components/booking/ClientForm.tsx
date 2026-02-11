import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { User, Phone, Mail, MessageSquare, MapPin } from 'lucide-react';

interface ClientFormProps {
  onSubmit: (data: ClientData) => void;
  isSubmitting?: boolean;
  defaultValues?: Partial<ClientData>;
}

export interface ClientData {
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
}

export function ClientForm({ onSubmit, isSubmitting = false, defaultValues }: ClientFormProps) {
  const [formData, setFormData] = useState<ClientData>({
    name: defaultValues?.name || '',
    phone: defaultValues?.phone || '',
    email: defaultValues?.email || '',
    address: defaultValues?.address || '',
    notes: defaultValues?.notes || '',
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  const isValid = formData.name && formData.phone && formData.email;
  
  return (
    <div className="w-full max-w-lg mx-auto animate-fade-in-up">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-2 tracking-tight">
          Vos coordonnées
        </h2>
        <p className="text-muted-foreground">
          Pour confirmer votre réservation
        </p>
      </div>
      
      <Card variant="elevated" className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Nom complet
            </Label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder="Jean Dupont"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="pl-12 h-12 rounded-xl"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">
              Téléphone
            </Label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="06 12 34 56 78"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="pl-12 h-12 rounded-xl"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="jean@exemple.fr"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="pl-12 h-12 rounded-xl"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-medium">
              Adresse d'intervention
            </Label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="address"
                type="text"
                placeholder="12 rue de Paris, 75001 Paris"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="pl-12 h-12 rounded-xl"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              Remarques <span className="text-muted-foreground">(optionnel)</span>
            </Label>
            <div className="relative">
              <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-muted-foreground" />
              <Textarea
                id="notes"
                placeholder="Informations complémentaires sur votre véhicule..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="pl-12 min-h-[100px] rounded-xl resize-none"
              />
            </div>
          </div>
          
          <Button 
            type="submit"
            variant="premium" 
            size="lg" 
            className="w-full"
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? 'Confirmation...' : 'Confirmer ma réservation'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
