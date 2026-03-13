import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Extract a Place ID from a Google Maps URL, or return the input if it already looks like a Place ID.
 */
function extractPlaceId(input: string): string | null {
  const trimmed = input.trim();

  // Already a Place ID (ChIJ format)
  if (/^ChIJ[A-Za-z0-9_-]+$/.test(trimmed)) {
    return trimmed;
  }

  // From data parameter: !1sChIJ... pattern  
  const dataMatch = trimmed.match(/!1s(ChIJ[A-Za-z0-9_-]+)/);
  if (dataMatch) return dataMatch[1];

  // place_id in URL params
  const placeIdParam = trimmed.match(/place_id[=:](ChIJ[A-Za-z0-9_-]+)/i);
  if (placeIdParam) return placeIdParam[1];

  return null;
}

/**
 * Extract business name from various Google URL formats.
 */
function extractBusinessName(url: string): string | null {
  try {
    let targetUrl = url;

    // If it's a /sorry/ CAPTCHA page, get the real URL from `continue` param
    if (url.includes('/sorry/index')) {
      const urlObj = new URL(url);
      const continueUrl = urlObj.searchParams.get('continue');
      if (continueUrl) {
        targetUrl = continueUrl;
      }
    }

    // From Google Maps: /maps/place/Business+Name/...
    const mapsMatch = targetUrl.match(/\/maps\/place\/([^/@?]+)/);
    if (mapsMatch) {
      return decodeURIComponent(mapsMatch[1].replace(/\+/g, ' '));
    }

    // From Google Search URL: ?q=Business+Name
    const urlObj = new URL(targetUrl);
    const qParam = urlObj.searchParams.get('q');
    if (qParam) {
      return decodeURIComponent(qParam.replace(/\+/g, ' '));
    }
  } catch {
    // Not a valid URL, ignore
  }

  return null;
}

/**
 * Generate search query variations from a business name.
 * "T.S.N (Top Services Nettoyage)" → ["T.S.N (Top Services Nettoyage)", "Top Services Nettoyage", "TSN Top Services Nettoyage"]
 */
function getSearchVariations(name: string): string[] {
  const variations: string[] = [name]; // Try original first
  
  const inParens = name.match(/\(([^)]+)\)/);
  if (inParens) {
    const inside = inParens[1].trim();
    const outside = name.replace(/\([^)]+\)/, '').replace(/\./g, '').trim();
    // "Top Services Nettoyage" alone
    variations.push(inside);
    // Combine: "TSN Top Services Nettoyage"
    if (outside) variations.push(`${outside} ${inside}`);
  } else {
    // Remove dots: "T.S.N" → "TSN"
    const noDots = name.replace(/\./g, '').trim();
    if (noDots !== name) variations.push(noDots);
  }
  
  return [...new Set(variations)];
}

async function searchPlaceByTextQuery(query: string, apiKey: string): Promise<{ id: string; name: string } | null> {
  console.log("Text search query:", query);
  const searchRes = await fetch(
    `https://places.googleapis.com/v1/places:searchText`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.id,places.displayName",
      },
      body: JSON.stringify({ textQuery: query }),
    }
  );

  const searchData = await searchRes.json();
  console.log("Text search response status:", searchRes.status, "data:", JSON.stringify(searchData).substring(0, 500));
  
  if (searchRes.ok && searchData.places?.length > 0) {
    return { id: searchData.places[0].id, name: searchData.places[0].displayName?.text || query };
  }
  return null;
}

/**
 * Try multiple search variations to find the place, optionally appending city.
 */
async function searchPlaceByText(name: string, apiKey: string, city?: string): Promise<string | null> {
  const variations = getSearchVariations(name);
  // If we have a city, also try each variation + city
  const queries = city 
    ? [...variations.map(v => `${v} ${city}`), ...variations]
    : variations;
  
  for (const query of queries) {
    const result = await searchPlaceByTextQuery(query, apiKey);
    if (result) return result.id;
  }
  return null;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GOOGLE_PLACES_API_KEY = Deno.env.get("GOOGLE_PLACES_API_KEY");
    if (!GOOGLE_PLACES_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Clé API Google Places non configurée." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { url, city } = await req.json();
    if (!url || typeof url !== "string") {
      return new Response(
        JSON.stringify({ error: "URL ou Place ID requis." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const cityStr = (city && typeof city === 'string') ? city.trim() : '';
    console.log("Input:", url, "City:", cityStr);

    let placeId = extractPlaceId(url);

    // If no Place ID, try text search with business name from URL
    if (!placeId) {
      const businessName = extractBusinessName(url);
      if (businessName) {
        placeId = await searchPlaceByText(businessName, GOOGLE_PLACES_API_KEY, cityStr || undefined);
      }
    }

    // Still no Place ID - try following redirects to get resolved URL
    if (!placeId) {
      try {
        console.log("Following redirects...");
        const resolveRes = await fetch(url, { redirect: "follow", headers: { "User-Agent": "Mozilla/5.0" } });
        const finalUrl = resolveRes.url;
        await resolveRes.text();
        console.log("Resolved URL:", finalUrl);
        
        placeId = extractPlaceId(finalUrl);
        
        if (!placeId) {
          const resolvedName = extractBusinessName(finalUrl);
          if (resolvedName) {
            placeId = await searchPlaceByText(resolvedName, GOOGLE_PLACES_API_KEY, cityStr || undefined);
          }
        }
      } catch (e) {
        console.error("URL resolution failed:", e);
      }
    }

    // Last resort: use the entire input as a text search query
    if (!placeId) {
      placeId = await searchPlaceByText(url, GOOGLE_PLACES_API_KEY);
    }

    if (!placeId) {
      return new Response(
        JSON.stringify({
          error: "Impossible d'identifier l'établissement. Collez le lien de votre fiche Google Maps.",
          rating: null,
          reviewCount: null,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch place details using Places API (New)
    console.log("Fetching place details for:", placeId);
    const detailsRes = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}`,
      {
        headers: {
          "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
          "X-Goog-FieldMask": "rating,userRatingCount,displayName",
        },
      }
    );

    if (!detailsRes.ok) {
      const errText = await detailsRes.text();
      console.error("Places API error:", detailsRes.status, errText);
      return new Response(
        JSON.stringify({ error: "Erreur lors de la récupération des avis Google." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const placeData = await detailsRes.json();
    console.log("Place data:", JSON.stringify(placeData));

    const rating = placeData.rating ? Math.round(placeData.rating * 10) / 10 : null;
    const reviewCount = placeData.userRatingCount ?? null;

    if (rating === null && reviewCount === null) {
      return new Response(
        JSON.stringify({
          error: "Aucun avis trouvé pour cet établissement.",
          rating: null,
          reviewCount: null,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const name = placeData.displayName?.text || "Établissement";
    console.log("Success -", name, "Rating:", rating, "Count:", reviewCount);

    return new Response(
      JSON.stringify({ success: true, rating, reviewCount, name, placeId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erreur interne" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
