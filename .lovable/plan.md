

## Plan : Finaliser le système d'acompte Stripe Connect

### Problèmes identifiés

1. **Interface `Center` incomplète** — Les champs `deposit_enabled`, `deposit_type`, `deposit_value`, `stripe_connect_status`, `stripe_connect_account_id` manquent dans l'interface TypeScript. Le code utilise des `(center as any)` partout, source potentielle de bugs silencieux.

2. **Pas d'email de confirmation automatique** — Quand le webhook reçoit le paiement et confirme le RDV, aucun email de confirmation n'est envoyé au client ni au pro. Le client paie mais ne reçoit rien.

3. **Pas de protection contre double paiement** — L'Edge Function `create-deposit-checkout` ne vérifie pas si l'acompte a déjà été payé. Un client pourrait relancer le paiement et payer deux fois.

4. **Rafraîchissement du statut Connect** — Quand le pro revient de Stripe onboarding (`?connect=success`), le statut n'est pas re-vérifié côté client. Il doit recharger la page manuellement.

5. **`DepositSettingsSection`** — Le composant utilise des casts `(center as any)` pour accéder aux champs deposit. À corriger avec l'interface mise à jour.

### Étapes d'implémentation

#### 1. Mettre à jour l'interface `Center` dans `useCenter.tsx`
Ajouter les champs : `deposit_enabled`, `deposit_type`, `deposit_value`, `stripe_connect_status`, `stripe_connect_account_id`. Supprimer tous les `(center as any)` dans `CenterBooking.tsx` et `DepositSettingsSection.tsx`.

#### 2. Protéger contre le double paiement dans `create-deposit-checkout`
Ajouter une vérification : si `deposit_status === 'paid'`, retourner une erreur "Acompte déjà payé".

#### 3. Envoyer un email de confirmation dans le webhook
Dans `stripe-connect-webhook`, après avoir mis à jour le statut du RDV à `confirmed`, appeler `send-booking-emails` avec `email_type: 'confirmation'` pour notifier le client et le pro.

#### 4. Rafraîchir le statut Connect au retour de Stripe
Dans `DashboardSettings.tsx`, détecter le paramètre URL `?connect=success` et déclencher un appel à `create-connect-account` (qui vérifie et met à jour le statut) puis rafraîchir les données du centre.

#### 5. Redéployer les Edge Functions modifiées
- `create-deposit-checkout` (protection double paiement)
- `stripe-connect-webhook` (email de confirmation)

### Détails techniques

```text
Flux complet après corrections :

PRO (Paramètres)
  1. Clique "Connecter Stripe" → ouvre onboarding Express
  2. Revient sur /dashboard/settings?connect=success → statut se rafraîchit automatiquement
  3. Active les acomptes + configure % ou montant fixe → sauvegarde

CLIENT (Page de réservation)
  1. Choisit pack → date → infos client → soumet
  2. RDV créé avec status=pending_validation, deposit_status=none
  3. Si deposit_enabled + stripe_connect_status=active :
     → Voit bouton "Payer l'acompte de X€"
     → Redirigé vers Stripe Checkout (sur le compte du pro)
  4. Après paiement :
     → Webhook reçoit checkout.session.completed
     → deposit_status → paid, status → confirmed
     → Email de confirmation envoyé au client + pro
  5. Si pas de deposit → flow normal (attente validation manuelle)

DASHBOARD (Calendrier/RDV)
  - Badge "Acompte payé · X€" ou "Acompte en attente" visible
  - Détail du RDV affiche les infos d'acompte
```

