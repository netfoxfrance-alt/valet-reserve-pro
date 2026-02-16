import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { findOrCreateClient } from '@/lib/clientService';

export interface ContactRequest {
  id: string;
  center_id: string;
  client_name: string;
  client_email: string | null;
  client_phone: string;
  client_address: string | null;
  message: string | null;
  status: string;
  request_type: 'contact' | 'quote';
  service_name: string | null;
  created_at: string;
  contacted_at: string | null;
}

export function useCreateContactRequest() {
  const [loading, setLoading] = useState(false);

  const createContactRequest = async (data: {
    center_id: string;
    client_name: string;
    client_email: string;
    client_phone: string;
    client_address?: string;
    message?: string;
    request_type?: 'contact' | 'quote';
    service_name?: string;
  }) => {
    setLoading(true);
    try {
      // 1. Créer ou rattacher à un client existant (anti-doublon)
      await findOrCreateClient({
        center_id: data.center_id,
        name: data.client_name,
        phone: data.client_phone,
        email: data.client_email,
        address: data.client_address,
        source: 'contact_request',
      });
      
      // 2. Créer la demande de contact
      const { error } = await supabase
        .from('contact_requests')
        .insert({
          center_id: data.center_id,
          client_name: data.client_name,
          client_email: data.client_email,
          client_phone: data.client_phone,
          client_address: data.client_address || null,
          message: data.message || null,
          request_type: data.request_type || 'contact',
          service_name: data.service_name || null,
        });
      
      return { error };
    } finally {
      setLoading(false);
    }
  };

  return { createContactRequest, loading };
}

export function useMyContactRequests() {
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async (centerId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('contact_requests')
      .select('*')
      .eq('center_id', centerId)
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setRequests(data as unknown as ContactRequest[]);
    }
    setLoading(false);
    return { data, error };
  };

  const updateStatus = async (requestId: string, status: string, recordContactedAt: boolean = false) => {
    const updateData: { status: string; contacted_at?: string } = { status };
    
    if (recordContactedAt) {
      updateData.contacted_at = new Date().toISOString();
    }
    
    const { error } = await supabase
      .from('contact_requests')
      .update(updateData)
      .eq('id', requestId);
    
    if (!error) {
      setRequests(prev => prev.map(r => 
        r.id === requestId ? { ...r, ...updateData } : r
      ));
    }
    
    return { error };
  };

  return { requests, loading, fetchRequests, updateStatus };
}
