import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      throw new Error("No authorization header provided");
    }
    logStep("Authorization header found");

    // Create client with user's auth header for getClaims
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify JWT and get claims
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      throw new Error(`Authentication error: ${claimsError?.message || "Invalid token"}`);
    }

    const userId = claimsData.claims.sub as string;
    const userEmail = claimsData.claims.email as string;
    if (!userId || !userEmail) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId, email: userEmail });

    // Create service role client for database operations
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Admin bypass - always return subscribed for admin emails
    const adminEmails = ["melvin.puyoo@gmail.com"];
    if (adminEmails.includes(userEmail.toLowerCase())) {
      logStep("Admin user detected, bypassing Stripe check");
      
      // Ensure admin is marked as pro in database
      await supabaseClient
        .from('centers')
        .update({ subscription_plan: 'pro' })
        .eq('owner_id', userId);
      
      return new Response(JSON.stringify({
        subscribed: true,
        product_id: "admin_bypass",
        subscription_end: null
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: userEmail, limit: 1 });

    if (customers.data.length === 0) {
      logStep("No customer found, user is not subscribed");
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 10,
    });
    
    logStep("Subscriptions retrieved", { count: subscriptions.data.length });

    const eligible = subscriptions.data.find((s: any) => s.status === "active" || s.status === "trialing");
    const hasActiveSub = Boolean(eligible);
    let subscriptionEnd = null;
    let productId = null;

    if (hasActiveSub && eligible) {
      const subscription = eligible;
      
      // Handle current_period_end - it can be a number (timestamp) or already a Date object
      const periodEnd = subscription.current_period_end;
      if (periodEnd) {
        // If it's a number, multiply by 1000, otherwise try to use it directly
        const timestamp = typeof periodEnd === 'number' ? periodEnd * 1000 : new Date(periodEnd).getTime();
        if (!isNaN(timestamp)) {
          subscriptionEnd = new Date(timestamp).toISOString();
        }
      }
      
      productId = subscription.items.data[0]?.price?.product || null;
      logStep("Eligible subscription found", { status: subscription.status, subscriptionId: subscription.id, endDate: subscriptionEnd, productId });

      const nextPlan = subscription.status === "trialing" ? "trial" : "pro";

      // Update the center's subscription_plan accordingly
      const { error: updateError } = await supabaseClient
        .from('centers')
        .update({ subscription_plan: nextPlan })
        .eq('owner_id', userId);

      if (updateError) {
        logStep("Error updating subscription plan", { error: updateError.message });
      } else {
        logStep(`Updated center subscription plan to ${nextPlan}`);
      }
    } else {
      logStep("No active subscription found");
      
      // Update the center's subscription_plan to 'free' if no active subscription
      const { error: updateError } = await supabaseClient
        .from('centers')
        .update({ subscription_plan: 'free' })
        .eq('owner_id', userId);

      if (updateError) {
        logStep("Error updating subscription plan to free", { error: updateError.message });
      }
    }

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      product_id: productId,
      subscription_end: subscriptionEnd
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
