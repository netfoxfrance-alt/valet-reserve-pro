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

// Generate a clean slug from business name
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '') // Trim hyphens from start/end
    .substring(0, 30); // Limit length
};

// Find an available slug, adding suffix if needed
const findAvailableSlug = async (
  supabase: any, 
  baseSlug: string
): Promise<string> => {
  // First try the base slug
  const { data: existing } = await supabase
    .from('centers')
    .select('id')
    .eq('slug', baseSlug)
    .maybeSingle();
  
  if (!existing) {
    return baseSlug;
  }

  // If taken, try with numeric suffix
  for (let i = 2; i <= 99; i++) {
    const slugWithSuffix = `${baseSlug}-${i}`;
    const { data } = await supabase
      .from('centers')
      .select('id')
      .eq('slug', slugWithSuffix)
      .maybeSingle();
    
    if (!data) {
      return slugWithSuffix;
    }
  }

  // Fallback: add random chars
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return `${baseSlug}-${randomSuffix}`;
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

    const { session_id, password, business_name } = await req.json();
    if (!session_id || !password) {
      throw new Error("Missing session_id or password");
    }
    logStep("Received request", { session_id, business_name });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    // Get the checkout session to retrieve customer email
    // Expand customer to get email if customer object was created
    const checkoutSession = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['customer']
    });
    
    logStep("Checkout session retrieved", { 
      status: checkoutSession.status,
      payment_status: checkoutSession.payment_status,
      customer: checkoutSession.customer,
      customer_email: checkoutSession.customer_email,
      customer_details: checkoutSession.customer_details
    });

    // Try multiple sources to find the email
    let email: string | null = null;
    
    // 1. Direct customer_email field
    if (checkoutSession.customer_email) {
      email = checkoutSession.customer_email;
    }
    // 2. Customer details from checkout
    else if (checkoutSession.customer_details?.email) {
      email = checkoutSession.customer_details.email;
    }
    // 3. If customer object was expanded, get email from there
    else if (typeof checkoutSession.customer === 'object' && checkoutSession.customer?.email) {
      email = checkoutSession.customer.email;
    }
    // 4. If customer is just an ID, fetch the customer
    else if (typeof checkoutSession.customer === 'string') {
      const customer = await stripe.customers.retrieve(checkoutSession.customer);
      if (customer && !customer.deleted && 'email' in customer && customer.email) {
        email = customer.email;
      }
    }

    if (!email) {
      logStep("No email found in any source");
      throw new Error("No email found in checkout session. Please contact support.");
    }
    
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

    // Generate the clean slug from business name
    const centerName = business_name?.trim() || 'Mon Centre';
    const baseSlug = generateSlug(centerName);
    const finalSlug = await findAvailableSlug(supabase, baseSlug || 'centre');
    logStep("Generated slug", { baseSlug, finalSlug });

    // Create the user with the password they provided
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: email!,
      password: password,
      email_confirm: true,
    });

    if (createError) {
      logStep("Error creating user", { error: createError.message });
      throw new Error(`Failed to create user: ${createError.message}`);
    }

    logStep("User created successfully", { userId: newUser.user?.id });

    // Update the center that was created by the trigger with the proper name, slug, and subscription_plan
    const { error: updateError } = await supabase
      .from('centers')
      .update({ 
        name: centerName,
        slug: finalSlug,
        subscription_plan: 'trial' // User just paid, set to trial immediately
      })
      .eq('owner_id', newUser.user!.id);

    if (updateError) {
      logStep("Error updating center", { error: updateError.message });
      // Don't throw - the center was created, just with default values
    } else {
      logStep("Center updated with custom name, slug and trial plan", { name: centerName, slug: finalSlug });
    }

    return new Response(JSON.stringify({ 
      success: true,
      email,
      slug: finalSlug,
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
