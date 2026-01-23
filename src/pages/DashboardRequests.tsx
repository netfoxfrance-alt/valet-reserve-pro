import { useState, useEffect } from 'react';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { MobileSidebar } from '@/components/dashboard/MobileSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMyCenter } from '@/hooks/useCenter';
import { useMyContactRequests } from '@/hooks/useContactRequests';
import { MessageSquare, Phone, Clock, CheckCircle, XCircle, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function DashboardRequests() {
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
        return <Badge variant="default">Nouveau</Badge>;
      case 'contacted':
        return <Badge variant="secondary">Contacté</Badge>;
      case 'converted':
        return <Badge className="bg-green-500 hover:bg-green-600">Répondu</Badge>;
      case 'closed':
        return <Badge variant="outline">Fermé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleMarkContacted = async (id: string) => {
    await updateStatus(id, 'contacted');
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
          <DashboardHeader title="Demandes" onMenuClick={() => setMobileMenuOpen(true)} />
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
          title="Demandes" 
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
                  Aucune demande
                </h3>
                <p className="text-sm text-muted-foreground">
                  Les demandes de vos clients apparaîtront ici.
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {requests.map((request) => (
                  <Card key={request.id} variant="elevated" className="p-4 sm:p-5 rounded-2xl">
                    <div className="flex flex-col gap-3 sm:gap-4">
                      {/* Header */}
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
                          </div>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                      
                      {/* Address */}
                      {request.client_address && (
                        <div className="flex items-start gap-2 bg-primary/5 rounded-xl p-3">
                          <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          <p className="text-foreground text-sm">
                            {request.client_address}
                          </p>
                        </div>
                      )}
                      
                      {/* Message */}
                      {request.message && (
                        <div className="bg-muted/50 rounded-xl p-3">
                          <p className="text-foreground text-sm whitespace-pre-wrap">
                            {request.message}
                          </p>
                        </div>
                      )}
                      
                      {/* Footer */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" />
                          {format(new Date(request.created_at), "d MMM yyyy 'à' HH:mm", { locale: fr })}
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {request.status === 'new' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkContacted(request.id)}
                              className="flex-1 sm:flex-none h-9 rounded-xl"
                            >
                              <Phone className="w-4 h-4 mr-1.5" />
                              Contacté
                            </Button>
                          )}
                          {(request.status === 'new' || request.status === 'contacted') && (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleMarkConverted(request.id)}
                                className="flex-1 sm:flex-none h-9 rounded-xl"
                              >
                                <CheckCircle className="w-4 h-4 mr-1.5" />
                                Répondu
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkClosed(request.id)}
                                className="h-9 rounded-xl"
                              >
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
