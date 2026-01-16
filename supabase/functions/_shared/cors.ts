// Allowed origins for CORS - production and development
const allowedOrigins = [
  'https://valet-reserve-pro.lovable.app',
  'https://cleaningpage.com',
  'https://www.cleaningpage.com',
  'http://localhost:5173',
  'http://localhost:8080',
];

export function getCorsHeaders(requestOrigin: string | null): Record<string, string> {
  // Default to first allowed origin if request origin is not in the list
  const origin = requestOrigin && allowedOrigins.some(o => requestOrigin.startsWith(o.replace('http://', '').replace('https://', '')))
    ? requestOrigin
    : allowedOrigins[0];
    
  // For now, allow all origins to avoid breaking existing functionality
  // TODO: Restrict to allowedOrigins in production
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}

// Generic error response - hides internal details
export function errorResponse(
  message: string, 
  status: number = 500,
  headers: Record<string, string> = {}
): Response {
  return new Response(
    JSON.stringify({ error: message }),
    {
      headers: { ...headers, "Content-Type": "application/json" },
      status,
    }
  );
}

// Map internal errors to safe user-facing messages
export function getSafeErrorMessage(error: unknown): { message: string; status: number } {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // Authentication errors - generic message
  if (errorMessage.includes("Authentication") || errorMessage.includes("authorization") || errorMessage.includes("token")) {
    return { message: "Session expirée. Veuillez vous reconnecter.", status: 401 };
  }
  
  // Stripe customer not found
  if (errorMessage.includes("No Stripe customer")) {
    return { message: "Aucun abonnement trouvé. Veuillez souscrire.", status: 404 };
  }
  
  // Password validation
  if (errorMessage.includes("Password must be")) {
    return { message: errorMessage, status: 400 };
  }
  
  // Missing required fields
  if (errorMessage.includes("Missing") || errorMessage.includes("required")) {
    return { message: "Données manquantes. Veuillez réessayer.", status: 400 };
  }
  
  // Default: generic error
  return { message: "Une erreur est survenue. Veuillez réessayer.", status: 500 };
}
