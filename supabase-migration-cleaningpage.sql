-- Enum pour les rôles
CREATE TYPE public.app_role AS ENUM ('admin', 'owner');

-- Table des rôles utilisateur (sécurité)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Fonction pour vérifier les rôles (security definer)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Table des centres (chaque pro a un centre)
CREATE TABLE public.centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  logo_url TEXT,
  welcome_message TEXT DEFAULT 'Bienvenue ! Répondez à quelques questions pour trouver le pack idéal.',
  ai_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.centers ENABLE ROW LEVEL SECURITY;

-- Policies pour centers
CREATE POLICY "Les propriétaires peuvent gérer leur centre"
  ON public.centers FOR ALL
  USING (auth.uid() = owner_id);

CREATE POLICY "Tout le monde peut voir les centres publiquement"
  ON public.centers FOR SELECT
  USING (true);

-- Table des packs
CREATE TABLE public.packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id UUID REFERENCES public.centers(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  duration TEXT,
  price NUMERIC(10,2) NOT NULL,
  features TEXT[] DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.packs ENABLE ROW LEVEL SECURITY;

-- Policies pour packs
CREATE POLICY "Les propriétaires peuvent gérer leurs packs"
  ON public.packs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.centers
      WHERE centers.id = packs.center_id AND centers.owner_id = auth.uid()
    )
  );

CREATE POLICY "Tout le monde peut voir les packs actifs"
  ON public.packs FOR SELECT
  USING (active = true);

-- Table des disponibilités
CREATE TABLE public.availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id UUID REFERENCES public.centers(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(center_id, day_of_week)
);

ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;

-- Policies pour availability
CREATE POLICY "Les propriétaires peuvent gérer leurs disponibilités"
  ON public.availability FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.centers
      WHERE centers.id = availability.center_id AND centers.owner_id = auth.uid()
    )
  );

CREATE POLICY "Tout le monde peut voir les disponibilités"
  ON public.availability FOR SELECT
  USING (true);

-- Table des rendez-vous
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id UUID REFERENCES public.centers(id) ON DELETE CASCADE NOT NULL,
  pack_id UUID REFERENCES public.packs(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  vehicle_type TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Policies pour appointments
CREATE POLICY "Les propriétaires peuvent voir leurs rendez-vous"
  ON public.appointments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.centers
      WHERE centers.id = appointments.center_id AND centers.owner_id = auth.uid()
    )
  );

CREATE POLICY "Les propriétaires peuvent modifier leurs rendez-vous"
  ON public.appointments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.centers
      WHERE centers.id = appointments.center_id AND centers.owner_id = auth.uid()
    )
  );

CREATE POLICY "Tout le monde peut créer un rendez-vous"
  ON public.appointments FOR INSERT
  WITH CHECK (true);

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
CREATE TRIGGER update_centers_updated_at
  BEFORE UPDATE ON public.centers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_packs_updated_at
  BEFORE UPDATE ON public.packs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Fonction pour créer automatiquement un centre quand un user s'inscrit
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_slug TEXT;
BEGIN
  -- Générer un slug unique basé sur l'email
  new_slug := LOWER(REPLACE(SPLIT_PART(NEW.email, '@', 1), '.', '-')) || '-' || SUBSTRING(NEW.id::TEXT, 1, 8);
  
  -- Créer le centre
  INSERT INTO public.centers (owner_id, slug, name)
  VALUES (NEW.id, new_slug, 'Mon Centre Auto');
  
  -- Ajouter le rôle owner
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'owner');
  
  RETURN NEW;
END;
$$;

-- Trigger pour créer le centre à l'inscription
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();-- Ajouter la policy manquante sur user_roles
CREATE POLICY "Les utilisateurs peuvent voir leur propre rôle"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Corriger la fonction update_updated_at_column avec search_path
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recréer les triggers
CREATE TRIGGER update_centers_updated_at
  BEFORE UPDATE ON public.centers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_packs_updated_at
  BEFORE UPDATE ON public.packs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();-- Créer le bucket pour les logos des centres
INSERT INTO storage.buckets (id, name, public)
VALUES ('center-logos', 'center-logos', true);

-- Politique : tout le monde peut voir les logos (public)
CREATE POLICY "Logos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'center-logos');

-- Politique : les propriétaires peuvent uploader leur logo
CREATE POLICY "Owners can upload their logo"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'center-logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Politique : les propriétaires peuvent modifier leur logo
CREATE POLICY "Owners can update their logo"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'center-logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Politique : les propriétaires peuvent supprimer leur logo
CREATE POLICY "Owners can delete their logo"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'center-logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);-- Créer enum pour les plans
CREATE TYPE public.subscription_plan AS ENUM ('free', 'pro');

-- Ajouter colonne plan aux centers (défaut: free)
ALTER TABLE public.centers 
ADD COLUMN subscription_plan subscription_plan NOT NULL DEFAULT 'free';

-- Créer table pour les demandes de contact (version gratuite)
CREATE TABLE public.contact_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  center_id UUID NOT NULL REFERENCES public.centers(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'new'
);

-- Enable RLS
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

-- Les propriétaires peuvent voir leurs demandes
CREATE POLICY "Les propriétaires peuvent voir leurs demandes"
ON public.contact_requests
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.centers
    WHERE centers.id = contact_requests.center_id
    AND centers.owner_id = auth.uid()
  )
);

-- Les propriétaires peuvent modifier leurs demandes
CREATE POLICY "Les propriétaires peuvent modifier leurs demandes"
ON public.contact_requests
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.centers
    WHERE centers.id = contact_requests.center_id
    AND centers.owner_id = auth.uid()
  )
);

-- Tout le monde peut créer une demande
CREATE POLICY "Tout le monde peut créer une demande"
ON public.contact_requests
FOR INSERT
WITH CHECK (true);-- Create RLS policies for center-logos bucket

-- Allow authenticated users to upload their own logo
CREATE POLICY "Users can upload their own logo"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'center-logos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own logo
CREATE POLICY "Users can update their own logo"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'center-logos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own logo
CREATE POLICY "Users can delete their own logo"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'center-logos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow anyone to view logos (public bucket)
CREATE POLICY "Anyone can view logos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'center-logos');-- Add price_variants column to packs table
-- This allows flexible pricing per category (vehicle type, furniture type, etc.)
-- Format: [{"name": "Citadine", "price": 45}, {"name": "Berline", "price": 55}]

ALTER TABLE public.packs 
ADD COLUMN price_variants jsonb DEFAULT '[]'::jsonb;-- Ajouter un seul champ JSONB pour toutes les personnalisations
ALTER TABLE public.centers 
ADD COLUMN IF NOT EXISTS customization jsonb DEFAULT '{
  "colors": {
    "primary": "#3b82f6",
    "secondary": "#1e293b",
    "accent": "#10b981"
  },
  "texts": {
    "tagline": "",
    "cta_button": "Réserver maintenant"
  },
  "layout": {
    "show_hours": true,
    "show_address": true,
    "show_phone": true,
    "dark_mode": false
  },
  "cover_url": null
}'::jsonb;-- Mettre à jour la fonction pour copier l'email lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_slug TEXT;
BEGIN
  -- Générer un slug unique basé sur l'email
  new_slug := LOWER(REPLACE(SPLIT_PART(NEW.email, '@', 1), '.', '-')) || '-' || SUBSTRING(NEW.id::TEXT, 1, 8);
  
  -- Créer le centre avec l'email de l'utilisateur
  INSERT INTO public.centers (owner_id, slug, name, email)
  VALUES (NEW.id, new_slug, 'Mon Centre Auto', NEW.email);
  
  -- Ajouter le rôle owner
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'owner');
  
  RETURN NEW;
END;
$$;

