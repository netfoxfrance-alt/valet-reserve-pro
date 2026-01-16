import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingNotificationRequest {
  appointment_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { appointment_id }: BookingNotificationRequest = await req.json();

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
        center:centers(name, email, slug),
        pack:packs(name, price)
      `)
      .eq("id", appointment_id)
      .single();

    if (appointmentError || !appointment) {
      throw new Error("Appointment not found");
    }

    const centerEmail = appointment.center?.email;
    if (!centerEmail) {
      throw new Error("Center email not found");
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

    const emailResponse = await resend.emails.send({
      from: "CleaningPage <notifications@cleaningpage.com>",
      to: [centerEmail],
      subject: `🚗 Nouvelle réservation - ${appointment.client_name}`,
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
                🎉 Nouvelle réservation !
              </h1>
            </div>
            
            <div style="padding: 32px;">
              <p style="color: #374151; font-size: 16px; margin: 0 0 24px;">
                Vous avez reçu une nouvelle demande de rendez-vous pour <strong>${appointment.center?.name}</strong>.
              </p>
              
              <div style="background: #f9fafb; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <h2 style="color: #111827; font-size: 18px; margin: 0 0 16px;">📋 Détails du rendez-vous</h2>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Client</td>
                    <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 500; text-align: right;">${appointment.client_name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Email</td>
                    <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right;">${appointment.client_email}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Téléphone</td>
                    <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right;">${appointment.client_phone}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Véhicule</td>
                    <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right;">${vehicleLabels[appointment.vehicle_type] || appointment.vehicle_type}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Date</td>
                    <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 500; text-align: right;">${formattedDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Heure</td>
                    <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 500; text-align: right;">${appointment.appointment_time}</td>
                  </tr>
                  ${appointment.pack ? `
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Prestation</td>
                    <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right;">${appointment.pack.name} - ${appointment.pack.price}€</td>
                  </tr>
                  ` : ""}
                  ${appointment.notes ? `
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Notes</td>
                    <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right;">${appointment.notes}</td>
                  </tr>
                  ` : ""}
                </table>
              </div>
              
              <a href="https://cleaningpage.com/dashboard" style="display: block; background: #10b981; color: white; text-decoration: none; padding: 16px 24px; border-radius: 12px; text-align: center; font-weight: 600; font-size: 16px;">
                Voir dans mon tableau de bord
              </a>
            </div>
            
            <div style="background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                Cet email a été envoyé automatiquement par CleaningPage
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-booking-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
