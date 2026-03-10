

# Plan : Interface unifiée — Fusionner Ventes dans Statistiques

## Le problème actuel

1. L'icône "Factures" du dashboard mène maintenant vers "Ventes" → les Devis ne sont plus accessibles depuis la grille
2. "Ventes" et "Statistiques" se chevauchent (les deux affichent du CA)
3. La page Ventes est isolée, pas intégrée dans le parcours

## La philosophie Apple : moins d'entrées, plus de profondeur

Un pro ne pense pas "je vais sur Ventes" puis "je vais sur Stats". Il pense : **"combien j'ai gagné ?"** → une seule destination.

### Architecture simplifiée

```text
Grille d'accueil (8 icônes) :
┌──────────────┬──────────────┬──────────────┐
│ Réservations │   Agenda     │   Ma Page    │
├──────────────┼──────────────┼──────────────┤
│   Devis      │   Clients    │  Formules    │
├──────────────┼──────────────┼──────────────┤
│  Demandes    │ Statistiques │              │
└──────────────┴──────────────┴──────────────┘

Statistiques = le hub financier unique :
┌─────────────────────────────────────────────┐
│  KPIs : CA encaissé │ CA estimé │ Ventes │  │
│         Panier moyen │ Clients              │
├─────────────────────────────────────────────┤
│  Onglets :                                  │
│  [Vue d'ensemble]  [Ventes]  [Services]     │
│                                             │
│  Vue d'ensemble = graphiques actuels        │
│  Ventes = liste des tickets + export CSV    │
│  Services = répartition par formule         │
└─────────────────────────────────────────────┘
```

## Ce qui change concrètement

### 1. Grille d'accueil + nav rapide : "Ventes" redevient "Devis"
- `DashboardHome.tsx` : icône Factures → lien `/dashboard/invoices` + label "Devis"
- `DashboardLayout.tsx` : idem dans le panel de navigation rapide

### 2. Page Statistiques : absorbe les Ventes
- `DashboardStats.tsx` : ajouter un 3e onglet **"Ventes"** qui contient :
  - Les KPIs ventes (CA encaissé, nombre, panier moyen) 
  - La liste des tickets de vente avec filtres jour/semaine/mois
  - Le bouton Export CSV
  - La recherche par client/service
- Les KPIs en haut distinguent clairement : **CA encaissé** (réel, depuis `sales`) vs **CA estimé** (théorique, depuis `appointments`)

### 3. Sidebar : supprimer "Ventes" comme entrée séparée
- Section "Clients" : Demandes, Clients, Devis
- Section "Insights" : Statistiques (qui contient tout)
- Supprimer l'entrée "Ventes" de la sidebar et mobile sidebar

### 4. Route `/dashboard/sales` : redirection
- Garder la route mais rediriger vers `/dashboard/stats` (onglet ventes) pour ne rien casser

### 5. Suppression
- `DashboardSales.tsx` : le contenu est absorbé dans `DashboardStats.tsx`, le fichier devient un simple redirect

## Fichiers impactés

| Fichier | Modification |
|---|---|
| `DashboardHome.tsx` | Icône "Devis" → `/dashboard/invoices` |
| `DashboardLayout.tsx` | Idem dans le nav panel |
| `DashboardStats.tsx` | Ajouter onglet "Ventes" avec liste, KPIs réels, export CSV |
| `DashboardSales.tsx` | Remplacer par redirect vers `/dashboard/stats` |
| `DashboardSidebar.tsx` | Retirer "Ventes", garder "Devis" dans Clients |
| `MobileSidebar.tsx` | Idem |
| `fr.json` / `en.json` | Ajuster les clés de traduction |

## Résultat

- **8 icônes**, chacune avec un rôle clair et distinct
- **Devis** accessible directement depuis la grille (comme avant)
- **Statistiques** = le hub unique pour tout ce qui touche à l'argent
- Zéro confusion entre "Ventes" et "Stats"
- Export CSV accessible depuis Stats > onglet Ventes

