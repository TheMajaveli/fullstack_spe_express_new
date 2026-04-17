# Internationalisation (i18n)

L’application est disponible en **français** et en **anglais** via react-i18next. La langue est choisie par l’utilisateur et persistée.

## Configuration

- **Bibliothèque** : `i18next` + `react-i18next`.
- **Initialisation** : `frontend/i18n.ts` — chargement des ressources `fr` et `en`, langue par défaut `fr`, langue sauvegardée dans `localStorage` (clé `cinenoir-lang`).
- **Fichiers de traduction** : `frontend/locales/fr.json` et `frontend/locales/en.json` — clés regroupées par domaine (catalog, layout, auth, toast, common).

Au changement de langue, `document.documentElement.lang` est mis à jour et la préférence est enregistrée en localStorage.

## Utilisation dans le code

- **Hook** : `const { t } = useTranslation();` puis `t('catalog.noMovies')`, `t('layout.login')`, etc.
- **Avec variables** : `t('catalog.filterBy', { category: cat })`, `t('catalog.goToFilm', { index: index + 1 })`.

Les textes du catalogue (titres de sections, boutons, messages), du layout (navigation, footer, lien d’évitement), des toasts et des libellés d’accessibilité sont passés par `t()` pour être traduits.

## Contenu des films (synopsis FR/EN)

Les synopsis sont gérés côté API avec un paramètre de langue (ex. `?lang=fr`).

- En base, les films peuvent avoir `description` (EN) et `descriptionFr` (FR).
- Quand `lang=fr`, l’API renvoie **`descriptionFr` si présent**, sinon retombe sur `description`.
- Côté frontend, la langue de contenu catalogue est envoyée via `apiMovieContentLang(i18n.language)` (ex. dans le catalogue, la fiche film et les recommandations).

## Sélecteur de langue

Dans le header (`frontend/components/Layout.tsx`), deux boutons **FR** et **EN** permettent de changer la langue. L’état actif est indiqué visuellement et via `aria-pressed` pour l’accessibilité.

## Ajouter ou modifier des textes

1. Ajouter ou modifier les clés dans `frontend/locales/fr.json` et `frontend/locales/en.json`.
2. Remplacer les chaînes en dur dans les composants par `t('namespace.key')` (ou `t('namespace.key', { variable: value })` si besoin).

Les namespaces utilisés incluent : `catalog`, `layout`, `auth`, `toast`, `common`.
