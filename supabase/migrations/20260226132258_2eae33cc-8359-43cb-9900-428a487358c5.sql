
-- Étape 1 : Ajouter les colonnes Stripe Connect et acomptes à la table centers
ALTER TABLE public.centers
  ADD COLUMN IF NOT EXISTS stripe_connect_account_id text,
  ADD COLUMN IF NOT EXISTS stripe_connect_status text NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS deposit_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deposit_type text NOT NULL DEFAULT 'percentage',
  ADD COLUMN IF NOT EXISTS deposit_value numeric NOT NULL DEFAULT 30;

-- Étape 1 : Ajouter les colonnes d'acompte à la table appointments
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS deposit_amount numeric,
  ADD COLUMN IF NOT EXISTS deposit_status text NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS deposit_checkout_session_id text;
