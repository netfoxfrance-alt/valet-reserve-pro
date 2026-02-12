import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const LegalNotices = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" /> Retour
        </Link>

        <h1 className="text-3xl font-bold mb-8">Mentions Légales & Cookies</h1>

        <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground">Conditions d'Utilisation du Site</h2>
            <p>L'utilisateur reconnaît avoir pris connaissance des présentes mentions légales et s'engage à les respecter. NETFOX s'efforce d'assurer l'exactitude des informations diffusées sur le site, sans toutefois garantir l'absence d'erreurs ou d'omissions. Le site peut être modifié ou interrompu à tout moment sans préavis.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">Informatique et Libertés</h2>
            <p>Conformément au Règlement Général sur la Protection des Données (RGPD), CleaningPage met en œuvre un traitement de données personnelles. L'utilisateur dispose d'un droit d'accès, de rectification, de suppression et d'opposition concernant ses données personnelles.</p>
            <p>Pour exercer ces droits, il peut contacter : rgpd@cleaningpage.com</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">Éditeur</h2>
            <p>Ce site est édité par NETFOX, entreprise enregistrée en France, dont le siège social est situé au 339 routes des mottes, 40230 à Saubrigues.</p>
            <p>Pour toute question relative au site ou pour signaler un contenu inapproprié, vous pouvez nous contacter à contact@cleaningpage.com.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">Hébergement</h2>
            <p>Le site est hébergé par :</p>
            <p>Hostinger International Ltd.<br />61 Lordou Vironos Street, 6023 Larnaca, Chypre.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">Cookies</h2>
            <p>Le site utilise des cookies nécessaires au bon fonctionnement des services et à l'amélioration de l'expérience utilisateur. Les utilisateurs peuvent gérer leurs préférences via les paramètres de leur navigateur.</p>
            <p>Pour en savoir plus : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.cnil.fr</a></p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">Hyperliens</h2>
            <p>Les liens hypertextes présents sur le site peuvent diriger vers des ressources externes pour lesquelles NETFOX décline toute responsabilité.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default LegalNotices;
