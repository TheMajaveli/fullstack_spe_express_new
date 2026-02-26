# Espace membre — Watchlist, notes, historique

L’espace membre regroupe les fonctionnalités réservées aux utilisateurs connectés : liste à voir (watchlist), notation des films et historique de visionnage.

## Page compte

- **Route** : `/account`
- **Fichier** : `frontend/pages/AccountPage.tsx`

Affiche les statistiques (nombre de films notés, moyenne, films vus, taille de la watchlist) et les listes réelles (watchlist, historique) issues de l’API.

## Watchlist (liste à voir)

- **Ajout** : `POST /user/watchlist/:movieId`
- **Suppression** : `DELETE /user/watchlist/:movieId`
- **Données** : le profil utilisateur (`GET /user/me` ou `/auth/me`) contient un tableau `watchlist` (IDs de films).

Côté front : boutons sur la page détail film et sur les cartes pour ajouter/retirer de la watchlist ; le store est mis à jour après chaque action.

## Notes (ratings)

- **Envoi** : `POST /user/ratings/:movieId` avec body `{ ratingNumber, note? }` (ratingNumber typiquement 2–10, ou 1–5 étoiles converti).
- **Affichage** : la note utilisateur et la note moyenne du film sont affichées sur la page détail ; le modal de notation est dans `frontend/components/RatingModal.tsx`.

Après envoi, la moyenne du film est recalculée côté backend et le profil utilisateur (ratings) est mis à jour.

## Historique (films vus)

- **Enregistrement** : `POST /user/history/:movieId` — marque le film comme vu pour l’utilisateur.
- **Affichage** : liste dans la page compte via le composant `HistoryList.tsx`, alimentée par le champ `history` du profil.

Sur la page détail film, un bouton « Marquer comme vu » appelle cette route puis met à jour le store.

## Données et API

- Les routes utilisateur sont protégées par le middleware d’authentification.
- Le profil complet (watchlist, ratings, history) est renvoyé par `GET /user/me` (ou équivalent selon le code) et stocké dans le store Zustand pour garder l’UI synchronisée.
