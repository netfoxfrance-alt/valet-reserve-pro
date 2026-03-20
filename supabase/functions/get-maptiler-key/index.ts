import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Allowed origins for the MapTiler key
const allowedOrigins = [
  "https://valet-reserve-pro.lovable.app",
  "https://cleaningpage.com",
  "https://www.cleaningpage.com",
  "http://localhost:5173",
  "http://localhost:8080",
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Basic origin check to reduce casual abuse
  const origin = req.headers.get("origin") || "";
  const referer = req.headers.get("referer") || "";
  const isAllowed = allowedOrigins.some(
    (o) => origin.startsWith(o) || referer.startsWith(o)
  );

  // In production, only serve to known origins
  // Allow in development or when origin headers are missing (server-side calls)
  if (!isAllowed && origin !== "" && !origin.includes("localhost") && !origin.includes("lovable.app")) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const key = Deno.env.get("MAPTILER_API_KEY");
  if (!key) {
    return new Response(JSON.stringify({ error: "MAPTILER_API_KEY not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ key }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
