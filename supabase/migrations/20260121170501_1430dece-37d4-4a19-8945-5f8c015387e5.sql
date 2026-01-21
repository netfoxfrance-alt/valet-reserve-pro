-- Fix the admin_centers_view to use security_invoker instead of security_definer
-- This ensures RLS policies of the querying user are applied

-- Drop existing view
DROP VIEW IF EXISTS public.admin_centers_view;

-- Recreate with security_invoker
CREATE VIEW public.admin_centers_view 
WITH (security_invoker = on) AS
SELECT 
  c.email as "Email",
  c.name as "Business",
  c.subscription_plan as "Abo",
  c.subscription_end_date as "Fin Abo",
  c.phone as "Tel",
  c.slug as "Lien",
  c.created_at as "Inscription",
  c.stripe_customer_id as "Stripe ID",
  (SELECT COUNT(*) FROM public.appointments a WHERE a.center_id = c.id) as "RDV",
  c.id,
  c.owner_id
FROM public.centers c
WHERE public.has_role(auth.uid(), 'admin')
ORDER BY c.created_at DESC;