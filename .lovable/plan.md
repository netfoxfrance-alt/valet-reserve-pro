

# Reservations: Centre de pilotage des rendez-vous

## Le probleme actuel

Les pages "Reservations" et "Agenda" font presque la meme chose : afficher les RDV, les confirmer, les refuser, en creer. L'Agenda doit rester l'outil visuel (calendrier), et les Reservations doivent devenir le **centre operationnel** pour traiter les demandes efficacement, surtout quand il y en a beaucoup.

## La vision

Transformer Reservations en une **boite de reception intelligente** pour les RDV, pensee pour gerer un gros volume :

### 1. En-tete avec compteurs temps reel
- 3 cartes compactes en haut : "En attente" (badge orange pulse), "Aujourd'hui", "Cette semaine"
- Chaque carte est cliquable et filtre la liste instantanement

### 2. Barre de filtres et recherche
- Champ de recherche par nom/telephone du client
- Filtres par statut en chips : Tous | En attente | Confirmes | Termines | Annules
- Tri par date (plus recent / plus ancien)

### 3. Liste optimisee pour le volume
- Chaque carte RDV est compacte mais complete :
  - Initiales du client dans un avatar colore
  - Nom, telephone, service, date/heure, prix
  - Badge de statut
  - **Actions rapides en swipe/boutons** : Confirmer (check vert) / Refuser (X rouge)
- Quand on confirme : email automatique + proposition Google Calendar (comme actuellement)
- Quand on refuse : email automatique

### 4. Detail en bottom-sheet (mobile) / side-panel (desktop)
- Clic sur un RDV ouvre les details complets sans quitter la page
- Depuis le detail : modifier le creneau, envoyer un rappel, voir la fiche client

### 5. Suppression des doublons
- Retirer le "Demandes de RDV" qui etait dans le module Demandes (car c'est exactement le role des Reservations)
- Garder dans Demandes uniquement : demandes de contact + demandes de devis

## Ce qui change concretement

### Reservations (refonte)
- Pas de vue calendrier (c'est le role de l'Agenda)
- Pas de mini-calendrier lateral
- Focus 100% sur le traitement des demandes
- Recherche client integree
- Actions rapides visibles directement sur chaque carte
- Design epure Apple-style avec des transitions fluides

### Agenda (inchange)
- Reste l'outil visuel : vues Mois et Semaine
- Garde son bouton "Ajouter un RDV"
- Garde la vue detaillee des creneaux

### Demandes (simplifie)
- Retire l'onglet "Demandes de RDV" (traite par Reservations)
- Garde : Demandes de contact + Demandes de devis

## Details techniques

### Fichiers modifies
1. **`src/pages/Dashboard.tsx`** : Refonte complete du composant. Remplacer la structure actuelle (stats + filtres + liste) par le nouveau design inbox. Garder les hooks existants (`useMyAppointments`, `useMyClients`, etc.). Ajouter un champ de recherche filtrant `appointments` par `client_name` et `client_phone`. Retirer le formulaire `AddAppointmentDialog` (creation se fait dans l'Agenda). Garder les actions confirm/refuse/cancel avec envoi d'emails.

2. **`src/pages/DashboardRequests.tsx`** : Retirer l'onglet "Demandes de RDV" s'il existe (garder uniquement contact + devis).

3. Aucune modification de base de donnees necessaire.