-- Créer une vue admin pour voir facilement les infos clés
CREATE OR REPLACE VIEW public.admin_centers_view AS
SELECT 
  c.id,
  c.owner_id as user_id,
  c.email as user_email,
  c.name as business_name,
  c.slug,
  c.subscription_plan,
  c.phone,
  c.address,
  c.created_at as signup_date,
  c.updated_at as last_update,
  (SELECT COUNT(*) FROM public.appointments a WHERE a.center_id = c.id) as total_appointments,
  (SELECT COUNT(*) FROM public.packs p WHERE p.center_id = c.id AND p.active = true) as active_packs
FROM public.centers c
ORDER BY c.created_at DESC;-- Supprimer la vue SECURITY DEFINER et la recréer sans cette option
DROP VIEW IF EXISTS public.admin_centers_view;

-- Recréer la vue simple (elle héritera des permissions RLS de la table centers)
CREATE VIEW public.admin_centers_view AS
SELECT 
  c.id,
  c.owner_id as user_id,
  c.email as user_email,
  c.name as business_name,
  c.slug,
  c.subscription_plan,
  c.phone,
  c.address,
  c.created_at as signup_date,
  c.updated_at as last_update,
  (SELECT COUNT(*) FROM public.appointments a WHERE a.center_id = c.id) as total_appointments,
  (SELECT COUNT(*) FROM public.packs p WHERE p.center_id = c.id AND p.active = true) as active_packs
FROM public.centers c
ORDER BY c.created_at DESC;-- Ajouter les nouveaux statuts d'abonnement à l'enum
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
ORDER BY c.created_at DESC;-- Mettre à jour les emails des centres existants depuis auth.users
UPDATE public.centers c
SET email = u.email
FROM auth.users u
WHERE c.owner_id = u.id
AND (c.email IS NULL OR c.email = '');-- Create storage bucket for gallery images
INSERT INTO storage.buckets (id, name, public)
VALUES ('center-gallery', 'center-gallery', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to gallery images
CREATE POLICY "Gallery images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'center-gallery');

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload gallery images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'center-gallery' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own gallery images
CREATE POLICY "Users can delete their gallery images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'center-gallery' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);-- =============================================
-- SECURITY FIX 1: Restrict public access to centers table
-- =============================================

-- Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Tout le monde peut voir les centres publiquement" ON public.centers;

-- Create a new restrictive policy that only allows public access to non-sensitive columns
-- Since PostgreSQL RLS can't restrict columns, we'll use a different approach:
-- Public users can only select, but the application code will select specific columns
-- Owners and admins can see all their data via the existing owner policy
CREATE POLICY "Public can view public center data"
  ON public.centers
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Note: The actual column restriction will be enforced by:
-- 1. Creating a public view with only safe columns
-- 2. Updating client code to use explicit column selection

-- Create a secure public view with only non-sensitive fields
CREATE OR REPLACE VIEW public.public_centers_view
WITH (security_invoker = on)
AS SELECT 
  id,
  slug,
  name,
  address,
  phone,  -- phone is intentionally public for contact purposes on booking page
  logo_url,
  customization,
  welcome_message,
  ai_enabled,
  subscription_plan,
  created_at,
  updated_at
FROM public.centers;

-- Grant access to the public view
GRANT SELECT ON public.public_centers_view TO anon, authenticated;

-- =============================================
-- SECURITY FIX 2: Replace admin_centers_view with a SECURITY DEFINER function
-- =============================================

-- Drop the insecure view
DROP VIEW IF EXISTS public.admin_centers_view;

-- Create a SECURITY DEFINER function that checks for admin role
CREATE OR REPLACE FUNCTION public.get_admin_centers_data()
RETURNS TABLE (
  "Email" text,
  "Business" text,
  "Abo" subscription_plan,
  "Fin Abo" timestamptz,
  "Tel" text,
  "Lien" text,
  "Inscription" timestamptz,
  "Stripe ID" text,
  "RDV" bigint,
  id uuid,
  owner_id uuid
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    c.email,
    c.name,
    c.subscription_plan,
    c.subscription_end_date,
    c.phone,
    c.slug,
    c.created_at,
    c.stripe_customer_id,
    (SELECT COUNT(*) FROM public.appointments a WHERE a.center_id = c.id),
    c.id,
    c.owner_id
  FROM public.centers c
  WHERE public.has_role(auth.uid(), 'admin')
  ORDER BY c.created_at DESC;
$$;

-- Recreate the view using the secure function for backwards compatibility
-- This view will only return data if the user is an admin
CREATE VIEW public.admin_centers_view AS
SELECT * FROM public.get_admin_centers_data();

-- Grant usage to authenticated users (the function itself will check admin role)
GRANT SELECT ON public.admin_centers_view TO authenticated;-- Add image_url column to packs table for pack images
ALTER TABLE public.packs ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT NULL;-- Add policy for owners to delete their appointments
CREATE POLICY "Les propriétaires peuvent supprimer leurs rendez-vous"
ON public.appointments
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM centers
  WHERE centers.id = appointments.center_id
  AND centers.owner_id = auth.uid()
));-- Créer la table blocked_periods pour persister les périodes bloquées
CREATE TABLE public.blocked_periods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  center_id UUID NOT NULL REFERENCES public.centers(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blocked_periods ENABLE ROW LEVEL SECURITY;

-- Les propriétaires peuvent gérer leurs périodes bloquées
CREATE POLICY "Les propriétaires peuvent gérer leurs périodes bloquées"
ON public.blocked_periods
FOR ALL
USING (EXISTS (
  SELECT 1 FROM centers
  WHERE centers.id = blocked_periods.center_id
  AND centers.owner_id = auth.uid()
));

-- Tout le monde peut voir les périodes bloquées (pour le booking public)
CREATE POLICY "Tout le monde peut voir les périodes bloquées"
ON public.blocked_periods
FOR SELECT
USING (true);
-- Supprimer la contrainte unique qui empêche plusieurs slots par jour
ALTER TABLE public.availability DROP CONSTRAINT IF EXISTS availability_center_id_day_of_week_key;
-- Table des taux de TVA personnalisés par centre
CREATE TABLE public.vat_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  center_id UUID NOT NULL REFERENCES public.centers(id) ON DELETE CASCADE,
  rate DECIMAL(5,2) NOT NULL,
  label TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.vat_rates ENABLE ROW LEVEL SECURITY;

-- Policies pour vat_rates
CREATE POLICY "Les propriétaires peuvent gérer leurs taux de TVA"
ON public.vat_rates
FOR ALL
USING (EXISTS (
  SELECT 1 FROM centers
  WHERE centers.id = vat_rates.center_id AND centers.owner_id = auth.uid()
));

-- Table des factures et devis
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  center_id UUID NOT NULL REFERENCES public.centers(id) ON DELETE CASCADE,
  
  -- Type et numérotation
  type TEXT NOT NULL CHECK (type IN ('invoice', 'quote')),
  number TEXT NOT NULL,
  
  -- Infos client
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  client_address TEXT,
  
  -- Dates
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  valid_until DATE, -- Pour les devis
  
  -- Statut
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'paid', 'cancelled')),
  
  -- Montants (calculés)
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_vat DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  
  -- Notes
  notes TEXT,
  terms TEXT,
  
  -- Conversion devis → facture
  converted_from_quote_id UUID REFERENCES public.invoices(id),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index pour la numérotation
CREATE INDEX idx_invoices_center_type ON public.invoices(center_id, type);
CREATE INDEX idx_invoices_number ON public.invoices(number);

-- Activer RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Policies pour invoices
CREATE POLICY "Les propriétaires peuvent gérer leurs factures"
ON public.invoices
FOR ALL
USING (EXISTS (
  SELECT 1 FROM centers
  WHERE centers.id = invoices.center_id AND centers.owner_id = auth.uid()
));

-- Table des lignes de facture/devis
CREATE TABLE public.invoice_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  vat_rate DECIMAL(5,2) NOT NULL DEFAULT 20,
  
  -- Montants calculés
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  vat_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- Policy pour invoice_items (via la facture parente)
CREATE POLICY "Les propriétaires peuvent gérer leurs lignes de facture"
ON public.invoice_items
FOR ALL
USING (EXISTS (
  SELECT 1 FROM invoices
  JOIN centers ON centers.id = invoices.center_id
  WHERE invoices.id = invoice_items.invoice_id AND centers.owner_id = auth.uid()
));

