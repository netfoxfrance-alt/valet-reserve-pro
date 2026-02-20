

# Fusionner "Reservations" dans "Demandes" + "Agenda"

## Constat : pourquoi supprimer Reservations

Apres analyse detaillee du code, voici ce que fait chaque page :

| Fonctionnalite | Reservations | Agenda | Demandes |
|---|---|---|---|
| Liste des RDV en attente de validation | Oui (filtre "En attente") | Oui (visible sur le calendrier) | Non |
| Confirmer / Refuser un RDV | Oui | Non (juste voir + deplacer) | Non |
| Creer un RDV manuellement | Oui | Oui | Non |
| Vue calendrier (mois/semaine) | Non | Oui | Non |
| Filtres temporels (aujourd'hui, semaine, mois) | Oui | Non (navigation par date) | Non |
| KPI stats (aujourd'hui, en attente, semaine) | Oui | Non | Non |
| Envoyer emails (confirmation, rappel) | Oui | Non | Non |
| Deplacer / reprogrammer un RDV | Non | Oui | Non |
| Periodes bloquees (vacances) | Non | Oui | Non |
| Sync Google Calendar | Oui | Oui | Non |
| Gestion demandes contact/devis | Non | Non | Oui |

**Le chevauchement est reel** : les deux pages manipulent la meme table `appointments` et proposent des actions similaires. La separation "liste vs calendrier" n'apporte pas assez de valeur pour justifier deux modules.

## Plan de redistribution

### 1. Demandes : nouveau 3e onglet "Demandes de RDV"

L'onglet affichera les rendez-vous en statut `pending_validation` (ceux venant de la page publique).

Chaque carte affichera :
- Nom du client, telephone, email, adresse
- Service demande (formule ou prestation) + prix
- Date et heure souhaites
- Type de vehicule
- Notes eventuelles
- Boutons : Confirmer / Refuser (avec envoi d'email automatique)
- Badge compteur de nouvelles demandes (comme les autres onglets)

C'est le meme flux que dans Reservations aujourd'hui, mais regroupe logiquement avec les autres types de demandes (contact, devis). Le professionnel a un seul endroit pour traiter toutes les demandes entrantes.

### 2. Agenda : devient le centre de pilotage des RDV

L'Agenda gardera ses vues Mois et Semaine, et recevra en plus :

- **Vue Liste** : un 3e mode d'affichage (icone liste) qui reprend le design de la liste actuelle de Reservations, avec les rendez-vous groupes par date
- **KPI en haut** : les 4 stats (Aujourd'hui, En attente, Cette semaine, A venir) migrent ici
- **Filtres temporels** : les chips de filtre (Tout, Aujourd'hui, Semaine, Mois, En attente) disponibles en mode Liste
- **Actions completes** : terminer, annuler, envoyer un rappel, ajouter au Google Calendar -- tout ce que faisait Reservations
- **Fiche detail** : clic sur un RDV ouvre le dialog de detail complet (AppointmentDetailDialog)

### 3. Suppression de Reservations

- Supprimer la route `/dashboard/reservations` de `App.tsx`
- Supprimer l'entree "Reservations" du menu dans `DashboardHome.tsx`
- Supprimer le fichier `Dashboard.tsx` (l'ancien nom de la page Reservations)
- L'icone reservations peut etre reutilisee pour l'Agenda ou retiree
- Mettre a jour le Quick-Nav (DashboardLayout/MobileSidebar) pour retirer le lien

### 4. Navigation mise a jour

La grille d'accueil passe de 8 a 7 icones :

1. **Agenda** (ex-Calendrier, absorbe Reservations)
2. Factures et Devis
3. Clients
4. Ma Page
5. Formules
6. **Demandes** (+ onglet "Demandes de RDV")
7. Statistiques

## Aucune fonctionnalite perdue

```text
Avant (Reservations)              -->  Apres
--------------------------------------------
Liste RDV en attente              -->  Demandes > onglet "Demandes de RDV"
Confirmer / Refuser               -->  Demandes > onglet "Demandes de RDV"
Liste RDV confirmes/a venir       -->  Agenda > vue Liste
KPI stats                         -->  Agenda > header
Filtres temporels                 -->  Agenda > vue Liste
Creer un RDV                      -->  Agenda > bouton "Ajouter un RDV" (deja present)
Email confirmation/rappel         -->  Agenda > actions sur chaque RDV
Fiche detail RDV                  -->  Agenda > dialog detail
Sync Google Calendar              -->  Agenda > deja present
```

## Section technique

### Fichiers modifies

- `src/pages/DashboardRequests.tsx` : ajout d'un 3e onglet "Demandes de RDV" qui charge les appointments en `pending_validation`, avec composant `AppointmentRequestCard` integre et actions confirmer/refuser + envoi emails
- `src/pages/DashboardCalendar.tsx` : ajout du mode "liste" (3e vue), migration des KPI stats, ajout des filtres temporels en mode liste, integration du `AppointmentDetailDialog`, actions completes (terminer, annuler, rappel, calendar sync)
- `src/pages/DashboardHome.tsx` : retirer l'entree Reservations du `menuItems`, reordonner la grille
- `src/App.tsx` : supprimer la route `/dashboard/reservations`
- `src/components/dashboard/DashboardLayout.tsx` et `MobileSidebar.tsx` : retirer le lien Reservations du Quick-Nav

### Fichiers supprimes

- `src/pages/Dashboard.tsx` (l'ancienne page Reservations -- son code utile sera migre dans DashboardCalendar et DashboardRequests)

### Composants reutilises tels quels

- `AppointmentDetailDialog` : reutilise dans l'Agenda
- `ConfirmationCalendarDialog` : reutilise dans l'Agenda et dans Demandes (apres confirmation)
- `AppointmentRow` : le design du composant sera adapte pour la vue Liste de l'Agenda
- `AddAppointmentDialog` : le formulaire de creation de RDV sera integre dans l'Agenda

### Logique emails preservee

La logique d'envoi d'emails (`sendBookingEmail`, `buildEmailPayload`, `sendStatusEmail`) sera extraite de Dashboard.tsx et reutilisee dans les deux pages cibles (Demandes pour confirm/refuse, Agenda pour rappels et annulations).

### Pas de changement base de donnees

Aucune modification de schema ni de RLS. Les memes requetes sur la table `appointments` sont reutilisees.

