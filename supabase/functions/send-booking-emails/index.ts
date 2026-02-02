import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// CORS headers complets pour compatibilité Supabase client
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type EmailType = 
  | 'request_received'      // Demande reçue (en attente validation)
  | 'confirmation'          // RDV confirmé par le pro
  | 'refused'               // RDV refusé
  | 'modified'              // RDV modifié (date/heure changée)
  | 'cancelled'             // RDV annulé
  | 'reminder';             // Rappel

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
  // For modified appointments
  new_date?: string;
  new_time?: string;
  // For refused appointments
  refusal_reason?: string;
}

// Validation des données entrantes
function validateRequest(data: any): { valid: boolean; error?: string } {
  if (!data.center_id || typeof data.center_id !== 'string') {
    return { valid: false, error: 'center_id is required' };
  }
  if (!data.client_email || typeof data.client_email !== 'string') {
    return { valid: false, error: 'client_email is required' };
  }
  // Validation email basique
  if (!data.client_email.includes('@')) {
    return { valid: false, error: 'Invalid client_email format' };
  }
  if (!data.client_name || typeof data.client_name !== 'string') {
    return { valid: false, error: 'client_name is required' };
  }
  if (!data.pack_name || typeof data.pack_name !== 'string') {
    return { valid: false, error: 'pack_name is required' };
  }
  if (data.price === undefined || typeof data.price !== 'number') {
    return { valid: false, error: 'price is required and must be a number' };
  }
  if (!data.appointment_date || typeof data.appointment_date !== 'string') {
    return { valid: false, error: 'appointment_date is required' };
  }
  if (!data.appointment_time || typeof data.appointment_time !== 'string') {
    return { valid: false, error: 'appointment_time is required' };
  }
  return { valid: true };
}

const formatDate = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('fr-FR', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
};

