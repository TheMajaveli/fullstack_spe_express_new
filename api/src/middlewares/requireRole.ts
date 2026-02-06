import type { NextFunction, Response } from "express";
import { HttpError } from "./errorHandler";
import type { AuthedRequest } from "./authenticate";

export function requireRole(...roles: Array<"USER" | "ADMIN">) {
  return (req: AuthedRequest, _res: Response, next: NextFunction) => {
    const role = req.auth?.role;
    if (!role || !roles.includes(role)) {
      return next(new HttpError(403, "Accès interdit", { code: "FORBIDDEN" }));
    }
    return next();
  };
}

