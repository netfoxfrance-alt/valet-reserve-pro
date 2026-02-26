

## Plan : Système d'acompte Stripe Connect — COMPLÉTÉ

### Fonctionnalités implémentées

1. **Remboursement automatique** — Quand le pro annule un RDV avec acompte payé, le remboursement Stripe est déclenché automatiquement via l'edge function `refund-deposit`.

2. **Bouton de remboursement manuel** — Dans la fiche détail du RDV, le pro peut cliquer "Rembourser l'acompte" pour rembourser manuellement (même si le client a annulé).

3. **Politique d'annulation configurable** — Le pro choisit entre :
   - "L'acompte n'est pas remboursé si le client annule"
   - "L'acompte n'est pas remboursé si le client annule moins de 48h avant"

4. **Conditions affichées au client** — Lors du paiement de l'acompte, le client voit clairement :
   - ✅ Remboursement automatique si le pro annule
   - ❌ La politique d'annulation choisie par le pro

### Architecture technique

```
PRO annule → updateStatus('cancelled') → auto-refund via refund-deposit edge function
CLIENT annule → pas de remboursement auto (le pro peut rembourser manuellement)
PRO veut rembourser quand même → bouton "Rembourser l'acompte" dans la fiche RDV
```

### Fichiers modifiés/créés

- `supabase/functions/refund-deposit/index.ts` — Edge function de remboursement
- `supabase/functions/stripe-connect-webhook/index.ts` — Stocke le payment_intent_id
- `src/hooks/useAppointments.tsx` — Auto-refund on cancel + interface mise à jour
- `src/hooks/useCenter.tsx` — Ajout cancellation_policy à l'interface Center
- `src/components/settings/DepositSettingsSection.tsx` — Sélecteur de politique d'annulation
- `src/components/booking/ConfirmationView.tsx` — Affichage conditions de remboursement
- `src/components/dashboard/AppointmentDetailDialog.tsx` — Bouton remboursement manuel + statut
- `src/pages/CenterBooking.tsx` — Passage de cancellationPolicy
- DB: `cancellation_policy` sur centers, `deposit_refund_status` + `deposit_payment_intent_id` sur appointments
