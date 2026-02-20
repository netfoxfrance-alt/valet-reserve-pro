import { useMemo, useRef, useEffect, useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import { format, startOfWeek, addDays, isToday, parseISO } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { Appointment } from '@/hooks/useAppointments';

const HOUR_HEIGHT = 48;
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

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const nowTop = ((nowMinutes - START_HOUR * 60) / 60) * HOUR_HEIGHT;
  const showNowLine = nowMinutes >= START_HOUR * 60 && nowMinutes <= END_HOUR * 60;
  const todayIdx = weekDays.findIndex(d => isToday(d));

  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => START_HOUR + i);

  // Use single letter day names on mobile for compactness
  const getDayLabel = (day: Date) => {
    const full = format(day, 'EEEEE', { locale: dateLocale }); // single letter
    return full.toUpperCase();
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-xl sm:rounded-2xl border border-border overflow-hidden">
      {/* Everything in one scroll container — no alignment issues */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden">
        <table className="w-full border-collapse table-fixed">
          <colgroup>
            <col className="w-8 sm:w-14" />
            {weekDays.map((_, i) => <col key={i} />)}
          </colgroup>

          {/* Sticky header inside scroll */}
          <thead className="sticky top-0 z-20 bg-card border-b border-border">
            <tr>
              <th className="w-8 sm:w-14" />
              {weekDays.map((day, idx) => (
                <th
                  key={idx}
                  className={cn(
                    "text-center py-1.5 sm:py-3 border-l border-border font-normal",
                    isToday(day) && "bg-primary/5"
                  )}
                >
                  {/* Mobile: single letter + number, Desktop: abbreviation + number */}
                  <p className="text-[9px] sm:text-[11px] font-medium text-muted-foreground uppercase tracking-wide leading-none sm:hidden">
                    {getDayLabel(day)}
                  </p>
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider leading-none hidden sm:block">
                    {format(day, 'EEE', { locale: dateLocale })}
                  </p>
                  <div className="flex justify-center mt-0.5 sm:mt-1">
                    <span className={cn(
                      "font-semibold leading-none",
                      isToday(day)
                        ? "text-primary-foreground bg-primary rounded-full flex items-center justify-center w-6 h-6 text-xs sm:w-8 sm:h-8 sm:text-base"
                        : "text-foreground text-sm sm:text-xl"
                    )}>
                      {format(day, 'd')}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {hours.map((hour, hourIdx) => (
              <tr key={hour}>
                {/* Time label */}
                <td className="relative align-top select-none p-0" style={{ height: HOUR_HEIGHT }}>
                  <span className="absolute right-1 sm:right-2 -top-[6px] text-[9px] sm:text-[11px] text-muted-foreground tabular-nums whitespace-nowrap">
                    {`${hour}h`}
                  </span>
                </td>

                {/* Day cells */}
                {weekDays.map((day, dayIdx) => {
                  const key = format(day, 'yyyy-MM-dd');
                  const blocked = isDayBlocked(day);
                  const dayApts = hourIdx === 0 ? (appointmentsByDay.get(key) || []) : [];

                  return (
                    <td
                      key={dayIdx}
                      className={cn(
                        "relative border-l border-t border-border/40 p-0",
                        blocked && "bg-destructive/5",
                        isToday(day) && "bg-primary/[0.03]"
                      )}
                      style={{ height: HOUR_HEIGHT }}
                      onClick={(e) => {
                        if (!onSlotClick) return;
                        const rect = e.currentTarget.getBoundingClientRect();
                        const y = e.clientY - rect.top;
                        const minuteOffset = Math.round((y / HOUR_HEIGHT) * 60 / 30) * 30;
                        const totalMin = hour * 60 + minuteOffset;
                        const h = Math.floor(totalMin / 60);
                        const m = totalMin % 60;
                        if (h < START_HOUR || h >= END_HOUR) return;
                        const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                        onSlotClick(format(day, 'yyyy-MM-dd'), time);
                      }}
                    >
                      {/* Half-hour line */}
                      <div className="absolute left-0 right-0 border-t border-border/20" style={{ top: HOUR_HEIGHT / 2 }} />

                      {/* Now indicator */}
                      {showNowLine && todayIdx === dayIdx && hourIdx === 0 && (
                        <div className="absolute left-0 right-0 z-20 pointer-events-none" style={{ top: nowTop }}>
                          <div className="relative">
                            <div className="absolute -left-[4px] -top-[4px] w-[8px] h-[8px] rounded-full bg-destructive" />
                            <div className="h-[2px] bg-destructive w-full" />
                          </div>
                        </div>
                      )}

                      {/* Appointments */}
                      {dayApts.map(apt => {
                        const startMin = timeToMinutes(apt.appointment_time);
                        const duration = apt.duration_minutes || 60;
                        const top = ((startMin - START_HOUR * 60) / 60) * HOUR_HEIGHT;
                        const height = Math.max((duration / 60) * HOUR_HEIGHT - 2, 20);
                        const colors = statusColors[apt.status] || statusColors.confirmed;

                        return (
                          <button
                            key={apt.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onAppointmentClick(apt);
                            }}
                            className={cn(
                              "absolute left-px right-px sm:left-1 sm:right-1 rounded sm:rounded-lg border-l-2 sm:border-l-[3px] px-0.5 sm:px-1.5 py-px sm:py-0.5 overflow-hidden text-left transition-shadow hover:shadow-md z-10",
                              colors.bg, colors.border, colors.text
                            )}
                            style={{ top, height }}
                          >
                            <p className="text-[8px] sm:text-[11px] font-semibold truncate leading-tight">
                              {apt.client_name}
                            </p>
                            {height > 24 && (
                              <p className="text-[7px] sm:text-[10px] opacity-80 truncate leading-tight">
                                {apt.appointment_time.slice(0, 5)}
                              </p>
                            )}
                          </button>
                        );
                      })}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
