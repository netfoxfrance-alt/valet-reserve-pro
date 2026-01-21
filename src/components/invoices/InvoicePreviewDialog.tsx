import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Invoice, InvoiceItem, useInvoices } from '@/hooks/useInvoices';
import { Center } from '@/hooks/useCenter';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Printer, Download, Send, FileCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InvoicePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice | null;
  center: Center;
}

export function InvoicePreviewDialog({ open, onOpenChange, invoice, center }: InvoicePreviewDialogProps) {
  const { getInvoiceWithItems, updateInvoice } = useInvoices();
  const { toast } = useToast();
  const [fullInvoice, setFullInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (invoice && open) {
      setLoading(true);
      getInvoiceWithItems(invoice.id).then(({ data }) => {
        setFullInvoice(data);
        setLoading(false);
      });
    }
  }, [invoice?.id, open]);

  const handlePrint = () => {
    window.print();
  };

  const handleMarkSent = async () => {
    if (!invoice) return;
    
    const { error } = await updateInvoice(invoice.id, { status: 'sent' });
    if (error) {
      toast({
        title: 'Erreur',
        description: error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Statut mis à jour',
        description: `${invoice.type === 'invoice' ? 'Facture' : 'Devis'} marqué comme envoyé.`,
      });
      setFullInvoice(prev => prev ? { ...prev, status: 'sent' } : null);
    }
  };

  if (!invoice || loading || !fullInvoice) {
    return null;
  }

  const isInvoice = fullInvoice.type === 'invoice';
  const title = isInvoice ? 'FACTURE' : 'DEVIS';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto p-0">
        {/* Actions Bar */}
        <div className="sticky top-0 z-10 bg-background border-b p-4 flex items-center justify-between">
          <DialogTitle className="text-lg font-semibold">
            {title} {fullInvoice.number}
          </DialogTitle>
          <div className="flex gap-2">
            {fullInvoice.status === 'draft' && (
              <Button variant="outline" size="sm" onClick={handleMarkSent}>
                <Send className="w-4 h-4 mr-2" />
                Marquer envoyé
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Imprimer
            </Button>
          </div>
        </div>

        {/* Invoice Content - Print-friendly */}
        <div ref={printRef} className="p-8 bg-white text-black print:p-0">
          <style>
            {`
              @media print {
                body * { visibility: hidden; }
                .print-area, .print-area * { visibility: visible; }
                .print-area { position: absolute; left: 0; top: 0; width: 100%; }
              }
            `}
          </style>
          
          <div className="print-area space-y-8">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                {center.logo_url && (
                  <img 
                    src={center.logo_url} 
                    alt={center.name}
                    className="max-h-16 max-w-[200px] object-contain mb-3"
                  />
                )}
                <h2 className="text-xl font-bold">{center.name}</h2>
                {center.address && (
                  <p className="text-sm text-gray-600">{center.address}</p>
                )}
                {center.phone && (
                  <p className="text-sm text-gray-600">Tél: {center.phone}</p>
                )}
                {center.email && (
                  <p className="text-sm text-gray-600">{center.email}</p>
                )}
              </div>
              <div className="text-right">
                <h1 className="text-3xl font-bold text-primary mb-2">{title}</h1>
                <p className="text-lg font-semibold">{fullInvoice.number}</p>
                <p className="text-sm text-gray-600 mt-2">
                  Date: {format(new Date(fullInvoice.issue_date), 'dd MMMM yyyy', { locale: fr })}
                </p>
                {isInvoice && fullInvoice.due_date && (
                  <p className="text-sm text-gray-600">
                    Échéance: {format(new Date(fullInvoice.due_date), 'dd MMMM yyyy', { locale: fr })}
                  </p>
                )}
                {!isInvoice && fullInvoice.valid_until && (
                  <p className="text-sm text-gray-600">
                    Valable jusqu'au: {format(new Date(fullInvoice.valid_until), 'dd MMMM yyyy', { locale: fr })}
                  </p>
                )}
              </div>
            </div>

            {/* Client Info */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <p className="text-xs uppercase text-gray-500 mb-1">Facturé à</p>
              <p className="font-semibold text-lg">{fullInvoice.client_name}</p>
              {fullInvoice.client_address && (
                <p className="text-sm text-gray-600">{fullInvoice.client_address}</p>
              )}
              {fullInvoice.client_phone && (
                <p className="text-sm text-gray-600">Tél: {fullInvoice.client_phone}</p>
              )}
              {fullInvoice.client_email && (
                <p className="text-sm text-gray-600">{fullInvoice.client_email}</p>
              )}
            </div>

            {/* Items Table */}
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left p-3 text-sm font-semibold">Description</th>
                    <th className="text-right p-3 text-sm font-semibold w-20">Qté</th>
                    <th className="text-right p-3 text-sm font-semibold w-28">Prix HT</th>
                    <th className="text-right p-3 text-sm font-semibold w-20">TVA</th>
                    <th className="text-right p-3 text-sm font-semibold w-28">Total HT</th>
                  </tr>
                </thead>
                <tbody>
                  {fullInvoice.items?.map((item, index) => (
                    <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-3 text-sm">{item.description}</td>
                      <td className="p-3 text-sm text-right">{item.quantity}</td>
                      <td className="p-3 text-sm text-right">{item.unit_price.toFixed(2)}€</td>
                      <td className="p-3 text-sm text-right">{item.vat_rate}%</td>
                      <td className="p-3 text-sm text-right font-medium">{item.subtotal.toFixed(2)}€</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sous-total HT</span>
                  <span>{fullInvoice.subtotal.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">TVA</span>
                  <span>{fullInvoice.total_vat.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total TTC</span>
                  <span className="text-primary">{fullInvoice.total.toFixed(2)}€</span>
                </div>
              </div>
            </div>

            {/* Notes & Terms */}
            {(fullInvoice.notes || fullInvoice.terms) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
                {fullInvoice.notes && (
                  <div>
                    <p className="text-xs uppercase text-gray-500 mb-1">Notes</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{fullInvoice.notes}</p>
                  </div>
                )}
                {fullInvoice.terms && (
                  <div>
                    <p className="text-xs uppercase text-gray-500 mb-1">Conditions de paiement</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{fullInvoice.terms}</p>
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="pt-8 border-t text-center text-xs text-gray-500">
              <p>{center.name} {center.address && `• ${center.address}`}</p>
              <p className="mt-1">
                {isInvoice 
                  ? 'En cas de retard de paiement, une pénalité de 3 fois le taux d\'intérêt légal sera appliquée.'
                  : 'Ce devis est valable 30 jours à compter de sa date d\'émission.'
                }
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
