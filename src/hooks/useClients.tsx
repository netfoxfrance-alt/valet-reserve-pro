import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMyCenter } from './useCenter';
import { CustomService } from './useCustomServices';
import { findOrCreateClient } from '@/lib/clientService';

export type ClientType = 'particulier' | 'professionnel';

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
  client_type: ClientType;
  company_name: string | null;
  created_at: string;
  updated_at: string;
  default_service?: CustomService | null;
}

interface UseMyClientsOptions {
  page?: number;
  pageSize?: number;
}

// Query key factory
export const CLIENTS_QUERY_KEY = (centerId: string, page: number, pageSize: number) =>
  ['clients', centerId, page, pageSize] as const;

const fetchClients = async (centerId: string, page: number, pageSize: number) => {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, count } = await supabase
    .from('clients' as any)
    .select(`
      *,
      default_service:custom_services(*)
    `, { count: 'exact' })
    .eq('center_id', centerId)
    .order('name', { ascending: true })
    .range(from, to);

  return {
    clients: (data as unknown as Client[]) || [],
    totalCount: count || 0,
  };
};

export function useMyClients(options: UseMyClientsOptions = {}) {
  const { page = 0, pageSize = 1000 } = options;
  const { center } = useMyCenter();
  const queryClient = useQueryClient();

  const queryKey = center ? CLIENTS_QUERY_KEY(center.id, page, pageSize) : ['clients-disabled'];

  const { data, isLoading: loading } = useQuery({
    queryKey,
    queryFn: () => fetchClients(center!.id, page, pageSize),
    enabled: !!center,
    staleTime: 3 * 60 * 1000,   // 3 min
    gcTime: 15 * 60 * 1000,
  });

  const clients = data?.clients || [];
  const totalCount = data?.totalCount || 0;

  const invalidate = useCallback(() => {
    if (!center) return;
    queryClient.invalidateQueries({ queryKey: ['clients', center.id] });
  }, [center, queryClient]);

  const createClient = async (client: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    default_service_id?: string | null;
    notes?: string;
    client_type?: string;
    company_name?: string;
  }): Promise<{ error: string | null; data: any; isExisting?: boolean }> => {
    if (!center) return { error: 'Aucun centre trouvé', data: null };

    const hasPhone = client.phone && client.phone.trim() !== '';
    const hasEmail = client.email && client.email.trim() !== '';

    if (hasPhone || hasEmail) {
      const result = await findOrCreateClient({
        center_id: center.id,
        name: client.name,
        phone: client.phone || '',
        email: client.email || null,
        address: client.address || null,
        source: 'manual',
      });

      if (result.error) {
        return { error: result.error, data: null };
      }

      if (result.clientId) {
        const extraUpdates: Record<string, any> = {};
        if (client.notes) extraUpdates.notes = client.notes;
        if (client.default_service_id) extraUpdates.default_service_id = client.default_service_id;
        if (client.client_type) extraUpdates.client_type = client.client_type;
        if (client.company_name) extraUpdates.company_name = client.company_name;

        if (Object.keys(extraUpdates).length > 0) {
          await supabase.from('clients' as any).update(extraUpdates).eq('id', result.clientId);
        }

        const { data: fullClient } = await supabase
          .from('clients' as any)
          .select(`*, default_service:custom_services(*)`)
          .eq('id', result.clientId)
          .single();

        if (fullClient) {
          invalidate();
        }

        return { error: null, data: fullClient, isExisting: !result.isNew };
      }
    }

    // Fallback: direct insert
    const { data: newData, error } = await supabase
      .from('clients' as any)
      .insert({
        ...client,
        center_id: center.id,
      })
      .select(`*, default_service:custom_services(*)`)
      .single();

    if (!error && newData) {
      invalidate();
    }
    return { error: error?.message || null, data: newData, isExisting: false };
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    const { default_service, ...updateData } = updates;

    const { error } = await supabase
      .from('clients' as any)
      .update(updateData)
      .eq('id', id);

    if (!error) {
      invalidate();
    }
    return { error: error?.message || null };
  };

  const deleteClient = async (id: string) => {
    const { error } = await supabase
      .from('clients' as any)
      .delete()
      .eq('id', id);

    if (!error) {
      invalidate();
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
    refetch: invalidate,
  };
}
