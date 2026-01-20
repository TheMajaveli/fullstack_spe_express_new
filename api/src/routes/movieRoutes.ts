import { Router } from "express";
import { getMovieController, listMoviesController } from "../controllers/movieController";
import { authenticate } from "../middlewares/authenticate";
import { requireRole } from "../middlewares/requireRole";
import { upload } from "../middlewares/upload";
import { createMovieController, deleteMovieController, updateMovieController } from "../controllers/adminMovieController";

export const movieRoutes = Router();

movieRoutes.get("/", listMoviesController);
movieRoutes.get("/:id", getMovieController);

// Admin CRUD + poster upload (multipart/form-data supported via `poster` file field)
movieRoutes.post("/", authenticate, requireRole("ADMIN"), upload.single("poster"), createMovieController);
movieRoutes.put("/:id", authenticate, requireRole("ADMIN"), upload.single("poster"), updateMovieController);
movieRoutes.delete("/:id", authenticate, requireRole("ADMIN"), deleteMovieController);

