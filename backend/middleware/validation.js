const { body } = require("express-validator");

const registerValidation = [
  body("email")
    .isEmail()
    .withMessage("Must be a valid email")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage("Password must contain at least one uppercase, one lowercase, one number and one special character"),
  body("first_name")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("First name must be less than 100 characters"),
  body("last_name")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Last name must be less than 100 characters"),
];

const loginValidation = [
  body("email")
    .isEmail()
    .withMessage("Must be a valid email")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];

const updateProfileValidation = [
  body("first_name")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("First name must be less than 100 characters"),
  body("last_name")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Last name must be less than 100 characters"),
];

module.exports = {
  registerValidation,
  loginValidation,
  updateProfileValidation,
};

