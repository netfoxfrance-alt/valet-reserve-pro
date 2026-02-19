import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useMapTilerKey() {
  return useQuery({
    queryKey: ['maptiler-key'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-maptiler-key');
      if (error) throw error;
      return data.key as string;
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
