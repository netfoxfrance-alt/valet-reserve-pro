import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Calendar, CalendarDays, Settings, Package, Clock, LogOut, Share2, Copy, Check, MessageSquare, BarChart3, Globe, Crown, AlertCircle, Headphones, FileText, Users } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useMyCenter } from '@/hooks/useCenter';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useTawkTo } from '@/components/TawkTo';

const navigation = [
  { name: 'Réservations', href: '/dashboard', icon: Calendar },
  { name: 'Calendrier', href: '/dashboard/calendar', icon: CalendarDays },
  { name: 'Demandes', href: '/dashboard/requests', icon: MessageSquare },
  { name: 'Clients', href: '/dashboard/clients', icon: Users },
  { name: 'Factures & Devis', href: '/dashboard/invoices', icon: FileText },
  { name: 'Ma Page', href: '/dashboard/my-page', icon: Globe },
  { name: 'Formules', href: '/dashboard/packs', icon: Package },
  { name: 'Statistiques', href: '/dashboard/stats', icon: BarChart3 },
  { name: 'Disponibilités', href: '/dashboard/availability', icon: Clock },
  { name: 'Paramètres', href: '/dashboard/settings', icon: Settings },
];

export function DashboardSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, subscription } = useAuth();
  const { center } = useMyCenter();
  const { toast } = useToast();
  const { openChat } = useTawkTo();
  const [copied, setCopied] = useState(false);
  
  const isPro = subscription.subscribed;
  const bookingUrl = center ? `${window.location.origin}/${center.slug}` : '';
  
  // Calculate trial days remaining
  const getTrialDaysRemaining = () => {
    if (!subscription.subscriptionEnd) return null;
    const endDate = new Date(subscription.subscriptionEnd);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };
  
  const trialDays = getTrialDaysRemaining();
  
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
  
  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-surface-subtle border-r border-border">
      <div className="flex items-center px-6 h-16 border-b border-border">
        <Link to="/" className="flex items-center">
          <Logo size="lg" />
        </Link>
      </div>
      
      {/* Trial/Pro badge */}
      {center && (
        <div className="px-4 pt-4">
          {isPro ? (
            <div className="bg-primary/10 text-primary px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2">
              <Crown className="w-4 h-4" />
              Plan Pro actif
            </div>
          ) : (
            <Link to="/dashboard/upgrade">
              <div className="bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/15 transition-colors px-3 py-2.5 rounded-xl cursor-pointer">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Essai gratuit</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Activer Pro</span>
                  <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">30 jours gratuits →</span>
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
                /{center.slug}
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
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      <div className="px-4 py-6 border-t border-border space-y-1">
        <button 
          onClick={openChat}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all w-full"
        >
          <Headphones className="w-5 h-5" />
          Support
        </button>
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
