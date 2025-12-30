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
import { Sparkles, Upload, Trash2, Loader2, CreditCard, Crown, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardSettings() {
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
    welcome_message: '',
  });
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (center) {
      setSettings({
        name: center.name || '',
        address: center.address || '',
        phone: center.phone || '',
        welcome_message: center.welcome_message || '',
      });
      setLogoUrl(center.logo_url);
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

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handleLogoUpload triggered', event.target.files);
    const file = event.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }
    if (!user) {
      console.log('No user');
      toast({ title: 'Erreur', description: 'Vous devez être connecté.', variant: 'destructive' });
      return;
    }

    console.log('File selected:', file.name, file.type, file.size);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Erreur', description: 'Veuillez sélectionner une image.', variant: 'destructive' });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'Erreur', description: 'L\'image doit faire moins de 2 Mo.', variant: 'destructive' });
      return;
    }

    setUploadingLogo(true);

    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/logo.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('center-logos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('center-logos')
        .getPublicUrl(fileName);

      // Update center with logo URL
      const { error: updateError } = await updateCenter({ logo_url: publicUrl });
      
      if (updateError) throw new Error(updateError);

      setLogoUrl(publicUrl);
      toast({ title: 'Logo mis à jour', description: 'Votre logo a été téléchargé avec succès.' });
    } catch (error: any) {
      console.error('Logo upload error:', error);
      toast({ title: 'Erreur', description: 'Impossible de télécharger le logo.', variant: 'destructive' });
    } finally {
      setUploadingLogo(false);
      // reset input value handled by browser via label-triggered input
      event.target.value = '';
    }
  };

  const handleRemoveLogo = async () => {
    if (!user) return;

    setUploadingLogo(true);
    try {
      // Remove from storage
      const { error: deleteError } = await supabase.storage
        .from('center-logos')
        .remove([`${user.id}/logo.png`, `${user.id}/logo.jpg`, `${user.id}/logo.jpeg`, `${user.id}/logo.webp`]);

      if (deleteError) console.warn('Delete warning:', deleteError);

      // Update center
      const { error: updateError } = await updateCenter({ logo_url: null });
      if (updateError) throw new Error(updateError);

      setLogoUrl(null);
      toast({ title: 'Logo supprimé' });
    } catch (error: any) {
      toast({ title: 'Erreur', description: 'Impossible de supprimer le logo.', variant: 'destructive' });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!session?.access_token) {
      toast({
        title: 'Erreur',
        description: 'Vous devez être connecté.',
        variant: 'destructive',
      });
      return;
    }

    setOpeningPortal(true);

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.url) {
        window.open(data.url, '_blank');
      } else {
        throw new Error('No portal URL returned');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ouvrir le portail de gestion.',
        variant: 'destructive',
      });
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
          title="Paramètres" 
          onMenuClick={() => setMobileMenuOpen(true)}
        />
        
        <main className="p-4 lg:p-8 max-w-2xl">
          {/* Logo Section */}
          <section className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-1 sm:mb-2">Logo du centre</h2>
            <p className="text-sm text-muted-foreground mb-4 sm:mb-6">Apparaît sur votre page de réservation.</p>
            
            <Card variant="elevated" className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                {/* Logo Preview */}
                <div className="relative">
                  {logoUrl ? (
                    <img 
                      src={logoUrl} 
                      alt="Logo" 
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover border border-border"
                    />
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

                {/* Upload Controls */}
                <div className="flex flex-col gap-2 items-center sm:items-start">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="sr-only"
                    id="logo-upload"
                  />

                  <Label
                    htmlFor="logo-upload"
                    className={cn(
                      buttonVariants({ variant: 'outline', size: 'sm' }),
                      uploadingLogo && 'pointer-events-none opacity-50',
                      "w-full sm:w-auto cursor-pointer"
                    )}
                  >
                    <Upload className="w-4 h-4" />
                    {logoUrl ? 'Changer le logo' : 'Ajouter un logo'}
                  </Label>

                  {logoUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveLogo}
                      disabled={uploadingLogo}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                      Supprimer
                    </Button>
                  )}
                  <p className="text-xs text-muted-foreground text-center sm:text-left">
                    JPG, PNG ou WebP. Max 2 Mo.
                  </p>
                </div>
              </div>
            </Card>
          </section>

          <section className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-1 sm:mb-2">Informations du centre</h2>
            <p className="text-sm text-muted-foreground mb-4 sm:mb-6">Ces informations seront affichées aux clients.</p>
            
            <Card variant="elevated" className="p-4 sm:p-6 space-y-4 sm:space-y-5">
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
          
          <section className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-1 sm:mb-2">Page de réservation</h2>
            <p className="text-sm text-muted-foreground mb-4 sm:mb-6">Personnalisez l'accueil de vos clients.</p>
            
            <Card variant="elevated" className="p-4 sm:p-6 space-y-4 sm:space-y-5">
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

          {/* Subscription Section */}
          <section className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-1 sm:mb-2">Abonnement</h2>
            <p className="text-sm text-muted-foreground mb-4 sm:mb-6">Gérez votre abonnement CleaningPage.</p>
            
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
                        ? `Renouvellement le ${new Date(subscription.subscriptionEnd!).toLocaleDateString('fr-FR')}`
                        : 'Accès limité aux fonctionnalités'
                      }
                    </p>
                  </div>
                </div>

                {subscription.subscribed ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleManageSubscription}
                    disabled={openingPortal}
                    className="w-full sm:w-auto"
                  >
                    {openingPortal ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Ouverture...
                      </>
                    ) : (
                      <>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Gérer l'abonnement
                      </>
                    )}
                  </Button>
                ) : (
                  <Link to="/dashboard/upgrade" className="w-full sm:w-auto">
                    <Button variant="premium" size="sm" className="w-full">
                      <Crown className="w-4 h-4 mr-2" />
                      Passer à Pro
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          </section>
          
          
          <div className="flex justify-end">
            <Button variant="premium" onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
              {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}
