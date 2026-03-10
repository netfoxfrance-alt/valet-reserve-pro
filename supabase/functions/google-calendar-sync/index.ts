import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const log = (step: string, details?: unknown) => {
  console.log(`[GOOGLE-CALENDAR-SYNC] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
};

/**
 * Get a fresh access token using the stored refresh token
 */
async function getAccessToken(refreshToken: string): Promise<string> {
  const clientId = Deno.env.get('GOOGLE_CLIENT_ID')!;
  const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')!;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(`TOKEN_REFRESH_FAILED: ${data.error || 'unknown'}`);
  }

  return data.access_token;
}

/**
 * Build a Google Calendar event object from appointment data
 */
function buildCalendarEvent(appointment: any, centerAddress?: string) {
  const serviceName = appointment.custom_services?.name || appointment.packs?.name || 'Prestation';
  const servicePrice = appointment.custom_price ?? appointment.custom_services?.price ?? appointment.packs?.price;

  // Build description
  const parts: string[] = [];
  parts.push(`📋 ${serviceName}`);
  if (servicePrice) parts.push(`💰 Prix: ${servicePrice}€`);
  parts.push('');
  parts.push('👤 CLIENT:');
  parts.push(`Nom: ${appointment.client_name}`);
  if (appointment.client_phone) parts.push(`Tél: ${appointment.client_phone}`);
  if (appointment.client_email) parts.push(`Email: ${appointment.client_email}`);
  if (appointment.client_address) parts.push(`Adresse: ${appointment.client_address}`);
  if (appointment.vehicle_type && appointment.vehicle_type !== 'custom') {
    parts.push('');
    parts.push(`🚗 Véhicule: ${appointment.vehicle_type}`);
  }
  if (appointment.notes) {
    parts.push('');
    parts.push(`📝 Notes: ${appointment.notes}`);
  }

  const duration = appointment.duration_minutes || 60;

  return {
    summary: `🚗 RDV - ${appointment.client_name}`,
    description: parts.join('\n'),
    location: appointment.client_address || centerAddress || undefined,
    start: {
      dateTime: `${appointment.appointment_date}T${appointment.appointment_time}`,
      timeZone: 'Europe/Paris',
    },
    end: {
      dateTime: calculateEndTime(appointment.appointment_date, appointment.appointment_time, duration),
      timeZone: 'Europe/Paris',
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 30 },
      ],
    },
  };
}

function calculateEndTime(date: string, time: string, durationMinutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const totalMinutes = h * 60 + (m || 0) + durationMinutes;
  const endH = Math.floor(totalMinutes / 60);
  const endM = totalMinutes % 60;
  return `${date}T${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}:00`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Authenticate: accept both user JWT and service_role key
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    const token = authHeader.replace('Bearer ', '');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const isServiceRole = token === serviceRoleKey;

    let userId: string | null = null;

    if (!isServiceRole) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_ANON_KEY')!,
        { global: { headers: { Authorization: authHeader } } }
      );

      const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
      if (claimsError || !claimsData?.claims) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
      }
      userId = claimsData.claims.sub as string;
    }

    const { action, appointment_id } = await req.json();
    log('Request received', { action, appointment_id, userId, isServiceRole });

    if (!action || !appointment_id) {
      return new Response(JSON.stringify({ error: 'Missing action or appointment_id' }), { status: 400, headers: corsHeaders });
    }

    // Use service_role to access refresh_token (sensitive column)
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    );

    // Get appointment with center data
    const { data: appointment, error: aptError } = await adminClient
      .from('appointments')
      .select('*, packs(name, price), custom_services:custom_services(name, price)')
      .eq('id', appointment_id)
      .single();

    if (aptError || !appointment) {
      log('Appointment not found', { appointment_id });
      return new Response(JSON.stringify({ error: 'Appointment not found' }), { status: 404, headers: corsHeaders });
    }

    // Verify ownership
    const { data: center } = await adminClient
      .from('centers')
      .select('id, owner_id, google_calendar_refresh_token, google_calendar_connected, address')
      .eq('id', appointment.center_id)
      .single();

    // Verify ownership (skip for service_role - trusted internal calls)
    if (!isServiceRole && (!center || center.owner_id !== userId)) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: corsHeaders });
    }

    if (!center.google_calendar_connected || !center.google_calendar_refresh_token) {
      return new Response(JSON.stringify({ error: 'Google Calendar not connected' }), { status: 400, headers: corsHeaders });
    }

    // Get fresh access token
    let accessToken: string;
    try {
      accessToken = await getAccessToken(center.google_calendar_refresh_token);
    } catch (tokenErr) {
      log('Token refresh failed, marking as disconnected', { error: String(tokenErr) });
      // Mark as disconnected
      await adminClient
        .from('centers')
        .update({ google_calendar_connected: false, google_calendar_refresh_token: null, google_calendar_email: null })
        .eq('id', center.id);
      return new Response(JSON.stringify({ error: 'Google Calendar disconnected. Please reconnect.', code: 'DISCONNECTED' }), { status: 401, headers: corsHeaders });
    }

    const calendarHeaders = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };

    if (action === 'create') {
      const event = buildCalendarEvent(appointment, center.address);
      log('Creating Google Calendar event', { summary: event.summary });

      const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all', {
        method: 'POST',
        headers: calendarHeaders,
        body: JSON.stringify(event),
      });

      const result = await res.json();
      if (!res.ok) {
        log('Failed to create event', { status: res.status, error: result.error });
        return new Response(JSON.stringify({ error: 'Failed to create calendar event' }), { status: 500, headers: corsHeaders });
      }

      // Store the Google Calendar event ID
      await adminClient
        .from('appointments')
        .update({ google_calendar_event_id: result.id })
        .eq('id', appointment_id);

      log('Event created successfully', { eventId: result.id });
      return new Response(JSON.stringify({ success: true, event_id: result.id }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    } else if (action === 'update') {
      const eventId = appointment.google_calendar_event_id;
      if (!eventId) {
        // No existing event — create one instead
        const event = buildCalendarEvent(appointment, center.address);
        log('No existing event, creating new one for update', { summary: event.summary });
        const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all', {
          method: 'POST',
          headers: calendarHeaders,
          body: JSON.stringify(event),
        });
        const result = await res.json();
        if (res.ok && result.id) {
          await adminClient.from('appointments').update({ google_calendar_event_id: result.id }).eq('id', appointment_id);
          log('Event created on update fallback', { eventId: result.id });
        }
        return new Response(JSON.stringify({ success: true, event_id: result.id }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const event = buildCalendarEvent(appointment, center.address);
      log('Updating Google Calendar event', { eventId });

      const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
        method: 'PUT',
        headers: calendarHeaders,
        body: JSON.stringify(event),
      });

      if (!res.ok) {
        const body = await res.text();
        log('Failed to update event', { status: res.status, body });
        return new Response(JSON.stringify({ error: 'Failed to update calendar event' }), { status: 500, headers: corsHeaders });
      }

      log('Event updated successfully', { eventId });
      return new Response(JSON.stringify({ success: true, event_id: eventId }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    } else if (action === 'delete') {
      const eventId = appointment.google_calendar_event_id;
      if (!eventId) {
        return new Response(JSON.stringify({ success: true, message: 'No event to delete' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
        method: 'DELETE',
        headers: calendarHeaders,
      });

      // 204 = deleted, 410 = already deleted
      if (res.ok || res.status === 204 || res.status === 410) {
        await adminClient
          .from('appointments')
          .update({ google_calendar_event_id: null })
          .eq('id', appointment_id);
        log('Event deleted', { eventId });
      } else {
        const body = await res.text();
        log('Failed to delete event', { status: res.status, body });
      }

      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    } else {
      return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400, headers: corsHeaders });
    }

  } catch (err) {
    log('Unexpected error', { error: err instanceof Error ? err.message : String(err) });
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: corsHeaders });
  }
});
