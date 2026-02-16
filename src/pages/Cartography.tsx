import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Download, Printer } from "lucide-react";
import mermaid from "mermaid";
import { toPng } from "html-to-image";

const ACCESS_CODE = "COCOCOCO";

const DIAGRAM = `flowchart TD
  subgraph VISITEUR["🌐 Parcours Visiteur"]
    LP["Page d'accueil /"]
    LP -->|CTA Essai Gratuit| STRIPE_CHECKOUT["Stripe Checkout 29€/mois"]
    STRIPE_CHECKOUT -->|Paiement OK| COMPLETE["complete-signup Edge Function"]
    STRIPE_CHECKOUT -->|Paiement KO| LP
    COMPLETE -->|Crée compte + centre + slug| DASHBOARD["Dashboard /dashboard"]
  end

  subgraph AUTH["🔐 Authentification"]
    AUTH_PAGE["Page /auth"]
    AUTH_PAGE -->|Login OK| CHECK_SUB["Vérification abonnement"]
    CHECK_SUB -->|trial ou pro| DASHBOARD
    CHECK_SUB -->|expired ou free| DEGRADED["Mode dégradé"]
    DEGRADED -->|CTA Réactiver| PORTAL["Stripe Customer Portal"]
    PORTAL -->|Paiement OK| DASHBOARD
  end

  subgraph BOOKING["📅 Parcours Client - Réservation"]
    PUBLIC_PAGE["Page publique /:slug"]
    PUBLIC_PAGE -->|Choisir service| SERVICE_SELECT["Sélection pack ou service custom"]
    SERVICE_SELECT -->|Pack prix fixe| CALENDAR["Calendrier disponibilités"]
    SERVICE_SELECT -->|Service sur devis| CONTACT_FORM["Formulaire de contact"]
    CONTACT_FORM -->|Envoi| CONTACT_REQ["contact_requests table"]
    CONTACT_REQ -->|Email au pro| EMAIL_CONTACT["Email notification pro"]
    CALENDAR -->|Choisir créneau| CLIENT_FORM["Formulaire client"]
    CLIENT_FORM -->|Lookup email/tel| DEDUP["Déduplication client"]
    DEDUP -->|Client existant| PRE_FILL["Pré-remplissage formulaire"]
    DEDUP -->|Nouveau client| NEW_CLIENT["Création fiche client"]
    CLIENT_FORM -->|Valider| APPOINTMENT["appointments table - status: pending"]
    APPOINTMENT -->|Trigger| EMAIL_CLIENT["Email confirmation client"]
    APPOINTMENT -->|Trigger| EMAIL_PRO["Email notification pro"]
  end

  subgraph DASHBOARD_PRO["🏠 Dashboard Pro"]
    DASHBOARD -->|Calendrier| CAL_VIEW["Vue calendrier /dashboard/calendar"]
    DASHBOARD -->|Clients| CLIENTS_VIEW["Liste clients /dashboard/clients"]
    DASHBOARD -->|Factures| INVOICES_VIEW["Facturation /dashboard/invoices"]
    DASHBOARD -->|Stats| STATS_VIEW["Statistiques /dashboard/stats"]
    DASHBOARD -->|Packs| PACKS_VIEW["Gestion packs /dashboard/packs"]
    DASHBOARD -->|Services| SERVICES_VIEW["Services custom /dashboard/custom-services"]
    DASHBOARD -->|Disponibilités| AVAIL_VIEW["Horaires /dashboard/availability"]
    DASHBOARD -->|Ma page| MYPAGE_VIEW["Page publique /dashboard/my-page"]
    DASHBOARD -->|Demandes| REQ_VIEW["Demandes contact /dashboard/requests"]
    DASHBOARD -->|Réglages| SETTINGS_VIEW["Paramètres /dashboard/settings"]
  end

  subgraph RDV_MGMT["📋 Gestion des RDV"]
    CAL_VIEW -->|Voir RDV| RDV_DETAIL["Détail rendez-vous"]
    RDV_DETAIL -->|Confirmer| STATUS_CONF["status: confirmed"]
    RDV_DETAIL -->|Refuser| STATUS_REF["status: refused"]
    RDV_DETAIL -->|Annuler| STATUS_CAN["status: cancelled"]
    RDV_DETAIL -->|Terminer| STATUS_DONE["status: completed"]
    STATUS_CONF -->|Email| EMAIL_CONF["Email confirmation au client"]
    STATUS_REF -->|Email| EMAIL_REF["Email refus au client"]
    STATUS_CAN -->|Email| EMAIL_CAN["Email annulation au client"]
  end

  subgraph INVOICING["💰 Facturation"]
    INVOICES_VIEW -->|Créer| INV_NEW["Nouvelle facture/devis"]
    INV_NEW -->|Brouillon| INV_DRAFT["status: draft"]
    INV_DRAFT -->|Envoyer| INV_SENT["status: sent + Email"]
    INV_SENT -->|Payer| INV_PAID["status: paid"]
    INV_NEW -->|Devis| QUOTE["type: quote"]
    QUOTE -->|Convertir| INV_FROM_QUOTE["Facture depuis devis"]
  end

  subgraph SUBSCRIPTION["💳 Logique Abonnement"]
    SUB_CHECK["check-subscription Edge Function"]
    SUB_CHECK -->|Polling 60s| STRIPE_API["API Stripe"]
    STRIPE_API -->|active/trialing| SUB_OK["Accès complet"]
    STRIPE_API -->|past_due| SUB_WARN["Alerte paiement"]
    STRIPE_API -->|canceled/unpaid| SUB_EXPIRED["Page publique masquée"]
    SUB_OK -->|Met à jour| CENTERS_TABLE["centers.subscription_plan"]
    SUB_WARN -->|Met à jour| CENTERS_TABLE
    SUB_EXPIRED -->|Met à jour| CENTERS_TABLE
  end

  subgraph EXTRAS["⚙️ Fonctionnalités annexes"]
    ICAL["Flux iCal /calendar-ical"]
    ICAL -->|Token unique| ICAL_FEED["Export calendrier"]
    GOOGLE_LINK["Lien Google Calendar"]
    SITEMAP["Sitemap dynamique /sitemap"]
    TAWKTO["Chat Tawk.to"]
  end

  APPOINTMENT -.->|Lié à| CAL_VIEW
  CONTACT_REQ -.->|Visible dans| REQ_VIEW
  STATUS_DONE -.->|Peut générer| INV_NEW
  CLIENTS_VIEW -.->|Fiche client| CLIENT_DETAIL["Historique + services"]

  style VISITEUR fill:#e8f5e9,stroke:#2e7d32,color:#000
  style AUTH fill:#fff3e0,stroke:#e65100,color:#000
  style BOOKING fill:#e3f2fd,stroke:#1565c0,color:#000
  style DASHBOARD_PRO fill:#f3e5f5,stroke:#6a1b9a,color:#000
  style RDV_MGMT fill:#fce4ec,stroke:#c62828,color:#000
  style INVOICING fill:#fff8e1,stroke:#f57f17,color:#000
  style SUBSCRIPTION fill:#e0f2f1,stroke:#00695c,color:#000
  style EXTRAS fill:#f5f5f5,stroke:#616161,color:#000
`;

