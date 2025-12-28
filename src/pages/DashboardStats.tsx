import { useState, useMemo } from 'react';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { MobileSidebar } from '@/components/dashboard/MobileSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMyAppointments } from '@/hooks/useAppointments';
import { useMyCenter } from '@/hooks/useCenter';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, Users, TrendingUp, Euro, Search, Phone, Mail, Calendar, ChevronRight, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, subMonths, isWithinInterval, startOfWeek, endOfWeek, subWeeks, eachWeekOfInterval, eachMonthOfInterval, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', '#10b981', '#f59e0b', '#8b5cf6'];

export default function DashboardStats() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchClient, setSearchClient] = useState('');
  const { appointments, loading } = useMyAppointments();
  const { center } = useMyCenter();

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    const thisMonthAppointments = appointments.filter(a => {
      const date = parseISO(a.appointment_date);
      return isWithinInterval(date, { start: thisMonthStart, end: thisMonthEnd }) && a.status !== 'cancelled';
    });

    const lastMonthAppointments = appointments.filter(a => {
      const date = parseISO(a.appointment_date);
      return isWithinInterval(date, { start: lastMonthStart, end: lastMonthEnd }) && a.status !== 'cancelled';
    });

    const thisMonthRevenue = thisMonthAppointments.reduce((sum, a) => sum + (a.pack?.price || 0), 0);
    const lastMonthRevenue = lastMonthAppointments.reduce((sum, a) => sum + (a.pack?.price || 0), 0);

    const revenueChange = lastMonthRevenue > 0 
      ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
      : 0;

    const countChange = lastMonthAppointments.length > 0
      ? Math.round(((thisMonthAppointments.length - lastMonthAppointments.length) / lastMonthAppointments.length) * 100)
      : 0;

    // Unique clients
    const uniqueClients = new Set(appointments.map(a => a.client_phone)).size;

    // Average basket
    const completedWithPack = appointments.filter(a => a.status === 'completed' && a.pack);
    const avgBasket = completedWithPack.length > 0
      ? Math.round(completedWithPack.reduce((sum, a) => sum + (a.pack?.price || 0), 0) / completedWithPack.length)
      : 0;

    return {
      thisMonthCount: thisMonthAppointments.length,
      thisMonthRevenue,
      revenueChange,
      countChange,
      uniqueClients,
      avgBasket,
      totalRevenue: appointments.filter(a => a.status !== 'cancelled').reduce((sum, a) => sum + (a.pack?.price || 0), 0),
    };
  }, [appointments]);

  // Weekly evolution data (last 8 weeks)
  const weeklyData = useMemo(() => {
    const now = new Date();
    const weeks = eachWeekOfInterval({
      start: subWeeks(now, 7),
      end: now,
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
        revenue: weekAppointments.reduce((sum, a) => sum + (a.pack?.price || 0), 0),
      };
    });
  }, [appointments]);

  // Monthly evolution data (last 6 months)
  const monthlyData = useMemo(() => {
    const now = new Date();
    const months = eachMonthOfInterval({
      start: subMonths(now, 5),
      end: now,
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
        revenue: monthAppointments.reduce((sum, a) => sum + (a.pack?.price || 0), 0),
      };
    });
  }, [appointments]);

  // Pack distribution
  const packDistribution = useMemo(() => {
    const packCounts: Record<string, { count: number; revenue: number }> = {};
    
    appointments.filter(a => a.status !== 'cancelled' && a.pack).forEach(a => {
      const name = a.pack!.name;
      if (!packCounts[name]) {
        packCounts[name] = { count: 0, revenue: 0 };
      }
      packCounts[name].count++;
      packCounts[name].revenue += a.pack!.price;
    });

    return Object.entries(packCounts)
      .map(([name, data]) => ({
        name,
        value: data.count,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.value - a.value);
  }, [appointments]);

  // Client database
  const clients = useMemo(() => {
    const clientMap: Record<string, {
      name: string;
      phone: string;
      email: string;
      appointments: number;
      totalSpent: number;
      lastVisit: string;
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
        };
      }
      clientMap[key].appointments++;
      clientMap[key].totalSpent += a.pack?.price || 0;
      if (a.appointment_date > clientMap[key].lastVisit) {
        clientMap[key].lastVisit = a.appointment_date;
      }
    });

    return Object.values(clientMap)
      .sort((a, b) => b.totalSpent - a.totalSpent);
  }, [appointments]);

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchClient.toLowerCase()) ||
    c.phone.includes(searchClient)
  );

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
              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                <Card variant="elevated" className="p-4 sm:p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    {stats.countChange !== 0 && (
                      <div className={`flex items-center text-xs ${stats.countChange > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {stats.countChange > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {Math.abs(stats.countChange)}%
                      </div>
                    )}
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{stats.thisMonthCount}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Réservations ce mois</p>
                </Card>

                <Card variant="elevated" className="p-4 sm:p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                      <Euro className="w-5 h-5 text-green-600" />
                    </div>
                    {stats.revenueChange !== 0 && (
                      <div className={`flex items-center text-xs ${stats.revenueChange > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {stats.revenueChange > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {Math.abs(stats.revenueChange)}%
                      </div>
                    )}
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{stats.thisMonthRevenue.toLocaleString('fr-FR')}€</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Chiffre d'affaires</p>
                </Card>

                <Card variant="elevated" className="p-4 sm:p-5">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-2">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{stats.uniqueClients}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Clients uniques</p>
                </Card>

                <Card variant="elevated" className="p-4 sm:p-5">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center mb-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{stats.avgBasket}€</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Panier moyen</p>
                </Card>
              </div>

              <Tabs defaultValue="evolution" className="space-y-6">
                <TabsList className="w-full sm:w-auto">
                  <TabsTrigger value="evolution" className="flex-1 sm:flex-none">Évolution</TabsTrigger>
                  <TabsTrigger value="formules" className="flex-1 sm:flex-none">Formules</TabsTrigger>
                  <TabsTrigger value="clients" className="flex-1 sm:flex-none">Clients</TabsTrigger>
                </TabsList>

                {/* Evolution Tab */}
                <TabsContent value="evolution" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Weekly Chart */}
                    <Card variant="elevated" className="p-4 sm:p-6">
                      <h3 className="font-semibold text-foreground mb-4">Réservations par semaine</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={weeklyData}>
                            <defs>
                              <linearGradient id="colorReservations" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                            <XAxis dataKey="name" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                            <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px'
                              }}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="réservations" 
                              stroke="hsl(var(--primary))" 
                              fill="url(#colorReservations)"
                              strokeWidth={2}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </Card>

                    {/* Revenue Chart */}
                    <Card variant="elevated" className="p-4 sm:p-6">
                      <h3 className="font-semibold text-foreground mb-4">Chiffre d'affaires par mois</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                            <XAxis dataKey="name" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                            <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                            <Tooltip 
                              formatter={(value: number) => [`${value}€`, 'CA']}
                              contentStyle={{ 
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px'
                              }}
                            />
                            <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </Card>
                  </div>

                  {/* Total stats */}
                  <Card variant="elevated" className="p-4 sm:p-6">
                    <h3 className="font-semibold text-foreground mb-4">Récapitulatif global</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-secondary/30 rounded-xl">
                        <p className="text-2xl sm:text-3xl font-bold text-foreground">{appointments.filter(a => a.status !== 'cancelled').length}</p>
                        <p className="text-sm text-muted-foreground">Total réservations</p>
                      </div>
                      <div className="text-center p-4 bg-secondary/30 rounded-xl">
                        <p className="text-2xl sm:text-3xl font-bold text-foreground">{stats.totalRevenue.toLocaleString('fr-FR')}€</p>
                        <p className="text-sm text-muted-foreground">CA total</p>
                      </div>
                      <div className="text-center p-4 bg-secondary/30 rounded-xl">
                        <p className="text-2xl sm:text-3xl font-bold text-foreground">{appointments.filter(a => a.status === 'completed').length}</p>
                        <p className="text-sm text-muted-foreground">Terminées</p>
                      </div>
                      <div className="text-center p-4 bg-secondary/30 rounded-xl">
                        <p className="text-2xl sm:text-3xl font-bold text-foreground">
                          {clients.length > 0 ? Math.round(appointments.filter(a => a.status !== 'cancelled').length / clients.length * 10) / 10 : 0}
                        </p>
                        <p className="text-sm text-muted-foreground">Visites/client</p>
                      </div>
                    </div>
                  </Card>
                </TabsContent>

                {/* Formules Tab */}
                <TabsContent value="formules" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Pie Chart */}
                    <Card variant="elevated" className="p-4 sm:p-6">
                      <h3 className="font-semibold text-foreground mb-4">Répartition des formules</h3>
                      {packDistribution.length === 0 ? (
                        <div className="h-64 flex items-center justify-center">
                          <p className="text-muted-foreground">Aucune donnée disponible</p>
                        </div>
                      ) : (
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={packDistribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={2}
                                dataKey="value"
                              >
                                {packDistribution.map((_, index) => (
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

                    {/* Pack list */}
                    <Card variant="elevated" className="p-4 sm:p-6">
                      <h3 className="font-semibold text-foreground mb-4">Performance par formule</h3>
                      {packDistribution.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">Aucune donnée disponible</p>
                      ) : (
                        <div className="space-y-3">
                          {packDistribution.map((pack, index) => {
                            const total = packDistribution.reduce((sum, p) => sum + p.value, 0);
                            const pct = Math.round((pack.value / total) * 100);
                            return (
                              <div key={pack.name} className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div 
                                      className="w-3 h-3 rounded-full" 
                                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                    />
                                    <span className="font-medium text-foreground">{pack.name}</span>
                                  </div>
                                  <div className="text-right">
                                    <span className="font-semibold text-foreground">{pack.revenue}€</span>
                                    <span className="text-muted-foreground text-sm ml-2">({pack.value})</span>
                                  </div>
                                </div>
                                <div className="h-2 bg-secondary rounded-full overflow-hidden">
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

                {/* Clients Tab */}
                <TabsContent value="clients" className="space-y-4">
                  <Card variant="elevated" className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <div>
                        <h3 className="font-semibold text-foreground">Base clients</h3>
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
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          {searchClient ? 'Aucun client trouvé' : 'Aucun client pour le moment'}
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
                                  <span className="flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    {client.phone}
                                  </span>
                                  {client.email && client.email !== 'non-fourni@example.com' && (
                                    <span className="flex items-center gap-1">
                                      <Mail className="w-3 h-3" />
                                      {client.email}
                                    </span>
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
                </TabsContent>
              </Tabs>
            </>
          )}
        </main>
      </div>
    </div>
  );
}