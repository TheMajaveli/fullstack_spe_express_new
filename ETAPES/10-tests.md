# Étape 10 : Tests

## 🎯 Objectif

Ajouter des tests pour garantir la qualité du code :
- Tests unitaires (contrôleurs, services, utils)
- Tests d'intégration (routes API)

## 📝 Configuration

### `jest.config.js`

**Configuration** :
- Environnement : Node.js
- Patterns de fichiers de test
- Coverage configuré
- Setup file pour variables d'environnement

### `tests/setup.js`

**Variables d'environnement de test** :
- `NODE_ENV=test`
- Secrets JWT pour tests
- Configuration isolée de la production

## 🧪 Tests Créés

### Tests Unitaires

#### `tests/unit/movieController.test.js`

**Tests pour `movieController`** :
- ✅ `getAllMovies` : Liste avec pagination
- ✅ Filtres (catégorie, recherche)
- ✅ `getMovieById` : Récupération par ID
- ✅ Gestion erreurs (404, 400)
- ✅ `createMovie` : Création avec validation

**Mocking** :
- Base de données mockée avec `jest.mock`
- Tests isolés sans dépendance DB réelle

### Tests d'Intégration

#### `tests/integration/auth.test.js`

**Tests pour routes d'authentification** :
- ✅ `POST /auth/register` : Création utilisateur
- ✅ Validation email
- ✅ Validation mot de passe
- ✅ `POST /auth/login` : Gestion erreurs

**Supertest** :
- Tests HTTP réels
- Vérification status codes
- Tests de validation

## 📊 Coverage

### Fichiers couverts
- `controllers/` - Contrôleurs métier
- `middleware/` - Middleware
- `services/` - Services
- `utils/` - Utilitaires

### Exclu du coverage
- `config/` - Configuration
- `tests/` - Fichiers de test
- `node_modules/` - Dépendances

## 🚀 Utilisation

### Exécuter tous les tests
```bash
npm test
```

### Mode watch (développement)
```bash
npm run test:watch
```

### Avec rapport de coverage
```bash
npm run test:coverage
```

## 📝 Scripts NPM

Ajoutés dans `package.json` :
- `test` : Exécution standard
- `test:watch` : Mode watch
- `test:coverage` : Avec coverage

## ✅ Bonnes Pratiques

- **Isolation** : Chaque test est indépendant
- **Mocking** : DB mockée pour tests unitaires
- **Setup/Cleanup** : `beforeEach` pour état propre
- **Assertions claires** : Vérifications explicites

## 🔄 Tests E2E (Optionnel)

Pour des tests E2E complets, utiliser :
- **Playwright** ou **Cypress**
- Tests du parcours utilisateur complet
- Tests frontend + backend

## 🚀 Prochaines Étapes

1. CI/CD (GitHub Actions)
2. Tests E2E (optionnel)

