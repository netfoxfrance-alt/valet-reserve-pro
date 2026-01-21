-- Add duration_minutes column to appointments table
-- This stores the actual service duration to calculate end time accurately
ALTER TABLE public.appointments 
ADD COLUMN duration_minutes integer DEFAULT 60;

-- Create composite index for efficient availability lookups at scale
CREATE INDEX idx_appointments_availability_lookup 
ON public.appointments (center_id, appointment_date, status)
WHERE status NOT IN ('cancelled');