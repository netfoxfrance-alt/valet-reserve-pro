import { Link, useLocation } from 'react-router-dom';
import { Calendar, Settings, Package, Clock, Sparkles, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Rendez-vous', href: '/dashboard', icon: Calendar },
  { name: 'Disponibilités', href: '/dashboard/availability', icon: Clock },
  { name: 'Packs', href: '/dashboard/packs', icon: Package },
  { name: 'Paramètres', href: '/dashboard/settings', icon: Settings },
];

export function DashboardSidebar() {
  const location = useLocation();
  
  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-surface-subtle border-r border-border">
      <div className="flex items-center gap-2 px-6 h-16 border-b border-border">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-semibold text-foreground">AUTOCARE</span>
      </div>
      
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
        <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all w-full">
          <LogOut className="w-5 h-5" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
