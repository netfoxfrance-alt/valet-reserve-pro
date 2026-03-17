import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BASE_URL = 'https://www.cleaningpage.com';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.searchParams.get('path') || '/';

    // Route to the correct renderer
    if (path === '/') {
      return renderHomePage();
    } else if (path === '/confidentialite') {
      return renderLegalPage('Politique de confidentialité', 'Politique de confidentialité de CleaningPage.');
    } else if (path === '/cgu') {
      return renderLegalPage("Conditions Générales d'Utilisation", "Conditions générales d'utilisation de CleaningPage.");
    } else if (path === '/mentions-legales') {
      return renderLegalPage('Mentions légales', 'Mentions légales de CleaningPage.');
    } else {
      // Treat as center slug (remove leading /)
      const slug = path.replace(/^\//, '');
      if (slug && !slug.includes('/')) {
        return await renderCenterPage(slug);
      }
      return renderNotFound();
    }
  } catch (error) {
    console.error('Prerender error:', error);
    return new Response('Internal Server Error', { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' } 
    });
  }
});

// ============================================================
// HOME PAGE
// ============================================================
function renderHomePage(): Response {
  const title = 'CleaningPage - Tout votre service de nettoyage, dans un seul lien.';
  const description = 'Créez votre page de réservation en ligne en quelques minutes. Agenda, clients, factures, formules — tout est inclus. Essai gratuit 30 jours.';

  const html = wrapHtml({
    title,
    description,
    canonical: BASE_URL,
    ogImage: `${BASE_URL}/og-image.png`,
    body: `
      <header>
        <h1>CleaningPage</h1>
        <p>Tout votre service de nettoyage, dans un seul lien.</p>
      </header>
      <main>
        <section>
          <h2>Votre page pro de réservation en quelques minutes</h2>
          <p>Vos clients réservent en ligne, 24h/24. Vous gérez tout depuis un seul tableau de bord.</p>
          <ul>
            <li>Réservations en ligne automatisées</li>
            <li>Agenda synchronisé avec Google Calendar</li>
            <li>Gestion des clients et historique</li>
            <li>Facturation et devis professionnels</li>
            <li>Statistiques et suivi du chiffre d'affaires</li>
            <li>Page personnalisable avec votre marque</li>
            <li>Formules et tarifs configurables</li>
            <li>Demandes de devis avec photos</li>
          </ul>
        </section>

        <section>
          <h2>Fonctionnalités</h2>
          <ul>
            <li><strong>Réservations</strong> — Vos clients réservent en ligne 24h/24. Confirmez en un clic.</li>
            <li><strong>Agenda</strong> — Vue calendrier avec synchronisation Google Agenda.</li>
            <li><strong>Ma Page</strong> — Votre vitrine professionnelle personnalisable avec vos couleurs, logo et formules.</li>
            <li><strong>Factures &amp; Devis</strong> — Créez et envoyez des factures et devis professionnels.</li>
            <li><strong>Clients</strong> — Fichier client complet avec historique des prestations.</li>
            <li><strong>Formules</strong> — Créez vos packs et tarifs avec variantes de prix par véhicule.</li>
            <li><strong>Demandes</strong> — Recevez des demandes de devis avec photos jointes.</li>
            <li><strong>Statistiques</strong> — Suivez votre CA, vos réservations et votre croissance.</li>
          </ul>
        </section>

        <section>
          <h2>Tarif</h2>
          <p><strong>39€/mois</strong> — Tout inclus, sans engagement. Essai gratuit 30 jours.</p>
          <ul>
            <li>Page de réservation personnalisée</li>
            <li>Réservations illimitées</li>
            <li>Gestion clients et agenda</li>
            <li>Factures et devis</li>
            <li>Statistiques détaillées</li>
            <li>Support prioritaire</li>
          </ul>
        </section>

        <section>
          <h2>Questions fréquentes</h2>
          <dl>
            <dt>Est-ce que je peux essayer gratuitement ?</dt>
            <dd>Oui, vous bénéficiez de 30 jours d'essai gratuit, sans engagement et sans carte bancaire requise à l'inscription.</dd>
            <dt>Pour quels types de services est-ce adapté ?</dt>
            <dd>CleaningPage est conçu pour tous les professionnels du nettoyage : auto, bâtiment, vitres, canapés, terrasses, et bien plus.</dd>
            <dt>Mes clients doivent-ils créer un compte ?</dt>
            <dd>Non, vos clients réservent directement depuis votre page sans avoir besoin de compte.</dd>
            <dt>Puis-je personnaliser ma page ?</dt>
            <dd>Oui, vous pouvez personnaliser les couleurs, le logo, la bannière, les formules affichées, et ajouter des blocs (galerie, avis Google, horaires, etc.).</dd>
            <dt>Comment fonctionne la facturation ?</dt>
            <dd>Vous pouvez créer des factures et devis directement depuis votre tableau de bord, avec TVA configurable et envoi par email.</dd>
          </dl>
        </section>
      </main>
      <footer>
        <p>&copy; ${new Date().getFullYear()} CleaningPage. Tous droits réservés.</p>
        <nav>
          <a href="${BASE_URL}/mentions-legales">Mentions légales</a>
          <a href="${BASE_URL}/confidentialite">Politique de confidentialité</a>
          <a href="${BASE_URL}/cgu">Conditions générales d'utilisation</a>
        </nav>
      </footer>
    `,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      'name': 'CleaningPage',
      'applicationCategory': 'BusinessApplication',
      'operatingSystem': 'Web',
      'description': description,
      'url': BASE_URL,
      'offers': {
        '@type': 'Offer',
        'price': '39',
        'priceCurrency': 'EUR',
        'priceValidUntil': `${new Date().getFullYear() + 1}-12-31`,
      },
    },
  });

  return new Response(html, {
    headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
}

// ============================================================
// CENTER PAGE
// ============================================================
async function renderCenterPage(slug: string): Promise<Response> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Fetch center data
  const { data: center, error } = await supabase
    .from('centers')
    .select('id, name, slug, address, phone, email, customization, logo_url, subscription_plan')
    .eq('slug', slug)
    .single();

  if (error || !center) {
    return renderNotFound();
  }

  // Fetch packs for this center
  const { data: packs } = await supabase
    .from('packs')
    .select('name, description, price, features, duration, pricing_type, price_variants')
    .eq('center_id', center.id)
    .eq('active', true)
    .order('sort_order', { ascending: true });

  // Fetch availability for opening hours
  const { data: availability } = await supabase
    .from('availability')
    .select('day_of_week, start_time, end_time, enabled')
    .eq('center_id', center.id)
    .eq('enabled', true)
    .order('day_of_week', { ascending: true });

  // Parse customization
  const customization = (center.customization as Record<string, any>) || {};
  const seo = customization.seo || {};
  const texts = customization.texts || {};
  const coverUrl = customization.cover_url || null;

  // SEO data with rich defaults
  const centerName = center.name || 'Centre de nettoyage';
  const city = seo.city || '';
  const tagline = texts.tagline || '';
  
  // Title: custom > generated
  const seoTitle = seo.title || `${centerName}${city ? ` à ${city}` : ''} — Réservez en ligne facilement.`;
  
  // Description: custom > tagline > rich generated
  let seoDescription = seo.description;
  if (!seoDescription) {
    if (tagline) {
      seoDescription = tagline;
    } else {
      seoDescription = `${centerName}${city ? ` à ${city}` : ''} — Réservez en ligne facilement.`;
    }
  }
  
  const seoKeywords = seo.keywords || '';
  const canonical = `${BASE_URL}/${slug}`;
  // OG image priority: cover > logo > default
  const ogImage = coverUrl || center.logo_url || `${BASE_URL}/og-image.png`;

  // Build packs HTML
  let packsHtml = '';
  if (packs && packs.length > 0) {
    packsHtml = '<section><h2>Nos formules</h2><ul>';
    for (const pack of packs) {
      packsHtml += `<li><strong>${escapeHtml(pack.name)}</strong>`;
      if (pack.price) packsHtml += ` — ${pack.price}€`;
      if (pack.duration) packsHtml += ` (${escapeHtml(pack.duration)})`;
      if (pack.description) packsHtml += `<br>${escapeHtml(pack.description)}`;
      if (pack.features && pack.features.length > 0) {
        packsHtml += '<ul>';
        for (const f of pack.features) {
          packsHtml += `<li>${escapeHtml(f)}</li>`;
        }
        packsHtml += '</ul>';
      }
      // Price variants
      if (pack.pricing_type === 'variable' && pack.price_variants) {
        const variants = Array.isArray(pack.price_variants) ? pack.price_variants : [];
        if (variants.length > 0) {
          packsHtml += '<ul>';
          for (const v of variants) {
            const vObj = v as Record<string, any>;
            packsHtml += `<li>${escapeHtml(vObj.label || '')} : ${vObj.price || ''}€</li>`;
          }
          packsHtml += '</ul>';
        }
      }
      packsHtml += '</li>';
    }
    packsHtml += '</ul></section>';
  }

  // Build availability/hours HTML
  const DAYS_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const DAYS_SCHEMA = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  let hoursHtml = '';
  const openingHoursSpec: Record<string, any>[] = [];
  if (availability && availability.length > 0) {
    hoursHtml = '<section><h2>Horaires</h2><ul>';
    for (const slot of availability) {
      const start = (slot.start_time as string).slice(0, 5);
      const end = (slot.end_time as string).slice(0, 5);
      hoursHtml += `<li>${DAYS_FR[slot.day_of_week]} : ${start} - ${end}</li>`;
      openingHoursSpec.push({
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': DAYS_SCHEMA[slot.day_of_week],
        'opens': start,
        'closes': end,
      });
    }
    hoursHtml += '</ul></section>';
  }

  // JSON-LD LocalBusiness
  const structuredData: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    'name': centerName,
    'url': canonical,
    '@id': canonical,
    'additionalType': 'https://schema.org/CleaningService',
    'serviceType': 'Nettoyage professionnel',
  };

  if (seoDescription) structuredData.description = seoDescription;
  if (center.logo_url) structuredData.image = center.logo_url;
  if (center.phone) structuredData.telephone = center.phone;
  if (center.email) structuredData.email = center.email;

  if (center.address) {
    structuredData.address = {
      '@type': 'PostalAddress',
      'streetAddress': center.address,
      ...(city && { 'addressLocality': city }),
      'addressCountry': 'FR',
    };
  }

  if (city) {
    structuredData.areaServed = { '@type': 'City', 'name': city };
  }

  if (openingHoursSpec.length > 0) {
    structuredData.openingHoursSpecification = openingHoursSpec;
  }

  // Build offers for structured data
  if (packs && packs.length > 0) {
    structuredData.hasOfferCatalog = {
      '@type': 'OfferCatalog',
      'name': 'Services de nettoyage',
      'itemListElement': packs.map(p => ({
        '@type': 'Offer',
        'itemOffered': {
          '@type': 'Service',
          'name': p.name,
          ...(p.description && { 'description': p.description }),
        },
        'price': String(p.price),
        'priceCurrency': 'EUR',
      })),
    };
  }

  const body = `
    <header>
      <h1>${escapeHtml(centerName)}</h1>
      ${texts.tagline ? `<p>${escapeHtml(texts.tagline)}</p>` : ''}
    </header>
    <main>
      ${center.address ? `<section><h2>Adresse</h2><p>${escapeHtml(center.address)}</p></section>` : ''}
      ${center.phone ? `<section><h2>Téléphone</h2><p><a href="tel:${escapeHtml(center.phone)}">${escapeHtml(center.phone)}</a></p></section>` : ''}
      ${packsHtml}
      ${hoursHtml}
      <section>
        <p><a href="${canonical}">Réserver en ligne sur CleaningPage</a></p>
      </section>
    </main>
    <footer>
      <p>Propulsé par <a href="${BASE_URL}">CleaningPage</a></p>
    </footer>
  `;

  const html = wrapHtml({
    title: seoTitle,
    description: seoDescription,
    canonical,
    ogImage,
    ogSiteName: centerName,
    keywords: seoKeywords,
    body,
    structuredData,
  });

  return new Response(html, {
    headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=1800' },
  });
}

