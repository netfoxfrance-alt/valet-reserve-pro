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
import { PageTemplateChooser } from '@/components/dashboard/PageTemplateChooser';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { ExternalLink, Smartphone, Monitor, RefreshCw, Sparkles, Loader2, PanelLeftClose, PanelLeftOpen, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { trackEvent } from '@/lib/analytics';
import { useIsMobile } from '@/hooks/use-mobile';

export default function DashboardMyPage() {
  const { t } = useTranslation();
  const { center, loading, updateCenter } = useMyCenter();
  const { packs } = useMyPacks();
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [saving, setSaving] = useState(false);
  const [customization, setCustomization] = useState<CenterCustomization>(defaultCustomization);
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('desktop');
  const [previewKey, setPreviewKey] = useState(0);
  const [panelOpen, setPanelOpen] = useState(true);
  const [showTemplates, setShowTemplates] = useState(false);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [requestType, setRequestType] = useState<'design' | 'functionality' | 'both'>('functionality');
  const [requestMessage, setRequestMessage] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);
  // Mobile: show either editor or preview
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');

  useEffect(() => {
    if (center) {
      const cust = center.customization || defaultCustomization;
      setCustomization(cust);
      // Show template chooser for brand new pages (only default blocks, no cover)
      const isNewPage = !cust.cover_url && 
        (!cust.blocks || cust.blocks.length <= 1) && 
        cust.colors.primary === defaultCustomization.colors.primary;
      if (isNewPage && !localStorage.getItem(`template_chosen_${center.id}`)) {
        setShowTemplates(true);
      }
    }
  }, [center]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await updateCenter({ customization });
    setSaving(false);
    if (error) {
      toast({ title: t('common.error'), description: error, variant: 'destructive' });
    } else {
      trackEvent('page_published');
      toast({ title: t('common.saved'), description: t('settings.changesSaved') });
    }
  };

  const handleTemplateSelect = (cust: CenterCustomization) => {
    setCustomization(cust);
    setShowTemplates(false);
    if (center) localStorage.setItem(`template_chosen_${center.id}`, '1');
  };

  const handleTemplateSkip = () => {
    setShowTemplates(false);
    if (center) localStorage.setItem(`template_chosen_${center.id}`, '1');
  };

  const handleRefreshPreview = () => setPreviewKey(prev => prev + 1);

  const handleSubmitRequest = async () => {
    if (!requestMessage.trim() || !center || !user) return;
    setSubmittingRequest(true);
    try {
      const { error } = await supabase.from('custom_requests').insert({ center_id: center.id, center_name: center.name, contact_email: user.email || '', request_type: requestType, message: requestMessage.trim() });
      if (error) throw error;
      await supabase.functions.invoke('send-booking-emails', {
        body: { type: 'custom_request', centerName: center.name, contactEmail: user.email || '', requestType, message: requestMessage.trim() },
      });
      toast({ title: t('myPage.requestSent'), description: t('myPage.requestSentDesc') });
      setRequestDialogOpen(false); setRequestMessage(''); setRequestType('functionality');
    } catch (error) {
      console.error('Error submitting request:', error);
      toast({ title: t('common.error'), description: t('myPage.requestError'), variant: 'destructive' });
    } finally { setSubmittingRequest(false); }
  };

  const previewCenter = center ? { ...center, customization } : null;

  if (loading) {
    return (
      <DashboardLayout title={t('myPage.title')} fullWidth>
        <div className="flex h-[calc(100vh-56px)]">
          <div className="w-96 border-r p-6"><Skeleton className="h-full w-full rounded-xl" /></div>
          <div className="flex-1 p-6"><Skeleton className="h-full w-full rounded-xl" /></div>
        </div>
      </DashboardLayout>
    );
  }

  // Template chooser overlay
  if (showTemplates) {
    return (
      <DashboardLayout title={t('myPage.title')} fullWidth>
        <PageTemplateChooser onSelect={handleTemplateSelect} onSkip={handleTemplateSkip} />
      </DashboardLayout>
    );
  }

  const publicUrl = center ? `${window.location.origin}/${center.slug}` : '';

  // Mobile layout
  if (isMobile) {
    return (
      <DashboardLayout title={t('myPage.title')} fullWidth>
        <div className="flex flex-col h-[calc(100vh-56px)]">
          {/* Mobile toolbar */}
          <div className="flex items-center justify-between p-3 border-b bg-background">
            <div className="flex bg-muted rounded-xl p-0.5">
              <button
                onClick={() => setMobileView('editor')}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  mobileView === 'editor' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
                )}
              >
                Éditer
              </button>
              <button
                onClick={() => setMobileView('preview')}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5",
                  mobileView === 'preview' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
                )}
              >
                <Eye className="w-3.5 h-3.5" />
                Aperçu
              </button>
            </div>
            <div className="flex gap-1.5">
              <Button variant="outline" size="sm" onClick={() => window.open(publicUrl, '_blank')} disabled={!center}>
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
              <Button variant="premium" size="sm" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : t('common.save')}
              </Button>
            </div>
          </div>

          {/* Mobile content */}
          {mobileView === 'editor' ? (
            <div className="flex-1 overflow-y-auto p-4">
              {center && user && (
                <div className="[&>section]:mb-0">
                  <CustomizationSection
                    centerId={center.id}
                    userId={user.id}
                    customization={customization}
                    onUpdate={setCustomization}
                    packs={packs}
                    centerAddress={center.address || undefined}
                    centerPhone={center.phone || undefined}
                    logoUrl={center.logo_url}
                    onLogoUploaded={async (url) => {
                      await updateCenter({ logo_url: url });
                    }}
                    onLogoRemoved={async () => {
                      await updateCenter({ logo_url: null });
                    }}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto bg-muted/30">
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
          )}
        </div>
        
        {/* Request dialog */}
        {renderRequestDialog()}
      </DashboardLayout>
    );
  }

  // Desktop layout: Editor sidebar + Full preview
  return (
    <DashboardLayout title={t('myPage.title')} fullWidth>
      <div className="flex h-[calc(100vh-56px)]">
        {/* Editor Panel (left sidebar) */}
        <div
          className={cn(
            "border-r border-border bg-background flex flex-col transition-all duration-300 shrink-0",
            panelOpen ? "w-[400px] 2xl:w-[440px]" : "w-0"
          )}
        >
          {panelOpen && (
            <>
              {/* Panel header */}
              <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
                <div>
                  <h2 className="font-semibold text-foreground text-sm">Personnalisation</h2>
                  <p className="text-xs text-muted-foreground">Modifiez votre page en direct</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setRequestDialogOpen(true)}
                    className="text-muted-foreground hover:text-foreground h-8 w-8 p-0"
                    title={t('myPage.privateCustomization')}
                  >
                    <Sparkles className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => window.open(publicUrl, '_blank')} disabled={!center} className="h-8 w-8 p-0">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="premium" size="sm" onClick={handleSave} disabled={saving} className="h-8 px-3">
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : t('common.save')}
                  </Button>
                </div>
              </div>

              {/* Panel content - scrollable */}
              <div className="flex-1 overflow-y-auto p-4">
                {center && user && (
                  <div className="[&>section]:mb-0">
                    <CustomizationSection
                      centerId={center.id}
                      userId={user.id}
                      customization={customization}
                      onUpdate={setCustomization}
                      packs={packs}
                      centerAddress={center.address || undefined}
                      centerPhone={center.phone || undefined}
                      logoUrl={center.logo_url}
                      onLogoUploaded={async (url) => {
                        await updateCenter({ logo_url: url });
                      }}
                      onLogoRemoved={async () => {
                        await updateCenter({ logo_url: null });
                      }}
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Preview area (right, takes remaining space) */}
        <div className="flex-1 flex flex-col min-w-0 bg-muted/20">
          {/* Preview toolbar */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-background shrink-0">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPanelOpen(!panelOpen)}
                title={panelOpen ? 'Masquer le panneau' : 'Afficher le panneau'}
              >
                {panelOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
              </Button>
              <span className="text-sm font-medium text-foreground">Aperçu</span>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="flex bg-muted rounded-lg p-0.5">
                <button
                  onClick={() => setPreviewMode('mobile')}
                  className={cn(
                    "p-1.5 rounded-md transition-all duration-200",
                    previewMode === 'mobile' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Smartphone className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewMode('desktop')}
                  className={cn(
                    "p-1.5 rounded-md transition-all duration-200",
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

          {/* Preview content */}
          <div className="flex-1 overflow-hidden flex items-start justify-center p-4 2xl:p-6">
            <div
              key={previewKey}
              className={cn(
                "bg-background overflow-hidden transition-all duration-300 relative flex flex-col h-full",
                previewMode === 'mobile'
                  ? "w-full max-w-[390px] rounded-[2.5rem] ring-[6px] ring-foreground/10 shadow-2xl"
                  : "w-full rounded-xl ring-1 ring-border shadow-lg"
              )}
            >
              {/* iPhone notch (mobile only) */}
              {previewMode === 'mobile' && (
                <div className="relative z-10 flex justify-center pt-2 pb-1 bg-background shrink-0">
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
      </div>

      {/* Request dialog */}
      {renderRequestDialog()}
    </DashboardLayout>
  );

  function renderRequestDialog() {
    return (
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
    );
  }
}
