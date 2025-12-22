import { useState } from 'react';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { packs as defaultPacks } from '@/lib/packs';
import { Pack } from '@/types/booking';
import { Pencil, Clock } from 'lucide-react';

export default function DashboardPacks() {
  const [packs, setPacks] = useState<Pack[]>(defaultPacks);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const handleEdit = (packId: string) => {
    setEditingId(packId);
  };
  
  const handleSave = () => {
    setEditingId(null);
    // In real app, save to backend
  };
  
  const updatePack = (id: string, field: keyof Pack, value: string | number) => {
    setPacks(packs.map(pack => 
      pack.id === id ? { ...pack, [field]: value } : pack
    ));
  };
  
  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      
      <div className="lg:pl-64">
        <DashboardHeader title="Packs" />
        
        <main className="p-4 lg:p-8 max-w-4xl">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-2">Vos offres</h2>
            <p className="text-muted-foreground">Configurez les packs proposés à vos clients.</p>
          </div>
          
          <div className="space-y-4">
            {packs.map((pack) => (
              <Card key={pack.id} variant="elevated" className="p-6">
                {editingId === pack.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`name-${pack.id}`}>Nom</Label>
                        <Input
                          id={`name-${pack.id}`}
                          value={pack.name}
                          onChange={(e) => updatePack(pack.id, 'name', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`price-${pack.id}`}>Prix (€)</Label>
                        <Input
                          id={`price-${pack.id}`}
                          type="number"
                          value={pack.price}
                          onChange={(e) => updatePack(pack.id, 'price', parseInt(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`duration-${pack.id}`}>Durée</Label>
                        <Input
                          id={`duration-${pack.id}`}
                          value={pack.duration}
                          onChange={(e) => updatePack(pack.id, 'duration', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" onClick={() => setEditingId(null)}>
                        Annuler
                      </Button>
                      <Button onClick={handleSave}>
                        Enregistrer
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div>
                        <h3 className="font-semibold text-lg text-foreground">{pack.name}</h3>
                        <p className="text-sm text-muted-foreground">{pack.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-foreground">{pack.price}€</p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {pack.duration}
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEdit(pack.id)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
