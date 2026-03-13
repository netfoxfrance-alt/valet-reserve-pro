

## Plan : Prerendering SEO via Edge Function + Guide Cloudflare

### Ce que je vais faire (backend)

**Créer une Edge Function `prerender`** qui génère du HTML complet quand un bot (Google, Bing, etc.) visite le site. Cette fonction couvre :

1. **Page d'accueil (`/`)** : HTML statique avec le titre, la description, les features, le pricing, la FAQ — tout le contenu marketing visible sur la landing page.

2. **Pages centres (`/:slug`)** : Requête en base pour récupérer le nom, l'adresse, le téléphone, les services/formules, les horaires, la description, les données SEO personnalisées. Génère un HTML complet avec :
   - Balises `<title>`, `<meta description>`, Open Graph, Twitter Card
   - JSON-LD `LocalBusiness` (schéma structuré pour Google)
   - Le contenu textuel (nom, services, prix, adresse)

3. **Pages légales** (`/confidentialite`, `/cgv`, `/mentions-legales`) : HTML basique avec le titre de la page.

4. **Configuration** : `verify_jwt = false` dans `config.toml` (les bots n'ont pas de token).

### Ce que tu devras faire (simple, ~10 minutes)

1. **Créer un compte Cloudflare gratuit** sur [cloudflare.com](https://cloudflare.com)
2. **Transférer le DNS de `cleaningpage.com`** vers Cloudflare (je te guiderai étape par étape avec des captures d'écran)
3. **Copier-coller un script de ~20 lignes** que je te fournirai dans la section "Workers" de Cloudflare
4. **Ré-ajouter le domaine dans Lovable** (l'enregistrement A vers `185.158.133.1`)

### Risques : zéro

- Les utilisateurs normaux ne verront **aucun changement** — ils continuent d'utiliser l'app React comme avant
- Si le Worker Cloudflare tombe en panne, le site revient simplement à son fonctionnement actuel (pas de prerendering, mais pas de casse)
- C'est la méthode **recommandée par Google** pour les SPAs ([Dynamic Rendering](https://developers.google.com/search/docs/crawling-indexing/javascript/dynamic-rendering))

### Détails techniques

```text
Visiteur arrive sur cleaningpage.com
        │
  Cloudflare Worker (gratuit)
        │
        ├── User-Agent = Googlebot/Bingbot/etc.
        │      └── Appel Edge Function "prerender?path=/slug"
        │             └── Retourne HTML complet avec contenu + meta
        │
        └── Utilisateur normal
               └── SPA React inchangée
```

### Fichiers à créer/modifier

1. **Créer** `supabase/functions/prerender/index.ts` — Edge Function qui génère le HTML
2. **Modifier** `supabase/config.toml` — Ajouter `[functions.prerender] verify_jwt = false`
3. **Fournir** le code du Cloudflare Worker à copier-coller (dans le chat, pas dans le code)

