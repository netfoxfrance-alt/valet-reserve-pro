-- Add policy for owners to delete their appointments
CREATE POLICY "Les propriétaires peuvent supprimer leurs rendez-vous"
ON public.appointments
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM centers
  WHERE centers.id = appointments.center_id
  AND centers.owner_id = auth.uid()
));