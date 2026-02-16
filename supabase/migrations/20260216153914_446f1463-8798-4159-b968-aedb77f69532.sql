
-- Add geolocation and intervention radius to centers
ALTER TABLE public.centers
  ADD COLUMN IF NOT EXISTS latitude double precision DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS longitude double precision DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS intervention_radius_km integer DEFAULT 30;
