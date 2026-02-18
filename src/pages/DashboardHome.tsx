import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useAuth } from '@/hooks/useAuth';
import { useMyCenter } from '@/hooks/useCenter';
import { useTranslation } from 'react-i18next';
import { Settings, LogOut, Crown, AlertCircle, Share2, Copy, Check, Headphones, Menu } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { SubscriptionBanner } from '@/components/dashboard/SubscriptionBanner';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';


import iconDemandes from '@/assets/icons/icon-demandes.webp';
import iconAgenda from '@/assets/icons/icon-agenda.webp';
import iconClients from '@/assets/icons/icon-clients.webp';
import iconFactures from '@/assets/icons/icon-factures.webp';
import iconFormules from '@/assets/icons/icon-formules.webp';
import iconMaPage from '@/assets/icons/icon-mapage.webp';
import iconReservations from '@/assets/icons/icon-reservations.webp';
import iconStatistiques from '@/assets/icons/icon-statistiques.webp';

const menuItems = [
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

export default function DashboardHome() {
  const navigate = useNavigate();
  const { signOut, subscription } = useAuth();
  const { center } = useMyCenter();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isPro = subscription.subscribed;
  const bookingUrl = center ? `${window.location.origin}/${center.slug}` : '';

  const handleCopyLink = () => {
    if (bookingUrl) {
      navigator.clipboard.writeText(bookingUrl);
      setCopied(true);
      toast({ title: t('nav.linkCopied'), description: t('nav.shareLinkDesc') });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar - same as DashboardLayout */}
      <aside className="hidden lg:flex flex-col items-center w-20 fixed inset-y-0 left-0 z-40 bg-card border-r border-border">
        <Link to="/dashboard" className="py-4 px-2">
          <Logo size="sm" />
        </Link>
        <nav className="flex-1 flex flex-col items-center gap-1 px-2 py-3 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="flex flex-col items-center gap-0.5 px-1 py-1.5 rounded-xl transition-all duration-200 hover:bg-accent/60 active:scale-95 w-full"
            >
              <img src={item.icon} alt={item.label} className="w-8 h-8 object-contain" />
              <span className="text-[9px] font-medium leading-tight text-center truncate w-full text-muted-foreground">
                {item.label}
              </span>
            </Link>
          ))}
        </nav>
        <div className="flex flex-col items-center gap-1 px-2 py-3 border-t border-border w-full">
          {bottomItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="flex flex-col items-center gap-0.5 px-1 py-1.5 rounded-xl text-muted-foreground hover:bg-accent/60 hover:text-foreground transition-all w-full"
            >
              <item.icon className="w-4 h-4" />
              <span className="text-[9px] font-medium leading-tight">{item.label}</span>
            </Link>
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
            {menuItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-accent/60 hover:text-foreground transition-all"
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
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-accent/60 hover:text-foreground transition-all"
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
            <Link to="/" className="lg:hidden">
              <Logo size="sm" />
            </Link>
            <div className="hidden lg:block">
              <h1 className="text-sm font-semibold text-foreground">Dashboard</h1>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <LanguageSwitcher />
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 max-w-4xl mx-auto w-full space-y-8">
          <SubscriptionBanner />

          {center && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{center.name}</h1>
                {isPro ? (
                  <div className="inline-flex items-center gap-1.5 text-xs font-medium text-primary mt-1">
                    <Crown className="w-3.5 h-3.5" />
                    {t('nav.proActive')}
                  </div>
                ) : (
                  <Link to="/dashboard/upgrade" className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {t('nav.freeTrial')} — {t('nav.activatePro')}
                  </Link>
                )}
              </div>
              <div className="flex items-center gap-2 bg-muted/50 rounded-xl px-3 py-2">
                <Share2 className="w-4 h-4 text-muted-foreground" />
                <code className="text-xs text-muted-foreground">/{center.slug}</code>
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={handleCopyLink}>
                  {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
              </div>
            </div>
          )}

          {/* Icon Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-x-4 gap-y-6 sm:gap-x-8 sm:gap-y-10 lg:gap-x-12 lg:gap-y-12">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="group flex flex-col items-center gap-2.5 hover:opacity-80 transition-opacity duration-200"
              >
                <img
                  src={item.icon}
                  alt={item.label}
                  className="w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 object-contain group-hover:scale-105 transition-transform duration-300"
                />
                <span className="text-xs sm:text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">{item.label}</span>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
