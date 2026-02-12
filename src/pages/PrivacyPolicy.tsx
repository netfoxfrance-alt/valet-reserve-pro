import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" /> Retour
        </Link>

        <h1 className="text-3xl font-bold mb-8">Politique de Confidentialité</h1>

        <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground">1. Responsable du traitement</h2>
            <p>NETFOX, qui exploite la plateforme cleaningpage.com, accorde une grande importance à la protection et à la confidentialité de vos données personnelles, qui représentent pour nous un gage de sérieux et de confiance.</p>
            <p>Contact : contact@cleaningpage.com</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">2. Données collectées</h2>
            <p>Dans le cadre de l'utilisation du service CleaningPage, les données suivantes peuvent être collectées :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Nom et prénom</li>
              <li>Adresse email</li>
              <li>Informations professionnelles (raison sociale, activité)</li>
              <li>Données de connexion (adresse IP, logs)</li>
              <li>Données de facturation</li>
              <li>Toute information fournie volontairement par le Client</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">3. Finalités du traitement</h2>
            <p>Les données sont collectées pour :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>La création et la gestion des comptes</li>
              <li>La gestion des abonnements et paiements</li>
              <li>Le support client</li>
              <li>L'amélioration du service</li>
              <li>Le respect des obligations légales</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">4. Base légale</h2>
            <p>Les traitements sont fondés sur :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>L'exécution du contrat (abonnement au service)</li>
              <li>L'intérêt légitime de l'Éditeur (amélioration du service, sécurité)</li>
              <li>Les obligations légales applicables</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">5. Destinataires des données</h2>
            <p>Les données peuvent être transmises uniquement aux prestataires nécessaires au fonctionnement du service, notamment :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Stripe (paiement)</li>
              <li>Hébergeur du site</li>
              <li>Outils techniques utilisés pour le fonctionnement de la plateforme</li>
            </ul>
            <p>Aucune donnée personnelle n'est vendue à des tiers.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">6. Durée de conservation</h2>
            <p>Les données sont conservées :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Pendant la durée de l'abonnement</li>
              <li>Puis pendant la durée légale applicable en matière comptable et fiscale</li>
            </ul>
            <p>Les données de compte peuvent être supprimées à la demande du Client.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">7. Sécurité</h2>
            <p>NETFOX met en œuvre des mesures techniques et organisationnelles raisonnables afin d'assurer la sécurité et la confidentialité des données.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">8. Droits des utilisateurs</h2>
            <p>Conformément au RGPD, le Client dispose des droits suivants :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Droit d'accès</li>
              <li>Droit de rectification</li>
              <li>Droit de suppression</li>
              <li>Droit d'opposition</li>
              <li>Droit à la limitation</li>
            </ul>
            <p>Toute demande peut être adressée à : contact@cleaningpage.com</p>
            <p>Le Client peut également introduire une réclamation auprès de la CNIL (www.cnil.fr).</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">9. Cookies</h2>
            <p>Le site peut utiliser des cookies nécessaires au bon fonctionnement du service. Les utilisateurs peuvent gérer leurs préférences via leur navigateur.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
