import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Invoice } from './useInvoices';

export function useClientInvoices(clientId: string | null) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clientId) {
      setInvoices([]);
      setLoading(false);
      return;
    }

    const fetchInvoices = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setInvoices(data as Invoice[]);
      }
      setLoading(false);
    };

    fetchInvoices();
  }, [clientId]);

  const stats = {
    totalInvoices: invoices.filter(i => i.type === 'invoice').length,
    totalQuotes: invoices.filter(i => i.type === 'quote').length,
    totalAmount: invoices
      .filter(i => i.type === 'invoice' && i.status === 'paid')
      .reduce((sum, i) => sum + i.total, 0),
    pendingAmount: invoices
      .filter(i => i.type === 'invoice' && i.status !== 'paid' && i.status !== 'cancelled')
      .reduce((sum, i) => sum + i.total, 0),
  };

  return { invoices, loading, stats };
}
