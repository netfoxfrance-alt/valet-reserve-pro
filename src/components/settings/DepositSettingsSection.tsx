import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { Loader2, CreditCard, CheckCircle2, Clock, ExternalLink, Ban } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DepositSettingsSectionProps {
  center: {
    id: string;
    stripe_connect_account_id?: string | null;
    stripe_connect_status?: string;
    deposit_enabled?: boolean;
    deposit_type?: string;
    deposit_value?: number;
  } | null;
  subscribed: boolean;
  onUpdate: (updates: Record<string, unknown>) => Promise<{ error: string | null }>;
}

export function DepositSettingsSection({ center, subscribed, onUpdate }: DepositSettingsSectionProps) {
  const { t } = useTranslation();
  const { session } = useAuth();
  const { toast } = useToast();
  const [connecting, setConnecting] = useState(false);
  const [depositEnabled, setDepositEnabled] = useState(false);
  const [depositType, setDepositType] = useState('percentage');
  const [depositValue, setDepositValue] = useState(30);
  const [savingDeposit, setSavingDeposit] = useState(false);

  const connectStatus = (center as any)?.stripe_connect_status || 'none';
  const connectAccountId = (center as any)?.stripe_connect_account_id || null;

  useEffect(() => {
    if (center) {
      setDepositEnabled((center as any)?.deposit_enabled || false);
      setDepositType((center as any)?.deposit_type || 'percentage');
      setDepositValue((center as any)?.deposit_value || 30);
    }
  }, [center]);

  const handleConnectStripe = async () => {
    if (!session?.access_token) return;
    setConnecting(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-connect-account', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Connect error:', error);
      toast({ title: t('common.error'), description: t('settings.portalError'), variant: 'destructive' });
    } finally {
      setConnecting(false);
    }
  };

  const handleSaveDeposit = async () => {
    setSavingDeposit(true);
    const { error } = await onUpdate({
      deposit_enabled: depositEnabled,
      deposit_type: depositType,
      deposit_value: depositValue,
    });
    setSavingDeposit(false);

    if (error) {
      toast({ title: t('common.error'), description: error, variant: 'destructive' });
    } else {
      toast({ title: t('settings.depositSaved') });
    }
  };

  // Pro-only gate
  if (!subscribed) {
    return (
      <section className="mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-1 sm:mb-2">{t('settings.deposits')}</h2>
        <p className="text-sm text-muted-foreground mb-4 sm:mb-6">{t('settings.depositsDesc')}</p>
        <Card variant="elevated" className="p-4 sm:p-6">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Ban className="w-5 h-5" />
            <p className="text-sm">{t('settings.proOnly')}</p>
          </div>
        </Card>
      </section>
    );
  }

  return (
    <section className="mb-6 sm:mb-8">
      <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-1 sm:mb-2">{t('settings.deposits')}</h2>
      <p className="text-sm text-muted-foreground mb-4 sm:mb-6">{t('settings.depositsDesc')}</p>

      <Card variant="elevated" className="p-4 sm:p-6 space-y-6">
        {/* Stripe Connect Status */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              connectStatus === 'active' ? "bg-emerald-500/10" : "bg-primary/10"
            )}>
              {connectStatus === 'active' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              ) : connectStatus === 'pending' ? (
                <Clock className="w-5 h-5 text-amber-500" />
              ) : (
                <CreditCard className="w-5 h-5 text-primary" />
              )}
            </div>
            <div>
              <p className="font-medium text-foreground">
                {connectStatus === 'active'
                  ? t('settings.stripeConnected')
                  : connectStatus === 'pending'
                    ? t('settings.stripePending')
                    : t('settings.connectStripe')}
              </p>
              <p className="text-sm text-muted-foreground">
                {connectStatus === 'active'
                  ? t('settings.stripeConnectedDesc')
                  : connectStatus === 'pending'
                    ? t('settings.stripePendingDesc')
                    : t('settings.connectStripeDesc')}
              </p>
            </div>
          </div>

          <Button
            variant={connectStatus === 'active' ? 'outline' : 'premium'}
            size="sm"
            onClick={handleConnectStripe}
            disabled={connecting}
            className="w-full sm:w-auto"
          >
            {connecting ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t('settings.stripeConnecting')}</>
            ) : connectStatus === 'active' ? (
              <><ExternalLink className="w-4 h-4 mr-2" />{t('settings.viewStripeDashboard')}</>
            ) : connectStatus === 'pending' ? (
              t('settings.stripeCompleteOnboarding')
            ) : (
              t('settings.connectStripe')
            )}
          </Button>
        </div>

        {/* Deposit Configuration - only show when Stripe is connected */}
        {connectStatus === 'active' && (
          <div className="border-t border-border pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="deposit-toggle" className="text-base font-medium">
                {t('settings.enableDeposits')}
              </Label>
              <Switch
                id="deposit-toggle"
                checked={depositEnabled}
                onCheckedChange={setDepositEnabled}
              />
            </div>

            {depositEnabled && (
              <div className="space-y-4 pl-0 sm:pl-2">
                <div className="space-y-2">
                  <Label>{t('settings.depositType')}</Label>
                  <Select value={depositType} onValueChange={setDepositType}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">{t('settings.depositPercentage')}</SelectItem>
                      <SelectItem value="fixed">{t('settings.depositFixed')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deposit-value">{t('settings.depositValue')}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="deposit-value"
                      type="number"
                      min={1}
                      max={depositType === 'percentage' ? 100 : 10000}
                      value={depositValue}
                      onChange={(e) => setDepositValue(Number(e.target.value))}
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">
                      {depositType === 'percentage' ? t('settings.depositPercentageLabel') : t('settings.depositFixedLabel')}
                    </span>
                  </div>
                </div>

                <Button
                  variant="premium"
                  size="sm"
                  onClick={handleSaveDeposit}
                  disabled={savingDeposit}
                  className="w-full sm:w-auto"
                >
                  {savingDeposit ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t('common.saving')}</>
                  ) : (
                    t('common.save')
                  )}
                </Button>
              </div>
            )}
          </div>
        )}

        {connectStatus !== 'active' && depositEnabled && (
          <p className="text-xs text-amber-600">{t('settings.depositConnectFirst')}</p>
        )}
      </Card>
    </section>
  );
}
