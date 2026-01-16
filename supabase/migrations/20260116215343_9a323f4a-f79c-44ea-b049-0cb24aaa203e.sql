
-- Supprimer la contrainte unique qui empêche plusieurs slots par jour
ALTER TABLE public.availability DROP CONSTRAINT IF EXISTS availability_center_id_day_of_week_key;
