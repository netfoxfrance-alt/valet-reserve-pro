import { useMemo, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { format, startOfWeek, addDays, isSameDay, isToday, parseISO } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { Appointment } from '@/hooks/useAppointments';

const HOUR_HEIGHT = 60;
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
  onSlotClick?: (date: string, time: string) => void;
  blockedPeriods?: { start_date: string; end_date: string; reason: string | null }[];
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function WeeklyCalendarView({ currentDate, appointments, onAppointmentClick, onSlotClick, blockedPeriods = [] }: WeeklyCalendarViewProps) {
  const { i18n } = useTranslation();
  const dateLocale = i18n.language === 'en' ? enUS : fr;
  const scrollRef = useRef<HTMLDivElement>(null);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = (8 - START_HOUR) * HOUR_HEIGHT;
    }
  }, []);

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

  const isDayBlocked = (date: Date) => {
    return blockedPeriods.some(period => {
      const start = parseISO(period.start_date);
      const end = parseISO(period.end_date);
      return date >= start && date <= end;
    });
  };

  const handleSlotClick = useCallback((dayIdx: number, e: React.MouseEvent<HTMLDivElement>) => {
    if (!onSlotClick) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const totalMinutes = START_HOUR * 60 + (y / HOUR_HEIGHT) * 60;
    const roundedMinutes = Math.round(totalMinutes / 30) * 30;
    const h = Math.floor(roundedMinutes / 60);
    const m = roundedMinutes % 60;
    if (h < START_HOUR || h >= END_HOUR) return;
    const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    const date = format(weekDays[dayIdx], 'yyyy-MM-dd');
    onSlotClick(date, time);
  }, [onSlotClick, weekDays]);

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const nowTop = ((nowMinutes - START_HOUR * 60) / 60) * HOUR_HEIGHT;
  const showNowLine = nowMinutes >= START_HOUR * 60 && nowMinutes <= END_HOUR * 60;

  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => START_HOUR + i);

  return (
    <div className="flex flex-col h-full rounded-2xl border border-border bg-card overflow-hidden">
      {/* Day headers */}
      <div className="grid shrink-0 border-b border-border bg-card z-10" style={{ gridTemplateColumns: '56px repeat(7, 1fr)' }}>
        <div className="border-r border-border" />
        {weekDays.map((day, idx) => (
          <div
            key={idx}
            className={cn(
              "text-center py-3 border-r border-border last:border-r-0",
              isToday(day) && "bg-primary/5"
            )}
          >
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              {format(day, 'EEE', { locale: dateLocale })}
            </p>
            <p className={cn(
              "text-xl font-semibold mt-0.5 leading-none",
              isToday(day)
                ? "text-primary-foreground bg-primary w-9 h-9 rounded-full flex items-center justify-center mx-auto"
                : "text-foreground"
            )}>
              {format(day, 'd')}
            </p>
          </div>
        ))}
      </div>

      {/* Scrollable time grid */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="grid relative" style={{ gridTemplateColumns: '56px repeat(7, 1fr)', minHeight: TOTAL_HOURS * HOUR_HEIGHT }}>
          {/* Time labels column */}
          <div className="relative border-r border-border">
            {hours.map(hour => (
              <div
                key={hour}
                className="absolute right-2 -translate-y-1/2 text-[11px] text-muted-foreground font-medium tabular-nums"
                style={{ top: (hour - START_HOUR) * HOUR_HEIGHT }}
              >
                {`${hour}:00`}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day, dayIdx) => {
            const key = format(day, 'yyyy-MM-dd');
            const dayApts = appointmentsByDay.get(key) || [];
            const blocked = isDayBlocked(day);

            return (
              <div
                key={dayIdx}
                className={cn(
                  "relative border-r border-border last:border-r-0",
                  blocked && "bg-red-50/50 dark:bg-red-950/10",
                  isToday(day) && "bg-primary/[0.03]"
                )}
                style={{ height: TOTAL_HOURS * HOUR_HEIGHT }}
                onClick={(e) => handleSlotClick(dayIdx, e)}
              >
                {/* Hour lines */}
                {hours.map(hour => (
                  <div
                    key={hour}
                    className="absolute left-0 right-0 border-t border-border/40"
                    style={{ top: (hour - START_HOUR) * HOUR_HEIGHT }}
                  />
                ))}

                {/* Half-hour lines */}
                {hours.map(hour => (
                  <div
                    key={`half-${hour}`}
                    className="absolute left-0 right-0 border-t border-border/20"
                    style={{ top: (hour - START_HOUR) * HOUR_HEIGHT + HOUR_HEIGHT / 2 }}
                  />
                ))}

                {/* Now indicator */}
                {showNowLine && isToday(day) && (
                  <div
                    className="absolute left-0 right-0 z-20 pointer-events-none"
                    style={{ top: nowTop }}
                  >
                    <div className="relative">
                      <div className="absolute -left-[5px] -top-[4px] w-[10px] h-[10px] rounded-full bg-red-500" />
                      <div className="h-[2px] bg-red-500 w-full" />
                    </div>
                  </div>
                )}

                {/* Appointment blocks */}
                {dayApts.map(apt => {
                  const startMin = timeToMinutes(apt.appointment_time);
                  const duration = apt.duration_minutes || 60;
                  const top = ((startMin - START_HOUR * 60) / 60) * HOUR_HEIGHT;
                  const height = Math.max((duration / 60) * HOUR_HEIGHT - 2, 22);
                  const colors = statusColors[apt.status] || statusColors.confirmed;

                  return (
                    <button
                      key={apt.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAppointmentClick(apt);
                      }}
                      className={cn(
                        "absolute left-1 right-1 rounded-lg border-l-[3px] px-2 py-1 overflow-hidden text-left transition-all hover:shadow-md hover:scale-[1.02] active:scale-100 z-10",
                        colors.bg,
                        colors.border,
                        colors.text
                      )}
                      style={{ top, height }}
                    >
                      <p className="text-[11px] font-semibold truncate leading-tight">
                        {apt.client_name}
                      </p>
                      <p className="text-[10px] opacity-80 truncate leading-tight">
                        {apt.appointment_time.slice(0, 5)}
                        {apt.duration_minutes && ` · ${apt.duration_minutes}min`}
                      </p>
                      {height > 44 && (
                        <p className="text-[9px] opacity-60 truncate mt-0.5">
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
  );
}
