

## Voici ce que tu dois faire + ce que je vais modifier

### 1. Code du Worker Cloudflare a copier-coller

Va dans **Cloudflare > Workers & Pages > cleaningpage-prerender > Edit Code**, remplace TOUT le contenu par ceci, puis clique **Deploy** :

```js
const PRERENDER_FUNCTION_URL = 'https://obkafavlsimcqiohyigs.supabase.co/functions/v1/prerender';

const BOT_AGENTS = [
  'googlebot', 'bingbot', 'yandexbot', 'duckduckbot', 'baiduspider', 'slurp',
  'sogou', 'exabot', 'ia_archiver', 'archive.org_bot', 'petalbot', 'seznambot',
  'mediapartners-google', 'adsbot-google', 'apis-google', 'google-inspectiontool',
  'chrome-lighthouse', 'google-structured-data-testing-tool',
  'facebookexternalhit', 'facebookcatalog', 'facebot',
  'twitterbot', 'linkedinbot',
  'whatsapp', 'telegrambot', 'discordbot', 'slackbot',
  'viber', 'line/', 'kakaotalk',
  'applebot',
  'semrushbot', 'ahrefsbot', 'mj12bot', 'rogerbot',
  'w3c_validator', 'w3c-checklink',
  'pinterest', 'embedly', 'quora link preview', 'showyoubot',
  'outbrain', 'vkshare', 'redditbot',
  'opengraph', 'ogbot', 'linkpreview', 'link-preview',
  'metatags', 'meta-tags', 'iframely',
  'preview', 'crawler', 'spider', 'bot/', 'bot;',
  'headlesschrome', 'phantomjs',
  'curl/', 'wget/', 'python-requests', 'python-urllib',
  'go-http-client', 'node-fetch', 'axios/',
  'fetch/', 'http.rb',
];

const BYPASS_PATTERNS = [
  '/dashboard', '/auth', '/complete-signup', '/deposit', '/accept-quote',
  '/assets/', '/src/', '/_', '/favicon', '/robots.txt', '/sitemap', '/og-image',
  '.js', '.css', '.png', '.jpg', '.jpeg', '.webp', '.svg', '.ico',
  '.woff', '.woff2', '.ttf', '.map', '.json',
];

const SPA_ONLY_ROUTES = ['/presentation', '/booking'];

function isBot(ua) {
  if (!ua) return false;
  const lower = ua.toLowerCase();
  return BOT_AGENTS.some(b => lower.includes(b));
}

function isLikelyBot(request) {
  // All modern browsers send Sec-Fetch-Dest. Crawlers/unfurlers don't.
  const secFetchDest = request.headers.get('sec-fetch-dest');
  if (secFetchDest) return false; // Real browser
  
  // No Sec-Fetch-Dest = likely a bot/crawler/unfurler
  // But filter out legit non-browser requests (API calls from JS)
  const accept = (request.headers.get('accept') || '').toLowerCase();
  // If it accepts HTML, it's trying to render the page = bot/unfurler
  if (accept.includes('text/html') || accept.includes('*/*') || !accept) {
    return true;
  }
  return false;
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    if (BYPASS_PATTERNS.some(p => pathname.includes(p))) return fetch(request);
    if (SPA_ONLY_ROUTES.some(r => pathname.startsWith(r))) return fetch(request);

    const ua = request.headers.get('user-agent') || '';
    const botByUA = isBot(ua);
    const botByHeuristic = isLikelyBot(request);

    if (!botByUA && !botByHeuristic) return fetch(request);

    try {
      const res = await fetch(
        `${PRERENDER_FUNCTION_URL}?path=${encodeURIComponent(pathname)}`,
        { headers: { 'User-Agent': ua } }
      );

      if (!res.ok) return fetch(request);

      return new Response(await res.text(), {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=3600, s-maxage=86400',
          'X-Prerendered': 'true',
          'X-Robots-Tag': 'index, follow',
          'X-Bot': botByUA ? 'ua' : 'heuristic',
        },
      });
    } catch {
      return fetch(request);
    }
  },
};
```

La difference cle : l'heuristique verifie `Sec-Fetch-Dest` (que TOUS les vrais navigateurs envoient). Si ce header est absent et que la requete demande du HTML, c'est un bot/unfurler. Ca couvre iMessage, WhatsApp, opengraph.xyz, et tout outil de preview.

---

### 2. Ce que je vais modifier dans le code (deploiement automatique)

**Fichier `supabase/functions/prerender/index.ts`** :
- Ameliorer la description par defaut : `"{NomDuPro} — Reservez en ligne facilement."` quand le pro n'a rien configure
- S'assurer que l'image OG utilise en priorite : cover > logo > image par defaut

**Fichier `src/components/dashboard/SEOSection.tsx`** :
- Ajouter un **apercu de partage** (style lien par message) sous l'apercu Google existant, montrant titre + description + image tels qu'ils apparaitront sur iMessage/WhatsApp
- Renommer les labels pour que ce soit clair : ces champs servent aussi pour les previews de liens
- Afficher l'image de couverture actuelle dans l'apercu (ou indiquer qu'il faut en ajouter une)

**Fichier `src/types/customization.ts`** : aucun changement necessaire, les champs `seo.title`, `seo.description` et `cover_url` existent deja.

---

### Resume simple

- **Toi** : tu copies le code ci-dessus dans Cloudflare et tu cliques Deploy
- **Moi** : je mets a jour le prerender + la section SEO du dashboard
- **Resultat** : les liens partages afficheront le nom du pro, sa description et son image. Le pro peut tout personnaliser depuis Dashboard > Ma Page > SEO