export default function Cartography() {
  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const diagramRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.toUpperCase() === ACCESS_CODE) {
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  useEffect(() => {
    if (!unlocked) return;
    mermaid.initialize({
      startOnLoad: false,
      theme: "default",
      flowchart: { useMaxWidth: false, htmlLabels: true, curve: "basis" },
      securityLevel: "loose",
    });
    mermaid.run({ nodes: [diagramRef.current!] });
  }, [unlocked]);

  const handleDownloadPng = useCallback(async () => {
    if (!diagramRef.current) return;
    try {
      const dataUrl = await toPng(diagramRef.current, {
        backgroundColor: "#ffffff",
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      link.download = "cartographie-goclean.png";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export PNG failed", err);
    }
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <Lock className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
            <CardTitle>Accès protégé</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="password"
                placeholder="Entrez le code d'accès"
                value={code}
                onChange={(e) => { setCode(e.target.value); setError(false); }}
                className={error ? "border-destructive" : ""}
                autoFocus
              />
              {error && <p className="text-sm text-destructive">Code incorrect</p>}
              <Button type="submit" className="w-full">Accéder</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
        }
      `}</style>
      <div className="min-h-screen bg-background">
        <div className="no-print sticky top-0 z-10 bg-background/95 backdrop-blur border-b p-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold">Cartographie GoClean</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDownloadPng}>
              <Download className="h-4 w-4 mr-1" /> PNG
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-1" /> PDF
            </Button>
          </div>
        </div>
        <div className="p-4 overflow-auto">
          <div ref={diagramRef} className="mermaid">
            {DIAGRAM}
          </div>
        </div>
      </div>
    </>
  );
}
