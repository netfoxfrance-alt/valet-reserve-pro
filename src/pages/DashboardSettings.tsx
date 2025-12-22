import { useState, useEffect, useRef } from 'react';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useMyCenter } from '@/hooks/useCenter';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, Upload, Trash2, Loader2 } from 'lucide-react';

export default function DashboardSettings() {
  const { center, loading, updateCenter } = useMyCenter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [settings, setSettings] = useState({
    name: '',
    address: '',
    phone: '',
    welcome_message: '',
    ai_enabled: true,
  });
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (center) {
      setSettings({
        name: center.name || '',
        address: center.address || '',
        phone: center.phone || '',
        welcome_message: center.welcome_message || '',
        ai_enabled: center.ai_enabled ?? true,
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
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
          {/* Logo Section */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-2">Logo du centre</h2>
            <p className="text-muted-foreground mb-6">Apparaît sur votre page de réservation.</p>
            
            <Card variant="elevated" className="p-6">
              <div className="flex items-center gap-6">
                {/* Logo Preview */}
                <div className="relative">
                  {logoUrl ? (
                    <img 
                      src={logoUrl} 
                      alt="Logo" 
                      className="w-24 h-24 rounded-xl object-cover border border-border"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-primary rounded-xl flex items-center justify-center">
                      <Sparkles className="w-10 h-10 text-primary-foreground" />
                    </div>
                  )}
                  {uploadingLogo && (
                    <div className="absolute inset-0 bg-background/80 rounded-xl flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  )}
                </div>

                {/* Upload Controls */}
                <div className="flex flex-col gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleLogoUpload}
                    className="sr-only"
                    id="logo-upload"
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      console.log('Button clicked, fileInputRef:', fileInputRef.current);
                      fileInputRef.current?.click();
                    }}
                    disabled={uploadingLogo}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {logoUrl ? 'Changer le logo' : 'Ajouter un logo'}
                  </Button>
                  {logoUrl && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={handleRemoveLogo}
                      disabled={uploadingLogo}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer
                    </Button>
                  )}
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG ou WebP. Max 2 Mo.
                  </p>
                </div>
              </div>
            </Card>
          </section>

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
