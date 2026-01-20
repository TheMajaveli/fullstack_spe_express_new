# Tests

## Structure

- `unit/` - Tests unitaires (contrôleurs, services, utils)
- `integration/` - Tests d'intégration (routes API)

## Exécution

### Tous les tests
```bash
npm test
```

### Mode watch
```bash
npm run test:watch
```

### Avec coverage
```bash
npm run test:coverage
```

## Configuration

- **Jest** : Framework de test
- **Supertest** : Tests HTTP pour les routes
- Configuration dans `jest.config.js`

## Notes

Les tests d'intégration nécessitent une base de données de test configurée.
Pour un environnement de test complet, utiliser Docker avec une DB de test.

