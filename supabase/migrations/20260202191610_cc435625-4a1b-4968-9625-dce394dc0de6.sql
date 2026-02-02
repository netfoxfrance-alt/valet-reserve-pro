-- Ajouter le champ email aux demandes de contact
ALTER TABLE public.contact_requests 
ADD COLUMN IF NOT EXISTS client_email text;

-- Ajouter le champ pour enregistrer la date de contact
ALTER TABLE public.contact_requests 
ADD COLUMN IF NOT EXISTS contacted_at timestamp with time zone;

-- Créer un index pour les recherches par email
CREATE INDEX IF NOT EXISTS idx_contact_requests_email 
ON public.contact_requests (client_email) 
WHERE client_email IS NOT NULL;