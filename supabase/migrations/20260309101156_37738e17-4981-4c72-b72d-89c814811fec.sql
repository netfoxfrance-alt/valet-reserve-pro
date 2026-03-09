
-- RPC to get occupied time slots for a center (bypasses RLS for anonymous booking pages)
CREATE OR REPLACE FUNCTION public.get_occupied_slots(
  p_center_id uuid,
  p_from_date date
)
RETURNS TABLE (
  appointment_date date,
  appointment_time time,
  duration_minutes integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT a.appointment_date::date, a.appointment_time::time, COALESCE(a.duration_minutes, 60)::integer
  FROM public.appointments a
  WHERE a.center_id = p_center_id
    AND a.status NOT IN ('cancelled', 'refused')
    AND a.appointment_date >= p_from_date;
$$;

-- Update create_recognized_appointment to include travel buffer in overlap check
CREATE OR REPLACE FUNCTION public.create_recognized_appointment(
  p_center_id uuid,
  p_client_id uuid,
  p_service_id uuid,
  p_appointment_date date,
  p_appointment_time time,
  p_vehicle_type text DEFAULT 'custom',
  p_notes text DEFAULT NULL
)
RETURNS TABLE (
  appointment_id uuid,
  client_name text,
  client_email text,
  client_phone text,
  client_address text,
  service_name text,
  service_price numeric,
  duration_minutes integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_client public.clients%ROWTYPE;
  v_service public.custom_services%ROWTYPE;
  v_appointment public.appointments%ROWTYPE;
  v_start_min integer;
  v_end_min integer;
  v_buffer integer;
BEGIN
  SELECT *
  INTO v_client
  FROM public.clients
  WHERE id = p_client_id
    AND center_id = p_center_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'CLIENT_NOT_FOUND';
  END IF;

  SELECT *
  INTO v_service
  FROM public.custom_services
  WHERE id = p_service_id
    AND center_id = p_center_id
    AND active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'SERVICE_NOT_FOUND';
  END IF;

  IF COALESCE(NULLIF(TRIM(v_client.name), ''), '') = ''
     OR COALESCE(NULLIF(TRIM(v_client.email), ''), '') = ''
     OR COALESCE(NULLIF(TRIM(v_client.phone), ''), '') = '' THEN
    RAISE EXCEPTION 'CLIENT_PROFILE_INCOMPLETE';
  END IF;

  -- Get travel buffer from center customization
  SELECT COALESCE(
    ((c.customization::jsonb)->'settings'->>'appointment_buffer')::integer,
    0
  ) INTO v_buffer
  FROM public.centers c
  WHERE c.id = p_center_id;

  v_start_min := EXTRACT(HOUR FROM p_appointment_time)::int * 60 + EXTRACT(MINUTE FROM p_appointment_time)::int;
  v_end_min := v_start_min + COALESCE(v_service.duration_minutes, 60);

  -- Check overlap including travel buffer on existing appointments
  IF EXISTS (
    SELECT 1
    FROM public.appointments a
    WHERE a.center_id = p_center_id
      AND a.appointment_date = p_appointment_date
      AND a.status NOT IN ('cancelled', 'refused')
      AND (
        v_start_min < ((EXTRACT(HOUR FROM a.appointment_time)::int * 60 + EXTRACT(MINUTE FROM a.appointment_time)::int) + COALESCE(a.duration_minutes, 60) + v_buffer)
        AND (EXTRACT(HOUR FROM a.appointment_time)::int * 60 + EXTRACT(MINUTE FROM a.appointment_time)::int) < v_end_min + v_buffer
      )
  ) THEN
    RAISE EXCEPTION 'TIME_SLOT_OCCUPIED';
  END IF;

  INSERT INTO public.appointments (
    center_id,
    pack_id,
    client_id,
    custom_service_id,
    client_name,
    client_email,
    client_phone,
    client_address,
    vehicle_type,
    appointment_date,
    appointment_time,
    notes,
    duration_minutes,
    custom_price,
    status
  )
  VALUES (
    p_center_id,
    NULL,
    v_client.id,
    v_service.id,
    v_client.name,
    LOWER(TRIM(v_client.email)),
    v_client.phone,
    v_client.address,
    COALESCE(NULLIF(TRIM(p_vehicle_type), ''), 'custom'),
    p_appointment_date,
    p_appointment_time,
    NULLIF(TRIM(p_notes), ''),
    COALESCE(v_service.duration_minutes, 60),
    v_service.price,
    'pending_validation'
  )
  RETURNING * INTO v_appointment;

  RETURN QUERY
  SELECT
    v_appointment.id,
    v_appointment.client_name,
    v_appointment.client_email,
    v_appointment.client_phone,
    v_appointment.client_address,
    v_service.name,
    v_service.price,
    COALESCE(v_service.duration_minutes, 60);
END;
$$;
