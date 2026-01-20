# Étape 1 : Amélioration des Filtres Backend

## 🎯 Objectif

Améliorer l'endpoint `GET /movies` pour supporter :
- Filtres multi-critères (catégorie, note minimale, limite)
- Recherche textuelle (titre, réalisateur)
- Tri (titre, année, note)
- Pagination robuste

## 📝 Implémentation

### Modifications dans `movieController.js`

L'endpoint `getAllMovies` est amélioré pour supporter :

1. **Filtres** :
   - `category` : ID de catégorie
   - `minRating` : Note minimale (décimal)
   - `limit` : Nombre de résultats par page

2. **Recherche** :
   - `search` : Recherche dans titre et réalisateur (LIKE)

3. **Tri** :
   - `sort` : `title`, `year`, `rating`, `title_desc`, `year_desc`, `rating_desc`

4. **Pagination** :
   - `page` : Numéro de page (défaut: 1)
   - Retourne métadonnées : `total`, `page`, `limit`, `totalPages`

### Exemple de Requête

```
GET /movies?category=1&minRating=7.5&search=matrix&sort=rating_desc&page=1&limit=20
```

### Réponse

```json
{
  "data": [...],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

## 🔍 Détails Techniques

- Utilisation de requêtes SQL paramétrées (sécurité)
- Construction dynamique de la clause WHERE
- Index sur colonnes fréquemment filtrées (category_id, rating)
- Validation des paramètres d'entrée

