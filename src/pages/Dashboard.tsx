import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, Check, X, Clock, CalendarDays, CalendarClock, 
  Phone, Mail, MoreHorizontal, CalendarPlus, CalendarCheck,
  ArrowUpDown, ChevronDown
} from 'lucide-react';
import { useMyAppointments, Appointment } from '@/hooks/useAppointments';
import { useMyCenter } from '@/hooks/useCenter';
import { useMyClients } from '@/hooks/useClients';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import { format, parseISO, startOfDay, isBefore, addDays, isToday, isTomorrow, startOfWeek, endOfWeek } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { sendBookingEmail, getClientEmail, buildEmailPayload, EmailType } from '@/lib/emailService';
import { generateAppointmentCalendarUrl } from '@/lib/calendarUtils';
import { AppointmentDetailDialog } from '@/components/dashboard/AppointmentDetailDialog';
import { ConfirmationCalendarDialog } from '@/components/dashboard/ConfirmationCalendarDialog';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';

// ─── Status Colors ───
const statusColorMap: Record<string, string> = {
  pending_validation: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400',
  pending: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400',
  confirmed: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
  completed: 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400',
  cancelled: 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400',
  refused: 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400',
};

// ─── Compact Appointment Card ───
function InboxCard({ 
  appointment, centerAddress, isSynced,
  onConfirm, onRefuse, onCancel, onUpdateStatus, onSendEmail, onViewDetails, onAddToCalendar 
}: { 
  appointment: Appointment; centerAddress?: string; isSynced: boolean;
  onConfirm: (a: Appointment) => void;
  onRefuse: (a: Appointment) => void;
  onCancel: (a: Appointment) => void;
  onUpdateStatus: (id: string, status: Appointment['status']) => void;
  onSendEmail: (a: Appointment, kind: 'confirmation' | 'reminder') => void;
  onViewDetails: (a: Appointment) => void;
  onAddToCalendar: (a: Appointment) => void;
}) {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === 'en' ? enUS : fr;
  const statusColor = statusColorMap[appointment.status] || statusColorMap.pending;
  const date = parseISO(appointment.appointment_date);
  const isPending = appointment.status === 'pending_validation' || appointment.status === 'pending';
  
  let dateLabel = format(date, "EEE d MMM", { locale: dateLocale });
  if (isToday(date)) dateLabel = t('common.today');
  if (isTomorrow(date)) dateLabel = t('common.tomorrow');
  
  const serviceName = appointment.custom_service?.name || appointment.pack?.name || '';
  const price = appointment.custom_price ?? appointment.custom_service?.price ?? appointment.pack?.price;
  const canSendEmail = Boolean(appointment.client_email && appointment.client_email !== 'non-fourni@example.com');

  const initials = appointment.client_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  // Deterministic color from name
  const hue = appointment.client_name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;

  const handleAddToCalendar = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = generateAppointmentCalendarUrl({
      id: appointment.id,
      client_name: appointment.client_name,
      client_phone: appointment.client_phone,
      client_email: appointment.client_email,
      client_address: appointment.client_address,
      appointment_date: appointment.appointment_date,
      appointment_time: appointment.appointment_time,
      duration_minutes: appointment.duration_minutes,
      vehicle_type: appointment.vehicle_type,
      notes: appointment.notes,
      pack: appointment.pack ? { name: appointment.pack.name, price: appointment.pack.price } : null,
      custom_service: appointment.custom_service ? { name: appointment.custom_service.name, price: appointment.custom_service.price } : null,
      center_address: centerAddress,
    });
    window.open(url, '_blank');
    onAddToCalendar(appointment);
  };

  return (
    <div 
      className={cn(
        "group flex items-center gap-3 p-3.5 sm:p-4 bg-card border rounded-2xl transition-all duration-200 cursor-pointer",
        isPending 
          ? "border-amber-200/80 dark:border-amber-800/50 hover:border-amber-300 hover:shadow-md" 
          : "border-border/50 hover:border-border hover:shadow-md"
      )}
      onClick={() => onViewDetails(appointment)}
    >
      {/* Avatar */}
      <div 
        className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
        style={{ backgroundColor: `hsl(${hue}, 55%, 50%)` }}
      >
        {initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="font-semibold text-foreground truncate text-sm sm:text-base">{appointment.client_name}</p>
          <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0", statusColor)}>
            {t(`status.${appointment.status}`)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium">{dateLabel}</span>
          <span>•</span>
          <span>{appointment.appointment_time.slice(0, 5)}</span>
          {serviceName && (
            <>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline truncate">{serviceName}</span>
            </>
          )}
        </div>
      </div>

      {/* Price */}
      {price !== undefined && price !== null && (
        <span className="text-sm sm:text-base font-bold text-foreground flex-shrink-0">{price}€</span>
      )}

      {/* Quick Actions */}
      <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
        {isPending && (
          <>
            <Button 
              variant="ghost" size="icon" 
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
              onClick={() => onConfirm(appointment)}
            >
              <Check className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" size="icon" 
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
              onClick={() => onRefuse(appointment)}
            >
              <X className="w-4 h-4" />
            </Button>
          </>
        )}
        {appointment.status === 'confirmed' && (
          <>
            <Button 
              variant="ghost" size="icon" 
              className={cn("h-8 w-8 sm:h-9 sm:w-9 rounded-xl", isSynced ? "text-primary" : "text-muted-foreground hover:text-primary")}
              onClick={handleAddToCalendar}
            >
              {isSynced ? <CalendarCheck className="w-4 h-4" /> : <CalendarPlus className="w-4 h-4" />}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => onUpdateStatus(appointment.id, 'completed')}>
                  <Check className="w-4 h-4 mr-2" />{t('dashboard.finish')}
                </DropdownMenuItem>
                {canSendEmail && serviceName && price !== undefined && (
                  <DropdownMenuItem onClick={() => onSendEmail(appointment, 'reminder')}>
                    <Mail className="w-4 h-4 mr-2" />{t('dashboard.sendReminderEmail')}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem className="text-destructive" onClick={() => onCancel(appointment)}>
                  <X className="w-4 h-4 mr-2" />{t('common.cancel')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Filter Types ───
type StatusFilter = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled';
type QuickFilter = 'none' | 'pending' | 'today' | 'week';
type SortOrder = 'newest' | 'oldest';

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();
  const dateLocale = i18n.language === 'en' ? enUS : fr;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('none');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [justConfirmedAppointment, setJustConfirmedAppointment] = useState<Appointment | null>(null);
  
  const { appointments, loading, updateStatus } = useMyAppointments();
  const { center } = useMyCenter();
  const { clients } = useMyClients();
  const { markAsSynced, isSynced: checkIsSynced } = useCalendarSync();
  
  const today = startOfDay(new Date());
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

  // ─── Counters ───
  const pendingCount = useMemo(() => 
    appointments.filter(a => a.status === 'pending' || a.status === 'pending_validation').length
  , [appointments]);
  
  const todayCount = useMemo(() => 
    appointments.filter(a => isToday(parseISO(a.appointment_date)) && a.status !== 'cancelled' && a.status !== 'refused').length
  , [appointments]);
  
  const weekCount = useMemo(() => {
    return appointments.filter(a => {
      const d = parseISO(a.appointment_date);
      return d >= weekStart && d <= weekEnd && a.status !== 'cancelled' && a.status !== 'refused';
    }).length;
  }, [appointments, weekStart, weekEnd]);

  // ─── Filtering Pipeline ───
  const filteredAppointments = useMemo(() => {
    let result = [...appointments];

    // Quick filter
    if (quickFilter === 'pending') {
      result = result.filter(a => a.status === 'pending' || a.status === 'pending_validation');
    } else if (quickFilter === 'today') {
      result = result.filter(a => isToday(parseISO(a.appointment_date)) && a.status !== 'cancelled' && a.status !== 'refused');
    } else if (quickFilter === 'week') {
      result = result.filter(a => {
        const d = parseISO(a.appointment_date);
        return d >= weekStart && d <= weekEnd && a.status !== 'cancelled' && a.status !== 'refused';
      });
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'pending') {
        result = result.filter(a => a.status === 'pending' || a.status === 'pending_validation');
      } else if (statusFilter === 'cancelled') {
        result = result.filter(a => a.status === 'cancelled' || a.status === 'refused');
      } else {
        result = result.filter(a => a.status === statusFilter);
      }
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(a =>
        a.client_name.toLowerCase().includes(q) ||
        a.client_phone.includes(q) ||
        (a.client_email && a.client_email.toLowerCase().includes(q))
      );
    }

    // Sort
    result.sort((a, b) => {
      const cmp = a.appointment_date.localeCompare(b.appointment_date) || a.appointment_time.localeCompare(b.appointment_time);
      return sortOrder === 'newest' ? -cmp : cmp;
    });

    return result;
  }, [appointments, quickFilter, statusFilter, searchQuery, sortOrder, weekStart, weekEnd]);

  // ─── Group by date ───
  const groupedAppointments = useMemo(() => {
    const groups: Record<string, Appointment[]> = {};
    filteredAppointments.forEach(a => {
      if (!groups[a.appointment_date]) groups[a.appointment_date] = [];
      groups[a.appointment_date].push(a);
    });
    const dates = Object.keys(groups);
    dates.sort((a, b) => sortOrder === 'newest' ? b.localeCompare(a) : a.localeCompare(b));
    return { groups, dates };
  }, [filteredAppointments, sortOrder]);

  // ─── Handlers (kept from original) ───
  const handleUpdateStatus = async (id: string, status: Appointment['status']) => {
    const { error } = await updateStatus(id, status);
    if (error) toast.error(t('dashboard.statusUpdateError'));
    else toast.success(t('dashboard.statusUpdated'));
  };

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setDetailDialogOpen(true);
  };

  const selectedClient = selectedAppointment 
    ? clients.find(c => 
        c.id === selectedAppointment.client_id || 
        (c.phone && c.phone === selectedAppointment.client_phone) ||
        (c.email && c.email === selectedAppointment.client_email)
      ) || null
    : null;

  const handleSendEmail = async (appointment: Appointment, kind: 'confirmation' | 'reminder') => {
    if (!center) return;
    const serviceName = appointment.custom_service?.name || appointment.pack?.name;
    const price = appointment.custom_price ?? appointment.custom_service?.price ?? appointment.pack?.price;
    if (!serviceName || price === undefined) { toast.error(t('dashboard.missingServiceInfo')); return; }
    const clientEmail = await getClientEmail(appointment.client_email, appointment.client_id);
    if (!clientEmail) { toast.error(t('dashboard.noValidEmail')); return; }
    const toastId = toast.loading(kind === 'reminder' ? t('dashboard.sendingReminder') : t('dashboard.sendingConfirmation'));
    const payload = buildEmailPayload(center.id, appointment, clientEmail, serviceName, price, kind as EmailType);
    const result = await sendBookingEmail(payload);
    toast.dismiss(toastId);
    if (result.success) toast.success(kind === 'reminder' ? t('dashboard.reminderSent') : t('dashboard.confirmationSent'));
    else toast.error(t('dashboard.emailFailed'));
  };

  const sendStatusEmail = async (appointment: Appointment, emailType: EmailType) => {
    if (!center) return;
    const serviceName = appointment.custom_service?.name || appointment.pack?.name;
    const price = appointment.custom_price ?? appointment.custom_service?.price ?? appointment.pack?.price;
    if (!serviceName || price === undefined) return;
    const clientEmail = await getClientEmail(appointment.client_email, appointment.client_id);
    if (!clientEmail) return;
    const payload = buildEmailPayload(center.id, appointment, clientEmail, serviceName, price, emailType);
    sendBookingEmail(payload).catch(() => {});
  };

  const handleConfirm = async (appointment: Appointment) => {
    const { error } = await updateStatus(appointment.id, 'confirmed');
    if (error) { toast.error(t('dashboard.confirmError')); return; }
    setJustConfirmedAppointment(appointment);
    setConfirmDialogOpen(true);
    sendStatusEmail(appointment, 'confirmation');
  };

  const handleRefuse = async (appointment: Appointment) => {
    const { error } = await updateStatus(appointment.id, 'refused');
    if (error) { toast.error(t('dashboard.refuseError')); return; }
    toast.success(t('dashboard.refused'));
    sendStatusEmail(appointment, 'refused');
  };

  const handleCancel = async (appointment: Appointment) => {
    const { error } = await updateStatus(appointment.id, 'cancelled');
    if (error) { toast.error(t('dashboard.cancelError')); return; }
    toast.success(t('dashboard.cancelled'));
    sendStatusEmail(appointment, 'cancelled');
  };

  const handleQuickFilter = (f: QuickFilter) => {
    setQuickFilter(prev => prev === f ? 'none' : f);
    setStatusFilter('all');
  };

  // ─── Status chips ───
  const statusChips: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: t('dashboard.all', { defaultValue: 'Tous' }) },
    { key: 'pending', label: t('dashboard.pendingStat') },
    { key: 'confirmed', label: t('status.confirmed', { defaultValue: 'Confirmés' }) },
    { key: 'completed', label: t('status.completed', { defaultValue: 'Terminés' }) },
    { key: 'cancelled', label: t('status.cancelled', { defaultValue: 'Annulés' }) },
  ];

  return (
    <>
      <DashboardLayout title={t('nav.reservations')} subtitle={center?.name}>
        <div className="space-y-4 sm:space-y-5">
          {/* ─── Counter Cards ─── */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
            <button 
              onClick={() => handleQuickFilter('pending')}
              className={cn(
                "text-left p-3.5 sm:p-5 rounded-2xl border transition-all duration-200",
                quickFilter === 'pending' 
                  ? "border-amber-300 bg-amber-50/80 dark:bg-amber-950/30 dark:border-amber-700 shadow-sm" 
                  : "border-border/50 bg-card hover:border-border hover:shadow-sm"
              )}
            >
              <div className="flex items-center justify-between mb-1.5">
                <Clock className="w-4 h-4 text-amber-500" />
                {pendingCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                )}
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">{pendingCount}</p>
              <p className="text-[11px] sm:text-xs text-muted-foreground font-medium mt-0.5">{t('dashboard.pendingStat')}</p>
            </button>

            <button 
              onClick={() => handleQuickFilter('today')}
              className={cn(
                "text-left p-3.5 sm:p-5 rounded-2xl border transition-all duration-200",
                quickFilter === 'today' 
                  ? "border-primary/50 bg-primary/5 shadow-sm" 
                  : "border-border/50 bg-card hover:border-border hover:shadow-sm"
              )}
            >
              <div className="flex items-center justify-between mb-1.5">
                <CalendarDays className="w-4 h-4 text-primary" />
                {todayCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">{todayCount}</p>
              <p className="text-[11px] sm:text-xs text-muted-foreground font-medium mt-0.5">{t('dashboard.todayStat')}</p>
            </button>

            <button 
              onClick={() => handleQuickFilter('week')}
              className={cn(
                "text-left p-3.5 sm:p-5 rounded-2xl border transition-all duration-200",
                quickFilter === 'week' 
                  ? "border-primary/50 bg-primary/5 shadow-sm" 
                  : "border-border/50 bg-card hover:border-border hover:shadow-sm"
              )}
            >
              <div className="flex items-center mb-1.5">
                <CalendarClock className="w-4 h-4 text-primary" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">{weekCount}</p>
              <p className="text-[11px] sm:text-xs text-muted-foreground font-medium mt-0.5">{t('dashboard.weekStat')}</p>
            </button>
          </div>

          {/* ─── Search + Sort ─── */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('dashboard.searchPlaceholder', { defaultValue: 'Rechercher par nom ou téléphone...' })}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 h-10 rounded-xl bg-muted/40 border-0 focus-visible:ring-1"
              />
            </div>
            <Button 
              variant="ghost" size="icon" 
              className="h-10 w-10 rounded-xl flex-shrink-0"
              onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
              title={sortOrder === 'newest' ? 'Plus récent d\'abord' : 'Plus ancien d\'abord'}
            >
              <ArrowUpDown className="w-4 h-4" />
            </Button>
          </div>

          {/* ─── Status Chips ─── */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 -mx-1 px-1 scrollbar-none">
            {statusChips.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => { setStatusFilter(key); setQuickFilter('none'); }}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 whitespace-nowrap flex-shrink-0",
                  statusFilter === key && quickFilter === 'none'
                    ? "bg-foreground text-background shadow-sm" 
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {label}
                {key === 'pending' && pendingCount > 0 && (
                  <span className="ml-1.5 bg-amber-400/20 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ─── Results count ─── */}
          <p className="text-xs text-muted-foreground">
            {filteredAppointments.length} {filteredAppointments.length === 1 ? 'réservation' : 'réservations'}
            {searchQuery && ` pour "${searchQuery}"`}
          </p>

          {/* ─── Appointment List ─── */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-[72px] rounded-2xl" />)}
            </div>
          ) : filteredAppointments.length === 0 ? (
            <Card variant="elevated" className="p-8 sm:p-12 text-center rounded-2xl">
              <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="w-7 h-7 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {searchQuery ? t('dashboard.noResults', { defaultValue: 'Aucun résultat' }) : t('dashboard.noAppointments')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery 
                  ? t('dashboard.tryDifferentSearch', { defaultValue: 'Essayez une autre recherche' })
                  : t('dashboard.appointmentsWillAppear')
                }
              </p>
            </Card>
          ) : (
            <div className="space-y-5">
              {groupedAppointments.dates.map(dateStr => {
                const dateAppts = groupedAppointments.groups[dateStr];
                const date = parseISO(dateStr);
                let sectionTitle = format(date, "EEEE d MMMM", { locale: dateLocale });
                if (isToday(date)) sectionTitle = t('common.today');
                if (isTomorrow(date)) sectionTitle = t('common.tomorrow');
                
                return (
                  <div key={dateStr}>
                    <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">{sectionTitle}</h3>
                    <div className="space-y-2">
                      {dateAppts.map(apt => (
                        <InboxCard
                          key={apt.id}
                          appointment={apt}
                          centerAddress={center?.address || undefined}
                          isSynced={checkIsSynced(apt.id)}
                          onConfirm={handleConfirm}
                          onRefuse={handleRefuse}
                          onCancel={handleCancel}
                          onUpdateStatus={handleUpdateStatus}
                          onSendEmail={handleSendEmail}
                          onViewDetails={handleViewDetails}
                          onAddToCalendar={() => markAsSynced(apt.id)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DashboardLayout>
      
      {selectedAppointment && (
        <AppointmentDetailDialog
          appointment={selectedAppointment}
          client={selectedClient}
          centerAddress={center?.address || undefined}
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
        />
      )}
      
      {justConfirmedAppointment && (
        <ConfirmationCalendarDialog
          appointment={justConfirmedAppointment}
          centerAddress={center?.address || undefined}
          open={confirmDialogOpen}
          onOpenChange={setConfirmDialogOpen}
          onAddToCalendar={() => markAsSynced(justConfirmedAppointment.id)}
        />
      )}
    </>
  );
}
