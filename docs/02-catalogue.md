# Catalogue — Liste, détail, filtres et recherche

Le catalogue est la partie publique de l’application : liste de films, page détail, filtres, recherche, tri et pagination (ou scroll infini).

## Pages

- **Liste** : `frontend/pages/CatalogPage.tsx` — grille de films, bandeau « à la une », barre de filtres.
- **Détail** : `frontend/pages/MovieDetailPage.tsx` — synopsis, réalisateur, note, actions (watchlist, noter, marquer comme vu).

## Filtres et paramètres

Les paramètres sont **synchronisés avec l’URL** (source de vérité) :

- `q` : recherche textuelle (titre)
- `category` : catégorie (nom)
- `rating` : note minimale (nombre)
- `sort` : tri — `newest` | `oldest` | `rating` | `title`
- `page` : numéro de page (mode pagination)
- `limit` : nombre de films par page (1–50, défaut 12)
- `view` : `infinite` pour le scroll infini, sinon pagination classique

Exemple (route catalogue = `/`) : `/?q=Matrix&category=Sci-Fi&sort=rating&page=1&limit=12`

Notes UX :

- La **recherche principale** est dans la **navbar** (`frontend/components/Layout.tsx`) et met à jour `?q=`.
- En bas du catalogue, la pagination affiche le **numéro de page** sous forme **Page X / Y** (quand le mode pagination est actif).

## Côté API

- **Liste** : `GET /movies` — paramètres de requête validés par express-validator (`api/src/routes/movieRoutes.ts`), logique dans `api/src/services/movieService.ts` (liste avec count, pagination).
- **Détail** : `GET /movies/:id` — un film par ID.

Validation côté API : `limit` entre 1 et 50, `sort` dans `newest` | `oldest` | `rating` | `title`, etc.

## Scroll infini

Sur la page catalogue, un bouton permet de basculer entre :

- **Pagination** : boutons Précédent / Suivant.
- **Scroll infini** : chargement automatique des pages suivantes quand l’utilisateur descend (IntersectionObserver + `useInfiniteQuery`).

L’URL reflète le mode avec `?view=infinite` si le scroll infini est actif.

## Composants principaux

- **CatalogPage** : hero « à la une », barre de filtres (catégories, recherche, tri, limit, mode pagination/infinite), grille de films, pagination ou sentinelle pour l’infinite scroll.
- **PosterCard** (DesignSystem) : carte film avec poster, note, année, overlay au survol. Si l’utilisateur est connecté et a marqué un film comme vu, un badge **« Vu »** est affiché sur la carte.
- **MovieDetailPage** : affichage détaillé + boutons watchlist, notation, « marquer comme vu ».

## Données

- Les **catégories** sont chargées via `GET /categories` et utilisées pour les onglets/filtres.
- Les films sont renvoyés au format : `{ data: Movie[], total, totalPages }` pour la liste paginée.
