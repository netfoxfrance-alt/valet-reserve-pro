-- Mettre à jour la fonction pour copier l'email lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_slug TEXT;
BEGIN
  -- Générer un slug unique basé sur l'email
  new_slug := LOWER(REPLACE(SPLIT_PART(NEW.email, '@', 1), '.', '-')) || '-' || SUBSTRING(NEW.id::TEXT, 1, 8);
  
  -- Créer le centre avec l'email de l'utilisateur
  INSERT INTO public.centers (owner_id, slug, name, email)
  VALUES (NEW.id, new_slug, 'Mon Centre Auto', NEW.email);
  
  -- Ajouter le rôle owner
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'owner');
  
  RETURN NEW;
END;
$$;

-- Créer une vue admin pour voir facilement les infos clés
CREATE OR REPLACE VIEW public.admin_centers_view AS
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