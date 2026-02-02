-- Recréer la fonction de normalisation du téléphone
CREATE OR REPLACE FUNCTION public.normalize_phone(phone text)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
  SELECT REGEXP_REPLACE(COALESCE(phone, ''), '[^0-9+]', '', 'g')
$$;