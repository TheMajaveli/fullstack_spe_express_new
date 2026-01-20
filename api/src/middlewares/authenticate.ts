import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { HttpError } from "./errorHandler";

export type AuthedRequest = Request & {
  auth?: {
    userId: string;
    role: "USER" | "ADMIN";
    email: string;
    username: string;
  };
};

export function authenticate(req: AuthedRequest, _res: Response, next: NextFunction) {
  const header = req.header("authorization");
  if (!header?.startsWith("Bearer ")) {
    return next(new HttpError(401, "Unauthorized", { code: "UNAUTHORIZED" }));
  }
  const token = header.slice("Bearer ".length).trim();
  try {
    const payload = verifyAccessToken(token);
    req.auth = {
      userId: payload.sub,
      role: payload.role,
      email: payload.email,
      username: payload.username,
    };
    return next();
  } catch {
    return next(new HttpError(401, "Unauthorized", { code: "UNAUTHORIZED" }));
  }
}

