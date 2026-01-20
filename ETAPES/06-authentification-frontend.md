# Étape 6 : Authentification Frontend

## 🎯 Objectif

Implémenter l'authentification complète côté frontend :
- Page de connexion avec validations
- Page d'inscription avec validations fortes
- Gestion de la session (JWT)
- Navbar avec état utilisateur
- Protection des routes

## 📝 Pages Créées

### Page de Connexion (`app/auth/login/page.tsx`)

**Fonctionnalités** :
- ✅ Formulaire email + mot de passe
- ✅ Validations côté client :
  - Email requis et format valide
  - Mot de passe requis (min 6 caractères)
- ✅ Gestion des erreurs (affichage toast)
- ✅ État de chargement
- ✅ Redirection après connexion réussie
- ✅ Lien vers inscription

**Validations** :
- Email : format valide (regex)
- Mot de passe : minimum 6 caractères

### Page d'Inscription (`app/auth/register/page.tsx`)

**Fonctionnalités** :
- ✅ Formulaire complet :
  - Email (requis)
  - Prénom (optionnel)
  - Nom (optionnel)
  - Mot de passe (requis)
  - Confirmation mot de passe (requis)
- ✅ **Validations fortes** :
  - Email : format valide
  - Mot de passe : 
    - Minimum 8 caractères
    - Au moins une majuscule
    - Au moins une minuscule
    - Au moins un chiffre
  - Confirmation : doit correspondre au mot de passe
  - Prénom/Nom : si renseignés, minimum 2 caractères
- ✅ Messages d'erreur clairs
- ✅ Aide contextuelle (exigences mot de passe)
- ✅ Gestion des erreurs serveur
- ✅ Redirection après inscription réussie

**Exigences Mot de Passe** :
- 8 caractères minimum
- 1 majuscule
- 1 minuscule
- 1 chiffre

## 🧩 Composants Créés

### `components/Navbar.tsx`

**Fonctionnalités** :
- ✅ Affichage conditionnel selon l'état d'authentification
- ✅ Liens de navigation :
  - Accueil (toujours visible)
  - Mes Favoris (si connecté)
  - Ma Watchlist (si connecté)
  - Admin (si admin)
- ✅ Affichage du nom/prénom utilisateur
- ✅ Bouton de déconnexion
- ✅ Boutons connexion/inscription si non connecté
- ✅ Indicateur de chargement
- ✅ Highlight de la page active

**Gestion de Session** :
- Récupération du profil au chargement
- Déconnexion automatique si token invalide
- Rafraîchissement après actions d'auth

## 🔐 Gestion de l'Authentification

### Stockage des Tokens

Les tokens sont stockés dans des **cookies** :
- `accessToken` : 15 minutes (expire rapidement)
- `refreshToken` : 7 jours (longue durée)

### Refresh Automatique

L'intercepteur axios (`lib/api.ts`) :
- Détecte les erreurs 401
- Tente automatiquement de rafraîchir le token
- Réessaie la requête originale
- Redirige vers login si le refresh échoue

### Protection des Routes

À implémenter avec un middleware Next.js ou HOC pour :
- Vérifier l'authentification
- Rediriger vers `/auth/login` si non connecté
- Vérifier les rôles (admin)

## 🎨 UX/UI

- **Design cohérent** : Utilisation des composants UI existants
- **Feedback visuel** : Toasts pour succès/erreur
- **États de chargement** : Boutons avec spinner
- **Validation en temps réel** : Erreurs affichées au changement
- **Messages clairs** : Aide contextuelle pour les validations

## ✅ Tests Recommandés

- [ ] Connexion avec identifiants valides
- [ ] Connexion avec identifiants invalides
- [ ] Inscription avec données valides
- [ ] Inscription avec mot de passe faible (doit échouer)
- [ ] Inscription avec confirmation incorrecte
- [ ] Déconnexion
- [ ] Refresh automatique du token
- [ ] Navigation après connexion/inscription
- [ ] Navbar affiche correctement l'état utilisateur

## 🚀 Prochaines Étapes

1. Créer un middleware de protection des routes
2. Créer l'espace membre (pages favoris, watchlist, notes, historique)
3. Ajouter les actions utilisateur sur la page détail (favori, watchlist, noter)
4. Créer le back-office admin

