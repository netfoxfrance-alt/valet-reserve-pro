import { useMemo, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, addMonths, subMonths, isSameMonth, isSameDay, isToday, parseISO,
} from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { Appointment } from '@/hooks/useAppointments';

/* ── status config ── */
const STATUS_STYLE: Record<string, { dot: string; badge: string; badgeBg: string; label: string }> = {
  pending:            { dot: 'bg-amber-400',   badge: 'text-amber-700 dark:text-amber-300',   badgeBg: 'bg-amber-100 dark:bg-amber-900/40',   label: 'En attente' },
  pending_validation: { dot: 'bg-orange-400',  badge: 'text-orange-700 dark:text-orange-300', badgeBg: 'bg-orange-100 dark:bg-orange-900/40', label: 'À valider' },
  confirmed:          { dot: 'bg-sky-500',     badge: 'text-sky-700 dark:text-sky-300',       badgeBg: 'bg-sky-100 dark:bg-sky-900/40',       label: 'Confirmé' },
  completed:          { dot: 'bg-emerald-500', badge: 'text-emerald-700 dark:text-emerald-300', badgeBg: 'bg-emerald-100 dark:bg-emerald-900/40', label: 'Terminé' },
  cancelled:          { dot: 'bg-red-400',     badge: 'text-red-700 dark:text-red-300',       badgeBg: 'bg-red-100 dark:bg-red-900/40',       label: 'Annulé' },
  refused:            { dot: 'bg-red-400',     badge: 'text-red-700 dark:text-red-300',       badgeBg: 'bg-red-100 dark:bg-red-900/40',       label: 'Refusé' },
};

