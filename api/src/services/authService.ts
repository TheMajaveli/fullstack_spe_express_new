import { prisma } from "../prisma/client";
import { HttpError } from "../middlewares/errorHandler";
import { hashPassword, verifyPassword } from "../utils/password";
import { randomToken, sha256 } from "../utils/crypto";
import { signAccessToken } from "../utils/jwt";

function refreshExpiryDate() {
  const days = 7;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

export async function register(input: { email: string; username: string; password: string }) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new HttpError(409, "Email already in use", { code: "EMAIL_TAKEN" });

  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: {
      email: input.email,
      username: input.username,
      passwordHash,
    },
    select: { id: true, email: true, username: true, role: true },
  });

  const accessToken = signAccessToken({
    sub: user.id,
    role: user.role,
    email: user.email,
    username: user.username,
  });

  const refreshToken = randomToken(32);
  const tokenHash = sha256(refreshToken);
  await prisma.refreshToken.create({
    data: {
      tokenHash,
      userId: user.id,
      expiresAt: refreshExpiryDate(),
    },
  });

  return { user, accessToken, refreshToken };
}

export async function login(input: { email: string; password: string }) {
  const userRow = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true, email: true, username: true, role: true, passwordHash: true },
  });
  if (!userRow) throw new HttpError(401, "Invalid credentials", { code: "INVALID_CREDENTIALS" });

  const ok = await verifyPassword(input.password, userRow.passwordHash);
  if (!ok) throw new HttpError(401, "Invalid credentials", { code: "INVALID_CREDENTIALS" });

  const accessToken = signAccessToken({
    sub: userRow.id,
    role: userRow.role,
    email: userRow.email,
    username: userRow.username,
  });

  const refreshToken = randomToken(32);
  const tokenHash = sha256(refreshToken);
  await prisma.refreshToken.create({
    data: {
      tokenHash,
      userId: userRow.id,
      expiresAt: refreshExpiryDate(),
    },
  });

  const user = { id: userRow.id, email: userRow.email, username: userRow.username, role: userRow.role };
  return { user, accessToken, refreshToken };
}

export async function refresh(input: { refreshToken: string }) {
  const tokenHash = sha256(input.refreshToken);
  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: { select: { id: true, email: true, username: true, role: true } } },
  });
  if (!stored) throw new HttpError(401, "Invalid refresh token", { code: "INVALID_REFRESH" });
  if (stored.expiresAt.getTime() < Date.now()) {
    await prisma.refreshToken.delete({ where: { tokenHash } }).catch(() => {});
    throw new HttpError(401, "Refresh token expired", { code: "REFRESH_EXPIRED" });
  }

  const accessToken = signAccessToken({
    sub: stored.user.id,
    role: stored.user.role,
    email: stored.user.email,
    username: stored.user.username,
  });

  return { accessToken };
}

export async function logout(input: { refreshToken: string }) {
  const tokenHash = sha256(input.refreshToken);
  await prisma.refreshToken.delete({ where: { tokenHash } }).catch(() => {});
  return { ok: true };
}

