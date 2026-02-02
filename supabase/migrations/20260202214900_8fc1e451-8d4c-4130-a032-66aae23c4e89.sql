-- =====================================================
-- SECURITY FIX: Protect sensitive data in centers table
-- =====================================================

-- 1. Drop the overly permissive public SELECT policy on centers
DROP POLICY IF EXISTS "Public can view non-sensitive center data" ON public.centers;

-- 2. Create a restricted public SELECT policy that only exposes non-sensitive columns
-- Users must access data via the secure public_centers_view which excludes sensitive fields
CREATE POLICY "Public can view centers via secure view only"
ON public.centers
FOR SELECT
USING (
  -- Allow public to read only if accessing through the secure view pattern
  -- This effectively blocks direct table access while allowing the view to work
  auth.uid() = owner_id OR auth.uid() IS NULL
);

-- Actually, let's be more restrictive - public should use the view, not the table directly
-- Drop and recreate with proper restrictions
DROP POLICY IF EXISTS "Public can view centers via secure view only" ON public.centers;

-- Create policy that only allows owners to see their full data
-- Public access should go through public_centers_view
CREATE POLICY "Authenticated owners can view their own center"
ON public.centers
FOR SELECT
USING (auth.uid() = owner_id);

-- =====================================================
-- SECURITY FIX: Enable RLS on admin_centers_view
-- =====================================================

-- Enable RLS on the admin view
ALTER VIEW public.admin_centers_view SET (security_invoker = on);

-- Note: Views with security_invoker inherit RLS from underlying tables
-- Since centers table now restricts to owners only, and the view uses
-- get_admin_centers_data() which checks for admin role, this is now secure

-- =====================================================
-- SECURITY FIX: Verify appointments table protection
-- =====================================================

-- The appointments table already has proper RLS policies:
-- - SELECT: Only center owners can view
-- - UPDATE: Only center owners can modify
-- - DELETE: Only center owners can delete
-- - INSERT: Public can create with valid data (needed for booking flow)

-- But let's verify there's no public SELECT by checking existing policies
-- The existing policy "Les propriétaires peuvent voir leurs rendez-vous" 
-- already restricts SELECT to owners only via the EXISTS check