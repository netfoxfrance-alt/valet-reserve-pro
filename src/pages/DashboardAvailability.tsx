import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { MobileSidebar } from '@/components/dashboard/MobileSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Plus, X, Coffee, Loader2, Car } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useScheduleAvailability } from '@/hooks/useScheduleAvailability';
import { useMyCenter } from '@/hooks/useCenter';
import { useTranslation } from 'react-i18next';

const dayOrder = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

export default function DashboardAvailability() {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { center, updateCenter } = useMyCenter();
  const [appointmentBuffer, setAppointmentBuffer] = useState('0');
  const [bufferSaving, setBufferSaving] = useState(false);
  const {
    schedule,
    loading,
    saving,
    hasChanges,
    toggleDay,
    updateSlotTime,
    addSlot,
    removeSlot,
    saveSchedule,
  } = useScheduleAvailability();

  const bufferOptions = [
    { value: '0', label: t('availability.bufferNone') },
    { value: '15', label: t('availability.buffer15') },
    { value: '30', label: t('availability.buffer30') },
    { value: '45', label: t('availability.buffer45') },
    { value: '60', label: t('availability.buffer60') },
    { value: '90', label: t('availability.buffer90') },
    { value: '120', label: t('availability.buffer120') },
  ];
  
  // Load buffer from center customization
  useEffect(() => {
    if (center?.customization?.settings?.appointment_buffer !== undefined) {
      setAppointmentBuffer(String(center.customization.settings.appointment_buffer));
    }
  }, [center]);
  
  const handleBufferChange = async (value: string) => {
    if (!center) return;
    setAppointmentBuffer(value);
    setBufferSaving(true);
    
    const currentCustomization = center.customization;
    
    await updateCenter({
      customization: {
        ...currentCustomization,
        settings: {
          ...currentCustomization.settings,
          appointment_buffer: parseInt(value, 10),
        },
      },
    });
    
    setBufferSaving(false);
  };

  const formatSlotsPreview = (slots: { start: string; end: string }[]) => {
    if (slots.length === 1) {
      return `${slots[0].start.replace(':', 'h')} - ${slots[0].end.replace(':', 'h')}`;
    }
    return slots.map(s => `${s.start.replace(':', 'h')}-${s.end.replace(':', 'h')}`).join(' · ');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardSidebar />
        <MobileSidebar open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} />
        <div className="lg:pl-64">
          <DashboardHeader 
            title={t('availability.title')} 
            onMenuClick={() => setMobileMenuOpen(true)}
          />
          <main className="p-4 lg:p-8 flex items-center justify-center min-h-[50vh]">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </main>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <MobileSidebar open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} />
      
      <div className="lg:pl-64">
        <DashboardHeader 
          title={t('availability.title')} 
          onMenuClick={() => setMobileMenuOpen(true)}
        />
        
        <main className="p-4 lg:p-8 max-w-3xl">
          {/* Buffer setting */}
          <Card variant="elevated" className="p-5 mb-6 rounded-2xl">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/50 rounded-xl flex items-center justify-center shrink-0">
                <Car className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <Label htmlFor="buffer" className="text-base font-medium">
                  {t('availability.travelTime')}
                </Label>
                <p className="text-sm text-muted-foreground mt-0.5 mb-3">
                  {t('availability.travelTimeDesc')}
                </p>
                <Select value={appointmentBuffer} onValueChange={handleBufferChange} disabled={bufferSaving}>
                  <SelectTrigger id="buffer" className="w-48 rounded-xl">
                    <SelectValue placeholder="..." />
                  </SelectTrigger>
                  <SelectContent>
                    {bufferOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
          
          <div className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-1 sm:mb-2">{t('availability.openingHours')}</h2>
            <p className="text-sm text-muted-foreground">{t('availability.openingHoursDesc')}</p>
          </div>
          
          <Card variant="elevated" className="divide-y divide-border rounded-2xl overflow-hidden">
            {dayOrder.map((day) => {
              const daySchedule = schedule[day];
              if (!daySchedule) return null;
              
              return (
                <div key={day} className="p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200",
                          daySchedule.enabled 
                            ? "bg-emerald-500 text-white shadow-sm" 
                            : "bg-muted border-2 border-border"
                        )}
                      >
                        {daySchedule.enabled && (
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                      <span className={cn(
                        "font-medium text-sm sm:text-base transition-colors",
                        daySchedule.enabled ? "text-foreground" : "text-muted-foreground"
                      )}>
                        <span className="sm:hidden">{t(`availability.daysShort.${day}`)}</span>
                        <span className="hidden sm:inline">{t(`availability.days.${day}`)}</span>
                      </span>
                    </div>
                    
                    {daySchedule.enabled && (
                      <span className="text-xs text-emerald-600 font-medium hidden sm:block">
                        {formatSlotsPreview(daySchedule.slots)}
                      </span>
                    )}
                  </div>
                  
                  {daySchedule.enabled ? (
                    <div className="space-y-2 ml-0 sm:ml-12">
                      {daySchedule.slots.map((slot, slotIndex) => (
                        <div key={slotIndex} className="flex items-center gap-2">
                          {slotIndex > 0 && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mr-1">
                              <Coffee className="w-3 h-3" />
                            </div>
                          )}
                          <input
                            type="time"
                            value={slot.start}
                            onChange={(e) => updateSlotTime(day, slotIndex, 'start', e.target.value)}
                            className="flex-1 sm:flex-none sm:w-28 px-2 sm:px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
                          />
                          <span className="text-muted-foreground text-sm">{t('common.to')}</span>
                          <input
                            type="time"
                            value={slot.end}
                            onChange={(e) => updateSlotTime(day, slotIndex, 'end', e.target.value)}
                            className="flex-1 sm:flex-none sm:w-28 px-2 sm:px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
                          />
                          {daySchedule.slots.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeSlot(day, slotIndex)}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addSlot(day)}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mt-2"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{t('availability.addBreak')}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="ml-0 sm:ml-12">
                      <span className="text-muted-foreground text-sm">{t('availability.closed')}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </Card>
          
          <div className="mt-6 flex justify-end">
            <Button 
              variant="premium" 
              className="w-full sm:w-auto"
              onClick={saveSchedule}
              disabled={saving || !hasChanges}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('common.saving')}
                </>
              ) : (
                t('availability.saveChanges')
              )}
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}
