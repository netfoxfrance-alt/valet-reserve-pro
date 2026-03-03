
-- Add acceptance_token column for secure public quote acceptance via email
ALTER TABLE public.invoices 
ADD COLUMN acceptance_token uuid DEFAULT NULL;

-- Create unique index for token lookups
CREATE UNIQUE INDEX idx_invoices_acceptance_token 
ON public.invoices(acceptance_token) 
WHERE acceptance_token IS NOT NULL;

-- Create a function to auto-generate acceptance token for quotes
CREATE OR REPLACE FUNCTION public.generate_quote_acceptance_token()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only generate token for quotes, not invoices
  IF NEW.type = 'quote' AND NEW.acceptance_token IS NULL THEN
    NEW.acceptance_token := gen_random_uuid();
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger to auto-generate token on quote creation
CREATE TRIGGER set_quote_acceptance_token
BEFORE INSERT ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION public.generate_quote_acceptance_token();

-- Generate tokens for existing quotes that don't have one
UPDATE public.invoices 
SET acceptance_token = gen_random_uuid() 
WHERE type = 'quote' AND acceptance_token IS NULL;
