import { useState } from 'react';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { MobileSidebar } from '@/components/dashboard/MobileSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface DaySchedule {
  enabled: boolean;
  start: string;
  end: string;
}

interface Schedule {
  [key: string]: DaySchedule;
}

const defaultSchedule: Schedule = {
  lundi: { enabled: true, start: '09:00', end: '18:00' },
  mardi: { enabled: true, start: '09:00', end: '18:00' },
  mercredi: { enabled: true, start: '09:00', end: '18:00' },
  jeudi: { enabled: true, start: '09:00', end: '18:00' },
  vendredi: { enabled: true, start: '09:00', end: '18:00' },
  samedi: { enabled: true, start: '09:00', end: '14:00' },
  dimanche: { enabled: false, start: '09:00', end: '18:00' },
};

const dayLabels: { [key: string]: string } = {
  lundi: 'Lundi',
  mardi: 'Mardi',
  mercredi: 'Mercredi',
  jeudi: 'Jeudi',
  vendredi: 'Vendredi',
  samedi: 'Samedi',
  dimanche: 'Dimanche',
};

const dayLabelsShort: { [key: string]: string } = {
  lundi: 'Lun',
  mardi: 'Mar',
  mercredi: 'Mer',
  jeudi: 'Jeu',
  vendredi: 'Ven',
  samedi: 'Sam',
  dimanche: 'Dim',
};

export default function DashboardAvailability() {
  const [schedule, setSchedule] = useState<Schedule>(defaultSchedule);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const toggleDay = (day: string) => {
    setSchedule({
      ...schedule,
      [day]: { ...schedule[day], enabled: !schedule[day].enabled },
    });
  };
  
  const updateTime = (day: string, field: 'start' | 'end', value: string) => {
    setSchedule({
      ...schedule,
      [day]: { ...schedule[day], [field]: value },
    });
  };
  
  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <MobileSidebar open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} />
      
      <div className="lg:pl-64">
        <DashboardHeader 
          title="Disponibilités" 
          onMenuClick={() => setMobileMenuOpen(true)}
        />
        
        <main className="p-4 lg:p-8 max-w-3xl">
          <div className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-1 sm:mb-2">Horaires d'ouverture</h2>
            <p className="text-sm text-muted-foreground">Définissez vos plages horaires disponibles pour les réservations.</p>
          </div>
          
          <Card variant="elevated" className="divide-y divide-border">
            {Object.entries(schedule).map(([day, daySchedule]) => (
              <div key={day} className="p-3 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                <div className="flex items-center justify-between sm:justify-start sm:w-28 gap-3">
                  <span className={cn(
                    "font-medium text-sm sm:text-base",
                    daySchedule.enabled ? "text-foreground" : "text-muted-foreground"
                  )}>
                    <span className="sm:hidden">{dayLabelsShort[day]}</span>
                    <span className="hidden sm:inline">{dayLabels[day]}</span>
                  </span>
                  <Switch
                    checked={daySchedule.enabled}
                    onCheckedChange={() => toggleDay(day)}
                    className="sm:ml-0"
                  />
                </div>
                
                {daySchedule.enabled ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="time"
                      value={daySchedule.start}
                      onChange={(e) => updateTime(day, 'start', e.target.value)}
                      className="flex-1 sm:flex-none px-2 sm:px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm min-w-0"
                    />
                    <span className="text-muted-foreground text-sm">à</span>
                    <input
                      type="time"
                      value={daySchedule.end}
                      onChange={(e) => updateTime(day, 'end', e.target.value)}
                      className="flex-1 sm:flex-none px-2 sm:px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm min-w-0"
                    />
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">Fermé</span>
                )}
              </div>
            ))}
          </Card>
          
          <div className="mt-6 flex justify-end">
            <Button variant="premium" className="w-full sm:w-auto">
              Enregistrer les modifications
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}
