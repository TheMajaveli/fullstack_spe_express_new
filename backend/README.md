# Backend Express.js - Plateforme de Films

## 🚀 Installation

1. Installer les dépendances:
```bash
npm install
```

2. Configurer les variables d'environnement dans `.env`:
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
node config/migrations/create_movies_db.js
node config/migrations/create_auth_tables.js
```

4. Démarrer le serveur:
```bash
npm run dev
```

## 📚 Documentation

Voir la documentation principale dans le dossier racine :
- `../PROJET.md` - Documentation complète
- `../README.md` - Guide général
- `../ETAPES/` - Documentation étape par étape

## 🧪 Tests

```bash
npm test
npm run test:watch
npm run test:coverage
```

## 📁 Structure

```
backend/
├── config/          # Configuration DB, migrations, seeders
├── controllers/     # Logique métier
├── middleware/      # Auth, validation, erreurs, rôles, upload
├── routes/          # Définition des routes API
├── services/        # Services métier
├── utils/           # Utilitaires (JWT, bcrypt, logger)
├── tests/           # Tests unitaires et intégration
└── uploads/         # Fichiers uploadés (images)
```

