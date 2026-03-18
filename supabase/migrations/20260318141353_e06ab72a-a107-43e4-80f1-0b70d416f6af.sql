ALTER TABLE public.packs ADD COLUMN IF NOT EXISTS location_type text NOT NULL DEFAULT 'on_site';
COMMENT ON COLUMN public.packs.location_type IS 'Service location: on_site, at_home, or both';