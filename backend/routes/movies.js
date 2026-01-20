const express = require("express");
const router = express.Router();
const {
  getAllMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
  getMoviesByCategory,
} = require("../controllers/movieController");
const { authenticate } = require("../middleware/auth");
const { requireAdmin } = require("../middleware/roles");
const upload = require("../middleware/upload");

// Routes publiques
router.get("/", getAllMovies);
router.get("/:id", getMovieById);

// Routes admin (authentification + admin requis)
router.post("/", authenticate, requireAdmin, upload.single("image"), createMovie);
router.put("/:id", authenticate, requireAdmin, upload.single("image"), updateMovie);
router.delete("/:id", authenticate, requireAdmin, deleteMovie);

module.exports = router;

