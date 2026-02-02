
# Plan : Synchronisation Google Agenda 1-Clic

## Résumé

Simplification de l'interface pour permettre la synchronisation en **1 seul clic** au lieu de copier/coller un lien manuellement.

---

## Ce qui change

### Avant (compliqué) :
1. Copier le lien
2. Aller dans Google Agenda → Paramètres → Ajouter un agenda → Depuis une URL
3. Coller le lien
4. Valider

### Après (1 clic) :
1. Cliquer sur **"Synchroniser avec Google Agenda"**
2. Google affiche : "Ajouter ce calendrier ?"
3. Cliquer "Ajouter" → **Terminé !**

---

## Nouvelle interface utilisateur

```text
┌──────────────────────────────────────────────────────────────┐
│  📅 Synchronisation Google Agenda                            │
│                                                              │
│  Synchronisez tous vos rendez-vous en 1 clic.               │
│                                                              │
│     [🔗 Synchroniser avec Google Agenda]  (gros bouton)     │
│                                                              │
│  ✓ Tous vos RDV confirmés seront visibles                   │
│  ✓ Les nouveaux RDV s'ajoutent automatiquement              │
│  ✓ Les modifications et annulations sont synchronisées      │
│                                                              │
│  💡 Pour un ajout instantané d'un RDV urgent, utilisez      │
│     le bouton 📅 à côté du rendez-vous.                     │
│                                                              │
│  ▼ Options avancées (replié par défaut)                     │
│    └─ Copier le lien manuellement                           │
│    └─ Régénérer le lien (invalide l'ancien)                 │
└──────────────────────────────────────────────────────────────┘
```

---

## Fonctionnement technique

### Le lien magique Google

Quand le pro clique sur le bouton, on ouvre :
```
https://calendar.google.com/calendar/r?cid=webcal://[URL_ICAL]
```

Google affiche alors automatiquement une fenêtre de confirmation :
- "Ajouter ce calendrier ?"
- Le pro clique "Ajouter"
- C'est fait !

---

## Fichiers à modifier

| Fichier | Modification |
|---------|-------------|
| `src/lib/calendarUtils.ts` | Ajouter `generateGoogleCalendarSubscribeUrl()` |
| `src/components/settings/CalendarSyncSection.tsx` | Nouveau design avec bouton 1-clic + options avancées repliées |

---

## Détails des modifications

### 1. calendarUtils.ts - Nouvelle fonction

```typescript
/**
 * Generate a Google Calendar subscribe URL (1-click add)
 * Opens Google Calendar with "Add this calendar?" dialog
 */
export function generateGoogleCalendarSubscribeUrl(icalUrl: string): string {
  // Convert https:// to webcal:// protocol (required by Google)
  const webcalUrl = icalUrl.replace('https://', 'webcal://');
  return `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcalUrl)}`;
}
```

### 2. CalendarSyncSection.tsx - Nouveau composant

- **Bouton principal** : "Synchroniser avec Google Agenda" (ouvre le lien 1-clic)
- **Liste des avantages** : checkmarks avec ce qui est synchronisé
- **Info** : rappel du bouton 📅 pour les ajouts instantanés
- **Section repliable** : "Options avancées" contenant :
  - Copier le lien manuellement
  - Régénérer le lien

---

## Ce qui est synchronisé automatiquement

| Élément | Synchronisé |
|---------|-------------|
| RDV confirmés (3 derniers mois) | ✓ |
| RDV confirmés (6 prochains mois) | ✓ |
| Nouveaux RDV | ✓ (refresh 12-24h) |
| Modifications de RDV | ✓ |
| Annulations | ✓ (disparaissent) |

---

## Note sur le délai de synchronisation

Google Agenda rafraîchit les calendriers abonnés toutes les **12-24h** (imposé par Google, non modifiable).

**Solution déjà en place** : Le bouton 📅 à côté de chaque RDV dans le dashboard permet un ajout **instantané** pour les cas urgents.
