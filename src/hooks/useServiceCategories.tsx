import { useState, useEffect, useCallback } from 'react';
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
  location_type: 'home' | 'workshop' | 'both';
  funnel_type: 'simple' | 'classic' | 'detailing' | 'quote';
  created_at: string;
  updated_at: string;
}

export interface ServiceVariant {
  id: string;
  category_id: string;
  name: string;
  sort_order: number;
  active: boolean;
  created_at: string;
}

export interface PackVariantPrice {
  id: string;
  pack_id: string;
  variant_id: string;
  price: number;
  created_at: string;
}

export function useMyServiceCategories() {
  const { center } = useMyCenter();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    if (!center) return;
    const { data } = await supabase
      .from('service_categories')
      .select('*')
      .eq('center_id', center.id)
      .order('sort_order');

    setCategories((data as unknown as ServiceCategory[]) || []);
    setLoading(false);
  }, [center]);

  useEffect(() => {
    if (!center) {
      setLoading(false);
      return;
    }
    fetchCategories();
  }, [center, fetchCategories]);

  const createCategory = async (cat: {
    name: string;
    description?: string;
    location_type?: string;
    funnel_type?: string;
    image_url?: string | null;
  }) => {
    if (!center) return { error: 'No center', data: null };
    const { data, error } = await supabase
      .from('service_categories')
      .insert({
        center_id: center.id,
        name: cat.name,
        description: cat.description || null,
        location_type: cat.location_type || 'both',
        funnel_type: cat.funnel_type || 'classic',
        image_url: cat.image_url || null,
        sort_order: categories.length,
      } as any)
      .select()
      .single();

    if (!error && data) {
      setCategories(prev => [...prev, data as unknown as ServiceCategory]);
    }
    return { error: error?.message || null, data };
  };

  const updateCategory = async (id: string, updates: Partial<ServiceCategory>) => {
    const { error } = await supabase
      .from('service_categories')
      .update(updates as any)
      .eq('id', id);

    if (!error) {
      setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    }
    return { error: error?.message || null };
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase
      .from('service_categories')
      .delete()
      .eq('id', id);

    if (!error) {
      setCategories(prev => prev.filter(c => c.id !== id));
    }
    return { error: error?.message || null };
  };

  return { categories, loading, createCategory, updateCategory, deleteCategory, refetch: fetchCategories };
}

export function useServiceVariants(categoryId: string | null) {
  const [variants, setVariants] = useState<ServiceVariant[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVariants = useCallback(async () => {
    if (!categoryId) {
      setVariants([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from('service_variants' as any)
      .select('*')
      .eq('category_id', categoryId)
      .order('sort_order');

    setVariants((data as unknown as ServiceVariant[]) || []);
    setLoading(false);
  }, [categoryId]);

  useEffect(() => {
    fetchVariants();
  }, [fetchVariants]);

  const createVariant = async (name: string) => {
    if (!categoryId) return { error: 'No category' };
    const { data, error } = await supabase
      .from('service_variants' as any)
      .insert({ category_id: categoryId, name, sort_order: variants.length })
      .select()
      .single();

    if (!error && data) {
      setVariants(prev => [...prev, data as unknown as ServiceVariant]);
    }
    return { error: error?.message || null, data };
  };

  const updateVariant = async (id: string, updates: Partial<ServiceVariant>) => {
    const { error } = await supabase
      .from('service_variants' as any)
      .update(updates)
      .eq('id', id);

    if (!error) {
      setVariants(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
    }
    return { error: error?.message || null };
  };

  const deleteVariant = async (id: string) => {
    const { error } = await supabase
      .from('service_variants' as any)
      .delete()
      .eq('id', id);

    if (!error) {
      setVariants(prev => prev.filter(v => v.id !== id));
    }
    return { error: error?.message || null };
  };

  return { variants, loading, createVariant, updateVariant, deleteVariant, refetch: fetchVariants };
}

export function usePackVariantPrices(packId: string | null) {
  const [prices, setPrices] = useState<PackVariantPrice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!packId) {
      setPrices([]);
      setLoading(false);
      return;
    }

    const fetch = async () => {
      const { data } = await supabase
        .from('pack_variant_prices' as any)
        .select('*')
        .eq('pack_id', packId);

      setPrices((data as unknown as PackVariantPrice[]) || []);
      setLoading(false);
    };

    fetch();
  }, [packId]);

  const upsertPrice = async (variantId: string, price: number) => {
    if (!packId) return { error: 'No pack' };
    
    const existing = prices.find(p => p.variant_id === variantId);
    
    if (existing) {
      const { error } = await supabase
        .from('pack_variant_prices' as any)
        .update({ price })
        .eq('id', existing.id);

      if (!error) {
        setPrices(prev => prev.map(p => p.id === existing.id ? { ...p, price } : p));
      }
      return { error: error?.message || null };
    } else {
      const { data, error } = await supabase
        .from('pack_variant_prices' as any)
        .insert({ pack_id: packId, variant_id: variantId, price })
        .select()
        .single();

      if (!error && data) {
        setPrices(prev => [...prev, data as unknown as PackVariantPrice]);
      }
      return { error: error?.message || null };
    }
  };

  const deletePrice = async (variantId: string) => {
    const existing = prices.find(p => p.variant_id === variantId);
    if (!existing) return { error: null };

    const { error } = await supabase
      .from('pack_variant_prices' as any)
      .delete()
      .eq('id', existing.id);

    if (!error) {
      setPrices(prev => prev.filter(p => p.id !== existing.id));
    }
    return { error: error?.message || null };
  };

  return { prices, loading, upsertPrice, deletePrice };
}
