import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

import { CenterCustomization, defaultCustomization, migrateToBlocks } from '@/types/customization';

export interface Center {
  id: string;
  owner_id?: string; // Optional - not available in public queries for security
  slug: string;
  name: string;
  address: string | null;
  phone: string | null;
  email?: string | null; // Optional - not returned in public queries for security
  logo_url: string | null;
  welcome_message: string | null;
  ai_enabled: boolean;
  subscription_plan: 'free' | 'pro' | 'trial' | 'expired' | 'past_due';
  customization: CenterCustomization;
  ical_token?: string | null; // Token for iCal calendar sync - owner only
  latitude?: number | null;
  longitude?: number | null;
  intervention_radius_km?: number;
  created_at: string;
  updated_at: string;
}

// Helper to parse customization from DB
const parseCustomization = (data: unknown): CenterCustomization => {
  if (!data || typeof data !== 'object') return defaultCustomization;
  const parsed = data as Partial<CenterCustomization>;
  return {
    colors: { ...defaultCustomization.colors, ...(parsed.colors || {}) },
    texts: { ...defaultCustomization.texts, ...(parsed.texts || {}) },
    layout: { ...defaultCustomization.layout, ...(parsed.layout || {}) },
    social: { ...defaultCustomization.social, ...(parsed.social || {}) },
    seo: { ...defaultCustomization.seo, ...(parsed.seo || {}) },
    settings: { ...defaultCustomization.settings, ...(parsed.settings || {}) },
    cover_url: parsed.cover_url ?? null,
    gallery_images: parsed.gallery_images ?? [],
    visible_pack_ids: parsed.visible_pack_ids ?? [],
    custom_links: parsed.custom_links ?? [],
    blocks: migrateToBlocks(parsed),
  };
};

export interface PriceVariant {
  name: string;
  price: number;
}

export interface Pack {
  id: string;
  center_id: string;
  name: string;
  description: string | null;
  duration: string | null;
  price: number;
  features: string[];
  price_variants: PriceVariant[];
  image_url: string | null;
  sort_order: number;
  active: boolean;
  pricing_type: 'fixed' | 'quote';
  created_at: string;
  updated_at: string;
}

export interface Availability {
  id: string;
  center_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  enabled: boolean;
}

// Hook pour le centre du pro connecté
export function useMyCenter() {
  const { user } = useAuth();
  const [center, setCenter] = useState<Center | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setCenter(null);
      setLoading(false);
      return;
    }

    const fetchCenter = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('centers')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (error) {
        setError(error.message);
      } else if (data) {
        setCenter({
          ...data,
          customization: parseCustomization(data.customization),
        });
      }
      setLoading(false);
    };

    fetchCenter();
  }, [user]);

  const updateCenter = async (updates: Partial<Center>) => {
    if (!center) return { error: 'No center found' };
    
    // Convert customization for DB storage
    const dbUpdates: Record<string, unknown> = { ...updates };
    
    const { error } = await supabase
      .from('centers')
      .update(dbUpdates)
      .eq('id', center.id);

    if (!error) {
      setCenter({ ...center, ...updates });
    }
    return { error: error?.message || null };
  };

  return { center, loading, error, updateCenter };
}

// Hook pour un centre public par slug
export function useCenterBySlug(slug: string) {
  const [center, setCenter] = useState<Center | null>(null);
  const [packs, setPacks] = useState<Pack[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    const fetchCenter = async () => {
      setLoading(true);
      setError(null);

      // Fetch center from the secure public view (excludes sensitive data like email, stripe IDs, ical_token)
      const { data: centerData, error: centerError } = await supabase
        .from('public_centers_view')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (centerError) {
        setError(centerError.message);
        setLoading(false);
        return;
      }

      if (!centerData) {
        setError('Centre non trouvé');
        setLoading(false);
        return;
      }

      setCenter({
        ...centerData,
        customization: parseCustomization(centerData.customization),
      });

      // Fetch packs
      const { data: packsData } = await supabase
        .from('packs')
        .select('*')
        .eq('center_id', centerData.id)
        .eq('active', true)
        .order('sort_order');

      // Transform packs to ensure price_variants is properly typed
      const transformedPacks: Pack[] = (packsData || []).map(p => ({
        ...p,
        price_variants: (p.price_variants as unknown as PriceVariant[]) || [],
        pricing_type: ((p as any).pricing_type || 'fixed') as 'fixed' | 'quote',
      }));
      setPacks(transformedPacks);

      // Fetch availability
      const { data: availabilityData } = await supabase
        .from('availability')
        .select('*')
        .eq('center_id', centerData.id)
        .eq('enabled', true);

      setAvailability(availabilityData || []);
      setLoading(false);
    };

    fetchCenter();
  }, [slug]);

  return { center, packs, availability, loading, error };
}

