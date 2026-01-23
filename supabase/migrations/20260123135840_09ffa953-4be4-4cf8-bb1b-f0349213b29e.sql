-- Ajouter la colonne adresse aux demandes de contact
ALTER TABLE public.contact_requests 
ADD COLUMN client_address TEXT;