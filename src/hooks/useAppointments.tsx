import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMyCenter } from './useCenter';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

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

  const createAppointment = async (data: {
    pack_id?: string | null;
    client_name: string;
    client_email: string;
    client_phone: string;
    vehicle_type: string;
    appointment_date: string;
    appointment_time: string;
    notes?: string;
  }) => {
    if (!center) return { error: 'Aucun centre trouvé' };
    
    const { data: newAppointment, error } = await supabase
      .from('appointments')
      .insert({
        ...data,
        center_id: center.id,
      })
      .select(`
        *,
        pack:packs(id, name, price, duration)
      `)
      .single();

    if (!error && newAppointment) {
      setAppointments([...appointments, newAppointment as Appointment].sort((a, b) => {
        const dateCompare = a.appointment_date.localeCompare(b.appointment_date);
        if (dateCompare !== 0) return dateCompare;
        return a.appointment_time.localeCompare(b.appointment_time);
      }));
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

  return { appointments, loading, updateStatus, createAppointment, deleteAppointment };
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
    // Additional data for email
    pack_name?: string;
    variant_name?: string;
    price?: number;
  }) => {
    setLoading(true);
    
    const { error } = await supabase
      .from('appointments')
      .insert({
        center_id: data.center_id,
        pack_id: data.pack_id,
        client_name: data.client_name,
        client_email: data.client_email,
        client_phone: data.client_phone,
        client_address: data.client_address,
        vehicle_type: data.vehicle_type,
        appointment_date: data.appointment_date,
        appointment_time: data.appointment_time,
        notes: data.notes,
      });

    // Send confirmation emails in background (fire-and-forget)
    // The appointment is already created - email failure should NOT affect the user experience
    if (!error && data.pack_name && data.price !== undefined) {
      // Use fire-and-forget pattern - no await, wrapped in IIFE
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
            }),
          });
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.warn('[Booking Email] Failed to send:', response.status, errorData);
          } else {
            console.log('[Booking Email] Confirmation emails sent successfully');
          }
        } catch (emailError) {
          // Log error but don't affect the booking flow
          console.warn('[Booking Email] Network error:', emailError);
        }
      })();
    }

    setLoading(false);
    return { error: error?.message || null };
  };

  return { createAppointment, loading };
}
