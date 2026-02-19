import { useMemo, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { format, startOfWeek, addDays, isSameDay, isToday, parseISO } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { Appointment } from '@/hooks/useAppointments';

const HOUR_HEIGHT = 60; // px per hour
const START_HOUR = 7;
const END_HOUR = 21;
const TOTAL_HOURS = END_HOUR - START_HOUR;

const statusColors: Record<string, { bg: string; border: string; text: string }> = {
  pending: { bg: 'bg-amber-100 dark:bg-amber-900/40', border: 'border-amber-400', text: 'text-amber-900 dark:text-amber-100' },
  pending_validation: { bg: 'bg-orange-100 dark:bg-orange-900/40', border: 'border-orange-400', text: 'text-orange-900 dark:text-orange-100' },
  confirmed: { bg: 'bg-sky-100 dark:bg-sky-900/40', border: 'border-sky-500', text: 'text-sky-900 dark:text-sky-100' },
  completed: { bg: 'bg-emerald-100 dark:bg-emerald-900/40', border: 'border-emerald-500', text: 'text-emerald-900 dark:text-emerald-100' },
  cancelled: { bg: 'bg-red-100 dark:bg-red-900/40', border: 'border-red-400', text: 'text-red-900 dark:text-red-100' },
  refused: { bg: 'bg-red-100 dark:bg-red-900/40', border: 'border-red-400', text: 'text-red-900 dark:text-red-100' },
};

interface WeeklyCalendarViewProps {
  currentDate: Date;
  appointments: Appointment[];
  onAppointmentClick: (apt: Appointment) => void;
  blockedPeriods?: { start_date: string; end_date: string; reason: string | null }[];
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function WeeklyCalendarView({ currentDate, appointments, onAppointmentClick, blockedPeriods = [] }: WeeklyCalendarViewProps) {
  const { i18n } = useTranslation();
  const dateLocale = i18n.language === 'en' ? enUS : fr;
  const scrollRef = useRef<HTMLDivElement>(null);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  // Scroll to 8am on mount
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = (8 - START_HOUR) * HOUR_HEIGHT;
    }
  }, []);

  // Group appointments by day
  const appointmentsByDay = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    weekDays.forEach(day => {
      const key = format(day, 'yyyy-MM-dd');
      map.set(key, appointments.filter(apt =>
        apt.appointment_date === key && apt.status !== 'cancelled' && apt.status !== 'refused'
      ));
    });
    return map;
  }, [appointments, weekDays]);

  // Check if a day is blocked
  const isDayBlocked = (date: Date) => {
    return blockedPeriods.some(period => {
      const start = parseISO(period.start_date);
      const end = parseISO(period.end_date);
      return date >= start && date <= end;
    });
  };

  // Current time indicator
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const nowTop = ((nowMinutes - START_HOUR * 60) / 60) * HOUR_HEIGHT;
  const showNowLine = nowMinutes >= START_HOUR * 60 && nowMinutes <= END_HOUR * 60;
  const todayIndex = weekDays.findIndex(d => isToday(d));

  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => START_HOUR + i);

  return (
    <div className="flex flex-col h-full rounded-2xl border border-border bg-card overflow-hidden">
      {/* Day headers - sticky */}
      <div className="flex border-b border-border bg-card z-10 shrink-0">
        {/* Time gutter */}
        <div className="w-14 sm:w-16 shrink-0" />
        {/* Day columns */}
        {weekDays.map((day, idx) => (
          <div
            key={idx}
            className={cn(
              "flex-1 min-w-0 text-center py-3 border-l border-border",
              isToday(day) && "bg-primary/5"
            )}
          >
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {format(day, 'EEE', { locale: dateLocale })}
            </p>
            <p className={cn(
              "text-xl sm:text-2xl font-semibold mt-0.5 leading-none",
              isToday(day) 
                ? "text-primary-foreground bg-primary w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mx-auto"
                : "text-foreground"
            )}>
              {format(day, 'd')}
            </p>
          </div>
        ))}
      </div>

      {/* Scrollable time grid */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden relative">
        <div className="flex" style={{ minHeight: TOTAL_HOURS * HOUR_HEIGHT }}>
          {/* Time labels */}
          <div className="w-14 sm:w-16 shrink-0 relative">
            {hours.map(hour => (
              <div
                key={hour}
                className="absolute right-2 sm:right-3 -translate-y-1/2 text-[10px] sm:text-xs text-muted-foreground font-medium"
                style={{ top: (hour - START_HOUR) * HOUR_HEIGHT }}
              >
                {`${hour}:00`}
              </div>
            ))}
          </div>

          {/* Day columns with grid lines */}
          <div className="flex-1 flex relative">
            {/* Horizontal hour lines */}
            {hours.map(hour => (
              <div
                key={hour}
                className="absolute left-0 right-0 border-t border-border/50"
                style={{ top: (hour - START_HOUR) * HOUR_HEIGHT }}
              />
            ))}

            {/* Now indicator line */}
            {showNowLine && (
              <div
                className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
                style={{ top: nowTop }}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 -ml-1 shrink-0" />
                <div className="flex-1 h-[2px] bg-red-500" />
              </div>
            )}

            {/* Day columns */}
            {weekDays.map((day, dayIdx) => {
              const key = format(day, 'yyyy-MM-dd');
              const dayApts = appointmentsByDay.get(key) || [];
              const blocked = isDayBlocked(day);

              return (
                <div
                  key={dayIdx}
                  className={cn(
                    "flex-1 min-w-0 relative border-l border-border",
                    blocked && "bg-red-50/50 dark:bg-red-950/10",
                    isToday(day) && "bg-primary/[0.03]"
                  )}
                  style={{ height: TOTAL_HOURS * HOUR_HEIGHT }}
                >
                  {/* Appointment blocks */}
                  {dayApts.map(apt => {
                    const startMin = timeToMinutes(apt.appointment_time);
                    const duration = apt.duration_minutes || 60;
                    const top = ((startMin - START_HOUR * 60) / 60) * HOUR_HEIGHT;
                    const height = Math.max((duration / 60) * HOUR_HEIGHT - 2, 20);
                    const colors = statusColors[apt.status] || statusColors.confirmed;

                    return (
                      <button
                        key={apt.id}
                        onClick={() => onAppointmentClick(apt)}
                        className={cn(
                          "absolute left-0.5 right-0.5 sm:left-1 sm:right-1 rounded-lg border-l-[3px] px-1.5 sm:px-2 py-1 overflow-hidden text-left transition-all hover:shadow-md hover:scale-[1.02] active:scale-100 z-10",
                          colors.bg,
                          colors.border,
                          colors.text
                        )}
                        style={{ top, height }}
                      >
                        <p className="text-[10px] sm:text-xs font-semibold truncate leading-tight">
                          {apt.client_name}
                        </p>
                        <p className="text-[9px] sm:text-[11px] opacity-80 truncate leading-tight">
                          {apt.appointment_time.slice(0, 5)}
                          {apt.duration_minutes && ` · ${apt.duration_minutes}min`}
                        </p>
                        {height > 44 && (
                          <p className="text-[9px] sm:text-[10px] opacity-60 truncate mt-0.5">
                            {apt.custom_service?.name || apt.pack?.name || ''}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
