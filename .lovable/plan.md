

# Fix: Gestion intelligente des doublons clients partout

## Problème
Quand tu crées un client (depuis le calendrier, les clients, les demandes de devis, ou les factures), si un client avec le même téléphone existe déjà, l'INSERT brut échoue avec l'erreur `duplicate key value violates unique constraint "idx_clients_unique_phone_per_center"`.

Le service `findOrCreateClient` dans `clientService.ts` gère déjà parfaitement les doublons (recherche par téléphone normalisé, puis email, puis création), mais il n'est utilisé que dans `useAppointments` pour les réservations. Les autres formulaires utilisent directement `useClients.createClient` qui fait un INSERT brut sans vérification.

## Solution

### 1. Modifier `useClients.createClient` pour utiliser la logique anti-doublon

Remplacer l'INSERT brut dans `useClients.tsx` par une logique qui :
- Cherche d'abord un client existant par téléphone normalisé, puis par email
- Si trouvé : met à jour les infos manquantes (enrichissement) et retourne le client existant
- Si pas trouvé : crée le nouveau client
- En cas d'erreur de contrainte unique (race condition) : retry automatique

Concrètement, réutiliser la fonction `findOrCreateClient` de `clientService.ts` dans `createClient`, puis refetch le client complet avec ses relations.

### 2. Améliorer le message d'erreur utilisateur

Au lieu d'afficher le message technique PostgreSQL, afficher un message clair :
- "Ce client existe déjà (même numéro de téléphone)" avec possibilité de voir/modifier la fiche existante
- Ou mieux : ne pas afficher d'erreur du tout, juste informer "Client existant retrouvé et mis à jour"

### 3. Pages impactées (aucun changement nécessaire dans ces fichiers)

Les pages suivantes appellent toutes `createClient` depuis `useMyClients()`, donc elles bénéficieront automatiquement du fix :
- `DashboardCalendar.tsx` (formulaire inline "Nouveau client")
- `DashboardClients.tsx` (page clients)
- `DashboardRequests.tsx` (créer fiche client depuis demande de devis)
- `InvoiceFormDialog.tsx` (création client inline dans les factures/devis)

### Détails techniques

```text
Avant:  createClient() → INSERT brut → 💥 erreur unique constraint
Après:  createClient() → findOrCreateClient() → SELECT existant OU INSERT → ✅ toujours OK
```

**Fichiers modifiés :**
- `src/hooks/useClients.tsx` : Réécrire `createClient` pour utiliser `findOrCreateClient`, puis fetch le client complet avec ses relations. Retourner aussi un flag `isExisting` pour adapter le toast.
- `src/pages/DashboardClients.tsx` : Adapter le toast ("Client ajouté" vs "Client existant retrouvé")
- `src/pages/DashboardCalendar.tsx` : Idem pour le toast
- `src/pages/DashboardRequests.tsx` : Idem
- `src/components/invoices/InvoiceFormDialog.tsx` : Idem

