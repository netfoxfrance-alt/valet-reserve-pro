import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Invoice, InvoiceItem, useInvoices } from '@/hooks/useInvoices';
import { Center } from '@/hooks/useCenter';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Printer, Send, Mail, Loader2, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  const [sendingEmail, setSendingEmail] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [emailToSend, setEmailToSend] = useState('');
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (invoice && open) {
      setLoading(true);
      setShowEmailInput(false);
      setEmailToSend(invoice.client_email || '');
      getInvoiceWithItems(invoice.id).then(({ data }) => {
        setFullInvoice(data);
        setLoading(false);
      });
    }
  }, [invoice?.id, open]);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const isInv = fullInvoice?.type === 'invoice';
    const docTitle = isInv ? 'FACTURE' : 'DEVIS';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${docTitle} ${fullInvoice?.number || ''}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111827; background: white; }
          .page { width: 210mm; min-height: 297mm; padding: 20mm 18mm; margin: 0 auto; position: relative; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
          .company-info { flex: 1; }
          .company-logo { max-height: 56px; max-width: 160px; object-fit: contain; border-radius: 10px; margin-bottom: 10px; display: block; }
          .company-name { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
          .company-detail { font-size: 11px; color: #6b7280; line-height: 1.6; }
          .doc-info { text-align: right; }
          .doc-type { font-size: 28px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 6px; }
          .doc-number { font-size: 15px; font-weight: 600; margin-bottom: 4px; }
          .doc-date { font-size: 11px; color: #6b7280; }
          .client-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px 20px; margin-bottom: 28px; }
          .client-label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px; color: #9ca3af; font-weight: 600; margin-bottom: 6px; }
          .client-name { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
          .client-detail { font-size: 11px; color: #6b7280; line-height: 1.6; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          thead tr { background: #f3f4f6; }
          th { padding: 10px 12px; font-size: 11px; font-weight: 600; text-align: left; border-bottom: 1px solid #e5e7eb; }
          th.right { text-align: right; }
          th.center { text-align: center; }
          td { padding: 10px 12px; font-size: 12px; border-bottom: 1px solid #e5e7eb; }
          td.right { text-align: right; }
          td.center { text-align: center; }
          td.bold { font-weight: 600; }
          tr:nth-child(even) { background: #f9fafb; }
          .totals { display: flex; justify-content: flex-end; margin-bottom: 24px; }
          .totals-table { width: 240px; }
          .totals-row { display: flex; justify-content: space-between; padding: 3px 0; font-size: 12px; }
          .totals-row .label { color: #6b7280; }
          .totals-row .value { font-weight: 500; }
          .totals-separator { border-top: 2px solid #e5e7eb; margin: 8px 0; }
          .totals-total { display: flex; justify-content: space-between; padding: 4px 0; font-size: 16px; font-weight: 700; }
          .notes-section { margin-bottom: 16px; }
          .notes-label { font-size: 9px; text-transform: uppercase; color: #9ca3af; font-weight: 600; margin-bottom: 4px; }
          .notes-text { font-size: 11px; color: #6b7280; line-height: 1.5; white-space: pre-wrap; }
          .footer { position: absolute; bottom: 16mm; left: 18mm; right: 18mm; text-align: center; font-size: 10px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 12px; }
          .footer p { margin-bottom: 3px; }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .page { padding: 14mm 16mm; }
          }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
      </body>
      </html>
    `);
    printWindow.document.close();
    
    // Wait for images to load then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 300);
    };
  };

  const handleMarkSent = async () => {
    if (!invoice) return;
    
    const { error } = await updateInvoice(invoice.id, { status: 'sent' });
    if (error) {
      toast({ title: 'Erreur', description: error, variant: 'destructive' });
    } else {
      toast({
        title: 'Statut mis à jour',
        description: `${invoice.type === 'invoice' ? 'Facture' : 'Devis'} marqué comme envoyé.`,
      });
      setFullInvoice(prev => prev ? { ...prev, status: 'sent' } : null);
    }
  };

  const handleSendEmail = async () => {
    if (!invoice || !emailToSend.trim()) {
      toast({ title: 'Erreur', description: 'Veuillez entrer une adresse email valide', variant: 'destructive' });
      return;
    }

    setSendingEmail(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-invoice-email', {
        body: { invoiceId: invoice.id, recipientEmail: emailToSend.trim() },
      });
      if (error) throw error;
      toast({
        title: 'Envoyé !',
        description: `${fullInvoice?.type === 'invoice' ? 'Facture' : 'Devis'} envoyé à ${emailToSend}`,
      });
      setShowEmailInput(false);
      setFullInvoice(prev => prev ? { ...prev, status: 'sent' } : null);
    } catch (error: any) {
      console.error('Error sending email:', error);
      toast({ title: 'Erreur', description: error.message || 'Impossible d\'envoyer l\'email', variant: 'destructive' });
    } finally {
      setSendingEmail(false);
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
        <div className="sticky top-0 z-10 bg-background border-b p-4 space-y-3">
          <div className="flex items-center justify-between">
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
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowEmailInput(!showEmailInput)}
              >
                <Mail className="w-4 h-4 mr-2" />
                Envoyer par email
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                Imprimer
              </Button>
            </div>
          </div>
          
          {/* Email Input */}
          {showEmailInput && (
            <div className="flex gap-2 items-end p-3 rounded-lg bg-muted/50">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="emailToSend" className="text-xs">Adresse email du destinataire</Label>
                <Input
                  id="emailToSend"
                  type="email"
                  value={emailToSend}
                  onChange={(e) => setEmailToSend(e.target.value)}
                  placeholder="email@exemple.com"
                  className="h-9"
                />
              </div>
              <Button 
                size="sm" 
                onClick={handleSendEmail} 
                disabled={sendingEmail || !emailToSend.trim()}
                className="h-9"
              >
                {sendingEmail ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-1" />
                    Envoyer
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Invoice Content - Visual Preview */}
        <div className="p-8 bg-muted/30">
          <div className="bg-white rounded-xl shadow-md mx-auto" style={{ maxWidth: '680px' }}>
            {/* Hidden printable version */}
            <div ref={printRef} className="hidden">
              <div className="page">
                {/* Header */}
                <div className="header">
                  <div className="company-info">
                    {center.logo_url && (
                      <img src={center.logo_url} alt={center.name} className="company-logo" />
                    )}
                    <div className="company-name">{center.name}</div>
                    {center.address && <div className="company-detail">{center.address}</div>}
                    {center.phone && <div className="company-detail">Tél: {center.phone}</div>}
                    {center.email && <div className="company-detail">{center.email}</div>}
                  </div>
                  <div className="doc-info">
                    <div className="doc-type">{title}</div>
                    <div className="doc-number">{fullInvoice.number}</div>
                    <div className="doc-date">Date: {format(new Date(fullInvoice.issue_date), 'dd MMMM yyyy', { locale: fr })}</div>
                    {isInvoice && fullInvoice.due_date && (
                      <div className="doc-date">Échéance: {format(new Date(fullInvoice.due_date), 'dd MMMM yyyy', { locale: fr })}</div>
                    )}
                    {!isInvoice && fullInvoice.valid_until && (
                      <div className="doc-date">Valable jusqu'au: {format(new Date(fullInvoice.valid_until), 'dd MMMM yyyy', { locale: fr })}</div>
                    )}
                  </div>
                </div>

                {/* Client Box */}
                <div className="client-box">
                  <div className="client-label">{isInvoice ? 'Facturé à' : 'Devis pour'}</div>
                  <div className="client-name">{fullInvoice.client_name}</div>
                  {fullInvoice.client_address && <div className="client-detail">{fullInvoice.client_address}</div>}
                  {fullInvoice.client_phone && <div className="client-detail">Tél: {fullInvoice.client_phone}</div>}
                  {fullInvoice.client_email && <div className="client-detail">{fullInvoice.client_email}</div>}
                </div>

                {/* Items Table */}
                <table>
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th className="center" style={{ width: '60px' }}>Qté</th>
                      <th className="right" style={{ width: '100px' }}>Prix HT</th>
                      <th className="right" style={{ width: '60px' }}>TVA</th>
                      <th className="right" style={{ width: '110px' }}>Total HT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fullInvoice.items?.map((item) => (
                      <tr key={item.id}>
                        <td>{item.description}</td>
                        <td className="center">{item.quantity}</td>
                        <td className="right">{item.unit_price.toFixed(2)}€</td>
                        <td className="right">{item.vat_rate}%</td>
                        <td className="right bold">{item.subtotal.toFixed(2)}€</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals */}
                <div className="totals">
                  <div className="totals-table">
                    <div className="totals-row">
                      <span className="label">Sous-total HT</span>
                      <span className="value">{fullInvoice.subtotal.toFixed(2)}€</span>
                    </div>
                    <div className="totals-row">
                      <span className="label">TVA</span>
                      <span className="value">{fullInvoice.total_vat.toFixed(2)}€</span>
                    </div>
                    <div className="totals-separator"></div>
                    <div className="totals-total">
                      <span>Total TTC</span>
                      <span>{fullInvoice.total.toFixed(2)}€</span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {fullInvoice.notes && (
                  <div className="notes-section">
                    <div className="notes-label">Notes</div>
                    <div className="notes-text">{fullInvoice.notes}</div>
                  </div>
                )}
                {fullInvoice.terms && (
                  <div className="notes-section">
                    <div className="notes-label">Conditions de paiement</div>
                    <div className="notes-text">{fullInvoice.terms}</div>
                  </div>
                )}

                {/* Footer */}
                <div className="footer">
                  <p>{center.name} {center.address && `• ${center.address}`}</p>
                  <p>
                    {isInvoice 
                      ? 'En cas de retard de paiement, une pénalité de 3 fois le taux d\'intérêt légal sera appliquée.'
                      : 'Ce devis est valable 30 jours à compter de sa date d\'émission.'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Visible Preview */}
            <div className="p-8 space-y-7">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  {center.logo_url && (
                    <img 
                      src={center.logo_url} 
                      alt={center.name}
                      className="max-h-14 max-w-[160px] object-contain mb-3 rounded-lg"
                    />
                  )}
                  <h2 className="text-lg font-bold text-foreground">{center.name}</h2>
                  {center.address && <p className="text-xs text-muted-foreground leading-relaxed">{center.address}</p>}
                  {center.phone && <p className="text-xs text-muted-foreground">Tél: {center.phone}</p>}
                  {center.email && <p className="text-xs text-muted-foreground">{center.email}</p>}
                </div>
                <div className="text-right">
                  <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-1">{title}</h1>
                  <p className="text-base font-semibold text-foreground">{fullInvoice.number}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Date: {format(new Date(fullInvoice.issue_date), 'dd MMMM yyyy', { locale: fr })}
                  </p>
                  {isInvoice && fullInvoice.due_date && (
                    <p className="text-xs text-muted-foreground">
                      Échéance: {format(new Date(fullInvoice.due_date), 'dd MMMM yyyy', { locale: fr })}
                    </p>
                  )}
                  {!isInvoice && fullInvoice.valid_until && (
                    <p className="text-xs text-muted-foreground">
                      Valable jusqu'au: {format(new Date(fullInvoice.valid_until), 'dd MMMM yyyy', { locale: fr })}
                    </p>
                  )}
                </div>
              </div>

              {/* Client Info */}
              <div className="border rounded-xl p-4 bg-muted/30">
                <p className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider mb-1">
                  {isInvoice ? 'Facturé à' : 'Devis pour'}
                </p>
                <p className="font-bold text-base text-foreground">{fullInvoice.client_name}</p>
                {fullInvoice.client_address && <p className="text-xs text-muted-foreground">{fullInvoice.client_address}</p>}
                {fullInvoice.client_phone && <p className="text-xs text-muted-foreground">Tél: {fullInvoice.client_phone}</p>}
                {fullInvoice.client_email && <p className="text-xs text-muted-foreground">{fullInvoice.client_email}</p>}
              </div>

              {/* Items Table */}
              <div className="overflow-hidden rounded-xl border">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 text-xs font-semibold text-foreground">Description</th>
                      <th className="text-center p-3 text-xs font-semibold text-foreground w-14">Qté</th>
                      <th className="text-right p-3 text-xs font-semibold text-foreground w-24">Prix HT</th>
                      <th className="text-right p-3 text-xs font-semibold text-foreground w-16">TVA</th>
                      <th className="text-right p-3 text-xs font-semibold text-foreground w-24">Total HT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fullInvoice.items?.map((item, index) => (
                      <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-muted/20'}>
                        <td className="p-3 text-xs text-foreground">{item.description}</td>
                        <td className="p-3 text-xs text-foreground text-center">{item.quantity}</td>
                        <td className="p-3 text-xs text-foreground text-right">{item.unit_price.toFixed(2)}€</td>
                        <td className="p-3 text-xs text-foreground text-right">{item.vat_rate}%</td>
                        <td className="p-3 text-xs text-foreground text-right font-semibold">{item.subtotal.toFixed(2)}€</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-60 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Sous-total HT</span>
                    <span className="font-medium text-foreground">{fullInvoice.subtotal.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">TVA</span>
                    <span className="font-medium text-foreground">{fullInvoice.total_vat.toFixed(2)}€</span>
                  </div>
                  <div className="border-t-2 border-border my-2" />
                  <div className="flex justify-between font-bold text-base">
                    <span className="text-foreground">Total TTC</span>
                    <span className="text-foreground">{fullInvoice.total.toFixed(2)}€</span>
                  </div>
                </div>
              </div>

              {/* Notes & Terms */}
              {(fullInvoice.notes || fullInvoice.terms) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                  {fullInvoice.notes && (
                    <div>
                      <p className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider mb-1">Notes</p>
                      <p className="text-xs text-muted-foreground whitespace-pre-wrap">{fullInvoice.notes}</p>
                    </div>
                  )}
                  {fullInvoice.terms && (
                    <div>
                      <p className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider mb-1">Conditions de paiement</p>
                      <p className="text-xs text-muted-foreground whitespace-pre-wrap">{fullInvoice.terms}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="pt-6 border-t text-center text-[10px] text-muted-foreground">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
