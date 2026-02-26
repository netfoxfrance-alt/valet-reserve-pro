import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

    // Try multiple patterns to extract rating and review count from Google pages
    let rating: number | null = null;
    let reviewCount: number | null = null;

    // Pattern 1: Google Maps/Search structured data - rating
    // Look for patterns like "4,7" or "4.7" near star/review indicators
    const ratingPatterns = [
      // Google Maps: "4,7 étoiles" or "4.7 stars"
      /(\d[.,]\d)\s*(?:étoiles?|stars?|sur 5)/i,
      // Google Search knowledge panel: aria-label with rating
      /aria-label="[^"]*?(\d[.,]\d)\s*(?:sur|out of)\s*5/i,
      // Schema.org ratingValue
      /"ratingValue"\s*:\s*"?(\d[.,]\d)"?/i,
      // Google Maps data attribute
      /data-rating="(\d[.,]\d)"/i,
      // Broad pattern: X,Y or X.Y followed by review count context
      /class="[^"]*"[^>]*>(\d[.,]\d)<\/span>\s*<span[^>]*>\s*\(\s*\d/,
      // aria-label patterns
      /(\d[.,]\d)\s*(?:sur|\/)\s*5/i,
      // Direct rating display
      />(\d[.,]\d)<\/span>/,
    ];

    for (const pattern of ratingPatterns) {
      const match = html.match(pattern);
      if (match) {
        rating = parseFloat(match[1].replace(",", "."));
        if (rating >= 1 && rating <= 5) {
          console.log("Found rating:", rating, "with pattern:", pattern.source.substring(0, 40));
          break;
        }
        rating = null;
      }
    }

    // Pattern 2: Review count
    const countPatterns = [
      // "123 avis" or "1 234 avis" or "1,234 reviews"
      /(\d[\d\s.,]*\d|\d)\s*(?:avis|reviews?|commentaires?|opinions?)/i,
      // Schema.org reviewCount
      /"reviewCount"\s*:\s*"?(\d+)"?/i,
      // "(123)" near rating
      /\((\d[\d\s.,]*\d|\d)\)/,
      // Google Maps: "X avis Google"
      /(\d[\d\s.,]*\d|\d)\s*avis\s*Google/i,
      // userRatingCount
      /"userRatingCount"\s*:\s*"?(\d+)"?/i,
    ];

    for (const pattern of countPatterns) {
      const match = html.match(pattern);
      if (match) {
        // Remove spaces, dots, commas used as thousand separators
        const raw = match[1].replace(/[\s.]/g, "").replace(",", "");
        const parsed = parseInt(raw, 10);
        if (parsed > 0 && parsed < 1000000) {
          reviewCount = parsed;
          console.log("Found review count:", reviewCount, "with pattern:", pattern.source.substring(0, 40));
          break;
        }
      }
    }

    // If we couldn't find structured data, try JSON-LD
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
                console.log("Found rating from JSON-LD:", rating);
              }
              if (reviewCount === null && (aggRating.reviewCount || aggRating.ratingCount)) {
                reviewCount = parseInt(String(aggRating.reviewCount || aggRating.ratingCount), 10);
                console.log("Found count from JSON-LD:", reviewCount);
              }
            }
          }
        } catch {
          // Invalid JSON-LD, skip
        }
      }
    }

    if (rating === null && reviewCount === null) {
      console.log("Could not extract review data from page. HTML length:", html.length);
      // Log a snippet for debugging
      console.log("HTML snippet:", html.substring(0, 500));
      return new Response(
        JSON.stringify({ 
          error: "Impossible d'extraire les données d'avis depuis cette URL. Vérifiez que c'est bien un lien Google Maps ou Google Business.",
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
        rating: rating, 
        reviewCount: reviewCount,
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
