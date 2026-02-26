import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-DEPOSIT-CHECKOUT] ${step}${detailsStr}`);
};

/** Pick the right Stripe key based on center's payments_mode */
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

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { appointment_id } = await req.json();
    if (!appointment_id) throw new Error("Missing appointment_id");
    logStep("Appointment ID received", { appointment_id });

    // Get the appointment with center info including payments_mode
    const { data: appointment, error: aptError } = await supabaseClient
      .from("appointments")
      .select("*, centers!appointments_center_id_fkey(id, name, stripe_connect_account_id, stripe_connect_status, deposit_enabled, deposit_type, deposit_value, payments_mode)")
      .eq("id", appointment_id)
      .single();

    if (aptError || !appointment) throw new Error("Appointment not found");

    // Protect against double payment
    if (appointment.deposit_status === 'paid') {
      logStep("Deposit already paid, rejecting");
      return new Response(JSON.stringify({ error: "Acompte déjà payé pour ce rendez-vous." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const center = (appointment as any).centers;
    if (!center) throw new Error("Center not found");

    const paymentsMode = center.payments_mode || "live";
    logStep("Appointment and center found", { centerId: center.id, depositEnabled: center.deposit_enabled, paymentsMode });

    // Validate deposit is enabled and Stripe Connect is active
    if (!center.deposit_enabled) throw new Error("Deposits are not enabled for this center");
    if (center.stripe_connect_status !== "active") throw new Error("Center's Stripe Connect is not active");
    if (!center.stripe_connect_account_id) throw new Error("No Stripe Connect account");

    // Calculate deposit amount
    let depositAmount: number;
    const servicePrice = appointment.custom_price || 0;

    if (center.deposit_type === "percentage") {
      depositAmount = Math.round(servicePrice * (center.deposit_value / 100) * 100) / 100;
    } else {
      depositAmount = center.deposit_value;
    }

    if (depositAmount <= 0) throw new Error("Invalid deposit amount");
    if (depositAmount > 50) depositAmount = 50;
    logStep("Deposit amount calculated", { depositAmount, servicePrice, type: center.deposit_type, value: center.deposit_value });

    const stripeKey = getStripeKey(paymentsMode);
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const origin = req.headers.get("origin") || "https://lovable.dev";

    // Create the Checkout session with transfer_data to the pro's connected account
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Acompte - ${center.name}`,
              description: `Réservation du ${appointment.appointment_date} à ${appointment.appointment_time}`,
            },
            unit_amount: Math.round(depositAmount * 100),
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        transfer_data: {
          destination: center.stripe_connect_account_id,
        },
      },
      customer_email: appointment.client_email,
      success_url: `${origin}/deposit-success?session_id={CHECKOUT_SESSION_ID}&appointment_id=${appointment_id}`,
      cancel_url: `${origin}/deposit-cancel?appointment_id=${appointment_id}`,
      metadata: {
        appointment_id: appointment_id,
        center_id: center.id,
      },
    });

    logStep("Checkout session created", { sessionId: session.id, mode: paymentsMode });

    // Update the appointment with deposit info
    await supabaseClient
      .from("appointments")
      .update({
        deposit_amount: depositAmount,
        deposit_status: "pending",
        deposit_checkout_session_id: session.id,
      })
      .eq("id", appointment_id);

    logStep("Appointment updated with deposit info");

    return new Response(JSON.stringify({ url: session.url, deposit_amount: depositAmount }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: "Impossible de créer le paiement. Veuillez réessayer." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
