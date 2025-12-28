-- Add price_variants column to packs table
-- This allows flexible pricing per category (vehicle type, furniture type, etc.)
-- Format: [{"name": "Citadine", "price": 45}, {"name": "Berline", "price": 55}]

ALTER TABLE public.packs 
ADD COLUMN price_variants jsonb DEFAULT '[]'::jsonb;