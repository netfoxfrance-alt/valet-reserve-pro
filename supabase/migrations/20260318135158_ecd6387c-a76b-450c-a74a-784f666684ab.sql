
-- 1. Add location_type and funnel_type to service_categories
ALTER TABLE service_categories ADD COLUMN IF NOT EXISTS location_type text NOT NULL DEFAULT 'both';
ALTER TABLE service_categories ADD COLUMN IF NOT EXISTS funnel_type text NOT NULL DEFAULT 'classic';

-- 2. Create service_variants table (shared variants at service/category level)
CREATE TABLE IF NOT EXISTS service_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES service_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE service_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage their variants"
ON service_variants FOR ALL
USING (EXISTS (
  SELECT 1 FROM service_categories sc
  JOIN centers c ON c.id = sc.center_id
  WHERE sc.id = service_variants.category_id AND c.owner_id = auth.uid()
));

CREATE POLICY "Public can view active variants"
ON service_variants FOR SELECT
USING (active = true);

-- 3. Create pack_variant_prices table (price per pack per variant)
CREATE TABLE IF NOT EXISTS pack_variant_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_id uuid NOT NULL REFERENCES packs(id) ON DELETE CASCADE,
  variant_id uuid NOT NULL REFERENCES service_variants(id) ON DELETE CASCADE,
  price numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(pack_id, variant_id)
);

ALTER TABLE pack_variant_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage variant prices"
ON pack_variant_prices FOR ALL
USING (EXISTS (
  SELECT 1 FROM packs p
  JOIN centers c ON c.id = p.center_id
  WHERE p.id = pack_variant_prices.pack_id AND c.owner_id = auth.uid()
));

CREATE POLICY "Public can view variant prices"
ON pack_variant_prices FOR SELECT
USING (true);
