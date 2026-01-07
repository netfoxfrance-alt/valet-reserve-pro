-- Table pour stocker les demandes de personnalisation avancée
CREATE TABLE public.custom_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id UUID REFERENCES public.centers(id) ON DELETE CASCADE,
  center_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  request_type TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS
ALTER TABLE public.custom_requests ENABLE ROW LEVEL SECURITY;

-- Les centres peuvent créer leurs propres demandes
CREATE POLICY "Centers can insert their own requests"
ON public.custom_requests
FOR INSERT
WITH CHECK (auth.uid() IN (SELECT owner_id FROM public.centers WHERE id = center_id));

-- Les centres peuvent voir leurs propres demandes
CREATE POLICY "Centers can view their own requests"
ON public.custom_requests
FOR SELECT
USING (auth.uid() IN (SELECT owner_id FROM public.centers WHERE id = center_id));