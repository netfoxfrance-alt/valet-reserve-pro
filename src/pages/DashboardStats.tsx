import { useState, useMemo } from 'react';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { MobileSidebar } from '@/components/dashboard/MobileSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useMyAppointments } from '@/hooks/useAppointments';
import { useMyCenter } from '@/hooks/useCenter';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, subMonths, addMonths, isWithinInterval, startOfWeek, endOfWeek, subWeeks, eachWeekOfInterval, eachMonthOfInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

// Apple-style vibrant chart colors
const COLORS = ['#34C759', '#007AFF', '#5856D6', '#FF9500', '#AF52DE', '#FF3B30'];

type DetailType = 'reservations' | 'revenue' | 'clients' | 'completed' | null;

export default function DashboardStats() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [detailDialog, setDetailDialog] = useState<DetailType>(null);
  const { appointments, loading } = useMyAppointments();
  const { center } = useMyCenter();

  // Helper to get price from appointment
  const getAppointmentPrice = (a: any) => a.custom_price || a.pack?.price || 0;
  const getServiceName = (a: any) => {
    if (a.custom_service) return a.custom_service.name;
    if (a.pack) return a.pack.name;
    return 'Sans formule';
  };

  // Stats for selected month
  const stats = useMemo(() => {
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);
    const prevMonthStart = startOfMonth(subMonths(selectedMonth, 1));
    const prevMonthEnd = endOfMonth(subMonths(selectedMonth, 1));

    const thisMonthAppointments = appointments.filter(a => {
      const date = parseISO(a.appointment_date);
      return isWithinInterval(date, { start: monthStart, end: monthEnd }) && a.status !== 'cancelled';
    });

    const prevMonthAppointments = appointments.filter(a => {
      const date = parseISO(a.appointment_date);
      return isWithinInterval(date, { start: prevMonthStart, end: prevMonthEnd }) && a.status !== 'cancelled';
    });

    const thisMonthRevenue = thisMonthAppointments.reduce((sum, a) => sum + getAppointmentPrice(a), 0);
    const prevMonthRevenue = prevMonthAppointments.reduce((sum, a) => sum + getAppointmentPrice(a), 0);

    const revenueChange = prevMonthRevenue > 0 
      ? Math.round(((thisMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100)
      : 0;

    const countChange = prevMonthAppointments.length > 0
      ? Math.round(((thisMonthAppointments.length - prevMonthAppointments.length) / prevMonthAppointments.length) * 100)
      : 0;

    const uniqueClients = new Set(thisMonthAppointments.map(a => a.client_phone)).size;
    const completed = thisMonthAppointments.filter(a => a.status === 'completed');
    const avgBasket = completed.length > 0
      ? Math.round(completed.reduce((sum, a) => sum + getAppointmentPrice(a), 0) / completed.length)
      : 0;

    return {
      thisMonthCount: thisMonthAppointments.length,
      thisMonthRevenue,
      revenueChange,
      countChange,
      uniqueClients,
      avgBasket,
      completedCount: completed.length,
      appointments: thisMonthAppointments,
      totalRevenue: appointments.filter(a => a.status !== 'cancelled').reduce((sum, a) => sum + getAppointmentPrice(a), 0),
    };
  }, [appointments, selectedMonth]);

  // Weekly evolution data (last 8 weeks from selected month)
  const weeklyData = useMemo(() => {
    const weeks = eachWeekOfInterval({
      start: subWeeks(endOfMonth(selectedMonth), 7),
      end: endOfMonth(selectedMonth),
    }, { weekStartsOn: 1 });

    return weeks.map(weekStart => {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      const weekAppointments = appointments.filter(a => {
        const date = parseISO(a.appointment_date);
        return isWithinInterval(date, { start: weekStart, end: weekEnd }) && a.status !== 'cancelled';
      });

      return {
        name: format(weekStart, 'd MMM', { locale: fr }),
        réservations: weekAppointments.length,
        revenue: weekAppointments.reduce((sum, a) => sum + getAppointmentPrice(a), 0),
      };
    });
  }, [appointments, selectedMonth]);

  // Monthly evolution data (last 6 months from selected month)
  const monthlyData = useMemo(() => {
    const months = eachMonthOfInterval({
      start: subMonths(selectedMonth, 5),
      end: selectedMonth,
    });

    return months.map(monthStart => {
      const monthEnd = endOfMonth(monthStart);
      const monthAppointments = appointments.filter(a => {
        const date = parseISO(a.appointment_date);
        return isWithinInterval(date, { start: monthStart, end: monthEnd }) && a.status !== 'cancelled';
      });

      return {
        name: format(monthStart, 'MMM', { locale: fr }),
        réservations: monthAppointments.length,
        revenue: monthAppointments.reduce((sum, a) => sum + getAppointmentPrice(a), 0),
      };
    });
  }, [appointments, selectedMonth]);

  // Service distribution (packs + custom services)
  const serviceDistribution = useMemo(() => {
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);
    
    const serviceCounts: Record<string, { count: number; revenue: number; type: 'pack' | 'custom' | 'none' }> = {};
    
    appointments
      .filter(a => {
        const date = parseISO(a.appointment_date);
        return isWithinInterval(date, { start: monthStart, end: monthEnd }) && a.status !== 'cancelled';
      })
      .forEach(a => {
        let name: string;
        let type: 'pack' | 'custom' | 'none';
        let price: number;

        if (a.custom_service) {
          name = a.custom_service.name;
          type = 'custom';
          price = a.custom_price || a.custom_service.price;
        } else if (a.pack) {
          name = a.pack.name;
          type = 'pack';
          price = a.custom_price || a.pack.price;
        } else {
          name = 'Sans formule';
          type = 'none';
          price = a.custom_price || 0;
        }

        if (!serviceCounts[name]) {
          serviceCounts[name] = { count: 0, revenue: 0, type };
        }
        serviceCounts[name].count++;
        serviceCounts[name].revenue += price;
      });

    return Object.entries(serviceCounts)
      .map(([name, data]) => ({
        name,
        value: data.count,
        revenue: data.revenue,
        type: data.type,
      }))
      .sort((a, b) => b.value - a.value);
  }, [appointments, selectedMonth]);

  // Unique clients for selected month
  const uniqueClientsCount = useMemo(() => {
    return new Set(stats.appointments.map(a => a.client_phone)).size;
  }, [stats.appointments]);

  // Detail appointments based on dialog type
  const detailAppointments = useMemo(() => {
    if (!detailDialog) return [];
    
    switch (detailDialog) {
      case 'reservations':
        return stats.appointments;
      case 'revenue':
        return stats.appointments.filter(a => getAppointmentPrice(a) > 0);
      case 'clients':
        // Return unique clients with their appointments
        const clientMap = new Map<string, typeof stats.appointments>();
        stats.appointments.forEach(a => {
          if (!clientMap.has(a.client_phone)) {
            clientMap.set(a.client_phone, []);
          }
          clientMap.get(a.client_phone)!.push(a);
        });
        return Array.from(clientMap.values()).map(appts => appts[0]);
      case 'completed':
        return stats.appointments.filter(a => a.status === 'completed');
      default:
        return [];
    }
  }, [detailDialog, stats.appointments]);

  const detailTitle = {
    reservations: 'Toutes les réservations',
    revenue: 'Détail du chiffre d\'affaires',
    clients: 'Clients uniques',
    completed: 'Réservations terminées',
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setSelectedMonth(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
  };

  const isCurrentMonth = format(selectedMonth, 'yyyy-MM') === format(new Date(), 'yyyy-MM');

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <MobileSidebar open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} />
      
      <div className="lg:pl-64">
        <DashboardHeader 
          title="Statistiques" 
          subtitle={center?.name}
          onMenuClick={() => setMobileMenuOpen(true)}
        />
        
        <main className="p-4 lg:p-8">
          {loading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28" />)}
              </div>
              <Skeleton className="h-80" />
            </div>
          ) : (
            <>
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-6">
                <Button variant="ghost" size="icon" onClick={() => navigateMonth('prev')}>
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-foreground capitalize">
                    {format(selectedMonth, 'MMMM yyyy', { locale: fr })}
                  </h2>
                  {!isCurrentMonth && (
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="text-primary text-xs p-0 h-auto"
                      onClick={() => setSelectedMonth(new Date())}
                    >
                      Revenir à aujourd'hui
                    </Button>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => navigateMonth('next')}
                  disabled={isCurrentMonth}
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>

              {/* KPI Cards - Responsive grid */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
                {/* Réservations */}
                <Card 
                  variant="elevated" 
                  className="p-4 sm:p-5 cursor-pointer group hover:shadow-lg transition-all duration-200 rounded-2xl"
                  onClick={() => setDetailDialog('reservations')}
                >
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Réservations</p>
                  <div className="flex items-baseline gap-2 sm:gap-3">
                    <p className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">{stats.thisMonthCount}</p>
                    {stats.countChange !== 0 && (
                      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                        stats.countChange > 0 
                          ? 'text-emerald-700 bg-emerald-50' 
                          : 'text-red-700 bg-red-50'
                      }`}>
                        {stats.countChange > 0 ? '↑' : '↓'}{Math.abs(stats.countChange)}%
                      </span>
                    )}
                  </div>
                </Card>

                {/* Chiffre d'affaires */}
                <Card 
                  variant="elevated" 
                  className="p-4 sm:p-5 cursor-pointer group hover:shadow-lg transition-all duration-200 rounded-2xl"
                  onClick={() => setDetailDialog('revenue')}
                >
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">CA</p>
                  <div className="flex items-baseline gap-2 sm:gap-3">
                    <p className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">{stats.thisMonthRevenue.toLocaleString('fr-FR')}€</p>
                    {stats.revenueChange !== 0 && (
                      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full hidden sm:inline ${
                        stats.revenueChange > 0 
                          ? 'text-emerald-700 bg-emerald-50' 
                          : 'text-red-700 bg-red-50'
                      }`}>
                        {stats.revenueChange > 0 ? '↑' : '↓'}{Math.abs(stats.revenueChange)}%
                      </span>
                    )}
                  </div>
                </Card>

                {/* Clients */}
                <Card 
                  variant="elevated" 
                  className="p-4 sm:p-5 cursor-pointer group hover:shadow-lg transition-all duration-200 rounded-2xl"
                  onClick={() => setDetailDialog('clients')}
                >
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Clients</p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">{stats.uniqueClients}</p>
                </Card>

                {/* Panier moyen */}
                <Card variant="elevated" className="p-4 sm:p-5 rounded-2xl">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Panier moyen</p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">{stats.avgBasket}€</p>
                </Card>
              </div>

              <Tabs defaultValue="evolution" className="space-y-4 sm:space-y-6">
                <TabsList className="w-full rounded-xl grid grid-cols-2 h-10">
                  <TabsTrigger value="evolution" className="rounded-lg text-sm">Évolution</TabsTrigger>
                  <TabsTrigger value="formules" className="rounded-lg text-sm">Services</TabsTrigger>
                </TabsList>

                {/* Evolution Tab */}
                <TabsContent value="evolution" className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Weekly Chart */}
                    <Card variant="elevated" className="p-4 sm:p-6 rounded-2xl">
                      <h3 className="font-semibold text-foreground mb-3 sm:mb-4 text-sm sm:text-base">Réservations par semaine</h3>
                      <div className="h-48 sm:h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={weeklyData}>
                            <defs>
                              <linearGradient id="colorReservations" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#007AFF" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#007AFF" stopOpacity={0.02}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                            <XAxis dataKey="name" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '12px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                              }}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="réservations" 
                              stroke="#007AFF" 
                              fill="url(#colorReservations)"
                              strokeWidth={2.5}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </Card>

                    {/* Revenue Chart - Apple green */}
                    <Card variant="elevated" className="p-4 sm:p-6 rounded-2xl">
                      <h3 className="font-semibold text-foreground mb-4">Chiffre d'affaires par mois</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                            <XAxis dataKey="name" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip 
                              formatter={(value: number) => [`${value}€`, 'CA']}
                              contentStyle={{ 
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '12px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                              }}
                            />
                            <Bar dataKey="revenue" fill="#34C759" radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </Card>
                  </div>

                  {/* Total stats - Clickable */}
                  <Card variant="elevated" className="p-4 sm:p-6">
                    <h3 className="font-semibold text-foreground mb-4">Récapitulatif du mois</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div 
                        className="text-center p-4 bg-secondary/30 rounded-xl cursor-pointer hover:bg-secondary/50 transition-colors"
                        onClick={() => setDetailDialog('reservations')}
                      >
                        <p className="text-2xl sm:text-3xl font-bold text-foreground">{stats.thisMonthCount}</p>
                        <p className="text-sm text-muted-foreground">Total réservations</p>
                      </div>
                      <div 
                        className="text-center p-4 bg-secondary/30 rounded-xl cursor-pointer hover:bg-secondary/50 transition-colors"
                        onClick={() => setDetailDialog('revenue')}
                      >
                        <p className="text-2xl sm:text-3xl font-bold text-foreground">{stats.thisMonthRevenue.toLocaleString('fr-FR')}€</p>
                        <p className="text-sm text-muted-foreground">CA du mois</p>
                      </div>
                      <div 
                        className="text-center p-4 bg-secondary/30 rounded-xl cursor-pointer hover:bg-secondary/50 transition-colors"
                        onClick={() => setDetailDialog('completed')}
                      >
                        <p className="text-2xl sm:text-3xl font-bold text-foreground">{stats.completedCount}</p>
                        <p className="text-sm text-muted-foreground">Terminées</p>
                      </div>
                      <div className="text-center p-4 bg-secondary/30 rounded-xl">
                        <p className="text-2xl sm:text-3xl font-bold text-foreground">
                          {uniqueClientsCount > 0 ? Math.round(stats.thisMonthCount / uniqueClientsCount * 10) / 10 : 0}
                        </p>
                        <p className="text-sm text-muted-foreground">Visites/client</p>
                      </div>
                    </div>
                  </Card>
                </TabsContent>

                {/* Services Tab (renamed from Formules) */}
                <TabsContent value="formules" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Pie Chart */}
                    <Card variant="elevated" className="p-4 sm:p-6">
                      <h3 className="font-semibold text-foreground mb-4">Répartition des services</h3>
                      {serviceDistribution.length === 0 ? (
                        <div className="h-64 flex items-center justify-center">
                          <p className="text-muted-foreground">Aucune donnée disponible</p>
                        </div>
                      ) : (
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={serviceDistribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={2}
                                dataKey="value"
                              >
                                {serviceDistribution.map((_, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip 
                                formatter={(value: number, name: string) => [value, name]}
                                contentStyle={{ 
                                  backgroundColor: 'hsl(var(--card))',
                                  border: '1px solid hsl(var(--border))',
                                  borderRadius: '8px'
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </Card>

                    {/* Service list */}
                    <Card variant="elevated" className="p-4 sm:p-6">
                      <h3 className="font-semibold text-foreground mb-4">Performance par service</h3>
                      {serviceDistribution.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">Aucune donnée disponible</p>
                      ) : (
                        <div className="space-y-3">
                          {serviceDistribution.map((service, index) => {
                            const total = serviceDistribution.reduce((sum, p) => sum + p.value, 0);
                            const pct = Math.round((service.value / total) * 100);
                            return (
                              <div key={service.name} className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div 
                                      className="w-3 h-3 rounded-full" 
                                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                    />
                                    <span className="font-medium text-foreground">{service.name}</span>
                                    {service.type === 'custom' && (
                                      <Badge variant="secondary" className="text-xs">
                                        Perso
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <span className="font-semibold text-foreground">{service.revenue}€</span>
                                    <span className="text-muted-foreground text-sm ml-2">({service.value})</span>
                                  </div>
                                </div>
                                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                                  <div 
                                    className="h-full rounded-full transition-all"
                                    style={{ 
                                      width: `${pct}%`,
                                      backgroundColor: COLORS[index % COLORS.length]
                                    }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </main>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!detailDialog} onOpenChange={() => setDetailDialog(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>{detailDialog ? detailTitle[detailDialog] : ''}</DialogTitle>
            <DialogDescription className="sr-only">
              Détail des données statistiques pour le mois sélectionné
            </DialogDescription>
          </DialogHeader>
          <div className="text-sm text-muted-foreground mb-4">
            {format(selectedMonth, 'MMMM yyyy', { locale: fr })} • {detailAppointments.length} {detailDialog === 'clients' ? 'clients' : 'réservations'}
          </div>
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-2">
              {detailAppointments.map((apt) => (
                <div key={apt.id} className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl">
                  <div>
                    <p className="font-medium text-foreground">{apt.client_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(parseISO(apt.appointment_date), 'd MMM', { locale: fr })} à {apt.appointment_time.slice(0, 5)} • {getServiceName(apt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{getAppointmentPrice(apt)}€</p>
                    <p className="text-xs text-muted-foreground">
                      {apt.status === 'completed' ? 'Terminé' : apt.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                    </p>
                  </div>
                </div>
              ))}
              {detailAppointments.length === 0 && (
                <p className="text-center text-muted-foreground py-8">Aucune donnée pour cette période</p>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
