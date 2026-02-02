-- Add client_id to invoices table to link documents to clients
ALTER TABLE public.invoices 
ADD COLUMN client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL;

-- Create an index for faster lookups
CREATE INDEX idx_invoices_client_id ON public.invoices(client_id);

-- Comment for documentation
COMMENT ON COLUMN public.invoices.client_id IS 'Optional link to client record for centralized activity tracking';