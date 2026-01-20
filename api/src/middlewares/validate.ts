import type { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { HttpError } from "./errorHandler";

export function validate(req: Request, _res: Response, next: NextFunction) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return next(
      new HttpError(400, "Validation error", {
        code: "VALIDATION_ERROR",
        details: result.array(),
      })
    );
  }
  return next();
}

