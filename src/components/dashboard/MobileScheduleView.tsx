import { useMemo, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  format, addDays, isSameDay, isToday, startOfDay,
} from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { Appointment } from '@/hooks/useAppointments';
import { Check } from 'lucide-react';

/* ── Apple-vivid colors ── */
const APPOINTMENT_COLOR = '#049be6';
const COMPLETED_COLOR = '#36c857';

const STATUS_BADGE: Record<string, { bg: string; label: string }> = {
  pending:            { bg: '#AF52DE', label: 'À valider' },
  pending_validation: { bg: '#FF9500', label: 'À valider' },
  confirmed:          { bg: APPOINTMENT_COLOR, label: 'Confirmé' },
  completed:          { bg: COMPLETED_COLOR, label: 'Terminé' },
  cancelled:          { bg: '#ff392b', label: 'Annulé' },
  refused:            { bg: '#ff392b', label: 'Refusé' },
};

interface MobileScheduleViewProps {
  currentDate: Date;
  appointments: Appointment[];
  onAppointmentClick: (apt: Appointment) => void;
  onQuickComplete?: (apt: Appointment) => void;
  blockedPeriods?: { start_date: string; end_date: string; reason: string | null }[];
}

export function MobileScheduleView({
  currentDate,
  appointments,
  onAppointmentClick,
  onQuickComplete,
  blockedPeriods = [],
}: MobileScheduleViewProps) {
  const { i18n } = useTranslation();
  const dateLocale = i18n.language === 'en' ? enUS : fr;
  const todayRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Generate 60 days from 14 days before currentDate
  const scheduleDays = useMemo(() => {
    const start = addDays(startOfDay(currentDate), -14);
    return Array.from({ length: 60 }, (_, i) => addDays(start, i));
  }, [currentDate]);

  // Group appointments by date
  const aptsByDate = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    appointments
      .filter(a => a.status !== 'cancelled' && a.status !== 'refused')
      .forEach(apt => {
        const key = apt.appointment_date;
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(apt);
      });
    map.forEach((apts) => apts.sort((a, b) => a.appointment_time.localeCompare(b.appointment_time)));
    return map;
  }, [appointments]);

  // Scroll to today on mount
  useEffect(() => {
    if (todayRef.current && scrollRef.current) {
      const containerTop = scrollRef.current.getBoundingClientRect().top;
      const elementTop = todayRef.current.getBoundingClientRect().top;
      scrollRef.current.scrollTop = elementTop - containerTop - 8;
    }
  }, []);

  // Days that have appointments or are today
  const daysWithContent = useMemo(() => {
    return scheduleDays.filter(day => {
      const key = format(day, 'yyyy-MM-dd');
      const apts = aptsByDate.get(key);
      return (apts && apts.length > 0) || isToday(day);
    });
  }, [scheduleDays, aptsByDate]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto h-full">
      {daysWithContent.map((day) => {
        const key = format(day, 'yyyy-MM-dd');
        const dayApts = aptsByDate.get(key) || [];
        const today = isToday(day);

        return (
          <div
            key={key}
            ref={today ? todayRef : undefined}
            className="border-b border-border/10 last:border-b-0"
          >
            {/* Day header — Google Calendar style */}
            <div className="flex items-start gap-3 px-1 pt-5 pb-2">
              {/* Left: day info */}
              <div className="w-14 shrink-0 text-center">
                <p className={cn(
                  "text-[11px] font-bold uppercase tracking-wider leading-none mb-1",
                  today ? "text-[#ff392b]" : "text-muted-foreground/60"
                )}>
                  {format(day, 'EEE', { locale: dateLocale }).replace('.', '')}
                </p>
                <span className={cn(
                  "inline-flex items-center justify-center w-10 h-10 rounded-full text-[22px] font-bold leading-none",
                  today ? "bg-[#ff392b] text-white" : "text-foreground"
                )}>
                  {format(day, 'd')}
                </span>
              </div>

              {/* Right: appointments */}
              <div className="flex-1 min-w-0 space-y-2 pt-0.5">
                {dayApts.length > 0 ? (
                  dayApts.map(apt => {
                    const badge = STATUS_BADGE[apt.status] || STATUS_BADGE.confirmed;
                    const serviceName = apt.custom_service?.name || apt.pack?.name;
                    const endTime = getEndTime(apt.appointment_time, apt.duration_minutes || 60);

                    return (
                      <div key={apt.id} className="flex items-stretch gap-2">
                        <button
                          onClick={() => onAppointmentClick(apt)}
                          className="flex-1 text-left rounded-xl p-3.5 active:scale-[0.98] transition-all"
                          style={{ backgroundColor: apt.status === 'completed' ? COMPLETED_COLOR : APPOINTMENT_COLOR }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-bold text-[15px] truncate leading-tight">
                                {apt.client_name}
                              </p>
                              <p className="text-white/80 text-[13px] mt-0.5 font-medium">
                                {apt.appointment_time.slice(0, 5)} – {endTime}
                                {apt.client_address ? ` à ${apt.client_address}` : ''}
                              </p>
                              {serviceName && (
                                <p className="text-white/60 text-[11px] mt-1 font-semibold uppercase tracking-wide truncate">
                                  {serviceName}
                                </p>
                              )}
                            </div>
                            {(apt.status === 'pending' || apt.status === 'pending_validation') && (
                              <span
                                className="text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 mt-0.5 text-white"
                                style={{ backgroundColor: badge.bg }}
                              >
                                {badge.label}
                              </span>
                            )}
                            {apt.status === 'completed' && (
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 mt-0.5 text-white bg-white/20">
                                ✓ Terminé
                              </span>
                            )}
                          </div>
                        </button>
                        {/* Quick complete button for confirmed appointments */}
                        {apt.status === 'confirmed' && onQuickComplete && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onQuickComplete(apt);
                            }}
                            className="w-14 rounded-xl flex items-center justify-center active:scale-95 transition-all"
                            style={{ backgroundColor: COMPLETED_COLOR }}
                          >
                            <Check className="w-6 h-6 text-white" strokeWidth={3} />
                          </button>
                        )}
                      </div>
                    );
                  })
                ) : today ? (
                  <p className="text-muted-foreground/40 text-[13px] font-medium pt-2">
                    Aucun rendez-vous aujourd'hui
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}

      {/* Bottom padding */}
      <div className="h-24" />
    </div>
  );
}

function getEndTime(startTime: string, durationMinutes: number): string {
  const [h, m] = startTime.split(':').map(Number);
  const totalMin = h * 60 + m + durationMinutes;
  const endH = Math.floor(totalMin / 60) % 24;
  const endM = totalMin % 60;
  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
}
