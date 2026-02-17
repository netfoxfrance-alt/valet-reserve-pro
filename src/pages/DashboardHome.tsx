import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useAuth } from '@/hooks/useAuth';
import { useMyCenter } from '@/hooks/useCenter';
import { useTranslation } from 'react-i18next';
import { Settings, LogOut, Crown, AlertCircle, Share2, Copy, Check, Headphones } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { SubscriptionBanner } from '@/components/dashboard/SubscriptionBanner';

import iconDemandes from '@/assets/icons/icon-demandes.webp';
import iconAgenda from '@/assets/icons/icon-agenda.webp';
import iconClients from '@/assets/icons/icon-clients.webp';
import iconFactures from '@/assets/icons/icon-factures.webp';
import iconFormules from '@/assets/icons/icon-formules.webp';
import iconMaPage from '@/assets/icons/icon-mapage.webp';
import iconReservations from '@/assets/icons/icon-reservations.webp';
import iconStatistiques from '@/assets/icons/icon-statistiques.webp';

const menuItems = [
  { icon: iconDemandes, label: 'Demandes', href: '/dashboard/requests' },
  { icon: iconAgenda, label: 'Agenda', href: '/dashboard/calendar' },
  { icon: iconClients, label: 'Clients', href: '/dashboard/clients' },
  { icon: iconFactures, label: 'Factures', href: '/dashboard/invoices' },
  { icon: iconFormules, label: 'Formules', href: '/dashboard/formules' },
  { icon: iconMaPage, label: 'Ma Page', href: '/dashboard/my-page' },
  { icon: iconReservations, label: 'Réservations', href: '/dashboard/reservations' },
  { icon: iconStatistiques, label: 'Statistiques', href: '/dashboard/stats' },
];

export default function DashboardHome() {
  const navigate = useNavigate();
  const { signOut, subscription } = useAuth();
  const { center } = useMyCenter();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-14 border-b border-border bg-background/80 backdrop-blur-lg sticky top-0 z-50 flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <Link to="/">
            <Logo size="lg" />
          </Link>
        </div>
        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => navigate('/dashboard/settings')}>
            <Settings className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => navigate('/dashboard/support')}>
            <Headphones className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <main className="p-4 lg:p-8 max-w-4xl mx-auto space-y-8">
        <SubscriptionBanner />

        {/* Pro/Trial badge + booking link */}
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
                className="w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-[22px] shadow-md group-hover:scale-105 transition-transform duration-300 bg-transparent"
                style={{ clipPath: 'inset(12% round 18px)' }}
              />
              <span className="text-xs sm:text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">{item.label}</span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
