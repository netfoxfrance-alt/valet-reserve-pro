import { useState } from 'react';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { MobileSidebar } from '@/components/dashboard/MobileSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Card } from '@/components/ui/card';
import { useMyAppointments } from '@/hooks/useAppointments';
import { useMyCenter } from '@/hooks/useCenter';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3 } from 'lucide-react';

export default function DashboardStats() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { appointments, loading } = useMyAppointments();
  const { center } = useMyCenter();

  // Calculate stats
  const totalRevenue = appointments.reduce((sum, a) => sum + (a.pack?.price || 0), 0);
  
  // Pack distribution
  const packCounts = appointments.reduce((acc, a) => {
    const packName = a.pack?.name || 'Sans formule';
    acc[packName] = (acc[packName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const total = appointments.length || 1;
  const sortedPacks = Object.entries(packCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);

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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
              </div>
              <Skeleton className="h-64" />
            </div>
          ) : (
            <>
              {/* Main stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
                <Card variant="elevated" className="p-4 sm:p-6">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Ce mois</p>
                  <p className="text-3xl sm:text-4xl font-semibold text-foreground">{appointments.length}</p>
                  <p className="text-xs sm:text-sm text-green-600 mt-1">Réservations totales</p>
                </Card>
                <Card variant="elevated" className="p-4 sm:p-6">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Chiffre d'affaires</p>
                  <p className="text-3xl sm:text-4xl font-semibold text-foreground">
                    {totalRevenue.toLocaleString('fr-FR')}€
                  </p>
                  <p className="text-xs sm:text-sm text-green-600 mt-1">Ce mois</p>
                </Card>
              </div>

              {/* Pack distribution */}
              <Card variant="elevated" className="p-4 sm:p-6">
                <p className="text-sm sm:text-base font-medium text-foreground mb-4">Répartition des formules</p>
                {appointments.length === 0 ? (
                  <div className="text-center py-8">
                    <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground">
                      Aucune donnée disponible
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Les statistiques apparaîtront après vos premières réservations
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sortedPacks.map(([name, count]) => {
                      const pct = Math.round((count / total) * 100);
                      return (
                        <div key={name}>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-foreground font-medium">{name}</span>
                            <span className="text-muted-foreground">{count} ({pct}%)</span>
                          </div>
                          <div className="h-3 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
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