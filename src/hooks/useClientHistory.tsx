import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ClientAppointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes: string | null;
  duration_minutes: number | null;
  custom_price: number | null;
  pack?: {
    id: string;
    name: string;
    price: number;
    duration: string | null;
  } | null;
  custom_service?: {
    id: string;
    name: string;
    price: number;
    duration_minutes: number;
  } | null;
}

export interface ClientStats {
  totalAppointments: number;
  completedAppointments: number;
  totalRevenue: number;
  avgPrice: number;
  lastVisit: string | null;
}

export function useClientHistory(clientId: string | null) {
  const [appointments, setAppointments] = useState<ClientAppointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<ClientStats>({
    totalAppointments: 0,
    completedAppointments: 0,
    totalRevenue: 0,
    avgPrice: 0,
    lastVisit: null,
  });

  const fetchHistory = useCallback(async () => {
    if (!clientId) {
      setAppointments([]);
      return;
    }

    setLoading(true);
    const { data } = await supabase
      .from('appointments')
      .select(`
        id,
        appointment_date,
        appointment_time,
        status,
        notes,
        duration_minutes,
        custom_price,
        pack:packs(id, name, price, duration),
        custom_service:custom_services(id, name, price, duration_minutes)
      `)
      .eq('client_id', clientId)
      .order('appointment_date', { ascending: false })
      .order('appointment_time', { ascending: false });

    const history = (data as unknown as ClientAppointment[]) || [];
    setAppointments(history);

    // Compute stats
    const nonCancelled = history.filter(a => a.status !== 'cancelled');
    const completed = history.filter(a => a.status === 'completed');
    const getPrice = (a: ClientAppointment) => a.custom_price || a.pack?.price || 0;
    const totalRevenue = nonCancelled.reduce((sum, a) => sum + getPrice(a), 0);
    
    setStats({
      totalAppointments: nonCancelled.length,
      completedAppointments: completed.length,
      totalRevenue,
      avgPrice: nonCancelled.length > 0 ? Math.round(totalRevenue / nonCancelled.length) : 0,
      lastVisit: completed.length > 0 ? completed[0].appointment_date : null,
    });

    setLoading(false);
  }, [clientId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { appointments, loading, stats, refetch: fetchHistory };
}
