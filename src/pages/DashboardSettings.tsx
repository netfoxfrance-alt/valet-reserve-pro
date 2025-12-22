import { useState, useEffect } from 'react';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useMyCenter } from '@/hooks/useCenter';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardSettings() {
  const { center, loading, updateCenter } = useMyCenter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    name: '',
    address: '',
    phone: '',
    welcome_message: '',
    ai_enabled: true,
  });

  useEffect(() => {
    if (center) {
      setSettings({
        name: center.name || '',
        address: center.address || '',
        phone: center.phone || '',
        welcome_message: center.welcome_message || '',
        ai_enabled: center.ai_enabled ?? true,
      });
    }
  }, [center]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await updateCenter(settings);
    setSaving(false);
    
    if (error) {
      toast({ title: 'Erreur', description: error, variant: 'destructive' });
    } else {
      toast({ title: 'Enregistré', description: 'Vos modifications ont été sauvegardées.' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardSidebar />
        <div className="lg:pl-64 p-8">
          <Skeleton className="h-8 w-48 mb-8" />
          <Skeleton className="h-64 w-full max-w-2xl" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      
      <div className="lg:pl-64">
        <DashboardHeader title="Paramètres" />
        
        <main className="p-4 lg:p-8 max-w-2xl">
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-2">Informations du centre</h2>
            <p className="text-muted-foreground mb-6">Ces informations seront affichées aux clients.</p>
            
            <Card variant="elevated" className="p-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du centre</Label>
                <Input
                  id="name"
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Input
                  id="address"
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                />
              </div>
            </Card>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-2">Page de réservation</h2>
            <p className="text-muted-foreground mb-6">Personnalisez l'accueil de vos clients.</p>
            
            <Card variant="elevated" className="p-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="welcome_message">Message d'accueil</Label>
                <Textarea
                  id="welcome_message"
                  value={settings.welcome_message}
                  onChange={(e) => setSettings({ ...settings, welcome_message: e.target.value })}
                  rows={3}
                />
              </div>
            </Card>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-2">Assistant IA</h2>
            <Card variant="elevated" className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Activer l'assistant IA</p>
                  <p className="text-sm text-muted-foreground">
                    Permet aux clients de poser des questions via le chat.
                  </p>
                </div>
                <Switch
                  checked={settings.ai_enabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, ai_enabled: checked })}
                />
              </div>
            </Card>
          </section>
          
          <div className="flex justify-end">
            <Button variant="premium" onClick={handleSave} disabled={saving}>
              {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}
