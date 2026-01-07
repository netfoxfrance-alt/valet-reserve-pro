import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, Loader2, CheckCircle, Palette, Wrench, HelpCircle } from 'lucide-react';

interface AdvancedCustomizationCardProps {
  centerId: string;
  centerName: string;
  contactEmail: string;
}

export function AdvancedCustomizationCard({ centerId, centerName, contactEmail }: AdvancedCustomizationCardProps) {
  const { toast } = useToast();
  const [requestType, setRequestType] = useState<string>('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!requestType) {
      toast({ title: 'Erreur', description: 'Veuillez sélectionner un type de demande', variant: 'destructive' });
      return;
    }
    if (!message.trim()) {
      toast({ title: 'Erreur', description: 'Veuillez décrire votre demande', variant: 'destructive' });
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from('custom_requests').insert({
      center_id: centerId,
      center_name: centerName,
      contact_email: contactEmail,
      request_type: requestType,
      message: message.trim(),
    });

    setSubmitting(false);

    if (error) {
      toast({ title: 'Erreur', description: 'Impossible d\'envoyer la demande', variant: 'destructive' });
    } else {
      setSubmitted(true);
      toast({ title: 'Demande envoyée !', description: 'Nous vous recontacterons rapidement.' });
    }
  };

  if (submitted) {
    return (
      <Card className="p-6 bg-green-500/5 border-green-500/20">
        <div className="text-center space-y-3">
          <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
          <h3 className="text-lg font-semibold text-green-700">Demande envoyée !</h3>
          <p className="text-sm text-muted-foreground">
            Notre équipe va étudier votre demande et vous recontactera à l'adresse {contactEmail}.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
      <div className="space-y-5">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Besoin de plus ?</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Page sur-mesure, ajout d'outils... Notre équipe peut vous aider !
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">Que recherchez-vous ?</Label>
          <RadioGroup value={requestType} onValueChange={setRequestType} className="space-y-2">
            <div className="flex items-center space-x-3 p-3 rounded-lg border bg-background hover:bg-muted/50 transition-colors cursor-pointer">
              <RadioGroupItem value="custom-page" id="custom-page" />
              <Label htmlFor="custom-page" className="flex items-center gap-2 cursor-pointer flex-1">
                <Palette className="w-4 h-4 text-muted-foreground" />
                <span>Une page totalement personnalisée</span>
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg border bg-background hover:bg-muted/50 transition-colors cursor-pointer">
              <RadioGroupItem value="add-tool" id="add-tool" />
              <Label htmlFor="add-tool" className="flex items-center gap-2 cursor-pointer flex-1">
                <Wrench className="w-4 h-4 text-muted-foreground" />
                <span>Ajouter un outil ou fonctionnalité</span>
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg border bg-background hover:bg-muted/50 transition-colors cursor-pointer">
              <RadioGroupItem value="other" id="other" />
              <Label htmlFor="other" className="flex items-center gap-2 cursor-pointer flex-1">
                <HelpCircle className="w-4 h-4 text-muted-foreground" />
                <span>Autre demande</span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="request-message" className="text-sm font-medium">Décrivez votre besoin</Label>
          <Textarea
            id="request-message"
            placeholder="Expliquez ce que vous souhaitez réaliser..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="resize-none"
          />
        </div>

        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={submitting || !requestType || !message.trim()}
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Envoi en cours...
            </>
          ) : (
            'Envoyer ma demande'
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Nous vous répondrons à {contactEmail}
        </p>
      </div>
    </Card>
  );
}
