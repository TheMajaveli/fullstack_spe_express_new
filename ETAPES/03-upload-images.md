# Étape 3 : Upload de Fichiers (Images)

## 🎯 Objectif

Permettre l'upload d'images/posters pour les films dans le back-office admin.

## 📝 Implémentation

### Middleware `upload.js`

Configuration de **multer** pour gérer les uploads :
- **Destination** : Dossier `uploads/` (créé automatiquement)
- **Nom de fichier** : Timestamp + nom original (évite les collisions)
- **Filtre** : Uniquement images (jpeg, jpg, png, gif, webp)
- **Limite** : 5MB maximum par fichier

### Modifications dans `movieController.js`

#### `createMovie()`
- Gère l'upload d'image si présent dans `req.file`
- Enregistre le chemin dans `movie_images`
- Première image = image primaire par défaut
- Nettoyage automatique en cas d'erreur

#### `updateMovie()`
- Permet d'ajouter une nouvelle image
- Si aucune image primaire n'existe, la nouvelle devient primaire

#### `getMovieById()`
- Récupère toutes les images associées au film
- Retourne les chemins relatifs pour le frontend (`/uploads/filename`)

### Routes Modifiées

Les routes POST et PUT des films utilisent maintenant :
- `authenticate` : Vérification JWT
- `requireAdmin` : Vérification rôle admin
- `upload.single("image")` : Middleware multer pour un seul fichier

### Service de Fichiers Statiques

Dans `index.js`, ajout de :
```javascript
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
```

Permet d'accéder aux images via : `http://localhost:3000/uploads/filename.jpg`

## 📤 Utilisation API

### Créer un film avec image

```bash
POST /movies
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

Form data:
- title: "Matrix"
- director: "Wachowski"
- release_year: 1999
- rating: 8.7
- category_id: 1
- image: [fichier image]
```

### Réponse

```json
{
  "id": 1,
  "title": "Matrix",
  "director": "Wachowski",
  "release_year": 1999,
  "rating": 8.7,
  "category_id": 1,
  "category": "Action",
  "images": [
    {
      "id": 1,
      "path": "/uploads/matrix-1234567890.jpg",
      "isPrimary": true
    }
  ]
}
```

## 🔒 Sécurité

- ✅ Vérification du type MIME
- ✅ Limite de taille (5MB)
- ✅ Extension de fichier validée
- ✅ Nettoyage automatique en cas d'erreur
- ✅ Accès admin uniquement

## 📁 Structure

```
uploads/
├── matrix-1234567890.jpg
├── inception-1234567891.png
└── ...
```

Les fichiers sont stockés avec un nom unique pour éviter les collisions.

