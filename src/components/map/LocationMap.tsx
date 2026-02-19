import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useMapTilerKey } from '@/hooks/useMapTilerKey';

interface LocationMapProps {
  latitude: number;
  longitude: number;
  radiusKm?: number;
  address?: string;
  height?: string;
  className?: string;
  darkMode?: boolean;
}

export function LocationMap({
  latitude,
  longitude,
  radiusKm,
  address,
  height = '200px',
  className = '',
  darkMode = false,
}: LocationMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const { data: apiKey, isLoading } = useMapTilerKey();

  useEffect(() => {
    if (!containerRef.current || !apiKey) return;

    // Clean up previous map
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const styleId = darkMode ? 'dataviz-dark' : 'streets-v2';

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: `https://api.maptiler.com/maps/${styleId}/style.json?key=${apiKey}`,
      center: [longitude, latitude],
      zoom: radiusKm ? getZoomForRadius(radiusKm) : 13,
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false,
    });

    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

    // Custom marker
    const markerEl = document.createElement('div');
    markerEl.innerHTML = `
      <div style="
        width: 36px; height: 36px;
        background: hsl(220, 70%, 50%);
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex; align-items: center; justify-content: center;
      ">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>
    `;

    new maplibregl.Marker({ element: markerEl })
      .setLngLat([longitude, latitude])
      .addTo(map);

    // Radius circle
    if (radiusKm && radiusKm > 0) {
      map.on('load', () => {
        const circle = createGeoJSONCircle([longitude, latitude], radiusKm);

        map.addSource('radius-circle', {
          type: 'geojson',
          data: circle,
        });

        map.addLayer({
          id: 'radius-fill',
          type: 'fill',
          source: 'radius-circle',
          paint: {
            'fill-color': 'hsl(220, 70%, 50%)',
            'fill-opacity': 0.08,
          },
        });

        map.addLayer({
          id: 'radius-border',
          type: 'line',
          source: 'radius-circle',
          paint: {
            'line-color': 'hsl(220, 70%, 50%)',
            'line-width': 2,
            'line-opacity': 0.4,
            'line-dasharray': [3, 2],
          },
        });
      });
    }

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [apiKey, latitude, longitude, radiusKm, darkMode]);

  if (isLoading || !apiKey) {
    return (
      <div
        className={`rounded-2xl overflow-hidden bg-muted animate-pulse ${className}`}
        style={{ height, width: '100%' }}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className={`rounded-2xl overflow-hidden ${className}`}
      style={{ height, width: '100%' }}
    />
  );
}

function getZoomForRadius(radiusKm: number): number {
  if (radiusKm <= 2) return 14;
  if (radiusKm <= 5) return 12;
  if (radiusKm <= 10) return 11;
  if (radiusKm <= 20) return 10;
  if (radiusKm <= 50) return 9;
  return 8;
}

function createGeoJSONCircle(center: [number, number], radiusKm: number, points = 64) {
  const coords: [number, number][] = [];
  const distanceX = radiusKm / (111.32 * Math.cos((center[1] * Math.PI) / 180));
  const distanceY = radiusKm / 110.574;

  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    const x = distanceX * Math.cos(theta);
    const y = distanceY * Math.sin(theta);
    coords.push([center[0] + x, center[1] + y]);
  }
  coords.push(coords[0]); // Close ring

  return {
    type: 'Feature' as const,
    geometry: {
      type: 'Polygon' as const,
      coordinates: [coords],
    },
    properties: {},
  };
}
