const express = require("express");
const router = express.Router();
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const { getMoviesByCategory } = require("../controllers/movieController");

router.get("/", getAllCategories);
router.get("/:id", getCategoryById);
router.get("/:id/movies", getMoviesByCategory);
router.post("/", createCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

module.exports = router;
