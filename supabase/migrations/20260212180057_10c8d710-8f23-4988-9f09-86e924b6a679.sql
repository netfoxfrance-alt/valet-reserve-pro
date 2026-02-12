
-- Update lookup_client_by_email to return multiple services via client_services
CREATE OR REPLACE FUNCTION public.lookup_client_by_email(p_center_id uuid, p_email text)
 RETURNS TABLE(client_id uuid, first_name text, client_name text, client_email text, client_phone text, client_address text, service_id uuid, service_name text, service_price numeric, service_duration_minutes integer)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT
    c.id AS client_id,
    SPLIT_PART(c.name, ' ', 1) AS first_name,
    NULL::text AS client_name,
    NULL::text AS client_email,
    NULL::text AS client_phone,
    NULL::text AS client_address,
    cs.id AS service_id,
    cs.name AS service_name,
    cs.price AS service_price,
    cs.duration_minutes AS service_duration_minutes
  FROM clients c
  LEFT JOIN client_services cls ON cls.client_id = c.id
  LEFT JOIN custom_services cs ON cs.id = cls.service_id AND cs.active = true
  WHERE c.center_id = p_center_id
    AND LOWER(TRIM(c.email)) = LOWER(TRIM(p_email));
$function$;

-- Also update lookup_client_by_phone for consistency
CREATE OR REPLACE FUNCTION public.lookup_client_by_phone(p_center_id uuid, p_phone text)
 RETURNS TABLE(client_id uuid, first_name text, client_name text, client_email text, client_phone text, client_address text, service_id uuid, service_name text, service_price numeric, service_duration_minutes integer)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT
    c.id AS client_id,
    SPLIT_PART(c.name, ' ', 1) AS first_name,
    NULL::text AS client_name,
    NULL::text AS client_email,
    NULL::text AS client_phone,
    NULL::text AS client_address,
    cs.id AS service_id,
    cs.name AS service_name,
    cs.price AS service_price,
    cs.duration_minutes AS service_duration_minutes
  FROM clients c
  LEFT JOIN client_services cls ON cls.client_id = c.id
  LEFT JOIN custom_services cs ON cs.id = cls.service_id AND cs.active = true
  WHERE c.center_id = p_center_id
    AND public.normalize_phone(c.phone) = public.normalize_phone(p_phone);
$function$;
