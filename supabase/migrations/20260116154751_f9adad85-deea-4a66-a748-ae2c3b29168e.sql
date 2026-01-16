-- Remplacer la policy INSERT pour couvrir tous les rôles (PUBLIC)
DROP POLICY IF EXISTS "Public peut créer des rendez-vous" ON public.appointments;

CREATE POLICY "PUBLIC peut créer des rendez-vous"
ON public.appointments
FOR INSERT
TO public
WITH CHECK (true);