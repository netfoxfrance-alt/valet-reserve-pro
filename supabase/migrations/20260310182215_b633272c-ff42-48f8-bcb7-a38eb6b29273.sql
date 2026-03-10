
-- Fix contact_requests: drop restrictive INSERT, recreate as PERMISSIVE
DROP POLICY IF EXISTS "Public can create contact requests with valid data" ON public.contact_requests;

CREATE POLICY "Public can create contact requests with valid data"
ON public.contact_requests
FOR INSERT TO public
WITH CHECK (
  center_id IS NOT NULL
  AND client_name IS NOT NULL AND client_name <> ''
  AND client_phone IS NOT NULL AND client_phone <> ''
);

-- Fix appointments: drop restrictive INSERT, recreate as PERMISSIVE
DROP POLICY IF EXISTS "Public can create appointments with valid data" ON public.appointments;

CREATE POLICY "Public can create appointments with valid data"
ON public.appointments
FOR INSERT TO public
WITH CHECK (
  center_id IS NOT NULL
  AND client_name IS NOT NULL AND client_name <> ''
  AND client_email IS NOT NULL AND client_email <> ''
  AND client_phone IS NOT NULL AND client_phone <> ''
  AND appointment_date IS NOT NULL
  AND appointment_time IS NOT NULL
  AND vehicle_type IS NOT NULL
);
