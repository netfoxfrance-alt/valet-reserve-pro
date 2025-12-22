import { Pack, BookingAnswers } from '@/types/booking';

export const packs: Pack[] = [
  {
    id: 'essentiel',
    name: 'Essentiel',
    description: 'Un nettoyage efficace pour un véhicule propre au quotidien.',
    duration: '1h30',
    price: 49,
    features: [
      'Aspiration complète',
      'Nettoyage des vitres intérieures',
      'Dépoussiérage du tableau de bord',
      'Lavage extérieur haute pression',
    ],
  },
  {
    id: 'complet',
    name: 'Complet',
    description: 'Un traitement approfondi pour retrouver l\'éclat de votre véhicule.',
    duration: '2h30',
    price: 89,
    features: [
      'Tout le pack Essentiel',
      'Shampoing des sièges',
      'Nettoyage des plastiques',
      'Lustrage de la carrosserie',
      'Nettoyage des jantes',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Une remise à neuf complète pour un résultat exceptionnel.',
    duration: '4h',
    price: 149,
    features: [
      'Tout le pack Complet',
      'Traitement cuir ou tissu',
      'Décontamination carrosserie',
      'Cire de protection',
      'Parfum longue durée',
      'Traitement anti-pluie',
    ],
  },
];

export function recommendPack(answers: BookingAnswers): Pack {
  const { objective, condition, interior, exterior } = answers;
  
  // Logic for recommending packs based on answers
  if (objective === 'remise-neuf' || objective === 'revente') {
    return packs[2]; // Premium
  }
  
  if (condition === 'tres-sale') {
    return packs[2]; // Premium
  }
  
  if (condition === 'sale' || (interior && exterior)) {
    return packs[1]; // Complet
  }
  
  if (objective === 'leasing') {
    return packs[1]; // Complet
  }
  
  return packs[0]; // Essentiel
}
