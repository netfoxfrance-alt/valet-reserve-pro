import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

    // Check if already accepted
    if (quote.status === "accepted") {
      // Get center name for the response
      const { data: center } = await supabase
        .from("centers")
        .select("name")
        .eq("id", quote.center_id)
        .single();

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

    // Get center name
    const { data: center } = await supabase
      .from("centers")
      .select("name")
      .eq("id", quote.center_id)
      .single();

    console.log(`[ACCEPT-QUOTE] Quote ${quote.number} accepted by ${quote.client_name}`);

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
