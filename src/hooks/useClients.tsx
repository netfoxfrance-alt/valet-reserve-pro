import { useState, useEffect, useCallback } from 'react';
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
    client_type?: string;
    company_name?: string;
  }): Promise<{ error: string | null; data: any; isExisting?: boolean }> => {
    if (!center) return { error: 'Aucun centre trouvé', data: null };
    
    const hasPhone = client.phone && client.phone.trim() !== '';
    const hasEmail = client.email && client.email.trim() !== '';
    
    // Use findOrCreateClient for deduplication when phone or email is provided
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
        // Update extra fields not handled by findOrCreateClient
        const extraUpdates: Record<string, any> = {};
        if (client.notes) extraUpdates.notes = client.notes;
        if (client.default_service_id) extraUpdates.default_service_id = client.default_service_id;
        if (client.client_type) extraUpdates.client_type = client.client_type;
        if (client.company_name) extraUpdates.company_name = client.company_name;
        
        if (Object.keys(extraUpdates).length > 0) {
          await supabase.from('clients' as any).update(extraUpdates).eq('id', result.clientId);
        }
        
        // Fetch the full client with relations
        const { data: fullClient } = await supabase
          .from('clients' as any)
          .select(`*, default_service:custom_services(*)`)
          .eq('id', result.clientId)
          .single();
        
        if (fullClient) {
          await fetchClients();
        }
        
        return { error: null, data: fullClient, isExisting: !result.isNew };
      }
    }
    
    // Fallback: direct insert (no phone/email to deduplicate on)
    const { data, error } = await supabase
      .from('clients' as any)
      .insert({
        ...client,
        center_id: center.id,
      })
      .select(`*, default_service:custom_services(*)`)
      .single();

    if (!error && data) {
      setClients([...clients, data as unknown as Client].sort((a, b) => a.name.localeCompare(b.name)));
    }
    return { error: error?.message || null, data, isExisting: false };
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
