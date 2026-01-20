import type { Request, Response, NextFunction } from "express";
import { register, login, refresh, logout } from "../services/authService";
import type { AuthedRequest } from "../middlewares/authenticate";
import { getUserProfile } from "../services/userService";

export async function registerController(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, username, password } = req.body as { email: string; username: string; password: string };
    const result = await register({ email, username, password });
    return res.status(201).json({ success: true, data: result });
  } catch (e) {
    return next(e);
  }
}

export async function loginController(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const result = await login({ email, password });
    return res.json({ success: true, data: result });
  } catch (e) {
    return next(e);
  }
}

export async function refreshController(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body as { refreshToken: string };
    const result = await refresh({ refreshToken });
    return res.json({ success: true, data: result });
  } catch (e) {
    return next(e);
  }
}

export async function logoutController(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body as { refreshToken: string };
    const result = await logout({ refreshToken });
    return res.json({ success: true, data: result });
  } catch (e) {
    return next(e);
  }
}

export async function meController(req: AuthedRequest, res: Response) {
  const profile = await getUserProfile(req.auth!.userId);
  return res.json({ success: true, data: profile });
}

