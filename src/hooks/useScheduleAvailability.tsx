import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMyCenter } from './useCenter';
import { toast } from 'sonner';

interface TimeSlot {
  id?: string; // DB id if exists
  start: string;
  end: string;
}

interface DaySchedule {
  enabled: boolean;
  slots: TimeSlot[];
}

export interface Schedule {
  [key: string]: DaySchedule;
}

// Mapping jour français -> day_of_week (0=dimanche comme en JS)
const dayToNumber: { [key: string]: number } = {
  dimanche: 0,
  lundi: 1,
  mardi: 2,
  mercredi: 3,
  jeudi: 4,
  vendredi: 5,
  samedi: 6,
};

const numberToDay: { [key: number]: string } = {
  0: 'dimanche',
  1: 'lundi',
  2: 'mardi',
  3: 'mercredi',
  4: 'jeudi',
  5: 'vendredi',
  6: 'samedi',
};

const defaultSchedule: Schedule = {
  lundi: { enabled: true, slots: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '18:00' }] },
  mardi: { enabled: true, slots: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '18:00' }] },
  mercredi: { enabled: true, slots: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '18:00' }] },
  jeudi: { enabled: true, slots: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '18:00' }] },
  vendredi: { enabled: true, slots: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '18:00' }] },
  samedi: { enabled: true, slots: [{ start: '09:00', end: '14:00' }] },
  dimanche: { enabled: false, slots: [{ start: '09:00', end: '18:00' }] },
};

export function useScheduleAvailability() {
  const { center, loading: centerLoading } = useMyCenter();
  const [schedule, setSchedule] = useState<Schedule>(defaultSchedule);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalSchedule, setOriginalSchedule] = useState<Schedule>(defaultSchedule);

  // Charger les disponibilités depuis la DB
  useEffect(() => {
    if (centerLoading) return;
    
    if (!center) {
      setLoading(false);
      return;
    }

    const fetchAvailability = async () => {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('availability')
        .select('*')
        .eq('center_id', center.id)
        .order('day_of_week')
        .order('start_time');

      if (error) {
        console.error('Error fetching availability:', error);
        setLoading(false);
        return;
      }

      // Si pas de données, utiliser le défaut (pas encore configuré)
      if (!data || data.length === 0) {
        setSchedule(defaultSchedule);
        setOriginalSchedule(defaultSchedule);
        setLoading(false);
        return;
      }

      // Convertir les données DB en format Schedule
      const newSchedule: Schedule = {
        lundi: { enabled: false, slots: [] },
        mardi: { enabled: false, slots: [] },
        mercredi: { enabled: false, slots: [] },
        jeudi: { enabled: false, slots: [] },
        vendredi: { enabled: false, slots: [] },
        samedi: { enabled: false, slots: [] },
        dimanche: { enabled: false, slots: [] },
      };

      data.forEach(row => {
        const dayName = numberToDay[row.day_of_week];
        if (dayName) {
          newSchedule[dayName].slots.push({
            id: row.id,
            start: row.start_time.slice(0, 5), // "09:00:00" -> "09:00"
            end: row.end_time.slice(0, 5),
          });
          // Si au moins un slot enabled, le jour est enabled
          if (row.enabled) {
            newSchedule[dayName].enabled = true;
          }
        }
      });

      // Assurer qu'il y a au moins un slot par jour
      Object.keys(newSchedule).forEach(day => {
        if (newSchedule[day].slots.length === 0) {
          newSchedule[day].slots = [{ start: '09:00', end: '18:00' }];
        }
      });

      setSchedule(newSchedule);
      setOriginalSchedule(JSON.parse(JSON.stringify(newSchedule)));
      setLoading(false);
    };

    fetchAvailability();
  }, [center, centerLoading]);

  // Détecter les changements
  useEffect(() => {
    const changed = JSON.stringify(schedule) !== JSON.stringify(originalSchedule);
    setHasChanges(changed);
  }, [schedule, originalSchedule]);

  // Sauvegarder en DB
  const saveSchedule = useCallback(async () => {
    if (!center) return { error: 'Pas de centre' };
    
    setSaving(true);

    try {
      // Supprimer toutes les anciennes disponibilités
      await supabase
        .from('availability')
        .delete()
        .eq('center_id', center.id);

      // Insérer les nouvelles
      const rows: {
        center_id: string;
        day_of_week: number;
        start_time: string;
        end_time: string;
        enabled: boolean;
      }[] = [];

      Object.entries(schedule).forEach(([day, daySchedule]) => {
        const dayOfWeek = dayToNumber[day];
        daySchedule.slots.forEach(slot => {
          rows.push({
            center_id: center.id,
            day_of_week: dayOfWeek,
            start_time: slot.start,
            end_time: slot.end,
            enabled: daySchedule.enabled,
          });
        });
      });

      const { error } = await supabase
        .from('availability')
        .insert(rows);

      if (error) {
        toast.error('Erreur lors de la sauvegarde');
        setSaving(false);
        return { error: error.message };
      }

      toast.success('Disponibilités enregistrées');
      setOriginalSchedule(JSON.parse(JSON.stringify(schedule)));
      setHasChanges(false);
      setSaving(false);
      return { error: null };
    } catch (err) {
      setSaving(false);
      return { error: 'Erreur inattendue' };
    }
  }, [center, schedule]);

  // Actions sur le schedule
  const toggleDay = (day: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], enabled: !prev[day].enabled },
    }));
  };

  const updateSlotTime = (day: string, slotIndex: number, field: 'start' | 'end', value: string) => {
    setSchedule(prev => {
      const newSlots = [...prev[day].slots];
      newSlots[slotIndex] = { ...newSlots[slotIndex], [field]: value };
      return {
        ...prev,
        [day]: { ...prev[day], slots: newSlots },
      };
    });
  };

  const addSlot = (day: string) => {
    setSchedule(prev => {
      const lastSlot = prev[day].slots[prev[day].slots.length - 1];
      const newStart = lastSlot ? lastSlot.end : '09:00';
      const [hours] = newStart.split(':').map(Number);
      const newEnd = `${Math.min(hours + 4, 23).toString().padStart(2, '0')}:00`;
      
      return {
        ...prev,
        [day]: {
          ...prev[day],
          slots: [...prev[day].slots, { start: newStart, end: newEnd }],
        },
      };
    });
  };

  const removeSlot = (day: string, slotIndex: number) => {
    setSchedule(prev => {
      if (prev[day].slots.length <= 1) return prev;
      
      return {
        ...prev,
        [day]: {
          ...prev[day],
          slots: prev[day].slots.filter((_, i) => i !== slotIndex),
        },
      };
    });
  };

  return {
    schedule,
    loading: loading || centerLoading,
    saving,
    hasChanges,
    toggleDay,
    updateSlotTime,
    addSlot,
    removeSlot,
    saveSchedule,
  };
}
