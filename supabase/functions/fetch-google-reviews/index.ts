import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Extract a Place ID from a Google Maps URL, or return the input if it already looks like a Place ID.
 * Supports formats:
 *   - ChIJ... (raw Place ID)
 *   - https://maps.google.com/...?cid=... 
 *   - https://www.google.com/maps/place/...
 *   - https://g.co/... short links
 */
function extractPlaceId(input: string): string | null {
  const trimmed = input.trim();

  // Already a Place ID
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
 * Extract business name from a Google Maps URL for text search fallback.
 * e.g. https://www.google.com/maps/place/My+Business+Name/...
 */
function extractBusinessName(url: string): string | null {
  const match = url.match(/\/maps\/place\/([^/@]+)/);
  if (match) {
    return decodeURIComponent(match[1].replace(/\+/g, ' '));
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

    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return new Response(
        JSON.stringify({ error: "URL ou Place ID requis." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Fetching Google reviews for input:", url);

    let placeId = extractPlaceId(url);

    // If no Place ID found directly, try to resolve via Text Search
    if (!placeId) {
      const businessName = extractBusinessName(url);
      if (businessName) {
        console.log("No Place ID found, searching by business name:", businessName);
        const searchRes = await fetch(
          `https://places.googleapis.com/v1/places:searchText`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
              "X-Goog-FieldMask": "places.id",
            },
            body: JSON.stringify({ textQuery: businessName }),
          }
        );

        if (searchRes.ok) {
          const searchData = await searchRes.json();
          if (searchData.places?.length > 0) {
            placeId = searchData.places[0].id;
            console.log("Found Place ID via text search:", placeId);
          }
        }
      }

      // Last resort: try to follow the URL to get the final resolved URL with Place ID
      if (!placeId) {
        try {
          console.log("Trying to resolve URL by following redirects...");
          const resolveRes = await fetch(url, { redirect: "follow", headers: { "User-Agent": "Mozilla/5.0" } });
          const finalUrl = resolveRes.url;
          await resolveRes.text(); // consume body
          console.log("Resolved URL:", finalUrl);
          placeId = extractPlaceId(finalUrl);
          
          // Try business name from resolved URL
          if (!placeId) {
            const resolvedName = extractBusinessName(finalUrl);
            if (resolvedName) {
              const searchRes2 = await fetch(
                `https://places.googleapis.com/v1/places:searchText`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
                    "X-Goog-FieldMask": "places.id",
                  },
                  body: JSON.stringify({ textQuery: resolvedName }),
                }
              );
              if (searchRes2.ok) {
                const searchData2 = await searchRes2.json();
                if (searchData2.places?.length > 0) {
                  placeId = searchData2.places[0].id;
                  console.log("Found Place ID via resolved URL text search:", placeId);
                }
              }
            }
          }
        } catch (e) {
          console.error("URL resolution failed:", e);
        }
      }
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

    console.log("Success - Rating:", rating, "Count:", reviewCount);

    return new Response(
      JSON.stringify({ success: true, rating, reviewCount }),
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
