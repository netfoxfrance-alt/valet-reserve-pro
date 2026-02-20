import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Settings, LogOut } from 'lucide-react';
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
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  useEffect(() => {
    if (!navOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
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
          <Button
            ref={buttonRef}
            variant="ghost"
            size="icon"
            className="rounded-xl"
            onClick={() => setNavOpen(!navOpen)}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
              <circle cx="3" cy="3" r="1.5" />
              <circle cx="8" cy="3" r="1.5" />
              <circle cx="13" cy="3" r="1.5" />
              <circle cx="3" cy="8" r="1.5" />
              <circle cx="8" cy="8" r="1.5" />
              <circle cx="13" cy="8" r="1.5" />
              <circle cx="3" cy="13" r="1.5" />
              <circle cx="8" cy="13" r="1.5" />
              <circle cx="13" cy="13" r="1.5" />
            </svg>
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

      {/* Backdrop */}
      {navOpen && (
        <div
          className="fixed inset-0 z-[90] bg-black/30 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setNavOpen(false)}
        />
      )}

      {/* Apple-style floating panel */}
      <div
        ref={panelRef}
        className={`fixed top-16 right-3 sm:right-6 w-[calc(100vw-24px)] sm:w-[360px] z-[100] transition-all duration-300 ease-out ${
          navOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
        }`}
      >
        <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-5 sm:p-6">
            <div className="grid grid-cols-3 gap-y-5 gap-x-3 sm:gap-x-4">
              {navItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setNavOpen(false)}
                    className="group flex flex-col items-center gap-2 outline-none"
                  >
                    <div
                      className={`relative rounded-2xl p-1 transition-all duration-200 ${
                        isActive
                          ? 'bg-accent ring-2 ring-primary/20 scale-105'
                          : 'group-hover:bg-accent/60 group-hover:scale-105 group-active:scale-95'
                      }`}
                    >
                      <img
                        src={item.icon}
                        alt={item.label}
                        className="w-14 h-14 sm:w-16 sm:h-16 object-contain"
                      />
                    </div>
                    <span
                      className={`text-[11px] sm:text-xs font-medium text-center leading-tight max-w-[80px] truncate transition-colors duration-200 ${
                        isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
                      }`}
                    >
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
          {/* Bottom link */}
          <Link
            to="/dashboard"
            onClick={() => setNavOpen(false)}
            className="block text-center text-xs font-medium text-primary py-3 border-t border-border/50 hover:bg-accent/40 transition-colors duration-150"
          >
            Accueil Dashboard
          </Link>
        </div>
      </div>
      
      <main className="p-4 lg:p-8 max-w-6xl mx-auto">
        {children}
      </main>
    </div>
  );
}
