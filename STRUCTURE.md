# 📁 Structure du Projet

## Organisation

```
fullstack_spe_express_new/
├── backend/                    # Backend Express.js
│   ├── config/                 # Configuration
│   │   ├── database/          # Configuration DB
│   │   ├── migrations/        # Migrations SQL
│   │   └── seeders/          # Seeders de données
│   ├── controllers/           # Contrôleurs métier
│   ├── middleware/            # Middleware (auth, validation, etc.)
│   ├── routes/                # Définition des routes
│   ├── services/              # Services métier
│   ├── utils/                 # Utilitaires (JWT, bcrypt, etc.)
│   ├── tests/                 # Tests unitaires et intégration
│   ├── uploads/               # Fichiers uploadés (images)
│   ├── index.js               # Point d'entrée
│   ├── package.json           # Dépendances backend
│   ├── Dockerfile             # Image Docker backend
│   └── jest.config.js         # Configuration Jest
│
├── frontend/                   # Frontend Next.js
│   ├── app/                   # Pages Next.js 13+ (App Router)
│   ├── components/            # Composants React
│   ├── lib/                   # Utilitaires frontend
│   ├── types/                 # Types TypeScript
│   ├── public/                # Assets statiques
│   ├── package.json           # Dépendances frontend
│   └── Dockerfile             # Image Docker frontend
│
├── .github/                    # GitHub Actions
│   └── workflows/
│       └── ci.yml             # Pipeline CI/CD
│
├── ETAPES/                     # Documentation étape par étape
├── docker-compose.yml          # Orchestration Docker
├── README.md                   # Guide principal
├── PROJET.md                   # Documentation complète
└── .gitignore                  # Fichiers ignorés
```

## Backend (`backend/`)

### Structure détaillée

```
backend/
├── config/
│   ├── database/
│   │   └── db.js              # Pool de connexions MySQL
│   ├── migrations/
│   │   ├── create_movies_db.js    # Création DB et tables films
│   │   └── create_auth_tables.js  # Tables auth et espace membre
│   └── seeders/
│       ├── categories_seeder.js   # Seed catégories
│       └── movies_seeder.js       # Seed films
│
├── controllers/
│   ├── authController.js      # Authentification
│   ├── movieController.js     # Films
│   ├── categoryController.js  # Catégories
│   └── userController.js      # Espace membre
│
├── middleware/
│   ├── auth.js                # Authentification JWT
│   ├── roles.js               # Vérification rôles
│   ├── validation.js          # Validation données
│   ├── errorHandler.js        # Gestion erreurs
│   └── upload.js              # Upload fichiers (multer)
│
├── routes/
│   ├── auth.js                # Routes authentification
│   ├── movies.js              # Routes films
│   ├── categories.js          # Routes catégories
│   └── user.js                # Routes espace membre
│
├── services/
│   └── authService.js         # Service authentification
│
├── utils/
│   ├── jwt.js                 # Utilitaires JWT
│   ├── bcrypt.js              # Hash passwords
│   └── logger.js              # Logging
│
├── tests/
│   ├── unit/                  # Tests unitaires
│   ├── integration/           # Tests d'intégration
│   ├── setup.js               # Configuration tests
│   └── README.md              # Documentation tests
│
└── uploads/                   # Images uploadées
```

## Frontend (`frontend/`)

### Structure détaillée

```
frontend/
├── app/                        # App Router Next.js 13+
│   ├── page.tsx               # Page d'accueil
│   ├── layout.tsx             # Layout principal
│   ├── globals.css            # Styles globaux
│   ├── auth/                  # Pages authentification
│   │   ├── login/
│   │   └── register/
│   ├── movies/                # Pages films
│   │   └── [id]/              # Détail film
│   ├── my-favorites/          # Favoris
│   ├── my-watchlist/          # Watchlist
│   ├── my-ratings/            # Notes
│   ├── history/               # Historique
│   └── admin/                 # Back-office
│       └── movies/            # Gestion films
│
├── components/
│   ├── ui/                    # Composants UI de base
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Toast.tsx
│   │   └── Loading.tsx
│   ├── MovieCard.tsx          # Carte film
│   ├── MovieFilters.tsx       # Filtres
│   ├── MovieActions.tsx       # Actions utilisateur
│   └── Navbar.tsx             # Navigation
│
├── lib/
│   ├── api.ts                 # Client HTTP (axios)
│   ├── auth.ts                # Fonctions authentification
│   ├── movies.ts              # Fonctions films
│   ├── categories.ts          # Fonctions catégories
│   ├── user.ts                # Fonctions espace membre
│   └── index.ts               # Exports
│
└── types/
    └── index.ts               # Types TypeScript
```

## Fichiers de Configuration

### Racine
- `docker-compose.yml` - Orchestration Docker
- `.gitignore` - Fichiers ignorés
- `README.md` - Guide principal
- `PROJET.md` - Documentation complète

### Backend
- `backend/package.json` - Dépendances backend
- `backend/Dockerfile` - Image Docker backend
- `backend/jest.config.js` - Configuration Jest
- `backend/.env` - Variables d'environnement (à créer)

### Frontend
- `frontend/package.json` - Dépendances frontend
- `frontend/Dockerfile` - Image Docker frontend
- `frontend/next.config.ts` - Configuration Next.js
- `frontend/tsconfig.json` - Configuration TypeScript
- `frontend/.env.local` - Variables d'environnement (à créer)

## Documentation

- `PROJET.md` - Documentation principale
- `README.md` - Guide de démarrage
- `RESUME.md` - Résumé du projet
- `FINAL.md` - Résumé final
- `ETAT_PROJET.md` - État d'avancement
- `ETAPES/` - 11 fichiers détaillés
- `STRUCTURE.md` - Ce fichier

