import { useState } from 'react';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { MobileSidebar } from '@/components/dashboard/MobileSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Plus, X, Coffee } from 'lucide-react';

interface TimeSlot {
  start: string;
  end: string;
}

interface DaySchedule {
  enabled: boolean;
  slots: TimeSlot[];
}

interface Schedule {
  [key: string]: DaySchedule;
}

const defaultSchedule: Schedule = {
  lundi: { enabled: true, slots: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '18:00' }] },
  mardi: { enabled: true, slots: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '18:00' }] },
  mercredi: { enabled: true, slots: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '18:00' }] },
  jeudi: { enabled: true, slots: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '18:00' }] },
  vendredi: { enabled: true, slots: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '18:00' }] },
  samedi: { enabled: true, slots: [{ start: '09:00', end: '14:00' }] },
  dimanche: { enabled: false, slots: [{ start: '09:00', end: '18:00' }] },
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
  
  const updateSlotTime = (day: string, slotIndex: number, field: 'start' | 'end', value: string) => {
    const newSlots = [...schedule[day].slots];
    newSlots[slotIndex] = { ...newSlots[slotIndex], [field]: value };
    setSchedule({
      ...schedule,
      [day]: { ...schedule[day], slots: newSlots },
    });
  };

  const addSlot = (day: string) => {
    const lastSlot = schedule[day].slots[schedule[day].slots.length - 1];
    const newStart = lastSlot ? lastSlot.end : '09:00';
    // Add 2 hours for new slot end
    const [hours] = newStart.split(':').map(Number);
    const newEnd = `${Math.min(hours + 4, 23).toString().padStart(2, '0')}:00`;
    
    setSchedule({
      ...schedule,
      [day]: {
        ...schedule[day],
        slots: [...schedule[day].slots, { start: newStart, end: newEnd }],
      },
    });
  };

  const removeSlot = (day: string, slotIndex: number) => {
    if (schedule[day].slots.length <= 1) return; // Keep at least one slot
    
    const newSlots = schedule[day].slots.filter((_, i) => i !== slotIndex);
    setSchedule({
      ...schedule,
      [day]: { ...schedule[day], slots: newSlots },
    });
  };

  // Format slots for display
  const formatSlotsPreview = (slots: TimeSlot[]) => {
    if (slots.length === 1) {
      return `${slots[0].start.replace(':', 'h')} - ${slots[0].end.replace(':', 'h')}`;
    }
    return slots.map(s => `${s.start.replace(':', 'h')}-${s.end.replace(':', 'h')}`).join(' · ');
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
            <p className="text-sm text-muted-foreground">Définissez vos plages horaires disponibles pour les réservations. Ajoutez des pauses si nécessaire.</p>
          </div>
          
          <Card variant="elevated" className="divide-y divide-border">
            {Object.entries(schedule).map(([day, daySchedule]) => (
              <div key={day} className="p-4 sm:p-5">
                {/* Day header with toggle */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={daySchedule.enabled}
                      onCheckedChange={() => toggleDay(day)}
                    />
                    <span className={cn(
                      "font-medium text-sm sm:text-base",
                      daySchedule.enabled ? "text-foreground" : "text-muted-foreground"
                    )}>
                      <span className="sm:hidden">{dayLabelsShort[day]}</span>
                      <span className="hidden sm:inline">{dayLabels[day]}</span>
                    </span>
                  </div>
                  
                  {daySchedule.enabled && (
                    <span className="text-xs text-muted-foreground hidden sm:block">
                      {formatSlotsPreview(daySchedule.slots)}
                    </span>
                  )}
                </div>
                
                {daySchedule.enabled ? (
                  <div className="space-y-2 ml-0 sm:ml-12">
                    {daySchedule.slots.map((slot, slotIndex) => (
                      <div key={slotIndex} className="flex items-center gap-2">
                        {/* Slot indicator */}
                        {slotIndex > 0 && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mr-1">
                            <Coffee className="w-3 h-3" />
                          </div>
                        )}
                        
                        <input
                          type="time"
                          value={slot.start}
                          onChange={(e) => updateSlotTime(day, slotIndex, 'start', e.target.value)}
                          className="flex-1 sm:flex-none sm:w-28 px-2 sm:px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
                        />
                        <span className="text-muted-foreground text-sm">à</span>
                        <input
                          type="time"
                          value={slot.end}
                          onChange={(e) => updateSlotTime(day, slotIndex, 'end', e.target.value)}
                          className="flex-1 sm:flex-none sm:w-28 px-2 sm:px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
                        />
                        
                        {/* Remove slot button (only if more than one slot) */}
                        {daySchedule.slots.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSlot(day, slotIndex)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    
                    {/* Add break/slot button */}
                    <button
                      type="button"
                      onClick={() => addSlot(day)}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mt-2"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ajouter une pause</span>
                    </button>
                  </div>
                ) : (
                  <div className="ml-0 sm:ml-12">
                    <span className="text-muted-foreground text-sm">Fermé</span>
                  </div>
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