const EVENT_COLORS = [
  'bg-emerald-500', 'bg-sky-500', 'bg-violet-500', 'bg-rose-500',
  'bg-amber-500', 'bg-teal-500', 'bg-indigo-500', 'bg-pink-500',
];

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

  // Sync selectedDate when currentDate changes month
  useEffect(() => {
    if (!isSameMonth(selectedDate, currentDate)) {
      setSelectedDate(startOfMonth(currentDate));
    }
  }, [currentDate]);

  /* ── Calendar grid days ── */
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = useMemo(() => {
    const result: Date[] = [];
    let d = calStart;
    while (d <= calEnd) {
      result.push(d);
      d = addDays(d, 1);
    }
    return result;
  }, [calStart.getTime(), calEnd.getTime()]);

  /* ── Color map for client names (consistent colors) ── */
  const clientColorMap = useMemo(() => {
    const map = new Map<string, string>();
    let idx = 0;
    appointments.forEach(apt => {
      if (!map.has(apt.client_name)) {
        map.set(apt.client_name, EVENT_COLORS[idx % EVENT_COLORS.length]);
        idx++;
      }
    });
    return map;
  }, [appointments]);

  /* ── Appointments grouped by date ── */
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

  /* ── Selected day appointments ── */
  const selectedDayApts = useMemo(() => {
    return getAptsForDay(selectedDate).sort((a, b) =>
      a.appointment_time.localeCompare(b.appointment_time)
    );
  }, [selectedDate, aptsByDate]);

  /* ── Navigation ── */
  const prev = () => onDateChange(subMonths(currentDate, 1));
  const next = () => onDateChange(addMonths(currentDate, 1));

  const weekDayLabels = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) =>
      format(addDays(start, i), 'EEEEE', { locale: dateLocale }).toUpperCase()
    );
  }, [dateLocale]);

  return (
    <div className="flex flex-col h-full">
      {/* ── Month header ── */}
      <div className="flex items-center justify-between px-1 mb-3">
        <button onClick={prev} className="p-2 -ml-2 rounded-full active:bg-muted transition-colors">
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <h2 className="text-lg font-bold text-foreground capitalize">
          {format(currentDate, 'MMMM yyyy', { locale: dateLocale })}
        </h2>
        <button onClick={next} className="p-2 -mr-2 rounded-full active:bg-muted transition-colors">
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* ── Week day labels ── */}
      <div className="grid grid-cols-7 mb-1">
        {weekDayLabels.map((label, i) => (
          <div key={i} className="text-center text-[11px] font-semibold text-muted-foreground/70 py-1">
            {label}
          </div>
        ))}
      </div>

      {/* ── Calendar grid ── */}
      <div className="grid grid-cols-7 gap-px bg-border/30 rounded-xl overflow-hidden">
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
                "flex flex-col items-center py-1.5 min-h-[56px] bg-card transition-colors relative",
                !inMonth && "opacity-30",
                selected && "bg-primary/5",
              )}
            >
              {/* Day number */}
              <span className={cn(
                "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full transition-all",
                today && !selected && "bg-red-500 text-white font-bold",
                selected && !today && "bg-primary text-primary-foreground font-bold",
                selected && today && "bg-red-500 text-white font-bold ring-2 ring-primary/50",
                !today && !selected && "text-foreground",
              )}>
                {format(day, 'd')}
              </span>

              {/* Event labels (Apple style - colored pills with truncated names) */}
              <div className="w-full px-0.5 mt-0.5 space-y-px overflow-hidden flex-1">
                {dayApts.slice(0, 2).map((apt, i) => {
                  const color = clientColorMap.get(apt.client_name) || 'bg-primary';
                  return (
                    <div
                      key={i}
                      className={cn(
                        "text-[8px] leading-[14px] font-semibold text-white rounded-[3px] px-1 truncate",
                        color
                      )}
                    >
                      {apt.client_name.split(' ')[0].toLowerCase()}
                    </div>
                  );
                })}
                {dayApts.length > 2 && (
                  <div className="text-[8px] text-muted-foreground font-medium text-center">
                    +{dayApts.length - 2}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Selected day detail ── */}
      <div className="mt-4 flex-1 overflow-y-auto">
        {/* Day title */}
        <div className="flex items-baseline justify-between mb-3 px-1">
          <h3 className="text-xl font-bold text-foreground capitalize">
            {format(selectedDate, 'EEEE d MMMM', { locale: dateLocale })}
          </h3>
          {selectedDayApts.length > 0 && (
            <span className="text-sm font-semibold text-muted-foreground">
              {selectedDayApts.length} RDV
            </span>
          )}
        </div>

        {/* Appointment cards */}
        {selectedDayApts.length > 0 ? (
          <div className="space-y-2.5">
            {selectedDayApts.map(apt => {
              const status = STATUS_STYLE[apt.status] || STATUS_STYLE.confirmed;
              const serviceName = apt.custom_service?.name || apt.pack?.name;

              return (
                <button
                  key={apt.id}
                  onClick={() => onAppointmentClick(apt)}
                  className="w-full text-left bg-card rounded-2xl p-3.5 active:scale-[0.98] transition-all shadow-sm border border-border/50"
                >
                  <div className="flex items-start gap-3">
                    {/* Color bar */}
                    <div className={cn("w-1 self-stretch rounded-full shrink-0 mt-0.5", status.dot)} />

                    {/* Time */}
                    <div className="shrink-0 pt-0.5">
                      <span className="text-base font-bold tabular-nums text-foreground">
                        {apt.appointment_time.slice(0, 5)}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[15px] text-foreground truncate">
                        {apt.client_name}
                      </p>
                      {serviceName && (
                        <p className="text-[13px] text-muted-foreground truncate mt-0.5">
                          {serviceName}
                        </p>
                      )}
                    </div>

                    {/* Status badge */}
                    <span className={cn(
                      "text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 whitespace-nowrap",
                      status.badgeBg, status.badge
                    )}>
                      {status.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-muted-foreground text-sm">Aucun rendez-vous</p>
          </div>
        )}
      </div>
    </div>
  );
}
