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
 * Format a date for Google Calendar URL (YYYYMMDDTHHmmssZ format)
 */
function formatDateForGoogle(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
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
 */
export function generateAppointmentCalendarUrl(appointment: {
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
}): string {
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

  return generateGoogleCalendarUrl({
    id: appointment.id,
    title: `RDV - ${appointment.client_name}`,
    startDate,
    endDate,
    description: descriptionParts.join('\n'),
    location: appointment.center_address,
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
 * Generate an .ics file content for a single appointment (for download)
 */
export function generateSingleEventIcs(event: CalendarEvent): string {
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
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
