-- Create storage bucket for gallery images
INSERT INTO storage.buckets (id, name, public)
VALUES ('center-gallery', 'center-gallery', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to gallery images
CREATE POLICY "Gallery images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'center-gallery');

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload gallery images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'center-gallery' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own gallery images
CREATE POLICY "Users can delete their gallery images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'center-gallery' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);