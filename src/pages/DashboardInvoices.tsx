import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useInvoices, Invoice } from '@/hooks/useInvoices';
import { useMyCenter } from '@/hooks/useCenter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  FileText, 
  FileCheck, 
  Search,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  ArrowRight,
  Download,
  Send
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { InvoiceFormDialog } from '@/components/invoices/InvoiceFormDialog';
import { InvoicePreviewDialog } from '@/components/invoices/InvoicePreviewDialog';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  sent: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400',
  accepted: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
  rejected: 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400',
  paid: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
  cancelled: 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400',
};

export default function DashboardInvoices() {
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { center, loading: centerLoading } = useMyCenter();
  const { invoices, loading, deleteInvoice, convertQuoteToInvoice, updateInvoice } = useInvoices();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'all' | 'invoices' | 'quotes'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [formType, setFormType] = useState<'invoice' | 'quote'>('invoice');
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [quoteToConvert, setQuoteToConvert] = useState<Invoice | null>(null);

  const filteredInvoices = invoices.filter(invoice => {
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'invoices' && invoice.type === 'invoice') ||
      (activeTab === 'quotes' && invoice.type === 'quote');
    
    const matchesSearch = !searchQuery || 
      invoice.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.client_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesTab && matchesSearch;
  });

  const stats = {
    totalInvoices: invoices.filter(i => i.type === 'invoice').length,
    totalQuotes: invoices.filter(i => i.type === 'quote').length,
    pendingAmount: invoices
      .filter(i => i.type === 'invoice' && i.status === 'sent')
      .reduce((sum, i) => sum + i.total, 0),
    paidAmount: invoices
      .filter(i => i.type === 'invoice' && i.status === 'paid')
      .reduce((sum, i) => sum + i.total, 0),
  };

  const handleCreate = (type?: 'invoice' | 'quote') => {
    setFormType(type || 'invoice');
    setEditingInvoice(null);
    setFormOpen(true);
  };

  const handleEdit = (invoice: Invoice) => {
    setFormType(invoice.type);
    setEditingInvoice(invoice);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!invoiceToDelete) return;
    
    const { error } = await deleteInvoice(invoiceToDelete.id);
    if (error) {
      toast({
        title: 'Erreur',
        description: error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Supprimé',
        description: `${invoiceToDelete.type === 'invoice' ? 'Facture' : 'Devis'} supprimé avec succès.`,
      });
    }
    setDeleteDialogOpen(false);
    setInvoiceToDelete(null);
  };

  const handleConvert = async () => {
    if (!quoteToConvert) return;
    
    const { data, error } = await convertQuoteToInvoice(quoteToConvert.id);
    if (error) {
      toast({
        title: 'Erreur',
        description: error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Converti',
        description: `Devis converti en facture ${data?.number}`,
      });
    }
    setConvertDialogOpen(false);
    setQuoteToConvert(null);
  };

  const handleMarkAsPaid = async (invoice: Invoice) => {
    const { error } = await updateInvoice(invoice.id, { status: 'paid' });
    if (error) {
      toast({
        title: 'Erreur',
        description: error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Facture payée',
        description: `Facture ${invoice.number} marquée comme payée.`,
      });
    }
  };

  if (centerLoading || !center) {
    return (
      <DashboardLayout title="Factures & Devis">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Factures & Devis">
      <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{t('invoices.title')}</h1>
              <p className="text-muted-foreground">{t('invoices.manage')}</p>
            </div>
            <Button 
              onClick={() => handleCreate()}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Créer
            </Button>
          </div>

          {/* Stats - Apple style: clean, no heavy icons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-5 rounded-2xl">
              <p className="text-sm font-medium text-muted-foreground mb-1">{t('invoices.invoices')}</p>
              <p className="text-3xl font-bold tracking-tight">{stats.totalInvoices}</p>
            </Card>
            <Card className="p-5 rounded-2xl">
              <p className="text-sm font-medium text-muted-foreground mb-1">{t('invoices.quotes')}</p>
              <p className="text-3xl font-bold tracking-tight">{stats.totalQuotes}</p>
            </Card>
            <Card className="p-5 rounded-2xl">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-muted-foreground">{t('invoices.pending')}</p>
                {stats.pendingAmount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                )}
              </div>
              <p className="text-3xl font-bold tracking-tight">{stats.pendingAmount.toFixed(0)}€</p>
            </Card>
            <Card className="p-5 rounded-2xl">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-muted-foreground">{t('invoices.collected')}</p>
                {stats.paidAmount > 0 && (
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                    ✓
                  </span>
                )}
              </div>
              <p className="text-3xl font-bold tracking-tight text-emerald-600">{stats.paidAmount.toFixed(0)}€</p>
            </Card>
          </div>

          {/* List */}
          <Card className="rounded-2xl overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
                  <TabsList className="rounded-xl">
                    <TabsTrigger value="all" className="rounded-lg">{t('common.all')}</TabsTrigger>
                    <TabsTrigger value="invoices" className="rounded-lg">{t('invoices.invoices')}</TabsTrigger>
                    <TabsTrigger value="quotes" className="rounded-lg">{t('invoices.quotes')}</TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-full sm:w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : filteredInvoices.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">
                    {searchQuery ? t('invoices.noResults') : t('invoices.noInvoices')}
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => handleCreate('invoice')}
                  >
                    {t('invoices.createFirstInvoice')}
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredInvoices.map(invoice => (
                    <div 
                      key={invoice.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-card hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          invoice.type === 'invoice' 
                            ? 'bg-blue-50 dark:bg-blue-950/50' 
                            : 'bg-purple-50 dark:bg-purple-950/50'
                        }`}>
                          {invoice.type === 'invoice' 
                            ? <FileText className="w-5 h-5 text-blue-600" />
                            : <FileCheck className="w-5 h-5 text-purple-600" />
                          }
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">{invoice.number}</span>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[invoice.status] || 'bg-muted text-muted-foreground'}`}>
                              {t(`invoices.${invoice.status}`) || invoice.status}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {invoice.client_name} • {format(new Date(invoice.issue_date), 'dd MMM', { locale: fr })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                        <span className="font-semibold text-lg">
                          {invoice.total.toFixed(0)}€
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setPreviewInvoice(invoice)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Aperçu
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(invoice)}>
                              <Pencil className="w-4 h-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
                            {invoice.type === 'quote' && invoice.status !== 'accepted' && (
                              <DropdownMenuItem onClick={() => {
                                setQuoteToConvert(invoice);
                                setConvertDialogOpen(true);
                              }}>
                                <ArrowRight className="w-4 h-4 mr-2" />
                                Convertir
                              </DropdownMenuItem>
                            )}
                            {invoice.type === 'invoice' && invoice.status === 'sent' && (
                              <DropdownMenuItem onClick={() => handleMarkAsPaid(invoice)}>
                                <FileCheck className="w-4 h-4 mr-2" />
                                Payée
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => {
                                setInvoiceToDelete(invoice);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
      </div>
      </DashboardLayout>

      {/* Form Dialog */}
      <InvoiceFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        type={formType}
        invoice={editingInvoice}
      />

      {/* Preview Dialog */}
      <InvoicePreviewDialog
        open={!!previewInvoice}
        onOpenChange={(open) => !open && setPreviewInvoice(null)}
        invoice={previewInvoice}
        center={center}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer {invoiceToDelete?.type === 'invoice' ? 'la facture' : 'le devis'} ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. {invoiceToDelete?.type === 'invoice' ? 'La facture' : 'Le devis'} {invoiceToDelete?.number} sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Convert Confirmation */}
      <AlertDialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Convertir en facture ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le devis {quoteToConvert?.number} sera marqué comme accepté et une nouvelle facture sera créée avec les mêmes informations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleConvert}>
              Convertir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
