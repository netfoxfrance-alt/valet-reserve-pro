// Geocoding using Nominatim (OpenStreetMap) - free, no API key needed
export interface GeocodingResult {
  latitude: number;
  longitude: number;
  displayName: string;
}

export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'fr',
        },
      }
    );

    if (!response.ok) return null;

    const results = await response.json();
    if (!results.length) return null;

    return {
      latitude: parseFloat(results[0].lat),
      longitude: parseFloat(results[0].lon),
      displayName: results[0].display_name,
    };
  } catch {
    return null;
  }
}

export async function searchAddresses(query: string): Promise<Array<{ display_name: string; lat: string; lon: string }>> {
  if (query.length < 3) return [];
  
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=fr,be,ch,lu&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'fr',
        },
      }
    );

    if (!response.ok) return [];
    return await response.json();
  } catch {
    return [];
  }
}
