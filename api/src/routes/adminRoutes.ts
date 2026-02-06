import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import { requireRole } from "../middlewares/requireRole";
import { getStatsController, getUsersController, getAnalyticsController } from "../controllers/adminController";

export const adminRoutes = Router();

adminRoutes.use(authenticate);
adminRoutes.use(requireRole("ADMIN"));

adminRoutes.get("/stats", getStatsController);
adminRoutes.get("/users", getUsersController);
adminRoutes.get("/analytics", getAnalyticsController);
