import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMyCenter } from './useCenter';
import { CustomService } from './useCustomServices';

export interface Client {
  id: string;
  center_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  default_service_id: string | null;
  notes: string | null;
  source: 'manual' | 'booking';
  created_at: string;
  updated_at: string;
  // Joined data
  default_service?: CustomService | null;
}

interface UseMyClientsOptions {
  page?: number;
  pageSize?: number;
}

export function useMyClients(options: UseMyClientsOptions = {}) {
  const { page = 0, pageSize = 1000 } = options; // Default to 1000 for backwards compatibility
  const { center } = useMyCenter();
  const [clients, setClients] = useState<Client[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchClients = useCallback(async () => {
    if (!center) {
      setLoading(false);
      return;
    }

    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, count } = await supabase
      .from('clients' as any)
      .select(`
        *,
        default_service:custom_services(*)
      `, { count: 'exact' })
      .eq('center_id', center.id)
      .order('name', { ascending: true })
      .range(from, to);

    setClients((data as unknown as Client[]) || []);
    setTotalCount(count || 0);
    setLoading(false);
  }, [center, page, pageSize]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const createClient = async (client: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    default_service_id?: string | null;
    notes?: string;
  }) => {
    if (!center) return { error: 'Aucun centre trouvé' };
    
    const { data, error } = await supabase
      .from('clients' as any)
      .insert({
        ...client,
        center_id: center.id,
      })
      .select(`
        *,
        default_service:custom_services(*)
      `)
      .single();

    if (!error && data) {
      setClients([...clients, data as unknown as Client].sort((a, b) => a.name.localeCompare(b.name)));
    }
    return { error: error?.message || null, data };
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    // Remove joined data before update
    const { default_service, ...updateData } = updates;
    
    const { error } = await supabase
      .from('clients' as any)
      .update(updateData)
      .eq('id', id);

    if (!error) {
      // Refetch to get updated joined data
      await fetchClients();
    }
    return { error: error?.message || null };
  };

  const deleteClient = async (id: string) => {
    const { error } = await supabase
      .from('clients' as any)
      .delete()
      .eq('id', id);

    if (!error) {
      setClients(clients.filter(c => c.id !== id));
    }
    return { error: error?.message || null };
  };

  const hasMore = totalCount > (page + 1) * pageSize;

  return { 
    clients, 
    loading, 
    totalCount,
    hasMore,
    createClient, 
    updateClient, 
    deleteClient, 
    refetch: fetchClients 
  };
}
