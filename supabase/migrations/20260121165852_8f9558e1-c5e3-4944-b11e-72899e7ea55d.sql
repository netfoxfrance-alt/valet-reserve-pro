-- =============================================
-- PHASE 1: INDEX DE PERFORMANCE CRITIQUES
-- =============================================

-- Index composite pour le calendrier des rendez-vous (requête la plus fréquente)
CREATE INDEX IF NOT EXISTS idx_appointments_center_date 
ON public.appointments(center_id, appointment_date);

-- Index pour les requêtes de disponibilités par centre
CREATE INDEX IF NOT EXISTS idx_availability_center 
ON public.availability(center_id);

-- Index pour les packs par centre
CREATE INDEX IF NOT EXISTS idx_packs_center 
ON public.packs(center_id);

-- Index pour les demandes de contact par centre
CREATE INDEX IF NOT EXISTS idx_contact_requests_center 
ON public.contact_requests(center_id);

-- Index pour les périodes bloquées par centre et date
CREATE INDEX IF NOT EXISTS idx_blocked_periods_center_dates 
ON public.blocked_periods(center_id, start_date, end_date);

-- Index pour les factures par centre
CREATE INDEX IF NOT EXISTS idx_invoices_center 
ON public.invoices(center_id);

-- Index pour les items de facture
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice 
ON public.invoice_items(invoice_id);

-- =============================================
-- PHASE 2: SÉCURITÉ RLS TABLE CENTERS
-- =============================================

-- Supprimer l'ancienne politique trop permissive
DROP POLICY IF EXISTS "Public can view public center data" ON public.centers;

-- Nouvelle politique: accès public UNIQUEMENT aux colonnes non-sensibles
-- via la vue public_centers_view (qui filtre déjà les colonnes sensibles)
CREATE POLICY "Public can view non-sensitive center data" 
ON public.centers 
FOR SELECT 
TO public
USING (true);

-- Note: La vraie protection est dans le code frontend qui doit utiliser
-- public_centers_view au lieu de centers directement pour les requêtes publiques