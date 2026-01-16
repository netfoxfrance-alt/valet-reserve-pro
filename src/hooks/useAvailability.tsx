import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO, isToday, isBefore, addDays } from 'date-fns';

interface AvailabilitySlot {
  id: string;
  day_of_week: number; // 0 = dimanche, 1 = lundi, etc.
  start_time: string;
  end_time: string;
  enabled: boolean;
}

interface BlockedPeriod {
  id: string;
  start_date: string;
  end_date: string;
  reason: string | null;
}

interface ExistingAppointment {
  appointment_date: string;
  appointment_time: string;
}

// Génère les créneaux horaires d'une heure entre start et end
function generateTimeSlots(startTime: string, endTime: string): string[] {
  const slots: string[] = [];
  const [startHour] = startTime.split(':').map(Number);
  const [endHour] = endTime.split(':').map(Number);
  
  for (let h = startHour; h < endHour; h++) {
    slots.push(`${h.toString().padStart(2, '0')}:00`);
  }
  
  return slots;
}

// Vérifie si un créneau est passé (avec buffer de 30 min)
function isTimeSlotPast(time: string, date: Date): boolean {
  if (!isToday(date)) return false;
  
  const now = new Date();
  const [hours, minutes] = time.split(':').map(Number);
  const slotTime = new Date();
  slotTime.setHours(hours, minutes, 0, 0);
  
  const bufferTime = new Date(now.getTime() + 30 * 60 * 1000);
  return slotTime <= bufferTime;
}

// Vérifie si une date est dans une période bloquée
function isDateInBlockedPeriod(date: Date, blockedPeriods: BlockedPeriod[]): boolean {
  const dateStr = format(date, 'yyyy-MM-dd');
  return blockedPeriods.some(period => {
    return dateStr >= period.start_date && dateStr <= period.end_date;
  });
}

export function useCenterAvailability(centerId: string | null | undefined) {
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [blockedPeriods, setBlockedPeriods] = useState<BlockedPeriod[]>([]);
  const [appointments, setAppointments] = useState<ExistingAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!centerId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      
      // Fetch all data in parallel
      const [availabilityRes, blockedRes, appointmentsRes] = await Promise.all([
        supabase
          .from('availability')
          .select('*')
          .eq('center_id', centerId)
          .eq('enabled', true),
        supabase
          .from('blocked_periods')
          .select('*')
          .eq('center_id', centerId),
        supabase
          .from('appointments')
          .select('appointment_date, appointment_time')
          .eq('center_id', centerId)
          .neq('status', 'cancelled')
          .gte('appointment_date', format(new Date(), 'yyyy-MM-dd'))
      ]);

      if (availabilityRes.data) setAvailability(availabilityRes.data);
      if (blockedRes.data) setBlockedPeriods(blockedRes.data);
      if (appointmentsRes.data) setAppointments(appointmentsRes.data);
      
      setLoading(false);
    };

    fetchData();
  }, [centerId]);

  // Retourne les créneaux disponibles pour une date donnée
  const getAvailableSlotsForDate = (date: Date): string[] => {
    // 1. Si la date est passée, aucun créneau
    if (isBefore(date, new Date()) && !isToday(date)) {
      return [];
    }

    // 2. Si la date est dans une période bloquée, aucun créneau
    if (isDateInBlockedPeriod(date, blockedPeriods)) {
      return [];
    }

    // 3. Récupérer le jour de la semaine (JS: 0=dimanche, 1=lundi...)
    const dayOfWeek = date.getDay();

    // 4. Trouver les plages horaires pour ce jour
    const daySlots = availability.filter(slot => slot.day_of_week === dayOfWeek && slot.enabled);
    
    if (daySlots.length === 0) {
      return [];
    }

    // 5. Générer tous les créneaux possibles
    let allSlots: string[] = [];
    daySlots.forEach(slot => {
      const generated = generateTimeSlots(slot.start_time, slot.end_time);
      allSlots = [...allSlots, ...generated];
    });

    // Dédupliquer et trier
    allSlots = [...new Set(allSlots)].sort();

    // 6. Filtrer les créneaux passés pour aujourd'hui
    allSlots = allSlots.filter(time => !isTimeSlotPast(time, date));

    // 7. Filtrer les créneaux déjà pris
    const dateStr = format(date, 'yyyy-MM-dd');
    const bookedTimes = appointments
      .filter(apt => apt.appointment_date === dateStr)
      .map(apt => apt.appointment_time.slice(0, 5)); // "09:00:00" -> "09:00"

    allSlots = allSlots.filter(time => !bookedTimes.includes(time));

    return allSlots;
  };

  // Vérifie si un jour a des créneaux disponibles (pour désactiver les jours sans dispo)
  const isDayAvailable = (date: Date): boolean => {
    if (isBefore(date, new Date()) && !isToday(date)) {
      return false;
    }
    if (isDateInBlockedPeriod(date, blockedPeriods)) {
      return false;
    }
    const dayOfWeek = date.getDay();
    return availability.some(slot => slot.day_of_week === dayOfWeek && slot.enabled);
  };

  return {
    loading,
    availability,
    blockedPeriods,
    getAvailableSlotsForDate,
    isDayAvailable
  };
}

// Hook pour gérer les périodes bloquées (CRUD)
export function useBlockedPeriods(centerId: string | null | undefined) {
  const [blockedPeriods, setBlockedPeriods] = useState<BlockedPeriod[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBlockedPeriods = async () => {
    if (!centerId) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('blocked_periods')
      .select('*')
      .eq('center_id', centerId)
      .order('start_date', { ascending: true });

    if (data) setBlockedPeriods(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchBlockedPeriods();
  }, [centerId]);

  const addBlockedPeriod = async (startDate: string, endDate: string, reason?: string) => {
    if (!centerId) return { error: 'No center' };

    const { error } = await supabase
      .from('blocked_periods')
      .insert({
        center_id: centerId,
        start_date: startDate,
        end_date: endDate,
        reason: reason || null
      });

    if (!error) {
      await fetchBlockedPeriods();
    }

    return { error: error?.message || null };
  };

  const removeBlockedPeriod = async (id: string) => {
    const { error } = await supabase
      .from('blocked_periods')
      .delete()
      .eq('id', id);

    if (!error) {
      setBlockedPeriods(prev => prev.filter(p => p.id !== id));
    }

    return { error: error?.message || null };
  };

  return {
    blockedPeriods,
    loading,
    addBlockedPeriod,
    removeBlockedPeriod,
    refetch: fetchBlockedPeriods
  };
}
