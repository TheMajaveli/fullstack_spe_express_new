# CineNoir — Catalogue de films full-stack

Application full-stack de catalogue de films : parcours public, espace membre (liste à voir, notes, historique) et back-office admin (CRUD films et catégories). Toute la documentation détaillée est en français dans le dossier **[docs/](docs/)**.

## Stack

- **Frontend** : React + Vite + TypeScript, Zustand, React Query, shadcn/ui, i18n (FR/EN)
- **Backend** : Node.js + Express + TypeScript
- **Base de données** : MySQL 8.0 (mysql2)
- **Authentification** : JWT (access + refresh), rôles USER / ADMIN
- **Tests** : Jest + Supertest (API), Playwright (E2E)

## Démarrage rapide

### Avec Docker (recommandé)

```bash
docker compose up -d
```

- **Frontend** : http://localhost:3000  
- **API** : http://localhost:4000  

Charger les données de démo :

```bash
docker compose exec api node dist/database/seed.js
```

### En local

1. **Base** : créer la base MySQL `cinenoir` (voir [docs/01-demarrage.md](docs/01-demarrage.md)).
2. **API** : `cd api && npm install && cp env.example .env && npm run db:migrate && npm run db:seed && npm run dev`
3. **Frontend** : `cd frontend && npm install && echo "VITE_API_URL=http://localhost:4000" > .env.local && npm run dev`

## Compte admin (après seed)

- **Email** : `admin@cinenoir.local`
- **Mot de passe** : `Admin1234`

## Documentation

Toute la documentation est en français dans le dossier **[docs/](docs/)** :

- **[Démarrage](docs/01-demarrage.md)** — Architecture, structure du projet, lancer l’app
- **[Catalogue](docs/02-catalogue.md)** — Liste, détail, filtres, recherche, scroll infini
- **[Authentification](docs/03-authentification.md)** — Inscription, JWT, rôles
- **[Espace membre](docs/04-espace-membre.md)** — Watchlist, notes, historique
- **[Back-office admin](docs/05-back-office-admin.md)** — CRUD films et catégories
- **[Design system](docs/06-design-system-ui.md)** — Composants, thèmes
- **[Internationalisation](docs/07-internationalisation.md)** — FR/EN
- **[Accessibilité](docs/08-accessibilite.md)** — RGA, landmarks, focus
- **[Tests](docs/09-tests.md)** — Unitaires, E2E, CI
- **[Docker et DevOps](docs/10-docker-devops.md)** — Docker, CI/CD
- **[Référence API](docs/11-api.md)** — Endpoints

## Scripts utiles

| Où | Commande | Description |
|----|----------|-------------|
| api/ | `npm run dev` | Serveur de développement API |
| api/ | `npm test` | Tests unitaires (Jest) |
| api/ | `npm run db:migrate` | Exécuter les migrations SQL |
| api/ | `npm run db:seed` | Charger les données de démo |
| frontend/ | `npm run dev` | Serveur de développement frontend |
| frontend/ | `npm run build` | Build de production |
| e2e/ | `npm test` | Tests E2E Playwright (API + frontend démarrés) |

## Variables d’environnement

**API** (`api/.env`) : `PORT`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`. Voir `api/env.example`.

**Frontend** (`frontend/.env.local`) : `VITE_API_URL` (URL de l’API, ex. `http://localhost:4000`).

## Licence

ISC
