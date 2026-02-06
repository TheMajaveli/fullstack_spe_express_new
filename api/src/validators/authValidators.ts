import { body } from "express-validator";

export const registerValidator = [
  body("email").isEmail().withMessage("Adresse e-mail invalide"),
  body("username").isString().isLength({ min: 3, max: 50 }).withMessage("Nom d'utilisateur invalide"),
  body("password")
    .isString()
    .isLength({ min: 8 })
    .withMessage("Le mot de passe doit contenir au moins 8 caractères")
    .matches(/[A-Z]/)
    .withMessage("Le mot de passe doit contenir une lettre majuscule")
    .matches(/[0-9]/)
    .withMessage("Le mot de passe doit contenir un chiffre"),
];

export const loginValidator = [
  body("email").isEmail().withMessage("Adresse e-mail invalide"),
  body("password").isString().isLength({ min: 6 }).withMessage("Mot de passe invalide"),
];

export const refreshValidator = [body("refreshToken").isString().notEmpty().withMessage("Le jeton de rafraîchissement est requis")];

