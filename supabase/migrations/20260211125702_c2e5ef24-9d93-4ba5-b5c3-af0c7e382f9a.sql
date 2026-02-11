
-- Drop existing INSERT policies for storage buckets and recreate with file extension restrictions

-- center-logos bucket: drop old INSERT policy and create restricted one
DROP POLICY IF EXISTS "Users can upload their own logo" ON storage.objects;
CREATE POLICY "Users can upload image logos only"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'center-logos'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND lower(storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'gif', 'webp')
);

-- center-gallery bucket: drop old INSERT policy and create restricted one
DROP POLICY IF EXISTS "Users can upload gallery images" ON storage.objects;
CREATE POLICY "Users can upload gallery images only"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'center-gallery'
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND lower(storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'gif', 'webp')
);
