
-- Add pricing_type to packs (fixed = booking flow, quote = quote request flow)
ALTER TABLE public.packs ADD COLUMN pricing_type TEXT NOT NULL DEFAULT 'fixed';

-- Add request_type and service_name to contact_requests to differentiate contact vs quote requests
ALTER TABLE public.contact_requests ADD COLUMN request_type TEXT NOT NULL DEFAULT 'contact';
ALTER TABLE public.contact_requests ADD COLUMN service_name TEXT;
