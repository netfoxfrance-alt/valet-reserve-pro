-- Table des prestations personnalisées
CREATE TABLE public.custom_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  center_id UUID NOT NULL REFERENCES public.centers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  price NUMERIC NOT NULL DEFAULT 0,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des clients enregistrés
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  center_id UUID NOT NULL REFERENCES public.centers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  default_service_id UUID REFERENCES public.custom_services(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Colonnes additionnelles sur appointments
ALTER TABLE public.appointments 
ADD COLUMN client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
ADD COLUMN custom_service_id UUID REFERENCES public.custom_services(id) ON DELETE SET NULL,
ADD COLUMN custom_price NUMERIC;

-- Index pour les performances
CREATE INDEX idx_custom_services_center_id ON public.custom_services(center_id);
CREATE INDEX idx_clients_center_id ON public.clients(center_id);
CREATE INDEX idx_appointments_client_id ON public.appointments(client_id);
CREATE INDEX idx_appointments_custom_service_id ON public.appointments(custom_service_id);

-- Trigger pour updated_at sur custom_services
CREATE TRIGGER update_custom_services_updated_at
BEFORE UPDATE ON public.custom_services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger pour updated_at sur clients
CREATE TRIGGER update_clients_updated_at
BEFORE UPDATE ON public.clients
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- RLS sur custom_services
ALTER TABLE public.custom_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Les propriétaires peuvent gérer leurs prestations"
ON public.custom_services
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.centers
  WHERE centers.id = custom_services.center_id
  AND centers.owner_id = auth.uid()
));

-- RLS sur clients
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Les propriétaires peuvent gérer leurs clients"
ON public.clients
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.centers
  WHERE centers.id = clients.center_id
  AND centers.owner_id = auth.uid()
));