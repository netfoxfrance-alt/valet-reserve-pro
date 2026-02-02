/**
 * Calendar utilities for Google Calendar integration
 * Generates URLs for instant calendar addition and iCal content
 */

export interface CalendarEvent {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  description?: string;
  location?: string;
}

/**
 * Format a date for Google Calendar URL (YYYYMMDDTHHmmss format - LOCAL time)
 * IMPORTANT: We use local time format WITHOUT 'Z' suffix to preserve the user's timezone
 * Using toISOString() would convert to UTC and shift the time incorrectly
 */
function formatDateForGoogle(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

/**
 * Generate a Google Calendar URL for instant event addition
 * Opens Google Calendar with the event pre-filled
 */
export function generateGoogleCalendarUrl(event: CalendarEvent): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatDateForGoogle(event.startDate)}/${formatDateForGoogle(event.endDate)}`,
  });

  if (event.description) {
    params.set('details', event.description);
  }

  if (event.location) {
    params.set('location', event.location);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate a Google Calendar URL from appointment data
 * Uses local date components to avoid timezone conversion issues
 */
export function generateAppointmentCalendarUrl(appointment: {
  id: string;
  client_name: string;
  client_phone?: string;
  client_email?: string;
  client_address?: string | null;
  appointment_date: string;
  appointment_time: string;
  duration_minutes?: number | null;
  vehicle_type?: string;
  notes?: string | null;
  pack?: { name: string; price: number } | null;
  custom_service?: { name: string; price: number } | null;
  center_address?: string;
}): string {
  // Parse date and time using individual components to avoid timezone shifts
  const [year, month, day] = appointment.appointment_date.split('-').map(Number);
  const timeParts = appointment.appointment_time.split(':');
  const hours = parseInt(timeParts[0], 10);
  const minutes = parseInt(timeParts[1], 10);
  
  // Create date using local components (not UTC)
  const startDate = new Date(year, month - 1, day, hours, minutes, 0);
  const duration = appointment.duration_minutes || 60;
  const endDate = new Date(startDate.getTime() + duration * 60 * 1000);

  // Build comprehensive description with all client info
  const serviceName = appointment.pack?.name || appointment.custom_service?.name || 'Prestation';
  const servicePrice = appointment.pack?.price || appointment.custom_service?.price;
  
  const descriptionParts: string[] = [];
  
  // Service info
  descriptionParts.push(`📋 ${serviceName}`);
  if (servicePrice) {
    descriptionParts.push(`💰 Prix: ${servicePrice}€`);
  }
  
  // Client info
  descriptionParts.push('');
  descriptionParts.push('👤 CLIENT:');
  descriptionParts.push(`Nom: ${appointment.client_name}`);
  if (appointment.client_phone) {
    descriptionParts.push(`Tél: ${appointment.client_phone}`);
  }
  if (appointment.client_email) {
    descriptionParts.push(`Email: ${appointment.client_email}`);
  }
  if (appointment.client_address) {
    descriptionParts.push(`Adresse: ${appointment.client_address}`);
  }
  
  // Vehicle info
  if (appointment.vehicle_type) {
    descriptionParts.push('');
    descriptionParts.push(`🚗 Véhicule: ${appointment.vehicle_type}`);
  }
  
  // Notes
  if (appointment.notes) {
    descriptionParts.push('');
    descriptionParts.push(`📝 Notes: ${appointment.notes}`);
  }

  return generateGoogleCalendarUrl({
    id: appointment.id,
    title: `🚗 RDV - ${appointment.client_name}`,
    startDate,
    endDate,
    description: descriptionParts.join('\n'),
    location: appointment.client_address || appointment.center_address,
  });
}

/**
 * Generate the full iCal subscription URL for a center
 */
export function generateIcalSubscriptionUrl(centerId: string, icalToken: string): string {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  return `${supabaseUrl}/functions/v1/calendar-ical?center=${centerId}&token=${icalToken}`;
}

/**
 * Generate a Google Calendar subscribe URL (1-click add)
 * Opens Google Calendar with "Add this calendar?" dialog
 */
export function generateGoogleCalendarSubscribeUrl(icalUrl: string): string {
  // Convert https:// to webcal:// protocol (required by Google)
  const webcalUrl = icalUrl.replace('https://', 'webcal://');
  return `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcalUrl)}`;
}

/**
 * Generate an .ics file content for a single appointment (for download)
 */
export function generateSingleEventIcs(event: CalendarEvent): string {
  // Format date using local components to avoid timezone shifts
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}T${hours}${minutes}${seconds}`;
  };

  const escapeText = (text: string): string => {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
  };

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CleaningPage//Calendar//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.id}@cleaningpage`,
    `DTSTAMP:${formatDate(new Date())}`,
    `DTSTART:${formatDate(event.startDate)}`,
    `DTEND:${formatDate(event.endDate)}`,
    `SUMMARY:${escapeText(event.title)}`,
  ];

  if (event.description) {
    lines.push(`DESCRIPTION:${escapeText(event.description)}`);
  }

  if (event.location) {
    lines.push(`LOCATION:${escapeText(event.location)}`);
  }

  lines.push('END:VEVENT', 'END:VCALENDAR');

  return lines.join('\r\n');
}

/**
 * Download an .ics file for a single appointment
 */
export function downloadAppointmentIcs(appointment: {
  id: string;
  client_name: string;
  appointment_date: string;
  appointment_time: string;
  duration_minutes?: number | null;
  vehicle_type?: string;
  notes?: string | null;
  pack?: { name: string; price: number } | null;
  custom_service?: { name: string; price: number } | null;
  center_address?: string;
}): void {
  // Parse date and time
  const [year, month, day] = appointment.appointment_date.split('-').map(Number);
  const [hours, minutes] = appointment.appointment_time.split(':').map(Number);
  
  const startDate = new Date(year, month - 1, day, hours, minutes);
  const duration = appointment.duration_minutes || 60;
  const endDate = new Date(startDate.getTime() + duration * 60 * 1000);

  // Build description
  const serviceName = appointment.pack?.name || appointment.custom_service?.name || 'Prestation';
  const servicePrice = appointment.pack?.price || appointment.custom_service?.price;
  
  const descriptionParts = [serviceName];
  if (appointment.vehicle_type) {
    descriptionParts.push(`Véhicule: ${appointment.vehicle_type}`);
  }
  if (servicePrice) {
    descriptionParts.push(`Prix: ${servicePrice}€`);
  }
  if (appointment.notes) {
    descriptionParts.push(`Notes: ${appointment.notes}`);
  }

  const icsContent = generateSingleEventIcs({
    id: appointment.id,
    title: `RDV - ${appointment.client_name}`,
    startDate,
    endDate,
    description: descriptionParts.join(' | '),
    location: appointment.center_address,
  });

  // Create and download file
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `rdv-${appointment.client_name.replace(/[^a-zA-Z0-9]/g, '-')}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
