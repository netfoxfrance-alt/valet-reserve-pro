
-- Add cancellation_policy to centers: 'no_refund' or 'no_refund_48h'
ALTER TABLE public.centers ADD COLUMN IF NOT EXISTS cancellation_policy text NOT NULL DEFAULT 'no_refund';

-- Add deposit_refund_status to appointments to track refund state
-- Values: 'none', 'refunded', 'partial'
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS deposit_refund_status text NOT NULL DEFAULT 'none';
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS deposit_payment_intent_id text;

-- Update public_centers_view to include cancellation_policy
DROP VIEW IF EXISTS public_centers_view;
CREATE VIEW public_centers_view AS
SELECT 
  id, slug, name, address, phone,
  logo_url, welcome_message, ai_enabled,
  subscription_plan, customization,
  latitude, longitude, intervention_radius_km,
  deposit_enabled, deposit_type, deposit_value,
  stripe_connect_status,
  quote_form_message,
  cancellation_policy,
  created_at, updated_at
FROM public.centers;
