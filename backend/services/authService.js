const pool = require("../config/database/db");
const { hashPassword, comparePassword } = require("../utils/bcrypt");
const { generateAccessToken, generateRefreshToken } = require("../utils/jwt");

async function registerUser(email, password, firstName = null, lastName = null) {
  const passwordHash = await hashPassword(password);
  const [result] = await pool.query(
    "INSERT INTO users (email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?)",
    [email, passwordHash, firstName, lastName]
  );
  return result.insertId;
}

async function findUserByEmail(email) {
  const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
  return rows[0] || null;
}

async function findUserById(id) {
  const [rows] = await pool.query(
    "SELECT id, email, first_name, last_name, role, created_at, updated_at FROM users WHERE id = ?",
    [id]
  );
  return rows[0] || null;
}

async function validatePassword(password, hash) {
  return await comparePassword(password, hash);
}

async function saveRefreshToken(userId, token, expiresAt) {
  await pool.query(
    "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)",
    [userId, token, expiresAt]
  );
}

async function findRefreshToken(token) {
  const [rows] = await pool.query(
    "SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > NOW()",
    [token]
  );
  return rows[0] || null;
}

async function deleteRefreshToken(token) {
  await pool.query("DELETE FROM refresh_tokens WHERE token = ?", [token]);
}

async function deleteAllUserRefreshTokens(userId) {
  await pool.query("DELETE FROM refresh_tokens WHERE user_id = ?", [userId]);
}

function createTokenPair(user) {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken({ id: user.id });
  return { accessToken, refreshToken };
}

module.exports = {
  registerUser,
  findUserByEmail,
  findUserById,
  validatePassword,
  saveRefreshToken,
  findRefreshToken,
  deleteRefreshToken,
  deleteAllUserRefreshTokens,
  createTokenPair,
};

