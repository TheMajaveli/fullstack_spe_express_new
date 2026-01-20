import { body } from "express-validator";

export const registerValidator = [
  body("email").isEmail().withMessage("Invalid email"),
  body("username").isString().isLength({ min: 3, max: 50 }).withMessage("Invalid username"),
  body("password")
    .isString()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must contain an uppercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain a number"),
];

export const loginValidator = [
  body("email").isEmail().withMessage("Invalid email"),
  body("password").isString().isLength({ min: 6 }).withMessage("Invalid password"),
];

export const refreshValidator = [body("refreshToken").isString().notEmpty().withMessage("refreshToken is required")];

