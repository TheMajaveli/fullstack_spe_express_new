# Accessibilité (RGA)

L’application vise une bonne accessibilité (référentiel RGA / bonnes pratiques WCAG) : structure sémantique, navigation au clavier et annonces pour les lecteurs d’écran.

## Landmarks et structure

- **Bannière** : le header principal a `role="banner"`.
- **Contenu principal** : la zone de contenu a `id="main-content"` et `role="main"`.
- **Pied de page** : le footer a `role="contentinfo"`.

Cela permet aux utilisateurs de lecteurs d’écran de naviguer rapidement entre les grandes zones de la page.

## Lien d’évitement

Un lien « Aller au contenu principal » (ou équivalent traduit) est placé en début de page. Il est masqué visuellement (classe type `sr-only`) et devient visible au focus clavier ; il pointe vers `#main-content` pour sauter la navigation.

## Focus et clavier

- Les liens et boutons importants ont un **focus visible** (anneau de focus) via les classes `focus-visible:ring-2 focus-visible:ring-accent` (ou équivalent).
- La navigation dans les modales et les formulaires reste possible au clavier ; les boutons de fermeture et les actions principales sont accessibles par Tab et Entrée.

## Formulaires et contrôles

- Les champs de formulaire sont associés à leur label (attribut `for` / `id` ou utilisation de composants accessibles).
- Les contrôles de filtres (recherche, tri, catégories, pagination) ont des `aria-label` ou des libellés visibles pour décrire leur rôle (ex. « Trier par », « Filtrer par catégorie »).
- Les boutons à état (ex. catégorie sélectionnée, mode scroll infini) utilisent `aria-pressed` quand c’est pertinent.

## Toasts et annonces dynamiques

- La zone des notifications (toasts) a `aria-live="polite"` et un `aria-label` approprié pour que les nouvelles notifications soient annoncées par les lecteurs d’écran.
- Chaque toast a `role="status"` pour indiquer qu’il s’agit d’un message informatif.

## Images

- Les images de contenu (affiches, visuels) ont un attribut `alt` pertinent (titre du film, description courte du contenu de l’image).
- Les images décoratives peuvent avoir `alt=""` ou un rôle approprié pour être ignorées par les lecteurs d’écran.

## Où c’est implémenté

- **Layout** : `frontend/components/Layout.tsx` — lien d’évitement, `role="banner"`, `role="main"`, `role="contentinfo"`, focus visible sur les liens du footer et les boutons du header.
- **Catalogue** : `frontend/pages/CatalogPage.tsx` — `aria-label` sur les contrôles de filtre, tri, pagination, carousel.
- **Toasts** : `frontend/components/Toast.tsx` — `aria-live`, `role="status"`, libellé du bouton fermer.

En complétant progressivement les `aria-label` et en gardant une structure sémantique (titres, landmarks), l’app reste cohérente avec les objectifs RGA.
