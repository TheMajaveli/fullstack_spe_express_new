# Référence API

Documentation synthétique des endpoints de l’API CineNoir. Toutes les réponses JSON ont la forme `{ success: true, data: ... }` ou `{ success: false, error: { message, code?, details? } }`.

## Authentification

| Méthode | Route | Description |
|---------|--------|-------------|
| POST | `/auth/register` | Inscription — body : `email`, `username`, `password` |
| POST | `/auth/login` | Connexion — body : `email`, `password` |
| POST | `/auth/refresh` | Nouveau access token — body : `refreshToken` |
| GET | `/auth/me` | Profil de l’utilisateur connecté (header `Authorization: Bearer <accessToken>`) |

## Films (public)

| Méthode | Route | Description |
|---------|--------|-------------|
| GET | `/movies` | Liste paginée — query : `q`, `category`, `rating`, `sort` (newest \| rating \| title), `page`, `limit` (1–50) |
| GET | `/movies/:id` | Détail d’un film par ID |

## Catégories (public)

| Méthode | Route | Description |
|---------|--------|-------------|
| GET | `/categories` | Liste de toutes les catégories |

## Espace utilisateur (protégé, rôle USER ou ADMIN)

Toutes les routes ci-dessous nécessitent le header `Authorization: Bearer <accessToken>`.

| Méthode | Route | Description |
|---------|--------|-------------|
| GET | `/user/me` | Profil complet (watchlist, ratings, history) |
| POST | `/user/watchlist/:movieId` | Ajouter un film à la liste à voir |
| DELETE | `/user/watchlist/:movieId` | Retirer un film de la liste à voir |
| POST | `/user/ratings/:movieId` | Ajouter ou modifier une note — body : `ratingNumber` (2–10), `note` (optionnel) |
| POST | `/user/history/:movieId` | Marquer le film comme vu |

## Admin (protégé, rôle ADMIN uniquement)

Header `Authorization: Bearer <accessToken>` requis ; le middleware vérifie le rôle ADMIN.

### Films

| Méthode | Route | Description |
|---------|--------|-------------|
| POST | `/movies` | Créer un film — multipart : champs texte + fichier `poster` |
| PUT | `/movies/:id` | Modifier un film — multipart optionnel (nouvelle affiche) |
| DELETE | `/movies/:id` | Supprimer un film |

### Catégories

| Méthode | Route | Description |
|---------|--------|-------------|
| POST | `/categories` | Créer une catégorie — body : `name` |
| PUT | `/categories/:id` | Modifier une catégorie — body : `name` |
| DELETE | `/categories/:id` | Supprimer une catégorie |

## Santé

| Méthode | Route | Description |
|---------|--------|-------------|
| GET | `/health` | Santé de l’API (utilisé par Docker et la CI) |

## Codes HTTP courants

- **200** : Succès.
- **400** : Erreur de validation (paramètres ou body invalides).
- **401** : Non authentifié (token manquant ou invalide).
- **403** : Accès interdit (rôle insuffisant, ex. route admin pour un USER).
- **404** : Ressource non trouvée (ex. film inexistant).
- **500** : Erreur serveur.

## Validation (express-validator)

Les paramètres de requête et les body sont validés avant d’atteindre les contrôleurs. En cas d’erreur, l’API renvoie 400 avec un message dans `error.message` ou `error.details`.
