import { Router } from "express";
import { query } from "express-validator";
import { getMovieController, listMoviesController } from "../controllers/movieController";
import { authenticate } from "../middlewares/authenticate";
import { requireRole } from "../middlewares/requireRole";
import { upload } from "../middlewares/upload";
import { validate } from "../middlewares/validate";
import { createMovieController, deleteMovieController, updateMovieController } from "../controllers/adminMovieController";

export const movieRoutes = Router();

const movieListValidators = [
  query("q").optional().isString().trim().isLength({ max: 200 }).withMessage("Requête de recherche trop longue"),
  query("category").optional().isString().trim(),
  query("rating").optional().isNumeric().withMessage("La note doit être un nombre"),
  query("sort").optional().isIn(["newest", "rating", "title"]).withMessage("Option de tri invalide"),
  query("page").optional().isInt({ min: 1 }).withMessage("Le numéro de page doit être un entier positif"),
  query("limit").optional().isString().withMessage("La limite doit être une chaîne").trim(),
];

movieRoutes.get("/", movieListValidators, validate, listMoviesController);
movieRoutes.get("/:id", getMovieController);

// Admin CRUD + poster upload (multipart/form-data supported via `poster` file field)
movieRoutes.post("/", authenticate, requireRole("ADMIN"), upload.single("poster"), createMovieController);
movieRoutes.put("/:id", authenticate, requireRole("ADMIN"), upload.single("poster"), updateMovieController);
movieRoutes.delete("/:id", authenticate, requireRole("ADMIN"), deleteMovieController);

