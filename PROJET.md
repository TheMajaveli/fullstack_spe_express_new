# 📚 Documentation du Projet - Plateforme de Films

## 🎯 Vision Produit

Cette application est une plateforme complète de gestion et de découverte de films avec :
- **Parcours public** : consultation des films avec filtres avancés
- **Authentification** : système complet avec JWT et refresh tokens
- **Espace membre** : gestion personnelle (favoris, watchlist, notes, historique)
- **Back-office admin** : administration complète du catalogue

---

## 📋 Architecture Technique

### Stack Technologique

- **Backend** : Express.js 5.1.0
- **Frontend** : Next.js (à créer)
- **Base de données** : MySQL 8.0+
- **Authentification** : JWT (access + refresh tokens)
- **Validation** : express-validator
- **Containerisation** : Docker
- **CI/CD** : GitHub Actions

### Structure du Projet

```
fullstack_spe_express_new/
├── backend/ (Express)
│   ├── config/          # Configuration DB, migrations, seeders
│   ├── controllers/     # Logique métier
│   ├── middleware/      # Auth, validation, erreurs, rôles
│   ├── routes/          # Définition des routes API
│   ├── services/        # Services métier
│   ├── utils/           # Utilitaires (JWT, bcrypt, logger)
│   ├── tests/           # Tests unitaires et intégration
│   └── uploads/         # Fichiers uploadés (images)
├── frontend/ (Next.js)
│   ├── app/             # Pages et routes Next.js 13+
│   ├── components/      # Composants réutilisables
│   ├── lib/             # Utilitaires frontend
│   └── public/          # Assets statiques
├── docker-compose.yml   # Orchestration Docker
├── Dockerfile           # Image backend
└── .github/workflows/   # CI/CD
```

---

## 🗄️ Modèle de Données

### Tables Principales

#### `users`
- Authentification et profils utilisateurs
- Rôles : `user` (par défaut) ou `admin`

#### `movies`
- Catalogue de films
- Relations : `category_id` → `categories`

#### `categories`
- Catégories de films (Action, Comédie, etc.)

#### `favorites`
- Films favoris par utilisateur (relation many-to-many)

#### `watchlist` (à créer)
- Liste de films à voir plus tard

#### `ratings`
- Notes et commentaires utilisateurs sur les films
- Note entre 0 et 10

#### `view_history`
- Historique de consultation des films

#### `movie_images`
- Images/posters associés aux films
- Support upload de fichiers

#### `refresh_tokens`
- Tokens de rafraîchissement pour l'authentification JWT

---

## 🔐 Authentification

### Flux JWT

1. **Inscription** : `POST /auth/register`
   - Validation email/password
   - Hash du mot de passe (bcrypt)
   - Création utilisateur

2. **Connexion** : `POST /auth/login`
   - Vérification credentials
   - Génération access token (15min) + refresh token (7j)
   - Stockage refresh token en DB

3. **Rafraîchissement** : `POST /auth/refresh`
   - Validation refresh token
   - Génération nouveau access token

4. **Profil** : `GET /auth/me`
   - Récupération profil utilisateur authentifié

5. **Déconnexion** : `POST /auth/logout`
   - Invalidation refresh token

### Middleware d'Authentification

- `authenticate` : Vérifie le token JWT dans `Authorization: Bearer <token>`
- `requireAdmin` : Vérifie le rôle admin
- `requireRole(...roles)` : Vérifie un ou plusieurs rôles

---

## 🎬 API Backend - Endpoints

### 🔓 Routes Publiques

#### Films
- `GET /movies` - Liste des films
  - Query params : `page`, `limit`, `category`, `minRating`, `search`, `sort`
  - Pagination et filtres multi-critères
- `GET /movies/:id` - Détail d'un film

#### Catégories
- `GET /categories` - Liste des catégories
- `GET /categories/:id` - Détail d'une catégorie
- `GET /categories/:id/movies` - Films d'une catégorie

### 🔒 Routes Authentifiées (User)

#### Auth
- `POST /auth/register` - Inscription
- `POST /auth/login` - Connexion
- `POST /auth/refresh` - Rafraîchir token
- `GET /auth/me` - Profil utilisateur
- `PUT /auth/profile` - Mettre à jour profil
- `POST /auth/logout` - Déconnexion

#### Espace Membre
- `GET /user/favorites` - Mes favoris
- `POST /user/favorites/:movieId` - Ajouter favori
- `DELETE /user/favorites/:movieId` - Retirer favori
- `GET /user/watchlist` - Ma watchlist
- `POST /user/watchlist/:movieId` - Ajouter à watchlist
- `DELETE /user/watchlist/:movieId` - Retirer de watchlist
- `GET /user/ratings` - Mes notes
- `POST /user/ratings/:movieId` - Noter un film
- `PUT /user/ratings/:movieId` - Modifier note
- `DELETE /user/ratings/:movieId` - Supprimer note
- `GET /user/history` - Mon historique

### 👑 Routes Admin

#### Films
- `POST /movies` - Créer film (avec upload image)
- `PUT /movies/:id` - Modifier film
- `DELETE /movies/:id` - Supprimer film

