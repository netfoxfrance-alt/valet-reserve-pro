import { useState, useEffect } from 'react';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { MobileSidebar } from '@/components/dashboard/MobileSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMyCenter } from '@/hooks/useCenter';
import { useMyContactRequests } from '@/hooks/useContactRequests';
import { MessageSquare, Phone, Clock, CheckCircle, XCircle } from 'lucide-react';
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
        return <Badge className="bg-green-500 hover:bg-green-600">Converti</Badge>;
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
          title="Demandes de contact" 
          onMenuClick={() => setMobileMenuOpen(true)}
        />
        <main className="p-4 sm:p-6">
          <div className="max-w-4xl">
            {requests.length === 0 ? (
              <Card variant="elevated" className="p-8 sm:p-12 text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-7 h-7 sm:w-8 sm:h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Aucune demande pour le moment
                </h3>
                <p className="text-sm text-muted-foreground">
                  Les demandes de vos clients apparaîtront ici.
                </p>
              </Card>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {requests.map((request) => (
                  <Card key={request.id} variant="elevated" className="p-4 sm:p-6">
                    <div className="flex flex-col gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                          <h3 className="font-semibold text-base sm:text-lg text-foreground">
                            {request.client_name}
                          </h3>
                          {getStatusBadge(request.status)}
                        </div>
                        
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <Phone className="w-4 h-4 flex-shrink-0" />
                          <a 
                            href={`tel:${request.client_phone}`}
                            className="hover:text-primary transition-colors"
                          >
                            {request.client_phone}
                          </a>
                        </div>
                        
                        {request.message && (
                          <div className="bg-muted rounded-lg p-3 mt-3">
                            <p className="text-foreground text-sm whitespace-pre-wrap">
                              {request.message}
                            </p>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mt-3">
                          <Clock className="w-4 h-4 flex-shrink-0" />
                          {format(new Date(request.created_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {request.status === 'new' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkContacted(request.id)}
                            className="flex-1 sm:flex-none"
                          >
                            <Phone className="w-4 h-4 mr-1" />
                            Contacté
                          </Button>
                        )}
                        {(request.status === 'new' || request.status === 'contacted') && (
                          <>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleMarkConverted(request.id)}
                              className="flex-1 sm:flex-none"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Converti
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkClosed(request.id)}
                              className="flex-1 sm:flex-none"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Fermer
                            </Button>
                          </>
                        )}
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
