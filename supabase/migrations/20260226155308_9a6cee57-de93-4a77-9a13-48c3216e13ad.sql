
-- 1. Update the handle_new_user function to also create default availability
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  new_slug TEXT;
  new_center_id UUID;
BEGIN
  -- Générer un slug unique basé sur l'email
  new_slug := LOWER(REPLACE(SPLIT_PART(NEW.email, '@', 1), '.', '-')) || '-' || SUBSTRING(NEW.id::TEXT, 1, 8);
  
  -- Créer le centre avec l'email de l'utilisateur
  INSERT INTO public.centers (owner_id, slug, name, email)
  VALUES (NEW.id, new_slug, 'Mon Centre Auto', NEW.email)
  RETURNING id INTO new_center_id;
  
  -- Ajouter le rôle owner
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'owner');
  
  -- Créer les disponibilités par défaut (Lundi à Samedi, 9h-12h + 14h-18h)
  INSERT INTO public.availability (center_id, day_of_week, start_time, end_time, enabled)
  VALUES
    (new_center_id, 1, '09:00', '12:00', true),
    (new_center_id, 1, '14:00', '18:00', true),
    (new_center_id, 2, '09:00', '12:00', true),
    (new_center_id, 2, '14:00', '18:00', true),
    (new_center_id, 3, '09:00', '12:00', true),
    (new_center_id, 3, '14:00', '18:00', true),
    (new_center_id, 4, '09:00', '12:00', true),
    (new_center_id, 4, '14:00', '18:00', true),
    (new_center_id, 5, '09:00', '12:00', true),
    (new_center_id, 5, '14:00', '18:00', true),
    (new_center_id, 6, '09:00', '12:00', true),
    (new_center_id, 6, '14:00', '18:00', true);
  
  RETURN NEW;
END;
$function$;

-- 2. Backfill: insert default availability for existing centers that have NONE
INSERT INTO public.availability (center_id, day_of_week, start_time, end_time, enabled)
SELECT c.id, dow.d, slot.s, slot.e, true
FROM public.centers c
CROSS JOIN (VALUES (1),(2),(3),(4),(5),(6)) AS dow(d)
CROSS JOIN (VALUES ('09:00'::time, '12:00'::time), ('14:00'::time, '18:00'::time)) AS slot(s, e)
WHERE NOT EXISTS (
  SELECT 1 FROM public.availability a WHERE a.center_id = c.id
);