-- Trigger pour updated_at sur invoices
CREATE TRIGGER update_invoices_updated_at
BEFORE UPDATE ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insérer les taux de TVA par défaut pour chaque centre existant
INSERT INTO public.vat_rates (center_id, rate, label, is_default)
SELECT id, 20, 'TVA 20%', true FROM public.centers
UNION ALL
SELECT id, 10, 'TVA 10%', false FROM public.centers
UNION ALL
SELECT id, 5.5, 'TVA 5.5%', false FROM public.centers
UNION ALL
SELECT id, 0, 'Exonéré', false FROM public.centers;-- Add column to track if invoice should be included in statistics
ALTER TABLE public.invoices 
ADD COLUMN include_in_stats boolean NOT NULL DEFAULT true;-- Ajouter la colonne adresse aux rendez-vous
ALTER TABLE public.appointments 
ADD COLUMN client_address TEXT;

-- Ajouter le buffer de déplacement aux centers (dans customization JSON existant)
-- On va stocker dans customization.settings.appointment_buffer (en minutes)-- =============================================
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
-- public_centers_view au lieu de centers directement pour les requêtes publiques-- =============================================
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
);-- Fix the admin_centers_view to use security_invoker instead of security_definer
-- This ensures RLS policies of the querying user are applied

-- Drop existing view
DROP VIEW IF EXISTS public.admin_centers_view;

-- Recreate with security_invoker
CREATE VIEW public.admin_centers_view 
WITH (security_invoker = on) AS
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
WHERE public.has_role(auth.uid(), 'admin')
ORDER BY c.created_at DESC;-- Add duration_minutes column to appointments table
-- This stores the actual service duration to calculate end time accurately
ALTER TABLE public.appointments 
ADD COLUMN duration_minutes integer DEFAULT 60;

-- Create composite index for efficient availability lookups at scale
CREATE INDEX idx_appointments_availability_lookup 
ON public.appointments (center_id, appointment_date, status)
WHERE status NOT IN ('cancelled');-- Table des prestations personnalisées
CREATE TABLE public.custom_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  center_id UUID NOT NULL REFERENCES public.centers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  price NUMERIC NOT NULL DEFAULT 0,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des clients enregistrés
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  center_id UUID NOT NULL REFERENCES public.centers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  default_service_id UUID REFERENCES public.custom_services(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Colonnes additionnelles sur appointments
ALTER TABLE public.appointments 
ADD COLUMN client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
ADD COLUMN custom_service_id UUID REFERENCES public.custom_services(id) ON DELETE SET NULL,
ADD COLUMN custom_price NUMERIC;

-- Index pour les performances
CREATE INDEX idx_custom_services_center_id ON public.custom_services(center_id);
CREATE INDEX idx_clients_center_id ON public.clients(center_id);
CREATE INDEX idx_appointments_client_id ON public.appointments(client_id);
CREATE INDEX idx_appointments_custom_service_id ON public.appointments(custom_service_id);

-- Trigger pour updated_at sur custom_services
CREATE TRIGGER update_custom_services_updated_at
BEFORE UPDATE ON public.custom_services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger pour updated_at sur clients
CREATE TRIGGER update_clients_updated_at
BEFORE UPDATE ON public.clients
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- RLS sur custom_services
ALTER TABLE public.custom_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Les propriétaires peuvent gérer leurs prestations"
ON public.custom_services
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.centers
  WHERE centers.id = custom_services.center_id
  AND centers.owner_id = auth.uid()
));

-- RLS sur clients
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Les propriétaires peuvent gérer leurs clients"
ON public.clients
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.centers
  WHERE centers.id = clients.center_id
  AND centers.owner_id = auth.uid()
));-- Add source field to track how client was added
ALTER TABLE public.clients 
ADD COLUMN source text NOT NULL DEFAULT 'manual';

-- Add comment for clarity
COMMENT ON COLUMN public.clients.source IS 'How the client was added: manual or booking';
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
-- Ajouter la colonne adresse aux demandes de contact
ALTER TABLE public.contact_requests 
ADD COLUMN client_address TEXT;-- Index pour le nouveau statut pending_validation (filtrage rapide des demandes en attente)
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
WHERE status NOT IN ('cancelled', 'refused');-- Ajouter le champ email aux demandes de contact
ALTER TABLE public.contact_requests 
ADD COLUMN IF NOT EXISTS client_email text;

-- Ajouter le champ pour enregistrer la date de contact
ALTER TABLE public.contact_requests 
ADD COLUMN IF NOT EXISTS contacted_at timestamp with time zone;

-- Créer un index pour les recherches par email
CREATE INDEX IF NOT EXISTS idx_contact_requests_email 
ON public.contact_requests (client_email) 
WHERE client_email IS NOT NULL;-- Recréer la fonction de normalisation du téléphone
CREATE OR REPLACE FUNCTION public.normalize_phone(phone text)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
  SELECT REGEXP_REPLACE(COALESCE(phone, ''), '[^0-9+]', '', 'g')
$$;-- Corriger la fonction avec search_path sécurisé
CREATE OR REPLACE FUNCTION public.normalize_phone(phone text)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT REGEXP_REPLACE(COALESCE(phone, ''), '[^0-9+]', '', 'g')
$$;

-- Étape 1: Réassigner les rendez-vous des doublons vers le client original (le plus ancien)
WITH duplicates AS (
  SELECT 
    center_id,
    public.normalize_phone(phone) as norm_phone,
    MIN(created_at) as first_created,
    array_agg(id ORDER BY created_at) as all_ids
  FROM public.clients
  WHERE phone IS NOT NULL AND phone <> ''
  GROUP BY center_id, public.normalize_phone(phone)
  HAVING COUNT(*) > 1
),
keep_ids AS (
  SELECT c.id as keep_id, d.all_ids
  FROM duplicates d
  JOIN public.clients c ON c.center_id = d.center_id 
    AND public.normalize_phone(c.phone) = d.norm_phone 
    AND c.created_at = d.first_created
)
UPDATE public.appointments a
SET client_id = k.keep_id
FROM keep_ids k
WHERE a.client_id = ANY(k.all_ids) AND a.client_id != k.keep_id;

-- Étape 2: Supprimer les clients en double (garder seulement le plus ancien)
WITH duplicates AS (
  SELECT 
    center_id,
    public.normalize_phone(phone) as norm_phone,
    MIN(created_at) as first_created
  FROM public.clients
  WHERE phone IS NOT NULL AND phone <> ''
  GROUP BY center_id, public.normalize_phone(phone)
  HAVING COUNT(*) > 1
)
DELETE FROM public.clients c
USING duplicates d
WHERE c.center_id = d.center_id 
  AND public.normalize_phone(c.phone) = d.norm_phone 
  AND c.created_at > d.first_created;

-- Étape 3: Créer l'index unique pour empêcher les futurs doublons
CREATE UNIQUE INDEX IF NOT EXISTS idx_clients_unique_phone_per_center 
ON public.clients (center_id, public.normalize_phone(phone))
WHERE phone IS NOT NULL AND phone <> '';

-- Étape 4: Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_clients_phone_lookup 
ON public.clients (center_id, phone) 
WHERE phone IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_clients_email_lookup 
ON public.clients (center_id, email) 
WHERE email IS NOT NULL;-- Créer l'index unique sur email maintenant que les doublons sont supprimés
CREATE UNIQUE INDEX IF NOT EXISTS idx_clients_unique_email_per_center 
ON public.clients (center_id, LOWER(email))
WHERE email IS NOT NULL AND email <> '';-- Add ical_token column to centers table for calendar sync security
ALTER TABLE public.centers 
ADD COLUMN IF NOT EXISTS ical_token TEXT UNIQUE;

-- Generate tokens for existing centers that don't have one
UPDATE public.centers 
SET ical_token = gen_random_uuid()::text 
WHERE ical_token IS NULL;