#### Catégories
- `POST /categories` - Créer catégorie
- `PUT /categories/:id` - Modifier catégorie
- `DELETE /categories/:id` - Supprimer catégorie

---

## 🎨 Frontend Next.js

### Pages Publiques

1. **`/`** - Page d'accueil / Liste des films
   - Filtres : catégorie, note min, recherche
   - Tri : titre, année, note
   - Pagination / Infinite scroll
   - Synchronisation URL ↔ état UI

2. **`/movies/[id]`** - Détail d'un film
   - Informations complètes
   - Actions : favori, watchlist, noter
   - Historique automatique (si connecté)

### Pages Authentifiées

3. **`/auth/login`** - Connexion
4. **`/auth/register`** - Inscription (validations fortes)
5. **`/profile`** - Profil utilisateur
6. **`/my-favorites`** - Mes favoris
7. **`/my-watchlist`** - Ma watchlist
8. **`/my-ratings`** - Mes notes
9. **`/history`** - Historique

### Pages Admin

10. **`/admin/movies`** - Gestion films (CRUD)
11. **`/admin/movies/new`** - Créer film (avec upload)
12. **`/admin/movies/[id]/edit`** - Modifier film
13. **`/admin/categories`** - Gestion catégories

### Design System

- **Tokens** : couleurs, espacements, typographie
- **Thèmes** : clair/sombre
- **Composants** : Button, Input, Card, Modal, Toast, etc.
- **Accessibilité** : RGA (Référentiel Général d'Amélioration de l'accessibilité)

---

## 🧪 Tests

### Tests Unitaires
- Contrôleurs
- Services
- Utilitaires (JWT, bcrypt)

### Tests E2E
- Flux d'authentification
- CRUD films (admin)
- Espace membre (favoris, watchlist, notes)

### Outils
- Jest (backend)
- Playwright / Cypress (E2E frontend)

---

## 🐳 Docker

### Configuration

- **Dockerfile** : Image Node.js pour backend
- **docker-compose.yml** :
  - Service `backend` (Express)
  - Service `frontend` (Next.js)
  - Service `mysql` (Base de données)
  - Service `nginx` (Reverse proxy optionnel)

### Commandes

```bash
docker-compose up -d        # Démarrer tous les services
docker-compose down         # Arrêter tous les services
docker-compose logs -f      # Voir les logs
```

---

## 🔄 CI/CD

### GitHub Actions

Workflows :
1. **Tests** : Exécution tests à chaque PR
2. **Build** : Construction images Docker
3. **Deploy** : Déploiement automatique (staging/production)

### Branches Git

- `main` : Production
- `dev` : Développement
- Feature branches : `feature/nom-fonctionnalite`

---

## 📝 Validation & Sécurité

### Backend (express-validator)

- Validation des données d'entrée
- Sanitization
- Messages d'erreur clairs

### Frontend

- Validations côté client (UX)
- Validations côté serveur (sécurité)

---

## 🌍 Internationalisation (i18n)

- Support multilingue (français, anglais)
- Fichiers de traduction
- Sélection de langue dans l'interface

---

## 📊 Observabilité

- **Toasts** : Notifications utilisateur (succès, erreur, info)
- **Logs** : Système de logging structuré
- **Monitoring** : (optionnel) Intégration outils externes

---

## 🚀 Guide de Démarrage

### Prérequis

- Node.js 18+
- MySQL 8.0+
- Docker & Docker Compose (optionnel)

### Installation Backend

```bash
cd backend
npm install
# Créer .env avec les variables d'environnement
node config/migrations/create_movies_db.js
node config/migrations/create_auth_tables.js
npm run dev
```

### Installation Frontend

```bash
cd frontend
npm install
cp .env.example .env  # Configurer l'URL API
npm run dev
```

### Avec Docker

```bash
docker-compose up -d
```

---

## 📖 Documentation des Étapes

Chaque étape d'implémentation sera documentée dans des fichiers séparés :
- `ETAPES/01-backend-filtres.md` - Amélioration filtres backend
- `ETAPES/02-espace-membre.md` - Implémentation espace membre
- `ETAPES/03-frontend-base.md` - Création frontend Next.js
- `ETAPES/04-frontend-pages.md` - Pages publiques et authentifiées
- `ETAPES/05-admin.md` - Back-office admin
- `ETAPES/06-tests.md` - Tests unitaires et E2E
- `ETAPES/07-docker.md` - Dockerisation
- `ETAPES/08-cicd.md` - Configuration CI/CD

---

## ✅ Checklist de Progression

- [x] Structure backend Express
- [x] Base de données MySQL (migrations)
- [x] Authentification JWT
- [x] CRUD films et catégories
- [ ] Filtres multi-critères avancés
- [ ] Espace membre (favoris, watchlist, notes, historique)
- [ ] Upload de fichiers (images)
- [ ] Frontend Next.js
- [ ] Pages publiques avec filtres
- [ ] Authentification frontend
- [ ] Espace membre frontend
- [ ] Back-office admin frontend
- [ ] Tests
- [ ] Docker
- [ ] CI/CD
- [ ] i18n
- [ ] Accessibilité

---

*Documentation mise à jour régulièrement au fur et à mesure de l'avancement du projet.*

