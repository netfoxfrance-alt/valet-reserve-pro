import { useState } from 'react';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

export default function DashboardSettings() {
  const [settings, setSettings] = useState({
    centerName: 'Auto Clean Center',
    address: '123 Avenue du Nettoyage, 75000 Paris',
    phone: '01 23 45 67 89',
    welcomeMessage: 'Réservez le nettoyage adapté à votre véhicule.',
    aiEnabled: true,
  });
  
  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      
      <div className="lg:pl-64">
        <DashboardHeader title="Paramètres" />
        
        <main className="p-4 lg:p-8 max-w-2xl">
          {/* Center info */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-2">Informations du centre</h2>
            <p className="text-muted-foreground mb-6">Ces informations seront affichées aux clients.</p>
            
            <Card variant="elevated" className="p-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="centerName">Nom du centre</Label>
                <Input
                  id="centerName"
                  value={settings.centerName}
                  onChange={(e) => setSettings({ ...settings, centerName: e.target.value })}
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
          
          {/* Welcome message */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-2">Page de réservation</h2>
            <p className="text-muted-foreground mb-6">Personnalisez l'accueil de vos clients.</p>
            
            <Card variant="elevated" className="p-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="welcomeMessage">Message d'accueil</Label>
                <Textarea
                  id="welcomeMessage"
                  value={settings.welcomeMessage}
                  onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Ce message apparaît en haut de la page de réservation.
                </p>
              </div>
            </Card>
          </section>
          
          {/* AI settings */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-2">Assistant IA</h2>
            <p className="text-muted-foreground mb-6">Gérez l'assistant intelligent pour vos clients.</p>
            
            <Card variant="elevated" className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Activer l'assistant IA</p>
                  <p className="text-sm text-muted-foreground">
                    Permet aux clients de poser des questions via le chat.
                  </p>
                </div>
                <Switch
                  checked={settings.aiEnabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, aiEnabled: checked })}
                />
              </div>
            </Card>
          </section>
          
          <div className="flex justify-end">
            <Button variant="premium">
              Enregistrer les modifications
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}
