import { useMemo, useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { format, startOfWeek, addDays, isToday, parseISO } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { Appointment } from '@/hooks/useAppointments';

const HOUR_HEIGHT = 52;
const MOBILE_HOUR_HEIGHT = 48;
const START_HOUR = 7;
const END_HOUR = 21;
const TOTAL_HOURS = END_HOUR - START_HOUR;

const statusColors: Record<string, { bg: string; border: string; text: string }> = {
  pending: { bg: 'bg-amber-50 dark:bg-amber-900/30', border: 'border-l-amber-400', text: 'text-amber-800 dark:text-amber-200' },
  pending_validation: { bg: 'bg-orange-50 dark:bg-orange-900/30', border: 'border-l-orange-400', text: 'text-orange-800 dark:text-orange-200' },
  confirmed: { bg: 'bg-sky-50 dark:bg-sky-900/30', border: 'border-l-sky-500', text: 'text-sky-800 dark:text-sky-200' },
  completed: { bg: 'bg-emerald-50 dark:bg-emerald-900/30', border: 'border-l-emerald-500', text: 'text-emerald-800 dark:text-emerald-200' },
  cancelled: { bg: 'bg-red-50 dark:bg-red-900/30', border: 'border-l-red-400', text: 'text-red-800 dark:text-red-200' },
  refused: { bg: 'bg-red-50 dark:bg-red-900/30', border: 'border-l-red-400', text: 'text-red-800 dark:text-red-200' },
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
  const [isMobile, setIsMobile] = useState(false);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const hourHeight = isMobile ? MOBILE_HOUR_HEIGHT : HOUR_HEIGHT;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = (8 - START_HOUR) * hourHeight;
    }
  }, [hourHeight]);

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

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const nowTop = ((nowMinutes - START_HOUR * 60) / 60) * hourHeight;
  const showNowLine = nowMinutes >= START_HOUR * 60 && nowMinutes <= END_HOUR * 60;
  const todayIdx = weekDays.findIndex(d => isToday(d));

  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => START_HOUR + i);

  return (
    <div className="flex flex-col h-full bg-card rounded-2xl overflow-hidden">
      {/* Day headers — fixed */}
      <div className="flex border-b border-border/50 bg-card z-20">
        {/* Time column spacer */}
        <div className="w-10 sm:w-14 shrink-0" />
        
        {/* Day columns */}
        {weekDays.map((day, idx) => (
          <div
            key={idx}
            className={cn(
              "flex-1 text-center py-2 sm:py-3 min-w-0",
              idx > 0 && "border-l border-border/30"
            )}
          >
            <p className={cn(
              "text-[10px] sm:text-[11px] font-medium uppercase tracking-wide leading-none",
              isToday(day) ? "text-primary" : "text-muted-foreground"
            )}>
              {isMobile 
                ? format(day, 'EEEEE', { locale: dateLocale }).toUpperCase()
                : format(day, 'EEE', { locale: dateLocale })
              }
            </p>
            <div className="flex justify-center mt-1">
              <span className={cn(
                "font-semibold leading-none transition-colors",
                isToday(day)
                  ? "text-primary-foreground bg-primary rounded-full flex items-center justify-center w-7 h-7 text-xs sm:w-8 sm:h-8 sm:text-sm"
                  : "text-foreground text-sm sm:text-lg"
              )}>
                {format(day, 'd')}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Scrollable time grid */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden relative">
        {/* Now indicator — full width red line */}
        {showNowLine && (
          <div className="absolute left-10 sm:left-14 right-0 z-30 pointer-events-none" style={{ top: nowTop }}>
            <div className="relative">
              <div className="absolute -left-[5px] -top-[5px] w-[10px] h-[10px] rounded-full bg-red-500" />
              <div className="h-[2px] bg-red-500 w-full" />
            </div>
          </div>
        )}

        {/* Hour rows */}
        {hours.map((hour, hourIdx) => (
          <div key={hour} className="flex" style={{ height: hourHeight }}>
            {/* Time label */}
            <div className="w-10 sm:w-14 shrink-0 relative select-none">
              <span className="absolute right-2 sm:right-3 -top-[7px] text-[10px] sm:text-[11px] text-muted-foreground/70 tabular-nums font-light">
                {`${hour}:00`}
              </span>
            </div>

            {/* Day cells */}
            {weekDays.map((day, dayIdx) => {
              const key = format(day, 'yyyy-MM-dd');
              const blocked = isDayBlocked(day);
              const dayApts = hourIdx === 0 ? (appointmentsByDay.get(key) || []) : [];

              return (
                <div
                  key={dayIdx}
                  className={cn(
                    "flex-1 relative min-w-0",
                    dayIdx > 0 && "border-l border-border/20",
                    "border-t border-border/30",
                    blocked && "bg-destructive/[0.03]",
                    isToday(day) && "bg-primary/[0.02]"
                  )}
                  onClick={(e) => {
                    if (!onSlotClick) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const y = e.clientY - rect.top;
                    const minuteOffset = Math.round((y / hourHeight) * 60 / 15) * 15;
                    const totalMin = hour * 60 + minuteOffset;
                    const h = Math.floor(totalMin / 60);
                    const m = totalMin % 60;
                    if (h < START_HOUR || h >= END_HOUR) return;
                    const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                    onSlotClick(format(day, 'yyyy-MM-dd'), time);
                  }}
                >
                  {/* Half-hour line */}
                  <div className="absolute left-0 right-0 border-t border-border/15" style={{ top: hourHeight / 2 }} />

                  {/* Appointments */}
                  {dayApts.map(apt => {
                    const startMin = timeToMinutes(apt.appointment_time);
                    const duration = apt.duration_minutes || 60;
                    const top = ((startMin - START_HOUR * 60) / 60) * hourHeight;
                    const height = Math.max((duration / 60) * hourHeight - 2, 22);
                    const colors = statusColors[apt.status] || statusColors.confirmed;

                    return (
                      <button
                        key={apt.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAppointmentClick(apt);
                        }}
                        className={cn(
                          "absolute left-0.5 right-0.5 sm:left-1 sm:right-1 rounded-md sm:rounded-lg border-l-[3px] px-1 sm:px-2 py-0.5 overflow-hidden text-left transition-all active:scale-[0.97] hover:shadow-md z-10",
                          colors.bg, colors.border, colors.text
                        )}
                        style={{ top, height }}
                      >
                        <p className="text-[9px] sm:text-[11px] font-semibold truncate leading-tight">
                          {apt.client_name}
                        </p>
                        {height > 26 && (
                          <p className="text-[8px] sm:text-[10px] opacity-60 truncate leading-tight">
                            {apt.appointment_time.slice(0, 5)}
                            {apt.custom_service?.name || apt.pack?.name ? ` · ${apt.custom_service?.name || apt.pack?.name}` : ''}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
