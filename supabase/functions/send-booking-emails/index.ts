import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type EmailType = 
  | 'request_received'
  | 'confirmation'
  | 'refused'
  | 'modified'
  | 'cancelled'
  | 'reminder';

interface BookingEmailRequest {
  appointment_id?: string;
  center_id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  pack_name: string;
  variant_name?: string;
  price: number;
  appointment_date: string;
  appointment_time: string;
  notes?: string;
  email_type?: EmailType;
  new_date?: string;
  new_time?: string;
  refusal_reason?: string;
}

// ============ i18n translations for emails ============
const emailTranslations: Record<string, Record<string, string>> = {
  fr: {
    requestReceivedTitle: 'Demande reçue !',
    requestReceivedDesc: 'Votre demande de rendez-vous chez {centerName} a bien été enregistrée.',
    pendingValidation: 'Elle sera confirmée après validation.',
    pendingNotice: '📋 Votre demande est en cours de traitement. Vous recevrez un email de confirmation dès que le prestataire aura validé votre créneau.',
    requestedSlot: 'Créneau demandé',
    service: 'Prestation',
    estimatedPrice: 'Prix estimé',
    contactQuestion: 'Pour toute question, contactez {centerName}',
    contactAt: ' au {phone}',
    confirmationTitle: 'Rendez-vous confirmé !',
    confirmationDesc: 'Votre rendez-vous chez {centerName} est maintenant confirmé.',
    dateTime: 'Date & Heure',
    price: 'Prix',
    address: 'Adresse',
    addToCalendar: '📅 Ajouter au calendrier',
    refusedTitle: 'Créneau non disponible',
    refusedDesc: 'Malheureusement, le créneau demandé n\'est pas disponible.',
    chooseAnotherSlot: 'Nous vous invitons à choisir un autre créneau ou à nous contacter directement.',
    contactForMore: 'Contactez {centerName}{phoneStr} pour plus d\'informations.',
    modifiedTitle: 'Rendez-vous modifié',
    modifiedDesc: 'Votre rendez-vous chez {centerName} a été modifié.',
    oldSlot: 'Ancien créneau',
    newSlot: 'Nouveau créneau',
    cancelledTitle: 'Rendez-vous annulé',
    cancelledDesc: 'Votre rendez-vous chez {centerName} a été annulé.',
    cancelledSlot: 'Rendez-vous annulé',
    rebookInvite: 'N\'hésitez pas à reprendre rendez-vous quand vous le souhaitez.',
    reminderTitle: 'Rappel de votre rendez-vous',
    reminderDesc: 'Votre rendez-vous chez {centerName} approche !',
    viewInCalendar: '📅 Voir dans le calendrier',
    ownerNewRequest: 'Nouvelle demande de RDV',
    ownerPendingValidation: '⏳ En attente de votre validation',
    ownerClient: 'Client',
    ownerRequestedSlot: 'Créneau demandé',
    ownerClientNotes: 'Notes du client',
    ownerAction: '👉 Connectez-vous à votre dashboard pour <strong>confirmer</strong> ou <strong>refuser</strong> cette demande.',
    at: 'à',
    subjectRequestReceived: '📋 Demande de rendez-vous reçue - {date}',
    subjectConfirmation: '✅ Rendez-vous confirmé - {date}',
    subjectRefused: '❌ Demande de rendez-vous non disponible - {centerName}',
    subjectModified: '📅 Rendez-vous modifié - {date}',
    subjectCancelled: '🚫 Rendez-vous annulé - {date}',
    subjectReminder: '⏰ Rappel - Rendez-vous demain {time}',
    subjectOwnerNotification: '🔔 Nouvelle demande de RDV - {clientName} le {date}',
    calendarEventTitle: 'RDV {centerName} - {service}',
    calendarNotes: 'Notes: {notes}',
    calendarService: 'Prestation: {service}',
    calendarPrice: 'Prix: {price}€',
  },
  en: {
    requestReceivedTitle: 'Request received!',
    requestReceivedDesc: 'Your appointment request at {centerName} has been registered.',
    pendingValidation: 'It will be confirmed after validation.',
    pendingNotice: '📋 Your request is being processed. You will receive a confirmation email once the provider has validated your time slot.',
    requestedSlot: 'Requested slot',
    service: 'Service',
    estimatedPrice: 'Estimated price',
    contactQuestion: 'For any questions, contact {centerName}',
    contactAt: ' at {phone}',
    confirmationTitle: 'Appointment confirmed!',
    confirmationDesc: 'Your appointment at {centerName} is now confirmed.',
    dateTime: 'Date & Time',
    price: 'Price',
    address: 'Address',
    addToCalendar: '📅 Add to calendar',
    refusedTitle: 'Time slot unavailable',
    refusedDesc: 'Unfortunately, the requested time slot is not available.',
    chooseAnotherSlot: 'We invite you to choose another time slot or contact us directly.',
    contactForMore: 'Contact {centerName}{phoneStr} for more information.',
    modifiedTitle: 'Appointment modified',
    modifiedDesc: 'Your appointment at {centerName} has been modified.',
    oldSlot: 'Previous slot',
    newSlot: 'New slot',
    cancelledTitle: 'Appointment cancelled',
    cancelledDesc: 'Your appointment at {centerName} has been cancelled.',
    cancelledSlot: 'Cancelled appointment',
    rebookInvite: 'Feel free to book another appointment whenever you wish.',
    reminderTitle: 'Appointment reminder',
    reminderDesc: 'Your appointment at {centerName} is coming up!',
    viewInCalendar: '📅 View in calendar',
    ownerNewRequest: 'New appointment request',
    ownerPendingValidation: '⏳ Awaiting your validation',
    ownerClient: 'Client',
    ownerRequestedSlot: 'Requested slot',
    ownerClientNotes: 'Client notes',
    ownerAction: '👉 Log in to your dashboard to <strong>confirm</strong> or <strong>decline</strong> this request.',
    at: 'at',
    subjectRequestReceived: '📋 Appointment request received - {date}',
    subjectConfirmation: '✅ Appointment confirmed - {date}',
    subjectRefused: '❌ Appointment request unavailable - {centerName}',
    subjectModified: '📅 Appointment modified - {date}',
    subjectCancelled: '🚫 Appointment cancelled - {date}',
    subjectReminder: '⏰ Reminder - Appointment tomorrow {time}',
    subjectOwnerNotification: '🔔 New appointment request - {clientName} on {date}',
    calendarEventTitle: 'Appointment {centerName} - {service}',
    calendarNotes: 'Notes: {notes}',
    calendarService: 'Service: {service}',
    calendarPrice: 'Price: {price}€',
  },
};

