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

// Bot user-agent patterns (covers Google, Facebook, Twitter, iMessage, WhatsApp, LinkedIn, Telegram, Discord, Slack, etc.)
const BOT_AGENTS = [
  'googlebot',
  'bingbot',
  'yandexbot',
  'duckduckbot',
  'baiduspider',
  'slurp',           // Yahoo
  'facebookexternalhit',
  'facebookcatalog',
  'facebot',
  'twitterbot',
  'linkedinbot',
  'whatsapp',
  'telegrambot',
  'discordbot',
  'slackbot',
  'applebot',
  'pinterest',
  'semrushbot',
  'ahrefsbot',
  'mj12bot',
  'rogerbot',
  'embedly',
  'quora link preview',
  'showyoubot',
  'outbrain',
  'vkshare',
  'w3c_validator',
  'redditbot',
  'sogou',
  'exabot',
  'ia_archiver',
  'archive.org_bot',
  'petalbot',
  'seznambot',
  'mediapartners-google',  // Google Adsense
  'adsbot-google',
  'apis-google',
  'google-inspectiontool',
  'google-adwords',
  'chrome-lighthouse',
  'fetchurl',              // iMessage preview fetcher
  'viber',
  'line',
  'kakaotalk',
  'preview',               // Generic preview fetchers
  'crawler',
  'spider',
  'bot/',
  'bot;',
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
];

function isBot(userAgent) {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return BOT_AGENTS.some(bot => ua.includes(bot));
}

function shouldBypass(pathname) {
  return BYPASS_PATTERNS.some(pattern => pathname.includes(pattern));
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

    // Only prerender for bots
    if (!isBot(userAgent)) {
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

      // If prerender fails, fall back to origin
      if (!prerenderResponse.ok && prerenderResponse.status !== 404) {
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
          'X-Robots-Tag': prerenderResponse.status === 404 ? 'noindex' : 'index, follow',
        },
      });
    } catch (error) {
      // If anything fails, serve the SPA as fallback (fail-open)
      console.error('Prerender error:', error.message);
      return fetch(request);
    }
  },
};
