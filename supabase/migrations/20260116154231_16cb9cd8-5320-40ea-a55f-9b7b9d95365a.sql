-- Supprimer les anciennes policies INSERT
DROP POLICY IF EXISTS "Tout le monde peut créer un rendez-vous" ON public.appointments;
DROP POLICY IF EXISTS "Les clients peuvent créer des rendez-vous" ON public.appointments;

-- Recréer une policy INSERT permissive correcte avec le rôle anon explicite
CREATE POLICY "Public peut créer des rendez-vous"
ON public.appointments
FOR INSERT
TO anon, authenticated
WITH CHECK (true);