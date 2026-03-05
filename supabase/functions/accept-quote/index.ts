import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function sendNotificationEmail(
  centerEmail: string,
  centerName: string,
  quoteNumber: string,
  clientName: string,
  total: number
) {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey || !centerEmail) {
    console.warn("[ACCEPT-QUOTE] No Resend key or center email, skipping notification");
    return;
  }

  const formattedTotal = total.toFixed(2).replace(".", ",");

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    <div style="background:linear-gradient(135deg,#10b981,#059669);padding:32px 24px;text-align:center;">
      <div style="width:56px;height:56px;background:rgba(255,255,255,0.2);border-radius:50%;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:28px;">✓</span>
      </div>
      <h1 style="color:#ffffff;font-size:22px;margin:0;">Devis accepté !</h1>
    </div>
    <div style="padding:32px 24px;">
      <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px;">
        Bonne nouvelle ! <strong>${clientName}</strong> a accepté votre devis.
      </p>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:20px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0;color:#6b7280;font-size:14px;">Devis n°</td>
            <td style="padding:8px 0;color:#111827;font-size:14px;font-weight:600;text-align:right;">${quoteNumber}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b7280;font-size:14px;">Client</td>
            <td style="padding:8px 0;color:#111827;font-size:14px;font-weight:600;text-align:right;">${clientName}</td>
          </tr>
          <tr style="border-top:1px solid #d1fae5;">
            <td style="padding:12px 0 8px;color:#6b7280;font-size:14px;">Montant TTC</td>
            <td style="padding:12px 0 8px;color:#059669;font-size:20px;font-weight:700;text-align:right;">${formattedTotal} €</td>
          </tr>
        </table>
      </div>
      <p style="color:#6b7280;font-size:13px;line-height:1.5;margin:24px 0 0;text-align:center;">
        Vous pouvez retrouver ce devis dans votre espace <strong>Factures & Devis</strong>.
      </p>
    </div>
    <div style="background:#f9fafb;padding:16px 24px;text-align:center;border-top:1px solid #f3f4f6;">
      <p style="color:#9ca3af;font-size:12px;margin:0;">${centerName} • via CleaningPage</p>
    </div>
  </div>
</body>
</html>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: `CleaningPage <noreply@cleaningpage.com>`,
        to: [centerEmail],
        subject: `✅ Devis ${quoteNumber} accepté par ${clientName}`,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[ACCEPT-QUOTE] Email send failed:", err);
    } else {
      console.log(`[ACCEPT-QUOTE] Notification sent to ${centerEmail}`);
    }
  } catch (e) {
    console.error("[ACCEPT-QUOTE] Email error:", e);
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Token manquant" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find quote by acceptance token
    const { data: quote, error: fetchError } = await supabase
      .from("invoices")
      .select("id, number, type, status, client_name, total, center_id")
      .eq("acceptance_token", token)
      .eq("type", "quote")
      .single();

    if (fetchError || !quote) {
      return new Response(
        JSON.stringify({ error: "Devis introuvable ou lien invalide" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get center info (needed for both paths)
    const { data: center } = await supabase
      .from("centers")
      .select("name, email")
      .eq("id", quote.center_id)
      .single();

    // Check if already accepted
    if (quote.status === "accepted") {
      return new Response(
        JSON.stringify({
          success: true,
          already_accepted: true,
          quote_number: quote.number,
          client_name: quote.client_name,
          total: quote.total,
          center_name: center?.name || "",
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Update status to accepted
    const { error: updateError } = await supabase
      .from("invoices")
      .update({ status: "accepted" })
      .eq("id", quote.id);

    if (updateError) {
      console.error("[ACCEPT-QUOTE] Update error:", updateError);
      return new Response(
        JSON.stringify({ error: "Erreur lors de la validation du devis" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`[ACCEPT-QUOTE] Quote ${quote.number} accepted by ${quote.client_name}`);

    // Send notification email to the professional (fire-and-forget)
    if (center?.email) {
      sendNotificationEmail(
        center.email,
        center.name || "",
        quote.number,
        quote.client_name,
        quote.total
      ).catch((e) => console.error("[ACCEPT-QUOTE] Notification error:", e));
    }

    return new Response(
      JSON.stringify({
        success: true,
        already_accepted: false,
        quote_number: quote.number,
        client_name: quote.client_name,
        total: quote.total,
        center_name: center?.name || "",
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("[ACCEPT-QUOTE] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
