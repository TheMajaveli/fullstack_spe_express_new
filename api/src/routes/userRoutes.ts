import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import { validate } from "../middlewares/validate";
import { body, param, query } from "express-validator";
import { deleteWatchlist, getMe, getRecommendations, postHistory, postRating, postWatchlist } from "../controllers/userController";
import { RECOMMENDATION_MOODS } from "../services/recommendationMoods";

export const userRoutes = Router();

userRoutes.use(authenticate);

userRoutes.get("/me", getMe);
userRoutes.get(
  "/recommendations",
  query("mood").optional().isIn([...RECOMMENDATION_MOODS]).withMessage("mood invalide"),
  query("lang").optional().isIn(["en", "fr"]).withMessage("lang invalide"),
  query("limit").optional().isInt({ min: 1, max: 10 }).withMessage("limit invalide"),
  validate,
  getRecommendations
);

userRoutes.post(
  "/watchlist/:movieId",
  param("movieId").isString().notEmpty(),
  validate,
  postWatchlist
);
userRoutes.delete(
  "/watchlist/:movieId",
  param("movieId").isString().notEmpty(),
  validate,
  deleteWatchlist
);

userRoutes.post(
  "/ratings/:movieId",
  param("movieId").isString().notEmpty(),
  body("ratingNumber").isInt({ min: 0, max: 10 }),
  body("note").optional().isString(),
  validate,
  postRating
);

userRoutes.post(
  "/history/:movieId",
  param("movieId").isString().notEmpty(),
  validate,
  postHistory
);

