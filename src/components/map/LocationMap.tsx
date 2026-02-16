import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LocationMapProps {
  latitude: number;
  longitude: number;
  radiusKm?: number;
  accentColor?: string;
  height?: string;
  className?: string;
}

export function LocationMap({ latitude, longitude, radiusKm, accentColor = '#3b82f6', height = '200px', className = '' }: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Cleanup previous instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapRef.current, {
      center: [latitude, longitude],
      zoom: radiusKm ? Math.max(8, 13 - Math.log2(radiusKm)) : 13,
      zoomControl: false,
      attributionControl: false,
      dragging: true,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
    }).addTo(map);

    // Custom marker
    const markerIcon = L.divIcon({
      html: `<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="${accentColor}" stroke="white" stroke-width="1.5">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
          <circle cx="12" cy="9" r="2.5" fill="white"/>
        </svg>
      </div>`,
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 28],
    });

    L.marker([latitude, longitude], { icon: markerIcon }).addTo(map);

    // Radius circle
    if (radiusKm && radiusKm > 0) {
      L.circle([latitude, longitude], {
        radius: radiusKm * 1000,
        color: accentColor,
        fillColor: accentColor,
        fillOpacity: 0.08,
        weight: 1.5,
        dashArray: '6 4',
      }).addTo(map);
    }

    mapInstanceRef.current = map;

    // Small delay to fix rendering
    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [latitude, longitude, radiusKm, accentColor]);

  return (
    <div
      ref={mapRef}
      className={`rounded-xl overflow-hidden ${className}`}
      style={{ height, width: '100%' }}
    />
  );
}
