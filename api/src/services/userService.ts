import { db } from "../database/connection";
import { HttpError } from "../middlewares/errorHandler";

export async function getUserProfile(userId: string) {
  const [userRows] = await db.execute("SELECT id, email, username, role FROM users WHERE id = ?", [userId]);
  const userArray = userRows as any[];
  if (userArray.length === 0) {
    throw new HttpError(404, "Utilisateur non trouvé", { code: "NOT_FOUND" });
  }

  const user = userArray[0];

  const [watchlistRows] = await db.execute(
    "SELECT movieId FROM watchlist WHERE userId = ? ORDER BY createdAt DESC",
    [userId]
  );
  const [historyRows] = await db.execute("SELECT movieId FROM history WHERE userId = ? ORDER BY seenAt DESC", [userId]);
  const [ratingsRows] = await db.execute("SELECT movieId, ratingNumber FROM ratings WHERE userId = ?", [userId]);

  const ratingsMap: Record<string, number> = {};
  for (const r of ratingsRows as any[]) {
    ratingsMap[r.movieId] = r.ratingNumber;
  }

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role === "ADMIN" ? "admin" : "user",
    watchlist: (watchlistRows as any[]).map((w) => w.movieId),
    history: (historyRows as any[]).map((h) => h.movieId),
    ratings: ratingsMap,
  };
}

export async function addToWatchlist(userId: string, movieId: string) {
  const [movieRows] = await db.execute("SELECT id FROM movies WHERE id = ?", [movieId]);
  if ((movieRows as any[]).length === 0) {
    throw new HttpError(404, "Film non trouvé", { code: "NOT_FOUND" });
  }

  await db.execute("INSERT IGNORE INTO watchlist (userId, movieId) VALUES (?, ?)", [userId, movieId]);
  return getUserProfile(userId);
}

export async function removeFromWatchlist(userId: string, movieId: string) {
  await db.execute("DELETE FROM watchlist WHERE userId = ? AND movieId = ?", [userId, movieId]).catch(() => {});
  return getUserProfile(userId);
}

export async function addRating(userId: string, movieId: string, ratingNumber: number, note?: string) {
  if (ratingNumber < 0 || ratingNumber > 10) {
    throw new HttpError(400, "La note doit être comprise entre 0 et 10", { code: "VALIDATION_ERROR" });
  }

  const [movieRows] = await db.execute("SELECT id FROM movies WHERE id = ?", [movieId]);
  if ((movieRows as any[]).length === 0) {
    throw new HttpError(404, "Film non trouvé", { code: "NOT_FOUND" });
  }

  await db.execute(
    "INSERT INTO ratings (userId, movieId, ratingNumber, note) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE ratingNumber = ?, note = ?",
    [userId, movieId, ratingNumber, note || null, ratingNumber, note || null]
  );

  // Update movie avg
  const [aggRows] = await db.execute("SELECT AVG(ratingNumber) as avgRating FROM ratings WHERE movieId = ?", [movieId]);
  const avgRating = (aggRows as any[])[0].avgRating ?? 0;
  await db.execute("UPDATE movies SET ratingAvg = ? WHERE id = ?", [avgRating, movieId]);

  return getUserProfile(userId);
}

export async function addHistory(userId: string, movieId: string) {
  const [movieRows] = await db.execute("SELECT id FROM movies WHERE id = ?", [movieId]);
  if ((movieRows as any[]).length === 0) {
    throw new HttpError(404, "Film non trouvé", { code: "NOT_FOUND" });
  }

  await db.execute(
    "INSERT INTO history (userId, movieId, seenAt) VALUES (?, ?, NOW()) ON DUPLICATE KEY UPDATE seenAt = NOW()",
    [userId, movieId]
  );
  return getUserProfile(userId);
}
