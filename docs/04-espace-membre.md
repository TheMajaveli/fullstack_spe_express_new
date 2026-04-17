# Espace membre — Watchlist, notes, historique

L’espace membre regroupe les fonctionnalités réservées aux utilisateurs connectés : liste à voir (watchlist), notation des films et historique de visionnage.

## Page compte

- **Route** : `/account`
- **Fichier** : `frontend/pages/AccountPage.tsx`

Affiche les statistiques (nombre de films notés, moyenne, films vus, taille de la watchlist) et les listes réelles (watchlist, historique) issues de l’API.

L’espace compte contient aussi la partie **recommandations** :

- **Bloc “Pour vous”** : sélection d’une **humeur** → liste de films adaptés (titres réels du catalogue).
- **Bulle assistant** (chat) : accessible dans l’interface (hors admin), humeur → attente courte → **5 films**, avec un bouton pour afficher **d’autres titres**.

## Watchlist (liste à voir)

- **Ajout** : `POST /user/watchlist/:movieId`
- **Suppression** : `DELETE /user/watchlist/:movieId`
- **Données** : le profil utilisateur (`GET /user/me` ou `/auth/me`) contient un tableau `watchlist` (IDs de films).

Côté front : boutons sur la page détail film et sur les cartes pour ajouter/retirer de la watchlist ; le store est mis à jour après chaque action.

## Notes (ratings)

- **Envoi** : `POST /user/ratings/:movieId` avec body `{ ratingNumber, note? }` (ratingNumber typiquement 2–10, ou 1–5 étoiles converti).
- **Affichage** : la note moyenne du film est affichée sur la page détail ; la **note de l’utilisateur** et son **commentaire** (si présent) sont visibles dans la section “Avis”. Le modal de notation est dans `frontend/components/RatingModal.tsx`.

Après envoi, la moyenne du film est recalculée côté backend et le profil utilisateur (ratings) est mis à jour.

## Historique (films vus)

- **Enregistrement** : `POST /user/history/:movieId` — marque le film comme vu pour l’utilisateur.
- **Affichage** : liste dans la page compte via le composant `HistoryList.tsx`, alimentée par le champ `history` du profil.

Sur la page détail film, un bouton « Marquer comme vu » appelle cette route puis met à jour le store.

Sur le **catalogue**, si un film est présent dans l’historique du membre connecté, un badge **« Vu »** apparaît sur la carte du film.

## Données et API

- Les routes utilisateur sont protégées par le middleware d’authentification.
- Le profil complet (watchlist, ratings, history, et commentaires de notes) est renvoyé par `GET /user/me` (ou `GET /auth/me` selon les écrans) et stocké dans le store Zustand pour garder l’UI synchronisée.
