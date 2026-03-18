
-- 1. Service categories table
CREATE TABLE public.service_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id uuid NOT NULL REFERENCES public.centers(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  image_url text,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage their categories"
  ON public.service_categories FOR ALL
  USING (EXISTS (SELECT 1 FROM centers WHERE centers.id = service_categories.center_id AND centers.owner_id = auth.uid()));

CREATE POLICY "Public can view active categories"
  ON public.service_categories FOR SELECT
  USING (active = true);

-- 2. Add category_id to packs
ALTER TABLE public.packs ADD COLUMN category_id uuid REFERENCES public.service_categories(id) ON DELETE SET NULL;

-- 3. Service options (add-ons) table
CREATE TABLE public.service_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id uuid NOT NULL REFERENCES public.centers(id) ON DELETE CASCADE,
  name text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  duration_minutes integer NOT NULL DEFAULT 0,
  description text,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.service_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage their options"
  ON public.service_options FOR ALL
  USING (EXISTS (SELECT 1 FROM centers WHERE centers.id = service_options.center_id AND centers.owner_id = auth.uid()));

CREATE POLICY "Public can view active options"
  ON public.service_options FOR SELECT
  USING (active = true);

-- 4. Pack-option links (junction table)
CREATE TABLE public.pack_option_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_id uuid NOT NULL REFERENCES public.packs(id) ON DELETE CASCADE,
  option_id uuid NOT NULL REFERENCES public.service_options(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(pack_id, option_id)
);

ALTER TABLE public.pack_option_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage pack-option links"
  ON public.pack_option_links FOR ALL
  USING (EXISTS (
    SELECT 1 FROM packs 
    JOIN centers ON centers.id = packs.center_id 
    WHERE packs.id = pack_option_links.pack_id AND centers.owner_id = auth.uid()
  ));

CREATE POLICY "Public can view pack-option links"
  ON public.pack_option_links FOR SELECT
  USING (true);

-- 5. Add selected_options to appointments
ALTER TABLE public.appointments ADD COLUMN selected_options jsonb DEFAULT '[]'::jsonb;
