import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Calendar, Settings, Package, Clock, LogOut, Share2, Copy, Check, MessageSquare, BarChart3 } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useMyCenter } from '@/hooks/useCenter';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const navigation = [
  { name: 'Réservations', href: '/dashboard', icon: Calendar },
  { name: 'Demandes', href: '/dashboard/requests', icon: MessageSquare },
  { name: 'Formules', href: '/dashboard/packs', icon: Package },
  { name: 'Statistiques', href: '/dashboard/stats', icon: BarChart3 },
  { name: 'Disponibilités', href: '/dashboard/availability', icon: Clock },
  { name: 'Paramètres', href: '/dashboard/settings', icon: Settings },
];

export function DashboardSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { center } = useMyCenter();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
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
  
  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-surface-subtle border-r border-border">
      <div className="flex items-center gap-2 px-6 h-16 border-b border-border">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Logo size="sm" variant="light" />
          </div>
          <span className="font-semibold text-foreground">CleaningPage</span>
        </Link>
      </div>
      
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
