interface LocationMapProps {
  latitude: number;
  longitude: number;
  radiusKm?: number;
  address?: string;
  height?: string;
  className?: string;
}

export function LocationMap({ latitude, longitude, address, height = '200px', className = '' }: LocationMapProps) {
  // Use address for better pin label, fallback to coordinates
  const query = address
    ? encodeURIComponent(address)
    : `${latitude},${longitude}`;

  return (
    <div className={`rounded-xl overflow-hidden ${className}`} style={{ height, width: '100%' }}>
      <iframe
        title="Localisation"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        src={`https://www.google.com/maps?q=${query}&z=13&output=embed`}
        allowFullScreen
      />
    </div>
  );
}
