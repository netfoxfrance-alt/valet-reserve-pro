import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[COMPLETE-SIGNUP] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase credentials not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    const { session_id, password } = await req.json();
    if (!session_id || !password) {
      throw new Error("Missing session_id or password");
    }
    logStep("Received request", { session_id });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    // Get the checkout session to retrieve customer email
    const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);
    if (!checkoutSession.customer_email && !checkoutSession.customer_details?.email) {
      throw new Error("No email found in checkout session");
    }
    
    const email = checkoutSession.customer_email || checkoutSession.customer_details?.email;
    logStep("Retrieved email from Stripe session", { email });

    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === email);
    
    if (existingUser) {
      logStep("User already exists", { userId: existingUser.id });
      return new Response(JSON.stringify({ 
        success: true, 
        message: "User already exists",
        email 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Create the user with the password they provided
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: email!,
      password: password,
      email_confirm: true, // Auto-confirm since they paid
    });

    if (createError) {
      logStep("Error creating user", { error: createError.message });
      throw new Error(`Failed to create user: ${createError.message}`);
    }

    logStep("User created successfully", { userId: newUser.user?.id });

    // The handle_new_user trigger will automatically create the center and role

    return new Response(JSON.stringify({ 
      success: true,
      email,
      message: "Account created successfully"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in complete-signup", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
