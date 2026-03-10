import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useSales, PeriodFilter } from '@/hooks/useSales';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, Search, TrendingUp, ShoppingCart, Euro, Banknote, CreditCard, Building2, Zap } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

const paymentIcons: Record<string, typeof Banknote> = {
  cash: Banknote,
  card: CreditCard,
  transfer: Building2,
  stripe: Zap,
};

const paymentLabels: Record<string, { fr: string; en: string }> = {
  cash: { fr: 'Espèces', en: 'Cash' },
  card: { fr: 'CB', en: 'Card' },
  transfer: { fr: 'Virement', en: 'Transfer' },
  stripe: { fr: 'Stripe', en: 'Stripe' },
};

export default function DashboardSales() {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === 'en' ? enUS : fr;
  const isFr = i18n.language === 'fr';
  const { sales, loading, filterByPeriod, getKPIs, exportCSV } = useSales();

  const [period, setPeriod] = useState<PeriodFilter>('day');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSales = useMemo(() => {
    let result = filterByPeriod(period);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s =>
        s.client_name.toLowerCase().includes(q) ||
        s.service_name.toLowerCase().includes(q)
      );
    }
    return result;
  }, [sales, period, searchQuery]);

  const kpis = useMemo(() => getKPIs(filteredSales), [filteredSales]);

  const periods: { key: PeriodFilter; label: string }[] = [
    { key: 'day', label: t('sales.today') },
    { key: 'week', label: t('sales.week') },
    { key: 'month', label: t('sales.month') },
    { key: 'all', label: t('common.all') },
  ];

  if (loading) {
    return (
      <DashboardLayout title={t('sales.title')}>
        <div className="space-y-4">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}
          </div>
          <Skeleton className="h-96" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t('sales.title')}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{t('sales.title')}</h1>
            <p className="text-muted-foreground">{t('sales.subtitle')}</p>
          </div>
          <Button
            variant="outline"
            onClick={() => exportCSV(filteredSales)}
            className="gap-2"
            disabled={filteredSales.length === 0}
          >
            <Download className="w-4 h-4" />
            {t('sales.exportCSV')}
          </Button>
        </div>

        {/* Period filters */}
        <div className="flex gap-2">
          {periods.map(p => (
            <Button
              key={p.key}
              variant={period === p.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod(p.key)}
              className="rounded-xl"
            >
              {p.label}
            </Button>
          ))}
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center">
                <Euro className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('sales.revenue')}</p>
                <p className="text-2xl font-bold">{kpis.totalRevenue.toFixed(0)}€</p>
              </div>
            </div>
          </Card>
          <Card className="p-5 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('sales.salesCount')}</p>
                <p className="text-2xl font-bold">{kpis.count}</p>
              </div>
            </div>
          </Card>
          <Card className="p-5 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('sales.avgBasket')}</p>
                <p className="text-2xl font-bold">{kpis.avgBasket.toFixed(0)}€</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t('common.search') + '...'}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 max-w-sm"
          />
        </div>

        {/* Sales list */}
        {filteredSales.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">{t('sales.noSales')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredSales.map(sale => {
              const PaymentIcon = paymentIcons[sale.payment_method] || Banknote;
              const paymentLabel = paymentLabels[sale.payment_method]?.[isFr ? 'fr' : 'en'] || sale.payment_method;

              return (
                <Card key={sale.id} className="p-4 rounded-2xl">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-semibold truncate">{sale.client_name}</p>
                        <Badge variant="outline" className="text-xs gap-1 shrink-0">
                          <PaymentIcon className="w-3 h-3" />
                          {paymentLabel}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {sale.service_name} • {format(parseISO(sale.sale_date), 'd MMM yyyy', { locale: dateLocale })}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-lg">{Number(sale.amount_ttc).toFixed(0)}€</p>
                      {sale.deposit_amount > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {t('sales.deposit')}: {Number(sale.deposit_amount).toFixed(0)}€
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
