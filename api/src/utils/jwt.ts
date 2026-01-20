import jwt from "jsonwebtoken";

export type AccessTokenPayload = {
  sub: string; // userId
  role: "USER" | "ADMIN";
  email: string;
  username: string;
};

export function signAccessToken(payload: AccessTokenPayload) {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) throw new Error("JWT_ACCESS_SECRET is not set");
  const expiresIn = (process.env.JWT_ACCESS_EXPIRES_IN || "15m") as unknown as jwt.SignOptions["expiresIn"];
  return jwt.sign(payload, secret, { expiresIn });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) throw new Error("JWT_ACCESS_SECRET is not set");
  return jwt.verify(token, secret) as AccessTokenPayload;
}

