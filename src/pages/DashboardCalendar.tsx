import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, X, Clock, User, Ban, Loader2, Trash2, ArrowRight, LayoutGrid, CalendarDays, CalendarPlus, CalendarCheck, List, MoreHorizontal, Mail, Check
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMyAppointments, Appointment } from '@/hooks/useAppointments';
import { useMyCenter, useMyPacks } from '@/hooks/useCenter';
import { useMyClients } from '@/hooks/useClients';
import { useBlockedPeriods } from '@/hooks/useAvailability';
import { useMyCustomServices } from '@/hooks/useCustomServices';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import { sendBookingEmail, getClientEmail, buildEmailPayload, EmailType } from '@/lib/emailService';
import { generateAppointmentCalendarUrl } from '@/lib/calendarUtils';
import { format, addMonths, subMonths, addWeeks, subWeeks, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday, isTomorrow, parseISO, isBefore, startOfDay } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { WeeklyCalendarView } from '@/components/dashboard/WeeklyCalendarView';
import { ConfirmationCalendarDialog } from '@/components/dashboard/ConfirmationCalendarDialog';
import { AppointmentDetailDialog } from '@/components/dashboard/AppointmentDetailDialog';

interface BlockedPeriod {
  id: string;
  center_id: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-400',
  pending_validation: 'bg-amber-400',
  confirmed: 'bg-emerald-500',
  completed: 'bg-blue-400',
  cancelled: 'bg-red-400',
  refused: 'bg-red-400',
};

const statusColorMap: Record<string, string> = {
  pending_validation: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400',
  pending: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400',
  confirmed: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
  completed: 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400',
  cancelled: 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400',
  refused: 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400',
};

type FilterType = 'all' | 'today' | 'week' | 'month' | 'pending';

// ─── List View Row (migrated from Dashboard.tsx) ─────────────────────────────