function tr(lang: string, key: string, vars: Record<string, string> = {}): string {
  const t = emailTranslations[lang] || emailTranslations['fr'];
  let text = t[key] || emailTranslations['fr'][key] || key;
  for (const [k, v] of Object.entries(vars)) {
    text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
  }
  return text;
}

function validateRequest(data: any): { valid: boolean; error?: string } {
  if (!data.center_id || typeof data.center_id !== 'string') return { valid: false, error: 'center_id is required' };
  if (!data.client_email || typeof data.client_email !== 'string') return { valid: false, error: 'client_email is required' };
  if (!data.client_email.includes('@')) return { valid: false, error: 'Invalid client_email format' };
  if (!data.client_name || typeof data.client_name !== 'string') return { valid: false, error: 'client_name is required' };
  if (!data.pack_name || typeof data.pack_name !== 'string') return { valid: false, error: 'pack_name is required' };
  if (data.price === undefined || typeof data.price !== 'number') return { valid: false, error: 'price is required and must be a number' };
  if (!data.appointment_date || typeof data.appointment_date !== 'string') return { valid: false, error: 'appointment_date is required' };
  if (!data.appointment_time || typeof data.appointment_time !== 'string') return { valid: false, error: 'appointment_time is required' };
  return { valid: true };
}

const formatDate = (dateStr: string, lang: string): string => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(lang === 'en' ? 'en-US' : 'fr-FR', { 
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
  });
};

