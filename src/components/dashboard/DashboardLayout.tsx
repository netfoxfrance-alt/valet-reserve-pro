import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Settings, LogOut, Menu, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/Logo';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import iconReservations from '@/assets/icons/icon-reservations.webp';
import iconAgenda from '@/assets/icons/icon-agenda.webp';
import iconFactures from '@/assets/icons/icon-factures.webp';
import iconClients from '@/assets/icons/icon-clients.webp';
import iconMaPage from '@/assets/icons/icon-mapage.webp';
import iconFormules from '@/assets/icons/icon-formules.webp';
import iconDemandes from '@/assets/icons/icon-demandes.webp';
import iconStatistiques from '@/assets/icons/icon-statistiques.webp';

const navItems = [
  { icon: iconReservations, label: 'Réservations', href: '/dashboard/reservations' },
  { icon: iconAgenda, label: 'Agenda', href: '/dashboard/calendar' },
  { icon: iconFactures, label: 'Factures & Devis', href: '/dashboard/invoices' },
  { icon: iconClients, label: 'Clients', href: '/dashboard/clients' },
  { icon: iconMaPage, label: 'Ma Page', href: '/dashboard/my-page' },
  { icon: iconFormules, label: 'Formules', href: '/dashboard/formules' },
  { icon: iconDemandes, label: 'Demandes', href: '/dashboard/requests' },
  { icon: iconStatistiques, label: 'Statistiques', href: '/dashboard/stats' },
];

const bottomItems = [
  { icon: Settings, label: 'Réglages', href: '/dashboard/settings' },
  { icon: Headphones, label: 'Support', href: '/dashboard/support' },
];

interface DashboardLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function DashboardLayout({ title, subtitle, children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (href: string) => location.pathname === href;

  const NavIcon = ({ item, onClick }: { item: typeof navItems[0]; onClick?: () => void }) => (
    <Link
      to={item.href}
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-0.5 px-1 py-1.5 rounded-xl transition-all duration-200 w-full",
        isActive(item.href)
          ? "bg-accent ring-1 ring-primary/20"
          : "hover:bg-accent/60 active:scale-95"
      )}
    >
      <img src={item.icon} alt={item.label} className="w-8 h-8 object-contain" />
      <span className={cn(
        "text-[9px] font-medium leading-tight text-center truncate w-full",
        isActive(item.href) ? "text-foreground" : "text-muted-foreground"
      )}>
        {item.label}
      </span>
    </Link>
  );

  const BottomNavIcon = ({ item }: { item: typeof bottomItems[0] }) => (
    <Link
      to={item.href}
      className={cn(
        "flex flex-col items-center gap-0.5 px-1 py-1.5 rounded-xl transition-all w-full",
        isActive(item.href)
          ? "bg-accent text-foreground"
          : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
      )}
    >
      <item.icon className="w-4 h-4" />
      <span className="text-[9px] font-medium leading-tight">{item.label}</span>
    </Link>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar - always visible */}
      <aside className="hidden lg:flex flex-col items-center w-20 fixed inset-y-0 left-0 z-40 bg-card border-r border-border">
        {/* Logo */}
        <Link to="/dashboard" className="py-4 px-2">
          <Logo size="sm" />
        </Link>

        {/* Nav icons */}
        <nav className="flex-1 flex flex-col items-center gap-1 px-2 py-3 overflow-y-auto">
          {navItems.map((item) => (
            <NavIcon key={item.href} item={item} />
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="flex flex-col items-center gap-1 px-2 py-3 border-t border-border w-full">
          {bottomItems.map((item) => (
            <BottomNavIcon key={item.href} item={item} />
          ))}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-0.5 px-1 py-1.5 rounded-xl text-muted-foreground hover:bg-accent/60 hover:text-foreground transition-all w-full"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-[9px] font-medium leading-tight">{t('nav.logout')}</span>
          </button>
        </div>
      </aside>

      {/* Mobile sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[260px] p-0 bg-card flex flex-col">
          <SheetHeader className="px-4 h-14 border-b border-border flex flex-row items-center">
            <Logo size="sm" />
            <SheetTitle className="sr-only">Navigation</SheetTitle>
          </SheetHeader>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  isActive(item.href)
                    ? "bg-accent ring-1 ring-primary/20 text-foreground"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                )}
              >
                <img src={item.icon} alt={item.label} className="w-8 h-8 object-contain" />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-border space-y-1">
            {bottomItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  isActive(item.href)
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
            <button
              onClick={() => { setMobileOpen(false); handleLogout(); }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-accent/60 hover:text-foreground transition-all w-full"
            >
              <LogOut className="w-5 h-5" />
              {t('nav.logout')}
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex-1 lg:ml-20 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-14 border-b border-border bg-background/80 backdrop-blur-lg sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-xl"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="lg:hidden">
              <Logo size="sm" />
            </div>
            <div className="hidden lg:block">
              <h1 className="text-sm font-semibold text-foreground leading-tight">{title}</h1>
              {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <LanguageSwitcher />
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 max-w-6xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
