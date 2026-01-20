# Étape 8 : Back-Office Admin

## 🎯 Objectif

Créer le back-office admin complet pour gérer les films :
- Liste des films
- Création avec upload d'image
- Modification avec upload optionnel
- Suppression avec confirmation

## 📝 Pages Créées

### Page Liste Films (`app/admin/movies/page.tsx`)

**Fonctionnalités** :
- ✅ Liste de tous les films
- ✅ Vérification rôle admin (redirection si non admin)
- ✅ Bouton "Nouveau Film"
- ✅ Actions : Modifier / Supprimer
- ✅ Suppression avec confirmation
- ✅ Affichage des informations essentielles
- ✅ Pagination

**Sécurité** :
- Vérification authentification
- Vérification rôle admin
- Redirection si non autorisé

### Page Création (`app/admin/movies/new/page.tsx`)

**Fonctionnalités** :
- ✅ Formulaire complet :
  - Titre (requis)
  - Réalisateur (requis)
  - Année (optionnel, validé)
  - Note 0-10 (optionnel, validé)
  - Catégorie (dropdown)
  - Upload image (optionnel)
- ✅ **Validations** :
  - Titre et réalisateur requis
  - Année entre 1800 et année actuelle + 10
  - Note entre 0 et 10
- ✅ Upload d'image avec preview
- ✅ Gestion erreurs
- ✅ Redirection après création

### Page Modification (`app/admin/movies/[id]/edit/page.tsx`)

**Fonctionnalités** :
- ✅ Chargement des données existantes
- ✅ Formulaire pré-rempli
- ✅ **Upload optionnel** : conserver l'image actuelle ou en uploader une nouvelle
- ✅ Preview de l'image actuelle
- ✅ Validations identiques à la création
- ✅ Gestion erreurs (404, etc.)

## 🔐 Sécurité

### Vérification Admin

Toutes les pages admin :
1. Vérifient l'authentification
2. Vérifient le rôle admin
3. Redirigent si non autorisé

```typescript
const profile = await getProfile();
if (profile.role !== "admin") {
  router.push("/");
  return;
}
```

## 📤 Upload d'Images

### Formulaire Multipart

Utilisation de `FormData` pour l'upload :
```typescript
const formDataToSend = new FormData();
formDataToSend.append("title", formData.title);
// ...
if (formData.image) {
  formDataToSend.append("image", formData.image);
}
```

### Validation Côté Client

- Types acceptés : images uniquement
- Taille max : 5MB (géré par le backend)
- Message d'aide affiché

## 🎨 UX/UI

- **Formulaires clairs** : Labels, placeholders, erreurs
- **Feedback** : Toasts pour succès/erreur
- **Confirmation** : Dialog pour suppressions
- **Preview** : Image actuelle affichée en modification
- **Navigation** : Boutons Annuler vers liste

## ✅ Tests Recommandés

- [ ] Créer un film avec image
- [ ] Créer un film sans image
- [ ] Modifier un film
- [ ] Modifier avec nouvelle image
- [ ] Modifier sans changer l'image
- [ ] Supprimer un film
- [ ] Accès non-admin (doit rediriger)
- [ ] Validations formulaire
- [ ] Gestion erreurs (404, validation)

## 🚀 Prochaines Étapes

1. Page gestion catégories (optionnel)
2. Docker
3. Tests
4. CI/CD

