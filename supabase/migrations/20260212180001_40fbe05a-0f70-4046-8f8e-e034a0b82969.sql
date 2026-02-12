
-- Create junction table for client <-> custom_services (many-to-many)
CREATE TABLE public.client_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.custom_services(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(client_id, service_id)
);

-- Enable RLS
ALTER TABLE public.client_services ENABLE ROW LEVEL SECURITY;

-- Owners can manage their client_services (via clients -> centers)
CREATE POLICY "Les propriétaires peuvent gérer les services clients"
ON public.client_services
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM clients
    JOIN centers ON centers.id = clients.center_id
    WHERE clients.id = client_services.client_id
    AND centers.owner_id = auth.uid()
  )
);

-- Migrate existing default_service_id data
INSERT INTO public.client_services (client_id, service_id)
SELECT id, default_service_id FROM public.clients
WHERE default_service_id IS NOT NULL
ON CONFLICT DO NOTHING;
