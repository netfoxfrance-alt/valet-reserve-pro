import { useState, useEffect } from 'react';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { MobileSidebar } from '@/components/dashboard/MobileSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

import { Card } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useMyCenter } from '@/hooks/useCenter';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { Sparkles, Upload, Trash2, Loader2, CreditCard, Crown, ExternalLink, Link2, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CenterCustomization, defaultCustomization } from '@/types/customization';
import { useTranslation } from 'react-i18next';

// Generate a clean slug from text
const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 30);
};

export default function DashboardSettings() {
  const { t, i18n } = useTranslation();
  const { center, loading, updateCenter } = useMyCenter();
  const { user, session, subscription } = useAuth();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [openingPortal, setOpeningPortal] = useState(false);
  const [settings, setSettings] = useState({
    name: '',
    address: '',
    phone: '',
  });
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [customization, setCustomization] = useState<CenterCustomization>(defaultCustomization);
  
  // Slug editing state
  const [slug, setSlug] = useState('');
  const [slugInput, setSlugInput] = useState('');
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [savingSlug, setSavingSlug] = useState(false);

  useEffect(() => {
    if (center) {
      setSettings({
        name: center.name || '',
        address: center.address || '',
        phone: center.phone || '',
      });
      setLogoUrl(center.logo_url);
      setSlug(center.slug || '');
      setSlugInput(center.slug || '');
      if (center.customization) {
        setCustomization(center.customization);
      }
    }
  }, [center]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await updateCenter({ 
      ...settings,
      customization,
    });
    setSaving(false);
    
    if (error) {
      toast({ title: t('common.error'), description: error, variant: 'destructive' });
    } else {
      toast({ title: t('common.saved'), description: t('settings.changesSaved') });
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!user) {
      toast({ title: t('common.error'), description: t('settings.mustBeLoggedIn'), variant: 'destructive' });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({ title: t('common.error'), description: t('settings.selectImage'), variant: 'destructive' });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({ title: t('common.error'), description: t('settings.imageTooBig'), variant: 'destructive' });
      return;
    }

    setUploadingLogo(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/logo.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('center-logos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('center-logos')
        .getPublicUrl(fileName);

      const { error: updateError } = await updateCenter({ logo_url: publicUrl });
      if (updateError) throw new Error(updateError);

      setLogoUrl(publicUrl);
      toast({ title: t('settings.logoUpdated'), description: t('settings.logoUploadSuccess') });
    } catch (error: any) {
      console.error('Logo upload error:', error);
      toast({ title: t('common.error'), description: t('settings.logoUploadError'), variant: 'destructive' });
    } finally {
      setUploadingLogo(false);
      event.target.value = '';
    }
  };

  const handleRemoveLogo = async () => {
    if (!user) return;

    setUploadingLogo(true);
    try {
      const { error: deleteError } = await supabase.storage
        .from('center-logos')
        .remove([`${user.id}/logo.png`, `${user.id}/logo.jpg`, `${user.id}/logo.jpeg`, `${user.id}/logo.webp`]);

      if (deleteError) console.warn('Delete warning:', deleteError);

      const { error: updateError } = await updateCenter({ logo_url: null });
      if (updateError) throw new Error(updateError);

      setLogoUrl(null);
      toast({ title: t('settings.logoDeleted') });
    } catch (error: any) {
      toast({ title: t('common.error'), description: t('settings.logoDeleteError'), variant: 'destructive' });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!session?.access_token) {
      toast({ title: t('common.error'), description: t('settings.mustBeLoggedIn'), variant: 'destructive' });
      return;
    }

    setOpeningPortal(true);

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error) throw new Error(error.message);

      if (data?.url) {
        window.open(data.url, '_blank');
      } else {
        throw new Error('No portal URL returned');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({ title: t('common.error'), description: t('settings.portalError'), variant: 'destructive' });
    } finally {
      setOpeningPortal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardSidebar />
        <div className="lg:pl-64 p-4 sm:p-8">
          <Skeleton className="h-8 w-48 mb-8" />
          <Skeleton className="h-64 w-full max-w-2xl" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <MobileSidebar open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} />
      
      <div className="lg:pl-64">
        <DashboardHeader 
          title={t('settings.title')} 
          onMenuClick={() => setMobileMenuOpen(true)}
        />
        
        <main className="p-4 lg:p-8 max-w-2xl">
          {/* Logo Section */}
          <section className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-1 sm:mb-2">{t('settings.centerLogo')}</h2>
            <p className="text-sm text-muted-foreground mb-4 sm:mb-6">{t('settings.logoDesc')}</p>
            
            <Card variant="elevated" className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <div className="relative">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover border border-border" />
                  ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-primary rounded-xl flex items-center justify-center">
                      <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-primary-foreground" />
                    </div>
                  )}
                  {uploadingLogo && (
                    <div className="absolute inset-0 bg-background/80 rounded-xl flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 items-center sm:items-start">
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="sr-only" id="logo-upload" />
                  <Label
                    htmlFor="logo-upload"
                    className={cn(
                      buttonVariants({ variant: 'outline', size: 'sm' }),
                      uploadingLogo && 'pointer-events-none opacity-50',
                      "w-full sm:w-auto cursor-pointer"
                    )}
                  >
                    <Upload className="w-4 h-4" />
                    {logoUrl ? t('settings.changeLogo') : t('settings.addLogo')}
                  </Label>

                  {logoUrl && (
                    <Button variant="ghost" size="sm" onClick={handleRemoveLogo} disabled={uploadingLogo} className="text-destructive hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                      {t('settings.removeLogo')}
                    </Button>
                  )}
                  <p className="text-xs text-muted-foreground text-center sm:text-left">
                    {t('settings.logoFormat')}
                  </p>
                </div>
              </div>
            </Card>
          </section>

          {/* Slug Section */}
          <section className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-1 sm:mb-2">{t('settings.pageLink')}</h2>
            <p className="text-sm text-muted-foreground mb-4 sm:mb-6">{t('settings.pageLinkDesc')}</p>
            
            <Card variant="elevated" className="p-4 sm:p-6">
              {!isEditingSlug ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Link2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">cleaningpage.com/{slug}</p>
                      <p className="text-sm text-muted-foreground">{t('settings.yourPublicLink')}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setIsEditingSlug(true)} className="w-full sm:w-auto">
                    {t('common.edit')}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="slug">{t('settings.newLink')}</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground whitespace-nowrap">cleaningpage.com/</span>
                      <div className="relative flex-1">
                        <Input
                          id="slug"
                          value={slugInput}
                          onChange={(e) => {
                            const cleaned = generateSlug(e.target.value);
                            setSlugInput(cleaned);
                            setSlugAvailable(null);
                            
                            if (cleaned.length >= 3 && cleaned !== slug) {
                              setIsCheckingSlug(true);
                              const timeoutId = setTimeout(async () => {
                                try {
                                  const { data } = await supabase
                                    .from('centers')
                                    .select('id')
                                    .eq('slug', cleaned)
                                    .maybeSingle();
                                  setSlugAvailable(data === null);
                                } catch {
                                  setSlugAvailable(null);
                                } finally {
                                  setIsCheckingSlug(false);
                                }
                              }, 300);
                              return () => clearTimeout(timeoutId);
                            } else if (cleaned === slug) {
                              setSlugAvailable(null);
                            }
                          }}
                          placeholder="mon-entreprise"
                          className="pr-10"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {isCheckingSlug ? (
                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                          ) : slugAvailable === true ? (
                            <Check className="w-4 h-4 text-emerald-500" />
                          ) : slugAvailable === false ? (
                            <X className="w-4 h-4 text-destructive" />
                          ) : null}
                        </div>
                      </div>
                    </div>
                    {slugAvailable === false && (
                      <p className="text-xs text-destructive">{t('settings.linkTaken')}</p>
                    )}
                    {slugInput.length > 0 && slugInput.length < 3 && (
                      <p className="text-xs text-muted-foreground">{t('settings.minChars')}</p>
                    )}
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" size="sm" onClick={() => { setIsEditingSlug(false); setSlugInput(slug); setSlugAvailable(null); }}>
                      {t('common.cancel')}
                    </Button>
                    <Button
                      variant="premium"
                      size="sm"
                      disabled={savingSlug || slugInput.length < 3 || slugInput === slug || slugAvailable === false || isCheckingSlug}
                      onClick={async () => {
                        if (slugInput.length < 3 || slugAvailable === false) return;
                        setSavingSlug(true);
                        const { error } = await updateCenter({ slug: slugInput });
                        setSavingSlug(false);
                        if (error) {
                          toast({ title: t('common.error'), description: error.includes('unique') ? t('settings.linkTaken') : error, variant: 'destructive' });
                        } else {
                          setSlug(slugInput);
                          setIsEditingSlug(false);
                          toast({ title: t('settings.linkUpdated'), description: t('settings.newUrlIs', { slug: slugInput }) });
                        }
                      }}
                    >
                      {savingSlug ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t('common.saving')}</>
                      ) : (
                        t('common.save')
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </section>

          <section className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-1 sm:mb-2">{t('settings.centerInfo')}</h2>
            <p className="text-sm text-muted-foreground mb-4 sm:mb-6">{t('settings.centerInfoDesc')}</p>
            
            <Card variant="elevated" className="p-4 sm:p-6 space-y-4 sm:space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">{t('settings.businessName')}</Label>
                <Input id="name" value={settings.name} onChange={(e) => setSettings({ ...settings, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">{t('common.address')}</Label>
                <Input id="address" value={settings.address} onChange={(e) => setSettings({ ...settings, address: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t('common.phone')}</Label>
                <Input id="phone" value={settings.phone} onChange={(e) => setSettings({ ...settings, phone: e.target.value })} />
              </div>
            </Card>
          </section>
          
          {/* Subscription Section */}
          <section className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-1 sm:mb-2">{t('settings.subscription')}</h2>
            <p className="text-sm text-muted-foreground mb-4 sm:mb-6">{t('settings.subscriptionDesc')}</p>
            
            <Card variant="elevated" className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    subscription.subscribed ? "bg-primary/10" : "bg-secondary"
                  )}>
                    {subscription.subscribed ? (
                      <Crown className="w-5 h-5 text-primary" />
                    ) : (
                      <CreditCard className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {subscription.subscribed ? 'CleaningPage Pro' : 'CleaningPage Free'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {subscription.subscribed 
                        ? t('settings.renewalOn', { date: new Date(subscription.subscriptionEnd!).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'fr-FR') })
                        : t('settings.limitedAccess')
                      }
                    </p>
                  </div>
                </div>

                {subscription.subscribed ? (
                  <Button variant="outline" size="sm" onClick={handleManageSubscription} disabled={openingPortal} className="w-full sm:w-auto">
                    {openingPortal ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t('settings.opening')}</>
                    ) : (
                      <><ExternalLink className="w-4 h-4 mr-2" />{t('settings.manageSubscription')}</>
                    )}
                  </Button>
                ) : (
                  <Link to="/dashboard/upgrade" className="w-full sm:w-auto">
                    <Button variant="premium" size="sm" className="w-full">
                      <Crown className="w-4 h-4 mr-2" />
                      {t('settings.upgradeToPro')}
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          </section>
          
          <div className="flex justify-end">
            <Button variant="premium" onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
              {saving ? t('common.saving') : t('settings.saveChanges')}
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}