const express = require("express");
const router = express.Router();
const {
  register,
  login,
  refresh,
  getMe,
  logout,
  updateProfile,
} = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");
const {
  registerValidation,
  loginValidation,
  updateProfileValidation,
} = require("../middleware/validation");

router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.post("/refresh", refresh);
router.get("/me", authenticate, getMe);
router.post("/logout", authenticate, logout);
router.put("/profile", authenticate, updateProfileValidation, updateProfile);

module.exports = router;

