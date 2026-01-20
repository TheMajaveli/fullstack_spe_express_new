import { Router } from "express";
import { body, param } from "express-validator";
import {
  createCategoryController,
  deleteCategoryController,
  listCategoriesController,
  updateCategoryController,
} from "../controllers/categoryController";
import { authenticate } from "../middlewares/authenticate";
import { requireRole } from "../middlewares/requireRole";
import { validate } from "../middlewares/validate";

export const categoryRoutes = Router();

categoryRoutes.get("/", listCategoriesController);

categoryRoutes.post(
  "/",
  authenticate,
  requireRole("ADMIN"),
  body("name").isString().notEmpty(),
  validate,
  createCategoryController
);

categoryRoutes.put(
  "/:id",
  authenticate,
  requireRole("ADMIN"),
  param("id").isString().notEmpty(),
  body("name").isString().notEmpty(),
  validate,
  updateCategoryController
);

categoryRoutes.delete(
  "/:id",
  authenticate,
  requireRole("ADMIN"),
  param("id").isString().notEmpty(),
  validate,
  deleteCategoryController
);

