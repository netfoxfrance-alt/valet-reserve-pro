import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, AlertCircle, CheckCircle, Loader2, Building2, Check, X } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function CompleteSignup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [businessName, setBusinessName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [slugPreview, setSlugPreview] = useState('');
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    const sid = searchParams.get('session_id');
    if (!sid) {
      setError('Session invalide. Veuillez recommencer.');
    } else {
      setSessionId(sid);
    }
  }, [searchParams]);

  // Generate slug from business name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
      .replace(/^-+|-+$/g, '') // Trim hyphens from start/end
      .substring(0, 30); // Limit length
  };

  // Check slug availability when business name changes
  useEffect(() => {
    const slug = generateSlug(businessName);
    setSlugPreview(slug);
    
    if (slug.length < 3) {
      setSlugAvailable(null);
      return;
    }

    const checkSlug = async () => {
      setIsCheckingSlug(true);
      try {
        const { data, error } = await supabase
          .from('centers')
          .select('id')
          .eq('slug', slug)
          .maybeSingle();
        
        if (error) throw error;
        setSlugAvailable(data === null);
      } catch (err) {
        console.error('Error checking slug:', err);
        setSlugAvailable(null);
      } finally {
        setIsCheckingSlug(false);
      }
    };

    const timeoutId = setTimeout(checkSlug, 300);
    return () => clearTimeout(timeoutId);
  }, [businessName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (businessName.trim().length < 2) {
      setError('Le nom de votre entreprise doit contenir au moins 2 caractères');
      return;
    }

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (!sessionId) {
      setError('Session invalide. Veuillez recommencer.');
      return;
    }

    setIsLoading(true);

    try {
      // Call edge function to complete signup with business name
      const { data, error: fnError } = await supabase.functions.invoke('complete-signup', {
        body: { 
          session_id: sessionId, 
          password,
          business_name: businessName.trim()
        },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Erreur lors de la création du compte');
      }

      toast({
        title: 'Compte créé !',
        description: 'Votre essai gratuit de 30 jours est activé.',
      });

      // Sign in the user
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: password,
      });

      if (signInError) {
        toast({
          title: 'Compte créé',
          description: 'Connectez-vous avec vos identifiants.',
        });
        navigate('/auth');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Error completing signup:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  // Show error state if no session_id
  if (!sessionId && !searchParams.get('session_id')) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md text-center">
          <Logo size="lg" className="mx-auto mb-6" />
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive rounded-full mb-4">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Session invalide</span>
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            Lien expiré ou invalide
          </h1>
          <p className="text-muted-foreground mb-6">
            Veuillez recommencer le processus d'inscription.
          </p>
          <Button asChild>
            <Link to="/">Retour à l'accueil</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="text-center mb-8">
          <Logo size="lg" className="mx-auto mb-6" />
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 rounded-full mb-4">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Paiement confirmé</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
            Finalisez votre inscription
          </h1>
          <p className="text-muted-foreground mt-2">
            Plus qu'une étape pour accéder à votre espace
          </p>
        </div>

        <Card variant="elevated" className="p-5 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-start gap-3 p-4 bg-destructive/10 text-destructive rounded-xl text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="businessName">Nom de votre entreprise</Label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="businessName"
                  type="text"
                  placeholder="Ex: CleanPro Services"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="pl-12 h-12 rounded-xl"
                  required
                  minLength={2}
                  autoFocus
                />
              </div>
              {slugPreview && slugPreview.length >= 3 && (
                <div className="flex items-center gap-2 text-sm mt-2 p-2 bg-muted/50 rounded-lg">
                  <span className="text-muted-foreground">Votre page :</span>
                  <code className="px-2 py-0.5 bg-background rounded text-foreground font-medium">
                    cleaningpage.fr/{slugPreview}
                  </code>
                  {isCheckingSlug ? (
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  ) : slugAvailable === true ? (
                    <span className="flex items-center gap-1 text-emerald-600 text-xs">
                      <Check className="w-3 h-3" /> Disponible
                    </span>
                  ) : slugAvailable === false ? (
                    <span className="flex items-center gap-1 text-amber-600 text-xs">
                      <AlertCircle className="w-3 h-3" /> Pris
                    </span>
                  ) : null}
                </div>
              )}
              {slugAvailable === false && (
                <p className="text-xs text-muted-foreground">
                  Un suffixe sera ajouté automatiquement
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Créez un mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 h-12 rounded-xl"
                  required
                  minLength={8}
                />
              </div>
              <p className="text-xs text-muted-foreground">Minimum 8 caractères</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmez le mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-12 h-12 rounded-xl"
                  required
                  minLength={8}
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-12"
              disabled={isLoading || !sessionId || password.length < 8 || password !== confirmPassword}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Création en cours...
                </>
              ) : (
                'Créer mon espace →'
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground pt-2">
              En créant votre compte, vous acceptez nos conditions d'utilisation
            </p>
          </form>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          <Link to="/" className="text-foreground font-medium hover:underline">
            ← Retour à l'accueil
          </Link>
        </p>
      </div>
    </div>
  );
}