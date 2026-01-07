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
import { ExternalLink, Smartphone, Monitor, RefreshCw } from 'lucide-react';
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

  const publicUrl = center ? `${window.location.origin}/c/${center.slug}` : '';

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
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(publicUrl, '_blank')}
                disabled={!center}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Voir en ligne
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
                    "bg-background rounded-lg sm:rounded-xl shadow-xl overflow-hidden transition-all duration-300",
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
                  <div className="h-full overflow-y-auto">
                    {previewCenter && (
                      <CenterLanding
                        center={previewCenter}
                        packs={packs}
                        onStartBooking={() => {}}
                        onSelectPack={() => {}}
                        hasPacks={packs.length > 0}
                        isPro={center?.subscription_plan === 'pro' || center?.subscription_plan === 'trial'}
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
    </div>
  );
}
