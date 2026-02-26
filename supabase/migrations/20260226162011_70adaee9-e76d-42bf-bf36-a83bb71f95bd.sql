
-- Trigger function: auto-create client when appointment is inserted
CREATE OR REPLACE FUNCTION public.auto_create_client_on_appointment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_normalized_phone text;
  v_normalized_email text;
  v_existing_client_id uuid;
BEGIN
  -- Skip if client_id already set
  IF NEW.client_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  v_normalized_phone := public.normalize_phone(NEW.client_phone);
  v_normalized_email := LOWER(TRIM(NEW.client_email));

  -- 1. Search by phone
  IF v_normalized_phone != '' THEN
    SELECT id INTO v_existing_client_id
    FROM public.clients
    WHERE center_id = NEW.center_id
      AND public.normalize_phone(phone) = v_normalized_phone
    LIMIT 1;
  END IF;

  -- 2. Search by email if not found by phone
  IF v_existing_client_id IS NULL AND v_normalized_email != '' THEN
    SELECT id INTO v_existing_client_id
    FROM public.clients
    WHERE center_id = NEW.center_id
      AND LOWER(TRIM(email)) = v_normalized_email
    LIMIT 1;
  END IF;

  -- 3. If found, enrich missing info and link
  IF v_existing_client_id IS NOT NULL THEN
    UPDATE public.clients SET
      email = COALESCE(NULLIF(email, ''), NULLIF(v_normalized_email, '')),
      phone = COALESCE(NULLIF(phone, ''), NULLIF(NEW.client_phone, '')),
      address = COALESCE(NULLIF(address, ''), NULLIF(NEW.client_address, ''))
    WHERE id = v_existing_client_id;

    NEW.client_id := v_existing_client_id;
    RETURN NEW;
  END IF;

  -- 4. Create new client
  INSERT INTO public.clients (center_id, name, email, phone, address, source)
  VALUES (
    NEW.center_id,
    NEW.client_name,
    NULLIF(v_normalized_email, ''),
    NULLIF(NEW.client_phone, ''),
    NULLIF(NEW.client_address, ''),
    'booking'
  )
  RETURNING id INTO v_existing_client_id;

  NEW.client_id := v_existing_client_id;
  RETURN NEW;

EXCEPTION WHEN unique_violation THEN
  -- Race condition: retry lookup
  SELECT id INTO v_existing_client_id
  FROM public.clients
  WHERE center_id = NEW.center_id
    AND (
      (v_normalized_phone != '' AND public.normalize_phone(phone) = v_normalized_phone)
      OR (v_normalized_email != '' AND LOWER(TRIM(email)) = v_normalized_email)
    )
  LIMIT 1;

  NEW.client_id := v_existing_client_id;
  RETURN NEW;
END;
$$;

-- Create BEFORE INSERT trigger
CREATE TRIGGER trg_auto_create_client_on_appointment
  BEFORE INSERT ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_client_on_appointment();
