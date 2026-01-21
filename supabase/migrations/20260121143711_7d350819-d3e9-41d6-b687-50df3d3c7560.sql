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
SELECT id, 0, 'Exonéré', false FROM public.centers;