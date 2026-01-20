# Étape 4 : Création du Frontend Next.js

## 🎯 Objectif

Créer la structure de base du frontend Next.js avec :
- Configuration TypeScript
- Tailwind CSS pour le styling
- Structure de dossiers organisée
- Configuration API client
- Gestion de l'authentification

## 📝 Structure Créée

```
frontend/
├── app/                    # App Router Next.js 13+
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Page d'accueil
│   └── globals.css        # Styles globaux
├── components/             # Composants réutilisables
│   ├── ui/                # Composants UI de base
│   └── ...
├── lib/                   # Utilitaires
│   ├── api.ts             # Client API
│   ├── auth.ts            # Gestion auth
│   └── utils.ts           # Utilitaires généraux
├── public/                # Assets statiques
├── types/                 # Types TypeScript
└── .env.local             # Variables d'environnement
```

## 🔧 Configuration

### Variables d'Environnement

Créer `.env.local` :
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Client API

Le client API sera créé dans `lib/api.ts` pour :
- Gérer les appels HTTP vers le backend
- Gérer les tokens JWT automatiquement
- Gérer le refresh token
- Gérer les erreurs

### Gestion de l'Authentification

Dans `lib/auth.ts` :
- Stockage des tokens (localStorage/cookies)
- Vérification de l'authentification
- Refresh automatique des tokens
- Déconnexion

## 📦 Dépendances à Ajouter

```bash
npm install axios
npm install js-cookie
npm install @types/js-cookie
```

## ✅ Prochaines Étapes

1. Créer le client API
2. Créer les composants UI de base
3. Implémenter les pages publiques
4. Implémenter l'authentification frontend
5. Créer l'espace membre
6. Créer le back-office admin

