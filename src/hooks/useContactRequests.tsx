import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ContactRequest {
  id: string;
  center_id: string;
  client_name: string;
  client_phone: string;
  message: string | null;
  status: string;
  created_at: string;
}

export function useCreateContactRequest() {
  const [loading, setLoading] = useState(false);

  const createContactRequest = async (data: {
    center_id: string;
    client_name: string;
    client_phone: string;
    message?: string;
  }) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('contact_requests')
        .insert({
          center_id: data.center_id,
          client_name: data.client_name,
          client_phone: data.client_phone,
          message: data.message || null,
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
      setRequests(data);
    }
    setLoading(false);
    return { data, error };
  };

  const updateStatus = async (requestId: string, status: string) => {
    const { error } = await supabase
      .from('contact_requests')
      .update({ status })
      .eq('id', requestId);
    
    if (!error) {
      setRequests(prev => prev.map(r => 
        r.id === requestId ? { ...r, status } : r
      ));
    }
    
    return { error };
  };

  return { requests, loading, fetchRequests, updateStatus };
}
