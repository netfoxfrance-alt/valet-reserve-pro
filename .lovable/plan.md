

# Passer l'abonnement de 29€ à 39€/mois

## Changements nécessaires

Il y a déjà un prix Stripe à 39€/mois existant : `price_1T3dUMCc0FFxbAQWiWfjXveC`. Il suffit de remplacer le price ID et mettre à jour les affichages "29€" → "39€" dans 4 fichiers.

## Fichiers à modifier

1. **`supabase/functions/create-checkout/index.ts`** — Remplacer `price_1T1UwhCc0FFxbAQWkWtHDpHD` par `price_1T3dUMCc0FFxbAQWiWfjXveC`

2. **`supabase/functions/create-guest-checkout/index.ts`** — Même remplacement de price ID

3. **`src/pages/Index.tsx`** (ligne 1798) — Changer `29€` → `39€`

4. **`src/pages/Presentation.tsx`** (ligne 1133) — Changer `29€` → `39€`

5. **`supabase/functions/prerender/index.ts`** (ligne 94) — Changer `29€/mois` → `39€/mois`

## Ce qui ne change pas

- Essai gratuit 30 jours (identique)
- Logique de vérification d'abonnement (`check-subscription`)
- Flux d'inscription et création de compte
- Gestion du portail client Stripe
- Toutes les fonctionnalités Pro incluses