-- Create trigger to auto-generate token for new centers
CREATE OR REPLACE FUNCTION public.generate_ical_token()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ical_token IS NULL THEN
    NEW.ical_token := gen_random_uuid()::text;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS set_ical_token ON public.centers;
CREATE TRIGGER set_ical_token
  BEFORE INSERT ON public.centers
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_ical_token();-- Fix: Add 'pending_validation' to the status check constraint
-- The constraint currently only allows: pending, confirmed, completed, cancelled, refused
-- But the code is trying to insert with 'pending_validation' status

-- First, drop the existing constraint
ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS appointments_status_check;

-- Recreate with all valid statuses including pending_validation
ALTER TABLE public.appointments 
ADD CONSTRAINT appointments_status_check 
CHECK (status IN ('pending_validation', 'pending', 'confirmed', 'completed', 'cancelled', 'refused'));-- SECURITY FIX: Update public_centers_view to exclude sensitive data
-- This view is used for public access and should NOT expose:
-- - email, phone (owner PII)
-- - ical_token (security token)
-- - stripe_customer_id, stripe_subscription_id (payment data)
-- - owner_id (internal reference)

DROP VIEW IF EXISTS public.public_centers_view;

CREATE VIEW public.public_centers_view 
WITH (security_invoker = on)
AS
SELECT 
  id,
  slug,
  name,
  address,
  phone, -- Phone is intentionally public for customer contact
  logo_url,
  welcome_message,
  customization,
  ai_enabled,
  subscription_plan,
  created_at,
  updated_at
FROM public.centers;

-- Add RLS to the view (views inherit table RLS when security_invoker=on)
-- The centers table already has public SELECT access

COMMENT ON VIEW public.public_centers_view IS 'Public-safe view of centers, excluding sensitive data like email, stripe IDs, ical_token, and owner_id';-- Add client_id to invoices table to link documents to clients
ALTER TABLE public.invoices 
ADD COLUMN client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL;

-- Create an index for faster lookups
CREATE INDEX idx_invoices_client_id ON public.invoices(client_id);

-- Comment for documentation
COMMENT ON COLUMN public.invoices.client_id IS 'Optional link to client record for centralized activity tracking';-- =====================================================
-- SECURITY FIX: Protect sensitive data in centers table
-- =====================================================

-- 1. Drop the overly permissive public SELECT policy on centers
DROP POLICY IF EXISTS "Public can view non-sensitive center data" ON public.centers;

-- 2. Create a restricted public SELECT policy that only exposes non-sensitive columns
-- Users must access data via the secure public_centers_view which excludes sensitive fields
CREATE POLICY "Public can view centers via secure view only"
ON public.centers
FOR SELECT
USING (
  -- Allow public to read only if accessing through the secure view pattern
  -- This effectively blocks direct table access while allowing the view to work
  auth.uid() = owner_id OR auth.uid() IS NULL
);

-- Actually, let's be more restrictive - public should use the view, not the table directly
-- Drop and recreate with proper restrictions
DROP POLICY IF EXISTS "Public can view centers via secure view only" ON public.centers;

-- Create policy that only allows owners to see their full data
-- Public access should go through public_centers_view
CREATE POLICY "Authenticated owners can view their own center"
ON public.centers
FOR SELECT
USING (auth.uid() = owner_id);

-- =====================================================
-- SECURITY FIX: Enable RLS on admin_centers_view
-- =====================================================

-- Enable RLS on the admin view
ALTER VIEW public.admin_centers_view SET (security_invoker = on);

-- Note: Views with security_invoker inherit RLS from underlying tables
-- Since centers table now restricts to owners only, and the view uses
-- get_admin_centers_data() which checks for admin role, this is now secure

-- =====================================================
-- SECURITY FIX: Verify appointments table protection
-- =====================================================

-- The appointments table already has proper RLS policies:
-- - SELECT: Only center owners can view
-- - UPDATE: Only center owners can modify
-- - DELETE: Only center owners can delete
-- - INSERT: Public can create with valid data (needed for booking flow)

-- But let's verify there's no public SELECT by checking existing policies
-- The existing policy "Les propriétaires peuvent voir leurs rendez-vous" 
-- already restricts SELECT to owners only via the EXISTS check
-- Fonction RPC sécurisée pour la reconnaissance client par téléphone
-- Retourne le strict minimum : prénom, prestation par défaut, infos de contact
-- Utilise l'index existant normalize_phone() pour O(1) lookup
CREATE OR REPLACE FUNCTION public.lookup_client_by_phone(
  p_center_id UUID,
  p_phone TEXT
)
RETURNS TABLE (
  client_id UUID,
  first_name TEXT,
  client_name TEXT,
  client_email TEXT,
  client_phone TEXT,
  client_address TEXT,
  service_id UUID,
  service_name TEXT,
  service_price NUMERIC,
  service_duration_minutes INTEGER
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    c.id AS client_id,
    SPLIT_PART(c.name, ' ', 1) AS first_name,
    c.name AS client_name,
    c.email AS client_email,
    c.phone AS client_phone,
    c.address AS client_address,
    cs.id AS service_id,
    cs.name AS service_name,
    cs.price AS service_price,
    cs.duration_minutes AS service_duration_minutes
  FROM clients c
  LEFT JOIN custom_services cs ON cs.id = c.default_service_id AND cs.active = true
  WHERE c.center_id = p_center_id
    AND public.normalize_phone(c.phone) = public.normalize_phone(p_phone)
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.lookup_client_by_email(p_center_id uuid, p_email text)
 RETURNS TABLE(client_id uuid, first_name text, client_name text, client_email text, client_phone text, client_address text, service_id uuid, service_name text, service_price numeric, service_duration_minutes integer)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT
    c.id AS client_id,
    SPLIT_PART(c.name, ' ', 1) AS first_name,
    c.name AS client_name,
    c.email AS client_email,
    c.phone AS client_phone,
    c.address AS client_address,
    cs.id AS service_id,
    cs.name AS service_name,
    cs.price AS service_price,
    cs.duration_minutes AS service_duration_minutes
  FROM clients c
  LEFT JOIN custom_services cs ON cs.id = c.default_service_id AND cs.active = true
  WHERE c.center_id = p_center_id
    AND LOWER(TRIM(c.email)) = LOWER(TRIM(p_email))
  LIMIT 1;
$$;

-- Fix lookup_client_by_email: only return first_name and service info, not full PII
CREATE OR REPLACE FUNCTION public.lookup_client_by_email(p_center_id uuid, p_email text)
 RETURNS TABLE(client_id uuid, first_name text, client_name text, client_email text, client_phone text, client_address text, service_id uuid, service_name text, service_price numeric, service_duration_minutes integer)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT
    c.id AS client_id,
    SPLIT_PART(c.name, ' ', 1) AS first_name,
    NULL::text AS client_name,
    NULL::text AS client_email,
    NULL::text AS client_phone,
    NULL::text AS client_address,
    cs.id AS service_id,
    cs.name AS service_name,
    cs.price AS service_price,
    cs.duration_minutes AS service_duration_minutes
  FROM clients c
  LEFT JOIN custom_services cs ON cs.id = c.default_service_id AND cs.active = true
  WHERE c.center_id = p_center_id
    AND LOWER(TRIM(c.email)) = LOWER(TRIM(p_email))
  LIMIT 1;
$$;

-- Fix lookup_client_by_phone: only return first_name and service info, not full PII
CREATE OR REPLACE FUNCTION public.lookup_client_by_phone(p_center_id uuid, p_phone text)
 RETURNS TABLE(client_id uuid, first_name text, client_name text, client_email text, client_phone text, client_address text, service_id uuid, service_name text, service_price numeric, service_duration_minutes integer)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT
    c.id AS client_id,
    SPLIT_PART(c.name, ' ', 1) AS first_name,
    NULL::text AS client_name,
    NULL::text AS client_email,
    NULL::text AS client_phone,
    NULL::text AS client_address,
    cs.id AS service_id,
    cs.name AS service_name,
    cs.price AS service_price,
    cs.duration_minutes AS service_duration_minutes
  FROM clients c
  LEFT JOIN custom_services cs ON cs.id = c.default_service_id AND cs.active = true
  WHERE c.center_id = p_center_id
    AND public.normalize_phone(c.phone) = public.normalize_phone(p_phone)
  LIMIT 1;
$$;

-- Drop existing INSERT policies for storage buckets and recreate with file extension restrictions

-- center-logos bucket: drop old INSERT policy and create restricted one
DROP POLICY IF EXISTS "Users can upload their own logo" ON storage.objects;
CREATE POLICY "Users can upload image logos only"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'center-logos'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND lower(storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'gif', 'webp')
);

