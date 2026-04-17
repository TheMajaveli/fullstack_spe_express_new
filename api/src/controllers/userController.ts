import type { Response, NextFunction } from "express";
import type { AuthedRequest } from "../middlewares/authenticate";
import { getPersonalizedRecommendations } from "../services/recommendationService";
import { movieLangFromRequest } from "../utils/movieLangFromRequest";
import { addHistory, addRating, addToWatchlist, getUserProfile, removeFromWatchlist } from "../services/userService";

export async function getMe(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const profile = await getUserProfile(req.auth!.userId);
    return res.json({ success: true, data: profile });
  } catch (e) {
    return next(e);
  }
}

export async function postWatchlist(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const updated = await addToWatchlist(req.auth!.userId, String((req.params as any).movieId));
    return res.json({ success: true, data: updated });
  } catch (e) {
    return next(e);
  }
}

export async function deleteWatchlist(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const updated = await removeFromWatchlist(req.auth!.userId, String((req.params as any).movieId));
    return res.json({ success: true, data: updated });
  } catch (e) {
    return next(e);
  }
}

export async function postRating(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const movieId = String((req.params as any).movieId);
    const ratingNumber = Number((req.body as any).ratingNumber);
    const note = typeof (req.body as any).note === "string" ? (req.body as any).note : undefined;
    const updated = await addRating(req.auth!.userId, movieId, ratingNumber, note);
    return res.json({ success: true, data: updated });
  } catch (e) {
    return next(e);
  }
}

export async function postHistory(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const movieId = String((req.params as any).movieId);
    const updated = await addHistory(req.auth!.userId, movieId);
    return res.json({ success: true, data: updated });
  } catch (e) {
    return next(e);
  }
}

export async function getRecommendations(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const rawMood = req.query.mood;
    const mood =
      typeof rawMood === "string" ? rawMood : Array.isArray(rawMood) ? String(rawMood[0]) : undefined;
    const rawLimit = req.query.limit;
    const limit =
      rawLimit === undefined
        ? undefined
        : Array.isArray(rawLimit)
          ? rawLimit[0]
          : rawLimit;
    const lang = movieLangFromRequest(req);
    const data = await getPersonalizedRecommendations(req.auth!.userId, { mood, lang, limit });
    // Personalized JSON must not be cached (browser 304 + empty body breaks refetch / identical ETag).
    res.set({
      "Cache-Control": "private, no-store, no-cache, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    });
    res.type("application/json");
    res.end(JSON.stringify({ success: true, data }));
  } catch (e) {
    return next(e);
  }
}

