

# Securisation du parcours abonnement et experience utilisateur expiree

## Problemes identifies

### 1. Abus de la periode d'essai
Le fichier `create-checkout` contient `trial_period_days: 30` en dur. Si un utilisateur annule son abonnement puis revient, il obtient un nouveau trial gratuit de 30 jours. Avec des milliers d'utilisateurs, c'est un risque financier majeur.

### 2. Aucune experience "degradee" pour les comptes expires
Aujourd'hui, un utilisateur avec un abonnement expire peut quand meme acceder au dashboard complet. Il voit toutes ses donnees, mais sa page publique est fermee. Il n'y a aucun signal visuel fort pour le pousser a reprendre son abonnement.

### 3. Redirection systematique vers le paiement a la connexion
Quand un utilisateur existant (qui a deja eu un abonnement) se connecte et que `check-subscription` retourne `subscribed: false`, il est immediatement redirige vers Stripe Checkout. Il ne peut meme pas acceder a son dashboard pour voir ses donnees ou gerer son compte.

---

## Plan de resolution

### Etape 1 : Empecher l'abus du trial dans `create-checkout`

Modifier la fonction Edge `create-checkout` pour verifier si l'utilisateur a deja eu un abonnement (actif, annule, ou expire) avant d'offrir un trial.

**Logique :**
```text
1. Lister les subscriptions du client Stripe (status: "all")
2. Si au moins 1 subscription existe (meme "canceled") -> pas de trial
3. Sinon -> trial de 30 jours
```

Concretement, remplacer le `trial_period_days: 30` fixe par une condition dynamique.

### Etape 2 : Enrichir `check-subscription` avec `had_trial`

Ajouter un champ `had_trial: true/false` dans la reponse de `check-subscription`. Ce champ indique si l'utilisateur a deja eu au moins un abonnement (trial ou paye). Le frontend utilisera cette info pour adapter les messages.

### Etape 3 : Modifier le flux de connexion dans `Auth.tsx`

Aujourd'hui, si `subscribed: false`, l'utilisateur est redirige vers Stripe. Le nouveau comportement sera :

```text
Connexion reussie
     |
     v
check-subscription
     |
  +--+--+
  |     |
  v     v
 Actif  Inactif
  |       |
  v       +-------+--------+
Dashboard  Jamais eu    Deja eu un abo
           d'abo        (had_trial=true)
             |              |
             v              v
          Checkout      Dashboard
          (avec trial)  (mode degrade)
```

Les utilisateurs qui n'ont jamais eu d'abonnement sont rediriges vers le checkout (avec trial). Les anciens abonnes vont au dashboard en mode degrade.

### Etape 4 : Dashboard en mode degrade pour les comptes expires

Creer un composant `SubscriptionBanner` affiche en haut de chaque page du dashboard quand l'abonnement est expire. Ce bandeau :

- Affiche un message clair : "Votre abonnement est inactif. Votre page publique est fermee."
- Contient un bouton "Reactiver mon abonnement" qui ouvre Stripe Checkout (sans trial cette fois)
- Est visuellement fort (couleur warning/orange) mais ne bloque pas l'acces aux donnees

**Pourquoi ne pas bloquer l'acces au dashboard :**
- L'utilisateur doit pouvoir voir ses clients, factures, historique
- Bloquer l'acces creer de la frustration et risque de perdre l'utilisateur definitivement
- Voir ses donnees sans que la page publique fonctionne est le meilleur incitatif a re-souscrire

### Etape 5 : Stocker `had_trial` dans `useAuth` (AuthContext)

Ajouter `hadTrial` au `SubscriptionInfo` dans le contexte d'auth pour que tous les composants puissent adapter leur comportement.

---

## Fichiers a modifier

| Fichier | Modification |
|---------|-------------|
| `supabase/functions/create-checkout/index.ts` | Verifier l'historique d'abonnements avant d'offrir le trial |
| `supabase/functions/check-subscription/index.ts` | Ajouter `had_trial` dans la reponse |
| `src/hooks/useAuth.tsx` | Ajouter `hadTrial` au `SubscriptionInfo` |
| `src/pages/Auth.tsx` | Ne plus rediriger les anciens abonnes vers checkout |
| `src/components/dashboard/SubscriptionBanner.tsx` | Nouveau composant : bandeau de reactivation |
| `src/pages/Dashboard.tsx` | Afficher le bandeau si expire |
| Autres pages dashboard | Afficher le bandeau si expire |

---

## Impact scalabilite

- Zero table supplementaire, zero migration SQL
- La verification de l'historique Stripe dans `create-checkout` ajoute 1 appel API Stripe (deja fait dans `check-subscription`)
- Le champ `had_trial` est derive des donnees Stripe existantes, pas de stockage supplementaire

