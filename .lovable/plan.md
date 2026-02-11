

# Systeme de reconnaissance client pour prestations personnalisees

## Recapitulatif du besoin

Aujourd'hui, le parcours de reservation est concu pour des **formules fixes** (packs). Mais pour les pros dont la prestation depend du client (nettoyeurs de vitres, entretien recurrent...), il faut un moyen pour le **client recurrent** d'etre reconnu et de voir directement **sa prestation personnalisee** (prix, duree) sans passer par les packs standards.

## Approche strategique retenue : Identification par telephone

**Pourquoi le telephone et pas l'email :**
- Le telephone est deja la cle primaire de deduplication dans `clientService.ts`
- Les clients connaissent leur numero par coeur (pas besoin de chercher)
- L'index unique `normalize_phone()` existe deja en base -- zero cout supplementaire
- Portee limitee au centre : il faut connaitre le slug du pro ET le numero du client

**Pourquoi pas de lien personnalise :**
- Les liens peuvent etre partages/exposes
- Le pro doit gerer l'envoi de liens (friction supplementaire)
- Le telephone est plus naturel et universel

**Securite : pourquoi c'est suffisant sans code de verification :**
- Les donnees exposees sont **minimales** : uniquement le prenom + nom de la prestation + prix (jamais l'email, l'adresse ou l'historique)
- La recherche est **scopee au centre** (il faut connaitre le slug du pro)
- C'est le meme niveau de securite qu'un systeme de reservation chez le dentiste ou le coiffeur
- Ajouter un SMS/email de verification ajouterait une friction enorme et tuerait l'adoption

## Parcours utilisateur

```text
Page du pro (/:slug)
       |
       v
  "Vous etes deja client ?"
  [Entrer mon numero de telephone]
       |
       v
  Recherche dans clients (center_id + normalize_phone)
       |
  +----+----+
  |         |
  v         v
Trouve    Non trouve
  |         |
  v         v
A une      "Numero non reconnu.
prestation  Continuez normalement."
par defaut?  -> Flux packs standard
  |
  +----+----+
  |         |
  v         v
 OUI       NON
  |         |
  v         v
Affiche    "Bonjour [prenom]!
prestation  Choisissez votre formule."
perso:      -> Flux packs standard
"Bonjour    (infos pre-remplies)
[prenom]!
Votre prestation:
[Nom] - [Prix]€ - [Duree]
[Choisir un creneau]"
  |
  v
Calendrier (duree = celle de la prestation)
  |
  v
Formulaire pre-rempli (nom, tel, email, adresse)
  |
  v
Confirmation
```

## Plan technique

### 1. Nouvelle vue SQL securisee : `public_client_lookup`

Creer une fonction SQL `security definer` qui ne retourne que le strict minimum :
- `client_id`
- `first_name` (prenom seulement, extrait du champ `name`)
- `service_name`, `service_price`, `service_duration_minutes` (depuis `custom_services`)
- `client_name`, `client_email`, `client_phone`, `client_address` (pour pre-remplir le formulaire)

La fonction prend en parametre `center_id` + `phone` normalise, et ne retourne rien si le client n'existe pas.

**Avantage scalabilite** : utilise l'index existant `normalize_phone()`, zero scan de table.

### 2. Modifier `CenterLanding.tsx`

Ajouter un bouton/section "Vous etes deja client ?" qui ouvre un champ telephone. Quand le client soumet :
- Appel a la fonction SQL via Supabase RPC
- Si client trouve avec prestation : afficher un ecran personnalise avec la prestation et un bouton "Choisir un creneau"
- Si client trouve sans prestation : message de bienvenue + redirection vers le flux packs avec infos pre-remplies
- Si non trouve : message neutre + flux normal

### 3. Modifier `CenterBooking.tsx`

Ajouter un nouvel etat pour le "mode client reconnu" :
- Stocker les donnees du client reconnu (prestation, infos)
- Passer la duree de la prestation au `CalendarPicker`
- Pre-remplir le `ClientForm` avec les infos existantes
- A la creation du RDV, utiliser `custom_service_id` + `client_id` + `custom_price`

### 4. Modifier `ClientForm.tsx`

Accepter des valeurs initiales (`defaultValues`) pour pre-remplir les champs quand le client est reconnu. Les champs restent editables.

### 5. Option dans le dashboard pro

Ajouter un toggle dans les reglages ou la personnalisation pour que le pro puisse activer/desactiver la reconnaissance client sur sa page. Stocke dans le champ `customization` JSONB de `centers`.

### Impact sur la scalabilite

| Element | Impact |
|---------|--------|
| Fonction SQL RPC | O(1) grace a l'index `normalize_phone` |
| Pas de table supplementaire | Zero migration lourde |
| Pas d'auth client | Zero friction, zero gestion de comptes |
| Scope par centre | Chaque requete est isolee, pas de table scan globale |
| Donnees exposees minimales | Securite preservee sans verification |

### Fichiers a modifier/creer

- **Migration SQL** : fonction RPC `lookup_client_by_phone`
- `src/components/booking/CenterLanding.tsx` : section "Deja client ?"
- `src/pages/CenterBooking.tsx` : gestion du mode client reconnu
- `src/components/booking/ClientForm.tsx` : support des valeurs par defaut
- `src/hooks/useCenter.tsx` : lecture du toggle dans customization
- Optionnel : toggle dans le dashboard (customization)

