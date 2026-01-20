const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const {
  // Favoris
  getFavorites,
  addFavorite,
  removeFavorite,
  // Watchlist
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  // Notes
  getRatings,
  addRating,
  updateRating,
  deleteRating,
  // Historique
  getHistory,
  addToHistory,
} = require("../controllers/userController");

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Favoris
router.get("/favorites", getFavorites);
router.post("/favorites/:movieId", addFavorite);
router.delete("/favorites/:movieId", removeFavorite);

// Watchlist
router.get("/watchlist", getWatchlist);
router.post("/watchlist/:movieId", addToWatchlist);
router.delete("/watchlist/:movieId", removeFromWatchlist);

// Notes
router.get("/ratings", getRatings);
router.post("/ratings/:movieId", addRating);
router.put("/ratings/:movieId", updateRating);
router.delete("/ratings/:movieId", deleteRating);

// Historique
router.get("/history", getHistory);
router.post("/history/:movieId", addToHistory);

module.exports = router;

