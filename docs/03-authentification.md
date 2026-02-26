# Authentification — Inscription, connexion, JWT

L’authentification repose sur des **JWT** (access + refresh) et des rôles (**USER**, **ADMIN**).

## Flux utilisateur

1. **Inscription** : formulaire (email, username, mot de passe) avec validations fortes (Zod côté front, express-validator côté API).
2. **Connexion** : email + mot de passe → reçoit un access token et un refresh token.
3. **Persistance** : tokens et profil stockés dans le store Zustand, avec persistance localStorage (`cinenoir-v2-storage`).
4. **Rafraîchissement** : au chargement de l’app, si un access token existe, appel à `GET /auth/me` pour recharger le profil ; en cas d’erreur 401, tentative de refresh puis nouvel appel.
5. **Déconnexion** : suppression des tokens et du profil du store (et nettoyage côté client).

## Endpoints API

- `POST /auth/register` — Inscription (email, username, password).
- `POST /auth/login` — Connexion (email, password).
- `POST /auth/refresh` — Nouveau access token à partir du refresh token.
- `GET /auth/me` — Profil de l’utilisateur connecté (nécessite un access token valide).

## Sécurité côté backend

- **Mots de passe** : hashés avec bcrypt, jamais stockés en clair.
- **JWT** : access token courte durée (ex. 15 min), refresh token plus long (ex. 7 jours), stocké (hashé) en base pour pouvoir être révoqué.
- **Validation** : express-validator sur les body (email, longueur username, règles de mot de passe).

Fichiers principaux : `api/src/routes/authRoutes.ts`, `api/src/controllers/authController.ts`, `api/src/services/authService.ts`, `api/src/validators/authValidators.ts`.

## Côté frontend

- **Pages** : `RegisterPage.tsx`, `LoginPage.tsx` (et admin : `AdminLoginPage.tsx`).
- **Store** : `frontend/store.ts` — `accessToken`, `refreshToken`, `user`, `isAuthenticated` ; chargement du profil au démarrage si token présent.
- **Client API** : `frontend/services/api.ts` — en cas de 401, tentative de refresh puis relance de la requête.

## Protection des routes

Les routes « membre » (ex. `/account`) et « admin » redirigent vers la page de connexion si l’utilisateur n’est pas authentifié (ou n’a pas le bon rôle pour l’admin).
