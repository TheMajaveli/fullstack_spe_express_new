# 🎬 Plateforme de Films - Backend Express

## 📋 Description

Backend Express.js pour une plateforme complète de gestion et de découverte de films avec authentification JWT, espace membre, et back-office admin.

## 🚀 Installation

1. Installer les dépendances:
```bash
cd backend
npm install
```

2. Configurer les variables d'environnement dans `backend/.env`:
```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=movies_db
DB_PORT=3306
JWT_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

3. Exécuter les migrations:
```bash
cd backend
node config/migrations/create_movies_db.js
node config/migrations/create_auth_tables.js
```

4. Démarrer le serveur:
```bash
cd backend
npm run dev
```

## 📚 Documentation Complète

Voir [PROJET.md](./PROJET.md) pour la documentation complète du projet.

## 🔌 API Endpoints

### 🔓 Routes Publiques

#### Films
- `GET /movies` - Liste des films (avec filtres, recherche, tri, pagination)
  - Query params: `page`, `limit`, `category`, `minRating`, `search`, `sort`
- `GET /movies/:id` - Détail d'un film (avec images)

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
- `POST /user/history/:movieId` - Enregistrer consultation

### 👑 Routes Admin

#### Films
- `POST /movies` - Créer film (avec upload image, multipart/form-data)
- `PUT /movies/:id` - Modifier film (avec upload image optionnel)
- `DELETE /movies/:id` - Supprimer film

#### Catégories
- `POST /categories` - Créer catégorie
- `PUT /categories/:id` - Modifier catégorie
- `DELETE /categories/:id` - Supprimer catégorie

## 📝 Exemples d'Utilisation

### Liste des films avec filtres
```bash
GET /movies?category=1&minRating=7.5&search=matrix&sort=rating_desc&page=1&limit=20
```

### Créer un film avec image (Admin)
```bash
POST /movies
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

Form data:
- title: "Matrix"
- director: "Wachowski"
- release_year: 1999
- rating: 8.7
- category_id: 1
- image: [fichier image]
```

## 🗂️ Structure du Projet

```
├── config/          # Configuration DB, migrations, seeders
├── controllers/     # Logique métier
├── middleware/      # Auth, validation, erreurs, rôles, upload
├── routes/          # Définition des routes API
├── services/        # Services métier
├── utils/           # Utilitaires (JWT, bcrypt, logger)
└── uploads/         # Fichiers uploadés (images)
```

## 📖 Documentation des Étapes

- [Étape 1: Filtres Backend](./ETAPES/01-backend-filtres.md)
- [Étape 2: Espace Membre](./ETAPES/02-espace-membre.md)
- [Étape 3: Upload Images](./ETAPES/03-upload-images.md)

