import { useMemo, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, addMonths, subMonths, isSameMonth, isSameDay, isToday,
} from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Appointment } from '@/hooks/useAppointments';

/* ── Apple-vivid colors ── */
const APPOINTMENT_COLOR = '#049be6';
const TODAY_RED = '#ff392b';
const GREEN_VIVID = '#36c857';

const STATUS_STYLE: Record<string, { color: string; label: string }> = {
  pending:            { color: '#AF52DE', label: 'À valider' },
  pending_validation: { color: '#FF9500', label: 'À valider' },
  confirmed:          { color: APPOINTMENT_COLOR, label: 'Confirmé' },
  completed:          { color: GREEN_VIVID, label: 'Terminé' },
  cancelled:          { color: TODAY_RED, label: 'Annulé' },
  refused:            { color: TODAY_RED, label: 'Refusé' },
};

interface MobileCalendarViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  appointments: Appointment[];
  onAppointmentClick: (apt: Appointment) => void;
  blockedPeriods?: { start_date: string; end_date: string; reason: string | null }[];
}

export function MobileCalendarView({
  currentDate,
  onDateChange,
  appointments,
  onAppointmentClick,
  blockedPeriods = [],
}: MobileCalendarViewProps) {
  const { i18n } = useTranslation();
  const dateLocale = i18n.language === 'en' ? enUS : fr;
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    if (!isSameMonth(selectedDate, currentDate)) {
      setSelectedDate(startOfMonth(currentDate));
    }
  }, [currentDate]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = useMemo(() => {
    const result: Date[] = [];
    let d = calStart;
    while (d <= calEnd) { result.push(d); d = addDays(d, 1); }
    return result;
  }, [calStart.getTime(), calEnd.getTime()]);

  const aptsByDate = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    appointments
      .filter(a => a.status !== 'cancelled' && a.status !== 'refused')
      .forEach(apt => {
        const key = apt.appointment_date;
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(apt);
      });
    return map;
  }, [appointments]);

  const getAptsForDay = (date: Date) => aptsByDate.get(format(date, 'yyyy-MM-dd')) || [];

  const selectedDayApts = useMemo(() => {
    return getAptsForDay(selectedDate).sort((a, b) =>
      a.appointment_time.localeCompare(b.appointment_time)
    );
  }, [selectedDate, aptsByDate]);

  const prev = () => onDateChange(subMonths(currentDate, 1));
  const next = () => onDateChange(addMonths(currentDate, 1));
  const goToToday = () => {
    onDateChange(new Date());
    setSelectedDate(new Date());
  };

  const weekDayLabels = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) =>
      format(addDays(start, i), 'EEEEE', { locale: dateLocale }).toUpperCase()
    );
  }, [dateLocale]);

  return (
    <div className="flex flex-col h-full">
      {/* ── Month header ── */}
      <div className="flex items-center justify-between px-1 mb-2">
        <button onClick={prev} className="p-2 -ml-2 rounded-full active:bg-muted/60 transition-colors">
          <ChevronLeft className="w-5 h-5" style={{ color: APPOINTMENT_COLOR }} />
        </button>
        <h2 className="text-[17px] font-bold text-foreground capitalize tracking-tight">
          {format(currentDate, 'MMMM yyyy', { locale: dateLocale })}
        </h2>
        <button onClick={next} className="p-2 -mr-2 rounded-full active:bg-muted/60 transition-colors">
          <ChevronRight className="w-5 h-5" style={{ color: APPOINTMENT_COLOR }} />
        </button>
      </div>

      {/* ── Week day labels ── */}
      <div className="grid grid-cols-7 mb-0.5 px-0.5">
        {weekDayLabels.map((label, i) => (
          <div key={i} className="text-center text-[11px] font-semibold text-muted-foreground/60 py-1">
            {label}
          </div>
        ))}
      </div>

      {/* ── Calendar grid ── */}
      <div className="grid grid-cols-7 border-t border-border/20">
        {days.map((day, idx) => {
          const inMonth = isSameMonth(day, currentDate);
          const selected = isSameDay(day, selectedDate);
          const today = isToday(day);
          const dayApts = getAptsForDay(day);

          return (
            <button
              key={idx}
              onClick={() => setSelectedDate(day)}
              className={cn(
                "flex flex-col items-center pt-1.5 pb-1 min-h-[60px] border-b border-border/10 transition-colors relative",
                !inMonth && "opacity-25",
                selected && "bg-[#049be6]/[0.06]",
              )}
            >
              {/* Day number */}
              <span
                className={cn(
                  "text-[15px] w-8 h-8 flex items-center justify-center rounded-full transition-all leading-none",
                  !today && !selected && "text-foreground font-medium",
                )}
                style={{
                  ...(today ? { backgroundColor: TODAY_RED, color: 'white', fontWeight: 700 } : {}),
                  ...(selected && !today ? { backgroundColor: 'hsl(var(--foreground))', color: 'hsl(var(--background))', fontWeight: 700 } : {}),
                }}
              >
                {format(day, 'd')}
              </span>

              {/* Event indicators */}
              <div className="w-full px-px mt-0.5 space-y-[1px] overflow-hidden flex-1 flex flex-col">
                {dayApts.slice(0, 2).map((apt, i) => (
                  <div
                    key={i}
                    className="text-[7px] leading-[12px] font-bold text-white rounded-[2px] px-[3px] truncate"
                    style={{ backgroundColor: APPOINTMENT_COLOR }}
                  >
                    {apt.client_name.split(' ')[0]}
                  </div>
                ))}
                {dayApts.length > 2 && (
                  <div className="text-[7px] text-muted-foreground/60 font-bold text-center leading-[12px]">
                    +{dayApts.length - 2}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Selected day detail ── */}
      <div className="mt-3 flex-1 overflow-y-auto px-0.5">
        <div className="flex items-baseline justify-between mb-2.5 px-0.5">
          <h3 className="text-[22px] font-black text-foreground capitalize tracking-tight">
            {format(selectedDate, 'EEEE d MMMM', { locale: dateLocale })}
          </h3>
          {selectedDayApts.length > 0 && (
            <span className="text-[13px] font-semibold text-muted-foreground tracking-tight">
              {selectedDayApts.length} RDV
            </span>
          )}
        </div>

        {selectedDayApts.length > 0 ? (
          <div className="space-y-2">
            {selectedDayApts.map(apt => {
              const status = STATUS_STYLE[apt.status] || STATUS_STYLE.confirmed;
              const serviceName = apt.custom_service?.name || apt.pack?.name;

              return (
                <button
                  key={apt.id}
                  onClick={() => onAppointmentClick(apt)}
                  className="w-full text-left rounded-2xl p-3 active:scale-[0.98] transition-all bg-secondary/40 border border-border/30"
                >
                  <div className="flex items-center gap-3">
                    {/* Color bar */}
                    <div
                      className="w-1 self-stretch rounded-full shrink-0"
                      style={{ minHeight: 36, backgroundColor: status.color }}
                    />

                    {/* Time */}
                    <div className="shrink-0">
                      <span className="text-[15px] font-bold tabular-nums text-foreground">
                        {apt.appointment_time.slice(0, 5)}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[15px] text-foreground truncate leading-tight">
                        {apt.client_name}
                      </p>
                      {serviceName && (
                        <p className="text-[12px] text-muted-foreground truncate mt-0.5 uppercase tracking-wide font-medium">
                          {serviceName}
                        </p>
                      )}
                    </div>

                    {/* Status badge */}
                    <span
                      className="text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 whitespace-nowrap text-white"
                      style={{ backgroundColor: status.color }}
                    >
                      {status.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground/50 text-[13px] font-medium">Aucun rendez-vous</p>
          </div>
        )}

        {/* "Aujourd'hui" button */}
        {!isToday(selectedDate) && (
          <div className="flex justify-center mt-4 mb-2">
            <button
              onClick={goToToday}
              className="px-5 py-2 rounded-full border border-border/50 text-[13px] font-semibold text-foreground active:bg-muted/60 transition-colors"
            >
              Aujourd'hui
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
