import { useState } from 'react';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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

export default function DashboardAvailability() {
  const [schedule, setSchedule] = useState<Schedule>(defaultSchedule);
  
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
      
      <div className="lg:pl-64">
        <DashboardHeader title="Disponibilités" />
        
        <main className="p-4 lg:p-8 max-w-3xl">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-2">Horaires d'ouverture</h2>
            <p className="text-muted-foreground">Définissez vos plages horaires disponibles pour les réservations.</p>
          </div>
          
          <Card variant="elevated" className="divide-y divide-border">
            {Object.entries(schedule).map(([day, daySchedule]) => (
              <div key={day} className="p-5 flex items-center gap-6">
                <div className="w-28">
                  <span className={cn(
                    "font-medium",
                    daySchedule.enabled ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {dayLabels[day]}
                  </span>
                </div>
                
                <Switch
                  checked={daySchedule.enabled}
                  onCheckedChange={() => toggleDay(day)}
                />
                
                {daySchedule.enabled ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="time"
                      value={daySchedule.start}
                      onChange={(e) => updateTime(day, 'start', e.target.value)}
                      className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
                    />
                    <span className="text-muted-foreground">à</span>
                    <input
                      type="time"
                      value={daySchedule.end}
                      onChange={(e) => updateTime(day, 'end', e.target.value)}
                      className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
                    />
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">Fermé</span>
                )}
              </div>
            ))}
          </Card>
          
          <div className="mt-6 flex justify-end">
            <Button variant="premium">
              Enregistrer les modifications
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}
