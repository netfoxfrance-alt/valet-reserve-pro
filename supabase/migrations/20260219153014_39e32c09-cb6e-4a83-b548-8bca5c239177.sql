
-- 1. Add images column to contact_requests
ALTER TABLE public.contact_requests ADD COLUMN images text[] DEFAULT '{}'::text[];

-- 2. Add quote_form_message to centers
ALTER TABLE public.centers ADD COLUMN quote_form_message text DEFAULT NULL;

-- 3. Create storage bucket for contact request images
INSERT INTO storage.buckets (id, name, public) VALUES ('contact-images', 'contact-images', true);

-- 4. RLS: anyone can upload to contact-images (public form)
CREATE POLICY "Anyone can upload contact images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'contact-images');

-- 5. RLS: anyone can read contact images
CREATE POLICY "Anyone can read contact images"
ON storage.objects FOR SELECT
USING (bucket_id = 'contact-images');

-- 6. Owners can delete contact images
CREATE POLICY "Owners can delete contact images"
ON storage.objects FOR DELETE
USING (bucket_id = 'contact-images' AND auth.uid() IS NOT NULL);
