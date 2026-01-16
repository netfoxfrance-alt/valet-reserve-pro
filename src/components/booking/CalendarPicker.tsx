import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, addDays, startOfWeek, addWeeks, isSameDay, isToday, isBefore } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useCenterAvailability } from '@/hooks/useAvailability';

// Créneaux par défaut pour la page demo (sans centerId)
const defaultTimeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

// Helper to check if a time slot has passed for today
const isTimeSlotPast = (time: string, date: Date): boolean => {
  if (!isToday(date)) return false;
  
  const now = new Date();
  const [hours, minutes] = time.split(':').map(Number);
  const slotTime = new Date();
  slotTime.setHours(hours, minutes, 0, 0);
  
  const bufferTime = new Date(now.getTime() + 30 * 60 * 1000);
  return slotTime <= bufferTime;
};

interface CalendarPickerProps {
  onSelect: (date: Date, time: string) => void;
  duration: string;
  centerId?: string; // Optionnel - si absent, utilise les créneaux par défaut
}

export function CalendarPicker({ onSelect, duration, centerId }: CalendarPickerProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  const { loading, getAvailableSlotsForDate, isDayAvailable } = useCenterAvailability(centerId);
  
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  
  const handlePrevWeek = () => {
    setCurrentWeekStart(prev => addWeeks(prev, -1));
  };
  
  const handleNextWeek = () => {
    setCurrentWeekStart(prev => addWeeks(prev, 1));
  };
  
  // Fallback logic for demo page (no centerId)
  const checkDayAvailable = (date: Date): boolean => {
    if (centerId) return isDayAvailable(date);
    // Sans centerId: jours passés désactivés seulement
    return !isBefore(date, new Date()) || isToday(date);
  };
  
  const getSlotsForDate = (date: Date): string[] => {
    if (centerId) return getAvailableSlotsForDate(date);
    // Sans centerId: utiliser les créneaux par défaut
    return defaultTimeSlots.filter(time => !isTimeSlotPast(time, date));
  };
  
  const handleDateSelect = (date: Date) => {
    if (!checkDayAvailable(date)) return;
    setSelectedDate(date);
    setSelectedTime(null);
  };
  
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };
  
  const handleConfirm = () => {
    if (selectedDate && selectedTime) {
      onSelect(selectedDate, selectedTime);
    }
  };
  
  // Get available time slots for selected date
  const availableSlots = selectedDate ? getSlotsForDate(selectedDate) : [];
  
  if (centerId && loading) {
    return (
      <div className="w-full max-w-lg mx-auto animate-fade-in-up">
        <Card variant="elevated" className="p-6 flex items-center justify-center min-h-[300px]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </Card>
      </div>
    );
  }
  
  return (
    <div className="w-full max-w-lg mx-auto animate-fade-in-up">
      <Card variant="elevated" className="p-6">
        {/* Week navigation */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="icon" onClick={handlePrevWeek}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <span className="font-medium text-foreground">
            {format(currentWeekStart, "MMMM yyyy", { locale: fr })}
          </span>
          <Button variant="ghost" size="icon" onClick={handleNextWeek}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Days grid */}
        <div className="grid grid-cols-7 gap-2 mb-6">
          {weekDays.map((day) => {
            const available = isDayAvailable(day);
            const selected = selectedDate && isSameDay(day, selectedDate);
            
            return (
              <button
                key={day.toISOString()}
                onClick={() => handleDateSelect(day)}
                disabled={!available}
                className={cn(
                  "flex flex-col items-center p-3 rounded-xl transition-all",
                  !available && "opacity-40 cursor-not-allowed",
                  available && !selected && "hover:bg-secondary",
                  selected && "bg-primary text-primary-foreground"
                )}
              >
                <span className="text-xs uppercase tracking-wider mb-1">
                  {format(day, 'EEE', { locale: fr })}
                </span>
                <span className="text-lg font-semibold">
                  {format(day, 'd')}
                </span>
              </button>
            );
          })}
        </div>
        
        {/* Time slots */}
        {selectedDate && (
          <div className="animate-fade-in">
            <p className="text-sm text-muted-foreground mb-4">
              Créneaux disponibles le {format(selectedDate, "d MMMM", { locale: fr })}
            </p>
            {availableSlots.length > 0 ? (
              <div className="grid grid-cols-3 gap-2 mb-6">
                {availableSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => handleTimeSelect(time)}
                    className={cn(
                      "py-3 px-4 rounded-xl font-medium transition-all",
                      selectedTime === time
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    )}
                  >
                    {time}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 mb-6 bg-secondary/50 rounded-xl">
                <p className="text-muted-foreground text-sm">Aucun créneau disponible ce jour</p>
              </div>
            )}
          </div>
        )}
        
        {/* Confirm button */}
        {selectedDate && selectedTime && (
          <Button 
            variant="premium" 
            size="lg" 
            className="w-full animate-fade-in"
            onClick={handleConfirm}
          >
            <Check className="w-5 h-5 mr-2" />
            Confirmer le {format(selectedDate, "d MMMM", { locale: fr })} à {selectedTime}
          </Button>
        )}
      </Card>
    </div>
  );
}
