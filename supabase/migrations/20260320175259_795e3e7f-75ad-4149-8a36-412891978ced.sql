CREATE POLICY "Les propriétaires peuvent supprimer leurs demandes"
ON public.contact_requests
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.centers
    WHERE centers.id = contact_requests.center_id
    AND centers.owner_id = auth.uid()
  )
);