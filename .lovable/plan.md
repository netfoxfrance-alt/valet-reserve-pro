

# Plan en 2 parties

## Partie 1 — Corriger l'erreur de build (moi, dans le code)

L'éditeur de texte riche a une erreur d'import. Je vais changer :
```
import { TextStyle } from '@tiptap/extension-text-style'
```
en :
```
import TextStyle from '@tiptap/extension-text-style'
```
C'est un import par défaut, pas un import nommé. Ça corrige le build immédiatement.

---

## Partie 2 — Guide Cloudflare ultra simple

### Pourquoi ça bugue quand tu passes en Proxied

Tu as probablement raison : le problème vient du fait que **les deux domaines** (`cleaningpage.com` ET `www.cleaningpage.com`) sont connectés directement dans Lovable. Quand Cloudflare passe en Proxied, il y a un conflit entre la gestion SSL de Lovable et celle de Cloudflare.

**La solution** (comme Planity) : garder **un seul domaine principal** (le `www`) et faire que l'autre redirige vers lui.

### Étapes concrètes — dans l'ordre exact

**Étape 1 — Dans Lovable (réglages du projet)**
1. Va dans les réglages de ton projet → Domaines
2. Garde `www.cleaningpage.com` connecté
3. Retire `cleaningpage.com` (le domaine sans www) des domaines connectés
4. Comme ça, Lovable ne gère plus que le `www` — et Cloudflare peut gérer la redirection du domaine racine

**Étape 2 — Dans Cloudflare → DNS**
1. Vérifie que tu as ces 2 enregistrements (et seulement ceux-là pour @ et www) :

| Type | Nom | Contenu | Proxy |
|------|-----|---------|-------|
| A | `www` | `185.158.133.1` | **Proxied** (orange) |
| A | `@` | `185.158.133.1` | **Proxied** (orange) |

2. Supprime tout doublon ou CNAME qui pointe ailleurs pour `@` ou `www`

**Étape 3 — Dans Cloudflare → SSL/TLS**
- Mode : **Full** (pas Flexible, pas Full strict)

**Étape 4 — Dans Cloudflare → Rules → Redirect Rules**
- Crée une règle pour rediriger `cleaningpage.com` vers `www.cleaningpage.com` :
  - **Si** : Hostname = `cleaningpage.com`
  - **Alors** : Redirection dynamique 301 vers `https://www.cleaningpage.com` (conserver le chemin)
- Comme Planity : tout le monde arrive sur `www`

**Étape 5 — Créer le Worker (le SEO)**
1. Cloudflare → Workers & Pages → Create Worker
2. Nom : `cleaningpage-seo`
3. Deploy (vide d'abord)
4. Click "Edit code"
5. Supprime tout, colle le contenu de `cloudflare-worker/worker.js`
6. Deploy

**Étape 6 — Ajouter les routes au Worker**
1. Dans le Worker → Settings → Triggers/Routes
2. Ajoute :
   - `www.cleaningpage.com/*` → Zone `cleaningpage.com` → Fail open
   - `cleaningpage.com/*` → Zone `cleaningpage.com` → Fail open

**Étape 7 — Tester**
1. Attends 2-3 minutes
2. Va sur `www.cleaningpage.com` → le site doit charger normalement
3. Va sur `cleaningpage.com` → ça doit rediriger vers `www`
4. Va sur [opengraph.xyz](https://opengraph.xyz) → colle une URL de page pro → tu dois voir le nom, la description et la bannière

### Résumé visuel

```text
cleaningpage.com → redirige 301 → www.cleaningpage.com
                                        │
                                   Cloudflare Worker
                                        │
                              ┌─────────┴──────────┐
                              │                     │
                        Humain normal          Bot Google/iMessage
                              │                     │
                         SPA React             HTML pré-rendu
                        (rien change)      (SEO + aperçus riches)
```

