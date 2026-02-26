# Design system et composants UI

L’interface s’appuie sur des **tokens** (couleurs, thèmes), des **composants shadcn/ui** et des wrappers métier pour garder une API cohérente dans toute l’app.

## Stack UI

- **Tailwind CSS** (npm) : utilitaires et thème (couleurs, espacements, etc.) dans `frontend/tailwind.config.js`.
- **shadcn/ui** : composants dans `frontend/components/ui/` (Button, Input, Skeleton, Card, Dialog, Badge). Ils utilisent Radix UI et des classes Tailwind, avec la fonction utilitaire `cn()` dans `frontend/lib/utils.ts`.
- **DesignSystem.tsx** et **UI.tsx** : réexportent ou enveloppent ces composants pour garder les mêmes props qu’avant (variants, tailles, `isLoading`, label/error pour les champs, etc.).

## Thèmes

- **Mode sombre** par défaut (classe `dark` sur la racine).
- **Bascule** : bouton dans le header (Layout) pour alterner entre clair et sombre ; la préférence est stockée dans le store (Zustand) et appliquée via `document.documentElement.className`.

Variables CSS (couleurs de fond, texte, cartes, bordures) sont définies dans `frontend/index.css` (`:root` et `.dark`) et complétées par les variables shadcn (primary, accent, border, etc.) pour les composants.

## Composants principaux

| Composant | Usage |
|-----------|--------|
| **Button** | Variants : primary, secondary, outline, ghost, danger, link. Tailles : xs, sm, md, lg, icon. Prop `isLoading`. |
| **Input** | Champs de formulaire avec optionnel `label`, `error`, `icon`. |
| **Skeleton** | États de chargement (grilles, cartes). |
| **Card** | Conteneurs (compte, admin, listes). |
| **Modal / Dialog** | Modales (notation, formulaire film/catégorie) via le Dialog shadcn. |
| **Badge** | Étiquettes (statuts, catégories). |
| **PosterCard** | Carte film avec poster, note, overlay (catalogue). |

Les pages importent soit depuis `DesignSystem` (catalogue, détail, layout, auth basique), soit depuis `UI` (compte, admin, formulaires) selon l’historique du projet ; les deux s’appuient sur les mêmes primitives shadcn.

## Fichiers clés

- `frontend/components/ui/*` — composants shadcn.
- `frontend/components/DesignSystem.tsx` — Button, Input, Skeleton, Modal, PosterCard.
- `frontend/components/UI.tsx` — Button, Input, Skeleton, Card, Badge, useToast.
- `frontend/lib/utils.ts` — `cn()` (clsx + tailwind-merge).
- `frontend/index.css` — variables globales et thème.
- `frontend/tailwind.config.js` — couleurs (accent, cinema.*), polices, animations.
