/**
 * Cloudflare Worker — Bot-aware prerender proxy for CleaningPage
 * 
 * HOW IT WORKS:
 * 1. Detects if the request comes from a bot/crawler (Google, Facebook, Twitter, iMessage, WhatsApp, etc.)
 * 2. If bot → fetches pre-rendered HTML from the Supabase Edge Function (with full SEO meta tags)
 * 3. If human → passes through to the normal SPA (Lovable origin)
 * 
 * SETUP:
 * 1. Go to Cloudflare Dashboard → Workers & Pages → Create Worker
 * 2. Paste this code
 * 3. Add a route: cleaningpage.com/* and www.cleaningpage.com/*
 * 4. Make sure DNS records are Proxied (orange cloud), NOT DNS-only
 * 5. SSL/TLS mode must be "Full"
 */

const PRERENDER_FUNCTION_URL = 'https://obkafavlsimcqiohyigs.supabase.co/functions/v1/prerender';

// Bot user-agent patterns
const BOT_AGENTS = [
  // Search engines
  'googlebot', 'bingbot', 'yandexbot', 'duckduckbot', 'baiduspider', 'slurp',
  'sogou', 'exabot', 'ia_archiver', 'archive.org_bot', 'petalbot', 'seznambot',
  'mediapartners-google', 'adsbot-google', 'apis-google', 'google-inspectiontool',
  'google-adwords', 'chrome-lighthouse', 'google-structured-data-testing-tool',
  // Social media & messaging
  'facebookexternalhit', 'facebookcatalog', 'facebot',
  'twitterbot', 'linkedinbot',
  'whatsapp', 'telegrambot', 'discordbot', 'slackbot',
  'viber', 'line', 'kakaotalk',
  // Apple
  'applebot',
  // SEO tools & validators
  'semrushbot', 'ahrefsbot', 'mj12bot', 'rogerbot',
  'w3c_validator', 'w3c-checklink',
  // Content platforms
  'pinterest', 'embedly', 'quora link preview', 'showyoubot',
  'outbrain', 'vkshare', 'redditbot',
  // OG preview tools & link unfurlers
  'opengraph', 'ogbot', 'linkpreview', 'link-preview',
  'metatags', 'meta-tags', 'url-preview',
  'iframely', 'urlpreview',
  // Generic patterns
  'preview', 'crawler', 'spider', 'bot/', 'bot;',
  'fetch/', 'fetchurl', 'curl/', 'wget/',
  'python-requests', 'python-urllib', 'go-http-client',
  'http.rb', 'node-fetch', 'axios/',
  'headlesschrome', 'phantomjs',
];

// Routes that should NEVER go to prerender (dashboard, API, static assets)
const BYPASS_PATTERNS = [
  '/dashboard',
  '/auth',
  '/complete-signup',
  '/deposit',
  '/accept-quote',
  '/assets/',
  '/src/',
  '/_',
  '/favicon',
  '/robots.txt',
  '/sitemap',
  '/og-image',
  '.js',
  '.css',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.svg',
  '.ico',
  '.woff',
  '.woff2',
  '.ttf',
  '.map',
  '.json',
];

// Known SPA routes that are NOT center slugs
const SPA_ONLY_ROUTES = [
  '/presentation',
  '/booking',
];

function isBot(userAgent) {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return BOT_AGENTS.some(bot => ua.includes(bot));
}

function shouldBypass(pathname) {
  return BYPASS_PATTERNS.some(pattern => pathname.includes(pattern));
}

function isSpaOnlyRoute(pathname) {
  return SPA_ONLY_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Additional heuristic: detect non-browser requests that are likely bots/unfurlers
 * Many link preview services don't identify themselves clearly in User-Agent
 * but they typically don't send cookies, don't accept complex content types, etc.
 */
function isLikelyBotRequest(request) {
  const accept = request.headers.get('accept') || '';
  const cookie = request.headers.get('cookie') || '';
  const referer = request.headers.get('referer') || '';
  const secFetchMode = request.headers.get('sec-fetch-mode') || '';
  
  // Real browsers send sec-fetch-mode, bots typically don't
  if (!secFetchMode && !cookie && !referer) {
    // If accept header doesn't include typical browser patterns
    if (!accept.includes('text/css') && !accept.includes('application/javascript')) {
      return true;
    }
  }
  return false;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const userAgent = request.headers.get('user-agent') || '';

    // Never prerender dashboard, auth, static assets, etc.
    if (shouldBypass(pathname)) {
      return fetch(request);
    }

    // Never prerender SPA-only routes
    if (isSpaOnlyRoute(pathname)) {
      return fetch(request);
    }

    // Check if this is a bot via user-agent OR heuristics
    const detectedBot = isBot(userAgent);
    const likelyBot = isLikelyBotRequest(request);
    
    if (!detectedBot && !likelyBot) {
      return fetch(request);
    }

    // Routes eligible for prerender: /, /confidentialite, /cgu, /mentions-legales, /{slug}
    const prerenderPath = pathname === '/' ? '/' : pathname;

    try {
      const prerenderUrl = `${PRERENDER_FUNCTION_URL}?path=${encodeURIComponent(prerenderPath)}`;
      
      const prerenderResponse = await fetch(prerenderUrl, {
        method: 'GET',
        headers: {
          'User-Agent': userAgent,
        },
      });

      // If prerender returns 404, it means the slug doesn't exist — fall back to origin
      if (prerenderResponse.status === 404) {
        return fetch(request);
      }

      // If prerender fails for other reasons, fall back to origin
      if (!prerenderResponse.ok) {
        console.log(`Prerender returned ${prerenderResponse.status} for ${prerenderPath}, falling back to origin`);
        return fetch(request);
      }

      // Return prerendered HTML with appropriate headers
      const html = await prerenderResponse.text();
      
      return new Response(html, {
        status: prerenderResponse.status,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=3600, s-maxage=86400',
          'X-Prerendered': 'true',
          'X-Robots-Tag': 'index, follow',
          'X-Bot-Detected': detectedBot ? 'user-agent' : 'heuristic',
        },
      });
    } catch (error) {
      // If anything fails, serve the SPA as fallback (fail-open)
      console.error('Prerender error:', error.message);
      return fetch(request);
    }
  },
};
