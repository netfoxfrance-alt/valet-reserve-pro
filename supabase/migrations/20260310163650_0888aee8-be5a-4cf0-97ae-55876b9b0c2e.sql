
-- Add Google Calendar OAuth columns to centers (refresh_token is sensitive, only used by edge functions)
ALTER TABLE public.centers
  ADD COLUMN IF NOT EXISTS google_calendar_refresh_token text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS google_calendar_connected boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS google_calendar_email text DEFAULT NULL;

-- Add Google Calendar event ID to appointments for future update/delete
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS google_calendar_event_id text DEFAULT NULL;
