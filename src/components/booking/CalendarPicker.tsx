import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, addDays, startOfWeek, addWeeks, isSameDay, isToday, isBefore } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CalendarPickerProps {
  onSelect: (date: Date, time: string) => void;
  duration: string;
}

const timeSlots = [
  '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'
];

export function CalendarPicker({ onSelect, duration }: CalendarPickerProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  
  const handlePrevWeek = () => {
    setCurrentWeekStart(prev => addWeeks(prev, -1));
  };
  
  const handleNextWeek = () => {
    setCurrentWeekStart(prev => addWeeks(prev, 1));
  };
  
  const handleDateSelect = (date: Date) => {
    if (isBefore(date, new Date()) && !isToday(date)) return;
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
  
  const isDateDisabled = (date: Date) => {
    return isBefore(date, new Date()) && !isToday(date);
  };
  
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
            const disabled = isDateDisabled(day);
            const selected = selectedDate && isSameDay(day, selectedDate);
            
            return (
              <button
                key={day.toISOString()}
                onClick={() => handleDateSelect(day)}
                disabled={disabled}
                className={cn(
                  "flex flex-col items-center p-3 rounded-xl transition-all",
                  disabled && "opacity-40 cursor-not-allowed",
                  !disabled && !selected && "hover:bg-secondary",
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
            <div className="grid grid-cols-3 gap-2 mb-6">
              {timeSlots.map((time) => (
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
