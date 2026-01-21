-- =============================================
-- PHASE 3: CORRECTION DES POLITIQUES RLS PERMISSIVES
-- Les alertes concernent les politiques INSERT avec "true" sur appointments et contact_requests
-- Ces politiques sont INTENTIONNELLES pour permettre les réservations publiques
-- Mais on peut les rendre plus sécurisées en ajoutant des validations
-- =============================================

-- 1. Améliorer la politique d'insertion des rendez-vous
-- Exiger que les champs obligatoires soient renseignés
DROP POLICY IF EXISTS "PUBLIC peut créer des rendez-vous" ON public.appointments;
CREATE POLICY "Public can create appointments with valid data" 
ON public.appointments 
FOR INSERT 
TO public
WITH CHECK (
  -- Validation: les champs obligatoires doivent être non-vides
  center_id IS NOT NULL 
  AND client_name IS NOT NULL AND client_name != ''
  AND client_email IS NOT NULL AND client_email != ''
  AND client_phone IS NOT NULL AND client_phone != ''
  AND appointment_date IS NOT NULL
  AND appointment_time IS NOT NULL
  AND vehicle_type IS NOT NULL
);

-- 2. Améliorer la politique d'insertion des demandes de contact
DROP POLICY IF EXISTS "Tout le monde peut créer une demande" ON public.contact_requests;
CREATE POLICY "Public can create contact requests with valid data" 
ON public.contact_requests 
FOR INSERT 
TO public
WITH CHECK (
  -- Validation: les champs obligatoires doivent être non-vides
  center_id IS NOT NULL 
  AND client_name IS NOT NULL AND client_name != ''
  AND client_phone IS NOT NULL AND client_phone != ''
);