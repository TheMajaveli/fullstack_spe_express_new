import { Router } from "express";
import { getMovieController, listMoviesController } from "../controllers/movieController";

export const movieRoutes = Router();

movieRoutes.get("/", listMoviesController);
movieRoutes.get("/:id", getMovieController);

