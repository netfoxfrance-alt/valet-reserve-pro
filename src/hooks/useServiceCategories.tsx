import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMyCenter } from './useCenter';

export interface ServiceCategory {
  id: string;
  center_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export function useMyServiceCategories() {
  const { center } = useMyCenter();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!center) { setLoading(false); return; }
    const fetch = async () => {
      const { data } = await supabase
        .from('service_categories' as any)
        .select('*')
        .eq('center_id', center.id)
        .order('sort_order', { ascending: true });
      setCategories((data as unknown as ServiceCategory[]) || []);
      setLoading(false);
    };
    fetch();
  }, [center]);

  const createCategory = async (cat: { name: string; description?: string; image_url?: string }) => {
    if (!center) return { error: 'No center' };
    const { data, error } = await supabase
      .from('service_categories' as any)
      .insert({ ...cat, center_id: center.id, sort_order: categories.length })
      .select()
      .single();
    if (!error && data) setCategories([...categories, data as unknown as ServiceCategory]);
    return { error: error?.message || null, data };
  };

  const updateCategory = async (id: string, updates: Partial<ServiceCategory>) => {
    const { error } = await supabase
      .from('service_categories' as any)
      .update(updates)
      .eq('id', id);
    if (!error) setCategories(categories.map(c => c.id === id ? { ...c, ...updates } : c));
    return { error: error?.message || null };
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase
      .from('service_categories' as any)
      .delete()
      .eq('id', id);
    if (!error) setCategories(categories.filter(c => c.id !== id));
    return { error: error?.message || null };
  };

  return { categories, loading, createCategory, updateCategory, deleteCategory };
}

// Public hook for fetching categories by center_id
export function useCenterCategories(centerId: string | null) {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!centerId) { setLoading(false); return; }
    const fetch = async () => {
      const { data } = await supabase
        .from('service_categories' as any)
        .select('*')
        .eq('center_id', centerId)
        .eq('active', true)
        .order('sort_order', { ascending: true });
      setCategories((data as unknown as ServiceCategory[]) || []);
      setLoading(false);
    };
    fetch();
  }, [centerId]);

  return { categories, loading };
}
