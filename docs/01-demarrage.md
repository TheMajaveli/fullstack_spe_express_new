# Démarrage — Comprendre et lancer CineNoir

Ce guide permet à toute personne de comprendre le projet et de le faire tourner en local ou avec Docker.

## Qu’est-ce que CineNoir ?

**CineNoir** est une application **full-stack** de catalogue de films : parcours public, espace membre (liste à voir, notes, historique) et back-office admin (CRUD films et catégories).

- **Frontend** : React + Vite + TypeScript  
- **Backend** : Node.js + Express + TypeScript  
- **Base de données** : MySQL 8.0 (driver mysql2)  
- **Authentification** : JWT (access + refresh tokens)  
- **Tests** : Jest + Supertest (API), Playwright (E2E)

## Architecture en trois couches

```
┌─────────────────────────────────────────────────┐
│  FRONTEND (Vite + React)                         │
│  Interface, état (Zustand), appels API           │
└────────────────────┬────────────────────────────┘
                     │ HTTP / REST (JSON)
┌────────────────────▼────────────────────────────┐
│  API (Express + TypeScript)                      │
│  Routes, contrôleurs, services, middlewares      │
└────────────────────┬────────────────────────────┘
                     │ SQL (mysql2)
┌────────────────────▼────────────────────────────┐
│  BASE DE DONNÉES (MySQL 8.0)                     │
│  Utilisateurs, films, catégories, notes, etc.    │
└─────────────────────────────────────────────────┘
```

Chaque couche a un rôle précis : l’API ne connaît pas le détail du frontend, le frontend ne fait que des appels HTTP.

## Structure du projet

```
.
├── api/                    # Backend Express
│   ├── src/
│   │   ├── controllers/    # Gestion des requêtes
│   │   ├── services/       # Logique métier
│   │   ├── routes/         # Définition des routes
│   │   ├── middlewares/    # Auth, validation, erreurs
│   │   ├── validators/     # express-validator
│   │   ├── database/       # Schéma SQL, migrations, seed
│   │   └── utils/
│   └── tests/              # Tests unitaires API
│
├── frontend/               # Application React
│   ├── pages/              # Pages (catalogue, compte, admin…)
│   ├── components/         # Composants réutilisables + shadcn/ui
│   ├── services/           # Client API (api.ts)
│   ├── store.ts            # État global (Zustand)
│   ├── locales/            # Traductions (i18n FR/EN)
│   └── lib/                # Utilitaires (cn, etc.)
│
├── e2e/                    # Tests E2E Playwright
├── docs/                   # Documentation (ce dossier)
└── docker-compose.yml      # Stack Docker (MySQL + API + frontend)
```

## Lancer le projet

### Option 1 : Tout en Docker (recommandé)

```bash
docker compose up -d
```

- **Frontend** : http://localhost:3000  
- **API** : http://localhost:4000  
- **Santé API** : http://localhost:4000/health  

Au premier démarrage, les migrations sont appliquées. Pour charger les données de démo :

```bash
docker compose exec api npm run db:seed
```

### Option 2 : Développement en local

**Prérequis** : Node.js 20+, MySQL 8.0+, npm

1. **Base de données**  
   Créer la base et l’utilisateur (ou lancer uniquement MySQL en Docker) :

   ```bash
   # Exemple avec MySQL local
   mysql -u root -p -e "CREATE DATABASE cinenoir CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   ```

2. **API**

   ```bash
   cd api
   npm install
   cp env.example .env   # Puis éditer .env
   npm run db:migrate
   npm run db:seed
   npm run dev
   ```
   → API sur http://localhost:4000

3. **Frontend**

   ```bash
   cd frontend
   npm install
   echo "VITE_API_URL=http://localhost:4000" > .env.local
   npm run dev
   ```
   → Frontend sur http://localhost:5173

## Comptes par défaut (après seed)

- **Admin** : `admin@cinenoir.local` / `Admin1234`  
- Utilisateur de test : voir `api/src/database/seed.ts`

## Parcours rapide dans le code

| Objectif | Où regarder |
|----------|--------------|
| Routes et endpoints | `api/src/routes/` |
| Logique métier (films, auth, etc.) | `api/src/services/` |
| Schéma et données | `api/src/database/schema.sql`, `seed.ts` |
| Pages (catalogue, compte, admin) | `frontend/pages/` |
| Appels API côté front | `frontend/services/api.ts` |
| État global (auth, user) | `frontend/store.ts` |
| Composants UI | `frontend/components/` et `frontend/components/ui/` |

## Suite de la documentation

- [Catalogue (liste, filtres, recherche)](02-catalogue.md)  
- [Authentification (inscription, connexion, JWT)](03-authentification.md)  
- [Espace membre (watchlist, notes, historique)](04-espace-membre.md)  
- [Back-office admin](05-back-office-admin.md)  
- [Design system et UI](06-design-system-ui.md)  
- [Internationalisation (i18n)](07-internationalisation.md)  
- [Accessibilité](08-accessibilite.md)  
- [Tests](09-tests.md)  
- [Docker et CI/CD](10-docker-devops.md)  
- [Référence API](11-api.md)  
