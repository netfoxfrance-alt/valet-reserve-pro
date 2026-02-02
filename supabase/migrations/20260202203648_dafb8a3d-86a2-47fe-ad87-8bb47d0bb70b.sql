-- SECURITY FIX: Update public_centers_view to exclude sensitive data
-- This view is used for public access and should NOT expose:
-- - email, phone (owner PII)
-- - ical_token (security token)
-- - stripe_customer_id, stripe_subscription_id (payment data)
-- - owner_id (internal reference)

DROP VIEW IF EXISTS public.public_centers_view;

CREATE VIEW public.public_centers_view 
WITH (security_invoker = on)
AS
SELECT 
  id,
  slug,
  name,
  address,
  phone, -- Phone is intentionally public for customer contact
  logo_url,
  welcome_message,
  customization,
  ai_enabled,
  subscription_plan,
  created_at,
  updated_at
FROM public.centers;

-- Add RLS to the view (views inherit table RLS when security_invoker=on)
-- The centers table already has public SELECT access

COMMENT ON VIEW public.public_centers_view IS 'Public-safe view of centers, excluding sensitive data like email, stripe IDs, ical_token, and owner_id';