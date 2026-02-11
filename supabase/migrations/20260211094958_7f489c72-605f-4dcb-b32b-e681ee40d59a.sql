
-- Fonction RPC sécurisée pour la reconnaissance client par téléphone
-- Retourne le strict minimum : prénom, prestation par défaut, infos de contact
-- Utilise l'index existant normalize_phone() pour O(1) lookup
CREATE OR REPLACE FUNCTION public.lookup_client_by_phone(
  p_center_id UUID,
  p_phone TEXT
)
RETURNS TABLE (
  client_id UUID,
  first_name TEXT,
  client_name TEXT,
  client_email TEXT,
  client_phone TEXT,
  client_address TEXT,
  service_id UUID,
  service_name TEXT,
  service_price NUMERIC,
  service_duration_minutes INTEGER
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    c.id AS client_id,
    SPLIT_PART(c.name, ' ', 1) AS first_name,
    c.name AS client_name,
    c.email AS client_email,
    c.phone AS client_phone,
    c.address AS client_address,
    cs.id AS service_id,
    cs.name AS service_name,
    cs.price AS service_price,
    cs.duration_minutes AS service_duration_minutes
  FROM clients c
  LEFT JOIN custom_services cs ON cs.id = c.default_service_id AND cs.active = true
  WHERE c.center_id = p_center_id
    AND public.normalize_phone(c.phone) = public.normalize_phone(p_phone)
  LIMIT 1;
$$;
