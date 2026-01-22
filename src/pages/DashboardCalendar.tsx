import { useState } from 'react';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { MobileSidebar } from '@/components/dashboard/MobileSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus,
  X,
  Clock,
  User,
  Ban,
  Loader2,
  GripVertical,
  Trash2,
  ArrowRight
} from 'lucide-react';
import { useMyAppointments, Appointment } from '@/hooks/useAppointments';
import { useMyCenter } from '@/hooks/useCenter';
import { useBlockedPeriods } from '@/hooks/useAvailability';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameMonth, 
  isSameDay, 
  isToday,
  parseISO,
  isBefore
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface BlockedPeriod {
  id: string;
  center_id: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500',
  confirmed: 'bg-emerald-500',
  completed: 'bg-slate-400',
  cancelled: 'bg-red-400',
};

export default function DashboardCalendar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [appointmentToReschedule, setAppointmentToReschedule] = useState<Appointment | null>(null);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [blockForm, setBlockForm] = useState({ start_date: '', end_date: '', reason: '' });
  const [loadingBlock, setLoadingBlock] = useState(false);
  const [rescheduleForm, setRescheduleForm] = useState({ date: '', time: '' });
  const [loadingReschedule, setLoadingReschedule] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  
  const { appointments, loading, updateStatus, deleteAppointment, refetch } = useMyAppointments();
  const { center } = useMyCenter();
  const { blockedPeriods, addBlockedPeriod, removeBlockedPeriod: deleteBlockedPeriod } = useBlockedPeriods(center?.id);

  // Calendar navigation
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };

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
      toast.error('Erreur lors du déplacement');
    } else {
      toast.success('Rendez-vous déplacé');
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
      toast.error('Erreur lors du blocage');
    } else {
      toast.success('Période bloquée');
      setShowBlockDialog(false);
      setBlockForm({ start_date: '', end_date: '', reason: '' });
    }
  };

  // Remove blocked period
  const removeBlockedPeriod = async (id: string) => {
    const { error } = await deleteBlockedPeriod(id);
    if (error) {
      toast.error('Erreur lors de la suppression');
    } else {
      toast.success('Période débloquée');
    }
  };

  // Get selected day appointments
  const selectedDayAppointments = selectedDate ? getAppointmentsForDay(selectedDate) : [];

  const handleUpdateStatus = async (id: string, status: Appointment['status']) => {
    const { error } = await updateStatus(id, status);
    if (error) {
      toast.error('Erreur lors de la mise à jour');
    } else {
      toast.success('Statut mis à jour');
    }
  };

  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <MobileSidebar open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} />
      
      <div className="lg:pl-64">
        <DashboardHeader 
          title="Calendrier" 
          subtitle={center?.name}
          onMenuClick={() => setMobileMenuOpen(true)}
        />
        
        <main className="p-4 lg:p-8 max-w-7xl">
          {/* Header with navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" onClick={prevMonth} className="rounded-xl">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground min-w-[180px] text-center capitalize">
                {format(currentMonth, 'MMMM yyyy', { locale: fr })}
              </h2>
              <Button variant="outline" size="icon" onClick={nextMonth} className="rounded-xl">
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={goToToday} className="rounded-xl">
                <CalendarIcon className="w-4 h-4 mr-2" />
                Aujourd'hui
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
                className="rounded-xl"
              >
                <Ban className="w-4 h-4 mr-2" />
                Bloquer période
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr_360px] gap-6">
            {/* Calendar Grid */}
            <Card className="p-4 sm:p-6 rounded-2xl">
              {/* Week days header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map(day => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Days grid */}
              <div className="grid grid-cols-7 gap-1">
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
                        "relative aspect-square p-1 sm:p-2 rounded-xl transition-all flex flex-col items-center",
                        !isCurrentMonth && "opacity-30",
                        isCurrentMonth && !isSelected && "hover:bg-secondary",
                        isSelected && "bg-primary text-primary-foreground",
                        isToday(day) && !isSelected && "ring-2 ring-primary/50",
                        blocked && "bg-red-50 dark:bg-red-950/30",
                        isPast && "opacity-60"
                      )}
                    >
                      <span className={cn(
                        "text-sm sm:text-base font-medium",
                        isSelected ? "text-primary-foreground" : "text-foreground"
                      )}>
                        {format(day, 'd')}
                      </span>
                      
                      {/* Appointment indicators */}
                      {dayAppointments.length > 0 && (
                        <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                          {dayAppointments.slice(0, 3).map((apt, i) => (
                            <div
                              key={i}
                              className={cn(
                                "w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full",
                                isSelected ? "bg-primary-foreground/80" : statusColors[apt.status] || 'bg-primary'
                              )}
                            />
                          ))}
                          {dayAppointments.length > 3 && (
                            <span className={cn(
                              "text-[10px] font-medium",
                              isSelected ? "text-primary-foreground" : "text-muted-foreground"
                            )}>
                              +{dayAppointments.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                      
                      {blocked && (
                        <Ban className={cn(
                          "w-3 h-3 absolute bottom-1 right-1",
                          isSelected ? "text-primary-foreground/70" : "text-red-400"
                        )} />
                      )}
                    </button>
                  );
                })}
              </div>
              
              {/* Legend */}
              <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  En attente
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  Confirmé
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-3 h-3 rounded-full bg-slate-400" />
                  Terminé
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Ban className="w-3 h-3 text-red-400" />
                  Bloqué
                </div>
              </div>
            </Card>

            {/* Side panel - Selected day details */}
            <div className="space-y-4">
              <Card className="p-5 rounded-2xl">
                <h3 className="font-semibold text-lg text-foreground mb-4">
                  {selectedDate 
                    ? format(selectedDate, "EEEE d MMMM", { locale: fr }) 
                    : "Sélectionnez un jour"
                  }
                </h3>
                
                {selectedDate && (
                  <>
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : selectedDayAppointments.length > 0 ? (
                      <div className="space-y-3">
                        {selectedDayAppointments.sort((a, b) => 
                          a.appointment_time.localeCompare(b.appointment_time)
                        ).map(apt => (
                          <div 
                            key={apt.id}
                            className="group p-3 bg-secondary/50 rounded-xl hover:bg-secondary transition-colors cursor-pointer"
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
                                <div className="flex items-center gap-2 mb-1">
                                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                                  <span className="font-semibold text-foreground">
                                    {apt.appointment_time.slice(0, 5)}
                                  </span>
                                  <div className={cn(
                                    "w-2 h-2 rounded-full",
                                    statusColors[apt.status]
                                  )} />
                                </div>
                                <div className="flex items-center gap-2">
                                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                                  <span className="text-sm text-foreground truncate">
                                    {apt.client_name}
                                  </span>
                                </div>
                                {apt.pack && (
                                  <p className="text-xs text-muted-foreground mt-1 ml-5">
                                    {apt.pack.name} • {apt.pack.price}€
                                  </p>
                                )}
                              </div>
                              <GripVertical className="w-4 h-4 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <CalendarIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">Aucun rendez-vous ce jour</p>
                      </div>
                    )}
                  </>
                )}
              </Card>

              {/* Blocked periods */}
              {blockedPeriods.length > 0 && (
                <Card className="p-5 rounded-2xl">
                  <h3 className="font-semibold text-foreground mb-3">Périodes bloquées</h3>
                  <div className="space-y-2">
                    {blockedPeriods.map(period => (
                      <div key={period.id} className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-950/30 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {format(parseISO(period.start_date), "d MMM", { locale: fr })} → {format(parseISO(period.end_date), "d MMM", { locale: fr })}
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
        </main>
      </div>

      {/* Appointment Details Dialog */}
      <Dialog open={!!selectedAppointment && !appointmentToReschedule} onOpenChange={(open) => {
        if (!open) {
          setSelectedAppointment(null);
        }
      }}>
        <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
            <DialogTitle>Détails du rendez-vous</DialogTitle>
            <DialogDescription className="sr-only">
              Voir et gérer les détails de cette réservation
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
                    {format(parseISO(selectedAppointment.appointment_date), "d MMM", { locale: fr })} à {selectedAppointment.appointment_time.slice(0, 5)}
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
                  Déplacer
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
                    Confirmer
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
                    Terminer
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
                  Annuler le rendez-vous
                </Button>
              )}
              
              {/* Delete button */}
              <div className="pt-2 border-t border-border">
                <Button
                  variant="ghost"
                  className="w-full rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50"
                  disabled={loadingDelete}
                  onClick={async () => {
                    if (confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
                      setLoadingDelete(true);
                      const { error } = await deleteAppointment(selectedAppointment.id);
                      setLoadingDelete(false);
                      if (error) {
                        toast.error('Erreur lors de la suppression');
                      } else {
                        toast.success('Rendez-vous supprimé');
                        setSelectedAppointment(null);
                      }
                    }
                  }}
                >
                  {loadingDelete ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                  Supprimer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog - Clean dedicated dialog */}
      <Dialog open={!!appointmentToReschedule} onOpenChange={(open) => {
        if (!open) {
          setAppointmentToReschedule(null);
        }
      }}>
        <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
            <DialogTitle className="text-xl">Déplacer la réservation</DialogTitle>
            <DialogDescription>
              {appointmentToReschedule 
                ? `Déplacer la réservation de ${appointmentToReschedule.client_name}`
                : 'Choisissez une nouvelle date et heure'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Nouvelle date</Label>
              <Input
                type="date"
                value={rescheduleForm.date}
                onChange={(e) => setRescheduleForm(prev => ({ ...prev, date: e.target.value }))}
                className="h-12 rounded-xl text-base"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Nouvelle heure</Label>
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
              Annuler
            </Button>
            <Button 
              onClick={handleReschedule}
              disabled={loadingReschedule || !rescheduleForm.date || !rescheduleForm.time}
              className="rounded-xl flex-1 sm:flex-none min-w-[120px]"
            >
              {loadingReschedule ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Déplacer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Block Period Dialog */}
      <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
            <DialogTitle>Bloquer une période</DialogTitle>
            <DialogDescription className="sr-only">
              Définir une période pendant laquelle aucun rendez-vous ne peut être pris
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date de début</Label>
                <Input
                  type="date"
                  value={blockForm.start_date}
                  onChange={(e) => setBlockForm(prev => ({ ...prev, start_date: e.target.value }))}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Date de fin</Label>
                <Input
                  type="date"
                  value={blockForm.end_date}
                  onChange={(e) => setBlockForm(prev => ({ ...prev, end_date: e.target.value }))}
                  className="h-11 rounded-xl"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Raison (optionnel)</Label>
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
              Annuler
            </Button>
            <Button 
              onClick={handleBlockPeriod}
              disabled={loadingBlock || !blockForm.start_date || !blockForm.end_date}
              className="rounded-xl"
            >
              {loadingBlock ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Bloquer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
