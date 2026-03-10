import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useInvoices, Invoice } from '@/hooks/useInvoices';
import { supabase } from '@/integrations/supabase/client';
import { useMyCenter } from '@/hooks/useCenter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { 
  Plus, 
  FileCheck, 
  Search,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Check,
  XCircle,
  Wrench
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
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
import { InvoiceFormDialog, InvoicePrefillData } from '@/components/invoices/InvoiceFormDialog';
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
  cancelled: 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400',
};

export default function DashboardInvoices() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { center, loading: centerLoading } = useMyCenter();
  const { invoices, loading, deleteInvoice, updateInvoice, refetch } = useInvoices();
  const { toast } = useToast();
  
  // Only show quotes now
  const quotes = invoices.filter(i => i.type === 'quote');
  
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'accepted'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  const [prefillData, setPrefillData] = useState<InvoicePrefillData | null>(null);

  // Auto-open form from navigation state (e.g., from quote request)
  useEffect(() => {
    const state = location.state as { prefill?: InvoicePrefillData; type?: 'invoice' | 'quote' } | null;
    if (state?.prefill) {
      setPrefillData(state.prefill);
      setEditingInvoice(null);
      setFormOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const filteredQuotes = quotes.filter(quote => {
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'accepted' && quote.status === 'accepted') ||
      (activeTab === 'pending' && quote.status !== 'accepted');
    
    const matchesSearch = !searchQuery || 
      quote.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.client_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesTab && matchesSearch;
  });

  const stats = {
    total: quotes.length,
    pending: quotes.filter(q => q.status !== 'accepted').length,
    accepted: quotes.filter(q => q.status === 'accepted').length,
  };

  const handleCreate = () => {
    setEditingInvoice(null);
    setFormOpen(true);
  };

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!invoiceToDelete) return;
    const { error } = await deleteInvoice(invoiceToDelete.id);
    if (error) {
      toast({ title: t('common.error'), description: error, variant: 'destructive' });
    } else {
      toast({ title: t('invoices.deleted'), description: t('invoices.deletedDesc', { type: t('invoices.quote'), number: '' }) });
    }
    setDeleteDialogOpen(false);
    setInvoiceToDelete(null);
  };

  const handleMarkAsAccepted = async (invoice: Invoice) => {
    const { error } = await updateInvoice(invoice.id, { status: 'accepted' });
    if (error) {
      toast({ title: t('common.error'), description: error, variant: 'destructive' });
    } else {
      toast({ title: t('invoices.accepted'), description: `${invoice.number}` });
    }
  };

  const handleMarkAsPending = async (invoice: Invoice) => {
    const { error } = await updateInvoice(invoice.id, { status: 'draft' });
    if (error) {
      toast({ title: t('common.error'), description: error, variant: 'destructive' });
    }
  };

  const handleCreateServiceFromQuote = async (invoice: Invoice) => {
    if (!center) return;
    const { data: items } = await supabase
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', invoice.id)
      .order('sort_order');
    
    const serviceName = items && items.length > 0
      ? items.map((item: any) => item.description).join(' + ')
      : `Devis ${invoice.number}`;
    
    navigate('/dashboard/custom-services', {
      state: {
        prefillService: {
          name: serviceName.substring(0, 200),
          price: invoice.total,
          description: `Créé depuis le devis ${invoice.number}`,
          client_id: invoice.client_id,
          client_name: invoice.client_name,
        }
      }
    });
  };

  if (centerLoading || !center) {
    return (
      <DashboardLayout title={t('invoices.title')}>
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-96" />
      </DashboardLayout>
    );
  }

  return (
    <>
    <DashboardLayout title={t('invoices.title')}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{t('invoices.title')}</h1>
            <p className="text-muted-foreground">{t('invoices.manage')}</p>
          </div>
          <Button onClick={handleCreate} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {t('invoices.newQuote')}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <button onClick={() => setActiveTab('all')} className="text-left">
            <Card className={cn("p-3 sm:p-5 rounded-2xl transition-all", activeTab === 'all' ? "ring-2 ring-primary shadow-sm" : "hover:bg-secondary/50")}>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 truncate">{t('invoices.allQuotes')}</p>
              <p className="text-2xl sm:text-3xl font-bold tracking-tight">{stats.total}</p>
            </Card>
          </button>
          <button onClick={() => setActiveTab('pending')} className="text-left">
            <Card className={cn("p-3 sm:p-5 rounded-2xl transition-all", activeTab === 'pending' ? "ring-2 ring-primary shadow-sm" : "hover:bg-secondary/50")}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{t('invoices.pending')}</p>
                {stats.pending > 0 && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
              </div>
              <p className="text-2xl sm:text-3xl font-bold tracking-tight">{stats.pending}</p>
            </Card>
          </button>
          <button onClick={() => setActiveTab('accepted')} className="text-left">
            <Card className={cn("p-3 sm:p-5 rounded-2xl transition-all", activeTab === 'accepted' ? "ring-2 ring-primary shadow-sm" : "hover:bg-secondary/50")}>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 truncate">{t('invoices.accepted')}</p>
              <p className="text-2xl sm:text-3xl font-bold tracking-tight">{stats.accepted}</p>
            </Card>
          </button>
        </div>

        {/* List */}
        <Card className="rounded-2xl overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium text-muted-foreground">
                {activeTab === 'accepted' ? t('invoices.accepted') : activeTab === 'pending' ? t('invoices.pending') : t('invoices.allQuotes')}
                <span className="ml-1 text-foreground">({filteredQuotes.length})</span>
              </p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t('common.search') + '...'}
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
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}
              </div>
            ) : filteredQuotes.length === 0 ? (
              <div className="text-center py-12">
                <FileCheck className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery ? t('invoices.noResults') : t('invoices.noQuotes')}
                </p>
                <Button variant="outline" className="mt-4" onClick={handleCreate}>
                  {t('invoices.createFirstQuote')}
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredQuotes.map(quote => (
                  <div 
                    key={quote.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-card hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-purple-50 dark:bg-purple-950/50">
                        <FileCheck className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{quote.number}</span>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[quote.status] || 'bg-muted text-muted-foreground'}`}>
                            {t(`invoices.${quote.status}`) || quote.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {quote.client_name} • {format(new Date(quote.issue_date), 'dd MMM', { locale: fr })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
                      {quote.status === 'accepted' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="rounded-xl h-9 text-xs font-medium border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/50"
                          onClick={(e) => { e.stopPropagation(); handleCreateServiceFromQuote(quote); }}
                        >
                          <Wrench className="w-3.5 h-3.5 mr-1.5" />
                          {t('invoices.createService')}
                        </Button>
                      )}
                      <span className="font-semibold text-lg">{quote.total.toFixed(0)}€</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setPreviewInvoice(quote)}>
                            <Eye className="w-4 h-4 mr-2" />
                            {t('common.preview')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(quote)}>
                            <Pencil className="w-4 h-4 mr-2" />
                            {t('common.edit')}
                          </DropdownMenuItem>
                          {quote.status !== 'accepted' && (
                            <DropdownMenuItem onClick={() => handleMarkAsAccepted(quote)}>
                              <Check className="w-4 h-4 mr-2" />
                              {t('invoices.validate')}
                            </DropdownMenuItem>
                          )}
                          {quote.status === 'accepted' && (
                            <DropdownMenuItem onClick={() => handleMarkAsPending(quote)}>
                              <XCircle className="w-4 h-4 mr-2" />
                              {t('invoices.backToPending')}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => { setInvoiceToDelete(quote); setDeleteDialogOpen(true); }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {t('common.delete')}
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

    {/* Form Dialog - always quote type */}
    <InvoiceFormDialog
      open={formOpen}
      onOpenChange={(open) => { setFormOpen(open); if (!open) setPrefillData(null); }}
      type="quote"
      invoice={editingInvoice}
      prefillData={prefillData}
      onSuccess={refetch}
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
          <AlertDialogTitle>{t('invoices.deleteQuoteTitle')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('invoices.deleteQuoteDesc', { number: invoiceToDelete?.number })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
            {t('common.delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
