
-- Drop and recreate the view with new columns
DROP VIEW IF EXISTS public.public_centers_view;

CREATE VIEW public.public_centers_view WITH (security_invoker = false) AS
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
  c.updated_at
FROM centers c;
