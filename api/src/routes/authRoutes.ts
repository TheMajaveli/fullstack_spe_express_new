import { Router } from "express";
import {
  loginController,
  logoutController,
  meController,
  refreshController,
  registerController,
} from "../controllers/authController";
import { 
  forgotPasswordController, 
  resetPasswordController, 
  updatePasswordController 
} from "../controllers/passwordController";
import { authenticate } from "../middlewares/authenticate";
import { validate } from "../middlewares/validate";
import { loginValidator, refreshValidator, registerValidator } from "../validators/authValidators";
import { body } from "express-validator";

export const authRoutes = Router();

authRoutes.post("/register", registerValidator, validate, registerController);
authRoutes.post("/login", loginValidator, validate, loginController);
authRoutes.post("/refresh", refreshValidator, validate, refreshController);
authRoutes.post("/logout", refreshValidator, validate, logoutController);
authRoutes.get("/me", authenticate, meController);

// Password management
authRoutes.post(
  "/forgot-password",
  [body("email").isEmail().withMessage("Adresse e-mail invalide")],
  validate,
  forgotPasswordController
);

authRoutes.post(
  "/reset-password",
  [
    body("token").notEmpty().withMessage("Jeton requis"),
    body("password")
      .isLength({ min: 8 }).withMessage("Le mot de passe doit contenir au moins 8 caractères")
      .matches(/[A-Z]/).withMessage("Le mot de passe doit contenir une majuscule")
      .matches(/[0-9]/).withMessage("Le mot de passe doit contenir un chiffre"),
  ],
  validate,
  resetPasswordController
);

authRoutes.post(
  "/update-password",
  authenticate,
  [
    body("currentPassword").notEmpty().withMessage("Mot de passe actuel requis"),
    body("newPassword")
      .isLength({ min: 8 }).withMessage("Le mot de passe doit contenir au moins 8 caractères")
      .matches(/[A-Z]/).withMessage("Le mot de passe doit contenir une majuscule")
      .matches(/[0-9]/).withMessage("Le mot de passe doit contenir un chiffre"),
  ],
  validate,
  updatePasswordController
);

