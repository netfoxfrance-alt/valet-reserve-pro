import { useState } from 'react';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { MobileSidebar } from '@/components/dashboard/MobileSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
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

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft: { label: 'Brouillon', variant: 'secondary' },
  sent: { label: 'Envoyé', variant: 'default' },
  accepted: { label: 'Accepté', variant: 'default' },
  rejected: { label: 'Refusé', variant: 'destructive' },
  paid: { label: 'Payé', variant: 'default' },
  cancelled: { label: 'Annulé', variant: 'destructive' },
};

export default function DashboardInvoices() {
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

  const handleCreate = (type: 'invoice' | 'quote') => {
    setFormType(type);
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
      <div className="min-h-screen bg-background">
        <DashboardSidebar />
        <MobileSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
        <div className="lg:pl-64">
          <DashboardHeader title="Facturation" onMenuClick={() => setSidebarOpen(true)} />
          <main className="p-6">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
            <Skeleton className="h-96" />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <MobileSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      
      <div className="lg:pl-64">
        <DashboardHeader title="Facturation" onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="p-4 md:p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Facturation</h1>
              <p className="text-muted-foreground">Gérez vos factures et devis</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => handleCreate('quote')}
                className="flex items-center gap-2"
              >
                <FileCheck className="w-4 h-4" />
                Nouveau devis
              </Button>
              <Button 
                onClick={() => handleCreate('invoice')}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nouvelle facture
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Factures</p>
                    <p className="text-2xl font-bold">{stats.totalInvoices}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <FileCheck className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Devis</p>
                    <p className="text-2xl font-bold">{stats.totalQuotes}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                    <FileText className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">En attente</p>
                    <p className="text-2xl font-bold">{stats.pendingAmount.toFixed(0)}€</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <FileText className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Encaissé</p>
                    <p className="text-2xl font-bold">{stats.paidAmount.toFixed(0)}€</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* List */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
                  <TabsList>
                    <TabsTrigger value="all">Tout</TabsTrigger>
                    <TabsTrigger value="invoices">Factures</TabsTrigger>
                    <TabsTrigger value="quotes">Devis</TabsTrigger>
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
                    {searchQuery ? 'Aucun résultat trouvé' : 'Aucune facture ou devis'}
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => handleCreate('invoice')}
                  >
                    Créer votre première facture
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredInvoices.map(invoice => (
                    <div 
                      key={invoice.id}
                      className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${
                          invoice.type === 'invoice' 
                            ? 'bg-blue-100 dark:bg-blue-900/30' 
                            : 'bg-purple-100 dark:bg-purple-900/30'
                        }`}>
                          {invoice.type === 'invoice' 
                            ? <FileText className="w-5 h-5 text-blue-600" />
                            : <FileCheck className="w-5 h-5 text-purple-600" />
                          }
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{invoice.number}</span>
                            <Badge variant={statusConfig[invoice.status]?.variant || 'secondary'}>
                              {statusConfig[invoice.status]?.label || invoice.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {invoice.client_name} • {format(new Date(invoice.issue_date), 'dd MMM yyyy', { locale: fr })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold text-lg">
                          {invoice.total.toFixed(2)}€
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
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
                                Convertir en facture
                              </DropdownMenuItem>
                            )}
                            {invoice.type === 'invoice' && invoice.status === 'sent' && (
                              <DropdownMenuItem onClick={() => handleMarkAsPaid(invoice)}>
                                <FileCheck className="w-4 h-4 mr-2" />
                                Marquer payée
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
        </main>
      </div>

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
  );
}
