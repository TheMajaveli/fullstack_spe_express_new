import type { Request, Response, NextFunction } from "express";
import { getAdminStats, getAllUsers, getAnalytics } from "../services/adminService";

export async function getStatsController(_req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await getAdminStats();
    return res.json({ success: true, data: stats });
  } catch (e) {
    return next(e);
  }
}

export async function getUsersController(_req: Request, res: Response, next: NextFunction) {
  try {
    const users = await getAllUsers();
    return res.json({ success: true, data: users });
  } catch (e) {
    return next(e);
  }
}

export async function getAnalyticsController(_req: Request, res: Response, next: NextFunction) {
  try {
    const analytics = await getAnalytics();
    return res.json({ success: true, data: analytics });
  } catch (e) {
    return next(e);
  }
}
