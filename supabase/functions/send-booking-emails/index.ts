import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
}

const formatDate = (dateStr: string): string => {
  // Parse date manually to avoid timezone issues
  // dateStr format: "YYYY-MM-DD"
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day); // month is 0-indexed
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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: BookingEmailRequest = await req.json();

    // Get center info from Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: center, error: centerError } = await supabase
      .from("centers")
      .select("name, email, phone, address")
      .eq("id", data.center_id)
      .single();

    if (centerError || !center) {
      throw new Error("Centre non trouvé");
    }

    const formattedDate = formatDate(data.appointment_date);
    const formattedTime = formatTime(data.appointment_time);
    const serviceInfo = data.variant_name 
      ? `${data.pack_name} - ${data.variant_name}` 
      : data.pack_name;

    // Generate Google Calendar link for client (use Paris timezone)
    // Format dates for Google Calendar: YYYYMMDDTHHmmss
    const [year, month, day] = data.appointment_date.split('-');
    const [hours, minutes] = data.appointment_time.split(':');
    const startDateTime = `${year}${month}${day}T${hours}${minutes}00`;
    // End time: +1 hour
    const endHour = (parseInt(hours) + 1).toString().padStart(2, '0');
    const endDateTime = `${year}${month}${day}T${endHour}${minutes}00`;
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`RDV ${center.name} - ${serviceInfo}`)}&dates=${startDateTime}/${endDateTime}&ctz=Europe/Paris&details=${encodeURIComponent(`Prestation: ${serviceInfo}\nPrix: ${data.price}€\n${data.notes ? `Notes: ${data.notes}` : ''}`)}&location=${encodeURIComponent(center.address || '')}`;

    // 1. Send confirmation email to client
    const clientEmailHtml = `
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
              <div style="width: 64px; height: 64px; background: #10b981; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;">
                  <path d="M20 6L9 17l-5-5" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
            
            <h1 style="color: #111; font-size: 24px; font-weight: 600; text-align: center; margin: 0 0 8px 0;">
              Réservation confirmée !
            </h1>
            <p style="color: #666; font-size: 16px; text-align: center; margin: 0 0 32px 0;">
              Votre rendez-vous chez ${center.name} est enregistré.
            </p>
            
            <div style="background: #f9fafb; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
              <div style="margin-bottom: 16px;">
                <div style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Date & Heure</div>
                <div style="color: #111; font-size: 18px; font-weight: 600;">${formattedDate} à ${formattedTime}</div>
              </div>
              
              <div style="margin-bottom: 16px;">
                <div style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Prestation</div>
                <div style="color: #111; font-size: 16px; font-weight: 500;">${serviceInfo}</div>
              </div>
              
              <div>
                <div style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Prix estimé</div>
                <div style="color: #10b981; font-size: 20px; font-weight: 700;">${data.price}€</div>
              </div>
            </div>
            
            ${center.address ? `
            <div style="margin-bottom: 24px;">
              <div style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Adresse</div>
              <div style="color: #111; font-size: 14px;">${center.address}</div>
            </div>
            ` : ''}
            
            <div style="text-align: center; margin-top: 32px;">
              <a href="${googleCalendarUrl}" style="display: inline-block; background: #111; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 500; font-size: 14px;">
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

    await resend.emails.send({
      from: "CleaningPage <notifications@cleaningpage.com>",
      to: [data.client_email],
      subject: `✅ Rendez-vous confirmé - ${formattedDate}`,
      html: clientEmailHtml,
    });

    console.log("Client confirmation email sent to:", data.client_email);

    // 2. Send notification email to center owner
    if (center.email) {
      const ownerEmailHtml = `
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
                <div style="width: 64px; height: 64px; background: #3b82f6; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
                  <span style="color: white; font-size: 32px;">🗓️</span>
                </div>
              </div>
              
              <h1 style="color: #111; font-size: 24px; font-weight: 600; text-align: center; margin: 0 0 8px 0;">
                Nouvelle réservation !
              </h1>
              <p style="color: #666; font-size: 16px; text-align: center; margin: 0 0 32px 0;">
                Un client vient de réserver un rendez-vous.
              </p>
              
              <div style="background: #f9fafb; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <div style="margin-bottom: 16px;">
                  <div style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Client</div>
                  <div style="color: #111; font-size: 18px; font-weight: 600;">${data.client_name}</div>
                  <div style="color: #666; font-size: 14px;">${data.client_phone}</div>
                  <div style="color: #666; font-size: 14px;">${data.client_email}</div>
                </div>
                
                <div style="margin-bottom: 16px;">
                  <div style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Date & Heure</div>
                  <div style="color: #111; font-size: 18px; font-weight: 600;">${formattedDate} à ${formattedTime}</div>
                </div>
                
                <div style="margin-bottom: 16px;">
                  <div style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Prestation</div>
                  <div style="color: #111; font-size: 16px; font-weight: 500;">${serviceInfo}</div>
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
              
              <p style="color: #999; font-size: 12px; text-align: center; margin-top: 32px;">
                Connectez-vous à votre dashboard pour gérer ce rendez-vous.
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

      await resend.emails.send({
        from: "CleaningPage <notifications@cleaningpage.com>",
        to: [center.email],
        subject: `🗓️ Nouvelle réservation - ${data.client_name} le ${formattedDate}`,
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

serve(handler);
