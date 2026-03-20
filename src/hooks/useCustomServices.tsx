import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMyCenter } from './useCenter';

export interface CustomService {
  id: string;
  center_id: string;
  name: string;
  duration_minutes: number;
  price: number;
  description: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

// Query key factory
export const CUSTOM_SERVICES_QUERY_KEY = (centerId: string) =>
  ['custom-services', centerId] as const;

const fetchCustomServices = async (centerId: string): Promise<CustomService[]> => {
  const { data } = await supabase
    .from('custom_services' as any)
    .select('*')
    .eq('center_id', centerId)
    .order('name', { ascending: true });

  return (data as unknown as CustomService[]) || [];
};

export function useMyCustomServices() {
  const { center } = useMyCenter();
  const queryClient = useQueryClient();

  const queryKey = center ? CUSTOM_SERVICES_QUERY_KEY(center.id) : ['custom-services-disabled'];

  const { data: services = [], isLoading: loading } = useQuery({
    queryKey,
    queryFn: () => fetchCustomServices(center!.id),
    enabled: !!center,
    staleTime: 3 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  const invalidate = useCallback(() => {
    if (!center) return;
    queryClient.invalidateQueries({ queryKey: CUSTOM_SERVICES_QUERY_KEY(center.id) });
  }, [center, queryClient]);

  const createService = async (service: {
    name: string;
    duration_minutes: number;
    price: number;
    description?: string;
  }) => {
    if (!center) return { error: 'Aucun centre trouvé' };
    
    const { data, error } = await supabase
      .from('custom_services' as any)
      .insert({
        ...service,
        center_id: center.id,
      })
      .select()
      .single();

    if (!error && data) {
      invalidate();
    }
    return { error: error?.message || null, data };
  };

  const updateService = async (id: string, updates: Partial<CustomService>) => {
    const { error } = await supabase
      .from('custom_services' as any)
      .update(updates)
      .eq('id', id);

    if (!error) {
      invalidate();
    }
    return { error: error?.message || null };
  };

  const deleteService = async (id: string) => {
    const { error } = await supabase
      .from('custom_services' as any)
      .delete()
      .eq('id', id);

    if (!error) {
      invalidate();
    }
    return { error: error?.message || null };
  };

  return { services, loading, createService, updateService, deleteService };
}

// Format duration helper
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h${mins.toString().padStart(2, '0')}`;
}

// Parse duration helper (reverse of formatDuration)
export function parseDuration(duration: string): number {
  const hoursMatch = duration.match(/(\d+)h/);
  const minutesMatch = duration.match(/(\d+)(?:min|m(?!h))/);
  const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
  const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;
  return hours * 60 + minutes || 60;
}
