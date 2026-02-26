
-- Fix: make view use invoker security (default) explicitly
DROP VIEW IF EXISTS public_centers_view;
CREATE VIEW public_centers_view WITH (security_invoker = true) AS
SELECT 
  id, slug, name, address, phone,
  logo_url, welcome_message, ai_enabled,
  subscription_plan, customization,
  latitude, longitude, intervention_radius_km,
  deposit_enabled, deposit_type, deposit_value,
  stripe_connect_status,
  quote_form_message,
  cancellation_policy,
  created_at, updated_at
FROM public.centers;
