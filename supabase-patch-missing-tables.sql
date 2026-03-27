-- ============================================================
-- PATCH: Tables manquantes non présentes dans les migrations
-- A exécuter APRÈS supabase-migration-cleaningpage.sql
-- ============================================================

-- 1. service_categories (doit être avant service_variants et packs category_id)
CREATE TABLE IF NOT EXISTS public.service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id UUID REFERENCES public.centers(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  funnel_type TEXT NOT NULL DEFAULT 'booking',
  location_type TEXT NOT NULL DEFAULT 'on_site',
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Propriétaires gèrent leurs catégories"
  ON public.service_categories FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.centers WHERE centers.id = service_categories.center_id AND centers.owner_id = auth.uid())
  );

CREATE POLICY "Tout le monde peut voir les catégories actives"
  ON public.service_categories FOR SELECT
  USING (true);

-- 2. service_options
CREATE TABLE IF NOT EXISTS public.service_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id UUID REFERENCES public.centers(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.service_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Propriétaires gèrent leurs options"
  ON public.service_options FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.centers WHERE centers.id = service_options.center_id AND centers.owner_id = auth.uid())
  );

CREATE POLICY "Tout le monde peut voir les options actives"
  ON public.service_options FOR SELECT
  USING (true);

-- 3. service_variants (FK service_categories)
CREATE TABLE IF NOT EXISTS public.service_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.service_categories(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.service_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Propriétaires gèrent leurs variantes"
  ON public.service_variants FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.service_categories sc
      JOIN public.centers c ON c.id = sc.center_id
      WHERE sc.id = service_variants.category_id AND c.owner_id = auth.uid()
    )
  );

CREATE POLICY "Tout le monde peut voir les variantes actives"
  ON public.service_variants FOR SELECT
  USING (true);

-- 4. pack_option_links (FK packs + service_options)
CREATE TABLE IF NOT EXISTS public.pack_option_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_id UUID REFERENCES public.packs(id) ON DELETE CASCADE NOT NULL,
  option_id UUID REFERENCES public.service_options(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pack_option_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Propriétaires gèrent leurs liens pack-option"
  ON public.pack_option_links FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.packs p
      JOIN public.centers c ON c.id = p.center_id
      WHERE p.id = pack_option_links.pack_id AND c.owner_id = auth.uid()
    )
  );

CREATE POLICY "Tout le monde peut voir les liens pack-option"
  ON public.pack_option_links FOR SELECT
  USING (true);

-- 5. pack_variant_prices (FK packs + service_variants)
CREATE TABLE IF NOT EXISTS public.pack_variant_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_id UUID REFERENCES public.packs(id) ON DELETE CASCADE NOT NULL,
  variant_id UUID REFERENCES public.service_variants(id) ON DELETE CASCADE NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pack_variant_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Propriétaires gèrent leurs prix par variante"
  ON public.pack_variant_prices FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.packs p
      JOIN public.centers c ON c.id = p.center_id
      WHERE p.id = pack_variant_prices.pack_id AND c.owner_id = auth.uid()
    )
  );

CREATE POLICY "Tout le monde peut voir les prix variantes"
  ON public.pack_variant_prices FOR SELECT
  USING (true);

-- 6. custom_requests
CREATE TABLE IF NOT EXISTS public.custom_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id UUID REFERENCES public.centers(id) ON DELETE SET NULL,
  center_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  message TEXT NOT NULL,
  request_type TEXT NOT NULL DEFAULT 'contact',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.custom_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tout le monde peut créer des demandes"
  ON public.custom_requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Propriétaires voient leurs demandes personnalisées"
  ON public.custom_requests FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.centers WHERE centers.id = custom_requests.center_id AND centers.owner_id = auth.uid())
  );

-- 7. Ajouter category_id à packs si manquant
ALTER TABLE public.packs
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.service_categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS location_type TEXT NOT NULL DEFAULT 'on_site';

-- 8. Policy custom_requests qui avait échoué dans la migration principale
DROP POLICY IF EXISTS "Centers can insert their own requests" ON public.custom_requests;
CREATE POLICY "Centers can insert their own requests"
ON public.custom_requests
FOR INSERT
WITH CHECK (
  center_id IS NOT NULL AND
  EXISTS (
    SELECT centers.owner_id FROM centers WHERE centers.id = custom_requests.center_id
  )
);

-- 9. Indexes pour performance
CREATE INDEX IF NOT EXISTS idx_service_categories_center_id ON public.service_categories(center_id);
CREATE INDEX IF NOT EXISTS idx_service_options_center_id ON public.service_options(center_id);
CREATE INDEX IF NOT EXISTS idx_service_variants_category_id ON public.service_variants(category_id);
CREATE INDEX IF NOT EXISTS idx_pack_option_links_pack_id ON public.pack_option_links(pack_id);
CREATE INDEX IF NOT EXISTS idx_pack_variant_prices_pack_id ON public.pack_variant_prices(pack_id);
CREATE INDEX IF NOT EXISTS idx_custom_requests_center_id ON public.custom_requests(center_id);