function AppointmentListRow({ appointment, centerAddress, isSynced, t, dateLocale, onUpdateStatus, onConfirmAppointment, onRefuseAppointment, onCancelAppointment, onSendEmail, onViewDetails, onAddToCalendar }: { 
  appointment: Appointment;
  centerAddress?: string;
  isSynced: boolean;
  t: (key: string, opts?: any) => string;
  dateLocale: any;
  onUpdateStatus: (id: string, status: Appointment['status']) => void;
  onConfirmAppointment: (appointment: Appointment) => void;
  onRefuseAppointment: (appointment: Appointment) => void;
  onCancelAppointment: (appointment: Appointment) => void;
  onSendEmail: (appointment: Appointment, kind: 'confirmation' | 'reminder') => void;
  onViewDetails: (appointment: Appointment) => void;
  onAddToCalendar: (appointment: Appointment) => void;
}) {
  const statusColor = statusColorMap[appointment.status] || statusColorMap.pending_validation;
  const statusLabel = t(`status.${appointment.status}`);
  const date = parseISO(appointment.appointment_date);
  
  let dateLabel = format(date, "EEE d MMM", { locale: dateLocale });
  if (isToday(date)) dateLabel = t('common.today');
  if (isTomorrow(date)) dateLabel = t('common.tomorrow');
  
  const canSendEmail = Boolean(appointment.client_email && appointment.client_email !== 'non-fourni@example.com');
  const serviceName = appointment.custom_service?.name || appointment.pack?.name;
  const price = appointment.custom_price ?? appointment.custom_service?.price ?? appointment.pack?.price;

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
      className="group flex flex-col sm:flex-row sm:items-center gap-4 p-5 bg-card border border-border/50 rounded-2xl hover:border-border hover:shadow-md transition-all duration-200 cursor-pointer"
      onClick={() => onViewDetails(appointment)}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 shadow-sm">
          <span className="text-base font-bold text-primary">
            {appointment.client_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-foreground truncate text-base">{appointment.client_name}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            {(appointment.pack || appointment.custom_service) && (
              <span className="font-medium text-foreground/80">{serviceName}</span>
            )}
            <span className="hidden sm:inline">•</span>
            <span className="capitalize">{t(`vehicles.${appointment.vehicle_type}`) || appointment.vehicle_type}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3 sm:gap-5 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-xl">
          <CalendarIcon className="w-4 h-4 text-muted-foreground" />
          <div className="text-sm">
            <span className="font-medium text-foreground">{dateLabel}</span>
            <span className="text-muted-foreground ml-2">{appointment.appointment_time.slice(0, 5)}</span>
          </div>
        </div>
        
        {(price !== undefined && price !== null) && (
          <div className="hidden sm:block text-right min-w-[60px]">
            <p className="text-lg font-bold text-foreground">{price}€</p>
          </div>
        )}
        
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor}`}>
          {statusLabel}
        </span>
        
        <div className="flex gap-1 opacity-60 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
          {appointment.status === 'confirmed' && canSendEmail && serviceName && price !== undefined && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl" title="Actions">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuItem onClick={() => onSendEmail(appointment, 'reminder')}>
                  <Mail className="w-4 h-4 mr-2" />
                  {t('dashboard.sendReminderEmail')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {(appointment.status === 'pending_validation' || appointment.status === 'pending') && (
            <>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-primary hover:text-primary hover:bg-primary/10" onClick={(e) => { e.stopPropagation(); onConfirmAppointment(appointment); }}>
                <Check className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10" onClick={(e) => { e.stopPropagation(); onRefuseAppointment(appointment); }}>
                <X className="w-4 h-4" />
              </Button>
            </>
          )}
          {appointment.status === 'confirmed' && (
            <>
              {isSynced ? (
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-primary hover:text-primary hover:bg-primary/10" onClick={handleAddToCalendar}>
                  <CalendarCheck className="w-4 h-4" />
                </Button>
              ) : (
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10" onClick={handleAddToCalendar}>
                  <CalendarPlus className="w-4 h-4" />
                </Button>
              )}
              <Button variant="outline" size="sm" className="h-9 rounded-xl text-xs font-medium" onClick={(e) => { e.stopPropagation(); onUpdateStatus(appointment.id, 'completed'); }}>
                {t('dashboard.finish')}
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10" onClick={(e) => { e.stopPropagation(); onCancelAppointment(appointment); }}>
                <X className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function DashboardCalendar() {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === 'en' ? enUS : fr;
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'list'>('month');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentWeekDate, setCurrentWeekDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [appointmentToReschedule, setAppointmentToReschedule] = useState<Appointment | null>(null);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [blockForm, setBlockForm] = useState({ start_date: '', end_date: '', reason: '' });
  const [loadingBlock, setLoadingBlock] = useState(false);
  const [rescheduleForm, setRescheduleForm] = useState({ date: '', time: '' });
  const [loadingReschedule, setLoadingReschedule] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [listFilter, setListFilter] = useState<FilterType>('all');
  
  // Detail dialog (AppointmentDetailDialog with client info)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [detailAppointment, setDetailAppointment] = useState<Appointment | null>(null);
  
  // Confirmation calendar dialog
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [justConfirmedAppointment, setJustConfirmedAppointment] = useState<Appointment | null>(null);
  
  const { appointments, loading, updateStatus, createAppointment, deleteAppointment, refetch } = useMyAppointments();
  const { center } = useMyCenter();
  const { packs } = useMyPacks();
  const { clients } = useMyClients();
  const { blockedPeriods, addBlockedPeriod, removeBlockedPeriod: deleteBlockedPeriod } = useBlockedPeriods(center?.id);
  const { services: customServices } = useMyCustomServices();
  const { markAsSynced, isSynced } = useCalendarSync();
  
  // Create appointment state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showCalendarSyncDialog, setShowCalendarSyncDialog] = useState(false);
  const [lastCreatedAppointment, setLastCreatedAppointment] = useState<Appointment | null>(null);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    client_address: '',
    vehicle_type: 'berline',
    appointment_date: '',
    appointment_time: '',
    custom_service_id: '',
    notes: '',
  });

  // ─── KPI Stats ─────────────────────────────────────────────────────────────
  const today = startOfDay(new Date());
  const weekEnd = addDays(today, 7);

  const todayAppointments = appointments.filter(a => {
    const date = parseISO(a.appointment_date);
    return isToday(date) && a.status !== 'cancelled' && a.status !== 'refused';
  });
  
  const pendingAppointments = appointments.filter(a => 
    a.status === 'pending' || a.status === 'pending_validation'
  );
  
  const upcomingAppointments = appointments.filter(a => {
    const date = parseISO(a.appointment_date);
    return !isBefore(date, today) && a.status !== 'cancelled' && a.status !== 'refused';
  });
  
  const weekAppointments = upcomingAppointments.filter(a => {
    const date = parseISO(a.appointment_date);
    return isBefore(date, weekEnd);
  });

  const stats = [
    { name: t('dashboard.todayStat'), value: todayAppointments.length, highlight: todayAppointments.length > 0 },
    { name: t('dashboard.pendingStat'), value: pendingAppointments.length, highlight: pendingAppointments.length > 0, isWarning: true },
    { name: t('dashboard.weekStat'), value: weekAppointments.length, highlight: false },
    { name: t('dashboard.upcomingStat'), value: upcomingAppointments.length, highlight: false },
  ];

  // ─── List View Filters ─────────────────────────────────────────────────────
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const monthAppointments = appointments.filter(a => {
    const date = parseISO(a.appointment_date);
    return isSameMonth(date, currentMonth) && a.status !== 'cancelled' && a.status !== 'refused';
  });

  const listFilteredAppointments = (() => {
    switch (listFilter) {
      case 'today': return todayAppointments;
      case 'week': return weekAppointments;
      case 'month': return monthAppointments;
      case 'pending': return pendingAppointments;
      default: return upcomingAppointments;
    }
  })();

  const groupedAppointments = listFilteredAppointments.reduce((groups, appointment) => {
    const date = appointment.appointment_date;
    if (!groups[date]) groups[date] = [];
    groups[date].push(appointment);
    return groups;
  }, {} as Record<string, Appointment[]>);

  const sortedDates = Object.keys(groupedAppointments).sort();

  const listFilters: { key: FilterType; label: string }[] = [
    { key: 'all', label: t('dashboard.upcoming') },
    { key: 'today', label: t('dashboard.todayStat') },
    { key: 'week', label: t('dashboard.thisWeek') },
    { key: 'month', label: t('dashboard.thisMonth') },
    { key: 'pending', label: t('dashboard.pendingStat') },
  ];

  // ─── Calendar navigation ──────────────────────────────────────────────────
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevWeek = () => setCurrentWeekDate(subWeeks(currentWeekDate, 1));
  const nextWeek = () => setCurrentWeekDate(addWeeks(currentWeekDate, 1));
  
  const handlePrev = () => viewMode === 'month' ? prevMonth() : prevWeek();
  const handleNext = () => viewMode === 'month' ? nextMonth() : nextWeek();
  
  const goToToday = () => {
    setCurrentMonth(new Date());
    setCurrentWeekDate(new Date());
    setSelectedDate(new Date());
  };
  
  const headerLabel = viewMode === 'month'
    ? format(currentMonth, 'MMMM yyyy', { locale: dateLocale })
    : viewMode === 'week'
    ? (() => {
        const ws = startOfWeek(currentWeekDate, { weekStartsOn: 1 });
        const we = addDays(ws, 6);
        return `${format(ws, 'd MMM', { locale: dateLocale })} – ${format(we, 'd MMM yyyy', { locale: dateLocale })}`;
      })()
    : ''; // list mode has its own header

  // Generate calendar days
  const calMonthStart = startOfMonth(currentMonth);
  const calMonthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(calMonthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(calMonthEnd, { weekStartsOn: 1 });

  const days: Date[] = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter(apt => 
      isSameDay(parseISO(apt.appointment_date), date) && apt.status !== 'cancelled' && apt.status !== 'refused'
    );
  };

  const isDateBlocked = (date: Date) => {
    return blockedPeriods.some(period => {
      const start = parseISO(period.start_date);
      const end = parseISO(period.end_date);
      return date >= start && date <= end;
    });
  };

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleReschedule = async () => {
    if (!appointmentToReschedule || !rescheduleForm.date || !rescheduleForm.time) return;
    
    setLoadingReschedule(true);
    const { error } = await supabase
      .from('appointments')
      .update({
        appointment_date: rescheduleForm.date,
        appointment_time: rescheduleForm.time
      })
      .eq('id', appointmentToReschedule.id);
    
    setLoadingReschedule(false);
    
    if (error) {
      toast.error(t('calendar.moveError'));
    } else {
      toast.success(t('calendar.moved'));
      setAppointmentToReschedule(null);
      setSelectedAppointment(null);
      await refetch();
    }
  };

  const handleBlockPeriod = async () => {
    if (!center || !blockForm.start_date || !blockForm.end_date) return;
    
    setLoadingBlock(true);
    const { error } = await addBlockedPeriod(blockForm.start_date, blockForm.end_date, blockForm.reason);
    setLoadingBlock(false);
    
    if (error) {
      toast.error(t('calendar.blockError'));
    } else {
      toast.success(t('calendar.blocked'));
      setShowBlockDialog(false);
      setBlockForm({ start_date: '', end_date: '', reason: '' });
    }
  };

  const removeBlockedPeriod = async (id: string) => {
    const { error } = await deleteBlockedPeriod(id);
    if (error) {
      toast.error(t('calendar.unblockError'));
    } else {
      toast.success(t('calendar.unblocked'));
    }
  };

  const selectedDayAppointments = selectedDate ? getAppointmentsForDay(selectedDate) : [];

  const handleUpdateStatus = async (id: string, status: Appointment['status']) => {
    const { error } = await updateStatus(id, status);
    if (error) {
      toast.error(t('calendar.statusUpdateError'));
    } else {
      toast.success(t('calendar.statusUpdated'));
    }
  };

  const weekDays = t('calendar.weekDays', { returnObjects: true }) as string[];

  const openCreateDialog = (date?: string, time?: string) => {
    setCreateForm({
      client_name: '',
      client_email: '',
      client_phone: '',
      client_address: '',
      vehicle_type: 'berline',
      appointment_date: date || format(new Date(), 'yyyy-MM-dd'),
      appointment_time: time || '09:00',
      custom_service_id: '',
      notes: '',
    });
    setShowCreateDialog(true);
  };

  const handleCreateAppointment = async () => {
    if (!createForm.client_name || !createForm.client_phone || !createForm.appointment_date || !createForm.appointment_time) {
      toast.error('Veuillez remplir les champs obligatoires');
      return;
    }
    setLoadingCreate(true);
    
    const selectedService = customServices.find(s => s.id === createForm.custom_service_id);
    
    const { error } = await createAppointment({
      client_name: createForm.client_name,
      client_email: createForm.client_email,
      client_phone: createForm.client_phone,
      client_address: createForm.client_address,
      vehicle_type: createForm.vehicle_type,
      appointment_date: createForm.appointment_date,
      appointment_time: createForm.appointment_time,
      custom_service_id: createForm.custom_service_id || null,
      custom_price: selectedService?.price || null,
      duration_minutes: selectedService?.duration_minutes || 60,
      notes: createForm.notes,
      service_name: selectedService?.name,
      send_email: !!createForm.client_email,
    });
    
    setLoadingCreate(false);
    
    if (error) {
      toast.error('Erreur lors de la création');
    } else {
      toast.success('Rendez-vous créé !');
      setShowCreateDialog(false);
      await refetch();
      
      setTimeout(() => {
        const newApt = appointments.find(a => 
          a.appointment_date === createForm.appointment_date && 
          a.appointment_time.startsWith(createForm.appointment_time) &&
          a.client_name === createForm.client_name
        );
        if (newApt) {
          setLastCreatedAppointment(newApt);
          setShowCalendarSyncDialog(true);
        }
      }, 500);
    }
  };

  const handleAddToGoogleCalendar = () => {
    if (!lastCreatedAppointment) return;
    const url = generateAppointmentCalendarUrl({
      id: lastCreatedAppointment.id,
      client_name: lastCreatedAppointment.client_name,
      client_phone: lastCreatedAppointment.client_phone,
      client_email: lastCreatedAppointment.client_email,
      client_address: lastCreatedAppointment.client_address,
      appointment_date: lastCreatedAppointment.appointment_date,
      appointment_time: lastCreatedAppointment.appointment_time,
      duration_minutes: lastCreatedAppointment.duration_minutes,
      vehicle_type: lastCreatedAppointment.vehicle_type,
      notes: lastCreatedAppointment.notes,
      pack: lastCreatedAppointment.pack ? { name: lastCreatedAppointment.pack.name, price: lastCreatedAppointment.pack.price } : null,
      custom_service: lastCreatedAppointment.custom_service ? { name: lastCreatedAppointment.custom_service.name, price: lastCreatedAppointment.custom_service.price } : null,
      center_address: center?.address || undefined,
    });
    window.open(url, '_blank');
    markAsSynced(lastCreatedAppointment.id);
    setShowCalendarSyncDialog(false);
  };

  // ─── Email logic (migrated from Dashboard.tsx) ─────────────────────────────

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

  const handleSendEmail = async (appointment: Appointment, kind: 'confirmation' | 'reminder') => {
    if (!center) return;
    const serviceName = appointment.custom_service?.name || appointment.pack?.name;
    const price = appointment.custom_price ?? appointment.custom_service?.price ?? appointment.pack?.price;
    if (!serviceName || price === undefined) {
      toast.error(t('dashboard.missingServiceInfo'));
      return;
    }
    const clientEmail = await getClientEmail(appointment.client_email, appointment.client_id);
    if (!clientEmail) {
      toast.error(t('dashboard.noValidEmail'));
      return;
    }
    const toastId = toast.loading(kind === 'reminder' ? t('dashboard.sendingReminder') : t('dashboard.sendingConfirmation'));
    const payload = buildEmailPayload(center.id, appointment, clientEmail, serviceName, price, kind as EmailType);
    const result = await sendBookingEmail(payload);
    toast.dismiss(toastId);
    if (result.success) {
      toast.success(kind === 'reminder' ? t('dashboard.reminderSent') : t('dashboard.confirmationSent'));
    } else {
      toast.error(t('dashboard.emailFailed'));
    }
  };

  const handleConfirmAppointment = async (appointment: Appointment) => {
    const { error } = await updateStatus(appointment.id, 'confirmed');
    if (error) {
      toast.error(t('dashboard.confirmError'));
      return;
    }
    setJustConfirmedAppointment(appointment);
    setConfirmDialogOpen(true);
    sendStatusEmail(appointment, 'confirmation');
  };

  const handleRefuseAppointment = async (appointment: Appointment) => {
    const { error } = await updateStatus(appointment.id, 'refused');
    if (error) {
      toast.error(t('dashboard.refuseError'));
      return;
    }
    toast.success(t('dashboard.refused'));
    sendStatusEmail(appointment, 'refused');
  };

  const handleCancelAppointment = async (appointment: Appointment) => {
    const { error } = await updateStatus(appointment.id, 'cancelled');
    if (error) {
      toast.error(t('dashboard.cancelError'));
      return;
    }
    toast.success(t('dashboard.cancelled'));
    sendStatusEmail(appointment, 'cancelled');
  };

  const handleViewDetails = (appointment: Appointment) => {
    setDetailAppointment(appointment);
    setDetailDialogOpen(true);
  };

  const selectedClient = detailAppointment 
    ? clients.find(c => 
        c.id === detailAppointment.client_id || 
        (c.phone && c.phone === detailAppointment.client_phone) ||
        (c.email && c.email === detailAppointment.client_email)
      ) || null
    : null;

  return (
    <>
    <DashboardLayout title={t('calendar.title')} subtitle={center?.name}>
      <div className="max-w-7xl">

          {/* ─── KPI Stats ─── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
            {stats.map((stat) => (
              <Card key={stat.name} variant="elevated" className="p-4 sm:p-5 rounded-2xl hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between mb-1 sm:mb-2">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">{stat.name}</p>
                  {stat.highlight && (
                    <span className={`w-2 h-2 rounded-full ${stat.isWarning ? 'bg-amber-400' : 'bg-emerald-400'} animate-pulse`} />
                  )}
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">{stat.value}</p>
              </Card>
            ))}
          </div>

          {/* Header with navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            {viewMode !== 'list' && (
              <div className="flex items-center gap-2 sm:gap-3">
                <Button variant="outline" size="icon" onClick={handlePrev} className="h-9 w-9 rounded-xl">
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
                <h2 className="text-lg sm:text-xl font-bold text-foreground min-w-[140px] sm:min-w-[220px] text-center capitalize">
                  {headerLabel}
                </h2>
                <Button variant="outline" size="icon" onClick={handleNext} className="h-9 w-9 rounded-xl">
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </div>
            )}
            {viewMode === 'list' && (
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-foreground">{t('dashboard.planning')}</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {t('dashboard.reservationCount', { count: listFilteredAppointments.length })}
                </p>
              </div>
            )}
            
            <div className="flex gap-2 flex-wrap">
              <Button onClick={() => openCreateDialog()} className="rounded-xl h-9 text-sm">
                <Plus className="w-4 h-4 mr-1.5" />
                <span className="hidden sm:inline">Ajouter un RDV</span>
                <span className="sm:hidden">RDV</span>
              </Button>

              {/* View toggle - 3 modes */}
              <div className="flex rounded-xl border border-border overflow-hidden">
                <button
                  onClick={() => setViewMode('month')}
                  className={cn(
                    "flex items-center gap-1.5 px-3 h-9 text-sm font-medium transition-colors",
                    viewMode === 'month' ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"
                  )}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mois</span>
                </button>
                <button
                  onClick={() => setViewMode('week')}
                  className={cn(
                    "flex items-center gap-1.5 px-3 h-9 text-sm font-medium transition-colors border-l border-border",
                    viewMode === 'week' ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"
                  )}
                >
                  <CalendarDays className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Semaine</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "flex items-center gap-1.5 px-3 h-9 text-sm font-medium transition-colors border-l border-border",
                    viewMode === 'list' ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"
                  )}
                >
                  <List className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Liste</span>
                </button>
              </div>
              
              {viewMode !== 'list' && (
                <Button variant="outline" onClick={goToToday} className="rounded-xl h-9 text-sm">
                  <CalendarIcon className="w-4 h-4 mr-1.5" />
                  {t('calendar.today')}
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={() => {
                  setBlockForm({ 
                    start_date: format(new Date(), 'yyyy-MM-dd'), 
                    end_date: format(addDays(new Date(), 1), 'yyyy-MM-dd'), 
                    reason: '' 
                  });
                  setShowBlockDialog(true);
                }}
                className="rounded-xl h-9 text-sm"
              >
                <Ban className="w-4 h-4 mr-1.5" />
                <span className="hidden sm:inline">{t('calendar.block')}</span>
              </Button>
            </div>
          </div>

          {/* ─── LIST VIEW ─── */}
          {viewMode === 'list' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
                <div className="flex bg-muted/60 rounded-xl p-1 shrink-0">
                  {listFilters.map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setListFilter(key)}
                      className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
                        listFilter === key 
                          ? 'bg-background text-foreground shadow-sm' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-24 rounded-2xl" />
                  ))}
                </div>
              ) : listFilteredAppointments.length === 0 ? (
                <Card variant="elevated" className="p-8 sm:p-12 text-center rounded-2xl">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CalendarIcon className="w-7 h-7 sm:w-8 sm:h-8 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{t('dashboard.noAppointments')}</h3>
                  <p className="text-sm text-muted-foreground">{t('dashboard.appointmentsWillAppear')}</p>
                </Card>
              ) : (
                <div className="space-y-6">
                  {sortedDates.map(dateStr => {
                    const dateAppts = groupedAppointments[dateStr].sort(
                      (a, b) => a.appointment_time.localeCompare(b.appointment_time)
                    );
                    const date = parseISO(dateStr);
                    let sectionTitle = format(date, "EEEE d MMMM", { locale: dateLocale });
                    if (isToday(date)) sectionTitle = t('common.today');
                    if (isTomorrow(date)) sectionTitle = t('common.tomorrow');
                    
                    return (
                      <div key={dateStr}>
                        <h3 className="text-sm font-semibold text-muted-foreground mb-3 capitalize">{sectionTitle}</h3>
                        <div className="space-y-3">
                          {dateAppts.map(apt => (
                            <AppointmentListRow
                              key={apt.id}
                              appointment={apt}
                              centerAddress={center?.address || undefined}
                              isSynced={isSynced(apt.id)}
                              t={t}
                              dateLocale={dateLocale}
                              onUpdateStatus={handleUpdateStatus}
                              onConfirmAppointment={handleConfirmAppointment}
                              onRefuseAppointment={handleRefuseAppointment}
                              onCancelAppointment={handleCancelAppointment}
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
          )}

          {/* ─── WEEK VIEW ─── */}
          {viewMode === 'week' && (
            <div className="h-[calc(100vh-320px)] min-h-[500px]">
              <WeeklyCalendarView
                currentDate={currentWeekDate}
                appointments={appointments}
                onAppointmentClick={(apt) => {
                  setSelectedAppointment(apt);
                  setRescheduleForm({ 
                    date: apt.appointment_date, 
                    time: apt.appointment_time.slice(0, 5) 
                  });
                }}
                onSlotClick={(date, time) => openCreateDialog(date, time)}
                blockedPeriods={blockedPeriods}
              />
            </div>
          )}

          {/* ─── MONTH VIEW ─── */}
          {viewMode === 'month' && (
          <div className="grid lg:grid-cols-[1fr_320px] gap-4 sm:gap-6">
            <Card className="p-3 sm:p-6 rounded-2xl">
              <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-2">
                {weekDays.map(d => (
                  <div key={d} className="text-center text-xs sm:text-sm font-medium text-muted-foreground py-1 sm:py-2">
                    {d}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
                {days.map((d, idx) => {
                  const dayAppointments = getAppointmentsForDay(d);
                  const isCurrentMonth = isSameMonth(d, currentMonth);
                  const isSelected = selectedDate && isSameDay(d, selectedDate);
                  const blocked = isDateBlocked(d);
                  const isPast = isBefore(d, new Date()) && !isToday(d);
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedDate(d)}
                      className={cn(
                        "relative aspect-square p-0.5 sm:p-2 rounded-lg sm:rounded-xl transition-all flex flex-col items-center justify-start pt-1 sm:pt-2",
                        !isCurrentMonth && "opacity-30",
                        isCurrentMonth && !isSelected && "hover:bg-secondary",
                        isSelected && "bg-primary text-primary-foreground",
                        isToday(d) && !isSelected && "ring-2 ring-primary/50",
                        blocked && "bg-red-50 dark:bg-red-950/30",
                        isPast && "opacity-60"
                      )}
                    >
                      <span className={cn(
                        "text-xs sm:text-sm font-medium",
                        isSelected ? "text-primary-foreground" : "text-foreground"
                      )}>
                        {format(d, 'd')}
                      </span>
                      
                      {dayAppointments.length > 0 && (
                        <div className="flex gap-0.5 mt-0.5 sm:mt-1 flex-wrap justify-center">
                          {dayAppointments.slice(0, 2).map((apt, i) => (
                            <div
                              key={i}
                              className={cn(
                                "w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full",
                                isSelected ? "bg-primary-foreground/80" : statusColors[apt.status] || 'bg-primary'
                              )}
                            />
                          ))}
                          {dayAppointments.length > 2 && (
                            <span className={cn(
                              "text-[8px] sm:text-[10px] font-medium",
                              isSelected ? "text-primary-foreground" : "text-muted-foreground"
                            )}>
                              +{dayAppointments.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                      
                      {blocked && (
                        <Ban className={cn(
                          "w-2.5 h-2.5 sm:w-3 sm:h-3 absolute bottom-0.5 right-0.5 sm:bottom-1 sm:right-1",
                          isSelected ? "text-primary-foreground/70" : "text-red-400"
                        )} />
                      )}
                    </button>
                  );
                })}
              </div>
              
              <div className="flex flex-wrap gap-3 sm:gap-5 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-border">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-[10px] sm:text-xs font-medium text-muted-foreground">{t('calendar.pending')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] sm:text-xs font-medium text-muted-foreground">{t('calendar.confirmed')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                  <span className="text-[10px] sm:text-xs font-medium text-muted-foreground">{t('calendar.completed')}</span>
                </div>
              </div>
            </Card>

            {/* Side panel */}
            <div className="space-y-3 sm:space-y-4">
              <Card className="p-4 sm:p-5 rounded-2xl">
                <h3 className="font-semibold text-base sm:text-lg text-foreground mb-3 sm:mb-4">
                  {selectedDate 
                    ? format(selectedDate, "EEE d MMM", { locale: dateLocale }) 
                    : t('calendar.selectDay')
                  }
                </h3>
                
                {selectedDate && (
                  <>
                    {loading ? (
                      <div className="flex items-center justify-center py-6 sm:py-8">
                        <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : selectedDayAppointments.length > 0 ? (
                      <div className="space-y-2 sm:space-y-3">
                        {selectedDayAppointments.sort((a, b) => 
                          a.appointment_time.localeCompare(b.appointment_time)
                        ).map(apt => (
                          <div 
                            key={apt.id}
                            className="group p-2.5 sm:p-3 bg-secondary/50 rounded-xl hover:bg-secondary transition-colors cursor-pointer"
                            onClick={() => {
                              setSelectedAppointment(apt);
                              setRescheduleForm({ 
                                date: apt.appointment_date, 
                                time: apt.appointment_time.slice(0, 5) 
                              });
                            }}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground shrink-0" />
                                  <span className="font-semibold text-foreground text-sm">
                                    {apt.appointment_time.slice(0, 5)}
                                  </span>
                                  <div className={cn(
                                    "w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0",
                                    statusColors[apt.status]
                                  )} />
                                </div>
                                <div className="flex items-center gap-2">
                                  <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground shrink-0" />
                                  <span className="text-sm text-foreground truncate">
                                    {apt.client_name}
                                  </span>
                                </div>
                                {(apt.pack || apt.custom_service) && (
                                  <p className="text-xs text-muted-foreground mt-0.5 ml-5 truncate">
                                    {apt.custom_service?.name || apt.pack?.name} • {apt.custom_price ?? apt.custom_service?.price ?? apt.pack?.price ?? 0}€
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 sm:py-8 text-muted-foreground">
                        <CalendarIcon className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 sm:mb-3 opacity-30" />
                        <p className="text-sm">{t('calendar.noAppointments')}</p>
                      </div>
                    )}
                  </>
                )}
              </Card>

              {blockedPeriods.length > 0 && (
                <Card className="p-5 rounded-2xl">
                  <h3 className="font-semibold text-foreground mb-3">{t('calendar.blockedPeriods')}</h3>
                  <div className="space-y-2">
                    {blockedPeriods.map(period => (
                      <div key={period.id} className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-950/30 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {format(parseISO(period.start_date), "d MMM", { locale: dateLocale })} → {format(parseISO(period.end_date), "d MMM", { locale: dateLocale })}
                          </p>
                          {period.reason && (
                            <p className="text-xs text-muted-foreground">{period.reason}</p>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-100"
                          onClick={() => removeBlockedPeriod(period.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </div>
          )}
        </div>
      </DashboardLayout>

      {/* Appointment Details Dialog (calendar month/week view) */}
      <Dialog open={!!selectedAppointment && !appointmentToReschedule} onOpenChange={(open) => {
        if (!open) setSelectedAppointment(null);
      }}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>{t('calendar.appointmentDetails')}</DialogTitle>
            <DialogDescription className="sr-only">{t('calendar.appointmentDetailsDesc')}</DialogDescription>
          </DialogHeader>
          
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="p-4 bg-secondary/50 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{selectedAppointment.client_name}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    {format(parseISO(selectedAppointment.appointment_date), "d MMM", { locale: dateLocale })} {t('common.to')} {selectedAppointment.appointment_time.slice(0, 5)}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground ml-6">{selectedAppointment.client_phone}</p>
                {selectedAppointment.pack && (
                  <p className="text-sm text-muted-foreground ml-6">
                    {selectedAppointment.pack.name} • {selectedAppointment.pack.price}€
                  </p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => {
                    setRescheduleForm({
                      date: selectedAppointment.appointment_date,
                      time: selectedAppointment.appointment_time.slice(0, 5)
                    });
                    setAppointmentToReschedule(selectedAppointment);
                  }}
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  {t('calendar.move')}
                </Button>
                
                {(selectedAppointment.status === 'pending' || selectedAppointment.status === 'pending_validation') && (
                  <Button
                    variant="outline"
                    className="rounded-xl text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                    onClick={() => {
                      handleConfirmAppointment(selectedAppointment);
                      setSelectedAppointment(null);
                    }}
                  >
                    {t('status.confirmed')}
                  </Button>
                )}
                
                {selectedAppointment.status === 'confirmed' && (
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => {
                      handleUpdateStatus(selectedAppointment.id, 'completed');
                      setSelectedAppointment(null);
                    }}
                  >
                    {t('dashboard.finish')}
                  </Button>
                )}
              </div>
              
              {(selectedAppointment.status === 'pending' || selectedAppointment.status === 'pending_validation') && (
                <Button
                  variant="outline"
                  className="w-full rounded-xl text-amber-600 border-amber-200 hover:bg-amber-50"
                  onClick={() => {
                    handleRefuseAppointment(selectedAppointment);
                    setSelectedAppointment(null);
                  }}
                >
                  {t('calendar.cancelAppointment')}
                </Button>
              )}
              
              <div className="pt-2 border-t border-border">
                <Button
                  variant="ghost"
                  className="w-full rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50"
                  disabled={loadingDelete}
                  onClick={async () => {
                    if (confirm(t('calendar.deleteConfirmPrompt'))) {
                      setLoadingDelete(true);
                      const { error } = await deleteAppointment(selectedAppointment.id);
                      setLoadingDelete(false);
                      if (error) {
                        toast.error(t('calendar.deleteError'));
                      } else {
                        toast.success(t('calendar.deleted'));
                        setSelectedAppointment(null);
                      }
                    }
                  }}
                >
                  {loadingDelete ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                  {t('common.delete')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={!!appointmentToReschedule} onOpenChange={(open) => {
        if (!open) setAppointmentToReschedule(null);
      }}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">{t('calendar.reschedule')}</DialogTitle>
            <DialogDescription>
              {appointmentToReschedule 
                ? t('calendar.rescheduleDesc', { name: appointmentToReschedule.client_name })
                : t('calendar.chooseNewDateTime')
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t('calendar.newDate')}</Label>
              <Input
                type="date"
                value={rescheduleForm.date}
                onChange={(e) => setRescheduleForm(prev => ({ ...prev, date: e.target.value }))}
                className="h-12 rounded-xl text-base"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t('calendar.newTime')}</Label>
              <Input
                type="time"
                value={rescheduleForm.time}
                onChange={(e) => setRescheduleForm(prev => ({ ...prev, time: e.target.value }))}
                className="h-12 rounded-xl text-base"
              />
            </div>
          </div>
          
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setAppointmentToReschedule(null)} className="rounded-xl flex-1 sm:flex-none">
              {t('common.cancel')}
            </Button>
            <Button 
              onClick={handleReschedule}
              disabled={loadingReschedule || !rescheduleForm.date || !rescheduleForm.time}
              className="rounded-xl flex-1 sm:flex-none min-w-[120px]"
            >
              {loadingReschedule ? <Loader2 className="w-4 h-4 animate-spin" /> : t('calendar.rescheduleAction')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Block Period Dialog */}
      <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>{t('calendar.blockPeriod')}</DialogTitle>
            <DialogDescription className="sr-only">{t('calendar.blockPeriodDesc')}</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('calendar.startDate')}</Label>
                <Input
                  type="date"
                  value={blockForm.start_date}
                  onChange={(e) => setBlockForm(prev => ({ ...prev, start_date: e.target.value }))}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('calendar.endDate')}</Label>
                <Input
                  type="date"
                  value={blockForm.end_date}
                  onChange={(e) => setBlockForm(prev => ({ ...prev, end_date: e.target.value }))}
                  className="h-11 rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('calendar.reason')}</Label>
              <Input
                value={blockForm.reason}
                onChange={(e) => setBlockForm(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Ex: Vacances, formation..."
                className="h-11 rounded-xl"
              />
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setShowBlockDialog(false)} className="rounded-xl">
              {t('common.cancel')}
            </Button>
            <Button 
              onClick={handleBlockPeriod}
              disabled={loadingBlock || !blockForm.start_date || !blockForm.end_date}
              className="rounded-xl"
            >
              {loadingBlock ? <Loader2 className="w-4 h-4 animate-spin" /> : t('calendar.block')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Appointment Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Nouveau rendez-vous
            </DialogTitle>
            <DialogDescription className="sr-only">Créer un nouveau rendez-vous</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm">Date *</Label>
                <Input type="date" value={createForm.appointment_date} onChange={(e) => setCreateForm(prev => ({ ...prev, appointment_date: e.target.value }))} className="h-10 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Heure *</Label>
                <Input type="time" value={createForm.appointment_time} onChange={(e) => setCreateForm(prev => ({ ...prev, appointment_time: e.target.value }))} className="h-10 rounded-xl" />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-sm">Nom du client *</Label>
              <Input value={createForm.client_name} onChange={(e) => setCreateForm(prev => ({ ...prev, client_name: e.target.value }))} placeholder="Jean Dupont" className="h-10 rounded-xl" />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm">Téléphone *</Label>
                <Input value={createForm.client_phone} onChange={(e) => setCreateForm(prev => ({ ...prev, client_phone: e.target.value }))} placeholder="06 12 34 56 78" className="h-10 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Email</Label>
                <Input type="email" value={createForm.client_email} onChange={(e) => setCreateForm(prev => ({ ...prev, client_email: e.target.value }))} placeholder="email@exemple.fr" className="h-10 rounded-xl" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Prestation</Label>
              <Select value={createForm.custom_service_id} onValueChange={(v) => setCreateForm(prev => ({ ...prev, custom_service_id: v }))}>
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue placeholder="Choisir une prestation" />
                </SelectTrigger>
                <SelectContent>
                  {customServices.filter(s => s.active).map(service => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} — {service.price}€ ({service.duration_minutes}min)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm">Type véhicule</Label>
                <Select value={createForm.vehicle_type} onValueChange={(v) => setCreateForm(prev => ({ ...prev, vehicle_type: v }))}>
                  <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="citadine">Citadine</SelectItem>
                    <SelectItem value="berline">Berline</SelectItem>
                    <SelectItem value="suv">SUV</SelectItem>
                    <SelectItem value="utilitaire">Utilitaire</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Adresse</Label>
                <Input value={createForm.client_address} onChange={(e) => setCreateForm(prev => ({ ...prev, client_address: e.target.value }))} placeholder="Adresse" className="h-10 rounded-xl" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Notes</Label>
              <Textarea value={createForm.notes} onChange={(e) => setCreateForm(prev => ({ ...prev, notes: e.target.value }))} placeholder="Notes internes..." className="rounded-xl resize-none" rows={2} />
            </div>
          </div>
          
          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="rounded-xl">Annuler</Button>
            <Button onClick={handleCreateAppointment} disabled={loadingCreate || !createForm.client_name || !createForm.client_phone} className="rounded-xl min-w-[140px]">
              {loadingCreate ? <Loader2 className="w-4 h-4 animate-spin" /> : (<><Plus className="w-4 h-4 mr-1.5" />Créer le RDV</>)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Calendar Sync Dialog after creation */}
      <ConfirmationCalendarDialog
        open={showCalendarSyncDialog}
        onOpenChange={setShowCalendarSyncDialog}
        appointment={lastCreatedAppointment}
        centerAddress={center?.address || undefined}
        isAlreadySynced={lastCreatedAppointment ? isSynced(lastCreatedAppointment.id) : false}
        onAddToCalendar={() => {
          if (lastCreatedAppointment) {
            markAsSynced(lastCreatedAppointment.id);
          }
          setShowCalendarSyncDialog(false);
        }}
      />

      {/* Appointment Detail Dialog (list view) */}
      {detailAppointment && (
        <AppointmentDetailDialog
          appointment={detailAppointment}
          client={selectedClient}
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
        />
      )}

      {/* Confirmation Calendar Dialog (after confirm action) */}
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
