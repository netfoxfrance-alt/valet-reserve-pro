import { useState, useEffect, useRef, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInvoices, Invoice, useVatRates } from '@/hooks/useInvoices';
import { useMyClients, Client } from '@/hooks/useClients';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, FileText, FileCheck, Users, ChevronDown, ChevronUp, ChevronRight, MessageSquare, Image as ImageIcon, Search, X, Eye, Loader2, Building2, User } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { useMyCustomServices, formatDuration } from '@/hooks/useCustomServices';
import { ClientType } from '@/hooks/useClients';

export interface InvoicePrefillData {
  clientId?: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string;
  serviceName?: string;
  message?: string;
  images?: string[];
  clientType?: string;
  companyName?: string;
}

function RequestContextPanel({ prefillData }: { prefillData: InvoicePrefillData }) {
  const [open, setOpen] = useState(true);
  const images = prefillData.images || [];

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="w-full flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-colors"
        >
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <MessageSquare className="w-4 h-4" />
            Demande associée
            {images.length > 0 && (
              <span className="text-xs bg-primary/10 px-1.5 py-0.5 rounded-full">
                {images.length} photo{images.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          {open ? <ChevronUp className="w-4 h-4 text-primary" /> : <ChevronDown className="w-4 h-4 text-primary" />}
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 space-y-3">
        {prefillData.serviceName && (
          <div className="text-sm">
            <span className="text-muted-foreground">Service : </span>
            <span className="font-medium">{prefillData.serviceName}</span>
          </div>
        )}
        {prefillData.message && (
          <div className="bg-muted/50 rounded-xl p-3">
            <p className="text-sm whitespace-pre-wrap break-words">{prefillData.message}</p>
          </div>
        )}
        {images.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            {images.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="aspect-square rounded-lg overflow-hidden bg-muted block">
                <img src={url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform" />
              </a>
            ))}
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

interface InvoiceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type?: 'invoice' | 'quote';
  invoice?: Invoice | null;
  prefillData?: InvoicePrefillData | null;
}

interface FormItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  vat_rate: number;
}

export function InvoiceFormDialog({ open, onOpenChange, type: initialType, invoice, prefillData }: InvoiceFormDialogProps) {
  const { createInvoice, updateInvoice, getInvoiceWithItems, generateNextNumber } = useInvoices();
  const { vatRates } = useVatRates();
  const { clients, createClient, refetch: refetchClients } = useMyClients();
  const { services: allServices } = useMyCustomServices();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false);
  const clientSearchRef = useRef<HTMLDivElement>(null);
  
  // Client creation dialog state
  const [showClientCreateDialog, setShowClientCreateDialog] = useState(false);
  const [inlineCreating, setInlineCreating] = useState(false);
  const [newClientForm, setNewClientForm] = useState({
    name: '', email: '', phone: '', address: '', notes: '',
    client_type: 'particulier' as ClientType,
    company_name: '',
  });
  const [newServiceIds, setNewServiceIds] = useState<string[]>([]);
  const [newServicesOpen, setNewServicesOpen] = useState(false);

  const resetNewClientForm = () => {
    setNewClientForm({ name: '', email: '', phone: '', address: '', notes: '', client_type: 'particulier', company_name: '' });
    setNewServiceIds([]);
    setNewServicesOpen(false);
  };

  const handleInlineClientCreate = async () => {
    if (!newClientForm.name.trim()) {
      toast({ title: 'Erreur', description: 'Le nom est requis', variant: 'destructive' });
      return;
    }
    setInlineCreating(true);
    const { error, data: createdClient } = await createClient({
      name: newClientForm.name.trim(),
      email: newClientForm.email.trim() || undefined,
      phone: newClientForm.phone.trim() || undefined,
      address: newClientForm.address.trim() || undefined,
      notes: newClientForm.notes.trim() || undefined,
      client_type: newClientForm.client_type,
      company_name: newClientForm.client_type === 'professionnel' ? newClientForm.company_name.trim() || undefined : undefined,
    } as any);

    if (!error && createdClient) {
      const c = createdClient as any;
      // Save services if selected
      if (newServiceIds.length > 0 && c.id) {
        const { supabase } = await import('@/integrations/supabase/client');
        await supabase
          .from('client_services')
          .insert(newServiceIds.map(sid => ({ client_id: c.id, service_id: sid })));
      }
      setSelectedClientId(c.id);
      setClientSearch(c.name);
      setClientName(c.name);
      setClientEmail(c.email || '');
      setClientPhone(c.phone || '');
      setClientAddress(c.address || '');
      toast({ title: 'Client créé', description: `${c.name} a été ajouté.` });
      setShowClientCreateDialog(false);
      resetNewClientForm();
      refetchClients();
    } else if (error) {
      toast({ title: 'Erreur', description: error, variant: 'destructive' });
    }
    setInlineCreating(false);
  };

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

  // Click outside handler for client dropdown
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (clientSearchRef.current && !clientSearchRef.current.contains(e.target as Node)) {
        setClientDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Filtered clients for autocomplete
  const filteredClients = useMemo(() => {
    if (!clientSearch.trim()) return clients.slice(0, 8);
    const q = clientSearch.toLowerCase();
    return clients.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q))
    ).slice(0, 8);
  }, [clients, clientSearch]);

  // Handle client selection from autocomplete
  const handleClientSelect = (clientId: string) => {
    if (clientId) {
      const client = clients.find(c => c.id === clientId);
      if (client) {
        setSelectedClientId(clientId);
        setClientSearch(client.name);
        setClientName(client.name);
        setClientEmail(client.email || '');
        setClientPhone(client.phone || '');
        setClientAddress(client.address || '');
      }
    } else {
      setSelectedClientId('');
      setClientSearch('');
      setClientName('');
      setClientEmail('');
      setClientPhone('');
      setClientAddress('');
    }
    setClientDropdownOpen(false);
  };

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
          setClientSearch(data.client_name);
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
      
      // Apply prefill data if provided
      if (prefillData) {
        setClientName(prefillData.clientName || '');
        setClientEmail(prefillData.clientEmail || '');
        setClientPhone(prefillData.clientPhone || '');
        setClientAddress(prefillData.clientAddress || '');
        
        // Auto-select client: prefer explicit clientId, fallback to phone/email matching
        let matchedClient: typeof clients[number] | undefined;
        
        if (prefillData.clientId && clients.length > 0) {
          matchedClient = clients.find(c => c.id === prefillData.clientId);
        }
        
        if (!matchedClient && clients.length > 0) {
          matchedClient = clients.find(c => 
            (prefillData.clientPhone && c.phone && c.phone.replace(/[^0-9+]/g, '') === prefillData.clientPhone.replace(/[^0-9+]/g, '')) ||
            (prefillData.clientEmail && c.email && c.email.toLowerCase() === prefillData.clientEmail.toLowerCase())
          );
        }
        
        if (matchedClient) {
          setSelectedClientId(matchedClient.id);
          setClientSearch(matchedClient.name);
          setClientName(matchedClient.name);
          setClientEmail(matchedClient.email || '');
          setClientPhone(matchedClient.phone || '');
          setClientAddress(matchedClient.address || '');
        }
        
        // Pre-fill service as first item description
        const firstItemDesc = prefillData.serviceName || '';
        setItems([{ id: crypto.randomUUID(), description: firstItemDesc, quantity: 1, unit_price: 0, vat_rate: defaultVatRate }]);
        setNotes(prefillData.message || '');
      } else {
        setClientName('');
        setClientSearch('');
        setClientEmail('');
        setClientPhone('');
        setClientAddress('');
        setSelectedClientId('');
        setItems([{ id: crypto.randomUUID(), description: '', quantity: 1, unit_price: 0, vat_rate: defaultVatRate }]);
        setNotes('');
      }
      
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
      setTerms('');
    }
  }, [invoice, open, initialType, prefillData]);

  // Re-run client matching when clients load after prefill
  useEffect(() => {
    if (!invoice && open && prefillData && clients.length > 0 && !selectedClientId) {
      let matchedClient: typeof clients[number] | undefined;
      
      if (prefillData.clientId) {
        matchedClient = clients.find(c => c.id === prefillData.clientId);
      }
      
      if (!matchedClient) {
        matchedClient = clients.find(c => 
          (prefillData.clientPhone && c.phone && c.phone.replace(/[^0-9+]/g, '') === prefillData.clientPhone.replace(/[^0-9+]/g, '')) ||
          (prefillData.clientEmail && c.email && c.email.toLowerCase() === prefillData.clientEmail.toLowerCase())
        );
      }
      
      if (matchedClient) {
        setSelectedClientId(matchedClient.id);
        setClientSearch(matchedClient.name);
        setClientName(matchedClient.name);
        setClientEmail(matchedClient.email || '');
        setClientPhone(matchedClient.phone || '');
        setClientAddress(matchedClient.address || '');
      }
    }
  }, [clients, open, invoice, prefillData, selectedClientId]);

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

        {/* Request context panel - shown when creating quote from a request */}
        {prefillData && (prefillData.message || (prefillData.images && prefillData.images.length > 0)) && (
          <RequestContextPanel prefillData={prefillData} />
        )}

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
              Client
            </h3>
            
            {/* Client autocomplete search */}
            <div className="space-y-2">
              <Label>Client *</Label>
              <div ref={clientSearchRef} className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={clientSearch}
                    onChange={(e) => {
                      setClientSearch(e.target.value);
                      setClientDropdownOpen(true);
                      if (selectedClientId) {
                        setSelectedClientId('');
                        setClientName(e.target.value);
                        setClientEmail('');
                        setClientPhone('');
                        setClientAddress('');
                      } else {
                        setClientName(e.target.value);
                      }
                    }}
                    onFocus={() => setClientDropdownOpen(true)}
                    placeholder="Rechercher ou créer un client..."
                    className="pl-9 pr-10 h-11 rounded-xl"
                  />
                  {selectedClientId && (
                    <button
                      type="button"
                      onClick={() => handleClientSelect('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {clientDropdownOpen && !selectedClientId && (
                  <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {clientSearch.trim() && (
                      <button
                        type="button"
                        onClick={() => {
                          setClientDropdownOpen(false);
                          setNewClientForm(prev => ({ ...prev, name: clientSearch.trim() }));
                          setShowClientCreateDialog(true);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-secondary/60 transition-colors flex items-center gap-2 text-primary font-medium border-b border-border"
                      >
                        <Plus className="w-4 h-4" />
                        Créer « {clientSearch.trim()} »
                      </button>
                    )}
                    {filteredClients.map((client) => (
                      <div
                        key={client.id}
                        className="flex items-center justify-between hover:bg-secondary/60 transition-colors"
                      >
                        <button
                          type="button"
                          onClick={() => handleClientSelect(client.id)}
                          className="flex-1 text-left px-4 py-2.5 text-sm"
                        >
                          <span className="font-medium text-foreground">{client.name}</span>
                          {(client.phone || client.email) && (
                            <span className="text-muted-foreground ml-2 text-xs">
                              {client.phone || client.email}
                            </span>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClientSelect(client.id);
                            setClientDropdownOpen(false);
                          }}
                          className="px-3 py-2.5 text-muted-foreground hover:text-primary transition-colors"
                          title="Voir la fiche client"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {filteredClients.length === 0 && !clientSearch.trim() && (
                      <p className="px-4 py-3 text-sm text-muted-foreground">Aucun client</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Show detail fields when a client is selected (read-only) */}
            {selectedClientId && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-secondary/20 rounded-xl p-3">
                {clientPhone && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Tél : </span>
                    <span className="font-medium">{clientPhone}</span>
                  </div>
                )}
                {clientEmail && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Email : </span>
                    <span className="font-medium">{clientEmail}</span>
                  </div>
                )}
                {clientAddress && (
                  <div className="md:col-span-2 text-sm">
                    <span className="text-muted-foreground">Adresse : </span>
                    <span className="font-medium">{clientAddress}</span>
                  </div>
                )}
              </div>
            )}
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