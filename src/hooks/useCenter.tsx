import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Center {
  id: string;
  owner_id: string;
  slug: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  welcome_message: string | null;
  ai_enabled: boolean;
  subscription_plan: 'free' | 'pro';
  created_at: string;
  updated_at: string;
}

export interface Pack {
  id: string;
  center_id: string;
  name: string;
  description: string | null;
  duration: string | null;
  price: number;
  features: string[];
  sort_order: number;
  active: boolean;
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
      } else {
        setCenter(data);
      }
      setLoading(false);
    };

    fetchCenter();
  }, [user]);

  const updateCenter = async (updates: Partial<Center>) => {
    if (!center) return { error: 'No center found' };
    
    const { error } = await supabase
      .from('centers')
      .update(updates)
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

      // Fetch center
      const { data: centerData, error: centerError } = await supabase
        .from('centers')
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

      setCenter(centerData);

      // Fetch packs
      const { data: packsData } = await supabase
        .from('packs')
        .select('*')
        .eq('center_id', centerData.id)
        .eq('active', true)
        .order('sort_order');

      setPacks(packsData || []);

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

      setPacks(data || []);
      setLoading(false);
    };

    fetchPacks();
  }, [center]);

  const createPack = async (pack: Omit<Pack, 'id' | 'center_id' | 'created_at' | 'updated_at'>) => {
    if (!center) return { error: 'No center found' };

    const { data, error } = await supabase
      .from('packs')
      .insert({ ...pack, center_id: center.id })
      .select()
      .single();

    if (!error && data) {
      setPacks([...packs, data]);
    }
    return { data, error: error?.message || null };
  };

  const updatePack = async (id: string, updates: Partial<Pack>) => {
    const { error } = await supabase
      .from('packs')
      .update(updates)
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
