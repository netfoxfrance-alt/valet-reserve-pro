import { useState, useMemo } from 'react';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { MobileSidebar } from '@/components/dashboard/MobileSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useMyAppointments } from '@/hooks/useAppointments';
import { useMyCenter } from '@/hooks/useCenter';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Search, Phone, Mail, Calendar, TrendingUp } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function DashboardClients() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchClient, setSearchClient] = useState('');
  const { appointments, loading } = useMyAppointments();
  const { center } = useMyCenter();

  // Client database
  const clients = useMemo(() => {
    const clientMap: Record<string, {
      name: string;
      phone: string;
      email: string;
      appointments: number;
      totalSpent: number;
      lastVisit: string;
      firstVisit: string;
    }> = {};

    appointments.filter(a => a.status !== 'cancelled').forEach(a => {
      const key = a.client_phone;
      if (!clientMap[key]) {
        clientMap[key] = {
          name: a.client_name,
          phone: a.client_phone,
          email: a.client_email,
          appointments: 0,
          totalSpent: 0,
          lastVisit: a.appointment_date,
          firstVisit: a.appointment_date,
        };
      }
      clientMap[key].appointments++;
      clientMap[key].totalSpent += a.pack?.price || 0;
      if (a.appointment_date > clientMap[key].lastVisit) {
        clientMap[key].lastVisit = a.appointment_date;
      }
      if (a.appointment_date < clientMap[key].firstVisit) {
        clientMap[key].firstVisit = a.appointment_date;
      }
    });

    return Object.values(clientMap)
      .sort((a, b) => b.totalSpent - a.totalSpent);
  }, [appointments]);

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchClient.toLowerCase()) ||
    c.phone.includes(searchClient) ||
    c.email.toLowerCase().includes(searchClient.toLowerCase())
  );

  // Stats
  const totalRevenue = clients.reduce((sum, c) => sum + c.totalSpent, 0);
  const avgPerClient = clients.length > 0 ? Math.round(totalRevenue / clients.length) : 0;
  const returningClients = clients.filter(c => c.appointments > 1).length;

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <MobileSidebar open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} />
      
      <div className="lg:pl-64">
        <DashboardHeader 
          title="Clients" 
          subtitle={center?.name}
          onMenuClick={() => setMobileMenuOpen(true)}
        />
        
        <main className="p-4 lg:p-8">
          {loading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
              </div>
              <Skeleton className="h-96" />
            </div>
          ) : (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                <Card variant="elevated" className="p-4 sm:p-5">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{clients.length}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Clients total</p>
                </Card>

                <Card variant="elevated" className="p-4 sm:p-5">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center mb-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{avgPerClient}€</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Dépense moyenne</p>
                </Card>

                <Card variant="elevated" className="p-4 sm:p-5">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{returningClients}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Clients fidèles</p>
                </Card>

                <Card variant="elevated" className="p-4 sm:p-5">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center mb-2">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">
                    {clients.length > 0 ? Math.round((returningClients / clients.length) * 100) : 0}%
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Taux de fidélité</p>
                </Card>
              </div>

              {/* Clients List */}
              <Card variant="elevated" className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="font-semibold text-foreground text-lg">Base clients</h3>
                    <p className="text-sm text-muted-foreground">{clients.length} clients enregistrés</p>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Rechercher un client..."
                      value={searchClient}
                      onChange={(e) => setSearchClient(e.target.value)}
                      className="pl-9 w-full sm:w-64"
                    />
                  </div>
                </div>

                {filteredClients.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h4 className="font-medium text-foreground mb-1">
                      {searchClient ? 'Aucun client trouvé' : 'Aucun client pour le moment'}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {searchClient 
                        ? 'Essayez avec un autre terme de recherche' 
                        : 'Vos clients apparaîtront ici après leur première réservation'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredClients.map((client) => (
                      <div 
                        key={client.phone}
                        className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-secondary/20 rounded-xl hover:bg-secondary/40 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-semibold text-primary">
                              {client.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">{client.name}</p>
                            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                              <a 
                                href={`tel:${client.phone}`}
                                className="flex items-center gap-1 hover:text-primary transition-colors"
                              >
                                <Phone className="w-3 h-3" />
                                {client.phone}
                              </a>
                              {client.email && client.email !== 'non-fourni@example.com' && (
                                <a 
                                  href={`mailto:${client.email}`}
                                  className="flex items-center gap-1 hover:text-primary transition-colors"
                                >
                                  <Mail className="w-3 h-3" />
                                  <span className="truncate max-w-[150px]">{client.email}</span>
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 sm:gap-8 pl-13 sm:pl-0">
                          <div className="text-center">
                            <p className="font-semibold text-foreground">{client.appointments}</p>
                            <p className="text-xs text-muted-foreground">Visites</p>
                          </div>
                          <div className="text-center">
                            <p className="font-semibold text-foreground">{client.totalSpent}€</p>
                            <p className="text-xs text-muted-foreground">Total</p>
                          </div>
                          <div className="text-center hidden sm:block">
                            <p className="font-semibold text-foreground">
                              {format(parseISO(client.lastVisit), 'd MMM yyyy', { locale: fr })}
                            </p>
                            <p className="text-xs text-muted-foreground">Dernière visite</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
