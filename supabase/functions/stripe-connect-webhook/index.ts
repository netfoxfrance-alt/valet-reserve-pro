import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-CONNECT-WEBHOOK] ${step}${detailsStr}`);
};

/**
 * Try to verify the webhook signature against both live and test secrets.
 * Returns the verified event or throws.
 */
async function verifyWebhookEvent(stripe: Stripe, body: string, signature: string): Promise<Stripe.Event> {
  const liveSecret = Deno.env.get("STRIPE_CONNECT_WEBHOOK_SECRET");
  const testSecret = Deno.env.get("STRIPE_TEST_CONNECT_WEBHOOK_SECRET");

  // Try live secret first
  if (liveSecret) {
    try {
      return await stripe.webhooks.constructEventAsync(body, signature, liveSecret);
    } catch {
      // fall through to test secret
    }
  }

  // Try test secret
  if (testSecret) {
    try {
      return await stripe.webhooks.constructEventAsync(body, signature, testSecret);
    } catch {
      // fall through
    }
  }

  throw new Error("Webhook signature verification failed for both live and test secrets");
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) throw new Error("No stripe-signature header");

    // Verify against both live and test webhook secrets
    const event = await verifyWebhookEvent(stripe, body, signature);
    logStep("Event verified", { type: event.type, id: event.id, livemode: event.livemode });

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
          logStep("Deposit payment completed", { appointmentId, sessionId: session.id, livemode: event.livemode });

          // Get payment_intent_id from session
          const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : null;

          // Update deposit status to paid AND auto-confirm the appointment
          const { data: updatedApt } = await supabaseClient
            .from("appointments")
            .update({ 
              deposit_status: "paid",
              status: "confirmed",
              deposit_payment_intent_id: paymentIntentId,
            })
            .eq("id", appointmentId)
            .eq("deposit_checkout_session_id", session.id)
            .select("*, centers!appointments_center_id_fkey(name, email, phone, address, email_language), packs(name)")
            .single();

          logStep("Appointment deposit status updated to paid and status set to confirmed");

          // Send confirmation email to client and pro
          if (updatedApt) {
            const centerData = (updatedApt as any).centers;
            const packData = (updatedApt as any).packs;
            const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";

            try {
              const emailPayload = {
                center_id: updatedApt.center_id,
                client_name: updatedApt.client_name,
                client_email: updatedApt.client_email,
                client_phone: updatedApt.client_phone,
                pack_name: packData?.name || updatedApt.vehicle_type || "Prestation",
                price: updatedApt.custom_price || 0,
                appointment_date: updatedApt.appointment_date,
                appointment_time: updatedApt.appointment_time,
                email_type: "confirmation",
              };

              const emailRes = await fetch(`${supabaseUrl}/functions/v1/send-booking-emails`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
                },
                body: JSON.stringify(emailPayload),
              });

              logStep("Confirmation email sent", { status: emailRes.status });
            } catch (emailError) {
              logStep("Email sending failed (non-blocking)", { error: String(emailError) });
            }
          }
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
