-- Créer enum pour les plans
CREATE TYPE public.subscription_plan AS ENUM ('free', 'pro');

-- Ajouter colonne plan aux centers (défaut: free)
ALTER TABLE public.centers 
ADD COLUMN subscription_plan subscription_plan NOT NULL DEFAULT 'free';

-- Créer table pour les demandes de contact (version gratuite)
CREATE TABLE public.contact_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  center_id UUID NOT NULL REFERENCES public.centers(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'new'
);

-- Enable RLS
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

-- Les propriétaires peuvent voir leurs demandes
CREATE POLICY "Les propriétaires peuvent voir leurs demandes"
ON public.contact_requests
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.centers
    WHERE centers.id = contact_requests.center_id
    AND centers.owner_id = auth.uid()
  )
);

-- Les propriétaires peuvent modifier leurs demandes
CREATE POLICY "Les propriétaires peuvent modifier leurs demandes"
ON public.contact_requests
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.centers
    WHERE centers.id = contact_requests.center_id
    AND centers.owner_id = auth.uid()
  )
);

-- Tout le monde peut créer une demande
CREATE POLICY "Tout le monde peut créer une demande"
ON public.contact_requests
FOR INSERT
WITH CHECK (true);