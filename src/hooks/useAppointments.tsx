import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMyCenter } from './useCenter';
import { findOrCreateClient } from '@/lib/clientService';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export interface Appointment {
  id: string;
  center_id: string;
  pack_id: string | null;
  client_id: string | null;
  client_name: string;
  client_email: string;
  client_phone: string;
  client_address: string | null;
  vehicle_type: string;
  appointment_date: string;
  appointment_time: string;
  notes: string | null;
  status: 'pending_validation' | 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'refused';
  created_at: string;
  updated_at: string;
  duration_minutes: number | null;
  custom_service_id: string | null;
  custom_price: number | null;
  pack?: {
    id: string;
    name: string;
    price: number;
    duration: string | null;
  };
  custom_service?: {
    id: string;
    name: string;
    price: number;
    duration_minutes: number;
  } | null;
}

interface UseMyAppointmentsOptions {
  page?: number;
  pageSize?: number;
}

export function useMyAppointments(options: UseMyAppointmentsOptions = {}) {
  const { page = 0, pageSize = 1000 } = options; // Default to 1000 for backwards compatibility
  const { center } = useMyCenter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = useCallback(async () => {
    if (!center) {
      setLoading(false);
      return;
    }

    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, count } = await supabase
      .from('appointments')
      .select(`
        *,
        pack:packs(id, name, price, duration),
        custom_service:custom_services(id, name, price, duration_minutes)
      `, { count: 'exact' })
      .eq('center_id', center.id)
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true })
      .range(from, to);

    setAppointments((data as Appointment[]) || []);
    setTotalCount(count || 0);
    setLoading(false);
  }, [center, page, pageSize]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

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

  const createAppointment = async (data: {
    pack_id?: string | null;
    client_id?: string | null;
    client_name: string;
    client_email: string;
    client_phone: string;
    client_address?: string;
    vehicle_type: string;
    appointment_date: string;
    appointment_time: string;
    notes?: string;
    custom_service_id?: string | null;
    custom_price?: number | null;
    duration_minutes?: number;
    // For email sending
    service_name?: string;
    send_email?: boolean;
  }) => {
    if (!center) return { error: 'Aucun centre trouvé' };
    
    // Utiliser le service centralisé anti-doublon
    const { clientId } = await findOrCreateClient({
      center_id: center.id,
      name: data.client_name,
      phone: data.client_phone,
      email: data.client_email,
      address: data.client_address,
      source: 'manual',
    });
    
    const { data: newAppointment, error } = await supabase
      .from('appointments')
      .insert({
        center_id: center.id,
        pack_id: data.pack_id || null,
        client_id: clientId,
        client_name: data.client_name,
        client_email: data.client_email,
        client_phone: data.client_phone,
        client_address: data.client_address || null,
        vehicle_type: data.vehicle_type,
        appointment_date: data.appointment_date,
        appointment_time: data.appointment_time,
        notes: data.notes || null,
        custom_service_id: data.custom_service_id || null,
        custom_price: data.custom_price || null,
        duration_minutes: data.duration_minutes || 60,
      })
      .select(`
        *,
        pack:packs(id, name, price, duration),
        custom_service:custom_services(id, name, price, duration_minutes)
      `)
      .single();

    if (!error && newAppointment) {
      setAppointments([...appointments, newAppointment as Appointment].sort((a, b) => {
        const dateCompare = a.appointment_date.localeCompare(b.appointment_date);
        if (dateCompare !== 0) return dateCompare;
        return a.appointment_time.localeCompare(b.appointment_time);
      }));
      
      // Send confirmation email if requested (for custom services)
      if (data.send_email && data.service_name && data.custom_price !== undefined && data.client_email) {
        (async () => {
          try {
            await fetch(`${SUPABASE_URL}/functions/v1/send-booking-emails`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_KEY}`,
              },
              body: JSON.stringify({
                center_id: center.id,
                client_name: data.client_name,
                client_email: data.client_email,
                client_phone: data.client_phone,
                pack_name: data.service_name,
                price: data.custom_price,
                appointment_date: data.appointment_date,
                appointment_time: data.appointment_time,
                notes: data.notes,
              }),
            });
          } catch (emailError) {
            console.warn('[Custom Service Email] Error:', emailError);
          }
        })();
      }
    }
    return { error: error?.message || null };
  };

  const deleteAppointment = async (id: string) => {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);

    if (!error) {
      setAppointments(appointments.filter(a => a.id !== id));
    }
    return { error: error?.message || null };
  };

  const hasMore = totalCount > (page + 1) * pageSize;

  return { 
    appointments, 
    loading, 
    totalCount,
    hasMore,
    updateStatus, 
    createAppointment, 
    deleteAppointment,
    refetch: fetchAppointments 
  };
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
    client_address?: string;
    vehicle_type: string;
    appointment_date: string;
    appointment_time: string;
    notes?: string;
    duration?: string;
    pack_name?: string;
    variant_name?: string;
    price?: number;
    // Custom service fields for recognized clients
    custom_service_id?: string | null;
    client_id?: string | null;
    custom_price?: number | null;
  }) => {
    setLoading(true);
    
    // Convert duration string to minutes (e.g., "1h30" → 90, "2h" → 120)
    const parseDurationToMinutes = (duration?: string): number => {
      if (!duration) return 60; // default 1h
      const hoursMatch = duration.match(/(\d+)h/);
      const minutesMatch = duration.match(/(\d+)(?:min|m(?!h))/);
      const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
      const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;
      return hours * 60 + minutes || 60; // fallback to 60 if parsing fails
    };
    
    const duration_minutes = parseDurationToMinutes(data.duration);
    
    // Note: On réservation publique (non authentifié), on ne peut pas créer de client
    // car la table clients est protégée par RLS (propriétaire seulement)
    // Le client_id sera null et pourra être associé plus tard par le pro
    
    // Store the final price (variant or base pack price) in custom_price for accurate stats
    const finalPrice = data.price !== undefined ? data.price : null;
    
    const { error } = await supabase
      .from('appointments')
      .insert({
        center_id: data.center_id,
        pack_id: data.pack_id || null,
        client_id: data.client_id || null,
        custom_service_id: data.custom_service_id || null,
        client_name: data.client_name,
        client_email: data.client_email,
        client_phone: data.client_phone,
        client_address: data.client_address,
        vehicle_type: data.vehicle_type,
        appointment_date: data.appointment_date,
        appointment_time: data.appointment_time,
        notes: data.notes,
        duration_minutes,
        custom_price: data.custom_price !== undefined && data.custom_price !== null ? data.custom_price : finalPrice,
        status: 'pending_validation',
      });

    // Send "request received" email (not confirmation - waiting for pro validation)
    if (!error && data.pack_name && data.price !== undefined) {
      (async () => {
        try {
          const response = await fetch(`${SUPABASE_URL}/functions/v1/send-booking-emails`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${SUPABASE_KEY}`,
            },
            body: JSON.stringify({
              center_id: data.center_id,
              client_name: data.client_name,
              client_email: data.client_email,
              client_phone: data.client_phone,
              pack_name: data.pack_name,
              variant_name: data.variant_name,
              price: data.price,
              appointment_date: data.appointment_date,
              appointment_time: data.appointment_time,
              notes: data.notes,
              email_type: 'request_received', // New: demande en attente
            }),
          });
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.warn('[Booking Email] Failed to send:', response.status, errorData);
          }
        } catch (emailError) {
          console.warn('[Booking Email] Network error:', emailError);
        }
      })();
    }

    setLoading(false);
    return { error: error?.message || null };
  };

  return { createAppointment, loading };
}
