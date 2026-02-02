-- Add ical_token column to centers table for calendar sync security
ALTER TABLE public.centers 
ADD COLUMN IF NOT EXISTS ical_token TEXT UNIQUE;

-- Generate tokens for existing centers that don't have one
UPDATE public.centers 
SET ical_token = gen_random_uuid()::text 
WHERE ical_token IS NULL;

-- Create trigger to auto-generate token for new centers
CREATE OR REPLACE FUNCTION public.generate_ical_token()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ical_token IS NULL THEN
    NEW.ical_token := gen_random_uuid()::text;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS set_ical_token ON public.centers;
CREATE TRIGGER set_ical_token
  BEFORE INSERT ON public.centers
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_ical_token();