import { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useMyCenter } from '@/hooks/useCenter';
import { useMyContactRequests, ContactRequest } from '@/hooks/useContactRequests';
import { MessageSquare, Phone, Clock, CheckCircle, XCircle, MapPin, Mail, FileText, Image, Save, Pencil, Info } from 'lucide-react';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import type { Locale } from 'date-fns';

function RequestCard({ request, dateLocale, t, onMarkContacted, onMarkConverted, onMarkClosed }: {
  request: ContactRequest;
  dateLocale: Locale;
  t: (key: string) => string;
  onMarkContacted: (id: string) => void;
  onMarkConverted: (id: string) => void;
  onMarkClosed: (id: string) => void;
}) {
  const [showImages, setShowImages] = useState(false);
  const images = request.images || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new': return <Badge variant="default">{t('requests.new')}</Badge>;
      case 'contacted': return <Badge variant="secondary">{t('requests.contacted')}</Badge>;
      case 'converted': return <Badge className="bg-green-500 hover:bg-green-600">{t('requests.answered')}</Badge>;
      case 'closed': return <Badge variant="outline">{t('requests.closed')}</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card variant="elevated" className="p-4 sm:p-5 rounded-2xl">
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-primary">
                {request.client_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground truncate">{request.client_name}</h3>
              <a href={`tel:${request.client_phone}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {request.client_phone}
              </a>
              {request.client_email && (
                <span className="text-sm text-muted-foreground block">{request.client_email}</span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            {getStatusBadge(request.status)}
            {request.service_name && (
              <Badge variant="outline" className="text-xs">{request.service_name}</Badge>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {request.client_phone && (
            <Button variant="outline" size="sm" asChild className="h-9 rounded-xl">
              <a href={`tel:${request.client_phone}`}><Phone className="w-4 h-4 mr-1.5" />{t('requests.call')}</a>
            </Button>
          )}
          {request.client_email && (
            <Button variant="outline" size="sm" asChild className="h-9 rounded-xl">
              <a href={`mailto:${request.client_email}`}><Mail className="w-4 h-4 mr-1.5" />{t('common.email')}</a>
            </Button>
          )}
          {images.length > 0 && (
            <Button variant="outline" size="sm" className="h-9 rounded-xl" onClick={() => setShowImages(!showImages)}>
              <Image className="w-4 h-4 mr-1.5" />{images.length} photo{images.length > 1 ? 's' : ''}
            </Button>
          )}
        </div>

        {showImages && images.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {images.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="aspect-square rounded-xl overflow-hidden bg-muted block">
                <img src={url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform" />
              </a>
            ))}
          </div>
        )}

        {request.client_address && (
          <div className="flex items-start gap-2 bg-primary/5 rounded-xl p-3">
            <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <p className="text-foreground text-sm">{request.client_address}</p>
          </div>
        )}

        {request.message && (
          <div className="bg-muted/50 rounded-xl p-3">
            <p className="text-foreground text-sm whitespace-pre-wrap">{request.message}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-border/50">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              {t('requests.receivedOn')} {format(new Date(request.created_at), "d MMM yyyy", { locale: dateLocale })}
            </div>
            {request.contacted_at && (
              <div className="flex items-center gap-2 text-xs text-green-600">
                <CheckCircle className="w-3.5 h-3.5" />
                {t('requests.contactedOn')} {format(new Date(request.contacted_at), "d MMM yyyy", { locale: dateLocale })}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {request.status === 'new' && (
              <Button variant="outline" size="sm" onClick={() => onMarkContacted(request.id)} className="flex-1 sm:flex-none h-9 rounded-xl">
                <Phone className="w-4 h-4 mr-1.5" />{t('requests.markContacted')}
              </Button>
            )}
            {(request.status === 'new' || request.status === 'contacted') && (
              <>
                <Button variant="default" size="sm" onClick={() => onMarkConverted(request.id)} className="flex-1 sm:flex-none h-9 rounded-xl">
                  <CheckCircle className="w-4 h-4 mr-1.5" />{t('requests.markAnswered')}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onMarkClosed(request.id)} className="h-9 rounded-xl">
                  <XCircle className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function DashboardRequests() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const dateLocale = i18n.language === 'en' ? enUS : fr;
  const { center, loading: centerLoading, updateCenter } = useMyCenter();
  const { requests, loading, fetchRequests, updateStatus } = useMyContactRequests();
  const [activeTab, setActiveTab] = useState<'contact' | 'quote'>('contact');
  const [editingMessage, setEditingMessage] = useState(false);
  const [quoteMessage, setQuoteMessage] = useState('');
  const [savingMessage, setSavingMessage] = useState(false);

  useEffect(() => {
    if (center) {
      fetchRequests(center.id);
      setQuoteMessage(center.quote_form_message || '');
    }
  }, [center]);

  const contactRequests = useMemo(() => requests.filter(r => r.request_type !== 'quote'), [requests]);
  const quoteRequests = useMemo(() => requests.filter(r => r.request_type === 'quote'), [requests]);
  const filteredRequests = activeTab === 'contact' ? contactRequests : quoteRequests;

  const handleSaveMessage = async () => {
    if (!updateCenter) return;
    setSavingMessage(true);
    const { error } = await updateCenter({ quote_form_message: quoteMessage || null } as any);
    setSavingMessage(false);
    setEditingMessage(false);
    if (!error) {
      toast({ title: 'Message de précision sauvegardé' });
    }
  };

  if (centerLoading || loading) {
    return (
      <DashboardLayout title={t('requests.title')}>
        <div className="animate-pulse space-y-3 sm:space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-muted rounded-xl" />)}
        </div>
      </DashboardLayout>
    );
  }

  const newContactCount = contactRequests.filter(r => r.status === 'new').length;
  const newQuoteCount = quoteRequests.filter(r => r.status === 'new').length;

  return (
    <DashboardLayout title={t('requests.title')}>
      <div className="max-w-4xl">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button variant={activeTab === 'contact' ? 'default' : 'outline'} size="sm" className="rounded-xl" onClick={() => setActiveTab('contact')}>
            <MessageSquare className="w-4 h-4 mr-1.5" />
            Demandes de contact
            {newContactCount > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 min-w-5 px-1.5 text-xs">{newContactCount}</Badge>
            )}
          </Button>
          <Button variant={activeTab === 'quote' ? 'default' : 'outline'} size="sm" className="rounded-xl" onClick={() => setActiveTab('quote')}>
            <FileText className="w-4 h-4 mr-1.5" />
            Demandes de devis
            {newQuoteCount > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 min-w-5 px-1.5 text-xs">{newQuoteCount}</Badge>
            )}
          </Button>
        </div>

        {/* Quote precision message editor */}
        {activeTab === 'quote' && (
          <Card variant="elevated" className="p-4 rounded-2xl mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Message de précision pour les devis</span>
              </div>
              {!editingMessage ? (
                <Button variant="ghost" size="sm" className="h-8 rounded-xl" onClick={() => setEditingMessage(true)}>
                  <Pencil className="w-3.5 h-3.5 mr-1.5" />Modifier
                </Button>
              ) : (
                <Button variant="default" size="sm" className="h-8 rounded-xl" onClick={handleSaveMessage} disabled={savingMessage}>
                  <Save className="w-3.5 h-3.5 mr-1.5" />{savingMessage ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              )}
            </div>
            {editingMessage ? (
              <Textarea
                value={quoteMessage}
                onChange={(e) => setQuoteMessage(e.target.value)}
                placeholder="Ex: Pouvez-vous m'envoyer 1 photo par type de vitre + quantité, et me dire si certaines sont en hauteur/difficiles d'accès ? Merci !"
                className="min-h-[80px] rounded-xl resize-none text-sm"
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                {quoteMessage || <span className="italic">Aucun message — cliquez sur Modifier pour ajouter une précision qui sera affichée aux clients.</span>}
              </p>
            )}
          </Card>
        )}

        {filteredRequests.length === 0 ? (
          <Card variant="elevated" className="p-8 sm:p-12 text-center rounded-2xl">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
              {activeTab === 'contact' ? (
                <MessageSquare className="w-7 h-7 sm:w-8 sm:h-8 text-muted-foreground/50" />
              ) : (
                <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-muted-foreground/50" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {activeTab === 'contact' ? t('requests.noRequests') : 'Aucune demande de devis'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {activeTab === 'contact' ? t('requests.requestsWillAppear') : 'Les demandes de devis de vos services apparaîtront ici.'}
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredRequests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                dateLocale={dateLocale}
                t={t}
                onMarkContacted={(id) => updateStatus(id, 'contacted', true)}
                onMarkConverted={(id) => updateStatus(id, 'converted')}
                onMarkClosed={(id) => updateStatus(id, 'closed')}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
