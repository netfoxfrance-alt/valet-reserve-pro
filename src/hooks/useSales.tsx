import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMyCenter } from '@/hooks/useCenter';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from 'date-fns';

export interface Sale {
  id: string;
  center_id: string;
  appointment_id: string | null;
  client_id: string | null;
  client_name: string;
  service_name: string;
  sale_date: string;
  amount_ht: number;
  vat_rate: number;
  vat_amount: number;
  amount_ttc: number;
  deposit_amount: number;
  remaining_amount: number;
  payment_method: string;
  notes: string | null;
  created_at: string;
}

export type PeriodFilter = 'day' | 'week' | 'month' | 'all';

export function useSales() {
  const { center } = useMyCenter();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSales = async () => {
    if (!center) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .eq('center_id', center.id)
      .order('sale_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (!error && data) {
      setSales(data as Sale[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSales();
  }, [center?.id]);

  const createSale = async (sale: Omit<Sale, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('sales')
      .insert(sale)
      .select()
      .single();

    if (!error && data) {
      setSales(prev => [data as Sale, ...prev]);
    }
    return { data: data as Sale | null, error: error?.message || null };
  };

  const filterByPeriod = (period: PeriodFilter, referenceDate: Date = new Date()): Sale[] => {
    if (period === 'all') return sales;

    let start: Date, end: Date;
    switch (period) {
      case 'day':
        start = startOfDay(referenceDate);
        end = endOfDay(referenceDate);
        break;
      case 'week':
        start = startOfWeek(referenceDate, { weekStartsOn: 1 });
        end = endOfWeek(referenceDate, { weekStartsOn: 1 });
        break;
      case 'month':
        start = startOfMonth(referenceDate);
        end = endOfMonth(referenceDate);
        break;
    }

    return sales.filter(s => {
      const d = new Date(s.sale_date);
      return d >= start && d <= end;
    });
  };

  const getKPIs = (filteredSales: Sale[]) => {
    const totalRevenue = filteredSales.reduce((sum, s) => sum + Number(s.amount_ttc), 0);
    const count = filteredSales.length;
    const avgBasket = count > 0 ? totalRevenue / count : 0;
    return { totalRevenue, count, avgBasket };
  };

  const exportCSV = (filteredSales: Sale[]) => {
    const headers = ['Date', 'Client', 'Service', 'HT', 'TVA %', 'TVA', 'TTC', 'Acompte', 'Reste', 'Paiement', 'Notes'];
    const rows = filteredSales.map(s => [
      s.sale_date,
      s.client_name,
      s.service_name,
      Number(s.amount_ht).toFixed(2),
      Number(s.vat_rate).toFixed(0),
      Number(s.vat_amount).toFixed(2),
      Number(s.amount_ttc).toFixed(2),
      Number(s.deposit_amount).toFixed(2),
      Number(s.remaining_amount).toFixed(2),
      s.payment_method,
      s.notes || '',
    ]);

    const csvContent = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ventes_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return { sales, loading, createSale, filterByPeriod, getKPIs, exportCSV, refetch: fetchSales };
}
