# Étape 9 : Dockerisation du Projet

## 🎯 Objectif

Dockeriser l'application complète avec :
- Backend Express.js
- Frontend Next.js
- Base de données MySQL
- Orchestration avec docker-compose

## 📝 Fichiers Créés

### `Dockerfile` (Backend)

**Configuration** :
- Image de base : `node:18-alpine` (légère)
- Installation des dépendances production uniquement
- Création du dossier `uploads`
- Port exposé : 3000
- Commande : `node index.js`

### `frontend/Dockerfile` (Frontend)

**Configuration** :
- Image de base : `node:18-alpine`
- Installation des dépendances
- Mode développement pour Docker
- Port exposé : 3001
- Commande : `npm run dev`

### `docker-compose.yml`

**Services** :

1. **mysql**
   - Image : `mysql:8.0`
   - Port : 3306
   - Volume persistant : `mysql_data`
   - Healthcheck configuré
   - Variables d'environnement pour la base

2. **backend**
   - Build depuis `Dockerfile`
   - Port : 3000
   - Volume pour `uploads/`
   - Dépend de MySQL (healthcheck)
   - Exécute les migrations au démarrage
   - Variables d'environnement JWT et DB

3. **frontend**
   - Build depuis `frontend/Dockerfile`
   - Port : 3001
   - Volume pour hot-reload
   - Dépend du backend
   - Variable `NEXT_PUBLIC_API_URL`

**Réseau** :
- Réseau bridge `movies_network` pour communication inter-services

**Volumes** :
- `mysql_data` : Persistance des données MySQL
- `uploads/` : Images uploadées
- Frontend : Volumes pour développement

## 🚀 Utilisation

### Démarrer tous les services

```bash
docker-compose up -d
```

### Voir les logs

```bash
docker-compose logs -f
```

### Arrêter les services

```bash
docker-compose down
```

### Arrêter et supprimer les volumes

```bash
docker-compose down -v
```

### Rebuild après modifications

```bash
docker-compose up -d --build
```

### Accéder aux services

- **Frontend** : http://localhost:3001
- **Backend API** : http://localhost:3000
- **MySQL** : localhost:3306

## 🔧 Configuration

### Variables d'Environnement

Les variables sont définies dans `docker-compose.yml` :
- **Backend** : DB, JWT secrets
- **Frontend** : `NEXT_PUBLIC_API_URL`

Pour la production, utiliser un fichier `.env` :

```bash
docker-compose --env-file .env.production up -d
```

### Migrations

Les migrations s'exécutent automatiquement au démarrage du backend :
1. Création de la base de données
2. Création des tables

## 📦 Fichiers Ignorés

### `.dockerignore` (Backend)
- node_modules
- .env
- Logs
- Git

### `frontend/.dockerignore` (Frontend)
- node_modules
- .next
- .env.local
- Logs

## ✅ Avantages

- ✅ **Isolation** : Chaque service dans son conteneur
- ✅ **Reproductibilité** : Même environnement partout
- ✅ **Simplicité** : Un seul commande pour tout démarrer
- ✅ **Persistance** : Volumes pour données
- ✅ **Réseau** : Communication automatique entre services

## 🚀 Prochaines Étapes

1. Tests (unitaires + e2e)
2. CI/CD (GitHub Actions)

