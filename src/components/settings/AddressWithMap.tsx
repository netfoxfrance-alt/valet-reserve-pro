import { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { LocationMap } from '@/components/map/LocationMap';
import { searchAddresses, geocodeAddress } from '@/lib/geocoding';
import { MapPin, Navigation, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface AddressWithMapProps {
  address: string;
  latitude: number | null;
  longitude: number | null;
  radiusKm: number;
  onAddressChange: (address: string) => void;
  onLocationChange: (lat: number | null, lng: number | null) => void;
  onRadiusChange: (radius: number) => void;
}

export function AddressWithMap({
  address,
  latitude,
  longitude,
  radiusKm,
  onAddressChange,
  onLocationChange,
  onRadiusChange,
}: AddressWithMapProps) {
  const { t } = useTranslation();
  const [suggestions, setSuggestions] = useState<Array<{ display_name: string; lat: string; lon: string }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const skipSearchRef = useRef(false);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleInputChange = useCallback((value: string) => {
    onAddressChange(value);

    if (skipSearchRef.current) {
      skipSearchRef.current = false;
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.length >= 3) {
      debounceRef.current = setTimeout(async () => {
        const results = await searchAddresses(value);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      }, 400);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [onAddressChange]);

  const handleSelectSuggestion = (suggestion: { display_name: string; lat: string; lon: string }) => {
    skipSearchRef.current = true;
    onAddressChange(suggestion.display_name);
    onLocationChange(parseFloat(suggestion.lat), parseFloat(suggestion.lon));
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleGeocode = async () => {
    if (!address) return;
    setGeocoding(true);
    const result = await geocodeAddress(address);
    if (result) {
      onLocationChange(result.latitude, result.longitude);
    }
    setGeocoding(false);
  };

  return (
    <div className="space-y-4">
      {/* Address input with autocomplete */}
      <div className="space-y-2">
        <Label htmlFor="address">{t('common.address')}</Label>
        <div ref={wrapperRef} className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="address"
                value={address}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={t('settings.addressPlaceholder') || "Saisissez votre adresse..."}
                className="pr-10"
              />
              <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
            {address && !latitude && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleGeocode}
                disabled={geocoding}
                title="Localiser sur la carte"
              >
                {geocoding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
              </Button>
            )}
          </div>

          {/* Suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-[9999] top-full mt-1 w-full bg-popover border rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectSuggestion(s)}
                  className="w-full text-left px-3 py-2.5 text-sm hover:bg-accent transition-colors flex items-start gap-2 border-b last:border-b-0"
                >
                  <MapPin className="w-3.5 h-3.5 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <span className="line-clamp-2">{s.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Map preview */}
      {latitude && longitude && (
        <div className="space-y-4">
          <LocationMap
            latitude={latitude}
            longitude={longitude}
            radiusKm={radiusKm}
            address={address}
            height="200px"
            className="shadow-sm"
          />

          {/* Radius slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{t('settings.interventionRadius') || "Rayon d'intervention"}</Label>
              <span className="text-sm font-medium text-primary">{radiusKm} km</span>
            </div>
            <Slider
              value={[radiusKm]}
              onValueChange={([v]) => onRadiusChange(v)}
              min={1}
              max={100}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              {t('settings.radiusDesc') || "Zone géographique couverte par vos interventions"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
