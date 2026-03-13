import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PAGE_TEMPLATES, PageTemplate, applyTemplate, COLOR_THEMES, ColorTheme } from '@/lib/pageTemplates';
import { CenterCustomization } from '@/types/customization';
import { cn } from '@/lib/utils';
import { Check, ChevronRight, Upload, Sparkles, Image, Palette, ArrowLeft } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PageOnboardingProps {
  customization: CenterCustomization;
  onUpdate: (customization: CenterCustomization) => void;
  onComplete: () => void;
  userId: string;
}

const STEPS = [
  { id: 'template', label: 'Style', icon: Sparkles },
  { id: 'banner', label: 'Bannière', icon: Image },
  { id: 'colors', label: 'Couleurs', icon: Palette },
] as const;

type StepId = typeof STEPS[number]['id'];

export function PageOnboarding({ customization, onUpdate, onComplete, userId }: PageOnboardingProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<StepId>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const stepIndex = STEPS.findIndex(s => s.id === currentStep);

  const applySelectedTemplate = (templateId: string) => {
    const template = PAGE_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      onUpdate(applyTemplate(template, customization));
      setSelectedTemplate(templateId);
    }
  };

  const applyTheme = (theme: ColorTheme) => {
    onUpdate({
      ...customization,
      colors: { ...customization.colors, ...theme.colors },
    });
  };

  const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) return;
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/cover.${fileExt}`;
      const { error } = await supabase.storage.from('center-logos').upload(fileName, file, { upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('center-logos').getPublicUrl(fileName);
      onUpdate({ ...customization, cover_url: publicUrl });
      toast({ title: 'Bannière ajoutée !' });
    } catch {
      toast({ title: 'Erreur', variant: 'destructive' });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const goNext = () => {
    if (stepIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[stepIndex + 1].id);
    } else {
      localStorage.setItem('page_onboarding_done', 'true');
      onComplete();
    }
  };

  const goBack = () => {
    if (stepIndex > 0) setCurrentStep(STEPS[stepIndex - 1].id);
  };

  return (
    <div className="max-w-lg mx-auto">
      {/* Progress */}
      <div className="flex items-center gap-1 mb-6">
        {STEPS.map((step, i) => (
          <div key={step.id} className="flex items-center flex-1">
            <div className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold transition-all",
              i <= stepIndex ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              {i < stepIndex ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className={cn(
              "text-xs ml-1.5 hidden sm:inline",
              i <= stepIndex ? "text-foreground font-medium" : "text-muted-foreground"
            )}>
              {step.label}
            </span>
            {i < STEPS.length - 1 && (
              <div className={cn("flex-1 h-0.5 mx-2 rounded-full", i < stepIndex ? "bg-primary" : "bg-muted")} />
            )}
          </div>
        ))}
      </div>

      {/* Step: Template */}
      {currentStep === 'template' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Choisissez un style de départ</h3>
            <p className="text-sm text-muted-foreground">Vous pourrez tout modifier après.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {PAGE_TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => applySelectedTemplate(template.id)}
                className={cn(
                  "relative flex flex-col rounded-xl border-2 overflow-hidden transition-all hover:scale-[1.02] text-left",
                  selectedTemplate === template.id ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-muted-foreground/50"
                )}
              >
                <div className="h-20 w-full p-2.5 flex flex-col justify-end" style={{ backgroundColor: template.preview.dark_mode ? '#0f172a' : '#f8fafc' }}>
                  <div className="absolute top-0 left-0 right-0 h-7" style={{ backgroundColor: template.preview.dark_mode ? '#1e293b' : '#fff' }}>
                    <div className="flex items-center gap-1.5 px-2 h-full">
                      <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: template.preview.primary }} />
                      <div className="h-1.5 w-8 rounded-full" style={{ backgroundColor: template.preview.dark_mode ? '#475569' : '#d1d5db' }} />
                    </div>
                  </div>
                  <div className="h-4 w-full rounded-md" style={{ backgroundColor: template.preview.primary }} />
                </div>
                <div className="p-2.5 bg-card">
                  <div className="flex items-center gap-1.5">
                    <span>{template.emoji}</span>
                    <span className="font-semibold text-xs">{template.name}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{template.description}</p>
                </div>
                {selectedTemplate === template.id && (
                  <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step: Banner */}
      {currentStep === 'banner' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Ajoutez une bannière</h3>
            <p className="text-sm text-muted-foreground">Une belle image attire plus de clients. Vous pouvez passer cette étape.</p>
          </div>
          {customization.cover_url ? (
            <div className="relative">
              <img src={customization.cover_url} alt="Bannière" className="w-full h-40 object-cover rounded-xl border" />
              <p className="text-xs text-muted-foreground mt-2 text-center">Vous pourrez la changer plus tard.</p>
            </div>
          ) : (
            <label className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                <Upload className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="font-medium text-sm">Cliquez pour ajouter une image</p>
                <p className="text-xs text-muted-foreground">JPG, PNG, WebP — max 5 Mo</p>
              </div>
              <input type="file" accept="image/*" onChange={handleCoverUpload} className="sr-only" />
            </label>
          )}
        </div>
      )}

      {/* Step: Colors */}
      {currentStep === 'colors' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Choisissez vos couleurs</h3>
            <p className="text-sm text-muted-foreground">Un thème cohérent pour votre page.</p>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {COLOR_THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => applyTheme(theme)}
                className={cn(
                  "p-3 rounded-xl border-2 transition-all hover:scale-105",
                  customization.colors.primary === theme.colors.primary ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-muted-foreground"
                )}
              >
                <div className="flex justify-center gap-1 mb-1.5">
                  <div className="w-6 h-6 rounded-full shadow-sm" style={{ backgroundColor: theme.colors.primary }} />
                  <div className="w-6 h-6 rounded-full shadow-sm" style={{ backgroundColor: theme.colors.accent }} />
                </div>
                <p className="text-[10px] text-center text-muted-foreground font-medium">{theme.name}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        {stepIndex > 0 ? (
          <Button variant="ghost" size="sm" onClick={goBack}>
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Retour
          </Button>
        ) : <div />}
        <Button onClick={goNext} size="sm">
          {stepIndex === STEPS.length - 1 ? (
            <>Terminer <Check className="w-4 h-4 ml-1.5" /></>
          ) : (
            <>Suivant <ChevronRight className="w-4 h-4 ml-1.5" /></>
          )}
        </Button>
      </div>
    </div>
  );
}
