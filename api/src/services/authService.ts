import { db } from "../database/connection";
import { HttpError } from "../middlewares/errorHandler";
import { hashPassword, verifyPassword } from "../utils/password";
import { randomToken, sha256 } from "../utils/crypto";
import { signAccessToken } from "../utils/jwt";
import { randomUUID } from "crypto";

function refreshExpiryDate() {
  const days = 7;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

export async function register(input: { email: string; username: string; password: string }) {
  const [existing] = await db.execute("SELECT id FROM users WHERE email = ?", [input.email]);
  const existingArray = existing as any[];
  if (existingArray.length > 0) {
    throw new HttpError(409, "Adresse e-mail déjà utilisée", { code: "EMAIL_TAKEN" });
  }

  const passwordHash = await hashPassword(input.password);
  const userId = randomUUID();

  await db.execute("INSERT INTO users (id, email, username, passwordHash) VALUES (?, ?, ?, ?)", [
    userId,
    input.email,
    input.username,
    passwordHash,
  ]);

  const [userRows] = await db.execute("SELECT id, email, username, role FROM users WHERE id = ?", [userId]);
  const user = (userRows as any[])[0];

  const accessToken = signAccessToken({
    sub: user.id,
    role: user.role,
    email: user.email,
    username: user.username,
  });

  const refreshToken = randomToken(32);
  const tokenHash = sha256(refreshToken);
  const refreshId = randomUUID();
  await db.execute(
    "INSERT INTO refresh_tokens (id, tokenHash, userId, expiresAt) VALUES (?, ?, ?, ?)",
    [refreshId, tokenHash, user.id, refreshExpiryDate()]
  );

  return { user, accessToken, refreshToken };
}

export async function login(input: { email: string; password: string }) {
  const [userRows] = await db.execute(
    "SELECT id, email, username, role, passwordHash FROM users WHERE email = ?",
    [input.email]
  );
  const userArray = userRows as any[];
  if (userArray.length === 0) {
    throw new HttpError(401, "Identifiants invalides", { code: "INVALID_CREDENTIALS" });
  }

  const userRow = userArray[0];
  const ok = await verifyPassword(input.password, userRow.passwordHash);
  if (!ok) {
    throw new HttpError(401, "Identifiants invalides", { code: "INVALID_CREDENTIALS" });
  }

  const accessToken = signAccessToken({
    sub: userRow.id,
    role: userRow.role,
    email: userRow.email,
    username: userRow.username,
  });

  const refreshToken = randomToken(32);
  const tokenHash = sha256(refreshToken);
  const refreshId = randomUUID();
  await db.execute(
    "INSERT INTO refresh_tokens (id, tokenHash, userId, expiresAt) VALUES (?, ?, ?, ?)",
    [refreshId, tokenHash, userRow.id, refreshExpiryDate()]
  );

  const user = { id: userRow.id, email: userRow.email, username: userRow.username, role: userRow.role };
  return { user, accessToken, refreshToken };
}

export async function refresh(input: { refreshToken: string }) {
  const tokenHash = sha256(input.refreshToken);
  const [tokenRows] = await db.execute(
    "SELECT rt.*, u.id as userId, u.email, u.username, u.role FROM refresh_tokens rt JOIN users u ON rt.userId = u.id WHERE rt.tokenHash = ?",
    [tokenHash]
  );
  const tokenArray = tokenRows as any[];
  if (tokenArray.length === 0) {
    throw new HttpError(401, "Jeton de rafraîchissement invalide", { code: "INVALID_REFRESH" });
  }

  const stored = tokenArray[0];
  const expiresAt = new Date(stored.expiresAt);
  if (expiresAt.getTime() < Date.now()) {
    await db.execute("DELETE FROM refresh_tokens WHERE tokenHash = ?", [tokenHash]).catch(() => {});
    throw new HttpError(401, "Jeton de rafraîchissement expiré", { code: "REFRESH_EXPIRED" });
  }

  const accessToken = signAccessToken({
    sub: stored.userId,
    role: stored.role,
    email: stored.email,
    username: stored.username,
  });

  return { accessToken };
}

export async function logout(input: { refreshToken: string }) {
  const tokenHash = sha256(input.refreshToken);
  await db.execute("DELETE FROM refresh_tokens WHERE tokenHash = ?", [tokenHash]).catch(() => {});
  return { ok: true };
}

export async function forgotPassword(input: { email: string }) {
  const [userRows] = await db.execute("SELECT id, email FROM users WHERE email = ?", [input.email]);
  const userArray = userRows as any[];
  
  // Always return success to avoid email enumeration
  if (userArray.length === 0) {
    return { ok: true };
  }

  const user = userArray[0];
  const resetToken = randomToken(32);
  const tokenHash = sha256(resetToken);
  const resetId = randomUUID();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Delete old reset tokens for this user
  await db.execute("DELETE FROM password_reset_tokens WHERE userId = ?", [user.id]);

  // Create new reset token
  await db.execute(
    "INSERT INTO password_reset_tokens (id, tokenHash, userId, expiresAt) VALUES (?, ?, ?, ?)",
    [resetId, tokenHash, user.id, expiresAt]
  );

  // TODO: Send email with reset link containing resetToken
  // For now, log it (in production, use email service)
  console.log(`Password reset token for ${user.email}: ${resetToken}`);
  console.log(`Reset link: http://localhost:5173/auth/reset-password?token=${resetToken}`);

  return { ok: true };
}

export async function resetPassword(input: { token: string; newPassword: string }) {
  const tokenHash = sha256(input.token);
  const [tokenRows] = await db.execute(
    "SELECT * FROM password_reset_tokens WHERE tokenHash = ?",
    [tokenHash]
  );
  const tokenArray = tokenRows as any[];
  
  if (tokenArray.length === 0) {
    throw new HttpError(401, "Jeton de réinitialisation invalide", { code: "INVALID_RESET_TOKEN" });
  }

  const stored = tokenArray[0];
  const expiresAt = new Date(stored.expiresAt);
  if (expiresAt.getTime() < Date.now()) {
    await db.execute("DELETE FROM password_reset_tokens WHERE tokenHash = ?", [tokenHash]);
    throw new HttpError(401, "Jeton de réinitialisation expiré", { code: "RESET_TOKEN_EXPIRED" });
  }

  // Update password
  const passwordHash = await hashPassword(input.newPassword);
  await db.execute("UPDATE users SET passwordHash = ? WHERE id = ?", [passwordHash, stored.userId]);

  // Delete used reset token
  await db.execute("DELETE FROM password_reset_tokens WHERE tokenHash = ?", [tokenHash]);

  // Delete all refresh tokens for this user (force re-login)
  await db.execute("DELETE FROM refresh_tokens WHERE userId = ?", [stored.userId]);

  return { ok: true };
}

export async function updatePassword(input: { userId: string; currentPassword: string; newPassword: string }) {
  const [userRows] = await db.execute(
    "SELECT passwordHash FROM users WHERE id = ?",
    [input.userId]
  );
  const userArray = userRows as any[];
  
  if (userArray.length === 0) {
    throw new HttpError(404, "Utilisateur non trouvé", { code: "USER_NOT_FOUND" });
  }

  const user = userArray[0];
  const isValid = await verifyPassword(input.currentPassword, user.passwordHash);
  
  if (!isValid) {
    throw new HttpError(401, "Mot de passe actuel incorrect", { code: "INVALID_PASSWORD" });
  }

  // Update password
  const passwordHash = await hashPassword(input.newPassword);
  await db.execute("UPDATE users SET passwordHash = ? WHERE id = ?", [passwordHash, input.userId]);

  // Delete all refresh tokens except current session (optional: force re-login on all devices)
  // For now, we'll keep sessions active
  
  return { ok: true };
}
