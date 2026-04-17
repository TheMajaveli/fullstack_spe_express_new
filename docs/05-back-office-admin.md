# Back-office admin — CRUD films et catégories

Le back-office est réservé aux utilisateurs avec le rôle **ADMIN**. Il permet de gérer les films (avec upload d’affiche) et les catégories.

## Accès

- **Connexion admin** : page dédiée (ex. `/admin/login`) ou accès aux routes sous `/admin` après connexion avec un compte admin.
- **Contrôle d’accès** : middleware `requireRole("ADMIN")` sur les routes admin côté API ; côté front, les liens/menus admin ne sont affichés que si l’utilisateur a le rôle admin.

## Films

- **Création** : `POST /movies` — body multipart (titre, description, année, durée, réalisateur, catégorie, fichier `poster`). Gestion de l’upload via Multer (`api/src/middlewares/upload.ts`), stockage local (ex. `uploads/`).
- **Lecture** : `GET /movies`, `GET /movies/:id` (déjà utilisés par le catalogue).
- **Modification** : `PUT /movies/:id` — champs modifiables + upload optionnel d’une nouvelle affiche.
- **Suppression** : `DELETE /movies/:id`.

Fichiers principaux : `api/src/routes/movieRoutes.ts`, `api/src/controllers/adminMovieController.ts` (ou équivalent), services associés.

## Catégories

- **CRUD** : `GET /categories`, `POST /categories`, `PUT /categories/:id`, `DELETE /categories/:id`.
- Validation et logique dans `api/src/routes/categoryRoutes.ts`, `api/src/controllers/categoryController.ts`, `api/src/services/categoryService.ts`.

## Interface admin (frontend)

- **Layout** : `frontend/components/AdminLayout.tsx` — structure et navigation du back-office.
- **Pages** :
  - Dashboard : statistiques, KPIs, résumé (données réelles depuis l’API).
  - Films : `AdminMovies.tsx` — tableau, recherche, création/édition/suppression via modales, upload d’affiche dans le formulaire (`MovieFormModal.tsx`).
  - Catégories : `AdminCategories.tsx` — tableau, création/édition/suppression avec formulaires validés (Zod + react-hook-form).
  - Utilisateurs : `AdminUserBase.tsx` — liste des utilisateurs et informations associées.

Formulaires avancés avec **react-hook-form** et **Zod** ; toasts pour le retour succès/erreur.

## Dashboard (détails)

- **KPIs / charts** : alimentés par `GET /admin/stats` (frontend : `useAdminDashboardData.ts`).
- **Activité récente** : affiche les derniers ajouts (films / users). Pour les activités “film”, la liste affiche la **jaquette** quand elle est disponible.

## Bouton “voir trailer” (liste films)

Dans `AdminMovies.tsx`, l’action **trailer** ouvre une modale avec une iframe YouTube si `trailerUrl` est renseigné et reconnu (`youtubeEmbedUrl`).
