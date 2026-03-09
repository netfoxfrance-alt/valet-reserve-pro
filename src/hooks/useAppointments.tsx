import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMyCenter } from './useCenter';
import { findOrCreateClient } from '@/lib/clientService';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

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
  deposit_amount: number | null;
  deposit_status: string;
  deposit_checkout_session_id: string | null;
  deposit_refund_status: string;
  deposit_payment_intent_id: string | null;
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
      const appointment = appointments.find(a => a.id === id);
      setAppointments(appointments.map(a => 
        a.id === id ? { ...a, status } : a
      ));

      // Auto-refund deposit when pro cancels an appointment with a paid deposit
      if (status === 'cancelled' && appointment?.deposit_status === 'paid' && appointment?.deposit_refund_status !== 'refunded') {
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          const token = sessionData?.session?.access_token;
          if (token) {
            const { error: refundError } = await supabase.functions.invoke('refund-deposit', {
              headers: { Authorization: `Bearer ${token}` },
              body: { appointment_id: id },
            });
            if (!refundError) {
              setAppointments(prev => prev.map(a => 
                a.id === id ? { ...a, status, deposit_refund_status: 'refunded' } : a
              ));
            }
          }
        } catch (refundErr) {
          console.warn('[Auto-refund] Error:', refundErr);
        }
      }
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
        status: 'confirmed', // Pro-created appointments are auto-confirmed
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
            // Get session token for authenticated email requests
            const { data: sessionData } = await supabase.auth.getSession();
            const token = sessionData?.session?.access_token;
            if (!token) return;

            await fetch(`${SUPABASE_URL}/functions/v1/send-booking-emails`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
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

function timeToMin(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + (m || 0);
}

// Hook pour créer un rendez-vous (côté client)
export function useCreateAppointment() {
  const [loading, setLoading] = useState(false);

  const formatAppointmentError = (error: unknown): string => {
    let raw = '';
    if (error instanceof Error) {
      raw = error.message;
    } else if (error && typeof error === 'object' && 'message' in error) {
      raw = String((error as { message: string }).message);
    } else if (typeof error === 'string') {
      raw = error;
    }
    if (!raw) return 'Impossible de créer le rendez-vous. Veuillez réessayer.';

    if (raw.includes('violates row-level security')) {
      return 'Impossible de créer le rendez-vous (droits d\'accès).';
    }

    if (raw.includes('duplicate key')) {
      return 'Ce rendez-vous semble déjà exister. Veuillez réessayer.';
    }

    return raw;
  };

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
    skip_email?: boolean; // When deposit is enabled, skip email here (webhook handles it)
  }) => {
    setLoading(true);

    try {
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

      // Anti-overlap check: verify no existing appointment conflicts with this time slot
      const { data: existingApts, error: overlapQueryError } = await supabase
        .from('appointments')
        .select('appointment_time, duration_minutes, client_name')
        .eq('center_id', data.center_id)
        .eq('appointment_date', data.appointment_date)
        .neq('status', 'cancelled')
        .neq('status', 'refused');

      if (overlapQueryError) {
        return { error: formatAppointmentError(overlapQueryError), appointmentId: null };
      }

      if (existingApts && existingApts.length > 0) {
        const newStartMin = timeToMin(data.appointment_time);
        const newEndMin = newStartMin + duration_minutes;

        const overlap = existingApts.find(apt => {
          const aptStartMin = timeToMin(apt.appointment_time.slice(0, 5));
          const aptEndMin = aptStartMin + (apt.duration_minutes || 60);
          return newStartMin < aptEndMin && newEndMin > aptStartMin;
        });

        if (overlap) {
          return { error: 'Ce créneau est déjà occupé. Veuillez choisir un autre horaire.', appointmentId: null };
        }
      }

      // Note: On réservation publique (non authentifié), on ne peut pas créer de client
      // car la table clients est protégée par RLS (propriétaire seulement)
      // Le client_id sera null et pourra être associé plus tard par le pro

      // Store the final price (variant or base pack price) in custom_price for accurate stats
      const finalPrice = data.price !== undefined ? data.price : null;

      // Ensure all required fields have values for RLS policy
      const insertPayload = {
        center_id: data.center_id,
        pack_id: data.pack_id || null,
        client_id: data.client_id || null,
        custom_service_id: data.custom_service_id || null,
        client_name: data.client_name || 'Client',
        client_email: data.client_email || '',
        client_phone: data.client_phone || '',
        client_address: data.client_address || null,
        vehicle_type: data.vehicle_type || 'berline',
        appointment_date: data.appointment_date,
        appointment_time: data.appointment_time,
        notes: data.notes || null,
        duration_minutes,
        custom_price: data.custom_price !== undefined && data.custom_price !== null ? data.custom_price : finalPrice,
        status: 'pending_validation' as const,
      };

      // Validate required fields before insert to give better error messages
      if (!insertPayload.client_name || !insertPayload.client_email || !insertPayload.client_phone) {
        return { error: 'Veuillez remplir tous les champs obligatoires (nom, email, téléphone).', appointmentId: null };
      }

      const { data: insertedData, error } = await supabase
        .from('appointments')
        .insert(insertPayload)
        .select('id')
        .single();

      // Send "request received" email only when no deposit (deposit flow sends confirmation via webhook)
      if (!error && insertedData && data.pack_name && data.price !== undefined && !data.skip_email) {
        (async () => {
          try {
            const response = await fetch(`${SUPABASE_URL}/functions/v1/send-booking-emails`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
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

      return { error: error ? formatAppointmentError(error) : null, appointmentId: insertedData?.id || null };
    } catch (err) {
      console.error('[CreateAppointment] Unexpected error:', err);
      return { error: formatAppointmentError(err), appointmentId: null };
    } finally {
      setLoading(false);
    }
  };

  return { createAppointment, loading };
}
