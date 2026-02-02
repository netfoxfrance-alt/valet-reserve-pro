-- Corriger la fonction avec search_path sécurisé
CREATE OR REPLACE FUNCTION public.normalize_phone(phone text)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT REGEXP_REPLACE(COALESCE(phone, ''), '[^0-9+]', '', 'g')
$$;

-- Étape 1: Réassigner les rendez-vous des doublons vers le client original (le plus ancien)
WITH duplicates AS (
  SELECT 
    center_id,
    public.normalize_phone(phone) as norm_phone,
    MIN(created_at) as first_created,
    array_agg(id ORDER BY created_at) as all_ids
  FROM public.clients
  WHERE phone IS NOT NULL AND phone <> ''
  GROUP BY center_id, public.normalize_phone(phone)
  HAVING COUNT(*) > 1
),
keep_ids AS (
  SELECT c.id as keep_id, d.all_ids
  FROM duplicates d
  JOIN public.clients c ON c.center_id = d.center_id 
    AND public.normalize_phone(c.phone) = d.norm_phone 
    AND c.created_at = d.first_created
)
UPDATE public.appointments a
SET client_id = k.keep_id
FROM keep_ids k
WHERE a.client_id = ANY(k.all_ids) AND a.client_id != k.keep_id;

-- Étape 2: Supprimer les clients en double (garder seulement le plus ancien)
WITH duplicates AS (
  SELECT 
    center_id,
    public.normalize_phone(phone) as norm_phone,
    MIN(created_at) as first_created
  FROM public.clients
  WHERE phone IS NOT NULL AND phone <> ''
  GROUP BY center_id, public.normalize_phone(phone)
  HAVING COUNT(*) > 1
)
DELETE FROM public.clients c
USING duplicates d
WHERE c.center_id = d.center_id 
  AND public.normalize_phone(c.phone) = d.norm_phone 
  AND c.created_at > d.first_created;

-- Étape 3: Créer l'index unique pour empêcher les futurs doublons
CREATE UNIQUE INDEX IF NOT EXISTS idx_clients_unique_phone_per_center 
ON public.clients (center_id, public.normalize_phone(phone))
WHERE phone IS NOT NULL AND phone <> '';

-- Étape 4: Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_clients_phone_lookup 
ON public.clients (center_id, phone) 
WHERE phone IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_clients_email_lookup 
ON public.clients (center_id, email) 
WHERE email IS NOT NULL;