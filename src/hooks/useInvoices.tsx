import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMyCenter } from './useCenter';

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  vat_rate: number;
  subtotal: number;
  vat_amount: number;
  total: number;
  sort_order: number;
}

export interface Invoice {
  id: string;
  center_id: string;
  client_id: string | null;
  type: 'invoice' | 'quote';
  number: string;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  client_address: string | null;
  issue_date: string;
  due_date: string | null;
  valid_until: string | null;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'paid' | 'cancelled';
  subtotal: number;
  total_vat: number;
  total: number;
  notes: string | null;
  terms: string | null;
  converted_from_quote_id: string | null;
  include_in_stats: boolean;
  service_created?: boolean;
  created_at: string;
  updated_at: string;
  items?: InvoiceItem[];
}

export interface VatRate {
  id: string;
  center_id: string;
  rate: number;
  label: string;
  is_default: boolean;
}

// Query key factories
export const INVOICES_QUERY_KEY = (centerId: string) =>
  ['invoices', centerId] as const;

export const VAT_RATES_QUERY_KEY = (centerId: string) =>
  ['vat-rates', centerId] as const;

const fetchInvoices = async (centerId: string): Promise<Invoice[]> => {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('center_id', centerId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data as Invoice[]) || [];
};

export function useInvoices() {
  const { center } = useMyCenter();
  const queryClient = useQueryClient();

  const queryKey = center ? INVOICES_QUERY_KEY(center.id) : ['invoices-disabled'];

  const { data: invoices = [], isLoading: loading } = useQuery({
    queryKey,
    queryFn: () => fetchInvoices(center!.id),
    enabled: !!center,
    staleTime: 2 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  const invalidate = useCallback(() => {
    if (!center) return;
    queryClient.invalidateQueries({ queryKey: INVOICES_QUERY_KEY(center.id) });
  }, [center, queryClient]);

  const generateNumber = async (type: 'invoice' | 'quote'): Promise<string> => {
    if (!center) return '';
    
    const year = new Date().getFullYear();
    const prefix = type === 'invoice' ? 'FAC' : 'DEV';
    
    const { data } = await supabase
      .from('invoices')
      .select('number')
      .eq('center_id', center.id)
      .eq('type', type)
      .like('number', `${prefix}-${year}-%`)
      .order('number', { ascending: false })
      .limit(1);

    let nextNumber = 1;
    if (data && data.length > 0) {
      const lastNumber = data[0].number;
      const parts = lastNumber.split('-');
      if (parts.length === 3) {
        nextNumber = parseInt(parts[2], 10) + 1;
      }
    }

    return `${prefix}-${year}-${String(nextNumber).padStart(3, '0')}`;
  };

  const createInvoice = async (
    invoice: Omit<Invoice, 'id' | 'center_id' | 'created_at' | 'updated_at' | 'number'> & { number?: string },
    items: Omit<InvoiceItem, 'id' | 'invoice_id'>[]
  ): Promise<{ data: Invoice | null; error: string | null }> => {
    if (!center) return { data: null, error: 'No center found' };

    const number = invoice.number || await generateNumber(invoice.type);

    let subtotal = 0;
    let totalVat = 0;
    
    const calculatedItems = items.map((item, index) => {
      const itemSubtotal = item.quantity * item.unit_price;
      const itemVat = itemSubtotal * (item.vat_rate / 100);
      const itemTotal = itemSubtotal + itemVat;
      subtotal += itemSubtotal;
      totalVat += itemVat;
      return { ...item, subtotal: itemSubtotal, vat_amount: itemVat, total: itemTotal, sort_order: index };
    });

    const total = subtotal + totalVat;

    const { data: invoiceData, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        center_id: center.id,
        client_id: (invoice as any).client_id || null,
        type: invoice.type,
        number,
        client_name: invoice.client_name,
        client_email: invoice.client_email,
        client_phone: invoice.client_phone,
        client_address: invoice.client_address,
        issue_date: invoice.issue_date,
        due_date: invoice.due_date,
        valid_until: invoice.valid_until,
        status: invoice.status,
        subtotal,
        total_vat: totalVat,
        total,
        notes: invoice.notes,
        terms: invoice.terms,
        converted_from_quote_id: invoice.converted_from_quote_id,
        include_in_stats: invoice.include_in_stats,
      })
      .select()
      .single();

    if (invoiceError) {
      return { data: null, error: invoiceError.message };
    }

    if (calculatedItems.length > 0) {
      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(
          calculatedItems.map(item => ({
            invoice_id: invoiceData.id,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            vat_rate: item.vat_rate,
            subtotal: item.subtotal,
            vat_amount: item.vat_amount,
            total: item.total,
            sort_order: item.sort_order,
          }))
        );

      if (itemsError) {
        await supabase.from('invoices').delete().eq('id', invoiceData.id);
        return { data: null, error: itemsError.message };
      }
    }

    invalidate();
    return { data: invoiceData as Invoice, error: null };
  };

  const updateInvoice = async (
    id: string,
    invoice: Partial<Omit<Invoice, 'id' | 'center_id' | 'created_at' | 'updated_at' | 'number'>>,
    items?: Omit<InvoiceItem, 'id' | 'invoice_id'>[]
  ): Promise<{ error: string | null }> => {
    if (items) {
      let subtotal = 0;
      let totalVat = 0;
      
      const calculatedItems = items.map((item, index) => {
        const itemSubtotal = item.quantity * item.unit_price;
        const itemVat = itemSubtotal * (item.vat_rate / 100);
        const itemTotal = itemSubtotal + itemVat;
        subtotal += itemSubtotal;
        totalVat += itemVat;
        return { ...item, subtotal: itemSubtotal, vat_amount: itemVat, total: itemTotal, sort_order: index };
      });

      const total = subtotal + totalVat;

      const { error: updateError } = await supabase
        .from('invoices')
        .update({ ...invoice, subtotal, total_vat: totalVat, total })
        .eq('id', id);

      if (updateError) return { error: updateError.message };

      await supabase.from('invoice_items').delete().eq('invoice_id', id);
      
      if (calculatedItems.length > 0) {
        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(
            calculatedItems.map(item => ({
              invoice_id: id,
              description: item.description,
              quantity: item.quantity,
              unit_price: item.unit_price,
              vat_rate: item.vat_rate,
              subtotal: item.subtotal,
              vat_amount: item.vat_amount,
              total: item.total,
              sort_order: item.sort_order,
            }))
          );

        if (itemsError) return { error: itemsError.message };
      }
    } else {
      const { error } = await supabase
        .from('invoices')
        .update(invoice)
        .eq('id', id);

      if (error) return { error: error.message };
    }

    invalidate();
    return { error: null };
  };

  const deleteInvoice = async (id: string): Promise<{ error: string | null }> => {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);

    if (error) return { error: error.message };

    invalidate();
    return { error: null };
  };

  const getInvoiceWithItems = async (id: string): Promise<{ data: Invoice | null; error: string | null }> => {
    const { data: invoiceData, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single();

    if (invoiceError) return { data: null, error: invoiceError.message };

    const { data: itemsData } = await supabase
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', id)
      .order('sort_order');

    return { data: { ...invoiceData, items: itemsData || [] } as Invoice, error: null };
  };

  const convertQuoteToInvoice = async (quoteId: string): Promise<{ data: Invoice | null; error: string | null }> => {
    const { data: quote, error: fetchError } = await getInvoiceWithItems(quoteId);
    if (fetchError || !quote) return { data: null, error: fetchError || 'Quote not found' };

    await updateInvoice(quoteId, { status: 'accepted' });

    const result = await createInvoice(
      {
        type: 'invoice',
        client_id: quote.client_id,
        client_name: quote.client_name,
        client_email: quote.client_email,
        client_phone: quote.client_phone,
        client_address: quote.client_address,
        issue_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        valid_until: null,
        status: 'draft',
        subtotal: quote.subtotal,
        total_vat: quote.total_vat,
        total: quote.total,
        notes: quote.notes,
        terms: quote.terms,
        converted_from_quote_id: quoteId,
        include_in_stats: false,
      },
      (quote.items || []).map(item => ({
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        vat_rate: item.vat_rate,
        subtotal: item.subtotal,
        vat_amount: item.vat_amount,
        total: item.total,
        sort_order: item.sort_order,
      }))
    );

    return result;
  };

  return {
    invoices,
    loading,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    getInvoiceWithItems,
    convertQuoteToInvoice,
    generateNextNumber: generateNumber,
    refetch: invalidate,
  };
}

const fetchVatRates = async (centerId: string): Promise<VatRate[]> => {
  const { data, error } = await supabase
    .from('vat_rates')
    .select('*')
    .eq('center_id', centerId)
    .order('rate', { ascending: false });

  if (error) throw new Error(error.message);
  return (data as VatRate[]) || [];
};

export function useVatRates() {
  const { center } = useMyCenter();
  const queryClient = useQueryClient();

  const queryKey = center ? VAT_RATES_QUERY_KEY(center.id) : ['vat-rates-disabled'];

  const { data: vatRates = [], isLoading: loading } = useQuery({
    queryKey,
    queryFn: () => fetchVatRates(center!.id),
    enabled: !!center,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const invalidate = useCallback(() => {
    if (!center) return;
    queryClient.invalidateQueries({ queryKey: VAT_RATES_QUERY_KEY(center.id) });
  }, [center, queryClient]);

  const createVatRate = async (rate: number, label: string): Promise<{ error: string | null }> => {
    if (!center) return { error: 'No center found' };

    const { error } = await supabase
      .from('vat_rates')
      .insert({ center_id: center.id, rate, label });

    if (error) return { error: error.message };

    invalidate();
    return { error: null };
  };

  const deleteVatRate = async (id: string): Promise<{ error: string | null }> => {
    const { error } = await supabase
      .from('vat_rates')
      .delete()
      .eq('id', id);

    if (error) return { error: error.message };

    invalidate();
    return { error: null };
  };

  return {
    vatRates,
    loading,
    createVatRate,
    deleteVatRate,
    refetch: invalidate,
  };
}
