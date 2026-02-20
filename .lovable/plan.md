

# Page Cartographie protegee par code

## Ce qui sera fait

### Nouvelle page `/carto`
- Page accessible uniquement apres avoir saisi le code **COCOCOCO**
- Ecran de verrouillage avec un champ de saisie du code
- Une fois le code saisi, affichage du diagramme complet de l'application
- 2 boutons : **Telecharger en PNG** et **Imprimer / PDF**
- Le diagramme couvre tout le parcours : inscription, booking, dashboard, abonnement, facturation

### Contenu du diagramme
La cartographie complete deja generee, rendue visuellement avec la librairie Mermaid :
- Parcours visiteur (CTA -> Stripe -> Inscription -> Dashboard)
- Parcours client (Page publique -> Reservation -> Emails)
- Parcours pro (Dashboard -> RDV / Clients / Factures / Stats)
- Logique abonnement (Verification -> Acces Pro / Mode degrade)
- Chemins d'erreur

## Section technique

### Dependances ajoutees
- `mermaid` : rendu visuel des diagrammes flowchart
- `html-to-image` : capture du diagramme en PNG pour telecharger

### Fichiers crees
- `src/pages/Cartography.tsx` : page avec ecran de code + rendu Mermaid + boutons export

### Fichiers modifies
- `src/App.tsx` : ajout de la route publique `/carto`

### Fonctionnement
- Le code est verifie cote client uniquement (comparaison avec "COCOCOCO")
- Si le code est correct, le diagramme s'affiche
- Bouton PNG : `html-to-image` capture le SVG et declenche un telechargement
- Bouton PDF : `window.print()` avec styles d'impression qui masquent les boutons

