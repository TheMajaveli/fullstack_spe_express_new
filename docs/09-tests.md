# Tests — Unitaires, E2E et CI

Le projet dispose de tests unitaires sur l’API (Jest + Supertest) et de tests E2E (Playwright). Les deux sont intégrés à la CI GitHub Actions.

## Tests unitaires API (Jest + Supertest)

- **Emplacement** : `api/tests/`.
- **Lancer** : `cd api && npm test`.
- **Couverture** : `npm run test:coverage` (si configuré).
- **Mode watch** : `npm run test:watch` pour relancer à chaque modification.

### Suites de tests

| Fichier | Contenu |
|---------|--------|
| `auth.test.ts` | Inscription, connexion, refresh token, validation des champs. |
| `movies.test.ts` | Liste films (paramètres de requête, pagination), détail, validation (ex. limit 1–50). |
| `user.test.ts` | Watchlist (ajout/suppression), notation, historique (routes protégées avec JWT). |
| `categories.test.ts` | CRUD catégories (création, mise à jour, suppression, liste). |
| `admin.test.ts` | Opérations admin (films, accès réservé au rôle ADMIN). |

La base de données est **mockée** (`api/tests/__mocks__/mysqlClient.ts`) pour que les tests ne dépendent pas d’un MySQL réel. Les contrôleurs et services s’exécutent avec ces mocks.

## Tests E2E (Playwright)

- **Emplacement** : `e2e/tests/*.spec.ts`.
- **Lancer** : `cd e2e && npm install && npm test` (après avoir lancé l’API et le frontend, ou laisser la CI les démarrer).

### Scénarios

- **public.spec.ts** : catalogue (chargement, recherche, filtre par catégorie, tri, navigation vers le détail d’un film).
- **auth.spec.ts** : inscription, connexion, déconnexion (ou flux équivalent).
- **member.spec.ts** : parcours membre (watchlist, compte, etc.) après connexion.
- **admin.spec.ts** : accès admin, gestion des films ou catégories.

Les tests E2E utilisent une base de test (MySQL) et des données de seed pour avoir un environnement reproductible.

## CI (GitHub Actions)

- **Fichier** : `.github/workflows/ci.yml`.
- **Déclenchement** : sur push et pull request vers les branches `main` et `dev`.

**Jobs :**

1. **test-api** : MySQL en service, création de la base de test, exécution des migrations (schéma), puis `npm test` dans `api/`.
2. **build-api** : `npm run build` dans `api/`.
3. **build-frontend** : `npm run build` dans `frontend/`.
4. **e2e** : après les jobs ci-dessus — démarrage MySQL, seed, lancement de l’API et du frontend (preview), installation de Playwright (Chromium), exécution des tests E2E. En cas d’échec, le rapport Playwright peut être publié en artefact.

Ainsi, toute modification poussée sur `main` ou `dev` déclenche les tests unitaires API et les tests E2E (avec MySQL aligné sur le schéma du projet).
