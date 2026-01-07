import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Lock, Loader2, CheckCircle, Clock, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CustomRequest {
  id: string;
  center_id: string;
  center_name: string;
  contact_email: string;
  request_type: string;
  message: string;
  status: string;
  created_at: string;
}

const ADMIN_PASSWORD = 'Foxdeter5555!';

export default function AdminRequests() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [requests, setRequests] = useState<CustomRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      fetchRequests();
    } else {
      toast({ title: 'Erreur', description: 'Mot de passe incorrect', variant: 'destructive' });
    }
  };

  const fetchRequests = async () => {
    setLoading(true);
    // Use service role via edge function to bypass RLS
    const { data, error } = await supabase.functions.invoke('admin-requests', {
      body: { action: 'list', password: ADMIN_PASSWORD }
    });
    
    if (error) {
      toast({ title: 'Erreur', description: 'Impossible de charger les demandes', variant: 'destructive' });
    } else {
      setRequests(data?.requests || []);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.functions.invoke('admin-requests', {
      body: { action: 'update', password: ADMIN_PASSWORD, id, status }
    });
    
    if (error) {
      toast({ title: 'Erreur', description: 'Impossible de mettre à jour', variant: 'destructive' });
    } else {
      toast({ title: 'Succès', description: 'Statut mis à jour' });
      fetchRequests();
    }
  };

  const deleteRequest = async (id: string) => {
    const { error } = await supabase.functions.invoke('admin-requests', {
      body: { action: 'delete', password: ADMIN_PASSWORD, id }
    });
    
    if (error) {
      toast({ title: 'Erreur', description: 'Impossible de supprimer', variant: 'destructive' });
    } else {
      toast({ title: 'Succès', description: 'Demande supprimée' });
      fetchRequests();
    }
  };

  const getRequestTypeLabel = (type: string) => {
    switch (type) {
      case 'custom-page': return 'Page personnalisée';
      case 'add-tool': return 'Ajout d\'outil';
      case 'other': return 'Autre demande';
      default: return type;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600"><Clock className="w-3 h-3 mr-1" />En attente</Badge>;
      case 'done':
        return <Badge variant="secondary" className="bg-green-500/10 text-green-600"><CheckCircle className="w-3 h-3 mr-1" />Traité</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6">
          <div className="text-center mb-6">
            <Lock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold">Admin - Demandes personnalisées</h1>
            <p className="text-muted-foreground mt-2">Entrez le mot de passe pour accéder</p>
          </div>
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
            <Button className="w-full" onClick={handleLogin}>
              Accéder
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Demandes de personnalisation</h1>
          <Button variant="outline" onClick={fetchRequests} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Actualiser'}
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : requests.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Aucune demande pour le moment</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request.id} className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{request.center_name}</h3>
                      {getStatusBadge(request.status)}
                      <Badge variant="outline">{getRequestTypeLabel(request.request_type)}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{request.contact_email}</p>
                    <p className="text-sm mt-2 whitespace-pre-wrap">{request.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {format(new Date(request.created_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {request.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus(request.id, 'done')}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Traité
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => deleteRequest(request.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
