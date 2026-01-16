-- Créer la table blocked_periods pour persister les périodes bloquées
CREATE TABLE public.blocked_periods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  center_id UUID NOT NULL REFERENCES public.centers(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blocked_periods ENABLE ROW LEVEL SECURITY;

-- Les propriétaires peuvent gérer leurs périodes bloquées
CREATE POLICY "Les propriétaires peuvent gérer leurs périodes bloquées"
ON public.blocked_periods
FOR ALL
USING (EXISTS (
  SELECT 1 FROM centers
  WHERE centers.id = blocked_periods.center_id
  AND centers.owner_id = auth.uid()
));

-- Tout le monde peut voir les périodes bloquées (pour le booking public)
CREATE POLICY "Tout le monde peut voir les périodes bloquées"
ON public.blocked_periods
FOR SELECT
USING (true);