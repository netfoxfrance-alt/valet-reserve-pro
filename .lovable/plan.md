

# Système d'acompte : Analyse honnête et Plan

## Ton constat est juste

Tu as raison : l'approche "lien de paiement collé manuellement" pose des problèmes réels :
- Chaque pro peut avoir 5-10 offres différentes → il faudrait un lien par offre, c'est ingérable
- Le client doit quitter le flow de réservation → perte de conversion
- Pas de suivi automatique → le pro ne sait pas qui a payé
- Image pas professionnelle pour une plateforme SaaS

## Stripe Connect Express : ce que ça implique vraiment

Soyons transparents sur la complexité :

### Ce qu'il faut construire
1. **Onboarding Stripe Connect** : une Edge Function qui crée un compte Express pour chaque pro et renvoie un lien d'onboarding Stripe (le pro remplit ses infos bancaires sur Stripe, pas chez nous)
2. **Stockage du `stripe_account_id`** : une colonne dans la table `centers`
3. **Création de Checkout Session avec `transfer_data`** : quand un client réserve, on crée un paiement qui va directement sur le compte du pro
4. **Webhook Stripe** : pour savoir quand le paiement est confirmé et mettre à jour le statut du RDV
5. **Gestion des statuts** : onboarding en cours / actif / paiement reçu

### Risques concrets
- **KYC Stripe** : le pro doit compléter la vérification d'identité. Si Stripe refuse, ça bloque. On n'a aucun contrôle là-dessus
- **Webhook** : si le webhook échoue, le statut "payé" ne se met pas à jour → le pro pense que le client n'a pas payé
- **Multi-devises, remboursements** : cas edge à gérer
- **Maintenance** : Stripe change ses APIs, il faut suivre

## Ma recommandation : Stripe Connect Express, mais en version minimale

Malgré la complexité, c'est la bonne approche pour un produit sérieux. Voici comment on minimise les risques :

### Architecture simplifiée

```text
PRO (Dashboard Settings)          CLIENT (Page de réservation)
┌─────────────────────┐           ┌──────────────────────┐
│ "Activer les         │           │ Réservation normale   │
│  acomptes"           │           │ + montant acompte     │
│                      │           │ affiché               │
│ → Onboarding Stripe  │           │                       │
│   (formulaire Stripe)│           │ Après soumission :    │
│                      │           │ → Redirect Stripe     │
│ Réglages :           │           │   Checkout            │
│ - % ou montant fixe  │           │ → Paiement            │
│ - Activer/désactiver │           │ → Retour confirmation │
└─────────────────────┘           └──────────────────────┘

                    STRIPE
                    ┌──────────────────┐
                    │ Checkout Session  │
                    │ mode: "payment"   │
                    │ transfer_data →   │
                    │   compte du pro   │
                    └──────────────────┘
```

### Plan d'implémentation en 6 étapes

#### Etape 1 : Migration base de données
Ajouter à la table `centers` :
- `stripe_connect_account_id` (text, nullable) — l'ID du compte Express du pro
- `stripe_connect_status` (text, default 'none') — 'none' | 'pending' | 'active'
- `deposit_enabled` (boolean, default false) — le pro active/désactive les acomptes
- `deposit_type` (text, default 'percentage') — 'percentage' ou 'fixed'
- `deposit_value` (numeric, default 30) — ex: 30 = 30% ou 30€

Ajouter à la table `appointments` :
- `deposit_amount` (numeric, nullable) — montant de l'acompte dû
- `deposit_status` (text, default 'none') — 'none' | 'pending' | 'paid'
- `deposit_checkout_session_id` (text, nullable) — pour vérifier le paiement

#### Etape 2 : Edge Function `create-connect-account`
- Crée un compte Stripe Express pour le pro
- Retourne le lien d'onboarding Stripe (le pro remplit ses infos bancaires directement sur Stripe)
- Stocke le `stripe_connect_account_id` dans `centers`

#### Etape 3 : Edge Function `create-deposit-checkout`
- Appelée après la réservation du client
- Crée un Stripe Checkout `mode: "payment"` avec `transfer_data` vers le compte du pro
- Le montant est calculé selon les réglages du pro (% ou fixe)
- Retourne l'URL de paiement

#### Etape 4 : Edge Function `stripe-connect-webhook`
- Écoute `checkout.session.completed`
- Met à jour `deposit_status` = 'paid' sur le bon RDV
- Écoute `account.updated` pour mettre à jour `stripe_connect_status`

#### Etape 5 : UI Dashboard (Réglages)
- Nouvelle section "Acomptes" dans les réglages du pro
- Bouton "Connecter mon compte bancaire" → redirige vers Stripe onboarding
- Statut de connexion affiché (en attente / actif)
- Toggle activer/désactiver les acomptes
- Choix pourcentage ou montant fixe + valeur

#### Etape 6 : UI Réservation (côté client)
- Après confirmation de réservation, si le pro a activé les acomptes :
  - Afficher le montant de l'acompte
  - Bouton "Payer l'acompte" → redirect Stripe Checkout
  - Page de retour avec confirmation de paiement
- Dans le dashboard du pro : badge "Acompte payé" / "En attente" sur chaque RDV

### Points de vigilance
- Le webhook nécessite un endpoint public avec vérification de signature Stripe
- Il faudra configurer l'URL du webhook dans le dashboard Stripe du compte plateforme
- Les pros en mode "free" n'auront pas accès à cette fonctionnalité (Pro only)

### Détails techniques
- Stripe Connect Express gère toute la conformité KYC — on ne touche à rien
- Le webhook utilisera `stripe.webhooks.constructEvent()` pour valider la signature
- Les paiements utilisent `application_fee_amount` si tu veux prendre une commission (optionnel, à décider plus tard)
- L'acompte est un paiement unique (pas un abonnement), donc `mode: "payment"`

