import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useMyCenter } from '@/hooks/useCenter';
import { useMyServiceCategories } from '@/hooks/useServiceCategories';
import {
  Plus, Package, MapPin, Home, Building2, ArrowRight, ArrowLeft,
  Loader2, Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

const FUNNEL_PRESETS = [
  { id: 'simple', name: 'Simple', description: 'Service → Créneau. Idéal pour un service unique sans variantes.', icon: '🎯', example: 'Ex: Nettoyage matelas' },
  { id: 'classic', name: 'Classique', description: 'Service → Formule → Options → Créneau. Le parcours standard.', icon: '📋', example: 'Ex: Nettoyage intérieur (basique/premium)' },
  { id: 'detailing', name: 'Detailing', description: "Variante → Formule → Options → Créneau. Le client choisit d'abord son véhicule.", icon: '🚗', example: 'Ex: Detailing (choisir SUV/Berline puis pack)' },
  { id: 'quote', name: 'Sur devis', description: 'Service → Formulaire de demande. Pas de paiement en ligne.', icon: '📝', example: 'Ex: Nettoyage vitre, canapé sur mesure' },
];

const LOCATION_OPTIONS = [
  { id: 'home', label: 'À domicile', icon: Home, description: 'Vous vous déplacez chez le client' },
  { id: 'workshop', label: 'En atelier', icon: Building2, description: 'Le client vient chez vous' },
  { id: 'both', label: 'Les deux', icon: MapPin, description: 'Domicile ou atelier au choix' },
];

export default function DashboardServices() {
  const { center } = useMyCenter();
  const { categories, loading, createCategory, deleteCategory } = useMyServiceCategories();
  const navigate = useNavigate();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [creating, setCreating] = useState(false);

  const [newService, setNewService] = useState({
    name: '', description: '', funnel_type: 'classic', location_type: 'both',
  });

  const resetWizard = () => {
    setWizardStep(0);
    setNewService({ name: '', description: '', funnel_type: 'classic', location_type: 'both' });
  };

  const handleCreate = async () => {
    if (!newService.name.trim()) { toast.error('Veuillez donner un nom à votre service'); return; }
    setCreating(true);
    const { error, data } = await createCategory({
      name: newService.name.trim(),
      description: newService.description.trim() || undefined,
      funnel_type: newService.funnel_type,
      location_type: newService.location_type,
    });
    setCreating(false);
    if (error) { toast.error('Erreur lors de la création'); }
    else {
      toast.success('Service créé !');
      setWizardOpen(false);
      resetWizard();
      if (data) navigate(`/dashboard/services/${(data as any).id}`);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); e.preventDefault();
    if (!confirm('Supprimer ce service et toutes ses formules ?')) return;
    const { error } = await deleteCategory(id);
    if (error) toast.error('Erreur'); else toast.success('Service supprimé');
  };

  const getFunnelLabel = (type: string) => FUNNEL_PRESETS.find(p => p.id === type)?.name || type;
  const getLocationIcon = (type: string) => {
    const opt = LOCATION_OPTIONS.find(o => o.id === type);
    return opt ? <opt.icon className="w-3.5 h-3.5" /> : null;
  };

  if (loading) {
    return (
      <DashboardLayout title="Prestations publiques" subtitle={center?.name}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 rounded-2xl" />)}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Prestations publiques" subtitle={center?.name}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-foreground">Vos services</h2>
            <p className="text-sm text-muted-foreground">Configurez les services visibles sur votre page de réservation.</p>
          </div>
          <Button onClick={() => setWizardOpen(true)} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" /> Nouveau service
          </Button>
        </div>

        {categories.length === 0 ? (
          <Card variant="elevated" className="p-8 sm:p-12 text-center">
            <Package className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="font-semibold text-lg text-foreground mb-2">Aucun service configuré</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Créez votre premier service pour commencer à recevoir des réservations.
            </p>
            <Button onClick={() => setWizardOpen(true)} size="lg">
              <Plus className="w-4 h-4 mr-2" /> Créer mon premier service
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <Link key={cat.id} to={`/dashboard/services/${cat.id}`} className="group">
                <Card variant="elevated" className="p-5 h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Package className="w-5 h-5 text-primary" />
                    </div>
                    <Button variant="ghost" size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                      onClick={(e) => handleDelete(e, cat.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{cat.name}</h3>
                  {cat.description && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{cat.description}</p>}
                  <div className="flex items-center gap-2 flex-wrap mt-auto">
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-secondary/50 text-muted-foreground">
                      {FUNNEL_PRESETS.find(p => p.id === cat.funnel_type)?.icon} {getFunnelLabel(cat.funnel_type)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-secondary/50 text-muted-foreground">
                      {getLocationIcon(cat.location_type)} {LOCATION_OPTIONS.find(o => o.id === cat.location_type)?.label}
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Creation Wizard */}
      <Dialog open={wizardOpen} onOpenChange={(v) => { setWizardOpen(v); if (!v) resetWizard(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {wizardStep === 0 && 'Que proposez-vous ?'}
              {wizardStep === 1 && 'Où intervenez-vous ?'}
              {wizardStep === 2 && 'Quel type de parcours ?'}
            </DialogTitle>
            <DialogDescription className="sr-only">Assistant de création de service</DialogDescription>
          </DialogHeader>

          {wizardStep === 0 && (
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="service-name">Nom du service *</Label>
                <Input id="service-name" value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  placeholder="Ex: Nettoyage intérieur, Lavage vitre, Detailing..." className="h-11" autoFocus />
              </div>
              <div className="space-y-2">
                <Label htmlFor="service-desc">Description courte (optionnel)</Label>
                <Textarea id="service-desc" value={newService.description}
                  onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                  placeholder="Ex: Nettoyage complet de l'habitacle" rows={2} className="resize-none" />
              </div>
              <div className="flex justify-end">
                <Button onClick={() => { if (!newService.name.trim()) { toast.error('Donnez un nom'); return; } setWizardStep(1); }}>
                  Suivant <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {wizardStep === 1 && (
            <div className="space-y-4 pt-2">
              <div className="grid gap-3">
                {LOCATION_OPTIONS.map((opt) => (
                  <button key={opt.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                      newService.location_type === opt.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                    }`}
                    onClick={() => setNewService({ ...newService, location_type: opt.id })}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      newService.location_type === opt.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                    }`}><opt.icon className="w-5 h-5" /></div>
                    <div>
                      <p className="font-medium text-foreground">{opt.label}</p>
                      <p className="text-sm text-muted-foreground">{opt.description}</p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setWizardStep(0)}><ArrowLeft className="w-4 h-4 mr-2" /> Retour</Button>
                <Button onClick={() => setWizardStep(2)}>Suivant <ArrowRight className="w-4 h-4 ml-2" /></Button>
              </div>
            </div>
          )}

          {wizardStep === 2 && (
            <div className="space-y-4 pt-2">
              <div className="grid gap-3">
                {FUNNEL_PRESETS.map((preset) => (
                  <button key={preset.id}
                    className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                      newService.funnel_type === preset.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                    }`}
                    onClick={() => setNewService({ ...newService, funnel_type: preset.id })}>
                    <span className="text-2xl">{preset.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{preset.name}</p>
                      <p className="text-sm text-muted-foreground">{preset.description}</p>
                      <p className="text-xs text-muted-foreground/70 mt-1">{preset.example}</p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setWizardStep(1)}><ArrowLeft className="w-4 h-4 mr-2" /> Retour</Button>
                <Button onClick={handleCreate} disabled={creating}>
                  {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Créer le service
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
