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
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();