import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Calendar, Settings, Package, Clock, LogOut, Share2, Copy, Check, MessageSquare, BarChart3, Globe, Crown } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useMyCenter } from '@/hooks/useCenter';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// Define navigation with pro-only flags
const getNavigation = (isPro: boolean) => [
  { name: 'Réservations', href: '/dashboard', icon: Calendar, proOnly: true },
  { name: 'Demandes', href: '/dashboard/requests', icon: MessageSquare, proOnly: false },
  { name: 'Ma Page', href: '/dashboard/my-page', icon: Globe, proOnly: false },
  { name: 'Formules', href: '/dashboard/packs', icon: Package, proOnly: true },
  { name: 'Statistiques', href: '/dashboard/stats', icon: BarChart3, proOnly: true },
  { name: 'Disponibilités', href: '/dashboard/availability', icon: Clock, proOnly: true },
  { name: 'Paramètres', href: '/dashboard/settings', icon: Settings, proOnly: false },
];

export function DashboardSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { center } = useMyCenter();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  const isPro = center?.subscription_plan === 'pro';
  const navigation = getNavigation(isPro);
  const bookingUrl = center ? `${window.location.origin}/c/${center.slug}` : '';
  
  const handleCopyLink = () => {
    if (bookingUrl) {
      navigator.clipboard.writeText(bookingUrl);
      setCopied(true);
      toast({
        title: 'Lien copié !',
        description: 'Partagez ce lien avec vos clients.',
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleNavClick = (item: typeof navigation[0], e: React.MouseEvent) => {
    if (item.proOnly && !isPro) {
      e.preventDefault();
      navigate('/dashboard/upgrade');
    }
  };
  
  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-surface-subtle border-r border-border">
      <div className="flex items-center px-6 h-16 border-b border-border">
        <Link to="/" className="flex items-center">
          <Logo size="lg" />
        </Link>
      </div>
      
      {/* Plan badge */}
      {center && (
        <div className="px-4 pt-4">
          {isPro ? (
            <div className="bg-primary/10 text-primary px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2">
              <Crown className="w-4 h-4" />
              Plan Pro
            </div>
          ) : (
            <Link to="/dashboard/upgrade">
              <div className="bg-secondary hover:bg-secondary/80 transition-colors px-3 py-2.5 rounded-xl cursor-pointer">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Compte gratuit</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Essayer Pro</span>
                  <span className="text-xs text-primary font-medium">15 jours gratuits →</span>
                </div>
              </div>
            </Link>
          )}
        </div>
      )}
      
      {/* Booking link card */}
      {center && (
        <div className="px-4 py-4 border-b border-border">
          <div className="bg-primary/5 rounded-xl p-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <Share2 className="w-4 h-4" />
              Votre lien client
            </div>
            <div className="flex gap-2">
              <code className="flex-1 text-xs bg-background rounded-lg px-2 py-1.5 text-muted-foreground truncate">
                /c/{center.slug}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="shrink-0"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href || 
            (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
          const isLocked = item.proOnly && !isPro;
          
          return (
            <Link
              key={item.name}
              to={isLocked ? '/dashboard/upgrade' : item.href}
              onClick={(e) => handleNavClick(item, e)}
              className={cn(
                "flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                isActive && !isLocked
                  ? "bg-primary text-primary-foreground"
                  : isLocked
                  ? "text-muted-foreground/50 hover:bg-secondary/50"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5" />
                {item.name}
              </div>
              {isLocked && (
                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
                  PRO
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      
      <div className="px-4 py-6 border-t border-border">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all w-full"
        >
          <LogOut className="w-5 h-5" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
