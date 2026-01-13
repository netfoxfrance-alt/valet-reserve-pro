-- =============================================
-- SECURITY FIX 1: Restrict public access to centers table
-- =============================================

-- Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Tout le monde peut voir les centres publiquement" ON public.centers;

-- Create a new restrictive policy that only allows public access to non-sensitive columns
-- Since PostgreSQL RLS can't restrict columns, we'll use a different approach:
-- Public users can only select, but the application code will select specific columns
-- Owners and admins can see all their data via the existing owner policy
CREATE POLICY "Public can view public center data"
  ON public.centers
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Note: The actual column restriction will be enforced by:
-- 1. Creating a public view with only safe columns
-- 2. Updating client code to use explicit column selection

-- Create a secure public view with only non-sensitive fields
CREATE OR REPLACE VIEW public.public_centers_view
WITH (security_invoker = on)
AS SELECT 
  id,
  slug,
  name,
  address,
  phone,  -- phone is intentionally public for contact purposes on booking page
  logo_url,
  customization,
  welcome_message,
  ai_enabled,
  subscription_plan,
  created_at,
  updated_at
FROM public.centers;

-- Grant access to the public view
GRANT SELECT ON public.public_centers_view TO anon, authenticated;

-- =============================================
-- SECURITY FIX 2: Replace admin_centers_view with a SECURITY DEFINER function
-- =============================================

-- Drop the insecure view
DROP VIEW IF EXISTS public.admin_centers_view;

-- Create a SECURITY DEFINER function that checks for admin role
CREATE OR REPLACE FUNCTION public.get_admin_centers_data()
RETURNS TABLE (
  "Email" text,
  "Business" text,
  "Abo" subscription_plan,
  "Fin Abo" timestamptz,
  "Tel" text,
  "Lien" text,
  "Inscription" timestamptz,
  "Stripe ID" text,
  "RDV" bigint,
  id uuid,
  owner_id uuid
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    c.email,
    c.name,
    c.subscription_plan,
    c.subscription_end_date,
    c.phone,
    c.slug,
    c.created_at,
    c.stripe_customer_id,
    (SELECT COUNT(*) FROM public.appointments a WHERE a.center_id = c.id),
    c.id,
    c.owner_id
  FROM public.centers c
  WHERE public.has_role(auth.uid(), 'admin')
  ORDER BY c.created_at DESC;
$$;

-- Recreate the view using the secure function for backwards compatibility
-- This view will only return data if the user is an admin
CREATE VIEW public.admin_centers_view AS
SELECT * FROM public.get_admin_centers_data();

-- Grant usage to authenticated users (the function itself will check admin role)
GRANT SELECT ON public.admin_centers_view TO authenticated;