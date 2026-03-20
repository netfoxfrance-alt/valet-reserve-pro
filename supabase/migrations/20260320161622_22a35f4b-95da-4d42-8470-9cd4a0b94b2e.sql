-- Fix custom_requests INSERT policy: require center_id IS NOT NULL
DROP POLICY IF EXISTS "Centers can insert their own requests" ON public.custom_requests;

CREATE POLICY "Centers can insert their own requests"
ON public.custom_requests
FOR INSERT
TO public
WITH CHECK (
  center_id IS NOT NULL
  AND auth.uid() IN (
    SELECT centers.owner_id FROM centers WHERE centers.id = custom_requests.center_id
  )
);