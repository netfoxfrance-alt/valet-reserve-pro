import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CONNECT-ACCOUNT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Get the user's center
    const { data: center, error: centerError } = await supabaseClient
      .from("centers")
      .select("id, stripe_connect_account_id, stripe_connect_status, name")
      .eq("owner_id", user.id)
      .single();

    if (centerError || !center) throw new Error("Center not found");
    logStep("Center found", { centerId: center.id, currentStatus: center.stripe_connect_status });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const origin = req.headers.get("origin") || "https://lovable.dev";

    const { action } = await req.json().catch(() => ({ action: "onboard" }));

    // If already has an account, check if we need a new onboarding link or a login link
    if (center.stripe_connect_account_id) {
      const account = await stripe.accounts.retrieve(center.stripe_connect_account_id);
      logStep("Existing account retrieved", { accountId: account.id, chargesEnabled: account.charges_enabled });

      if (account.charges_enabled) {
        // Account is fully onboarded
        await supabaseClient
          .from("centers")
          .update({ stripe_connect_status: "active" })
          .eq("id", center.id);

        // Create a login link to the Stripe Express dashboard
        const loginLink = await stripe.accounts.createLoginLink(account.id);
        return new Response(JSON.stringify({ url: loginLink.url, status: "active" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Account exists but not fully onboarded — create new onboarding link
      const accountLink = await stripe.accountLinks.create({
        account: center.stripe_connect_account_id,
        refresh_url: `${origin}/dashboard/settings?connect=refresh`,
        return_url: `${origin}/dashboard/settings?connect=success`,
        type: "account_onboarding",
      });

      logStep("Re-onboarding link created");
      return new Response(JSON.stringify({ url: accountLink.url, status: "pending" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create a new Stripe Express account
    const account = await stripe.accounts.create({
      type: "express",
      email: user.email,
      business_profile: {
        name: center.name || undefined,
      },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    logStep("New Express account created", { accountId: account.id });

    // Store the account ID in the center
    await supabaseClient
      .from("centers")
      .update({
        stripe_connect_account_id: account.id,
        stripe_connect_status: "pending",
      })
      .eq("id", center.id);

    // Create the onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${origin}/dashboard/settings?connect=refresh`,
      return_url: `${origin}/dashboard/settings?connect=success`,
      type: "account_onboarding",
    });

    logStep("Onboarding link created", { url: accountLink.url });

    return new Response(JSON.stringify({ url: accountLink.url, status: "pending" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });

    // Stripe platform profile not configured
    let userMessage = "Impossible de créer le compte. Veuillez réessayer.";
    if (errorMessage.includes("platform-profile") || errorMessage.includes("responsibilities")) {
      userMessage = "Votre compte Stripe plateforme n'est pas encore configuré. Veuillez valider votre profil Connect sur dashboard.stripe.com/settings/connect avant de continuer.";
    }

    return new Response(JSON.stringify({ error: userMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
