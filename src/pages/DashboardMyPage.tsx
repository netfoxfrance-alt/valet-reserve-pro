import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
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
import { useTranslation } from 'react-i18next';

export default function DashboardMyPage() {
  const { t } = useTranslation();
  const { center, loading, updateCenter } = useMyCenter();
  const { packs } = useMyPacks();
  const { user } = useAuth();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [customization, setCustomization] = useState<CenterCustomization>(defaultCustomization);
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('mobile');
  const [previewKey, setPreviewKey] = useState(0);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [requestType, setRequestType] = useState<'design' | 'functionality' | 'both'>('design');
  const [requestMessage, setRequestMessage] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);

  useEffect(() => { if (center) setCustomization(center.customization || defaultCustomization); }, [center]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await updateCenter({ customization });
    setSaving(false);
    if (error) { toast({ title: t('common.error'), description: error, variant: 'destructive' }); }
    else { toast({ title: t('common.saved'), description: t('settings.changesSaved') }); }
  };

  const handleRefreshPreview = () => setPreviewKey(prev => prev + 1);

  const handleSubmitRequest = async () => {
    if (!requestMessage.trim() || !center || !user) return;
    setSubmittingRequest(true);
    try {
      const { error } = await supabase.from('custom_requests').insert({ center_id: center.id, center_name: center.name, contact_email: user.email || '', request_type: requestType, message: requestMessage.trim() });
      if (error) throw error;
      toast({ title: t('myPage.requestSent'), description: t('myPage.requestSentDesc') });
      setRequestDialogOpen(false); setRequestMessage(''); setRequestType('design');
    } catch (error) {
      console.error('Error submitting request:', error);
      toast({ title: t('common.error'), description: t('myPage.requestError'), variant: 'destructive' });
    } finally { setSubmittingRequest(false); }
  };

  const previewCenter = center ? { ...center, customization } : null;

  if (loading) {
    return (
      <DashboardLayout title={t('myPage.title')}>
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8"><Skeleton className="h-[600px] w-full" /><Skeleton className="h-[400px] w-full" /></div>
      </DashboardLayout>
    );
  }

  const publicUrl = center ? `${window.location.origin}/${center.slug}` : '';

  return (
    <DashboardLayout title={t('myPage.title')}>
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div><p className="text-muted-foreground text-sm">{t('myPage.customizeDesc')}</p></div>
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" size="sm" onClick={() => setRequestDialogOpen(true)} className="text-muted-foreground hover:text-foreground">
                <Sparkles className="w-4 h-4 mr-2" />{t('myPage.privateCustomization')}
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.open(publicUrl, '_blank')} disabled={!center}>
                <ExternalLink className="w-4 h-4 mr-2" /><span className="hidden sm:inline">{t('myPage.viewOnline')}</span><span className="sm:hidden">{t('common.view')}</span>
              </Button>
              <Button variant="premium" size="sm" onClick={handleSave} disabled={saving}>
                {saving ? t('common.saving') : t('common.save')}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] 2xl:grid-cols-[1fr_420px] gap-6 xl:gap-8">
            {/* Preview - appears second on mobile, first on desktop */}
            <div className="order-2 xl:order-1">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base sm:text-lg font-semibold text-foreground">{t('myPage.preview')}</h2>
                <div className="flex items-center gap-1.5">
                  <div className="flex bg-muted rounded-lg p-0.5">
                    <button 
                      onClick={() => setPreviewMode('mobile')} 
                      className={cn(
                        "p-1.5 sm:p-2 rounded-md transition-all duration-200",
                        previewMode === 'mobile' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Smartphone className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setPreviewMode('desktop')} 
                      className={cn(
                        "p-1.5 sm:p-2 rounded-md transition-all duration-200 hidden sm:flex",
                        previewMode === 'desktop' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Monitor className="w-4 h-4" />
                    </button>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleRefreshPreview} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Preview container with device frame */}
              <div className={cn(
                "rounded-2xl flex justify-center transition-all duration-300",
                previewMode === 'desktop' 
                  ? "bg-muted/40 p-3 sm:p-5" 
                  : "bg-muted/40 p-3 sm:p-6"
              )}>
                <div 
                  key={previewKey} 
                  className={cn(
                    "bg-background overflow-hidden transition-all duration-300 relative flex flex-col",
                    previewMode === 'mobile' 
                      ? "w-full max-w-[375px] rounded-[2.5rem] ring-[6px] ring-foreground/10 shadow-2xl" 
                      : "w-full rounded-xl ring-1 ring-border shadow-lg"
                  )}
                  style={{ 
                    height: previewMode === 'mobile' ? 'min(680px, calc(100vh - 280px))' : 'min(620px, calc(100vh - 280px))',
                  }}
                >
                  {/* iPhone notch (mobile only) */}
                  {previewMode === 'mobile' && (
                    <div className="relative z-10 flex justify-center pt-2 pb-1 bg-background">
                      <div className="w-[120px] h-[28px] bg-foreground/10 rounded-full" />
                    </div>
                  )}

                  {/* Scrollable content */}
                  <div className="flex-1 overflow-y-auto overflow-x-hidden">
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

            {/* Customization panel - appears first on mobile */}
            <div className="order-1 xl:order-2">
              <h2 className="text-lg font-semibold text-foreground mb-4">{t('myPage.customization')}</h2>
              {center && user && (
                <div className="[&>section]:mb-0">
                  <CustomizationSection centerId={center.id} userId={user.id} customization={customization} onUpdate={setCustomization} packs={packs} />
                </div>
              )}
            </div>
          </div>
        </div>
      <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('myPage.customRequest')}</DialogTitle>
            <DialogDescription>{t('myPage.customRequestDesc')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <Label>{t('myPage.iWant')}</Label>
              <RadioGroup value={requestType} onValueChange={(v) => setRequestType(v as any)}>
                <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-secondary/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="page_creation" id="page_creation" className="mt-0.5" />
                  <div><Label htmlFor="page_creation" className="font-medium cursor-pointer">{t('myPage.pageCreation')}</Label><p className="text-xs text-muted-foreground mt-0.5">{t('myPage.pageCreationDesc')}</p></div>
                </div>
                <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-secondary/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="functionality" id="functionality" className="mt-0.5" />
                  <div><Label htmlFor="functionality" className="font-medium cursor-pointer">{t('myPage.moreFunctionality')}</Label><p className="text-xs text-muted-foreground mt-0.5">{t('myPage.moreFunctionalityDesc')}</p></div>
                </div>
                <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-secondary/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="design" id="design" className="mt-0.5" />
                  <div><Label htmlFor="design" className="font-medium cursor-pointer">{t('myPage.betterDesign')}</Label><p className="text-xs text-muted-foreground mt-0.5">{t('myPage.betterDesignDesc')}</p></div>
                </div>
                <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-secondary/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="both" id="both" className="mt-0.5" />
                  <div><Label htmlFor="both" className="font-medium cursor-pointer">{t('myPage.somethingElse')}</Label><p className="text-xs text-muted-foreground mt-0.5">{t('myPage.somethingElseDesc')}</p></div>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="request-message">{t('myPage.details')}</Label>
              <Textarea id="request-message" placeholder={t('myPage.detailsPlaceholder')} value={requestMessage} onChange={(e) => setRequestMessage(e.target.value)} rows={3} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setRequestDialogOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleSubmitRequest} disabled={!requestMessage.trim() || submittingRequest}>
              {submittingRequest ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t('common.sending')}</>) : t('common.send')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}