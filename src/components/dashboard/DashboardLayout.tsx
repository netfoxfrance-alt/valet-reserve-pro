import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Settings, LogOut, LayoutGrid, X } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';

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
  const [navOpen, setNavOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  // Close panel on click outside
  useEffect(() => {
    if (!navOpen) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setNavOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [navOpen]);

  return (
    <div className="min-h-screen bg-background">
      <header className="h-14 border-b border-border bg-background/80 backdrop-blur-lg sticky top-0 z-50 flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-sm font-semibold text-foreground leading-tight">{title}</h1>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {/* Grid nav button */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl"
            onClick={() => setNavOpen(!navOpen)}
          >
            {navOpen ? <X className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
          </Button>
          <LanguageSwitcher />
          <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => navigate('/dashboard/settings')}>
            <Settings className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Sliding nav panel */}
      <div
        ref={panelRef}
        className={`sticky top-14 z-40 overflow-hidden transition-all duration-300 ease-in-out border-b border-border bg-background ${navOpen ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0 border-b-0'}`}
      >
        <div className="flex gap-4 px-4 py-3 overflow-x-auto scrollbar-hide">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setNavOpen(false)}
                className={`flex flex-col items-center gap-1 flex-shrink-0 transition-opacity duration-200 ${isActive ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
              >
                <img
                  src={item.icon}
                  alt={item.label}
                  className={`w-12 h-12 object-contain transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}
                />
                <span className={`text-[10px] font-medium whitespace-nowrap ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
      
      <main className="p-4 lg:p-8 max-w-6xl mx-auto">
        {children}
      </main>
    </div>
  );
}
