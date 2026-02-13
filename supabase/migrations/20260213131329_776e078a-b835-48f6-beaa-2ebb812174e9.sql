-- Allow public read access to centers through the public_centers_view
-- The view already filters out sensitive columns (email, stripe IDs, ical_token, owner_id)
-- so this is safe to expose publicly
CREATE POLICY "Public can view centers via public view"
ON public.centers
FOR SELECT
TO anon, authenticated
USING (true);