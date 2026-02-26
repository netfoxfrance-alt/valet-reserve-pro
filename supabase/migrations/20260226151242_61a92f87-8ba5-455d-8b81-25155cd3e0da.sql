
-- Drop and recreate view with correct column order
DROP VIEW IF EXISTS public.public_centers_view;

CREATE VIEW public.public_centers_view WITH (security_invoker = on) AS
SELECT
  c.id,
  c.slug,
  c.name,
  c.address,
  c.phone,
  c.logo_url,
  c.welcome_message,
  c.ai_enabled,
  c.subscription_plan,
  c.customization,
  c.latitude,
  c.longitude,
  c.intervention_radius_km,
  c.deposit_enabled,
  c.deposit_type,
  c.deposit_value,
  c.stripe_connect_status,
  c.quote_form_message,
  c.created_at,
  c.updated_at
FROM public.centers c;
