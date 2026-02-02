import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInvoices, Invoice, useVatRates } from '@/hooks/useInvoices';
import { useMyClients, Client } from '@/hooks/useClients';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, FileText, FileCheck, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InvoiceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type?: 'invoice' | 'quote';
  invoice?: Invoice | null;
}

interface FormItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  vat_rate: number;
}

export function InvoiceFormDialog({ open, onOpenChange, type: initialType, invoice }: InvoiceFormDialogProps) {
  const { createInvoice, updateInvoice, getInvoiceWithItems, generateNextNumber } = useInvoices();
  const { vatRates } = useVatRates();
  const { clients } = useMyClients();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [selectedType, setSelectedType] = useState<'invoice' | 'quote'>(initialType || 'invoice');
  const [documentNumber, setDocumentNumber] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [status, setStatus] = useState<Invoice['status']>('draft');
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');
  const [items, setItems] = useState<FormItem[]>([
    { id: crypto.randomUUID(), description: '', quantity: 1, unit_price: 0, vat_rate: 20 }
  ]);

  const defaultVatRate = vatRates.find(r => r.is_default)?.rate || 20;

  // Update selectedType when initialType changes
  useEffect(() => {
    if (initialType) {
      setSelectedType(initialType);
    }
  }, [initialType]);

  // Load invoice data when editing
  useEffect(() => {
    if (invoice && open) {
      setLoading(true);
      getInvoiceWithItems(invoice.id).then(({ data }) => {
        if (data) {
          setSelectedType(data.type);
          setDocumentNumber(data.number);
          setClientName(data.client_name);
          setClientEmail(data.client_email || '');
          setClientPhone(data.client_phone || '');
          setClientAddress(data.client_address || '');
          setIssueDate(data.issue_date);
          setDueDate(data.due_date || '');
          setValidUntil(data.valid_until || '');
          setStatus(data.status);
          setNotes(data.notes || '');
          setTerms(data.terms || '');
          // client_id will be loaded from invoice if available
          setSelectedClientId((data as any).client_id || '');
          
          if (data.items && data.items.length > 0) {
            setItems(data.items.map(item => ({
              id: item.id,
              description: item.description,
              quantity: item.quantity,
              unit_price: item.unit_price,
              vat_rate: item.vat_rate,
            })));
          }
        }
        setLoading(false);
      });
    } else if (!invoice && open) {
      // Reset form and generate number for new invoice
      const type = initialType || 'invoice';
      setSelectedType(type);
      generateNextNumber(type).then(num => setDocumentNumber(num));
      setClientName('');
      setClientEmail('');
      setClientPhone('');
      setClientAddress('');
      setIssueDate(new Date().toISOString().split('T')[0]);
      setDueDate(type === 'invoice' 
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] 
        : ''
      );
      setValidUntil(type === 'quote' 
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] 
        : ''
      );
      setStatus('draft');
      setNotes('');
      setTerms('');
      setSelectedClientId('');
      setItems([{ id: crypto.randomUUID(), description: '', quantity: 1, unit_price: 0, vat_rate: defaultVatRate }]);
    }
  }, [invoice, open, initialType]);

  // Update number when type changes for new documents
  useEffect(() => {
    if (!invoice && open) {
      generateNextNumber(selectedType).then(num => setDocumentNumber(num));
    }
  }, [selectedType]);

  const addItem = () => {
    setItems([...items, { 
      id: crypto.randomUUID(), 
      description: '', 
      quantity: 1, 
      unit_price: 0, 
      vat_rate: defaultVatRate 
    }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof FormItem, value: string | number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let totalVat = 0;
    
    items.forEach(item => {
      const itemSubtotal = item.quantity * item.unit_price;
      const itemVat = itemSubtotal * (item.vat_rate / 100);
      subtotal += itemSubtotal;
      totalVat += itemVat;
    });

    return { subtotal, totalVat, total: subtotal + totalVat };
  };

  const totals = calculateTotals();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clientName.trim()) {
      toast({
        title: 'Erreur',
        description: 'Le nom du client est requis',
        variant: 'destructive',
      });
      return;
    }

    if (items.some(item => !item.description.trim())) {
      toast({
        title: 'Erreur',
        description: 'Toutes les lignes doivent avoir une description',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    const invoiceData = {
      type: selectedType,
      number: documentNumber,
      client_name: clientName,
      client_email: clientEmail || null,
      client_phone: clientPhone || null,
      client_address: clientAddress || null,
      issue_date: issueDate,
      due_date: dueDate || null,
      valid_until: validUntil || null,
      status,
      subtotal: totals.subtotal,
      total_vat: totals.totalVat,
      total: totals.total,
      notes: notes || null,
      terms: terms || null,
      converted_from_quote_id: null,
      include_in_stats: false, // Invoices are separate from appointments stats
      client_id: selectedClientId || null,
    };

    const itemsData = items.map(item => ({
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      vat_rate: item.vat_rate,
      subtotal: 0,
      vat_amount: 0,
      total: 0,
      sort_order: 0,
    }));

    let result;
    if (invoice) {
      result = await updateInvoice(invoice.id, invoiceData, itemsData);
    } else {
      result = await createInvoice(invoiceData, itemsData);
    }

    setLoading(false);

    if (result.error) {
      toast({
        title: 'Erreur',
        description: result.error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: invoice ? 'Modifié' : 'Créé',
        description: `${selectedType === 'invoice' ? 'Facture' : 'Devis'} ${invoice ? 'modifié' : 'créé'} avec succès.`,
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {invoice ? 'Modifier' : 'Créer'} {selectedType === 'invoice' ? 'une facture' : 'un devis'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type Selection - Only for new documents */}
          {!invoice && (
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Type de document
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedType('invoice')}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border-2 transition-all",
                    selectedType === 'invoice'
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/30"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-lg",
                    selectedType === 'invoice' 
                      ? "bg-primary/10" 
                      : "bg-muted"
                  )}>
                    <FileText className={cn(
                      "w-5 h-5",
                      selectedType === 'invoice' ? "text-primary" : "text-muted-foreground"
                    )} />
                  </div>
                  <div className="text-left">
                    <p className={cn(
                      "font-medium",
                      selectedType === 'invoice' ? "text-primary" : "text-foreground"
                    )}>Facture</p>
                    <p className="text-xs text-muted-foreground">Document de paiement</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedType('quote')}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border-2 transition-all",
                    selectedType === 'quote'
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/30"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-lg",
                    selectedType === 'quote' 
                      ? "bg-primary/10" 
                      : "bg-muted"
                  )}>
                    <FileCheck className={cn(
                      "w-5 h-5",
                      selectedType === 'quote' ? "text-primary" : "text-muted-foreground"
                    )} />
                  </div>
                  <div className="text-left">
                    <p className={cn(
                      "font-medium",
                      selectedType === 'quote' ? "text-primary" : "text-foreground"
                    )}>Devis</p>
                    <p className="text-xs text-muted-foreground">Estimation de prix</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Document Number */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Numéro de document
            </h3>
            <div className="space-y-2">
              <Label htmlFor="documentNumber">N° {selectedType === 'invoice' ? 'Facture' : 'Devis'}</Label>
              <Input
                id="documentNumber"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                placeholder={selectedType === 'invoice' ? 'FAC-2026-001' : 'DEV-2026-001'}
              />
              <p className="text-xs text-muted-foreground">
                Numéro auto-généré, modifiable si besoin
              </p>
            </div>
          </div>

          {/* Client Info */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Informations client
            </h3>
            
            {/* Client selection */}
            {clients.length > 0 && (
              <div className="space-y-2">
                <Label>Client enregistré</Label>
                <Select 
                  value={selectedClientId || "new"} 
                  onValueChange={(v) => {
                    if (v === "new") {
                      setSelectedClientId('');
                      setClientName('');
                      setClientEmail('');
                      setClientPhone('');
                      setClientAddress('');
                    } else {
                      const client = clients.find(c => c.id === v);
                      if (client) {
                        setSelectedClientId(v);
                        setClientName(client.name);
                        setClientEmail(client.email || '');
                        setClientPhone(client.phone || '');
                        setClientAddress(client.address || '');
                      }
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Nouveau client ou sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Nouveau client</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-primary" />
                          <span>{client.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Nom du client *</Label>
                <Input
                  id="clientName"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Nom complet ou entreprise"
                  required
                  disabled={!!selectedClientId}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientEmail">Email</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="email@exemple.com"
                  disabled={!!selectedClientId}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientPhone">Téléphone</Label>
                <Input
                  id="clientPhone"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="06 00 00 00 00"
                  disabled={!!selectedClientId}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientAddress">Adresse</Label>
                <Input
                  id="clientAddress"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  placeholder="Adresse complète"
                  disabled={!!selectedClientId}
                />
              </div>
            </div>
          </div>

          {/* Dates & Status */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Dates et statut
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="issueDate">Date d'émission</Label>
                <Input
                  id="issueDate"
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                />
              </div>
              {selectedType === 'invoice' ? (
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Date d'échéance</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="validUntil">Valide jusqu'au</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="status">Statut</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as Invoice['status'])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="sent">Envoyé</SelectItem>
                    {selectedType === 'quote' && (
                      <>
                        <SelectItem value="accepted">Accepté</SelectItem>
                        <SelectItem value="rejected">Refusé</SelectItem>
                      </>
                    )}
                    {selectedType === 'invoice' && (
                      <SelectItem value="paid">Payé</SelectItem>
                    )}
                    <SelectItem value="cancelled">Annulé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Prestations
              </h3>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="w-4 h-4 mr-1" />
                Ajouter
              </Button>
            </div>
            
            <div className="space-y-3">
              {items.map((item) => (
                <div 
                  key={item.id}
                  className="grid grid-cols-12 gap-2 items-start p-3 rounded-lg border bg-muted/30"
                >
                  <div className="col-span-12 md:col-span-5 space-y-1">
                    <Label className="text-xs">Description</Label>
                    <Input
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      placeholder="Description de la prestation"
                    />
                  </div>
                  <div className="col-span-4 md:col-span-2 space-y-1">
                    <Label className="text-xs">Quantité</Label>
                    <Input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-4 md:col-span-2 space-y-1">
                    <Label className="text-xs">Prix HT</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) => updateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-3 md:col-span-2 space-y-1">
                    <Label className="text-xs">TVA</Label>
                    <Select 
                      value={String(item.vat_rate)} 
                      onValueChange={(v) => updateItem(item.id, 'vat_rate', parseFloat(v))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {vatRates.map(rate => (
                          <SelectItem key={rate.id} value={String(rate.rate)}>
                            {rate.rate}%
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-1 flex items-end justify-end h-full pb-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      disabled={items.length === 1}
                      className="h-9 w-9"
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-full md:w-64 space-y-2 p-4 rounded-lg bg-muted/50">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sous-total HT</span>
                  <span>{totals.subtotal.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">TVA</span>
                  <span>{totals.totalVat.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total TTC</span>
                  <span>{totals.total.toFixed(2)}€</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Notes et conditions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (visible sur le document)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Informations complémentaires..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="terms">Conditions de paiement</Label>
                <Textarea
                  id="terms"
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  placeholder="Conditions de règlement..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Enregistrement...' : invoice ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}