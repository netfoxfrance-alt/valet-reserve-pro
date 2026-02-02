-- Fix: Add 'pending_validation' to the status check constraint
-- The constraint currently only allows: pending, confirmed, completed, cancelled, refused
-- But the code is trying to insert with 'pending_validation' status

-- First, drop the existing constraint
ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS appointments_status_check;

-- Recreate with all valid statuses including pending_validation
ALTER TABLE public.appointments 
ADD CONSTRAINT appointments_status_check 
CHECK (status IN ('pending_validation', 'pending', 'confirmed', 'completed', 'cancelled', 'refused'));