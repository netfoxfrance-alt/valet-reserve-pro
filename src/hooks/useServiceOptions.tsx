import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMyCenter } from './useCenter';

export interface ServiceOption {
  id: string;
  center_id: string;
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number;
  sort_order: number;
  active: boolean;
  category: string;
  created_at: string;
  updated_at: string;
}

export function useMyServiceOptions() {
  const { center } = useMyCenter();
  const [options, setOptions] = useState<ServiceOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!center) { setLoading(false); return; }

    const fetch = async () => {
      const { data } = await supabase
        .from('service_options')
        .select('*')
        .eq('center_id', center.id)
        .order('sort_order', { ascending: true });

      setOptions((data as unknown as ServiceOption[]) || []);
      setLoading(false);
    };
    fetch();
  }, [center]);

  const createOption = async (option: { name: string; price: number; duration_minutes: number; description?: string }) => {
    if (!center) return { error: 'No center' };
    const { data, error } = await supabase
      .from('service_options')
      .insert({ ...option, center_id: center.id, sort_order: options.length })
      .select()
      .single();

    if (!error && data) {
      setOptions(prev => [...prev, data as unknown as ServiceOption]);
    }
    return { error: error?.message || null, data };
  };

  const updateOption = async (id: string, updates: Partial<ServiceOption>) => {
    const { error } = await supabase
      .from('service_options')
      .update(updates)
      .eq('id', id);

    if (!error) {
      setOptions(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
    }
    return { error: error?.message || null };
  };

  const deleteOption = async (id: string) => {
    const { error } = await supabase
      .from('service_options')
      .delete()
      .eq('id', id);

    if (!error) {
      setOptions(prev => prev.filter(o => o.id !== id));
    }
    return { error: error?.message || null };
  };

  return { options, loading, createOption, updateOption, deleteOption };
}

/** Hook to manage pack ↔ option links */
export function usePackOptions(packId: string | null) {
  const [optionIds, setOptionIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLinks = useCallback(async () => {
    if (!packId) { setOptionIds([]); return; }
    setLoading(true);
    const { data } = await supabase
      .from('pack_option_links')
      .select('option_id')
      .eq('pack_id', packId);

    setOptionIds((data || []).map(d => d.option_id));
    setLoading(false);
  }, [packId]);

  useEffect(() => { fetchLinks(); }, [fetchLinks]);

  const setOptions = async (newOptionIds: string[]) => {
    if (!packId) return;
    await supabase.from('pack_option_links').delete().eq('pack_id', packId);
    if (newOptionIds.length > 0) {
      await supabase.from('pack_option_links').insert(
        newOptionIds.map(oid => ({ pack_id: packId, option_id: oid }))
      );
    }
    setOptionIds(newOptionIds);
  };

  return { optionIds, loading, setOptions, refetch: fetchLinks };
}