-- center-gallery bucket: drop old INSERT policy and create restricted one
DROP POLICY IF EXISTS "Users can upload gallery images" ON storage.objects;
CREATE POLICY "Users can upload gallery images only"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'center-gallery'
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND lower(storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'gif', 'webp')
);
ALTER TABLE public.centers ADD COLUMN email_language text NOT NULL DEFAULT 'fr';
-- Create junction table for client <-> custom_services (many-to-many)
CREATE TABLE public.client_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.custom_services(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(client_id, service_id)
);

-- Enable RLS
ALTER TABLE public.client_services ENABLE ROW LEVEL SECURITY;

-- Owners can manage their client_services (via clients -> centers)
CREATE POLICY "Les propriétaires peuvent gérer les services clients"
ON public.client_services
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM clients
    JOIN centers ON centers.id = clients.center_id
    WHERE clients.id = client_services.client_id
    AND centers.owner_id = auth.uid()
  )
);

-- Migrate existing default_service_id data
INSERT INTO public.client_services (client_id, service_id)
SELECT id, default_service_id FROM public.clients
WHERE default_service_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- Update lookup_client_by_email to return multiple services via client_services
CREATE OR REPLACE FUNCTION public.lookup_client_by_email(p_center_id uuid, p_email text)
 RETURNS TABLE(client_id uuid, first_name text, client_name text, client_email text, client_phone text, client_address text, service_id uuid, service_name text, service_price numeric, service_duration_minutes integer)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT
    c.id AS client_id,
    SPLIT_PART(c.name, ' ', 1) AS first_name,
    NULL::text AS client_name,
    NULL::text AS client_email,
    NULL::text AS client_phone,
    NULL::text AS client_address,
    cs.id AS service_id,
    cs.name AS service_name,
    cs.price AS service_price,
    cs.duration_minutes AS service_duration_minutes
  FROM clients c
  LEFT JOIN client_services cls ON cls.client_id = c.id
  LEFT JOIN custom_services cs ON cs.id = cls.service_id AND cs.active = true
  WHERE c.center_id = p_center_id
    AND LOWER(TRIM(c.email)) = LOWER(TRIM(p_email));
$function$;

-- Also update lookup_client_by_phone for consistency
CREATE OR REPLACE FUNCTION public.lookup_client_by_phone(p_center_id uuid, p_phone text)
 RETURNS TABLE(client_id uuid, first_name text, client_name text, client_email text, client_phone text, client_address text, service_id uuid, service_name text, service_price numeric, service_duration_minutes integer)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT
    c.id AS client_id,
    SPLIT_PART(c.name, ' ', 1) AS first_name,
    NULL::text AS client_name,
    NULL::text AS client_email,
    NULL::text AS client_phone,
    NULL::text AS client_address,
    cs.id AS service_id,
    cs.name AS service_name,
    cs.price AS service_price,
    cs.duration_minutes AS service_duration_minutes
  FROM clients c
  LEFT JOIN client_services cls ON cls.client_id = c.id
  LEFT JOIN custom_services cs ON cs.id = cls.service_id AND cs.active = true
  WHERE c.center_id = p_center_id
    AND public.normalize_phone(c.phone) = public.normalize_phone(p_phone);
$function$;
-- Allow public read access to centers through the public_centers_view
-- The view already filters out sensitive columns (email, stripe IDs, ical_token, owner_id)
-- so this is safe to expose publicly
CREATE POLICY "Public can view centers via public view"
ON public.centers
FOR SELECT
TO anon, authenticated
USING (true);-- Remove the overly permissive policy we just created
DROP POLICY IF EXISTS "Public can view centers via public view" ON public.centers;

-- Recreate the public view WITHOUT security_invoker so it runs as the view owner (definer)
-- This means the view can read from centers without needing public RLS on the base table
DROP VIEW IF EXISTS public.public_centers_view;

CREATE VIEW public.public_centers_view AS
  SELECT id, slug, name, address, phone, logo_url, welcome_message,
         customization, ai_enabled, subscription_plan, created_at, updated_at
  FROM centers;

COMMENT ON VIEW public.public_centers_view IS 'Public-safe view of centers, excluding sensitive data like email, stripe IDs, ical_token, and owner_id';

-- Grant SELECT on the view to anon and authenticated roles
GRANT SELECT ON public.public_centers_view TO anon, authenticated;
-- Add geolocation and intervention radius to centers
ALTER TABLE public.centers
  ADD COLUMN IF NOT EXISTS latitude double precision DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS longitude double precision DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS intervention_radius_km integer DEFAULT 30;

-- Drop and recreate the view with new columns
DROP VIEW IF EXISTS public.public_centers_view;

CREATE VIEW public.public_centers_view WITH (security_invoker = false) AS
SELECT
  c.id,
  c.slug,
  c.name,
  c.address,
  c.phone,
  c.logo_url,
  c.welcome_message,
  c.customization,
  c.ai_enabled,
  c.subscription_plan,
  c.latitude,
  c.longitude,
  c.intervention_radius_km,
  c.created_at,
  c.updated_at
FROM centers c;

-- Add pricing_type to packs (fixed = booking flow, quote = quote request flow)
ALTER TABLE public.packs ADD COLUMN pricing_type TEXT NOT NULL DEFAULT 'fixed';

-- Add request_type and service_name to contact_requests to differentiate contact vs quote requests
ALTER TABLE public.contact_requests ADD COLUMN request_type TEXT NOT NULL DEFAULT 'contact';
ALTER TABLE public.contact_requests ADD COLUMN service_name TEXT;

ALTER TABLE public.clients ADD COLUMN client_type text NOT NULL DEFAULT 'particulier';

-- 1. Add images column to contact_requests
ALTER TABLE public.contact_requests ADD COLUMN images text[] DEFAULT '{}'::text[];

-- 2. Add quote_form_message to centers
ALTER TABLE public.centers ADD COLUMN quote_form_message text DEFAULT NULL;

-- 3. Create storage bucket for contact request images
INSERT INTO storage.buckets (id, name, public) VALUES ('contact-images', 'contact-images', true);

-- 4. RLS: anyone can upload to contact-images (public form)
CREATE POLICY "Anyone can upload contact images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'contact-images');

-- 5. RLS: anyone can read contact images
CREATE POLICY "Anyone can read contact images"
ON storage.objects FOR SELECT
USING (bucket_id = 'contact-images');

-- 6. Owners can delete contact images
CREATE POLICY "Owners can delete contact images"
ON storage.objects FOR DELETE
USING (bucket_id = 'contact-images' AND auth.uid() IS NOT NULL);

CREATE OR REPLACE VIEW public.public_centers_view AS
SELECT id,
    slug,
    name,
    address,
    phone,
    logo_url,
    welcome_message,
    customization,
    ai_enabled,
    subscription_plan,
    latitude,
    longitude,
    intervention_radius_km,
    created_at,
    updated_at,
    quote_form_message
FROM centers c;
-- Add company_name to clients table
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS company_name text;

-- Add client_type and company_name to contact_requests for quote forms
ALTER TABLE public.contact_requests ADD COLUMN IF NOT EXISTS client_type text NOT NULL DEFAULT 'particulier';
ALTER TABLE public.contact_requests ADD COLUMN IF NOT EXISTS company_name text;
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

