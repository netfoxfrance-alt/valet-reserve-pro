import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const TermsOfSale = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" /> Retour
        </Link>

        <h1 className="text-3xl font-bold mb-8">Conditions Générales de Vente</h1>

        <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground">1. Objet</h2>
            <p>Les présentes Conditions Générales de Vente (ci-après « CGV ») régissent la relation contractuelle entre NETFOX et toute personne morale ou physique souscrivant aux services proposés via la plateforme CleaningPage (ci-après « le Client »).</p>
            <p>La souscription aux services implique l'acceptation sans réserve des présentes CGV.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">2. Description des services</h2>
            <p>CleaningPage est une solution SaaS permettant la gestion et la digitalisation d'activités professionnelles. Les fonctionnalités proposées peuvent évoluer à tout moment afin d'améliorer le service.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">3. Accès à la plateforme</h2>
            <p>L'accès au service nécessite la création d'un compte. Le Client est responsable :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>De la confidentialité de ses identifiants</li>
              <li>De l'utilisation faite de son compte</li>
            </ul>
            <p>Toute utilisation frauduleuse pourra entraîner la suspension immédiate de l'accès.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">4. Abonnements et paiement</h2>
            <p>Les services sont accessibles via abonnement mensuel ou annuel. Les abonnements :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Sont payables à l'avance</li>
              <li>Sont renouvelés automatiquement sauf résiliation</li>
            </ul>
            <p>Les paiements sont traités via un prestataire tiers sécurisé (Stripe). En cas d'échec de paiement, l'accès peut être suspendu. Les prix peuvent être modifiés. Toute modification s'applique au renouvellement suivant.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">5. Résiliation</h2>
            <p>Le Client peut résilier son abonnement à tout moment depuis son espace ou par demande écrite. La résiliation prend effet à la fin de la période en cours. Aucun remboursement n'est effectué pour une période entamée.</p>
            <p>L'Éditeur peut suspendre ou résilier l'accès en cas :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>De non-paiement</li>
              <li>D'usage frauduleux</li>
              <li>De violation des présentes CGV</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">6. Données et responsabilité</h2>
            <p>Le Client reste seul responsable :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Des données qu'il enregistre</li>
              <li>De leur conformité légale</li>
              <li>De leur sauvegarde externe</li>
            </ul>
            <p>CleaningPage met en œuvre des moyens raisonnables pour assurer la disponibilité du service, sans garantie d'absence totale d'interruption.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">7. Propriété intellectuelle</h2>
            <p>La plateforme CleaningPage, son code, ses éléments graphiques et son contenu sont la propriété exclusive de l'Éditeur. Le Client bénéficie d'un droit d'utilisation non exclusif, non cessible et limité à la durée de son abonnement.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">8. Limitation de responsabilité</h2>
            <p>L'Éditeur ne saurait être tenu responsable :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Des pertes indirectes</li>
              <li>D'un manque à gagner</li>
              <li>D'une perte de données</li>
            </ul>
            <p>La responsabilité totale de l'Éditeur est limitée au montant payé par le Client au cours des douze (12) derniers mois.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">9. Protection des données</h2>
            <p>Les données personnelles sont traitées conformément au RGPD. Le Client dispose d'un droit d'accès, rectification et suppression via : contact@cleaningpage.com</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">10. Cession du contrat</h2>
            <p>L'Éditeur se réserve le droit de céder, transférer ou apporter tout ou partie de ses droits et obligations au titre des présentes CGV à toute entité affiliée, société successeur ou dans le cadre d'une opération de restructuration, fusion, acquisition ou changement de juridiction, sans que l'accord préalable du Client ne soit requis.</p>
            <p>Le Client en sera informé par tout moyen approprié.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">11. Force majeure</h2>
            <p>Aucune des parties ne pourra être tenue responsable d'un manquement résultant d'un cas de force majeure tel que défini par la loi française.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">12. Droit applicable</h2>
            <p>Les présentes CGV sont régies par le droit français. Tout litige sera soumis à la compétence exclusive des tribunaux du ressort du siège de l'Éditeur.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfSale;
