import { useState, useEffect } from 'react';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { MobileSidebar } from '@/components/dashboard/MobileSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useMyCenter, useMyPacks } from '@/hooks/useCenter';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { CenterCustomization, defaultCustomization } from '@/types/customization';
import { CustomizationSection } from '@/components/dashboard/CustomizationSection';
import { CenterLanding } from '@/components/booking/CenterLanding';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { ExternalLink, Smartphone, Monitor, RefreshCw, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardMyPage() {
  const { center, loading, updateCenter } = useMyCenter();
  const { packs } = useMyPacks();
  const { user } = useAuth();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [customization, setCustomization] = useState<CenterCustomization>(defaultCustomization);
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('mobile');
  const [previewKey, setPreviewKey] = useState(0);
  
  // Custom request dialog state
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [requestType, setRequestType] = useState<'design' | 'functionality' | 'both'>('design');
  const [requestMessage, setRequestMessage] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);

  useEffect(() => {
    if (center) {
      setCustomization(center.customization || defaultCustomization);
    }
  }, [center]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await updateCenter({ customization });
    setSaving(false);
    
    if (error) {
      toast({ title: 'Erreur', description: error, variant: 'destructive' });
    } else {
      toast({ title: 'Enregistré', description: 'Vos modifications ont été sauvegardées.' });
    }
  };

  const handleRefreshPreview = () => {
    setPreviewKey(prev => prev + 1);
  };

  const handleSubmitRequest = async () => {
    if (!requestMessage.trim() || !center || !user) return;
    
    setSubmittingRequest(true);
    try {
      const { error } = await supabase.from('custom_requests').insert({
        center_id: center.id,
        center_name: center.name,
        contact_email: user.email || '',
        request_type: requestType,
        message: requestMessage.trim(),
      });
      
      if (error) throw error;
      
      toast({ title: 'Demande envoyée', description: 'Nous reviendrons vers vous rapidement.' });
      setRequestDialogOpen(false);
      setRequestMessage('');
      setRequestType('design');
    } catch (error) {
      console.error('Error submitting request:', error);
      toast({ title: 'Erreur', description: 'Impossible d\'envoyer la demande.', variant: 'destructive' });
    } finally {
      setSubmittingRequest(false);
    }
  };

  // Create a preview center object with current customization
  const previewCenter = center ? {
    ...center,
    customization,
  } : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardSidebar />
        <div className="lg:pl-64 p-4 sm:p-8">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-[600px] w-full" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        </div>
      </div>
    );
  }

  const publicUrl = center ? `${window.location.origin}/${center.slug}` : '';

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <MobileSidebar open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} />
      
      <div className="lg:pl-64">
        <DashboardHeader 
          title="Ma Page" 
          onMenuClick={() => setMobileMenuOpen(true)}
        />
        
        <main className="p-4 lg:p-6">
          {/* Header with actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-muted-foreground text-sm">
                Personnalisez et prévisualisez votre page publique en temps réel.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRequestDialogOpen(true)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Personnalisation privée
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(publicUrl, '_blank')}
                disabled={!center}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Voir en ligne</span>
                <span className="sm:hidden">Voir</span>
              </Button>
              <Button
                variant="premium"
                size="sm"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Left: Preview */}
            <div className="order-2 xl:order-1">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base sm:text-lg font-semibold text-foreground">Aperçu</h2>
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="flex bg-secondary rounded-lg p-1">
                    <button
                      onClick={() => setPreviewMode('mobile')}
                      className={cn(
                        "p-1.5 sm:p-2 rounded-md transition-colors",
                        previewMode === 'mobile' ? "bg-background shadow-sm" : "hover:bg-background/50"
                      )}
                    >
                      <Smartphone className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setPreviewMode('desktop')}
                      className={cn(
                        "p-1.5 sm:p-2 rounded-md transition-colors hidden sm:flex",
                        previewMode === 'desktop' ? "bg-background shadow-sm" : "hover:bg-background/50"
                      )}
                    >
                      <Monitor className="w-4 h-4" />
                    </button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRefreshPreview}
                    className="p-1.5 sm:p-2 h-auto"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {/* Preview Container */}
              <div 
                className={cn(
                  "bg-secondary/30 rounded-xl sm:rounded-2xl p-2 sm:p-4 flex justify-center overflow-hidden",
                  previewMode === 'desktop' ? "min-h-[500px] sm:min-h-[700px]" : "min-h-[450px] sm:min-h-[600px]"
                )}
              >
                <div 
                  key={previewKey}
                  className={cn(
                    "bg-background rounded-lg sm:rounded-xl shadow-xl overflow-hidden transition-all duration-300 relative",
                    previewMode === 'mobile' 
                      ? "w-full max-w-[320px] sm:max-w-[375px]" 
                      : "w-full max-w-[800px]"
                  )}
                  style={{
                    height: previewMode === 'mobile' ? 'calc(100vh - 350px)' : '600px',
                    maxHeight: previewMode === 'mobile' ? '580px' : '600px',
                    minHeight: previewMode === 'mobile' ? '400px' : '500px',
                  }}
                >
                  <div className="h-full overflow-y-auto relative">
                    {previewCenter && (
                      <CenterLanding
                        center={previewCenter}
                        packs={packs}
                        onStartBooking={() => {}}
                        onSelectPack={() => {}}
                        hasPacks={packs.length > 0}
                        isPro={center?.subscription_plan === 'pro' || center?.subscription_plan === 'trial'}
                        isPreview
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Customization Controls */}
            <div className="order-1 xl:order-2">
              <h2 className="text-lg font-semibold text-foreground mb-4">Personnalisation</h2>
              
              {center && user && (
                <div className="[&>section]:mb-0">
                <CustomizationSection
                  centerId={center.id}
                  userId={user.id}
                  customization={customization}
                  onUpdate={setCustomization}
                  packs={packs}
                />
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Custom Request Dialog */}
      <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Demande personnalisée</DialogTitle>
            <DialogDescription>
              Décrivez votre besoin et nous reviendrons vers vous rapidement.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <Label>Je souhaite :</Label>
              <RadioGroup value={requestType} onValueChange={(v) => setRequestType(v as 'design' | 'functionality' | 'both')}>
                <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-secondary/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="page_creation" id="page_creation" className="mt-0.5" />
                  <div>
                    <Label htmlFor="page_creation" className="font-medium cursor-pointer">Qu'on fasse ma page à ma place</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">On s'occupe de tout : design, textes, photos</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-secondary/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="functionality" id="functionality" className="mt-0.5" />
                  <div>
                    <Label htmlFor="functionality" className="font-medium cursor-pointer">Des fonctionnalités en plus</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">Paiement en ligne, réservation auto, intégrations...</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-secondary/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="design" id="design" className="mt-0.5" />
                  <div>
                    <Label htmlFor="design" className="font-medium cursor-pointer">Un design plus poussé</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">Personnalisation avancée, animations, style unique</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-secondary/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="both" id="both" className="mt-0.5" />
                  <div>
                    <Label htmlFor="both" className="font-medium cursor-pointer">Autre chose</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">Précisez votre besoin ci-dessous</p>
                  </div>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="request-message">Précisions</Label>
              <Textarea
                id="request-message"
                placeholder="Décrivez votre besoin en détail..."
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setRequestDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleSubmitRequest} 
              disabled={!requestMessage.trim() || submittingRequest}
            >
              {submittingRequest ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Envoi...
                </>
              ) : (
                'Envoyer'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
