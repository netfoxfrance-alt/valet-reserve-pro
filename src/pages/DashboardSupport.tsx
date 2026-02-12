import { useState } from 'react';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { MobileSidebar } from '@/components/dashboard/MobileSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Send, Headphones, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useMyCenter } from '@/hooks/useCenter';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function DashboardSupport() {
  const { user } = useAuth();
  const { center } = useMyCenter();
  const { toast } = useToast();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke('send-booking-emails', {
        body: {
          type: 'support_request',
          to: 'contact@cleaningpage.com',
          subject: `[Support] ${subject}`,
          centerName: center?.name || 'Inconnu',
          userEmail: user?.email || 'Inconnu',
          message: message,
        },
      });

      if (error) throw error;

      setSent(true);
      setSubject('');
      setMessage('');
      toast({
        title: 'Message envoyé',
        description: 'Nous vous répondrons dans les plus brefs délais.',
      });
    } catch (err) {
      toast({
        title: 'Erreur',
        description: "Impossible d'envoyer le message. Réessayez.",
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <MobileSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      <div className="lg:pl-64">
        <DashboardHeader title="Support" onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 sm:p-6 max-w-2xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Headphones className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Besoin d'aide ?</h2>
                <p className="text-sm text-muted-foreground">Envoyez-nous un message, nous vous répondrons rapidement.</p>
              </div>
            </div>
          </div>

          {sent ? (
            <Card variant="elevated" className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Message envoyé !</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Nous avons bien reçu votre demande et nous vous répondrons dans les meilleurs délais à l'adresse <strong>{user?.email}</strong>.
              </p>
              <Button variant="outline" onClick={() => setSent(false)}>
                Envoyer un autre message
              </Button>
            </Card>
          ) : (
            <Card variant="elevated" className="p-5 sm:p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email-display">Votre email</Label>
                  <Input
                    id="email-display"
                    value={user?.email || ''}
                    disabled
                    className="h-11 rounded-xl bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Sujet</Label>
                  <Input
                    id="subject"
                    placeholder="Ex : Problème avec ma page publique"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="h-11 rounded-xl"
                    required
                    maxLength={200}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Décrivez votre problème ou votre question..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-[150px] rounded-xl resize-none"
                    required
                    maxLength={2000}
                  />
                  <p className="text-xs text-muted-foreground text-right">{message.length}/2000</p>
                </div>

                <Button
                  type="submit"
                  variant="premium"
                  size="lg"
                  className="w-full"
                  disabled={isLoading || !subject.trim() || !message.trim()}
                >
                  {isLoading ? (
                    'Envoi en cours...'
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Envoyer
                    </>
                  )}
                </Button>
              </form>
            </Card>
          )}

          <p className="text-xs text-muted-foreground text-center mt-6">
            Vous pouvez aussi nous écrire directement à <a href="mailto:contact@cleaningpage.com" className="text-primary hover:underline">contact@cleaningpage.com</a>
          </p>
        </main>
      </div>
    </div>
  );
}
