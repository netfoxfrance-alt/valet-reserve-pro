-- Remove the overly permissive policy we just created
DROP POLICY IF EXISTS "Public can view centers via public view" ON public.centers;

-- Recreate the public view WITHOUT security_invoker so it runs as the view owner (definer)
-- This means the view can read from centers without needing public RLS on the base table
DROP VIEW IF EXISTS public.public_centers_view;

CREATE VIEW public.public_centers_view AS
  SELECT id, slug, name, address, phone, logo_url, welcome_message,
         customization, ai_enabled, subscription_plan, created_at, updated_at
  FROM centers;

COMMENT ON VIEW public.public_centers_view IS 'Public-safe view of centers, excluding sensitive data like email, stripe IDs, ical_token, and owner_id';

-- Grant SELECT on the view to anon and authenticated roles
GRANT SELECT ON public.public_centers_view TO anon, authenticated;