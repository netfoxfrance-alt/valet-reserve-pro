

# Refonte "Ma Page" -- Experience de creation inspiree Linktree/Paage

## Constat

Le systeme actuel (3 onglets: Design, Formules, Elements) est fonctionnel mais manque de "magie". Les pros ne se sentent pas en train de construire leur site. L'experience est trop technique (color pickers, inputs) et pas assez visuelle/guidee.

## Axes d'amelioration (par priorite)

### 1. Templates de demarrage (impact fort, effort moyen)

Quand un pro arrive sur "Ma Page" pour la premiere fois (ou via un bouton "Changer de template"), proposer 3-4 templates pre-configures avec apercu visuel :

- **Minimal** : Header minimal, formules, contact. Couleurs neutres.
- **Vitrine** : Banniere, galerie photos, formules, avis Google, horaires.
- **Pro Nettoyage** : Banniere, texte de presentation, formules avec variantes, avant/apres, contact.
- **Prestige** : Mode sombre, banniere, galerie, formules, liens reseaux.

Chaque template pre-remplit : header_style, blocks, couleurs, dark_mode. Le pro peut ensuite tout modifier.

Implementation :
- Fichier `src/lib/pageTemplates.ts` avec les presets
- Dialog de selection au premier acces ou via bouton "Templates"
- Appliquer = remplacer customization avec les valeurs du template

### 2. Onboarding guide / Assistant pas-a-pas (impact fort, effort moyen)

Au lieu de 3 onglets techniques, proposer un flow guide lors de la premiere configuration :

```text
Etape 1: "Choisissez un style"     → Template selector
Etape 2: "Ajoutez votre banniere"  → Upload zone
Etape 3: "Vos couleurs"            → 6 presets (1 clic)
Etape 4: "Vos formules"            → Toggle on/off
Etape 5: "Enrichissez"             → Suggestions contextuelles
```

Apres l'onboarding, le pro retrouve l'editeur normal (onglets). Un bouton "Recommencer" permet de relancer le guide.

### 3. Ameliorer l'editeur existant (impact moyen, effort faible)

- **Apercu en temps reel plus prominent** : L'apercu iPhone est deja la mais on peut le rendre plus central (style Paage/Linktree ou l'apercu domine).
- **Bouton "+ Ajouter un element"** en sticky bottom comme Linktree (deja present mais peut etre plus visible).
- **Drag & drop** pour reordonner les blocs au lieu des fleches haut/bas (utiliser `@dnd-kit/core`).
- **Suggestions intelligentes** : Si le pro n'a pas de galerie, afficher un encart "Ajoutez des photos pour rassurer vos clients".

### 4. Images de prestations generees par IA (impact wow, effort moyen)

Utiliser Lovable AI (gemini-3-pro-image-preview ou gemini-3.1-flash-image-preview) pour generer des images de couverture ou de prestations :

- Bouton "Generer une image" dans la galerie et sur la banniere
- Prompt automatique base sur le nom du centre et ses services (ex: "Professional car cleaning service, modern, bright photography style")
- L'image generee est uploadee dans le storage

### 5. Couleurs simplifiees (effort faible)

Remplacer les 3 color pickers + 6 presets par un systeme de "themes" comme Linktree :
- 8-10 themes pre-definis (nom + apercu miniature avec couleurs)
- Toggle clair/sombre
- Option "Personnaliser" pour les color pickers (avance, cache par defaut)

## Plan d'implementation (ordre recommande)

| Phase | Tache | Fichiers |
|-------|-------|----------|
| 1 | Creer `pageTemplates.ts` avec 4 templates | `src/lib/pageTemplates.ts` |
| 2 | Ajouter le selecteur de templates dans Ma Page | `DashboardMyPage.tsx`, nouveau composant `TemplateSelector.tsx` |
| 3 | Refondre les couleurs en "Themes" (presets visuels) | `CustomizationSection.tsx` |
| 4 | Ajouter l'onboarding guide premiere visite | Nouveau composant `PageOnboarding.tsx`, flag en DB ou localStorage |
| 5 | Integrer la generation d'images IA | `BlocksEditor.tsx`, nouvelle edge function `generate-service-image` |
| 6 | Suggestions contextuelles ("Ajoutez des photos") | `BlocksEditor.tsx` |

## Ce qu'on ne fait PAS (pour rester simple)

- Pas de drag & drop complexe (les fleches suffisent pour l'instant)
- Pas d'editeur WYSIWYG inline sur la preview (trop complexe)
- Pas de multi-pages (une seule page par pro)

