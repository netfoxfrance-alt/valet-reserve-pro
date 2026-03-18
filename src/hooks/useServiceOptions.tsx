import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMyCenter } from './useCenter';

export interface ServiceOption {
  id: string;
  center_id: string;
  name: string;
  price: number;
  duration_minutes: number;
  description: string | null;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface PackOptionLink {
  id: string;
  pack_id: string;
  option_id: string;
}

export function useMyServiceOptions() {
  const { center } = useMyCenter();
  const [options, setOptions] = useState<ServiceOption[]>([]);
  const [packOptionLinks, setPackOptionLinks] = useState<PackOptionLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!center) { setLoading(false); return; }
    const fetchAll = async () => {
      const [optRes, linkRes] = await Promise.all([
        supabase.from('service_options' as any).select('*').eq('center_id', center.id).order('sort_order'),
        supabase.from('pack_option_links' as any).select('*'),
      ]);
      setOptions((optRes.data as unknown as ServiceOption[]) || []);
      setPackOptionLinks((linkRes.data as unknown as PackOptionLink[]) || []);
      setLoading(false);
    };
    fetchAll();
  }, [center]);

  const createOption = async (opt: { name: string; price: number; duration_minutes: number; description?: string }) => {
    if (!center) return { error: 'No center' };
    const { data, error } = await supabase
      .from('service_options' as any)
      .insert({ ...opt, center_id: center.id, sort_order: options.length })
      .select()
      .single();
    if (!error && data) setOptions([...options, data as unknown as ServiceOption]);
    return { error: error?.message || null, data };
  };

  const updateOption = async (id: string, updates: Partial<ServiceOption>) => {
    const { error } = await supabase
      .from('service_options' as any)
      .update(updates)
      .eq('id', id);
    if (!error) setOptions(options.map(o => o.id === id ? { ...o, ...updates } : o));
    return { error: error?.message || null };
  };

  const deleteOption = async (id: string) => {
    const { error } = await supabase
      .from('service_options' as any)
      .delete()
      .eq('id', id);
    if (!error) setOptions(options.filter(o => o.id !== id));
    return { error: error?.message || null };
  };

  const linkOptionToPack = async (packId: string, optionId: string) => {
    const { data, error } = await supabase
      .from('pack_option_links' as any)
      .insert({ pack_id: packId, option_id: optionId })
      .select()
      .single();
    if (!error && data) setPackOptionLinks([...packOptionLinks, data as unknown as PackOptionLink]);
    return { error: error?.message || null };
  };

  const unlinkOptionFromPack = async (packId: string, optionId: string) => {
    const { error } = await supabase
      .from('pack_option_links' as any)
      .delete()
      .eq('pack_id', packId)
      .eq('option_id', optionId);
    if (!error) setPackOptionLinks(packOptionLinks.filter(l => !(l.pack_id === packId && l.option_id === optionId)));
    return { error: error?.message || null };
  };

  const getOptionsForPack = (packId: string): ServiceOption[] => {
    const linkedIds = packOptionLinks.filter(l => l.pack_id === packId).map(l => l.option_id);
    return options.filter(o => linkedIds.includes(o.id) && o.active);
  };

  const isOptionLinked = (packId: string, optionId: string) => {
    return packOptionLinks.some(l => l.pack_id === packId && l.option_id === optionId);
  };

  return {
    options, packOptionLinks, loading,
    createOption, updateOption, deleteOption,
    linkOptionToPack, unlinkOptionFromPack,
    getOptionsForPack, isOptionLinked,
  };
}

// Public hook for fetching options for a pack
export function usePackOptions(packId: string | null, centerId: string | null) {
  const [options, setOptions] = useState<ServiceOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!packId || !centerId) { setLoading(false); return; }
    const fetch = async () => {
      // Get linked option IDs
      const { data: links } = await supabase
        .from('pack_option_links' as any)
        .select('option_id')
        .eq('pack_id', packId);
      
      if (!links || links.length === 0) { setOptions([]); setLoading(false); return; }
      
      const optionIds = (links as any[]).map(l => l.option_id);
      const { data: opts } = await supabase
        .from('service_options' as any)
        .select('*')
        .eq('center_id', centerId)
        .eq('active', true)
        .in('id', optionIds)
        .order('sort_order');
      
      setOptions((opts as unknown as ServiceOption[]) || []);
      setLoading(false);
    };
    fetch();
  }, [packId, centerId]);

  return { options, loading };
}