const formatTime = (timeStr: string): string => {
  return timeStr.slice(0, 5).replace(':', 'h');
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data = await req.json();

    // Handle support request separately
    if (data.type === 'support_request') {
      const { to, subject, centerName, userEmail, message } = data;
      if (!to || !subject || !message) {
        return new Response(
          JSON.stringify({ error: 'Missing support request fields' }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const supportHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #111827;">Nouvelle demande de support</h2>
          <p><strong>Centre :</strong> ${centerName}</p>
          <p><strong>Email :</strong> ${userEmail}</p>
          <p><strong>Sujet :</strong> ${subject}</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
      `;

      await resend.emails.send({
        from: "CleaningPage Support <onboarding@resend.dev>",
        to: [to],
        replyTo: userEmail,
        subject: subject,
        html: supportHtml,
      });

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validation = validateRequest(data);
    if (!validation.valid) {
      console.error('[Validation Error]', validation.error);
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const emailType = data.email_type || 'request_received';

    // --- AUTHORIZATION ---
    if (emailType === 'request_received') {
      const { data: matchingAppointment, error: appointmentError } = await supabase
        .from('appointments')
        .select('id')
        .eq('center_id', data.center_id)
        .eq('client_email', data.client_email)
        .eq('appointment_date', data.appointment_date)
        .eq('appointment_time', data.appointment_time)
        .eq('status', 'pending_validation')
        .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())
        .limit(1);

      if (appointmentError || !matchingAppointment || matchingAppointment.length === 0) {
        console.error('[Auth] No matching recent appointment found for request_received email');
        return new Response(
          JSON.stringify({ error: "Aucun rendez-vous correspondant trouvé" }),
          { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    } else {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        return new Response(
          JSON.stringify({ error: "Non autorisé" }),
          { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const token = authHeader.replace('Bearer ', '');
      const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: `Bearer ${token}` } }
      });
      
      const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
      if (claimsError || !claimsData?.claims?.sub) {
        return new Response(
          JSON.stringify({ error: "Session expirée" }),
          { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const userId = claimsData.claims.sub;
      const { data: centerOwnership, error: ownerError } = await supabase
        .from('centers')
        .select('id')
        .eq('id', data.center_id)
        .eq('owner_id', userId)
        .single();

      if (ownerError || !centerOwnership) {
        return new Response(
          JSON.stringify({ error: "Accès refusé" }),
          { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // Fetch center with email_language
    const { data: center, error: centerError } = await supabase
      .from("centers")
      .select("name, email, phone, address, email_language")
      .eq("id", data.center_id)
      .single();

    if (centerError || !center) {
      console.error('[Center Error]', centerError);
      return new Response(
        JSON.stringify({ error: "Centre non trouvé" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const lang = center.email_language || 'fr';
    const formattedDate = formatDate(data.appointment_date, lang);
    const formattedTime = formatTime(data.appointment_time);
    const serviceInfo = data.variant_name 
      ? `${data.pack_name} - ${data.variant_name}` 
      : data.pack_name;

    // Generate Google Calendar link
    const [year, month, day] = data.appointment_date.split('-');
    const [hours, minutes] = data.appointment_time.split(':');
    const startDateTime = `${year}${month}${day}T${hours}${minutes}00`;
    const endHour = (parseInt(hours) + 1).toString().padStart(2, '0');
    const endDateTime = `${year}${month}${day}T${endHour}${minutes}00`;
    
    const calendarTitle = tr(lang, 'calendarEventTitle', { centerName: center.name, service: serviceInfo });
    const calendarDetails = `${tr(lang, 'calendarService', { service: serviceInfo })}\n${tr(lang, 'calendarPrice', { price: String(data.price) })}${data.notes ? `\n${tr(lang, 'calendarNotes', { notes: data.notes })}` : ''}`;
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(calendarTitle)}&dates=${startDateTime}/${endDateTime}&ctz=Europe/Paris&details=${encodeURIComponent(calendarDetails)}&location=${encodeURIComponent(center.address || '')}`;

    let clientEmailHtml = '';
    let subject = '';
    const at = tr(lang, 'at');
    const phoneStr = center.phone ? tr(lang, 'contactAt', { phone: center.phone }) : '';
    const contactLine = tr(lang, 'contactQuestion', { centerName: center.name }) + phoneStr + '.';

    switch (emailType) {
      case 'request_received':
        subject = tr(lang, 'subjectRequestReceived', { date: formattedDate });
        clientEmailHtml = generateRequestReceivedEmail(center, formattedDate, formattedTime, serviceInfo, data.price, lang, contactLine, at);
        break;
      case 'confirmation':
        subject = tr(lang, 'subjectConfirmation', { date: formattedDate });
        clientEmailHtml = generateConfirmationEmail(center, formattedDate, formattedTime, serviceInfo, data.price, googleCalendarUrl, lang, contactLine, at);
        break;
      case 'refused':
        subject = tr(lang, 'subjectRefused', { centerName: center.name });
        clientEmailHtml = generateRefusedEmail(center, formattedDate, formattedTime, serviceInfo, data.refusal_reason, lang, at);
        break;
      case 'modified': {
        const newFormattedDate = data.new_date ? formatDate(data.new_date, lang) : formattedDate;
        const newFormattedTime = data.new_time ? formatTime(data.new_time) : formattedTime;
        subject = tr(lang, 'subjectModified', { date: newFormattedDate });
        clientEmailHtml = generateModifiedEmail(center, formattedDate, formattedTime, newFormattedDate, newFormattedTime, serviceInfo, data.price, lang, contactLine, at);
        break;
      }
      case 'cancelled':
        subject = tr(lang, 'subjectCancelled', { date: formattedDate });
        clientEmailHtml = generateCancelledEmail(center, formattedDate, formattedTime, serviceInfo, lang, at);
        break;
      case 'reminder':
        subject = tr(lang, 'subjectReminder', { time: formattedTime });
        clientEmailHtml = generateReminderEmail(center, formattedDate, formattedTime, serviceInfo, data.price, googleCalendarUrl, lang, contactLine, at);
        break;
    }

    await resend.emails.send({
      from: "CleaningPage <notifications@cleaningpage.com>",
      to: [data.client_email],
      subject,
      html: clientEmailHtml,
    });

    console.log(`[${emailType}] Email sent to client:`, data.client_email, `lang: ${lang}`);

    // Owner notification (always in French for the pro)
    if (emailType === 'request_received' && center.email) {
      const ownerEmailHtml = generateOwnerNotificationEmail(center, data, formattedDate, formattedTime, serviceInfo);
      
      await resend.emails.send({
        from: "CleaningPage <notifications@cleaningpage.com>",
        to: [center.email],
        subject: `🔔 Nouvelle demande de RDV - ${data.client_name} le ${formattedDate}`,
        html: ownerEmailHtml,
      });

      console.log("Owner notification email sent to:", center.email);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Emails envoyés avec succès" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-booking-emails function:", error);
    return new Response(
      JSON.stringify({ error: "Une erreur est survenue" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

// ============ Email templates ============

function generateRequestReceivedEmail(center: any, date: string, time: string, service: string, price: number, lang: string, contactLine: string, at: string): string {
  return `
    <!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="width: 64px; height: 64px; background: #f59e0b; border-radius: 50%; display: inline-block; line-height: 64px; text-align: center;">
              <span style="color: white; font-size: 32px;">⏳</span>
            </div>
          </div>
          <h1 style="color: #111; font-size: 24px; font-weight: 600; text-align: center; margin: 0 0 8px 0;">${tr(lang, 'requestReceivedTitle')}</h1>
          <p style="color: #666; font-size: 16px; text-align: center; margin: 0 0 32px 0;">
            ${tr(lang, 'requestReceivedDesc', { centerName: center.name })}<br/>
            <strong style="color: #f59e0b;">${tr(lang, 'pendingValidation')}</strong>
          </p>
          <div style="background: #fffbeb; border: 1px solid #fcd34d; border-radius: 12px; padding: 16px; margin-bottom: 24px; text-align: center;">
            <p style="color: #92400e; font-size: 14px; margin: 0;">${tr(lang, 'pendingNotice')}</p>
          </div>
          <div style="background: #f9fafb; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <div style="margin-bottom: 16px;">
              <div style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">${tr(lang, 'requestedSlot')}</div>
              <div style="color: #111; font-size: 18px; font-weight: 600;">${date} ${at} ${time}</div>
            </div>
            <div style="margin-bottom: 16px;">
              <div style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">${tr(lang, 'service')}</div>
              <div style="color: #111; font-size: 16px; font-weight: 500;">${service}</div>
            </div>
            <div>
              <div style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">${tr(lang, 'estimatedPrice')}</div>
              <div style="color: #10b981; font-size: 20px; font-weight: 700;">${price}€</div>
            </div>
          </div>
          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 32px;">${contactLine}</p>
        </div>
      </div>
    </body></html>
  `;
}

function generateConfirmationEmail(center: any, date: string, time: string, service: string, price: number, calendarUrl: string, lang: string, contactLine: string, at: string): string {
  return `
    <!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="width: 64px; height: 64px; background: #10b981; border-radius: 50%; display: inline-block; line-height: 64px; text-align: center;">
              <span style="color: white; font-size: 32px;">✓</span>
            </div>
          </div>
          <h1 style="color: #111; font-size: 24px; font-weight: 600; text-align: center; margin: 0 0 8px 0;">${tr(lang, 'confirmationTitle')}</h1>
          <p style="color: #666; font-size: 16px; text-align: center; margin: 0 0 32px 0;">${tr(lang, 'confirmationDesc', { centerName: center.name })}</p>
          <div style="background: #f9fafb; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <div style="margin-bottom: 16px;">
              <div style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">${tr(lang, 'dateTime')}</div>
              <div style="color: #111; font-size: 18px; font-weight: 600;">${date} ${at} ${time}</div>
            </div>
            <div style="margin-bottom: 16px;">
              <div style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">${tr(lang, 'service')}</div>
              <div style="color: #111; font-size: 16px; font-weight: 500;">${service}</div>
            </div>
            <div>
              <div style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">${tr(lang, 'price')}</div>
              <div style="color: #10b981; font-size: 20px; font-weight: 700;">${price}€</div>
            </div>
          </div>
          ${center.address ? `
          <div style="margin-bottom: 24px;">
            <div style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">${tr(lang, 'address')}</div>
            <div style="color: #111; font-size: 14px;">${center.address}</div>
          </div>` : ''}
          <div style="text-align: center; margin-top: 32px;">
            <a href="${calendarUrl}" style="display: inline-block; background: #111; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 500; font-size: 14px;">${tr(lang, 'addToCalendar')}</a>
          </div>
          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 32px;">${contactLine}</p>
        </div>
      </div>
    </body></html>
  `;
}

function generateRefusedEmail(center: any, date: string, time: string, service: string, reason: string | undefined, lang: string, at: string): string {
  const phoneStr = center.phone ? tr(lang, 'contactAt', { phone: center.phone }) : '';
  const contactForMore = tr(lang, 'contactForMore', { centerName: center.name, phoneStr });
  return `
    <!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="width: 64px; height: 64px; background: #ef4444; border-radius: 50%; display: inline-block; line-height: 64px; text-align: center;">
              <span style="color: white; font-size: 32px;">✗</span>
            </div>
          </div>
          <h1 style="color: #111; font-size: 24px; font-weight: 600; text-align: center; margin: 0 0 8px 0;">${tr(lang, 'refusedTitle')}</h1>
          <p style="color: #666; font-size: 16px; text-align: center; margin: 0 0 32px 0;">${tr(lang, 'refusedDesc')}</p>
          <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <div style="margin-bottom: 16px;">
              <div style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">${tr(lang, 'requestedSlot')}</div>
              <div style="color: #111; font-size: 16px; text-decoration: line-through;">${date} ${at} ${time}</div>
            </div>
            <div>
              <div style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">${tr(lang, 'service')}</div>
              <div style="color: #111; font-size: 16px;">${service}</div>
            </div>
            ${reason ? `<div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #fecaca;"><div style="color: #dc2626; font-size: 14px;">${reason}</div></div>` : ''}
          </div>
          <p style="color: #666; font-size: 14px; text-align: center; margin-bottom: 24px;">${tr(lang, 'chooseAnotherSlot')}</p>
          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 32px;">${contactForMore}</p>
        </div>
      </div>
    </body></html>
  `;
}

function generateModifiedEmail(center: any, oldDate: string, oldTime: string, newDate: string, newTime: string, service: string, price: number, lang: string, contactLine: string, at: string): string {
  return `
    <!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="width: 64px; height: 64px; background: #3b82f6; border-radius: 50%; display: inline-block; line-height: 64px; text-align: center;">
              <span style="color: white; font-size: 32px;">✎</span>
            </div>
          </div>
          <h1 style="color: #111; font-size: 24px; font-weight: 600; text-align: center; margin: 0 0 8px 0;">${tr(lang, 'modifiedTitle')}</h1>
          <p style="color: #666; font-size: 16px; text-align: center; margin: 0 0 32px 0;">${tr(lang, 'modifiedDesc', { centerName: center.name })}</p>
          <div style="background: #fef3c7; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
            <div style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">${tr(lang, 'oldSlot')}</div>
            <div style="color: #92400e; font-size: 16px; text-decoration: line-through;">${oldDate} ${at} ${oldTime}</div>
          </div>
          <div style="background: #d1fae5; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
            <div style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">${tr(lang, 'newSlot')}</div>
            <div style="color: #065f46; font-size: 18px; font-weight: 600;">${newDate} ${at} ${newTime}</div>
          </div>
          <div style="background: #f9fafb; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <div style="margin-bottom: 16px;">
              <div style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">${tr(lang, 'service')}</div>
              <div style="color: #111; font-size: 16px; font-weight: 500;">${service}</div>
            </div>
            <div>
              <div style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">${tr(lang, 'price')}</div>
              <div style="color: #10b981; font-size: 20px; font-weight: 700;">${price}€</div>
            </div>
          </div>
          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 32px;">${contactLine}</p>
        </div>
      </div>
    </body></html>
  `;
}

function generateCancelledEmail(center: any, date: string, time: string, service: string, lang: string, at: string): string {
  const phoneStr = center.phone ? tr(lang, 'contactAt', { phone: center.phone }) : '';
  const contactForMore = tr(lang, 'contactForMore', { centerName: center.name, phoneStr });
  return `
    <!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="width: 64px; height: 64px; background: #6b7280; border-radius: 50%; display: inline-block; line-height: 64px; text-align: center;">
              <span style="color: white; font-size: 32px;">⊘</span>
            </div>
          </div>
          <h1 style="color: #111; font-size: 24px; font-weight: 600; text-align: center; margin: 0 0 8px 0;">${tr(lang, 'cancelledTitle')}</h1>
          <p style="color: #666; font-size: 16px; text-align: center; margin: 0 0 32px 0;">${tr(lang, 'cancelledDesc', { centerName: center.name })}</p>
          <div style="background: #f3f4f6; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <div style="margin-bottom: 16px;">
              <div style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">${tr(lang, 'cancelledSlot')}</div>
              <div style="color: #6b7280; font-size: 16px; text-decoration: line-through;">${date} ${at} ${time}</div>
            </div>
            <div>
              <div style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">${tr(lang, 'service')}</div>
              <div style="color: #6b7280; font-size: 16px;">${service}</div>
            </div>
          </div>
          <p style="color: #666; font-size: 14px; text-align: center; margin-bottom: 24px;">${tr(lang, 'rebookInvite')}</p>
          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 32px;">${contactForMore}</p>
        </div>
      </div>
    </body></html>
  `;
}

function generateReminderEmail(center: any, date: string, time: string, service: string, price: number, calendarUrl: string, lang: string, contactLine: string, at: string): string {
  return `
    <!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="width: 64px; height: 64px; background: #10b981; border-radius: 50%; display: inline-block; line-height: 64px; text-align: center;">
              <span style="color: white; font-size: 32px;">⏰</span>
            </div>
          </div>
          <h1 style="color: #111; font-size: 24px; font-weight: 600; text-align: center; margin: 0 0 8px 0;">${tr(lang, 'reminderTitle')}</h1>
          <p style="color: #666; font-size: 16px; text-align: center; margin: 0 0 32px 0;">${tr(lang, 'reminderDesc', { centerName: center.name })}</p>
          <div style="background: #f9fafb; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <div style="margin-bottom: 16px;">
              <div style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">${tr(lang, 'dateTime')}</div>
              <div style="color: #111; font-size: 18px; font-weight: 600;">${date} ${at} ${time}</div>
            </div>
            <div style="margin-bottom: 16px;">
              <div style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">${tr(lang, 'service')}</div>
              <div style="color: #111; font-size: 16px; font-weight: 500;">${service}</div>
            </div>
            <div>
              <div style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">${tr(lang, 'price')}</div>
              <div style="color: #10b981; font-size: 20px; font-weight: 700;">${price}€</div>
            </div>
          </div>
          ${center.address ? `
          <div style="margin-bottom: 24px;">
            <div style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">${tr(lang, 'address')}</div>
            <div style="color: #111; font-size: 14px;">${center.address}</div>
          </div>` : ''}
          <div style="text-align: center; margin-top: 32px;">
            <a href="${calendarUrl}" style="display: inline-block; background: #111; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 500; font-size: 14px;">${tr(lang, 'viewInCalendar')}</a>
          </div>
          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 32px;">${contactLine}</p>
        </div>
      </div>
    </body></html>
  `;
}

// Owner notification stays in French (internal)
function generateOwnerNotificationEmail(center: any, data: BookingEmailRequest, date: string, time: string, service: string): string {
  return `
    <!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="width: 64px; height: 64px; background: #f59e0b; border-radius: 50%; display: inline-block; line-height: 64px; text-align: center;">
              <span style="color: white; font-size: 32px;">🔔</span>
            </div>
          </div>
          <h1 style="color: #111; font-size: 24px; font-weight: 600; text-align: center; margin: 0 0 8px 0;">Nouvelle demande de RDV</h1>
          <p style="color: #f59e0b; font-size: 16px; text-align: center; margin: 0 0 32px 0; font-weight: 600;">⏳ En attente de votre validation</p>
          <div style="background: #f9fafb; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <div style="margin-bottom: 16px;">
              <div style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Client</div>
              <div style="color: #111; font-size: 18px; font-weight: 600;">${data.client_name}</div>
              <div style="color: #666; font-size: 14px;">${data.client_phone}</div>
              <div style="color: #666; font-size: 14px;">${data.client_email}</div>
            </div>
            <div style="margin-bottom: 16px;">
              <div style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Créneau demandé</div>
              <div style="color: #111; font-size: 18px; font-weight: 600;">${date} à ${time}</div>
            </div>
            <div style="margin-bottom: 16px;">
              <div style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Prestation</div>
              <div style="color: #111; font-size: 16px; font-weight: 500;">${service}</div>
            </div>
            <div>
              <div style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Prix</div>
              <div style="color: #10b981; font-size: 20px; font-weight: 700;">${data.price}€</div>
            </div>
            ${data.notes ? `
            <div style="margin-top: 16px;">
              <div style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Notes du client</div>
              <div style="color: #111; font-size: 14px;">${data.notes}</div>
            </div>` : ''}
          </div>
          <div style="background: #fffbeb; border: 1px solid #fcd34d; border-radius: 12px; padding: 16px; text-align: center;">
            <p style="color: #92400e; font-size: 14px; margin: 0;">
              👉 Connectez-vous à votre dashboard pour <strong>confirmer</strong> ou <strong>refuser</strong> cette demande.
            </p>
          </div>
        </div>
      </div>
    </body></html>
  `;
}

serve(handler);
