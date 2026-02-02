-- Index pour le nouveau statut pending_validation (filtrage rapide des demandes en attente)
CREATE INDEX IF NOT EXISTS idx_appointments_pending_validation 
ON public.appointments (center_id, created_at DESC) 
WHERE status = 'pending_validation';

-- Index pour le statut refused
CREATE INDEX IF NOT EXISTS idx_appointments_refused 
ON public.appointments (center_id, created_at DESC) 
WHERE status = 'refused';

-- Mise à jour de l'index existant pour inclure pending_validation
DROP INDEX IF EXISTS idx_appointments_availability_lookup;
CREATE INDEX idx_appointments_availability_lookup 
ON public.appointments (center_id, appointment_date, status) 
WHERE status NOT IN ('cancelled', 'refused');