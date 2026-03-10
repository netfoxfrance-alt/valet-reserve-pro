import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, addDays, startOfWeek, addWeeks, isSameDay, isToday, isBefore } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useCenterAvailability } from '@/hooks/useAvailability';

interface AvailableSlotPickerProps {
  centerId: string;
  serviceDurationMinutes?: number;
  selectedDate: string; // yyyy-MM-dd
  selectedTime: string; // HH:mm
  onSelect: (date: string, time: string) => void;
}

export function AvailableSlotPicker({ centerId, serviceDurationMinutes, selectedDate, selectedTime, onSelect }: AvailableSlotPickerProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [pickedDate, setPickedDate] = useState<Date | null>(selectedDate ? new Date(selectedDate + 'T00:00:00') : null);

  const { loading, getAvailableSlotsForDate, isDayAvailable } = useCenterAvailability(centerId, serviceDurationMinutes);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  const handleDateClick = (day: Date) => {
    if (!isDayAvailable(day)) return;
    setPickedDate(day);
  };

  const handleTimeClick = (time: string) => {
    if (!pickedDate) return;
    const dateStr = format(pickedDate, 'yyyy-MM-dd');
    onSelect(dateStr, time);
  };

  const availableSlots = pickedDate ? getAvailableSlotsForDate(pickedDate) : [];
  const pickedDateStr = pickedDate ? format(pickedDate, 'yyyy-MM-dd') : '';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrentWeekStart(prev => addWeeks(prev, -1))}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm font-medium text-foreground capitalize">
          {format(currentWeekStart, "MMMM yyyy", { locale: fr })}
        </span>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrentWeekStart(prev => addWeeks(prev, 1))}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Days row */}
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day) => {
          const available = isDayAvailable(day);
          const isPast = isBefore(day, new Date()) && !isToday(day);
          const isActive = available && !isPast;
          const selected = pickedDate && isSameDay(day, pickedDate);

          return (
            <button
              key={day.toISOString()}
              onClick={() => isActive && handleDateClick(day)}
              disabled={!isActive}
              className={cn(
                "flex flex-col items-center py-2 px-1 rounded-lg transition-all text-center",
                !isActive && "opacity-30 cursor-not-allowed",
                isActive && !selected && "hover:bg-secondary",
                selected && "bg-primary text-primary-foreground"
              )}
            >
              <span className="text-[10px] uppercase tracking-wider mb-0.5">
                {format(day, 'EEE', { locale: fr })}
              </span>
              <span className="text-sm font-semibold">
                {format(day, 'd')}
              </span>
            </button>
          );
        })}
      </div>

      {/* Time slots */}
      {pickedDate && (
        <div className="animate-fade-in">
          <p className="text-xs text-muted-foreground mb-2">
            Créneaux disponibles le {format(pickedDate, "d MMMM", { locale: fr })}
          </p>
          {availableSlots.length > 0 ? (
            <div className="grid grid-cols-4 gap-1.5">
              {availableSlots.map((time) => (
                <button
                  key={time}
                  onClick={() => handleTimeClick(time)}
                  className={cn(
                    "py-2 px-2 rounded-lg text-sm font-medium transition-all",
                    selectedDate === pickedDateStr && selectedTime === time
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                >
                  {time}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 bg-secondary/50 rounded-lg">
              <p className="text-muted-foreground text-xs">Aucun créneau disponible ce jour</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
