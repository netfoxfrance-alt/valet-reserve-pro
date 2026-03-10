

# Plan : Système de Ventes (Tickets)

## Résumé

Remplacer le système de facturation par un objet **Vente** (ticket de caisse). Quand le pro clique "Terminer" sur un RDV confirmé, un dialog s'ouvre pour saisir le paiement et créer une vente. Une nouvelle page "Ventes" avec export CSV remplace les factures.

## Etapes d'implémentation

### 1. Migration SQL : Table `sales`

Créer la table `sales` avec RLS (propriétaire uniquement) :

```sql
CREATE TABLE public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id UUID NOT NULL,
  appointment_id UUID REFERENCES public.appointments(id),
  client_id UUID,
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
ON public.sales FOR ALL TO public
USING (EXISTS (
  SELECT 1 FROM centers WHERE centers.id = sales.center_id AND centers.owner_id = auth.uid()
));
```

### 2. Hook `useSales.tsx`

CRUD pour les ventes + fonction d'export CSV. Fetch les ventes par `center_id`, filtrage par période (jour/semaine/mois), calcul des KPIs (CA, nombre, panier moyen).

### 3. Dialog `CompleteSaleDialog.tsx`

Quand le pro clique "Terminer" sur un RDV confirmé, au lieu de passer directement en `completed`, un dialog s'ouvre avec :
- Montant TTC pré-rempli (depuis `custom_price` ou prix du pack/service)
- Taux TVA pré-rempli (20%)
- Acompte déjà versé (depuis `deposit_amount`)
- Reste à payer (calculé automatiquement)
- Mode de paiement du reste (Cash / CB / Virement / Stripe)
- Notes optionnelles

Validation → insère la vente dans `sales` + passe le RDV en `completed`.

### 4. Modification de `Dashboard.tsx`

Le bouton "Terminer" (ligne 180) ouvre le `CompleteSaleDialog` au lieu de directement appeler `onUpdateStatus('completed')`. Même chose dans `AppointmentDetailDialog`.

### 5. Nouvelle page `DashboardSales.tsx`

- KPIs en haut : CA du jour, nombre de ventes, panier moyen
- Liste des ventes avec filtres (jour/semaine/mois)
- Bouton **Exporter CSV** (Date, Client, Service, HT, TVA, TTC, Acompte, Reste, Paiement)

### 6. Mise à jour de la sidebar

- "Factures & Devis" → **"Devis"** (garde l'URL `/dashboard/invoices` pour ne rien casser)
- Ajout **"Ventes"** → `/dashboard/sales` dans la section "Clients"
- Mise à jour des traductions FR/EN

### 7. Route dans `App.tsx`

Ajouter `/dashboard/sales` → `DashboardSales` (protégé).

### 8. Page Factures & Devis

Retirer la possibilité de créer des factures. Garder uniquement les devis. Renommer le titre en "Devis". Les données historiques restent intactes.

### 9. Traductions i18n

Ajouter les clés `sales.*` et `nav.sales` dans `fr.json` et `en.json`.

## Fichiers impactés

| Fichier | Action |
|---|---|
| Migration SQL | Nouvelle table `sales` + RLS |
| `src/hooks/useSales.tsx` | Nouveau |
| `src/components/dashboard/CompleteSaleDialog.tsx` | Nouveau |
| `src/pages/DashboardSales.tsx` | Nouveau |
| `src/pages/Dashboard.tsx` | Modifier "Terminer" → ouvre dialog |
| `src/components/dashboard/AppointmentDetailDialog.tsx` | Idem |
| `src/pages/DashboardInvoices.tsx` | Retirer factures, garder devis |
| `src/components/dashboard/DashboardSidebar.tsx` | Ajouter "Ventes", renommer |
| `src/components/dashboard/MobileSidebar.tsx` | Idem |
| `src/App.tsx` | Ajouter route |
| `src/i18n/locales/fr.json` | Traductions |
| `src/i18n/locales/en.json` | Traductions |

