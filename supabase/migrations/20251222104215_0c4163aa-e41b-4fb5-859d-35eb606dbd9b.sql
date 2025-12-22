-- Créer le bucket pour les logos des centres
INSERT INTO storage.buckets (id, name, public)
VALUES ('center-logos', 'center-logos', true);

-- Politique : tout le monde peut voir les logos (public)
CREATE POLICY "Logos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'center-logos');

-- Politique : les propriétaires peuvent uploader leur logo
CREATE POLICY "Owners can upload their logo"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'center-logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Politique : les propriétaires peuvent modifier leur logo
CREATE POLICY "Owners can update their logo"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'center-logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Politique : les propriétaires peuvent supprimer leur logo
CREATE POLICY "Owners can delete their logo"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'center-logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);