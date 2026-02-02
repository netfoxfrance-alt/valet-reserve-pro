
# Plan : Synchronisation Google Agenda (iCal)

## Résumé

Implémentation d'une synchronisation calendrier **robuste et sans configuration** pour les pros, compatible avec **Google Agenda, Apple Calendar, et Outlook**. Aucune API key ni OAuth requis côté utilisateur.

---

## Ce qui sera implémenté

### 1. Export iCal (Abonnement automatique)
- **URL unique par centre** : `/functions/v1/calendar-ical?center={center_id}&token={secret}`
- Génère un flux iCal (RFC 5545) contenant tous les RDV confirmés
- Le pro copie cette URL et l'ajoute dans Google Agenda via "Ajouter par URL"
- Google rafraîchit automatiquement (toutes les 12-24h)

### 2. Bouton "Ajouter au calendrier" par RDV
- Lien direct vers Google Calendar avec tous les détails pré-remplis
- Ajout instantané en 1 clic (pas de délai de synchro)
- Déjà présent dans les emails de confirmation → sera ajouté dans le dashboard

---

## Expérience utilisateur (sans rien de technique)

### Pour le pro dans Paramètres :

```
┌──────────────────────────────────────────────────────────────┐
│  📅 Synchronisation Calendrier                               │
│                                                              │
│  Synchronisez automatiquement vos rendez-vous avec Google   │
│  Agenda, Apple Calendar ou Outlook.                         │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Votre lien de synchronisation                         │ │
│  │                                                        │ │
│  │  https://...functions/v1/calendar-ical?center=...      │ │
│  │                                           [📋 Copier]  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Comment ça marche ?                                         │
│  1. Copiez le lien ci-dessus                                │
│  2. Ouvrez Google Agenda > Paramètres > Ajouter agenda     │
│  3. Collez l'URL dans "Depuis une URL"                      │
│  4. Vos RDV confirmés apparaîtront automatiquement !       │
│                                                              │
│  ⓘ Le calendrier se met à jour automatiquement.            │
└──────────────────────────────────────────────────────────────┘
```

### Dans le Dashboard (liste des RDV confirmés) :
- Petit bouton calendrier 📅 à côté de chaque RDV confirmé
- Clic → ouvre Google Calendar avec le RDV pré-rempli

---

## Détails Techniques

### Nouvelle Edge Function : `calendar-ical`

**Fichier** : `supabase/functions/calendar-ical/index.ts`

**Fonctionnement** :
1. Reçoit `center` (ID ou slug) et `token` (secret de sécurité)
2. Vérifie que le token correspond au centre (stocké dans une nouvelle colonne `ical_token`)
3. Récupère tous les RDV "confirmed" et "completed" des 3 derniers mois + 6 prochains mois
4. Génère le format iCal standard (VCALENDAR/VEVENT)
5. Retourne avec `Content-Type: text/calendar`

**Sécurité** :
- Token secret unique par centre (UUID) pour éviter l'énumération
- Seuls les créneaux bloqués sont visibles (pas les infos client détaillées)
- Cache de 15 minutes pour performance

### Modification de la table `centers`

Nouvelle colonne :
- `ical_token` (TEXT, unique, nullable) - Token secret pour l'URL iCal

### Modification de `DashboardSettings.tsx`

Nouvelle section "Synchronisation Calendrier" avec :
- Affichage de l'URL iCal complète
- Bouton "Copier le lien"
- Instructions étape par étape

### Modification de `Dashboard.tsx`

Pour chaque RDV confirmé, ajouter un bouton 📅 qui génère un lien Google Calendar :
```
https://calendar.google.com/calendar/render?action=TEMPLATE
  &text=RDV {client_name}
  &dates={start}/{end}
  &details={service} - {price}€
  &location={address}
```

### Utilitaire : `src/lib/calendarUtils.ts`

Fonctions réutilisables :
- `generateGoogleCalendarUrl(appointment)` - Génère le lien Google Calendar
- `generateIcsContent(appointments)` - Génère le contenu iCal (pour téléchargement)

---

## Fichiers à créer/modifier

| Fichier | Action |
|---------|--------|
| `supabase/functions/calendar-ical/index.ts` | **CRÉER** - Edge function iCal |
| `src/lib/calendarUtils.ts` | **CRÉER** - Utilitaires calendrier |
| `src/pages/DashboardSettings.tsx` | **MODIFIER** - Section synchronisation |
| `src/pages/Dashboard.tsx` | **MODIFIER** - Bouton ajout calendrier |
| Migration SQL | **CRÉER** - Colonne `ical_token` |
| `supabase/config.toml` | **MODIFIER** - `verify_jwt = false` pour calendar-ical |

---

## Garantie de stabilité

### Pourquoi c'est 100% fiable pour des millions d'utilisateurs :

1. **Aucune dépendance externe** : Le format iCal est un standard universel (RFC 5545) supporté nativement par tous les calendriers

2. **Pas de quotas Google** : C'est Google qui vient chercher les données, pas nous qui envoyons. Aucune limite de requêtes

3. **Pas de tokens à maintenir** : Aucune authentification OAuth, donc aucun token qui expire

4. **Stateless** : Chaque requête est indépendante, pas d'état à synchroniser

5. **Cache** : L'edge function met en cache 15 min pour éviter la surcharge

6. **Sécurité par token** : Chaque centre a un token unique, impossible de deviner l'URL d'un autre

### Limites connues (et solutions) :

| Limite | Solution intégrée |
|--------|-------------------|
| Refresh Google ~12-24h | Bouton "Ajouter au calendrier" par RDV pour ajout instantané |
| Pas de synchro entrante | Hors scope (nécessiterait OAuth complexe) |
| Infos limitées dans iCal | On n'expose que le nom du client + heure (pas le téléphone/email) |

---

## Questions résolues

**Q: Le pro doit-il configurer quelque chose de technique ?**  
R: Non, juste copier un lien et le coller dans Google Agenda.

**Q: Et si le pro n'a pas Google Agenda ?**  
R: Ça marche aussi avec Apple Calendar, Outlook, et tout calendrier qui supporte iCal (99% des calendriers).

**Q: Les nouveaux RDV apparaissent quand ?**  
R: Via l'abonnement iCal : 12-24h (refresh Google). Via le bouton 📅 : instantanément.

**Q: C'est sécurisé ?**  
R: Oui, chaque URL contient un token secret unique. Sans ce token, impossible d'accéder aux RDV.

