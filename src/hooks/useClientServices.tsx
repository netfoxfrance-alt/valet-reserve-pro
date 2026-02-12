import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ClientServiceLink {
  id: string;
  client_id: string;
  service_id: string;
  created_at: string;
}

/**
 * Hook to manage multiple services for a given client via the client_services junction table.
 */
export function useClientServices(clientId: string | null) {
  const [serviceIds, setServiceIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!clientId) {
      setServiceIds([]);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from('client_services')
      .select('service_id')
      .eq('client_id', clientId);

    setServiceIds((data || []).map(d => d.service_id));
    setLoading(false);
  }, [clientId]);

  useEffect(() => { fetch(); }, [fetch]);

  /**
   * Replace all service links for this client with the given set of service IDs.
   */
  const setServices = async (newServiceIds: string[]) => {
    if (!clientId) return;

    // Delete all existing
    await supabase
      .from('client_services')
      .delete()
      .eq('client_id', clientId);

    // Insert new ones
    if (newServiceIds.length > 0) {
      await supabase
        .from('client_services')
        .insert(newServiceIds.map(sid => ({ client_id: clientId, service_id: sid })));
    }

    setServiceIds(newServiceIds);
  };

  return { serviceIds, loading, setServices, refetch: fetch };
}
