import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[REFUND-DEPOSIT] ${step}${detailsStr}`);
};

function getStripeKey(paymentsMode: string): string {
  if (paymentsMode === "test") {
    const testKey = Deno.env.get("STRIPE_TEST_SECRET_KEY");
    if (!testKey) throw new Error("STRIPE_TEST_SECRET_KEY is not set");
    return testKey;
  }
  const liveKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!liveKey) throw new Error("STRIPE_SECRET_KEY is not set");
  return liveKey;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Auth check - only center owner can refund
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub;

    const { appointment_id } = await req.json();
    if (!appointment_id) throw new Error("Missing appointment_id");

    // Use service role for data operations
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get appointment with center info
    const { data: appointment, error: aptError } = await adminClient
      .from("appointments")
      .select("*, centers!appointments_center_id_fkey(id, owner_id, stripe_connect_account_id, payments_mode)")
      .eq("id", appointment_id)
      .single();

    if (aptError || !appointment) throw new Error("Appointment not found");

    const center = (appointment as any).centers;
    if (!center) throw new Error("Center not found");

    // Verify ownership
    if (center.owner_id !== userId) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify deposit is paid and not already refunded
    if (appointment.deposit_status !== "paid") {
      throw new Error("No paid deposit to refund");
    }
    if (appointment.deposit_refund_status === "refunded") {
      throw new Error("Deposit already refunded");
    }

    logStep("Refunding deposit", { appointmentId: appointment_id, amount: appointment.deposit_amount });

    const paymentsMode = center.payments_mode || "live";
    const stripeKey = getStripeKey(paymentsMode);
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Find the payment intent from the checkout session
    const sessionId = appointment.deposit_checkout_session_id;
    if (!sessionId) throw new Error("No checkout session found");

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paymentIntentId = session.payment_intent as string;
    if (!paymentIntentId) throw new Error("No payment intent found");

    // Create the refund
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      reason: "requested_by_customer",
    });

    logStep("Refund created", { refundId: refund.id, status: refund.status });

    // Update appointment
    await adminClient
      .from("appointments")
      .update({
        deposit_refund_status: "refunded",
        deposit_payment_intent_id: paymentIntentId,
      })
      .eq("id", appointment_id);

    logStep("Appointment updated with refund status");

    return new Response(JSON.stringify({ success: true, refund_id: refund.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
