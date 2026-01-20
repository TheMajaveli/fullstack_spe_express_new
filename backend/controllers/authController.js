const { validationResult } = require("express-validator");
const authService = require("../services/authService");
const { verifyRefreshToken } = require("../utils/jwt");
const { logError } = require("../utils/logger");

async function register(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, first_name, last_name } = req.body;
    const existingUser = await authService.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const userId = await authService.registerUser(email, password, first_name, last_name);
    const user = await authService.findUserById(userId);
    const { accessToken, refreshToken } = authService.createTokenPair(user);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await authService.saveRefreshToken(userId, refreshToken, expiresAt);

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    logError("Registration error", err);
    if (!res.headersSent) {
      res.status(500).json({ message: "Registration failed" });
    }
  }
}

async function login(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const user = await authService.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValid = await authService.validatePassword(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const userData = await authService.findUserById(user.id);
    const { accessToken, refreshToken } = authService.createTokenPair(userData);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await authService.saveRefreshToken(user.id, refreshToken, expiresAt);

    res.json({
      user: {
        id: userData.id,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: userData.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    logError("Login error", err);
    if (!res.headersSent) {
      res.status(500).json({ message: "Login failed" });
    }
  }
}

async function refresh(req, res) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token required" });
    }

    const tokenData = await authService.findRefreshToken(refreshToken);
    if (!tokenData) {
      return res.status(401).json({ message: "Invalid or expired refresh token" });
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded || decoded.id !== tokenData.user_id) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const user = await authService.findUserById(tokenData.user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { accessToken, refreshToken: newRefreshToken } = authService.createTokenPair(user);

    await authService.deleteRefreshToken(refreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await authService.saveRefreshToken(user.id, newRefreshToken, expiresAt);

    res.json({
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    logError("Refresh error", err);
    if (!res.headersSent) {
      res.status(500).json({ message: "Token refresh failed" });
    }
  }
}

async function getMe(req, res) {
  try {
    const user = await authService.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at,
    });
  } catch (err) {
    logError("Get me error", err);
    if (!res.headersSent) {
      res.status(500).json({ message: "Failed to get user profile" });
    }
  }
}

async function logout(req, res) {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await authService.deleteRefreshToken(refreshToken);
    }
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    logError("Logout error", err);
    if (!res.headersSent) {
      res.status(500).json({ message: "Logout failed" });
    }
  }
}

async function updateProfile(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { first_name, last_name } = req.body;
    const pool = require("../config/database/db");

    await pool.query(
      "UPDATE users SET first_name = ?, last_name = ? WHERE id = ?",
      [first_name || null, last_name || null, req.user.id]
    );

    const user = await authService.findUserById(req.user.id);
    res.json({
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      updated_at: user.updated_at,
    });
  } catch (err) {
    logError("Update profile error", err);
    if (!res.headersSent) {
      res.status(500).json({ message: "Failed to update profile" });
    }
  }
}

module.exports = {
  register,
  login,
  refresh,
  getMe,
  logout,
  updateProfile,
};

