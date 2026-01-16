-- Permettre aux visiteurs publics de créer des rendez-vous
CREATE POLICY "Les clients peuvent créer des rendez-vous"
ON public.appointments
FOR INSERT
TO public
WITH CHECK (true);

-- Note: Cette policy est volontairement permissive car les clients non-authentifiés
-- doivent pouvoir prendre rendez-vous. La validation se fait via les champs obligatoires
-- et le center_id doit exister (constraint FK).