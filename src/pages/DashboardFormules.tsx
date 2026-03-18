import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useMyCenter } from '@/hooks/useCenter';
import { Package, Wrench, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export default function DashboardFormules() {
  const { center } = useMyCenter();
  const { t } = useTranslation();

  const options = [
    {
      icon: Package,
      title: t('nav.packs'),
      description: t('formules.packsDesc', 'Vos formules à prix fixe ou sur devis, présentées sur votre page'),
      href: '/dashboard/packs',
      color: 'from-amber-400 to-orange-500',
    },
    {
      icon: Wrench,
      title: t('nav.services'),
      description: t('formules.servicesDesc', 'Prestations personnalisées sur mesure'),
      href: '/dashboard/custom-services',
      color: 'from-blue-400 to-indigo-500',
      optional: true,
    },
  ];

  return (
    <DashboardLayout title={t('formules.title', 'Formules')} subtitle={center?.name}>
      <div className="max-w-2xl mx-auto mt-8 sm:mt-16 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">{t('formules.chooseType', 'Quel type de prestation ?')}</h2>
          <p className="text-muted-foreground">{t('formules.chooseTypeDesc', 'Choisissez le type de formule à gérer')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {options.map((option) => (
            <div key={option.href} className="relative">
              <Link
                to={option.href}
                className="group flex flex-col items-center gap-4 p-8 rounded-2xl bg-card border border-border/50 hover:border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${option.color} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                  <option.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-foreground">{option.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                </div>
              </Link>

              {option.optional && (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      className="absolute top-3 right-3 w-7 h-7 rounded-full bg-muted/80 hover:bg-muted flex items-center justify-center transition-colors z-10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 text-sm" side="top" align="end">
                    <div className="space-y-3">
                      <p className="font-semibold text-foreground">Prestations personnalisées (optionnel)</p>
                      <p className="text-muted-foreground">
                        Si vous avez des prestations spécifiques réservées à certains clients, vous pouvez les créer ici.
                      </p>
                      <p className="text-muted-foreground">
                        Ces prestations ne seront <span className="font-medium text-foreground">pas visibles publiquement</span> sur votre page. Elles servent uniquement pour des cas particuliers : tarif négocié, prestation spéciale ou service réservé à un client précis.
                      </p>
                      <p className="text-muted-foreground">Une fois la prestation créée, vous pourrez :</p>
                      <ul className="list-disc list-inside text-muted-foreground space-y-1 pl-1">
                        <li>l'utiliser pour créer des réservations manuellement</li>
                        <li>permettre au client concerné de réserver uniquement les prestations qui lui sont attribuées</li>
                      </ul>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
