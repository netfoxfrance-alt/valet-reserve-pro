
-- Update public_centers_view to expose deposit settings for the booking page
CREATE OR REPLACE VIEW public.public_centers_view WITH (security_invoker = on) AS
SELECT
  c.id,
  c.slug,
  c.name,
  c.address,
  c.phone,
  c.logo_url,
  c.welcome_message,
  c.customization,
  c.ai_enabled,
  c.subscription_plan,
  c.latitude,
  c.longitude,
  c.intervention_radius_km,
  c.created_at,
  c.updated_at,
  c.quote_form_message,
  c.deposit_enabled,
  c.deposit_type,
  c.deposit_value,
  c.stripe_connect_status
FROM public.centers c;
