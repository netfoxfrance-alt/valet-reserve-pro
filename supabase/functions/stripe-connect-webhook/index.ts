import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-CONNECT-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Webhooks are POST only
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_CONNECT_WEBHOOK_SECRET");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    if (!webhookSecret) throw new Error("STRIPE_CONNECT_WEBHOOK_SECRET is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) throw new Error("No stripe-signature header");

    // Verify the webhook signature
    const event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    logStep("Event verified", { type: event.type, id: event.id });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const appointmentId = session.metadata?.appointment_id;

        if (appointmentId) {
          logStep("Deposit payment completed", { appointmentId, sessionId: session.id });

          await supabaseClient
            .from("appointments")
            .update({ deposit_status: "paid" })
            .eq("id", appointmentId)
            .eq("deposit_checkout_session_id", session.id);

          logStep("Appointment deposit status updated to paid");
        }
        break;
      }

      case "account.updated": {
        const account = event.data.object as Stripe.Account;
        logStep("Account updated", { accountId: account.id, chargesEnabled: account.charges_enabled });

        const newStatus = account.charges_enabled ? "active" : "pending";

        await supabaseClient
          .from("centers")
          .update({ stripe_connect_status: newStatus })
          .eq("stripe_connect_account_id", account.id);

        logStep("Center status updated", { accountId: account.id, newStatus });
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }
});
