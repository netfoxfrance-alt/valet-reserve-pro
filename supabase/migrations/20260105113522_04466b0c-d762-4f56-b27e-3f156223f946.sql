-- Supprimer la vue SECURITY DEFINER et la recréer sans cette option
DROP VIEW IF EXISTS public.admin_centers_view;

-- Recréer la vue simple (elle héritera des permissions RLS de la table centers)
CREATE VIEW public.admin_centers_view AS
SELECT 
  c.id,
  c.owner_id as user_id,
  c.email as user_email,
  c.name as business_name,
  c.slug,
  c.subscription_plan,
  c.phone,
  c.address,
  c.created_at as signup_date,
  c.updated_at as last_update,
  (SELECT COUNT(*) FROM public.appointments a WHERE a.center_id = c.id) as total_appointments,
  (SELECT COUNT(*) FROM public.packs p WHERE p.center_id = c.id AND p.active = true) as active_packs
FROM public.centers c
ORDER BY c.created_at DESC;