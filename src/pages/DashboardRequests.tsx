import { useState, useEffect } from 'react';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { MobileSidebar } from '@/components/dashboard/MobileSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMyCenter } from '@/hooks/useCenter';
import { useMyContactRequests } from '@/hooks/useContactRequests';
import { MessageSquare, Phone, Clock, CheckCircle, XCircle, MapPin, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

export default function DashboardRequests() {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === 'en' ? enUS : fr;
  const { center, loading: centerLoading } = useMyCenter();
  const { requests, loading, fetchRequests, updateStatus } = useMyContactRequests();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (center) {
      fetchRequests(center.id);
    }
  }, [center]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="default">{t('requests.new')}</Badge>;
      case 'contacted':
        return <Badge variant="secondary">{t('requests.contacted')}</Badge>;
      case 'converted':
        return <Badge className="bg-green-500 hover:bg-green-600">{t('requests.answered')}</Badge>;
      case 'closed':
        return <Badge variant="outline">{t('requests.closed')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleMarkContacted = async (id: string) => {
    await updateStatus(id, 'contacted', true);
  };

  const handleMarkConverted = async (id: string) => {
    await updateStatus(id, 'converted');
  };

  const handleMarkClosed = async (id: string) => {
    await updateStatus(id, 'closed');
  };

  if (centerLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardSidebar />
        <div className="lg:pl-64">
          <DashboardHeader title={t('requests.title')} onMenuClick={() => setMobileMenuOpen(true)} />
          <main className="p-4 sm:p-6">
            <div className="animate-pulse space-y-3 sm:space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-muted rounded-xl" />
              ))}
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <MobileSidebar open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} />
      
      <div className="lg:pl-64">
        <DashboardHeader 
          title={t('requests.title')} 
          onMenuClick={() => setMobileMenuOpen(true)}
        />
        <main className="p-4 lg:p-8">
          <div className="max-w-4xl">
            {requests.length === 0 ? (
              <Card variant="elevated" className="p-8 sm:p-12 text-center rounded-2xl">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-7 h-7 sm:w-8 sm:h-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {t('requests.noRequests')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t('requests.requestsWillAppear')}
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {requests.map((request) => (
                  <Card key={request.id} variant="elevated" className="p-4 sm:p-5 rounded-2xl">
                    <div className="flex flex-col gap-3 sm:gap-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-sm font-bold text-primary">
                              {request.client_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-foreground truncate">
                              {request.client_name}
                            </h3>
                            <a 
                              href={`tel:${request.client_phone}`}
                              className="text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                              {request.client_phone}
                            </a>
                            {request.client_email && (
                              <span className="text-sm text-muted-foreground">
                                {request.client_email}
                              </span>
                            )}
                          </div>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {request.client_phone && (
                          <Button variant="outline" size="sm" asChild className="h-9 rounded-xl">
                            <a href={`tel:${request.client_phone}`}>
                              <Phone className="w-4 h-4 mr-1.5" />
                              {t('requests.call')}
                            </a>
                          </Button>
                        )}
                        {request.client_email && (
                          <Button variant="outline" size="sm" asChild className="h-9 rounded-xl">
                            <a href={`mailto:${request.client_email}`}>
                              <Mail className="w-4 h-4 mr-1.5" />
                              {t('common.email')}
                            </a>
                          </Button>
                        )}
                      </div>
                      
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
                            <Button variant="outline" size="sm" onClick={() => handleMarkContacted(request.id)} className="flex-1 sm:flex-none h-9 rounded-xl">
                              <Phone className="w-4 h-4 mr-1.5" />
                              {t('requests.markContacted')}
                            </Button>
                          )}
                          {(request.status === 'new' || request.status === 'contacted') && (
                            <>
                              <Button variant="default" size="sm" onClick={() => handleMarkConverted(request.id)} className="flex-1 sm:flex-none h-9 rounded-xl">
                                <CheckCircle className="w-4 h-4 mr-1.5" />
                                {t('requests.markAnswered')}
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleMarkClosed(request.id)} className="h-9 rounded-xl">
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
