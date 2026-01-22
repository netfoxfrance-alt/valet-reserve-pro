-- Add source field to track how client was added
ALTER TABLE public.clients 
ADD COLUMN source text NOT NULL DEFAULT 'manual';

-- Add comment for clarity
COMMENT ON COLUMN public.clients.source IS 'How the client was added: manual or booking';