const formatTime = (timeStr: string): string => {
  return timeStr.slice(0, 5).replace(':', 'h');
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: BookingEmailRequest = await req.json();

    // Validation des données
    const validation = validateRequest(data);
    if (!validation.valid) {
      console.error('[Validation Error]', validation.error);
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: center, error: centerError } = await supabase
      .from("centers")
      .select("name, email, phone, address")
      .eq("id", data.center_id)
      .single();

    if (centerError || !center) {
      console.error('[Center Error]', centerError);
      return new Response(
        JSON.stringify({ error: "Centre non trouvé" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const formattedDate = formatDate(data.appointment_date);
    const formattedTime = formatTime(data.appointment_time);
    const serviceInfo = data.variant_name 
      ? `${data.pack_name} - ${data.variant_name}` 
      : data.pack_name;

    const emailType = data.email_type || 'request_received';

    // Generate Google Calendar link
    const [year, month, day] = data.appointment_date.split('-');
    const [hours, minutes] = data.appointment_time.split(':');
    const startDateTime = `${year}${month}${day}T${hours}${minutes}00`;
    const endHour = (parseInt(hours) + 1).toString().padStart(2, '0');
    const endDateTime = `${year}${month}${day}T${endHour}${minutes}00`;
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`RDV ${center.name} - ${serviceInfo}`)}&dates=${startDateTime}/${endDateTime}&ctz=Europe/Paris&details=${encodeURIComponent(`Prestation: ${serviceInfo}\nPrix: ${data.price}€\n${data.notes ? `Notes: ${data.notes}` : ''}`)}&location=${encodeURIComponent(center.address || '')}`;

    let clientEmailHtml = '';
    let subject = '';
    let iconBg = '#10b981';
    let iconEmoji = '✓';

    switch (emailType) {
      case 'request_received':
        iconBg = '#f59e0b';
        iconEmoji = '⏳';
        subject = `📋 Demande de rendez-vous reçue - ${formattedDate}`;
        clientEmailHtml = generateRequestReceivedEmail(center, formattedDate, formattedTime, serviceInfo, data.price);
        break;

      case 'confirmation':
        iconBg = '#10b981';
        iconEmoji = '✓';
        subject = `✅ Rendez-vous confirmé - ${formattedDate}`;
        clientEmailHtml = generateConfirmationEmail(center, formattedDate, formattedTime, serviceInfo, data.price, googleCalendarUrl);
        break;

      case 'refused':
        iconBg = '#ef4444';
        iconEmoji = '✗';
        subject = `❌ Demande de rendez-vous non disponible - ${center.name}`;
        clientEmailHtml = generateRefusedEmail(center, formattedDate, formattedTime, serviceInfo, data.refusal_reason);
        break;

      case 'modified':
        iconBg = '#3b82f6';
        iconEmoji = '✎';
        const newFormattedDate = data.new_date ? formatDate(data.new_date) : formattedDate;
        const newFormattedTime = data.new_time ? formatTime(data.new_time) : formattedTime;
        subject = `📅 Rendez-vous modifié - ${newFormattedDate}`;
        clientEmailHtml = generateModifiedEmail(center, formattedDate, formattedTime, newFormattedDate, newFormattedTime, serviceInfo, data.price);
        break;

      case 'cancelled':
        iconBg = '#6b7280';
        iconEmoji = '⊘';
        subject = `🚫 Rendez-vous annulé - ${formattedDate}`;
        clientEmailHtml = generateCancelledEmail(center, formattedDate, formattedTime, serviceInfo);
        break;

      case 'reminder':
        iconBg = '#10b981';
        iconEmoji = '⏰';
        subject = `⏰ Rappel - Rendez-vous demain ${formattedTime}`;
        clientEmailHtml = generateReminderEmail(center, formattedDate, formattedTime, serviceInfo, data.price, googleCalendarUrl);
        break;
    }

    // Send email to client
    await resend.emails.send({
      from: "CleaningPage <notifications@cleaningpage.com>",
      to: [data.client_email],
      subject,
      html: clientEmailHtml,
    });

    console.log(`[${emailType}] Email sent to client:`, data.client_email);

    // Send notification to owner for new requests
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
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-booking-emails function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

// Email: Demande reçue (en attente de validation)
function generateRequestReceivedEmail(center: any, date: string, time: string, service: string, price: number): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="width: 64px; height: 64px; background: #f59e0b; border-radius: 50%; display: inline-block; line-height: 64px; text-align: center;">
              <span style="color: white; font-size: 32px;">⏳</span>
            </div>
          </div>
          
          <h1 style="color: #111; font-size: 24px; font-weight: 600; text-align: center; margin: 0 0 8px 0;">
            Demande reçue !
          </h1>
          <p style="color: #666; font-size: 16px; text-align: center; margin: 0 0 32px 0;">
            Votre demande de rendez-vous chez ${center.name} a bien été enregistrée.<br/>
            <strong style="color: #f59e0b;">Elle sera confirmée après validation.</strong>
          </p>
          
          <div style="background: #fffbeb; border: 1px solid #fcd34d; border-radius: 12px; padding: 16px; margin-bottom: 24px; text-align: center;">
            <p style="color: #92400e; font-size: 14px; margin: 0;">
              📋 Votre demande est en cours de traitement. Vous recevrez un email de confirmation dès que le prestataire aura validé votre créneau.
            </p>
          </div>
          
          <div style="background: #f9fafb; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <div style="margin-bottom: 16px;">
              <div style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Créneau demandé</div>
              <div style="color: #111; font-size: 18px; font-weight: 600;">${date} à ${time}</div>
            </div>
            
            <div style="margin-bottom: 16px;">
              <div style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Prestation</div>
              <div style="color: #111; font-size: 16px; font-weight: 500;">${service}</div>
            </div>
            
            <div>
              <div style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Prix estimé</div>
              <div style="color: #10b981; font-size: 20px; font-weight: 700;">${price}€</div>
            </div>
          </div>
          
          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 32px;">
            Pour toute question, contactez ${center.name}${center.phone ? ` au ${center.phone}` : ''}.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Email: Rendez-vous confirmé
function generateConfirmationEmail(center: any, date: string, time: string, service: string, price: number, calendarUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="width: 64px; height: 64px; background: #10b981; border-radius: 50%; display: inline-block; line-height: 64px; text-align: center;">
              <span style="color: white; font-size: 32px;">✓</span>
            </div>
          </div>
          
          <h1 style="color: #111; font-size: 24px; font-weight: 600; text-align: center; margin: 0 0 8px 0;">
            Rendez-vous confirmé !
          </h1>
          <p style="color: #666; font-size: 16px; text-align: center; margin: 0 0 32px 0;">
            Votre rendez-vous chez ${center.name} est maintenant confirmé.
          </p>
          
          <div style="background: #f9fafb; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <div style="margin-bottom: 16px;">
              <div style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Date & Heure</div>
              <div style="color: #111; font-size: 18px; font-weight: 600;">${date} à ${time}</div>
            </div>
            
            <div style="margin-bottom: 16px;">
              <div style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Prestation</div>
              <div style="color: #111; font-size: 16px; font-weight: 500;">${service}</div>
            </div>
            
            <div>
              <div style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Prix</div>
              <div style="color: #10b981; font-size: 20px; font-weight: 700;">${price}€</div>
            </div>
          </div>
          
          ${center.address ? `
          <div style="margin-bottom: 24px;">
            <div style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Adresse</div>
            <div style="color: #111; font-size: 14px;">${center.address}</div>
          </div>
          ` : ''}
          
          <div style="text-align: center; margin-top: 32px;">
            <a href="${calendarUrl}" style="display: inline-block; background: #111; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 500; font-size: 14px;">
              📅 Ajouter au calendrier
            </a>
          </div>
          
          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 32px;">
            Pour toute question, contactez ${center.name}${center.phone ? ` au ${center.phone}` : ''}.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Email: Demande refusée
function generateRefusedEmail(center: any, date: string, time: string, service: string, reason?: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="width: 64px; height: 64px; background: #ef4444; border-radius: 50%; display: inline-block; line-height: 64px; text-align: center;">
              <span style="color: white; font-size: 32px;">✗</span>
            </div>
          </div>
          
          <h1 style="color: #111; font-size: 24px; font-weight: 600; text-align: center; margin: 0 0 8px 0;">
            Créneau non disponible
          </h1>
          <p style="color: #666; font-size: 16px; text-align: center; margin: 0 0 32px 0;">
            Malheureusement, le créneau demandé n'est pas disponible.
          </p>
          
          <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <div style="margin-bottom: 16px;">
              <div style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Créneau demandé</div>
              <div style="color: #111; font-size: 16px; text-decoration: line-through;">${date} à ${time}</div>
            </div>
            
            <div>
              <div style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Prestation</div>
              <div style="color: #111; font-size: 16px;">${service}</div>
            </div>
            
            ${reason ? `
            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #fecaca;">
              <div style="color: #dc2626; font-size: 14px;">${reason}</div>
            </div>
            ` : ''}
          </div>
          
          <p style="color: #666; font-size: 14px; text-align: center; margin-bottom: 24px;">
            Nous vous invitons à choisir un autre créneau ou à nous contacter directement.
          </p>
          
          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 32px;">
            Contactez ${center.name}${center.phone ? ` au ${center.phone}` : ''} pour plus d'informations.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Email: Rendez-vous modifié
function generateModifiedEmail(center: any, oldDate: string, oldTime: string, newDate: string, newTime: string, service: string, price: number): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="width: 64px; height: 64px; background: #3b82f6; border-radius: 50%; display: inline-block; line-height: 64px; text-align: center;">
              <span style="color: white; font-size: 32px;">✎</span>
            </div>
          </div>
          
          <h1 style="color: #111; font-size: 24px; font-weight: 600; text-align: center; margin: 0 0 8px 0;">
            Rendez-vous modifié
          </h1>
          <p style="color: #666; font-size: 16px; text-align: center; margin: 0 0 32px 0;">
            Votre rendez-vous chez ${center.name} a été modifié.
          </p>
          
          <div style="background: #fef3c7; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
            <div style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Ancien créneau</div>
            <div style="color: #92400e; font-size: 16px; text-decoration: line-through;">${oldDate} à ${oldTime}</div>
          </div>
          
          <div style="background: #d1fae5; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
            <div style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Nouveau créneau</div>
            <div style="color: #065f46; font-size: 18px; font-weight: 600;">${newDate} à ${newTime}</div>
          </div>
          
          <div style="background: #f9fafb; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <div style="margin-bottom: 16px;">
              <div style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Prestation</div>
              <div style="color: #111; font-size: 16px; font-weight: 500;">${service}</div>
            </div>
            
            <div>
              <div style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Prix</div>
              <div style="color: #10b981; font-size: 20px; font-weight: 700;">${price}€</div>
            </div>
          </div>
          
          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 32px;">
            Pour toute question, contactez ${center.name}${center.phone ? ` au ${center.phone}` : ''}.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Email: Rendez-vous annulé
function generateCancelledEmail(center: any, date: string, time: string, service: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="width: 64px; height: 64px; background: #6b7280; border-radius: 50%; display: inline-block; line-height: 64px; text-align: center;">
              <span style="color: white; font-size: 32px;">⊘</span>
            </div>
          </div>
          
          <h1 style="color: #111; font-size: 24px; font-weight: 600; text-align: center; margin: 0 0 8px 0;">
            Rendez-vous annulé
          </h1>
          <p style="color: #666; font-size: 16px; text-align: center; margin: 0 0 32px 0;">
            Votre rendez-vous chez ${center.name} a été annulé.
          </p>
          
          <div style="background: #f3f4f6; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <div style="margin-bottom: 16px;">
              <div style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Rendez-vous annulé</div>
              <div style="color: #6b7280; font-size: 16px; text-decoration: line-through;">${date} à ${time}</div>
            </div>
            
            <div>
              <div style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Prestation</div>
              <div style="color: #6b7280; font-size: 16px;">${service}</div>
            </div>
          </div>
          
          <p style="color: #666; font-size: 14px; text-align: center; margin-bottom: 24px;">
            N'hésitez pas à reprendre rendez-vous quand vous le souhaitez.
          </p>
          
          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 32px;">
            Contactez ${center.name}${center.phone ? ` au ${center.phone}` : ''} pour plus d'informations.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Email: Rappel
function generateReminderEmail(center: any, date: string, time: string, service: string, price: number, calendarUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="width: 64px; height: 64px; background: #10b981; border-radius: 50%; display: inline-block; line-height: 64px; text-align: center;">
              <span style="color: white; font-size: 32px;">⏰</span>
            </div>
          </div>
          
          <h1 style="color: #111; font-size: 24px; font-weight: 600; text-align: center; margin: 0 0 8px 0;">
            Rappel de votre rendez-vous
          </h1>
          <p style="color: #666; font-size: 16px; text-align: center; margin: 0 0 32px 0;">
            Votre rendez-vous chez ${center.name} approche !
          </p>
          
          <div style="background: #f9fafb; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <div style="margin-bottom: 16px;">
              <div style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Date & Heure</div>
              <div style="color: #111; font-size: 18px; font-weight: 600;">${date} à ${time}</div>
            </div>
            
            <div style="margin-bottom: 16px;">
              <div style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Prestation</div>
              <div style="color: #111; font-size: 16px; font-weight: 500;">${service}</div>
            </div>
            
            <div>
              <div style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Prix</div>
              <div style="color: #10b981; font-size: 20px; font-weight: 700;">${price}€</div>
            </div>
          </div>
          
          ${center.address ? `
          <div style="margin-bottom: 24px;">
            <div style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Adresse</div>
            <div style="color: #111; font-size: 14px;">${center.address}</div>
          </div>
          ` : ''}
          
          <div style="text-align: center; margin-top: 32px;">
            <a href="${calendarUrl}" style="display: inline-block; background: #111; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 500; font-size: 14px;">
              📅 Voir dans le calendrier
            </a>
          </div>
          
          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 32px;">
            Pour toute question, contactez ${center.name}${center.phone ? ` au ${center.phone}` : ''}.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Email: Notification au propriétaire (nouvelle demande)
function generateOwnerNotificationEmail(center: any, data: BookingEmailRequest, date: string, time: string, service: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="width: 64px; height: 64px; background: #f59e0b; border-radius: 50%; display: inline-block; line-height: 64px; text-align: center;">
              <span style="color: white; font-size: 32px;">🔔</span>
            </div>
          </div>
          
          <h1 style="color: #111; font-size: 24px; font-weight: 600; text-align: center; margin: 0 0 8px 0;">
            Nouvelle demande de RDV
          </h1>
          <p style="color: #f59e0b; font-size: 16px; text-align: center; margin: 0 0 32px 0; font-weight: 600;">
            ⏳ En attente de votre validation
          </p>
          
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
            </div>
            ` : ''}
          </div>
          
          <div style="background: #fffbeb; border: 1px solid #fcd34d; border-radius: 12px; padding: 16px; text-align: center;">
            <p style="color: #92400e; font-size: 14px; margin: 0;">
              👉 Connectez-vous à votre dashboard pour <strong>confirmer</strong> ou <strong>refuser</strong> cette demande.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

serve(handler);