// Hook pour les packs du centre du pro
export function useMyPacks() {
  const { center } = useMyCenter();
  const [packs, setPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!center) {
      setLoading(false);
      return;
    }

    const fetchPacks = async () => {
      const { data } = await supabase
        .from('packs')
        .select('*')
        .eq('center_id', center.id)
        .order('sort_order');

      // Transform packs to ensure price_variants is properly typed
      const transformedPacks: Pack[] = (data || []).map(p => ({
        ...p,
        price_variants: (p.price_variants as unknown as PriceVariant[]) || [],
        pricing_type: ((p as any).pricing_type || 'fixed') as 'fixed' | 'quote',
      }));
      setPacks(transformedPacks);
      setLoading(false);
    };

    fetchPacks();
  }, [center]);

  const createPack = async (pack: Omit<Pack, 'id' | 'center_id' | 'created_at' | 'updated_at'>) => {
    if (!center) return { error: 'No center found' };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const insertData: any = { ...pack, center_id: center.id };
    
    const { data, error } = await supabase
      .from('packs')
      .insert(insertData)
      .select()
      .single();

    if (!error && data) {
      const transformedPack: Pack = {
        ...data,
        price_variants: (data.price_variants as unknown as PriceVariant[]) || [],
        pricing_type: ((data as any).pricing_type || 'fixed') as 'fixed' | 'quote',
      };
      setPacks([...packs, transformedPack]);
    }
    return { data, error: error?.message || null };
  };

  const updatePack = async (id: string, updates: Partial<Pack>) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = { ...updates };
    
    const { error } = await supabase
      .from('packs')
      .update(updateData)
      .eq('id', id);

    if (!error) {
      setPacks(packs.map(p => p.id === id ? { ...p, ...updates } : p));
    }
    return { error: error?.message || null };
  };

  const deletePack = async (id: string) => {
    const { error } = await supabase
      .from('packs')
      .delete()
      .eq('id', id);

    if (!error) {
      setPacks(packs.filter(p => p.id !== id));
    }
    return { error: error?.message || null };
  };

  return { packs, loading, createPack, updatePack, deletePack };
}

// Hook pour les disponibilités du pro
export function useMyAvailability() {
  const { center } = useMyCenter();
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!center) {
      setLoading(false);
      return;
    }

    const fetchAvailability = async () => {
      const { data } = await supabase
        .from('availability')
        .select('*')
        .eq('center_id', center.id)
        .order('day_of_week');

      setAvailability(data || []);
      setLoading(false);
    };

    fetchAvailability();
  }, [center]);

  const upsertAvailability = async (day: number, start: string, end: string, enabled: boolean) => {
    if (!center) return { error: 'No center found' };

    const existing = availability.find(a => a.day_of_week === day);

    if (existing) {
      const { error } = await supabase
        .from('availability')
        .update({ start_time: start, end_time: end, enabled })
        .eq('id', existing.id);

      if (!error) {
        setAvailability(availability.map(a => 
          a.day_of_week === day ? { ...a, start_time: start, end_time: end, enabled } : a
        ));
      }
      return { error: error?.message || null };
    } else {
      const { data, error } = await supabase
        .from('availability')
        .insert({ center_id: center.id, day_of_week: day, start_time: start, end_time: end, enabled })
        .select()
        .single();

      if (!error && data) {
        setAvailability([...availability, data]);
      }
      return { error: error?.message || null };
    }
  };

  return { availability, loading, upsertAvailability };
}
