import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Appointment } from '@/hooks/useAppointments';
import { useSales } from '@/hooks/useSales';
import { useMyCenter } from '@/hooks/useCenter';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Banknote, CreditCard, Building2, Zap } from 'lucide-react';

interface CompleteSaleDialogProps {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (appointmentId: string) => void;
}

const paymentMethods = [
  { value: 'cash', label: 'Espèces', labelEn: 'Cash', icon: Banknote },
  { value: 'card', label: 'Carte bancaire', labelEn: 'Card', icon: CreditCard },
  { value: 'transfer', label: 'Virement', labelEn: 'Transfer', icon: Building2 },
  { value: 'stripe', label: 'Stripe', labelEn: 'Stripe', icon: Zap },
];

export function CompleteSaleDialog({ appointment, open, onOpenChange, onComplete }: CompleteSaleDialogProps) {
  const { t, i18n } = useTranslation();
  const { center } = useMyCenter();
  const { createSale } = useSales();

  const price = appointment?.custom_price ?? appointment?.custom_service?.price ?? appointment?.pack?.price ?? 0;
  const serviceName = appointment?.custom_service?.name || appointment?.pack?.name || t('customServices.title');
  const depositPaid = (appointment?.deposit_status === 'paid' && appointment?.deposit_refund_status !== 'refunded')
    ? (appointment?.deposit_amount || 0)
    : 0;

  const [amountTTC, setAmountTTC] = useState(price);
  const [vatRate, setVatRate] = useState(20);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (appointment && open) {
      setAmountTTC(price);
      setVatRate(20);
      setPaymentMethod('cash');
      setNotes('');
    }
  }, [appointment?.id, open]);

  const amountHT = amountTTC / (1 + vatRate / 100);
  const vatAmount = amountTTC - amountHT;
  const remaining = amountTTC - depositPaid;

  const handleSubmit = async () => {
    if (!appointment || !center) return;
    setSubmitting(true);

    const { error } = await createSale({
      center_id: center.id,
      appointment_id: appointment.id,
      client_id: appointment.client_id || null,
      client_name: appointment.client_name,
      service_name: serviceName,
      sale_date: appointment.appointment_date,
      amount_ht: Math.round(amountHT * 100) / 100,
      vat_rate: vatRate,
      vat_amount: Math.round(vatAmount * 100) / 100,
      amount_ttc: amountTTC,
      deposit_amount: depositPaid,
      remaining_amount: Math.max(0, Math.round(remaining * 100) / 100),
      payment_method: paymentMethod,
      notes: notes || null,
    });

    if (error) {
      toast.error(t('common.error'));
    } else {
      toast.success(t('sales.saleCreated'));
      onComplete(appointment.id);
      onOpenChange(false);
    }
    setSubmitting(false);
  };

  if (!appointment) return null;

  const isFr = i18n.language === 'fr';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('sales.completeSale')}</DialogTitle>
          <DialogDescription>
            {appointment.client_name} — {serviceName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Amount TTC */}
          <div>
            <Label>{t('sales.amountTTC')}</Label>
            <Input
              type="number"
              step="0.01"
              value={amountTTC}
              onChange={e => setAmountTTC(parseFloat(e.target.value) || 0)}
            />
          </div>

          {/* VAT Rate */}
          <div>
            <Label>{t('sales.vatRate')}</Label>
            <Select value={String(vatRate)} onValueChange={v => setVatRate(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0%</SelectItem>
                <SelectItem value="5.5">5.5%</SelectItem>
                <SelectItem value="10">10%</SelectItem>
                <SelectItem value="20">20%</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Computed values */}
          <div className="bg-secondary/30 rounded-xl p-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('sales.amountHT')}</span>
              <span className="font-medium">{amountHT.toFixed(2)}€</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('sales.vat')}</span>
              <span className="font-medium">{vatAmount.toFixed(2)}€</span>
            </div>
            {depositPaid > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>{t('sales.depositPaid')}</span>
                <span className="font-medium">-{depositPaid.toFixed(2)}€</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base pt-1 border-t border-border">
              <span>{t('sales.remaining')}</span>
              <span>{Math.max(0, remaining).toFixed(2)}€</span>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <Label>{t('sales.paymentMethod')}</Label>
            <div className="grid grid-cols-2 gap-2 mt-1.5">
              {paymentMethods.map(pm => (
                <button
                  key={pm.value}
                  type="button"
                  onClick={() => setPaymentMethod(pm.value)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    paymentMethod === pm.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  <pm.icon className="w-4 h-4" />
                  {isFr ? pm.label : pm.labelEn}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label>{t('common.notes')}</Label>
            <Textarea
              placeholder={t('sales.notesPlaceholder')}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('common.cancel')}</Button>
          <Button onClick={handleSubmit} disabled={submitting || amountTTC <= 0}>
            {submitting ? t('common.saving') : t('sales.validate')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
