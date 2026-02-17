import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
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
import { useTranslation } from 'react-i18next';

export default function DashboardSupport() {
  const { t } = useTranslation();
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
        body: { type: 'support_request', to: 'contact@cleaningpage.com', subject: `[Support] ${subject}`, centerName: center?.name || 'Inconnu', userEmail: user?.email || 'Inconnu', message },
      });
      if (error) throw error;
      setSent(true); setSubject(''); setMessage('');
      toast({ title: t('support.messageSent'), description: t('support.messageSuccess') });
    } catch (err) {
      toast({ title: t('common.error'), description: t('support.sendError'), variant: 'destructive' });
    } finally { setIsLoading(false); }
  };

  return (
    <DashboardLayout title={t('support.title')}>
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Headphones className="w-5 h-5 text-primary" /></div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">{t('support.needHelp')}</h2>
                <p className="text-sm text-muted-foreground">{t('support.sendMessage')}</p>
              </div>
            </div>
          </div>

          {sent ? (
            <Card variant="elevated" className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-8 h-8 text-primary" /></div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{t('support.messageSentTitle')}</h3>
              <p className="text-sm text-muted-foreground mb-6">{t('support.messageSentDesc')} <strong>{user?.email}</strong>.</p>
              <Button variant="outline" onClick={() => setSent(false)}>{t('support.sendAnother')}</Button>
            </Card>
          ) : (
            <Card variant="elevated" className="p-5 sm:p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email-display">{t('support.yourEmail')}</Label>
                  <Input id="email-display" value={user?.email || ''} disabled className="h-11 rounded-xl bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">{t('support.subject')}</Label>
                  <Input id="subject" placeholder={t('support.subjectPlaceholder')} value={subject} onChange={(e) => setSubject(e.target.value)} className="h-11 rounded-xl" required maxLength={200} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">{t('support.message')}</Label>
                  <Textarea id="message" placeholder={t('support.messagePlaceholder')} value={message} onChange={(e) => setMessage(e.target.value)} className="min-h-[150px] rounded-xl resize-none" required maxLength={2000} />
                  <p className="text-xs text-muted-foreground text-right">{message.length}/2000</p>
                </div>
                <Button type="submit" variant="premium" size="lg" className="w-full" disabled={isLoading || !subject.trim() || !message.trim()}>
                  {isLoading ? t('common.sending') : (<><Send className="w-4 h-4 mr-2" />{t('common.send')}</>)}
                </Button>
              </form>
            </Card>
          )}

          <p className="text-xs text-muted-foreground text-center mt-6">
            {t('support.directEmail')} <a href="mailto:contact@cleaningpage.com" className="text-primary hover:underline">contact@cleaningpage.com</a>
          </p>
    </DashboardLayout>
  );
}