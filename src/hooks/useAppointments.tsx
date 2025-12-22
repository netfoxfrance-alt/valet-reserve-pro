import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMyCenter } from './useCenter';

export interface Appointment {
  id: string;
  center_id: string;
  pack_id: string | null;
  client_name: string;
  client_email: string;
  client_phone: string;
  vehicle_type: string;
  appointment_date: string;
  appointment_time: string;
  notes: string | null;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  pack?: {
    id: string;
    name: string;
    price: number;
    duration: string | null;
  };
}

export function useMyAppointments() {
  const { center } = useMyCenter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!center) {
      setLoading(false);
      return;
    }

    const fetchAppointments = async () => {
      const { data } = await supabase
        .from('appointments')
        .select(`
          *,
          pack:packs(id, name, price, duration)
        `)
        .eq('center_id', center.id)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });

      setAppointments((data as Appointment[]) || []);
      setLoading(false);
    };

    fetchAppointments();
  }, [center]);

  const updateStatus = async (id: string, status: Appointment['status']) => {
    const { error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id);

    if (!error) {
      setAppointments(appointments.map(a => 
        a.id === id ? { ...a, status } : a
      ));
    }
    return { error: error?.message || null };
  };

  return { appointments, loading, updateStatus };
}

// Hook pour créer un rendez-vous (côté client)
export function useCreateAppointment() {
  const [loading, setLoading] = useState(false);

  const createAppointment = async (data: {
    center_id: string;
    pack_id: string;
    client_name: string;
    client_email: string;
    client_phone: string;
    vehicle_type: string;
    appointment_date: string;
    appointment_time: string;
    notes?: string;
  }) => {
    setLoading(true);
    
    const { error } = await supabase
      .from('appointments')
      .insert(data);

    setLoading(false);
    return { error: error?.message || null };
  };

  return { createAppointment, loading };
}
