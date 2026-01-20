import { Router } from "express";
import {
  loginController,
  logoutController,
  meController,
  refreshController,
  registerController,
} from "../controllers/authController";
import { authenticate } from "../middlewares/authenticate";
import { validate } from "../middlewares/validate";
import { loginValidator, refreshValidator, registerValidator } from "../validators/authValidators";

export const authRoutes = Router();

authRoutes.post("/register", registerValidator, validate, registerController);
authRoutes.post("/login", loginValidator, validate, loginController);
authRoutes.post("/refresh", refreshValidator, validate, refreshController);
authRoutes.post("/logout", refreshValidator, validate, logoutController);
authRoutes.get("/me", authenticate, meController);

