

# Plan : Réservations pro-grade — "Nouveau", "À encaisser", filtres période

ChatGPT a raison : localStorage est fragile (multi-device, cache purgé, multi-utilisateur). La bonne solution est une colonne `seen_at` en base.

## 1. Migration DB : ajouter `seen_at` sur `appointments`

```sql
ALTER TABLE public.appointments ADD COLUMN seen_at timestamptz DEFAULT NULL;
```

- `NULL` = nouveau, non vu par le pro
- Quand le pro clique "Marquer comme vu" ou ouvre le détail → `UPDATE SET seen_at = now()`
- Pas besoin de nouvelle table, juste une colonne nullable
- RLS déjà en place (seul le owner peut UPDATE ses appointments)

## 2. Indicateur "Nouveau" sur chaque carte

Sur `InboxCard`, si `appointment.seen_at === null` → badge bleu "Nouveau" à côté du statut. Disparaît automatiquement quand le pro ouvre le détail ou clique "Tout marquer comme vu".

**Bouton global** en haut : "Tout marquer comme vu" → un seul UPDATE en batch sur tous les appointments non vus du centre.

## 3. Filtre "À encaisser"

Nouveau chip de statut entre "Confirmés" et "Terminés" :
- Affiche les réservations **confirmées** dont la date est **aujourd'hui ou passée**
- Ce sont les prestations réalisées mais pas encore clôturées
- C'est la vue clé pour le traitement en lot (fin de semaine/mois)

## 4. Filtres par période

Ajouter aux quick filters existants (En attente / Aujourd'hui / Cette semaine) :
- **Ce mois** 
- **Période personnalisée** (date picker avec plage)

## 5. Affichage acompte sur chaque carte

Sur `InboxCard`, sous le prix, afficher :
- `deposit_status === 'paid'` → "Acompte 20€ · Reste 80€"
- Sinon rien

## 6. Renommer "Terminé" → "Terminé et payé"

Dans `fr.json` et `en.json`, le statut `completed` devient "Terminé et payé" / "Completed & paid". Le bouton "Terminer" dans le dropdown devient "Terminer et encaisser".

## Fichiers impactés

| Fichier | Modification |
|---|---|
| **Migration SQL** | `ALTER TABLE appointments ADD COLUMN seen_at timestamptz` |
| `src/hooks/useAppointments.tsx` | Ajouter `seen_at` au type, fonction `markAllSeen()` et `markSeen(id)` |
| `src/pages/Dashboard.tsx` | Badge "Nouveau", bouton "Tout vu", filtre "À encaisser", filtres mois/custom, affichage acompte |
| `src/i18n/locales/fr.json` | Clés : "Nouveau", "À encaisser", "Terminé et payé", "Ce mois", "Tout marquer comme vu" |
| `src/i18n/locales/en.json` | Idem en anglais |

## Pas de localStorage

Tout est en base. Multi-device, multi-utilisateur, persistant.

