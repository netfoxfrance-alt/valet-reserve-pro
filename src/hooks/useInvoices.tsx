import { useState, useEffect } from 'react';
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

export function useInvoices() {
  const { center } = useMyCenter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    if (!center) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('center_id', center.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setInvoices(data as Invoice[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInvoices();
  }, [center?.id]);

  const generateNumber = async (type: 'invoice' | 'quote'): Promise<string> => {
    if (!center) return '';
    
    const year = new Date().getFullYear();
    const prefix = type === 'invoice' ? 'FAC' : 'DEV';
    
    // Get the last number for this type and year
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
    invoice: Omit<Invoice, 'id' | 'center_id' | 'created_at' | 'updated_at' | 'number'>,
    items: Omit<InvoiceItem, 'id' | 'invoice_id'>[]
  ): Promise<{ data: Invoice | null; error: string | null }> => {
    if (!center) return { data: null, error: 'No center found' };

    const number = await generateNumber(invoice.type);

    // Calculate totals
    let subtotal = 0;
    let totalVat = 0;
    
    const calculatedItems = items.map((item, index) => {
      const itemSubtotal = item.quantity * item.unit_price;
      const itemVat = itemSubtotal * (item.vat_rate / 100);
      const itemTotal = itemSubtotal + itemVat;
      
      subtotal += itemSubtotal;
      totalVat += itemVat;
      
      return {
        ...item,
        subtotal: itemSubtotal,
        vat_amount: itemVat,
        total: itemTotal,
        sort_order: index,
      };
    });

    const total = subtotal + totalVat;

    // Insert invoice
    const { data: invoiceData, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        center_id: center.id,
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
      })
      .select()
      .single();

    if (invoiceError) {
      return { data: null, error: invoiceError.message };
    }

    // Insert items
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
        // Rollback invoice
        await supabase.from('invoices').delete().eq('id', invoiceData.id);
        return { data: null, error: itemsError.message };
      }
    }

    await fetchInvoices();
    return { data: invoiceData as Invoice, error: null };
  };

  const updateInvoice = async (
    id: string,
    invoice: Partial<Omit<Invoice, 'id' | 'center_id' | 'created_at' | 'updated_at' | 'number'>>,
    items?: Omit<InvoiceItem, 'id' | 'invoice_id'>[]
  ): Promise<{ error: string | null }> => {
    if (items) {
      // Recalculate totals
      let subtotal = 0;
      let totalVat = 0;
      
      const calculatedItems = items.map((item, index) => {
        const itemSubtotal = item.quantity * item.unit_price;
        const itemVat = itemSubtotal * (item.vat_rate / 100);
        const itemTotal = itemSubtotal + itemVat;
        
        subtotal += itemSubtotal;
        totalVat += itemVat;
        
        return {
          ...item,
          subtotal: itemSubtotal,
          vat_amount: itemVat,
          total: itemTotal,
          sort_order: index,
        };
      });

      const total = subtotal + totalVat;

      // Update invoice with new totals
      const { error: updateError } = await supabase
        .from('invoices')
        .update({
          ...invoice,
          subtotal,
          total_vat: totalVat,
          total,
        })
        .eq('id', id);

      if (updateError) {
        return { error: updateError.message };
      }

      // Delete existing items and insert new ones
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

        if (itemsError) {
          return { error: itemsError.message };
        }
      }
    } else {
      const { error } = await supabase
        .from('invoices')
        .update(invoice)
        .eq('id', id);

      if (error) {
        return { error: error.message };
      }
    }

    await fetchInvoices();
    return { error: null };
  };

  const deleteInvoice = async (id: string): Promise<{ error: string | null }> => {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);

    if (error) {
      return { error: error.message };
    }

    await fetchInvoices();
    return { error: null };
  };

  const getInvoiceWithItems = async (id: string): Promise<{ data: Invoice | null; error: string | null }> => {
    const { data: invoiceData, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single();

    if (invoiceError) {
      return { data: null, error: invoiceError.message };
    }

    const { data: itemsData } = await supabase
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', id)
      .order('sort_order');

    return {
      data: {
        ...invoiceData,
        items: itemsData || [],
      } as Invoice,
      error: null,
    };
  };

  const convertQuoteToInvoice = async (quoteId: string): Promise<{ data: Invoice | null; error: string | null }> => {
    const { data: quote, error: fetchError } = await getInvoiceWithItems(quoteId);
    
    if (fetchError || !quote) {
      return { data: null, error: fetchError || 'Quote not found' };
    }

    // Mark quote as accepted
    await updateInvoice(quoteId, { status: 'accepted' });

    // Create new invoice from quote
    const result = await createInvoice(
      {
        type: 'invoice',
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
    refetch: fetchInvoices,
  };
}

export function useVatRates() {
  const { center } = useMyCenter();
  const [vatRates, setVatRates] = useState<VatRate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVatRates = async () => {
    if (!center) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('vat_rates')
      .select('*')
      .eq('center_id', center.id)
      .order('rate', { ascending: false });

    if (!error && data) {
      setVatRates(data as VatRate[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVatRates();
  }, [center?.id]);

  const createVatRate = async (rate: number, label: string): Promise<{ error: string | null }> => {
    if (!center) return { error: 'No center found' };

    const { error } = await supabase
      .from('vat_rates')
      .insert({
        center_id: center.id,
        rate,
        label,
      });

    if (error) {
      return { error: error.message };
    }

    await fetchVatRates();
    return { error: null };
  };

  const deleteVatRate = async (id: string): Promise<{ error: string | null }> => {
    const { error } = await supabase
      .from('vat_rates')
      .delete()
      .eq('id', id);

    if (error) {
      return { error: error.message };
    }

    await fetchVatRates();
    return { error: null };
  };

  return {
    vatRates,
    loading,
    createVatRate,
    deleteVatRate,
    refetch: fetchVatRates,
  };
}