// ============================================================
// LEGAL PAGES
// ============================================================
function renderLegalPage(title: string, description: string): Response {
  const html = wrapHtml({
    title: `${title} - CleaningPage`,
    description,
    canonical: `${BASE_URL}/${title.toLowerCase().replace(/ /g, '-')}`,
    body: `
      <header><h1>${escapeHtml(title)}</h1></header>
      <main><p>${escapeHtml(description)}</p></main>
      <footer><p><a href="${BASE_URL}">Retour à CleaningPage</a></p></footer>
    `,
  });

  return new Response(html, {
    headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=86400' },
  });
}

// ============================================================
// 404
// ============================================================
function renderNotFound(): Response {
  const html = wrapHtml({
    title: 'Page introuvable - CleaningPage',
    description: 'La page demandée n\'existe pas.',
    body: `<h1>Page introuvable</h1><p><a href="${BASE_URL}">Retour à l'accueil</a></p>`,
    noindex: true,
  });

  return new Response(html, {
    status: 404,
    headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
  });
}

// ============================================================
// HTML WRAPPER
// ============================================================
interface HtmlOptions {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogSiteName?: string;
  keywords?: string;
  body: string;
  structuredData?: Record<string, any>;
  noindex?: boolean;
}

function wrapHtml(opts: HtmlOptions): string {
  const { title, description, canonical, ogImage, ogSiteName, keywords, body, structuredData, noindex } = opts;
  const siteName = ogSiteName || 'CleaningPage';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeAttr(description)}">
  ${keywords ? `<meta name="keywords" content="${escapeAttr(keywords)}">` : ''}
  <meta name="robots" content="${noindex ? 'noindex, nofollow' : 'index, follow'}">
  ${canonical ? `<link rel="canonical" href="${escapeAttr(canonical)}">` : ''}
  
  <!-- Open Graph -->
  <meta property="og:title" content="${escapeAttr(title)}">
  <meta property="og:description" content="${escapeAttr(description)}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${escapeAttr(siteName)}">
  ${canonical ? `<meta property="og:url" content="${escapeAttr(canonical)}">` : ''}
  ${ogImage ? `<meta property="og:image" content="${escapeAttr(ogImage)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">` : ''}
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeAttr(title)}">
  <meta name="twitter:description" content="${escapeAttr(description)}">
  ${ogImage ? `<meta name="twitter:image" content="${escapeAttr(ogImage)}">` : ''}
  
  ${structuredData ? `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>` : ''}
  
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #333; line-height: 1.6; }
    h1 { font-size: 1.8em; margin-bottom: 0.5em; }
    h2 { font-size: 1.3em; margin-top: 1.5em; }
    a { color: #3b82f6; }
    ul { padding-left: 1.5em; }
    dt { font-weight: bold; margin-top: 1em; }
    dd { margin-left: 0; margin-bottom: 0.5em; }
    footer { margin-top: 3em; padding-top: 1em; border-top: 1px solid #eee; font-size: 0.9em; color: #666; }
    footer a { margin-right: 1em; }
  </style>
</head>
<body>
  ${body}
</body>
</html>`;
}

// ============================================================
// UTILITIES
// ============================================================
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeAttr(str: string): string {
  return str.replace(/"/g, '&quot;').replace(/&/g, '&amp;');
}