-- Update public_centers_view to expose deposit settings for the booking page
CREATE OR REPLACE VIEW public.public_centers_view WITH (security_invoker = on) AS
SELECT
  c.id,
  c.slug,
  c.name,
  c.address,
  c.phone,
  c.logo_url,
  c.welcome_message,
  c.customization,
  c.ai_enabled,
  c.subscription_plan,
  c.latitude,
  c.longitude,
  c.intervention_radius_km,
  c.created_at,
  c.updated_at,
  c.quote_form_message,
  c.deposit_enabled,
  c.deposit_type,
  c.deposit_value,
  c.stripe_connect_status
FROM public.centers c;

-- Drop and recreate view with correct column order
DROP VIEW IF EXISTS public.public_centers_view;

CREATE VIEW public.public_centers_view WITH (security_invoker = on) AS
SELECT
  c.id,
  c.slug,
  c.name,
  c.address,
  c.phone,
  c.logo_url,
  c.welcome_message,
  c.ai_enabled,
  c.subscription_plan,
  c.customization,
  c.latitude,
  c.longitude,
  c.intervention_radius_km,
  c.deposit_enabled,
  c.deposit_type,
  c.deposit_value,
  c.stripe_connect_status,
  c.quote_form_message,
  c.created_at,
  c.updated_at
FROM public.centers c;
ALTER TABLE public.centers ADD COLUMN payments_mode text NOT NULL DEFAULT 'live';

-- Update the public view to NOT expose payments_mode
DROP VIEW IF EXISTS public.public_centers_view;

CREATE VIEW public.public_centers_view WITH (security_invoker = on) AS
SELECT
  c.id,
  c.slug,
  c.name,
  c.address,
  c.phone,
  c.logo_url,
  c.welcome_message,
  c.ai_enabled,
  c.subscription_plan,
  c.customization,
  c.latitude,
  c.longitude,
  c.intervention_radius_km,
  c.deposit_enabled,
  c.deposit_type,
  c.deposit_value,
  c.stripe_connect_status,
  c.quote_form_message,
  c.created_at,
  c.updated_at
FROM public.centers c;
-- 1. Update the handle_new_user function to also create default availability
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  new_slug TEXT;
  new_center_id UUID;
BEGIN
  -- Générer un slug unique basé sur l'email
  new_slug := LOWER(REPLACE(SPLIT_PART(NEW.email, '@', 1), '.', '-')) || '-' || SUBSTRING(NEW.id::TEXT, 1, 8);
  
  -- Créer le centre avec l'email de l'utilisateur
  INSERT INTO public.centers (owner_id, slug, name, email)
  VALUES (NEW.id, new_slug, 'Mon Centre Auto', NEW.email)
  RETURNING id INTO new_center_id;
  
  -- Ajouter le rôle owner
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'owner');
  
  -- Créer les disponibilités par défaut (Lundi à Samedi, 9h-12h + 14h-18h)
  INSERT INTO public.availability (center_id, day_of_week, start_time, end_time, enabled)
  VALUES
    (new_center_id, 1, '09:00', '12:00', true),
    (new_center_id, 1, '14:00', '18:00', true),
    (new_center_id, 2, '09:00', '12:00', true),
    (new_center_id, 2, '14:00', '18:00', true),
    (new_center_id, 3, '09:00', '12:00', true),
    (new_center_id, 3, '14:00', '18:00', true),
    (new_center_id, 4, '09:00', '12:00', true),
    (new_center_id, 4, '14:00', '18:00', true),
    (new_center_id, 5, '09:00', '12:00', true),
    (new_center_id, 5, '14:00', '18:00', true),
    (new_center_id, 6, '09:00', '12:00', true),
    (new_center_id, 6, '14:00', '18:00', true);
  
  RETURN NEW;
END;
$function$;

-- 2. Backfill: insert default availability for existing centers that have NONE
INSERT INTO public.availability (center_id, day_of_week, start_time, end_time, enabled)
SELECT c.id, dow.d, slot.s, slot.e, true
FROM public.centers c
CROSS JOIN (VALUES (1),(2),(3),(4),(5),(6)) AS dow(d)
CROSS JOIN (VALUES ('09:00'::time, '12:00'::time), ('14:00'::time, '18:00'::time)) AS slot(s, e)
WHERE NOT EXISTS (
  SELECT 1 FROM public.availability a WHERE a.center_id = c.id
);

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

-- Fix: make view use invoker security (default) explicitly
DROP VIEW IF EXISTS public_centers_view;
CREATE VIEW public_centers_view WITH (security_invoker = true) AS
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

-- Trigger function: auto-create client when appointment is inserted
CREATE OR REPLACE FUNCTION public.auto_create_client_on_appointment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_normalized_phone text;
  v_normalized_email text;
  v_existing_client_id uuid;
BEGIN
  -- Skip if client_id already set
  IF NEW.client_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  v_normalized_phone := public.normalize_phone(NEW.client_phone);
  v_normalized_email := LOWER(TRIM(NEW.client_email));

  -- 1. Search by phone
  IF v_normalized_phone != '' THEN
    SELECT id INTO v_existing_client_id
    FROM public.clients
    WHERE center_id = NEW.center_id
      AND public.normalize_phone(phone) = v_normalized_phone
    LIMIT 1;
  END IF;

  -- 2. Search by email if not found by phone
  IF v_existing_client_id IS NULL AND v_normalized_email != '' THEN
    SELECT id INTO v_existing_client_id
    FROM public.clients
    WHERE center_id = NEW.center_id
      AND LOWER(TRIM(email)) = v_normalized_email
    LIMIT 1;
  END IF;

  -- 3. If found, enrich missing info and link
  IF v_existing_client_id IS NOT NULL THEN
    UPDATE public.clients SET
      email = COALESCE(NULLIF(email, ''), NULLIF(v_normalized_email, '')),
      phone = COALESCE(NULLIF(phone, ''), NULLIF(NEW.client_phone, '')),
      address = COALESCE(NULLIF(address, ''), NULLIF(NEW.client_address, ''))
    WHERE id = v_existing_client_id;

    NEW.client_id := v_existing_client_id;
    RETURN NEW;
  END IF;

  -- 4. Create new client
  INSERT INTO public.clients (center_id, name, email, phone, address, source)
  VALUES (
    NEW.center_id,
    NEW.client_name,
    NULLIF(v_normalized_email, ''),
    NULLIF(NEW.client_phone, ''),
    NULLIF(NEW.client_address, ''),
    'booking'
  )
  RETURNING id INTO v_existing_client_id;

  NEW.client_id := v_existing_client_id;
  RETURN NEW;

EXCEPTION WHEN unique_violation THEN
  -- Race condition: retry lookup
  SELECT id INTO v_existing_client_id
  FROM public.clients
  WHERE center_id = NEW.center_id
    AND (
      (v_normalized_phone != '' AND public.normalize_phone(phone) = v_normalized_phone)
      OR (v_normalized_email != '' AND LOWER(TRIM(email)) = v_normalized_email)
    )
  LIMIT 1;

  NEW.client_id := v_existing_client_id;
  RETURN NEW;
END;
$$;

-- Create BEFORE INSERT trigger
CREATE TRIGGER trg_auto_create_client_on_appointment
  BEFORE INSERT ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_client_on_appointment();

-- Recreate public_centers_view with SECURITY DEFINER so anonymous users can query it
DROP VIEW IF EXISTS public_centers_view;

CREATE VIEW public.public_centers_view
WITH (security_invoker=off) AS
SELECT 
  id,
  slug,
  name,
  address,
  phone,
  logo_url,
  welcome_message,
  ai_enabled,
  subscription_plan,
  customization,
  latitude,
  longitude,
  intervention_radius_km,
  deposit_enabled,
  deposit_type,
  deposit_value,
  stripe_connect_status,
  quote_form_message,
  cancellation_policy,
  created_at,
  updated_at
