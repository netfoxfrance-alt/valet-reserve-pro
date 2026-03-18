import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Extract Place ID from various Google Maps URL formats
function extractPlaceId(url: string): string | null {
  // Direct place_id in URL: ?placeid=XXX or data=...!1sXXX
  const placeIdMatch = url.match(/place_id[=:]([A-Za-z0-9_-]+)/i);
  if (placeIdMatch) return placeIdMatch[1];

  // From data parameter: !1sChIJ... pattern
  const dataMatch = url.match(/!1s(ChIJ[A-Za-z0-9_-]+)/);
  if (dataMatch) return dataMatch[1];

  // From CID in hex: !1s0x...
  const cidMatch = url.match(/!1s(0x[0-9a-f]+:[0-9a-fx]+)/i);
  if (cidMatch) return null; // CID, not place ID

  return null;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return new Response(
        JSON.stringify({ error: "URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Fetching Google reviews for URL:", url);

    // Fetch the Google page
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch Google page:", response.status);
      return new Response(
        JSON.stringify({ error: `Failed to fetch page (${response.status})` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const html = await response.text();
    let rating: number | null = null;
    let reviewCount: number | null = null;

    // ── Strategy 1: Look for meta tags and og: data ──
    // Google Maps pages often have meta content with rating info
    const metaPatterns = [
      // og:description or meta description often contains "Note : X,Y/5" or "Rating: X.Y"
      /content="[^"]*?(\d[.,]\d)\s*(?:\/5|sur 5|stars?|étoiles?)[^"]*?(\d[\d\s.,]*)\s*(?:avis|reviews?)/i,
      /content="[^"]*?(?:Note|Rating)[^"]*?(\d[.,]\d)[^"]*?(\d[\d\s.,]*)\s*(?:avis|reviews?)/i,
    ];
    
    for (const pattern of metaPatterns) {
      const match = html.match(pattern);
      if (match) {
        const r = parseFloat(match[1].replace(",", "."));
        if (r >= 1 && r <= 5) {
          rating = Math.round(r * 10) / 10;
          const raw = match[2].replace(/[\s.]/g, "").replace(",", "");
          const c = parseInt(raw, 10);
          if (c > 0) reviewCount = c;
          console.log("Found from meta:", rating, reviewCount);
          break;
        }
      }
    }

    // ── Strategy 2: Schema.org / JSON-LD ──
    if (rating === null || reviewCount === null) {
      const jsonLdMatches = html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
      for (const m of jsonLdMatches) {
        try {
          const jsonData = JSON.parse(m[1]);
          const items = Array.isArray(jsonData) ? jsonData : [jsonData];
          for (const item of items) {
            const aggRating = item.aggregateRating || item?.mainEntity?.aggregateRating;
            if (aggRating) {
              if (rating === null && aggRating.ratingValue) {
                rating = parseFloat(String(aggRating.ratingValue).replace(",", "."));
                if (rating >= 1 && rating <= 5) {
                  rating = Math.round(rating * 10) / 10;
                  console.log("Found rating from JSON-LD:", rating);
                }
              }
              if (reviewCount === null && (aggRating.reviewCount || aggRating.ratingCount)) {
                reviewCount = parseInt(String(aggRating.reviewCount || aggRating.ratingCount), 10);
                console.log("Found count from JSON-LD:", reviewCount);
              }
            }
          }
        } catch {
          // skip
        }
      }
    }

    // ── Strategy 3: Standard regex patterns on HTML ──
    if (rating === null) {
      const ratingPatterns = [
        /"ratingValue"\s*:\s*"?(\d[.,]\d)"?/i,
        /data-rating="(\d[.,]\d)"/i,
        /(\d[.,]\d)\s*(?:étoiles?|stars?|sur 5)/i,
        /aria-label="[^"]*?(\d[.,]\d)\s*(?:sur|out of)\s*5/i,
        /[Nn]ote\s*[:\s]+(\d[.,]\d)/,
        /[Rr]ated?\s+(\d[.,]\d)/,
        /(\d[.,]\d)\s*(?:sur|\/)\s*5/i,
      ];

      for (const pattern of ratingPatterns) {
        const match = html.match(pattern);
        if (match) {
          const val = parseFloat(match[1].replace(",", "."));
          if (val >= 1 && val <= 5) {
            rating = Math.round(val * 10) / 10;
            console.log("Found rating (regex):", rating);
            break;
          }
        }
      }
    }

    if (reviewCount === null) {
      const countPatterns = [
        /(\d[\d\s.,]*\d|\d)\s*(?:avis|reviews?|commentaires?)/i,
        /"reviewCount"\s*:\s*"?(\d+)"?/i,
        /"userRatingCount"\s*:\s*"?(\d+)"?/i,
        /\((\d[\d\s.,]*\d|\d)\s*(?:avis|reviews?)?\)/i,
      ];

      for (const pattern of countPatterns) {
        const match = html.match(pattern);
        if (match) {
          const raw = match[1].replace(/[\s.]/g, "").replace(",", "");
          const parsed = parseInt(raw, 10);
          if (parsed > 0 && parsed < 1000000) {
            reviewCount = parsed;
            console.log("Found count (regex):", reviewCount);
            break;
          }
        }
      }
    }

    // ── Strategy 4: Google Maps JS inline data - look for rating near count ──
    if (rating === null && reviewCount !== null) {
      // The pattern often is: X.Y followed by some markup then (COUNT)
      const nearCountPattern = new RegExp(`(\\d[.,]\\d)\\s*[^\\d]{0,100}\\(?\\s*${reviewCount}`);
      const nearMatch = html.match(nearCountPattern);
      if (nearMatch) {
        const val = parseFloat(nearMatch[1].replace(",", "."));
        if (val >= 1 && val <= 5) {
          rating = Math.round(val * 10) / 10;
          console.log("Found rating near count:", rating);
        }
      }
    }

    // ── Strategy 5: Parse Google Maps window.__WIZ_DATA or AF_initDataCallback data ──
    if (rating === null) {
      // Google Maps embeds data in AF_initDataCallback calls
      // Look for patterns like: ,[4.7,  or ,"4.7", near review-related data
      const wizMatches = html.matchAll(/AF_initDataCallback\(\{[^}]*data:([\s\S]*?)\}\);/g);
      for (const wm of wizMatches) {
        const dataStr = wm[1];
        // Look for a rating value (X.Y where 1<=X<=5)  
        const rMatch = dataStr.match(/,(\d\.\d),\d+,/);
        if (rMatch) {
          const val = parseFloat(rMatch[1]);
          if (val >= 1 && val <= 5) {
            rating = Math.round(val * 10) / 10;
            console.log("Found rating from AF_initDataCallback:", rating);
            break;
          }
        }
      }
    }

    // ── Strategy 6: Broad span/text matching ──
    if (rating === null) {
      const broadMatch = html.match(/>(\d[.,]\d)<\/span>/g);
      if (broadMatch) {
        for (const m of broadMatch) {
          const numMatch = m.match(/>(\d[.,]\d)</);
          if (numMatch) {
            const val = parseFloat(numMatch[1].replace(",", "."));
            if (val >= 1 && val <= 5) {
              rating = Math.round(val * 10) / 10;
              console.log("Found rating (broad span):", rating);
              break;
            }
          }
        }
      }
    }

    if (rating === null && reviewCount === null) {
      console.log("Could not extract review data. HTML length:", html.length);
      // Log a larger snippet for debugging
      const snippet = html.substring(0, 1500);
      console.log("HTML snippet:", snippet);
      return new Response(
        JSON.stringify({ 
          error: "Impossible d'extraire les données d'avis. Vous pouvez saisir la note manuellement.",
          rating: null,
          reviewCount: null,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Successfully extracted - Rating:", rating, "Count:", reviewCount);

    return new Response(
      JSON.stringify({ 
        success: true, 
        rating,
        reviewCount,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error fetching Google reviews:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
