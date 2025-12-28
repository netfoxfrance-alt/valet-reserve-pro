import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export default function Auth() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      setIsLoading(false);
      return;
    }

    const { error } = isSignUp 
      ? await signUp(email, password)
      : await signIn(email, password);

    if (error) {
      if (error.message.includes('User already registered')) {
        setError('Cet email est déjà utilisé. Connectez-vous ou utilisez un autre email.');
      } else if (error.message.includes('Invalid login credentials')) {
        setError('Email ou mot de passe incorrect.');
      } else {
        setError(error.message);
      }
      setIsLoading(false);
      return;
    }
    
    toast({
      title: isSignUp ? 'Compte créé !' : 'Connexion réussie',
      description: isSignUp 
        ? 'Votre espace a été créé automatiquement.' 
        : 'Bienvenue dans votre espace pro.',
    });
    
    navigate('/dashboard');
  };
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-6">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </Link>
          <h1 className="text-2xl font-bold text-foreground mb-2">CleaningPage</h1>
          <p className="text-muted-foreground">
            {isSignUp ? 'Créez votre compte professionnel' : 'Connectez-vous à votre espace professionnel'}
          </p>
        </div>
        
        <Card variant="elevated" className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-start gap-3 p-4 bg-destructive/10 text-destructive rounded-xl text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="vous@exemple.fr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-12 rounded-xl"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
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
                  minLength={6}
                />
              </div>
              {isSignUp && (
                <p className="text-xs text-muted-foreground">Minimum 6 caractères</p>
              )}
            </div>
            
            <Button 
              type="submit" 
              variant="premium" 
              size="lg" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading 
                ? (isSignUp ? 'Création...' : 'Connexion...') 
                : (isSignUp ? 'Créer mon compte' : 'Se connecter')
              }
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <button 
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isSignUp 
                ? 'Déjà un compte ? Connectez-vous' 
                : "Pas encore de compte ? Inscrivez-vous"
              }
            </button>
          </div>
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