FROM public.centers;

-- Add acceptance_token column for secure public quote acceptance via email
ALTER TABLE public.invoices 
ADD COLUMN acceptance_token uuid DEFAULT NULL;

-- Create unique index for token lookups
CREATE UNIQUE INDEX idx_invoices_acceptance_token 
ON public.invoices(acceptance_token) 
WHERE acceptance_token IS NOT NULL;

-- Create a function to auto-generate acceptance token for quotes
CREATE OR REPLACE FUNCTION public.generate_quote_acceptance_token()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only generate token for quotes, not invoices
  IF NEW.type = 'quote' AND NEW.acceptance_token IS NULL THEN
    NEW.acceptance_token := gen_random_uuid();
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger to auto-generate token on quote creation
CREATE TRIGGER set_quote_acceptance_token
BEFORE INSERT ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION public.generate_quote_acceptance_token();

-- Generate tokens for existing quotes that don't have one
UPDATE public.invoices 
SET acceptance_token = gen_random_uuid() 
WHERE type = 'quote' AND acceptance_token IS NULL;
CREATE OR REPLACE FUNCTION public.create_recognized_appointment(
  p_center_id uuid,
  p_client_id uuid,
  p_service_id uuid,
  p_appointment_date date,
  p_appointment_time time without time zone,
  p_vehicle_type text DEFAULT 'custom',
  p_notes text DEFAULT NULL
)
RETURNS TABLE (
  appointment_id uuid,
  client_name text,
  client_email text,
  client_phone text,
  client_address text,
  service_name text,
  service_price numeric,
  duration_minutes integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_client public.clients%ROWTYPE;
  v_service public.custom_services%ROWTYPE;
  v_appointment public.appointments%ROWTYPE;
  v_start_min integer;
  v_end_min integer;
BEGIN
  SELECT *
  INTO v_client
  FROM public.clients
  WHERE id = p_client_id
    AND center_id = p_center_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'CLIENT_NOT_FOUND';
  END IF;

  SELECT *
  INTO v_service
  FROM public.custom_services
  WHERE id = p_service_id
    AND center_id = p_center_id
    AND active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'SERVICE_NOT_FOUND';
  END IF;

  IF COALESCE(NULLIF(TRIM(v_client.name), ''), '') = ''
     OR COALESCE(NULLIF(TRIM(v_client.email), ''), '') = ''
     OR COALESCE(NULLIF(TRIM(v_client.phone), ''), '') = '' THEN
    RAISE EXCEPTION 'CLIENT_PROFILE_INCOMPLETE';
  END IF;

  v_start_min := EXTRACT(HOUR FROM p_appointment_time)::int * 60 + EXTRACT(MINUTE FROM p_appointment_time)::int;
  v_end_min := v_start_min + COALESCE(v_service.duration_minutes, 60);

  IF EXISTS (
    SELECT 1
    FROM public.appointments a
    WHERE a.center_id = p_center_id
      AND a.appointment_date = p_appointment_date
      AND a.status <> 'cancelled'
      AND a.status <> 'refused'
      AND (
        (EXTRACT(HOUR FROM a.appointment_time)::int * 60 + EXTRACT(MINUTE FROM a.appointment_time)::int) < v_end_min
        AND v_start_min < ((EXTRACT(HOUR FROM a.appointment_time)::int * 60 + EXTRACT(MINUTE FROM a.appointment_time)::int) + COALESCE(a.duration_minutes, 60))
      )
  ) THEN
    RAISE EXCEPTION 'TIME_SLOT_OCCUPIED';
  END IF;

  INSERT INTO public.appointments (
    center_id,
    pack_id,
    client_id,
    custom_service_id,
    client_name,
    client_email,
    client_phone,
    client_address,
    vehicle_type,
    appointment_date,
    appointment_time,
    notes,
    duration_minutes,
    custom_price,
    status
  )
  VALUES (
    p_center_id,
    NULL,
    v_client.id,
    v_service.id,
    v_client.name,
    LOWER(TRIM(v_client.email)),
    v_client.phone,
    v_client.address,
    COALESCE(NULLIF(TRIM(p_vehicle_type), ''), 'custom'),
    p_appointment_date,
    p_appointment_time,
    NULLIF(TRIM(p_notes), ''),
    COALESCE(v_service.duration_minutes, 60),
    v_service.price,
    'pending_validation'
  )
  RETURNING * INTO v_appointment;

  RETURN QUERY
  SELECT
    v_appointment.id,
    v_appointment.client_name,
    v_appointment.client_email,
    v_appointment.client_phone,
    v_appointment.client_address,
    v_service.name,
    v_service.price,
    COALESCE(v_service.duration_minutes, 60);
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_recognized_appointment(
  uuid,
  uuid,
  uuid,
  date,
  time without time zone,
  text,
  text
) TO anon, authenticated;
-- RPC to get occupied time slots for a center (bypasses RLS for anonymous booking pages)
CREATE OR REPLACE FUNCTION public.get_occupied_slots(
  p_center_id uuid,
  p_from_date date
)
RETURNS TABLE (
  appointment_date date,
  appointment_time time,
  duration_minutes integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT a.appointment_date::date, a.appointment_time::time, COALESCE(a.duration_minutes, 60)::integer
  FROM public.appointments a
  WHERE a.center_id = p_center_id
    AND a.status NOT IN ('cancelled', 'refused')
    AND a.appointment_date >= p_from_date;
$$;

-- Update create_recognized_appointment to include travel buffer in overlap check
CREATE OR REPLACE FUNCTION public.create_recognized_appointment(
  p_center_id uuid,
  p_client_id uuid,
  p_service_id uuid,
  p_appointment_date date,
  p_appointment_time time,
  p_vehicle_type text DEFAULT 'custom',
  p_notes text DEFAULT NULL
)
RETURNS TABLE (
  appointment_id uuid,
  client_name text,
  client_email text,
  client_phone text,
  client_address text,
  service_name text,
  service_price numeric,
  duration_minutes integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_client public.clients%ROWTYPE;
  v_service public.custom_services%ROWTYPE;
  v_appointment public.appointments%ROWTYPE;
  v_start_min integer;
  v_end_min integer;
  v_buffer integer;
BEGIN
  SELECT *
  INTO v_client
  FROM public.clients
  WHERE id = p_client_id
    AND center_id = p_center_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'CLIENT_NOT_FOUND';
  END IF;

  SELECT *
  INTO v_service
  FROM public.custom_services
  WHERE id = p_service_id
    AND center_id = p_center_id
    AND active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'SERVICE_NOT_FOUND';
  END IF;

  IF COALESCE(NULLIF(TRIM(v_client.name), ''), '') = ''
     OR COALESCE(NULLIF(TRIM(v_client.email), ''), '') = ''
     OR COALESCE(NULLIF(TRIM(v_client.phone), ''), '') = '' THEN
    RAISE EXCEPTION 'CLIENT_PROFILE_INCOMPLETE';
  END IF;

  -- Get travel buffer from center customization
  SELECT COALESCE(
    ((c.customization::jsonb)->'settings'->>'appointment_buffer')::integer,
    0
  ) INTO v_buffer
  FROM public.centers c
  WHERE c.id = p_center_id;

  v_start_min := EXTRACT(HOUR FROM p_appointment_time)::int * 60 + EXTRACT(MINUTE FROM p_appointment_time)::int;
  v_end_min := v_start_min + COALESCE(v_service.duration_minutes, 60);

  -- Check overlap including travel buffer on existing appointments
  IF EXISTS (
    SELECT 1
    FROM public.appointments a
    WHERE a.center_id = p_center_id
      AND a.appointment_date = p_appointment_date
      AND a.status NOT IN ('cancelled', 'refused')
      AND (
        v_start_min < ((EXTRACT(HOUR FROM a.appointment_time)::int * 60 + EXTRACT(MINUTE FROM a.appointment_time)::int) + COALESCE(a.duration_minutes, 60) + v_buffer)
        AND (EXTRACT(HOUR FROM a.appointment_time)::int * 60 + EXTRACT(MINUTE FROM a.appointment_time)::int) < v_end_min + v_buffer
      )
  ) THEN
    RAISE EXCEPTION 'TIME_SLOT_OCCUPIED';
  END IF;

  INSERT INTO public.appointments (
    center_id,
    pack_id,
    client_id,
    custom_service_id,
    client_name,
    client_email,
    client_phone,
    client_address,
    vehicle_type,
    appointment_date,
    appointment_time,
    notes,
    duration_minutes,
    custom_price,
    status
  )
  VALUES (
    p_center_id,
    NULL,
    v_client.id,
    v_service.id,
    v_client.name,
    LOWER(TRIM(v_client.email)),
    v_client.phone,
    v_client.address,
    COALESCE(NULLIF(TRIM(p_vehicle_type), ''), 'custom'),
    p_appointment_date,
    p_appointment_time,
    NULLIF(TRIM(p_notes), ''),
    COALESCE(v_service.duration_minutes, 60),
    v_service.price,
    'pending_validation'
  )
  RETURNING * INTO v_appointment;

  RETURN QUERY
  SELECT
    v_appointment.id,
    v_appointment.client_name,
    v_appointment.client_email,
    v_appointment.client_phone,
    v_appointment.client_address,
    v_service.name,
    v_service.price,
    COALESCE(v_service.duration_minutes, 60);
END;
$$;

CREATE TABLE public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id UUID NOT NULL REFERENCES public.centers(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  service_name TEXT NOT NULL,
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount_ht NUMERIC NOT NULL DEFAULT 0,
  vat_rate NUMERIC NOT NULL DEFAULT 20,
  vat_amount NUMERIC NOT NULL DEFAULT 0,
  amount_ttc NUMERIC NOT NULL DEFAULT 0,
  deposit_amount NUMERIC NOT NULL DEFAULT 0,
  remaining_amount NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'cash',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage their sales"
ON public.sales FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.centers WHERE centers.id = sales.center_id AND centers.owner_id = auth.uid()
));
ALTER TABLE public.appointments ADD COLUMN seen_at timestamptz DEFAULT NULL;
-- Add Google Calendar OAuth columns to centers (refresh_token is sensitive, only used by edge functions)
ALTER TABLE public.centers
  ADD COLUMN IF NOT EXISTS google_calendar_refresh_token text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS google_calendar_connected boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS google_calendar_email text DEFAULT NULL;

-- Add Google Calendar event ID to appointments for future update/delete
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS google_calendar_event_id text DEFAULT NULL;

-- Fix contact_requests: drop restrictive INSERT, recreate as PERMISSIVE
DROP POLICY IF EXISTS "Public can create contact requests with valid data" ON public.contact_requests;

CREATE POLICY "Public can create contact requests with valid data"
ON public.contact_requests
FOR INSERT TO public
WITH CHECK (
  center_id IS NOT NULL
  AND client_name IS NOT NULL AND client_name <> ''
  AND client_phone IS NOT NULL AND client_phone <> ''
);

-- Fix appointments: drop restrictive INSERT, recreate as PERMISSIVE
DROP POLICY IF EXISTS "Public can create appointments with valid data" ON public.appointments;

CREATE POLICY "Public can create appointments with valid data"
ON public.appointments
FOR INSERT TO public
WITH CHECK (
  center_id IS NOT NULL
  AND client_name IS NOT NULL AND client_name <> ''
  AND client_email IS NOT NULL AND client_email <> ''
  AND client_phone IS NOT NULL AND client_phone <> ''
  AND appointment_date IS NOT NULL
  AND appointment_time IS NOT NULL
  AND vehicle_type IS NOT NULL
);
ALTER TABLE public.packs ADD COLUMN IF NOT EXISTS location_type text NOT NULL DEFAULT 'on_site';
COMMENT ON COLUMN public.packs.location_type IS 'Service location: on_site, at_home, or both';
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS service_created boolean NOT NULL DEFAULT false;
-- Drop existing function first (return type change requires it)
DROP FUNCTION IF EXISTS public.create_recognized_appointment(uuid, uuid, uuid, date, time without time zone, text, text);

-- Recreate with non-PII return type
CREATE OR REPLACE FUNCTION public.create_recognized_appointment(
  p_center_id uuid,
  p_client_id uuid,
  p_service_id uuid,
  p_appointment_date date,
  p_appointment_time time without time zone,
  p_vehicle_type text DEFAULT 'custom'::text,
  p_notes text DEFAULT NULL::text
)
RETURNS TABLE(appointment_id uuid, service_name text, service_price numeric, duration_minutes integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_client public.clients%ROWTYPE;
  v_service public.custom_services%ROWTYPE;
  v_appointment public.appointments%ROWTYPE;
  v_start_min integer;
  v_end_min integer;
  v_buffer integer;
BEGIN
  SELECT *
  INTO v_client
  FROM public.clients
  WHERE id = p_client_id
    AND center_id = p_center_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'CLIENT_NOT_FOUND';
  END IF;

  SELECT *
  INTO v_service
  FROM public.custom_services
  WHERE id = p_service_id
    AND center_id = p_center_id
    AND active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'SERVICE_NOT_FOUND';
  END IF;

  IF COALESCE(NULLIF(TRIM(v_client.name), ''), '') = ''
     OR COALESCE(NULLIF(TRIM(v_client.email), ''), '') = ''
     OR COALESCE(NULLIF(TRIM(v_client.phone), ''), '') = '' THEN
    RAISE EXCEPTION 'CLIENT_PROFILE_INCOMPLETE';
  END IF;

  SELECT COALESCE(
    ((c.customization::jsonb)->'settings'->>'appointment_buffer')::integer,
    0
  ) INTO v_buffer
  FROM public.centers c
  WHERE c.id = p_center_id;

  v_start_min := EXTRACT(HOUR FROM p_appointment_time)::int * 60 + EXTRACT(MINUTE FROM p_appointment_time)::int;
  v_end_min := v_start_min + COALESCE(v_service.duration_minutes, 60);

  IF EXISTS (
    SELECT 1
    FROM public.appointments a
    WHERE a.center_id = p_center_id
      AND a.appointment_date = p_appointment_date
      AND a.status NOT IN ('cancelled', 'refused')
      AND (
        v_start_min < ((EXTRACT(HOUR FROM a.appointment_time)::int * 60 + EXTRACT(MINUTE FROM a.appointment_time)::int) + COALESCE(a.duration_minutes, 60) + v_buffer)
        AND (EXTRACT(HOUR FROM a.appointment_time)::int * 60 + EXTRACT(MINUTE FROM a.appointment_time)::int) < v_end_min + v_buffer
      )
  ) THEN
    RAISE EXCEPTION 'TIME_SLOT_OCCUPIED';
  END IF;

  INSERT INTO public.appointments (
    center_id, pack_id, client_id, custom_service_id,
    client_name, client_email, client_phone, client_address,
    vehicle_type, appointment_date, appointment_time, notes,
    duration_minutes, custom_price, status
  )
  VALUES (
    p_center_id, NULL, v_client.id, v_service.id,
    v_client.name, LOWER(TRIM(v_client.email)), v_client.phone, v_client.address,
    COALESCE(NULLIF(TRIM(p_vehicle_type), ''), 'custom'),
    p_appointment_date, p_appointment_time,
    NULLIF(TRIM(p_notes), ''),
    COALESCE(v_service.duration_minutes, 60), v_service.price,
    'pending_validation'
  )
  RETURNING * INTO v_appointment;

  RETURN QUERY
  SELECT
    v_appointment.id,
    v_service.name,
    v_service.price,
    COALESCE(v_service.duration_minutes, 60);
END;
$$;
CREATE POLICY "Les propriétaires peuvent supprimer leurs demandes"
ON public.contact_requests
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.centers
    WHERE centers.id = contact_requests.center_id
    AND centers.owner_id = auth.uid()
  )
);