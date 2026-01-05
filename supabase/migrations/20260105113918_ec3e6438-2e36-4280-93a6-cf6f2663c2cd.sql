-- Ajouter les nouveaux statuts d'abonnement à l'enum
ALTER TYPE subscription_plan ADD VALUE IF NOT EXISTS 'trial';
ALTER TYPE subscription_plan ADD VALUE IF NOT EXISTS 'expired';
ALTER TYPE subscription_plan ADD VALUE IF NOT EXISTS 'past_due';

-- Ajouter une colonne pour la date de fin d'essai/abonnement
ALTER TABLE public.centers 
ADD COLUMN IF NOT EXISTS subscription_end_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS stripe_customer_id text,
ADD COLUMN IF NOT EXISTS stripe_subscription_id text;

-- Mettre à jour la vue admin pour afficher les colonnes dans un ordre pratique
DROP VIEW IF EXISTS public.admin_centers_view;

CREATE VIEW public.admin_centers_view AS
SELECT 
  c.email as "Email",
  c.name as "Business",
  c.subscription_plan as "Abo",
  c.subscription_end_date as "Fin Abo",
  c.phone as "Tel",
  c.slug as "Lien",
  c.created_at as "Inscription",
  c.stripe_customer_id as "Stripe ID",
  (SELECT COUNT(*) FROM public.appointments a WHERE a.center_id = c.id) as "RDV",
  c.id,
  c.owner_id
FROM public.centers c
ORDER BY c.created_at DESC;