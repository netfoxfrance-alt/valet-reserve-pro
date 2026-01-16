import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConfirmationRequest {
  appointment_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { appointment_id }: ConfirmationRequest = await req.json();

    if (!appointment_id) {
      throw new Error("appointment_id is required");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Récupérer les infos du RDV avec le centre et le pack
    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .select(`
        *,
        center:centers(name, email, address, city, phone, slug),
        pack:packs(name, price, duration)
      `)
      .eq("id", appointment_id)
      .single();

    if (appointmentError || !appointment) {
      throw new Error("Appointment not found");
    }

    const clientEmail = appointment.client_email;
    if (!clientEmail) {
      throw new Error("Client email not found");
    }

    // Formater la date
    const date = new Date(appointment.appointment_date);
    const formattedDate = date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const vehicleLabels: Record<string, string> = {
      citadine: "Citadine",
      berline: "Berline",
      suv: "SUV / 4x4",
      utilitaire: "Utilitaire",
    };

    // Générer le lien Google Calendar
    const startDateTime = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // +1h par défaut
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`RDV ${appointment.center?.name}`)}&dates=${startDateTime.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}/${endDateTime.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}&details=${encodeURIComponent(`Prestation: ${appointment.pack?.name || "Non spécifié"}\nVéhicule: ${vehicleLabels[appointment.vehicle_type] || appointment.vehicle_type}`)}&location=${encodeURIComponent(appointment.center?.address ? `${appointment.center.address}, ${appointment.center.city}` : "")}`;

    const emailResponse = await resend.emails.send({
      from: "CleaningPage <notifications@cleaningpage.com>",
      to: [clientEmail],
      subject: `✅ RDV confirmé - ${formattedDate} à ${appointment.appointment_time}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            
            <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">
                ✅ Rendez-vous confirmé !
              </h1>
            </div>
            
            <div style="padding: 32px;">
              <p style="color: #374151; font-size: 16px; margin: 0 0 24px;">
                Bonjour <strong>${appointment.client_name}</strong>,<br><br>
                Votre rendez-vous chez <strong>${appointment.center?.name}</strong> a été confirmé.
              </p>
              
              <div style="background: #ecfdf5; border: 2px solid #10b981; border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center;">
                <p style="color: #065f46; font-size: 14px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">Votre rendez-vous</p>
                <p style="color: #047857; font-size: 28px; font-weight: 700; margin: 0;">
                  ${formattedDate}
                </p>
                <p style="color: #047857; font-size: 32px; font-weight: 700; margin: 8px 0 0;">
                  ${appointment.appointment_time}
                </p>
              </div>
              
              <div style="background: #f9fafb; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <h2 style="color: #111827; font-size: 18px; margin: 0 0 16px;">📋 Récapitulatif</h2>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Centre</td>
                    <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 500; text-align: right;">${appointment.center?.name}</td>
                  </tr>
                  ${appointment.center?.address ? `
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Adresse</td>
                    <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right;">${appointment.center.address}, ${appointment.center.city}</td>
                  </tr>
                  ` : ""}
                  ${appointment.center?.phone ? `
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Téléphone</td>
                    <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right;">${appointment.center.phone}</td>
                  </tr>
                  ` : ""}
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Véhicule</td>
                    <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right;">${vehicleLabels[appointment.vehicle_type] || appointment.vehicle_type}</td>
                  </tr>
                  ${appointment.pack ? `
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Prestation</td>
                    <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right;">${appointment.pack.name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Prix</td>
                    <td style="padding: 8px 0; color: #10b981; font-size: 16px; font-weight: 600; text-align: right;">${appointment.pack.price}€</td>
                  </tr>
                  ` : ""}
                </table>
              </div>
              
              <a href="${googleCalendarUrl}" style="display: block; background: #111827; color: white; text-decoration: none; padding: 16px 24px; border-radius: 12px; text-align: center; font-weight: 600; font-size: 16px; margin-bottom: 12px;">
                📅 Ajouter à mon calendrier
              </a>
              
              <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
                Compatible Google Calendar, Outlook et autres
              </p>
            </div>
            
            <div style="background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px;">
                En cas d'empêchement, contactez directement le centre.
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                Cet email a été envoyé automatiquement par CleaningPage
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Confirmation email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-confirmation-to-client:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
