-- Add company_name to clients table
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS company_name text;

-- Add client_type and company_name to contact_requests for quote forms
ALTER TABLE public.contact_requests ADD COLUMN IF NOT EXISTS client_type text NOT NULL DEFAULT 'particulier';
ALTER TABLE public.contact_requests ADD COLUMN IF NOT EXISTS company_name text;