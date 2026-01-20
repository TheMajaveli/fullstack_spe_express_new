import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import { validate } from "../middlewares/validate";
import { body, param } from "express-validator";
import { deleteWatchlist, getMe, postHistory, postRating, postWatchlist } from "../controllers/userController";

export const userRoutes = Router();

userRoutes.use(authenticate);

userRoutes.get("/me", getMe);

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

