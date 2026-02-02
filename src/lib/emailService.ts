import { supabase } from '@/integrations/supabase/client';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export type EmailType = 
  | 'request_received'
  | 'confirmation'
  | 'refused'
  | 'modified'
  | 'cancelled'
  | 'reminder';

interface EmailPayload {
  center_id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  pack_name: string;
  price: number;
  appointment_date: string;
  appointment_time: string;
  notes?: string | null;
  email_type: EmailType;
  variant_name?: string;
  new_date?: string;
  new_time?: string;
  refusal_reason?: string;
}

/**
 * Fetches the latest client email from the database if available
 */
export async function getClientEmail(
  appointmentEmail: string,
  clientId: string | null
): Promise<string | null> {
  let email = appointmentEmail;
  
  if (clientId) {
    const { data: client } = await supabase
      .from('clients')
      .select('email')
      .eq('id', clientId)
      .maybeSingle();
    if (client?.email) {
      email = client.email;
    }
  }
  
  // Return null if no valid email
  if (!email || email === 'non-fourni@example.com') {
    return null;
  }
  
  return email;
}

/**
 * Sends a booking-related email via the edge function
 * Fire-and-forget pattern: errors are logged but don't block the UI
 */
export async function sendBookingEmail(payload: EmailPayload): Promise<{ success: boolean; error?: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-booking-emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.warn(`[Email Service] Failed (${response.status}):`, errorData);
      return { success: false, error: errorData.error || 'Email send failed' };
    }
    
    return { success: true };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.warn('[Email Service] Timeout after 10s');
      return { success: false, error: 'Timeout' };
    }
    console.warn('[Email Service] Network error:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Helper to build email payload from appointment data
 */
export function buildEmailPayload(
  centerId: string,
  appointment: {
    client_name: string;
    client_phone: string;
    appointment_date: string;
    appointment_time: string;
    notes?: string | null;
  },
  clientEmail: string,
  serviceName: string,
  price: number,
  emailType: EmailType,
  extra?: {
    variant_name?: string;
    new_date?: string;
    new_time?: string;
    refusal_reason?: string;
  }
): EmailPayload {
  return {
    center_id: centerId,
    client_name: appointment.client_name,
    client_email: clientEmail,
    client_phone: appointment.client_phone,
    pack_name: serviceName,
    price,
    appointment_date: appointment.appointment_date,
    appointment_time: appointment.appointment_time,
    notes: appointment.notes,
    email_type: emailType,
    ...extra,
  };
}
