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
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, X, Clock, User, Ban, Loader2, GripVertical, Trash2, ArrowRight, LayoutGrid, CalendarDays, CalendarPlus, Users
} from 'lucide-react';
import { useMyAppointments, Appointment } from '@/hooks/useAppointments';
import { useMyCenter, useMyPacks } from '@/hooks/useCenter';
import { useBlockedPeriods } from '@/hooks/useAvailability';
import { useMyCustomServices, formatDuration } from '@/hooks/useCustomServices';
import { useMyClients } from '@/hooks/useClients';
import { format, addMonths, subMonths, addWeeks, subWeeks, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday, parseISO, isBefore } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { WeeklyCalendarView } from '@/components/dashboard/WeeklyCalendarView';
import { ConfirmationCalendarDialog } from '@/components/dashboard/ConfirmationCalendarDialog';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import { generateAppointmentCalendarUrl } from '@/lib/calendarUtils';

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
  confirmed: 'bg-emerald-500',
  completed: 'bg-blue-400',
  cancelled: 'bg-red-400',
};

export default function DashboardCalendar() {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === 'en' ? enUS : fr;
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
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
  
  const { appointments, loading, updateStatus, createAppointment, deleteAppointment, refetch } = useMyAppointments();
  const { center } = useMyCenter();
  const { packs } = useMyPacks();
  const { blockedPeriods, addBlockedPeriod, removeBlockedPeriod: deleteBlockedPeriod } = useBlockedPeriods(center?.id);
  const { services: customServices } = useMyCustomServices();
  const { clients } = useMyClients();
  const { markAsSynced, isSynced } = useCalendarSync();
  
  // Create appointment state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showCalendarSyncDialog, setShowCalendarSyncDialog] = useState(false);
  const [lastCreatedAppointment, setLastCreatedAppointment] = useState<Appointment | null>(null);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [serviceType, setServiceType] = useState<'pack' | 'custom'>('pack');
  const [createForm, setCreateForm] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    client_address: '',
    vehicle_type: 'berline',
    appointment_date: '',
    appointment_time: '',
    pack_id: '',
    custom_service_id: '',
    custom_price: '',
    notes: '',
  });

  // Calendar navigation
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
    : (() => {
        const ws = startOfWeek(currentWeekDate, { weekStartsOn: 1 });
        const we = addDays(ws, 6);
        return `${format(ws, 'd MMM', { locale: dateLocale })} – ${format(we, 'd MMM yyyy', { locale: dateLocale })}`;
      })();

  // Generate calendar days
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days: Date[] = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  // Get appointments for a specific day
  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter(apt => 
      isSameDay(parseISO(apt.appointment_date), date) && apt.status !== 'cancelled'
    );
  };

  // Check if date is in a blocked period
  const isDateBlocked = (date: Date) => {
    return blockedPeriods.some(period => {
      const start = parseISO(period.start_date);
      const end = parseISO(period.end_date);
      return date >= start && date <= end;
    });
  };

  // Handle reschedule
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
      // Refetch to update the calendar with new date/time
      await refetch();
    }
  };

  // Handle block period
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

  // Remove blocked period
  const removeBlockedPeriod = async (id: string) => {
    const { error } = await deleteBlockedPeriod(id);
    if (error) {
      toast.error(t('calendar.unblockError'));
    } else {
      toast.success(t('calendar.unblocked'));
    }
  };

  // Get selected day appointments
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

  // Client selection handler
  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    if (clientId) {
      const client = clients.find(c => c.id === clientId);
      if (client) {
        setCreateForm(prev => ({
          ...prev,
          client_name: client.name,
          client_email: client.email || '',
          client_phone: client.phone || '',
          client_address: client.address || '',
          custom_service_id: '',
          custom_price: '',
          pack_id: '',
        }));
      }
    } else {
      setCreateForm(prev => ({
        ...prev,
        client_name: '',
        client_email: '',
        client_phone: '',
        client_address: '',
        custom_service_id: '',
        custom_price: '',
        pack_id: '',
      }));
      setServiceType('pack');
    }
  };

  const handleServiceTypeChange = (type: 'pack' | 'custom') => {
    setServiceType(type);
    if (type === 'pack') {
      setCreateForm(prev => ({ ...prev, custom_service_id: '', custom_price: '' }));
    } else {
      setCreateForm(prev => ({ ...prev, pack_id: '' }));
    }
  };

  const handleCustomServiceChange = (serviceId: string) => {
    const service = customServices.find(s => s.id === serviceId);
    setCreateForm(prev => ({
      ...prev,
      custom_service_id: serviceId,
      custom_price: service?.price?.toString() || '',
    }));
  };

  // Open create dialog with pre-filled date/time
  const openCreateDialog = (date?: string, time?: string) => {
    setSelectedClientId('');
    setServiceType('pack');
    setCreateForm({
      client_name: '',
      client_email: '',
      client_phone: '',
      client_address: '',
      vehicle_type: 'berline',
      appointment_date: date || format(new Date(), 'yyyy-MM-dd'),
      appointment_time: time || '09:00',
      pack_id: '',
      custom_service_id: '',
      custom_price: '',
      notes: '',
    });
    setShowCreateDialog(true);
  };

  // Handle create appointment
  const handleCreateAppointment = async () => {
    if (!createForm.client_name || !createForm.client_phone || !createForm.appointment_date || !createForm.appointment_time) {
      toast.error('Veuillez remplir les champs obligatoires');
      return;
    }
    setLoadingCreate(true);
    
    const selectedService = customServices.find(s => s.id === createForm.custom_service_id);
    const selectedPack = packs.find(p => p.id === createForm.pack_id);
    
    const payload: any = {
      client_name: createForm.client_name,
      client_email: createForm.client_email || 'non-fourni@example.com',
      client_phone: createForm.client_phone,
      client_address: createForm.client_address,
      vehicle_type: createForm.vehicle_type || 'standard',
      appointment_date: createForm.appointment_date,
      appointment_time: createForm.appointment_time,
      notes: createForm.notes,
      send_email: !!createForm.client_email && createForm.client_email !== 'non-fourni@example.com',
    };

    if (selectedClientId) {
      payload.client_id = selectedClientId;
    }

    if (serviceType === 'custom' && createForm.custom_service_id) {
      payload.custom_service_id = createForm.custom_service_id;
      payload.custom_price = parseFloat(createForm.custom_price) || selectedService?.price;
      payload.duration_minutes = selectedService?.duration_minutes;
      payload.service_name = selectedService?.name;
    } else if (serviceType === 'pack' && createForm.pack_id) {
      payload.pack_id = createForm.pack_id;
    }
    
    const { error } = await createAppointment(payload);
    
    setLoadingCreate(false);
    
    if (error) {
      toast.error('Erreur lors de la création');
    } else {
      toast.success('Rendez-vous créé !');
      setShowCreateDialog(false);
      setSelectedClientId('');
      setServiceType('pack');
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
  return (
    <>
    <DashboardLayout title={t('calendar.title')} subtitle={center?.name}>
      <div className="max-w-7xl">
          {/* Header with navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
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
            
            <div className="flex gap-2 flex-wrap">
              {/* Add appointment button */}
              <Button onClick={() => openCreateDialog()} className="rounded-xl h-9 text-sm">
                <Plus className="w-4 h-4 mr-1.5" />
                <span className="hidden sm:inline">Ajouter un RDV</span>
                <span className="sm:hidden">RDV</span>
              </Button>

              {/* View toggle */}
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
              </div>
              
              <Button variant="outline" onClick={goToToday} className="rounded-xl h-9 text-sm">
                <CalendarIcon className="w-4 h-4 mr-1.5" />
                {t('calendar.today')}
              </Button>
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

          {/* WEEK VIEW */}
          {viewMode === 'week' && (
            <div className="h-[calc(100vh-180px)] sm:h-[calc(100vh-220px)] min-h-[400px] -mx-3 sm:mx-0">
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

          {/* MONTH VIEW */}
          {viewMode === 'month' && (
          <div className="grid lg:grid-cols-[1fr_320px] gap-4 sm:gap-6">
            {/* Calendar Grid */}
            <Card className="p-3 sm:p-6 rounded-2xl">
              {/* Week days header */}
              <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-2">
                {weekDays.map(day => (
                  <div key={day} className="text-center text-xs sm:text-sm font-medium text-muted-foreground py-1 sm:py-2">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Days grid */}
              <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
                {days.map((day, idx) => {
                  const dayAppointments = getAppointmentsForDay(day);
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const blocked = isDateBlocked(day);
                  const isPast = isBefore(day, new Date()) && !isToday(day);
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedDate(day)}
                      className={cn(
                        "relative aspect-square p-0.5 sm:p-2 rounded-lg sm:rounded-xl transition-all flex flex-col items-center justify-start pt-1 sm:pt-2",
                        !isCurrentMonth && "opacity-30",
                        isCurrentMonth && !isSelected && "hover:bg-secondary",
                        isSelected && "bg-primary text-primary-foreground",
                        isToday(day) && !isSelected && "ring-2 ring-primary/50",
                        blocked && "bg-red-50 dark:bg-red-950/30",
                        isPast && "opacity-60"
                      )}
                    >
                      <span className={cn(
                        "text-xs sm:text-sm font-medium",
                        isSelected ? "text-primary-foreground" : "text-foreground"
                      )}>
                        {format(day, 'd')}
                      </span>
                      
                      {/* Appointment indicators */}
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
              
              {/* Legend */}
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

            {/* Side panel - Selected day details */}
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

              {/* Blocked periods */}
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
      {/* Appointment Details Dialog */}
      <Dialog open={!!selectedAppointment && !appointmentToReschedule} onOpenChange={(open) => {
        if (!open) {
          setSelectedAppointment(null);
        }
      }}>
        <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
            <DialogTitle>{t('calendar.appointmentDetails')}</DialogTitle>
            <DialogDescription className="sr-only">
              {t('calendar.appointmentDetailsDesc')}
            </DialogDescription>
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
              
              {/* Actions grid */}
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
                
                {selectedAppointment.status === 'pending' && (
                  <Button
                    variant="outline"
                    className="rounded-xl text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                    onClick={() => {
                      handleUpdateStatus(selectedAppointment.id, 'confirmed');
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
              
              {selectedAppointment.status === 'pending' && (
                <Button
                  variant="outline"
                  className="w-full rounded-xl text-amber-600 border-amber-200 hover:bg-amber-50"
                  onClick={() => {
                    handleUpdateStatus(selectedAppointment.id, 'cancelled');
                    setSelectedAppointment(null);
                  }}
                >
                  {t('calendar.cancelAppointment')}
                </Button>
              )}
              
              {/* Delete button */}
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
        if (!open) {
          setAppointmentToReschedule(null);
        }
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
            <Button 
              variant="outline" 
              onClick={() => setAppointmentToReschedule(null)}
              className="rounded-xl flex-1 sm:flex-none"
            >
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
            <DialogDescription className="sr-only">
              {t('calendar.blockPeriodDesc')}
            </DialogDescription>
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

      {/* Create Appointment Dialog — same as Reservations */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">{t('dashboard.addReservation')}</DialogTitle>
            <DialogDescription className="sr-only">Créer un nouveau rendez-vous</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-5 mt-4">
            {/* Client selector */}
            {clients.length > 0 && (
              <div className="space-y-2">
                <Label>{t('dashboard.registeredClient')}</Label>
                <Select value={selectedClientId || "new"} onValueChange={(v) => handleClientSelect(v === "new" ? "" : v)}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder={t('dashboard.selectOrNew')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">{t('dashboard.newClient')}</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-primary" />
                          <span>{client.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Service type toggle */}
            <div className="space-y-3">
              <Label>{t('dashboard.serviceType')}</Label>
              <div className="flex bg-muted/60 rounded-xl p-1">
                <button type="button" onClick={() => handleServiceTypeChange('pack')}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    serviceType === 'pack' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}>
                  {t('dashboard.formulas')}
                </button>
                {customServices.filter(s => s.active).length > 0 && (
                  <button type="button" onClick={() => handleServiceTypeChange('custom')}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      serviceType === 'custom' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}>
                    {t('dashboard.customServiceShort')}
                  </button>
                )}
              </div>

              {serviceType === 'pack' && (
                <div className="space-y-2">
                  <Select value={createForm.pack_id} onValueChange={(v) => setCreateForm(prev => ({ ...prev, pack_id: v }))}>
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue placeholder={t('dashboard.selectFormula')} />
                    </SelectTrigger>
                    <SelectContent>
                      {packs.map((pack) => (
                        <SelectItem key={pack.id} value={pack.id}>
                          {pack.name} - {pack.price}€
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {createForm.pack_id && packs.find(p => p.id === createForm.pack_id) && (
                    <div className="bg-primary/5 rounded-lg p-3 text-sm">
                      <p className="font-medium text-primary">{packs.find(p => p.id === createForm.pack_id)?.name}</p>
                      <p className="text-muted-foreground">
                        {packs.find(p => p.id === createForm.pack_id)?.duration || t('common.duration')} • {packs.find(p => p.id === createForm.pack_id)?.price}€
                      </p>
                    </div>
                  )}
                </div>
              )}

              {serviceType === 'custom' && customServices.filter(s => s.active).length > 0 && (
                <div className="space-y-2">
                  <Select value={createForm.custom_service_id} onValueChange={handleCustomServiceChange}>
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue placeholder={t('dashboard.selectService')} />
                    </SelectTrigger>
                    <SelectContent>
                      {customServices.filter(s => s.active).map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name} - {service.price}€ ({formatDuration(service.duration_minutes)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {createForm.custom_service_id && customServices.find(s => s.id === createForm.custom_service_id) && (
                    <div className="bg-primary/5 rounded-lg p-3 text-sm">
                      <p className="font-medium text-primary">{customServices.find(s => s.id === createForm.custom_service_id)?.name}</p>
                      <p className="text-muted-foreground">
                        {formatDuration(customServices.find(s => s.id === createForm.custom_service_id)?.duration_minutes || 0)} • {customServices.find(s => s.id === createForm.custom_service_id)?.price}€
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Client info */}
            <div className="space-y-2">
              <Label>{t('dashboard.clientName')}</Label>
              <Input value={createForm.client_name} onChange={(e) => setCreateForm(prev => ({ ...prev, client_name: e.target.value }))} placeholder="Jean Dupont" className="h-11 rounded-xl" disabled={!!selectedClientId} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('dashboard.phoneStar')}</Label>
                <Input value={createForm.client_phone} onChange={(e) => setCreateForm(prev => ({ ...prev, client_phone: e.target.value }))} placeholder="06 12 34 56 78" className="h-11 rounded-xl" disabled={!!selectedClientId} />
              </div>
              <div className="space-y-2">
                <Label>{t('common.email')}</Label>
                <Input type="email" value={createForm.client_email} onChange={(e) => setCreateForm(prev => ({ ...prev, client_email: e.target.value }))} placeholder="jean@email.com" className="h-11 rounded-xl" disabled={!!selectedClientId} />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('dashboard.dateStar')}</Label>
                <Input type="date" value={createForm.appointment_date} onChange={(e) => setCreateForm(prev => ({ ...prev, appointment_date: e.target.value }))} className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>{t('dashboard.timeStar')}</Label>
                <Input type="time" value={createForm.appointment_time} onChange={(e) => setCreateForm(prev => ({ ...prev, appointment_time: e.target.value }))} className="h-11 rounded-xl" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>{t('common.notes')}</Label>
              <Textarea value={createForm.notes} onChange={(e) => setCreateForm(prev => ({ ...prev, notes: e.target.value }))} placeholder={t('dashboard.additionalInfo')} rows={2} className="rounded-xl resize-none" />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowCreateDialog(false)} className="rounded-xl">
              {t('common.cancel')}
            </Button>
            <Button 
              onClick={handleCreateAppointment}
              disabled={loadingCreate || !createForm.client_name || !createForm.client_phone}
              className="rounded-xl min-w-[120px]"
            >
              {loadingCreate ? <Loader2 className="w-4 h-4 animate-spin" /> : t('common.add')}
            </Button>
          </div>
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
    </>
  );
}
