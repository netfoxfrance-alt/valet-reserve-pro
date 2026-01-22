
-- ============================================
-- SCALABILITY AUDIT: Sync clients + Add indexes
-- ============================================

-- 1. Sync existing appointments: Create missing clients from appointments
INSERT INTO public.clients (center_id, name, email, phone, address, source)
SELECT DISTINCT ON (a.center_id, a.client_phone)
  a.center_id,
  a.client_name,
  CASE WHEN a.client_email = 'non-fourni@example.com' THEN NULL ELSE a.client_email END,
  a.client_phone,
  a.client_address,
  'booking'
FROM appointments a
LEFT JOIN clients c ON c.center_id = a.center_id AND c.phone = a.client_phone
WHERE c.id IS NULL 
  AND a.client_phone IS NOT NULL 
  AND a.client_phone != ''
  AND LENGTH(a.client_phone) >= 5
ORDER BY a.center_id, a.client_phone, a.created_at DESC
ON CONFLICT DO NOTHING;

-- 2. Update appointments to link to existing clients by phone
UPDATE appointments a
SET client_id = c.id
FROM clients c
WHERE a.client_id IS NULL
  AND c.center_id = a.center_id
  AND c.phone = a.client_phone
  AND a.client_phone IS NOT NULL
  AND a.client_phone != '';

-- 3. SCALABILITY INDEXES for 1M+ users
-- Critical indexes for high-volume queries

-- Index for client lookup by phone (used in auto-create logic)
CREATE INDEX IF NOT EXISTS idx_clients_center_phone 
ON public.clients (center_id, phone);

-- Index for client lookup by center (listing)
CREATE INDEX IF NOT EXISTS idx_clients_center_id 
ON public.clients (center_id);

-- Index for appointments by client_id (client history)
CREATE INDEX IF NOT EXISTS idx_appointments_client_id 
ON public.appointments (client_id) WHERE client_id IS NOT NULL;

-- Index for appointments by center + date (calendar/planning views)
CREATE INDEX IF NOT EXISTS idx_appointments_center_date 
ON public.appointments (center_id, appointment_date, appointment_time);

-- Index for appointments by center + status (filtering)
CREATE INDEX IF NOT EXISTS idx_appointments_center_status 
ON public.appointments (center_id, status);

-- Index for custom_services by center
CREATE INDEX IF NOT EXISTS idx_custom_services_center 
ON public.custom_services (center_id);

-- Index for invoices by center + date (stats)
CREATE INDEX IF NOT EXISTS idx_invoices_center_date 
ON public.invoices (center_id, issue_date);

-- Index for packs by center
CREATE INDEX IF NOT EXISTS idx_packs_center_active 
ON public.packs (center_id, active);

-- Index for availability by center
CREATE INDEX IF NOT EXISTS idx_availability_center 
ON public.availability (center_id, day_of_week);

-- Index for blocked_periods by center + dates
CREATE INDEX IF NOT EXISTS idx_blocked_periods_center_dates 
ON public.blocked_periods (center_id, start_date, end_date);
