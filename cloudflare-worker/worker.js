/**
 * Cloudflare Worker — Bot-aware prerender proxy for CleaningPage
 * 
 * Detects bots/crawlers/unfurlers and serves pre-rendered HTML from Edge Function.
 * Human visitors get the normal SPA.
 * 
 * Key: Uses Sec-Fetch-Dest header (sent by ALL modern browsers, never by bots)
 * as the primary heuristic, plus explicit User-Agent matching.
 */

const PRERENDER_FUNCTION_URL = 'https://obkafavlsimcqiohyigs.supabase.co/functions/v1/prerender';

const BOT_AGENTS = [
  // Search engines
  'googlebot', 'bingbot', 'yandexbot', 'duckduckbot', 'baiduspider', 'slurp',
  'sogou', 'exabot', 'ia_archiver', 'archive.org_bot', 'petalbot', 'seznambot',
  'mediapartners-google', 'adsbot-google', 'apis-google', 'google-inspectiontool',
  'chrome-lighthouse', 'google-structured-data-testing-tool',
  // Social media & messaging
  'facebookexternalhit', 'facebookcatalog', 'facebot',
  'twitterbot', 'linkedinbot',
  'whatsapp', 'telegrambot', 'discordbot', 'slackbot',
  'viber', 'line/', 'kakaotalk',
  // Apple
  'applebot',
  // SEO tools
  'semrushbot', 'ahrefsbot', 'mj12bot', 'rogerbot',
  'w3c_validator', 'w3c-checklink',
  // Content platforms
  'pinterest', 'embedly', 'quora link preview', 'showyoubot',
  'outbrain', 'vkshare', 'redditbot',
  // OG preview tools & link unfurlers
  'opengraph', 'ogbot', 'linkpreview', 'link-preview',
  'metatags', 'meta-tags', 'iframely',
  // Generic patterns
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
  if (secFetchDest) return false; // Real browser — pass through

  // No Sec-Fetch-Dest = likely a bot/crawler/unfurler
  const accept = (request.headers.get('accept') || '').toLowerCase();
  // If it accepts HTML or anything, it's trying to render the page
  if (accept.includes('text/html') || accept.includes('*/*') || !accept) {
    return true;
  }
  return false;
}

const SUPABASE_CALLBACK_URL = 'https://obkafavlsimcqiohyigs.supabase.co/functions/v1/google-calendar-callback';

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Proxy Google OAuth callback to Supabase edge function
    if (pathname === '/api/google/callback') {
      const targetUrl = `${SUPABASE_CALLBACK_URL}${url.search}`;
      const res = await fetch(targetUrl, {
        method: request.method,
        headers: request.headers,
        redirect: 'manual',
      });
      // Forward the redirect response from Supabase
      return new Response(res.body, {
        status: res.status,
        headers: res.headers,
      });
    }

    // Never prerender static assets, dashboard, auth, etc.
    if (BYPASS_PATTERNS.some(p => pathname.includes(p))) return fetch(request);
    if (SPA_ONLY_ROUTES.some(r => pathname.startsWith(r))) return fetch(request);

    const ua = request.headers.get('user-agent') || '';
    const botByUA = isBot(ua);
    const botByHeuristic = isLikelyBot(request);

    // Not a bot — serve normal SPA
    if (!botByUA && !botByHeuristic) return fetch(request);

    try {
      const res = await fetch(
        `${PRERENDER_FUNCTION_URL}?path=${encodeURIComponent(pathname)}`,
        { headers: { 'User-Agent': ua } }
      );

      // If prerender fails or 404, fall back to origin SPA
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
      // Fail-open: serve normal SPA
      return fetch(request);
    }
  },
};
