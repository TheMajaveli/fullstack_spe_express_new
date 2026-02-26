# Docker et DevOps

Le projet est dockerisé et la qualité est assurée par une pipeline CI/CD sur GitHub Actions.

## Docker

### Stack complète

Le fichier `docker-compose.yml` à la racine définit trois services :

1. **mysql** : MySQL 8.0, base `cinenoir`, volume pour les données, healthcheck.
2. **api** : application Express (build depuis `api/Dockerfile`), dépend de MySQL, exécute les migrations au démarrage si `RUN_MIGRATE=true`, volume pour les uploads (affiches), healthcheck HTTP sur `/health`.
3. **frontend** : build depuis `frontend/Dockerfile` (build Vite puis serveur web type nginx), dépend de l’API, exposé sur le port 3000.

**Lancer toute la stack :**

```bash
docker compose up -d
```

- Frontend : http://localhost:3000  
- API : http://localhost:4000  

**Données de démo :** après le premier démarrage, exécuter le seed dans le conteneur API :

```bash
docker compose exec api node dist/database/seed.js
```

### Variables d’environnement

Les variables (port, DB, JWT, etc.) sont définies dans `docker-compose.yml` pour chaque service. Pour la prod, il est recommandé d’utiliser des fichiers `.env` ou un gestionnaire de secrets et de ne pas commiter de secrets.

### Volumes

- **mysql_data** : persistance des données MySQL.
- **api_uploads** : persistance des fichiers uploadés (affiches) par l’API.

### Développement avec Docker

- **Option** : lancer uniquement MySQL avec Docker et faire tourner l’API et le frontend en local (`api/npm run dev`, `frontend/npm run dev`) pour le hot-reload. Une variante peut être décrite dans `docker-compose.dev.yml` si présent.

## CI/CD (GitHub Actions)

### CI (`.github/workflows/ci.yml`)

- **Déclenchement** : push et pull requests sur `main` et `dev`.
- **Jobs** :
  - **test-api** : MySQL en service, migrations, tests unitaires API.
  - **build-api** : build de l’API.
  - **build-frontend** : build du frontend.
  - **e2e** : après les trois jobs — MySQL, seed, démarrage API + frontend, tests Playwright.

Les secrets (si besoin) sont configurés dans les paramètres du dépôt GitHub. La CI utilise une base MySQL de test dédiée.

### CD (déploiement)

Le fichier `.github/workflows/cd.yml` (s’il existe) peut définir un déploiement automatique (ex. vers un hébergeur) après des pushes sur `main`. À adapter selon l’environnement cible (VPS, PaaS, etc.).

## Bonnes pratiques

- **Branches** : `main` = stable, `dev` = intégration ; les fonctionnalités sont mergées dans `dev` puis éventuellement dans `main`.
- **Nettoyage** : supprimer les branches déjà mergées pour garder un dépôt lisible.
- **Secrets** : ne jamais commiter de mots de passe ou clés JWT ; utiliser les variables d’environnement et les secrets GitHub pour la CI/CD.
