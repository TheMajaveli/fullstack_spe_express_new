# Étape 11 : CI/CD avec GitHub Actions

## 🎯 Objectif

Configurer un pipeline CI/CD pour :
- Exécution automatique des tests
- Vérification de la qualité du code
- Build et validation

## 📝 Configuration

### `.github/workflows/ci.yml`

**Déclencheurs** :
- Push sur `main` ou `dev`
- Pull requests vers `main` ou `dev`

**Jobs** :

#### 1. Test

**Services** :
- MySQL 8.0 en conteneur
- Configuration pour tests
- Healthcheck configuré

**Steps** :
1. Checkout du code
2. Setup Node.js 18 avec cache npm
3. Installation dépendances (`npm ci`)
4. Exécution migrations
5. Exécution tests
6. Génération rapport coverage

**Variables d'environnement** :
- Configuration DB de test
- Secrets JWT pour tests

#### 2. Lint

**Steps** :
1. Checkout
2. Setup Node.js
3. Installation dépendances
4. Exécution linter (à configurer)

#### 3. Build

**Steps** :
1. Checkout
2. Setup Node.js
3. Installation dépendances
4. Vérification build

## 🔄 Workflow

```
Push/PR → Checkout → Setup → Install → Migrate → Test → Coverage
                ↓
            Lint Check
                ↓
            Build Check
```

## 📊 Rapports

### Coverage
Le rapport de coverage est généré après chaque exécution de tests.

### Status Checks
Les checks apparaissent sur :
- Pull requests
- Commits
- Branches

## 🚀 Déploiement (Optionnel)

Pour ajouter le déploiement automatique :

```yaml
deploy:
  needs: [test, lint, build]
  runs-on: ubuntu-latest
  if: github.ref == 'refs/heads/main'
  steps:
    - name: Deploy
      run: |
        # Commandes de déploiement
```

## ✅ Avantages

- ✅ **Tests automatiques** : À chaque push/PR
- ✅ **Détection précoce** : Erreurs trouvées rapidement
- ✅ **Qualité** : Standards maintenus
- ✅ **Confiance** : Code validé avant merge

## 🔧 Personnalisation

### Ajouter des tests E2E

```yaml
e2e:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
    - name: Run E2E tests
      run: npm run test:e2e
```

### Ajouter un linter

```yaml
- name: Run ESLint
  run: npx eslint .
```

### Notification

Ajouter des notifications (Slack, Discord, etc.) après les tests.

## 🚀 Prochaines Étapes

1. Configurer un linter (ESLint)
2. Ajouter tests E2E
3. Configurer déploiement automatique

