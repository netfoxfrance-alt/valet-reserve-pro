-- Créer l'index unique sur email maintenant que les doublons sont supprimés
CREATE UNIQUE INDEX IF NOT EXISTS idx_clients_unique_email_per_center 
ON public.clients (center_id, LOWER(email))
WHERE email IS NOT NULL AND email <> '';