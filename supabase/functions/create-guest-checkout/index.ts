import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-GUEST-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const origin = req.headers.get("origin") || "https://lovable.dev";
    
    // Create checkout session for guest (no auth required)
    // customer_creation: "always" ensures a Stripe customer is created
    // This allows us to retrieve the email from the session later
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: "price_1SmBmWCc0FFxbAQWPWdxSKXX",
          quantity: 1,
        },
      ],
      mode: "subscription",
      customer_creation: "always",
      subscription_data: {
        trial_period_days: 30,
        description: "Page vitrine personnalisable, réservation automatique, agenda intégré, statistiques et gestion complète",
      },
      custom_text: {
        submit: {
          message: "Essayez 30 jours gratuitement, sans aucun engagement. Résiliez à tout moment si vous ne souhaitez pas poursuivre. Vous ne serez débité que si vous continuez après l'essai.",
        },
      },
      success_url: `${origin}/complete-signup?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?payment=cancelled`,
      payment_method_collection: "always",
      // Collect billing address to ensure we have customer details
      billing_address_collection: "auto",
    });

    logStep("Guest checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-guest-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
