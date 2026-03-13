import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, X, Clock, User, Ban, Loader2, GripVertical, Trash2, ArrowRight, LayoutGrid, CalendarDays, CalendarPlus, Users, Search, Eye, Building2, ChevronDown, ChevronRight as ChevronRightIcon
} from 'lucide-react';
import { useMyAppointments, Appointment } from '@/hooks/useAppointments';
import { useMyCenter, useMyPacks } from '@/hooks/useCenter';
import { useBlockedPeriods } from '@/hooks/useAvailability';
import { useMyCustomServices, formatDuration } from '@/hooks/useCustomServices';
import { useMyClients, ClientType } from '@/hooks/useClients';
import { format, addMonths, subMonths, addWeeks, subWeeks, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday, parseISO, isBefore } from 'date-fns';

// Parse duration string like "1h30", "2h", "45min" to minutes
const parseDurationStr = (duration: string): number => {
  if (!duration) return 60;
  const hoursMatch = duration.match(/(\d+)h/);
  const minutesMatch = duration.match(/(\d+)(?:min|m(?!h))/);
  const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
  const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;
  return hours * 60 + minutes || 60;
};
import { fr, enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { WeeklyCalendarView } from '@/components/dashboard/WeeklyCalendarView';
import { MobileCalendarView } from '@/components/dashboard/MobileCalendarView';
import { MobileScheduleView } from '@/components/dashboard/MobileScheduleView';
import { ConfirmationCalendarDialog } from '@/components/dashboard/ConfirmationCalendarDialog';
import { AvailableSlotPicker } from '@/components/dashboard/AvailableSlotPicker';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import { useIsMobile } from '@/hooks/use-mobile';
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
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === 'en' ? enUS : fr;
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'schedule'>('week');
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
  const { clients, createClient, refetch: refetchClients } = useMyClients();
  const { markAsSynced, isSynced } = useCalendarSync();
  const isMobile = useIsMobile();
  // Create appointment state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showCalendarSyncDialog, setShowCalendarSyncDialog] = useState(false);
  const [lastCreatedAppointment, setLastCreatedAppointment] = useState<Appointment | null>(null);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [serviceType, setServiceType] = useState<'pack' | 'custom'>('pack');
  const [clientSearch, setClientSearch] = useState('');
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false);
  const [serviceSearch, setServiceSearch] = useState('');
  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const clientSearchRef = useRef<HTMLDivElement>(null);
  const serviceSearchRef = useRef<HTMLDivElement>(null);
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
    duration_minutes: '',
    notes: '',
  });

  // Client creation dialog state (inline in calendar page)
  const [showClientCreateDialog, setShowClientCreateDialog] = useState(false);
  const [newClientCreating, setNewClientCreating] = useState(false);
  const [newClientForm, setNewClientForm] = useState({
    name: '', email: '', phone: '', address: '', notes: '',
    client_type: 'particulier' as ClientType,
    company_name: '',
  });
  const [newClientServiceIds, setNewClientServiceIds] = useState<string[]>([]);
  const [newClientServicesOpen, setNewClientServicesOpen] = useState(false);

  const resetNewClientForm = () => {
    setNewClientForm({ name: '', email: '', phone: '', address: '', notes: '', client_type: 'particulier', company_name: '' });
    setNewClientServiceIds([]);
    setNewClientServicesOpen(false);
  };

  const handleNewClientCreate = async () => {
    if (!newClientForm.name.trim()) {
      toast.error('Le nom est requis');
      return;
    }
    setNewClientCreating(true);
    const { error, data: createdClient, isExisting } = await createClient({
      name: newClientForm.name.trim(),
      email: newClientForm.email.trim() || undefined,
      phone: newClientForm.phone.trim() || undefined,
      address: newClientForm.address.trim() || undefined,
      notes: newClientForm.notes.trim() || undefined,
      client_type: newClientForm.client_type,
      company_name: newClientForm.client_type === 'professionnel' ? newClientForm.company_name.trim() || undefined : undefined,
    } as any);

    if (!error && createdClient) {
      const c = createdClient as any;
      if (newClientServiceIds.length > 0 && c.id) {
        await supabase
          .from('client_services')
          .insert(newClientServiceIds.map(sid => ({ client_id: c.id, service_id: sid })));
      }
      setSelectedClientId(c.id);
      setClientSearch(c.name);
      setCreateForm(prev => ({
        ...prev,
        client_name: c.name,
        client_email: c.email || '',
        client_phone: c.phone || '',
        client_address: c.address || '',
      }));
      toast.success(isExisting ? `${c.name} existant retrouvé et mis à jour` : `${c.name} a été ajouté`);
      setShowClientCreateDialog(false);
      resetNewClientForm();
      refetchClients();
    } else if (error) {
      toast.error(error);
    }
    setNewClientCreating(false);
  };

  // Auto-open create dialog when navigated from Reservations page
  useEffect(() => {
    const state = location.state as { openCreate?: boolean } | null;
    if (state?.openCreate) {
      openCreateDialog();
      // Clear the state so it doesn't reopen on re-render
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (clientSearchRef.current && !clientSearchRef.current.contains(e.target as Node)) {
        setClientDropdownOpen(false);
      }
      if (serviceSearchRef.current && !serviceSearchRef.current.contains(e.target as Node)) {
        setServiceDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

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
    
    // Check overlap (exclude current appointment)
    const duration = appointmentToReschedule.duration_minutes || 60;
    const overlap = appointments.find(apt => {
      if (apt.id === appointmentToReschedule.id) return false;
      if (apt.appointment_date !== rescheduleForm.date) return false;
      if (apt.status === 'cancelled' || apt.status === 'refused') return false;
      const newStart = timeToMinutes(rescheduleForm.time);
      const newEnd = newStart + duration;
      const aptStart = timeToMinutes(apt.appointment_time.slice(0, 5));
      const aptEnd = aptStart + (apt.duration_minutes || 60);
      return newStart < aptEnd && newEnd > aptStart;
    });
    if (overlap) {
      toast.error(`Créneau déjà occupé par ${overlap.client_name} à ${overlap.appointment_time.slice(0, 5)}`);
      return;
    }
    
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
      
      // Auto-update Google Calendar event if it exists
      if (appointmentToReschedule.google_calendar_event_id) {
        (async () => {
          try {
            const { data: sessionData } = await supabase.auth.getSession();
            const token = sessionData?.session?.access_token;
            if (!token) return;
            await supabase.functions.invoke('google-calendar-sync', {
              headers: { Authorization: `Bearer ${token}` },
              body: { action: 'update', appointment_id: appointmentToReschedule.id },
            });
          } catch (syncErr) {
            console.warn('[Google Calendar Update] Error (non-blocking):', syncErr);
          }
        })();
      }
      
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
    setClientDropdownOpen(false);
    if (clientId) {
      const client = clients.find(c => c.id === clientId);
      if (client) {
        setClientSearch(client.name);
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
      setClientSearch('');
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

  // Filtered clients for autocomplete
  const filteredClients = useMemo(() => {
    if (!clientSearch.trim()) return clients.slice(0, 8);
    const q = clientSearch.toLowerCase();
    return clients.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q))
    ).slice(0, 8);
  }, [clients, clientSearch]);

  // Filtered services for autocomplete
  const filteredServices = useMemo(() => {
    const items = serviceType === 'pack'
      ? packs.map(p => {
          const isQuote = (p as any).pricing_type === 'quote';
          const variants = ((p as any).price_variants || []) as { name: string; price: number }[];
          const hasVariants = !isQuote && variants.length > 0;
          const minPrice = isQuote ? 0 : (hasVariants ? Math.min(...variants.map(v => v.price)) : p.price);
          const displayPrice = isQuote ? 'Sur devis' : (hasVariants ? `${minPrice}€+` : `${p.price}€`);
          return { id: p.id, name: p.name, price: minPrice, displayPrice, duration: p.duration || '', type: 'pack' as const, hasVariants, variants, isQuote };
        })
      : customServices.filter(s => s.active).map(s => ({ id: s.id, name: s.name, price: s.price, displayPrice: `${s.price}€`, duration: formatDuration(s.duration_minutes), type: 'custom' as const, hasVariants: false, variants: [] as { name: string; price: number }[] }));
    if (!serviceSearch.trim()) return items.slice(0, 8);
    const q = serviceSearch.toLowerCase();
    return items.filter(i => i.name.toLowerCase().includes(q)).slice(0, 8);
  }, [packs, customServices, serviceSearch, serviceType]);

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
    setClientSearch('');
    setServiceSearch('');
    setClientDropdownOpen(false);
    setServiceDropdownOpen(false);
    setSelectedVariant('');
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
      duration_minutes: '',
      notes: '',
    });
    setShowCreateDialog(true);
  };

  // Check for overlapping appointments
  const checkOverlap = (date: string, time: string, durationMinutes: number): Appointment | null => {
    const newStart = timeToMinutes(time);
    const newEnd = newStart + durationMinutes;
    
    return appointments.find(apt => {
      if (apt.appointment_date !== date) return false;
      if (apt.status === 'cancelled' || apt.status === 'refused') return false;
      const aptStart = timeToMinutes(apt.appointment_time.slice(0, 5));
      const aptEnd = aptStart + (apt.duration_minutes || 60);
      return newStart < aptEnd && newEnd > aptStart;
    }) || null;
  };

  const timeToMinutes = (time: string): number => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + (m || 0);
  };

  // Handle create appointment
  const handleCreateAppointment = async () => {
    if (!createForm.client_name || !createForm.client_phone || !createForm.appointment_date || !createForm.appointment_time) {
      toast.error('Veuillez remplir les champs obligatoires');
      return;
    }

    // Check overlapping
    const selectedService = customServices.find(s => s.id === createForm.custom_service_id);
    const selectedPack = packs.find(p => p.id === createForm.pack_id);
    const isQuotePack = selectedPack && (selectedPack as any).pricing_type === 'quote';
    const duration = selectedService?.duration_minutes 
      || (isQuotePack && createForm.duration_minutes ? parseInt(createForm.duration_minutes) : null)
      || (selectedPack?.duration ? parseDurationStr(selectedPack.duration) : null)
      || 60;
    
    const overlap = checkOverlap(createForm.appointment_date, createForm.appointment_time, duration);
    if (overlap) {
      toast.error(`Créneau déjà occupé par ${overlap.client_name} à ${overlap.appointment_time.slice(0, 5)}`);
      return;
    }

    setLoadingCreate(true);
    
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
      const pack = packs.find(p => p.id === createForm.pack_id);
      const isQuotePack = pack && (pack as any).pricing_type === 'quote';
      const variants = ((pack as any)?.price_variants || []) as { name: string; price: number }[];
      
      if (isQuotePack) {
        payload.custom_price = parseFloat(createForm.custom_price) || 0;
        payload.duration_minutes = parseInt(createForm.duration_minutes) || 60;
      } else if (selectedVariant && variants.length > 0) {
        const variant = variants.find(v => v.name === selectedVariant);
        if (variant) {
          payload.custom_price = variant.price;
          payload.price = variant.price;
          payload.variant_name = variant.name;
        }
      } else if (pack) {
        payload.custom_price = pack.price;
      }
      
      // Set duration from pack if not already set
      if (!payload.duration_minutes && pack?.duration) {
        payload.duration_minutes = parseDurationStr(pack.duration);
      }
    }
    
    const { error } = await createAppointment(payload);
    
    setLoadingCreate(false);
    
    if (error) {
      toast.error('Erreur lors de la création');
    } else {
      // Show client creation feedback for new clients
      if (!selectedClientId) {
        toast.success('Rendez-vous créé et client ajouté à votre base !', { icon: '👤' });
      } else {
        toast.success('Rendez-vous créé !');
      }
      setShowCreateDialog(false);
      setSelectedClientId('');
      setServiceType('pack');
      setClientSearch('');
      setServiceSearch('');
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
          {/* Header — Apple Calendar style (hidden on mobile month view since MobileCalendarView has its own) */}
          <div className={cn(
            "flex items-center justify-between gap-2 mb-3 sm:mb-5",
            (viewMode === 'month' || viewMode === 'schedule') && isMobile && "hidden"
          )}>
            {/* Left: Navigation */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Button variant="ghost" size="icon" onClick={handlePrev} className="h-8 w-8 sm:h-9 sm:w-9 rounded-full">
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              <button 
                onClick={goToToday}
                className="text-base sm:text-lg font-semibold text-foreground min-w-[120px] sm:min-w-[200px] text-center capitalize hover:text-primary transition-colors"
              >
                {headerLabel}
              </button>
              <Button variant="ghost" size="icon" onClick={handleNext} className="h-8 w-8 sm:h-9 sm:w-9 rounded-full">
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* View toggle — pill style */}
              <div className="hidden sm:flex bg-muted/60 rounded-full p-0.5">
                <button
                  onClick={() => setViewMode('week')}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-full transition-all",
                    viewMode === 'week' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Semaine
                </button>
                <button
                  onClick={() => setViewMode('month')}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-full transition-all",
                    viewMode === 'month' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Mois
                </button>
              </div>

              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => {
                  setBlockForm({ 
                    start_date: format(new Date(), 'yyyy-MM-dd'), 
                    end_date: format(addDays(new Date(), 1), 'yyyy-MM-dd'), 
                    reason: '' 
                  });
                  setShowBlockDialog(true);
                }}
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-full text-muted-foreground"
              >
                <Ban className="w-4 h-4" />
              </Button>

              <Button onClick={() => openCreateDialog()} size="icon" className="h-8 w-8 sm:h-9 sm:w-9 rounded-full">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Mobile view toggle — 3 tabs */}
          <div className={cn(
            "flex sm:hidden bg-muted/60 rounded-full p-0.5 mb-3",
          )}>
            <button
              onClick={() => setViewMode('schedule')}
              className={cn(
                "flex-1 py-1.5 text-[11px] font-semibold rounded-full transition-all text-center",
                viewMode === 'schedule' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              Planning
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={cn(
                "flex-1 py-1.5 text-[11px] font-semibold rounded-full transition-all text-center",
                viewMode === 'week' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              Semaine
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={cn(
                "flex-1 py-1.5 text-[11px] font-semibold rounded-full transition-all text-center",
                viewMode === 'month' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              Mois
            </button>
          </div>

          {/* WEEK VIEW */}
          {viewMode === 'week' && (
            <div className="h-[calc(100vh-160px)] sm:h-[calc(100vh-180px)] min-h-[400px] -mx-3 sm:mx-0">
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

          {/* SCHEDULE VIEW (mobile only) */}
          {viewMode === 'schedule' && (
            <div className="h-[calc(100vh-180px)] min-h-[400px] -mx-1 relative">
              <MobileScheduleView
                currentDate={currentWeekDate}
                appointments={appointments}
                onAppointmentClick={(apt) => {
                  setSelectedAppointment(apt);
                  setRescheduleForm({ 
                    date: apt.appointment_date, 
                    time: apt.appointment_time.slice(0, 5) 
                  });
                }}
                blockedPeriods={blockedPeriods}
              />
              {/* Floating action button */}
              <button
                onClick={() => openCreateDialog()}
                className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 flex items-center justify-center active:scale-95 transition-transform"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
          )}

          {/* MONTH VIEW */}
          {viewMode === 'month' && isMobile && (
            <div className="h-[calc(100vh-180px)] min-h-[400px] -mx-1 relative">
              <MobileCalendarView
                currentDate={currentMonth}
                onDateChange={setCurrentMonth}
                appointments={appointments}
                onAppointmentClick={(apt) => {
                  setSelectedAppointment(apt);
                  setRescheduleForm({ 
                    date: apt.appointment_date, 
                    time: apt.appointment_time.slice(0, 5) 
                  });
                }}
                blockedPeriods={blockedPeriods}
              />
              {/* Floating action button */}
              <button
                onClick={() => openCreateDialog()}
                className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 flex items-center justify-center active:scale-95 transition-transform"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
          )}

          {viewMode === 'month' && !isMobile && (
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
                                {apt.deposit_status && apt.deposit_status !== 'none' && (
                                  <p className={`text-xs mt-0.5 ml-5 font-medium ${apt.deposit_status === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                    💳 {apt.deposit_status === 'paid' ? 'Acompte payé' : 'En attente'}
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
                {selectedAppointment.deposit_status && selectedAppointment.deposit_status !== 'none' && (
                  <div className="flex items-center gap-2 ml-6 mt-1">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                      selectedAppointment.deposit_status === 'paid' 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400' 
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
                    }`}>
                      💳 {selectedAppointment.deposit_status === 'paid' ? 'Acompte payé' : 'Acompte en attente'}
                      {selectedAppointment.deposit_amount ? ` · ${selectedAppointment.deposit_amount}€` : ''}
                    </span>
                  </div>
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

      {/* Create Appointment Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">{t('dashboard.addReservation')}</DialogTitle>
            <DialogDescription className="sr-only">Créer un nouveau rendez-vous</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-5 mt-4">
            {/* Client autocomplete search */}
            <div className="space-y-2">
              <Label>Client *</Label>
              <div ref={clientSearchRef} className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={clientSearch}
                    onChange={(e) => {
                      setClientSearch(e.target.value);
                      setClientDropdownOpen(true);
                      if (selectedClientId) {
                        setSelectedClientId('');
                        setCreateForm(prev => ({
                          ...prev,
                          client_name: e.target.value,
                          client_email: '',
                          client_phone: '',
                          client_address: '',
                        }));
                      } else {
                        setCreateForm(prev => ({ ...prev, client_name: e.target.value }));
                      }
                    }}
                    onFocus={() => setClientDropdownOpen(true)}
                    placeholder="Rechercher ou créer un client..."
                    className="pl-9 pr-10 h-11 rounded-xl"
                  />
                  {selectedClientId && (
                    <button
                      type="button"
                      onClick={() => {
                        handleClientSelect('');
                        setClientSearch('');
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {clientDropdownOpen && !selectedClientId && (
                  <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {clientSearch.trim() && (
                      <button
                        type="button"
                        onClick={() => {
                          setClientDropdownOpen(false);
                          setNewClientForm(prev => ({ ...prev, name: clientSearch.trim() }));
                          setShowClientCreateDialog(true);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-secondary/60 transition-colors flex items-center gap-2 text-primary font-medium border-b border-border"
                      >
                        <Plus className="w-4 h-4" />
                        Créer « {clientSearch.trim()} »
                      </button>
                    )}
                    {filteredClients.map((client) => (
                      <div
                        key={client.id}
                        className="flex items-center justify-between hover:bg-secondary/60 transition-colors"
                      >
                        <button
                          type="button"
                          onClick={() => handleClientSelect(client.id)}
                          className="flex-1 text-left px-4 py-2.5 text-sm"
                        >
                          <span className="font-medium text-foreground">{client.name}</span>
                          {(client.phone || client.email) && (
                            <span className="text-muted-foreground ml-2 text-xs">
                              {client.phone || client.email}
                            </span>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClientSelect(client.id);
                            setClientDropdownOpen(false);
                            // Navigate to client detail - open in new context
                            navigate('/dashboard/clients', { state: { openClientId: client.id } });
                          }}
                          className="px-3 py-2.5 text-muted-foreground hover:text-primary transition-colors"
                          title="Voir la fiche client"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {filteredClients.length === 0 && !clientSearch.trim() && (
                      <p className="px-4 py-3 text-sm text-muted-foreground">Aucun client</p>
                    )}
                  </div>
                )}
              </div>
              {/* Show phone/email fields only for NEW clients (not in DB) */}
              {!selectedClientId && createForm.client_name && (
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <Input
                    value={createForm.client_phone}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, client_phone: e.target.value }))}
                    placeholder="Téléphone *"
                    className="h-10 rounded-xl text-sm"
                  />
                  <Input
                    type="email"
                    value={createForm.client_email}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, client_email: e.target.value }))}
                    placeholder="Email"
                    className="h-10 rounded-xl text-sm"
                  />
                </div>
              )}
            </div>

            {/* Service type toggle */}
            <div className="space-y-3">
              <Label>Prestation</Label>
              <div className="flex bg-muted/60 rounded-xl p-1">
                <button type="button" onClick={() => { handleServiceTypeChange('pack'); setServiceSearch(''); setServiceDropdownOpen(false); }}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    serviceType === 'pack' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}>
                  {t('dashboard.formulas')}
                </button>
                {customServices.filter(s => s.active).length > 0 && (
                  <button type="button" onClick={() => { handleServiceTypeChange('custom'); setServiceSearch(''); setServiceDropdownOpen(false); }}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      serviceType === 'custom' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}>
                    Prestations personnalisées
                  </button>
                )}
              </div>

              {/* Service autocomplete search */}
              <div ref={serviceSearchRef} className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={serviceSearch}
                    onChange={(e) => {
                      setServiceSearch(e.target.value);
                      setServiceDropdownOpen(true);
                    }}
                    onFocus={() => setServiceDropdownOpen(true)}
                    placeholder={serviceType === 'pack' ? 'Rechercher une formule...' : 'Rechercher une prestation...'}
                    className="pl-9 h-11 rounded-xl"
                  />
                  {(createForm.pack_id || createForm.custom_service_id) && (
                    <button
                      type="button"
                      onClick={() => {
                        setServiceSearch('');
                        setSelectedVariant('');
                        setCreateForm(prev => ({ ...prev, pack_id: '', custom_service_id: '', custom_price: '' }));
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {serviceDropdownOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {filteredServices.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          if (item.type === 'pack') {
                            setCreateForm(prev => ({ ...prev, pack_id: item.id, custom_service_id: '', custom_price: '' }));
                            setSelectedVariant('');
                          } else {
                            handleCustomServiceChange(item.id);
                          }
                          setServiceSearch(item.name);
                          setServiceDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-secondary/60 transition-colors flex items-center justify-between"
                      >
                        <span className="font-medium text-foreground">{item.name}</span>
                        <span className="text-muted-foreground text-xs">{item.duration} • {item.displayPrice}</span>
                      </button>
                    ))}
                    {filteredServices.length === 0 && (
                      <p className="px-4 py-3 text-sm text-muted-foreground">Aucun résultat</p>
                    )}
                  </div>
                )}
              </div>

              {/* Selected service preview + variant selector */}
              {createForm.pack_id && (() => {
                const pack = packs.find(p => p.id === createForm.pack_id);
                if (!pack) return null;
                const isQuote = (pack as any).pricing_type === 'quote';
                const variants = ((pack as any).price_variants || []) as { name: string; price: number }[];
                const hasVariants = !isQuote && variants.length > 0;
                const displayPrice = isQuote
                  ? (createForm.custom_price ? `${createForm.custom_price}€` : 'Sur devis')
                  : hasVariants 
                    ? (selectedVariant ? `${variants.find(v => v.name === selectedVariant)?.price}€` : 'Sélectionnez une option')
                    : `${pack.price}€`;

                return (
                  <div className="space-y-2">
                    <div className="bg-primary/5 rounded-lg p-3 text-sm">
                      <p className="font-medium text-primary">{pack.name}</p>
                      <p className="text-muted-foreground">
                        {pack.duration || t('common.duration')} • {displayPrice}
                      </p>
                    </div>
                    {isQuote && (
                      <>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">Montant négocié (€) *</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Ex: 150"
                            value={createForm.custom_price}
                            onChange={(e) => setCreateForm(prev => ({ ...prev, custom_price: e.target.value }))}
                            className="h-11 rounded-xl"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">Durée estimée (minutes) *</Label>
                          <Input
                            type="number"
                            min="15"
                            step="15"
                            placeholder="Ex: 90"
                            value={createForm.duration_minutes}
                            onChange={(e) => setCreateForm(prev => ({ ...prev, duration_minutes: e.target.value }))}
                            className="h-11 rounded-xl"
                          />
                        </div>
                      </>
                    )}
                    {hasVariants && (
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Sélectionner une option *</Label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {variants.map((v) => (
                            <button
                              key={v.name}
                              type="button"
                              onClick={() => {
                                setSelectedVariant(v.name);
                                setCreateForm(prev => ({ ...prev, custom_price: v.price.toString() }));
                              }}
                              className={cn(
                                "px-3 py-2 text-sm rounded-lg border transition-all text-left",
                                selectedVariant === v.name
                                  ? "border-primary bg-primary/10 text-primary font-medium"
                                  : "border-border hover:border-primary/50 text-foreground"
                              )}
                            >
                              <span className="block font-medium">{v.name}</span>
                              <span className="text-xs text-muted-foreground">{v.price}€</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
              {createForm.custom_service_id && customServices.find(s => s.id === createForm.custom_service_id) && (
                <div className="bg-primary/5 rounded-lg p-3 text-sm">
                  <p className="font-medium text-primary">{customServices.find(s => s.id === createForm.custom_service_id)?.name}</p>
                  <p className="text-muted-foreground">
                    {formatDuration(customServices.find(s => s.id === createForm.custom_service_id)?.duration_minutes || 0)} • {customServices.find(s => s.id === createForm.custom_service_id)?.price}€
                  </p>
                </div>
              )}
            </div>

            {/* Date & Time — available slot picker */}
            <div className="space-y-2">
              <Label>{t('dashboard.dateStar')} / {t('dashboard.timeStar')}</Label>
              {center?.id ? (
                <AvailableSlotPicker
                  centerId={center.id}
                  serviceDurationMinutes={
                    createForm.custom_service_id
                      ? customServices.find(s => s.id === createForm.custom_service_id)?.duration_minutes
                      : createForm.pack_id
                        ? (() => {
                            const pack = packs.find(p => p.id === createForm.pack_id);
                            const isQuote = (pack as any)?.pricing_type === 'quote';
                            if (isQuote && createForm.duration_minutes) return parseInt(createForm.duration_minutes);
                            if (pack?.duration) return parseDurationStr(pack.duration);
                            return undefined;
                          })()
                        : undefined
                  }
                  selectedDate={createForm.appointment_date}
                  selectedTime={createForm.appointment_time}
                  onSelect={(date, time) => setCreateForm(prev => ({ ...prev, appointment_date: date, appointment_time: time }))}
                />
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <Input type="date" value={createForm.appointment_date} onChange={(e) => setCreateForm(prev => ({ ...prev, appointment_date: e.target.value }))} className="h-11 rounded-xl" />
                  <Input type="time" value={createForm.appointment_time} onChange={(e) => setCreateForm(prev => ({ ...prev, appointment_time: e.target.value }))} className="h-11 rounded-xl" />
                </div>
              )}
            </div>
            
            {/* Notes */}
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
              disabled={loadingCreate || !createForm.client_name || (!selectedClientId && !createForm.client_phone)}
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

      {/* Client creation dialog */}
      <Dialog open={showClientCreateDialog} onOpenChange={(v) => { setShowClientCreateDialog(v); if (!v) resetNewClientForm(); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouveau client</DialogTitle>
            <DialogDescription className="sr-only">Formulaire pour créer un nouveau client</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="flex gap-2">
              <Button type="button" variant={newClientForm.client_type === 'particulier' ? 'default' : 'outline'} size="sm" className="flex-1 gap-2 rounded-xl h-10" onClick={() => setNewClientForm(prev => ({ ...prev, client_type: 'particulier' }))}>
                <User className="w-4 h-4" /> Particulier
              </Button>
              <Button type="button" variant={newClientForm.client_type === 'professionnel' ? 'default' : 'outline'} size="sm" className="flex-1 gap-2 rounded-xl h-10" onClick={() => setNewClientForm(prev => ({ ...prev, client_type: 'professionnel' }))}>
                <Building2 className="w-4 h-4" /> Professionnel
              </Button>
            </div>
            {newClientForm.client_type === 'professionnel' && (
              <div className="space-y-2 animate-fade-in">
                <Label>Nom de la société</Label>
                <Input placeholder="SARL Dupont" value={newClientForm.company_name} onChange={(e) => setNewClientForm(prev => ({ ...prev, company_name: e.target.value }))} className="h-11 rounded-xl" />
              </div>
            )}
            <div className="space-y-2">
              <Label>Nom *</Label>
              <Input placeholder="Jean Dupont" value={newClientForm.name} onChange={(e) => setNewClientForm(prev => ({ ...prev, name: e.target.value }))} className="h-11 rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Téléphone</Label>
                <Input placeholder="06 12 34 56 78" value={newClientForm.phone} onChange={(e) => setNewClientForm(prev => ({ ...prev, phone: e.target.value }))} className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="jean@email.com" value={newClientForm.email} onChange={(e) => setNewClientForm(prev => ({ ...prev, email: e.target.value }))} className="h-11 rounded-xl" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Adresse</Label>
              <Input placeholder="123 rue Example, 75000 Paris" value={newClientForm.address} onChange={(e) => setNewClientForm(prev => ({ ...prev, address: e.target.value }))} className="h-11 rounded-xl" />
            </div>

            {customServices.length > 0 && (
              <Collapsible open={newClientServicesOpen} onOpenChange={setNewClientServicesOpen}>
                <CollapsibleTrigger asChild>
                  <button type="button" className="flex items-center justify-between w-full text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2">
                    <span>Prestations personnalisées {newClientServiceIds.length > 0 && `(${newClientServiceIds.length})`}</span>
                    {newClientServicesOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />}
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto border rounded-xl p-3 mt-1">
                    {customServices.map((s) => (
                      <label key={s.id} className="flex items-center gap-3 cursor-pointer hover:bg-secondary/30 rounded-lg p-2 transition-colors">
                        <Checkbox checked={newClientServiceIds.includes(s.id)} onCheckedChange={(checked) => setNewClientServiceIds(prev => checked ? [...prev, s.id] : prev.filter(id => id !== s.id))} />
                        <span className="text-sm text-foreground">{s.name} · {formatDuration(s.duration_minutes)} · {s.price}€</span>
                      </label>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea placeholder="Informations supplémentaires..." value={newClientForm.notes} onChange={(e) => setNewClientForm(prev => ({ ...prev, notes: e.target.value }))} className="rounded-xl resize-none" rows={2} />
            </div>
            <Button type="button" onClick={handleNewClientCreate} className="w-full h-11 rounded-xl" disabled={newClientCreating || !newClientForm.name.trim()}>
              {newClientCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Ajouter le client
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
