-- Add image_url column to packs table for pack images
ALTER TABLE public.packs ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT NULL;