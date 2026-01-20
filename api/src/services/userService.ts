import { prisma } from "../prisma/client";
import { HttpError } from "../middlewares/errorHandler";

export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, username: true, role: true },
  });
  if (!user) throw new HttpError(404, "User not found", { code: "NOT_FOUND" });

  const [watchlist, history, ratings] = await Promise.all([
    prisma.watchlist.findMany({ where: { userId }, select: { movieId: true }, orderBy: { createdAt: "desc" } }),
    prisma.history.findMany({ where: { userId }, select: { movieId: true }, orderBy: { seenAt: "desc" } }),
    prisma.rating.findMany({ where: { userId }, select: { movieId: true, ratingNumber: true } }),
  ]);

  const ratingsMap: Record<string, number> = {};
  for (const r of ratings) ratingsMap[r.movieId] = r.ratingNumber;

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role === "ADMIN" ? "admin" : "user",
    watchlist: watchlist.map((w) => w.movieId),
    history: history.map((h) => h.movieId),
    ratings: ratingsMap,
  };
}

export async function addToWatchlist(userId: string, movieId: string) {
  await prisma.movie.findUnique({ where: { id: movieId } }).then((m) => {
    if (!m) throw new HttpError(404, "Movie not found", { code: "NOT_FOUND" });
  });
  await prisma.watchlist.upsert({
    where: { userId_movieId: { userId, movieId } },
    update: {},
    create: { userId, movieId },
  });
  return getUserProfile(userId);
}

export async function removeFromWatchlist(userId: string, movieId: string) {
  await prisma.watchlist.delete({ where: { userId_movieId: { userId, movieId } } }).catch(() => {});
  return getUserProfile(userId);
}

export async function addRating(userId: string, movieId: string, ratingNumber: number, note?: string) {
  if (ratingNumber < 0 || ratingNumber > 10) {
    throw new HttpError(400, "ratingNumber must be between 0 and 10", { code: "VALIDATION_ERROR" });
  }
  await prisma.movie.findUnique({ where: { id: movieId } }).then((m) => {
    if (!m) throw new HttpError(404, "Movie not found", { code: "NOT_FOUND" });
  });

  await prisma.rating.upsert({
    where: { userId_movieId: { userId, movieId } },
    update: { ratingNumber, note },
    create: { userId, movieId, ratingNumber, note },
  });

  // Update movie avg
  const agg = await prisma.rating.aggregate({
    where: { movieId },
    _avg: { ratingNumber: true },
  });
  await prisma.movie.update({
    where: { id: movieId },
    data: { ratingAvg: agg._avg.ratingNumber ?? 0 },
  });

  return getUserProfile(userId);
}

export async function addHistory(userId: string, movieId: string) {
  await prisma.movie.findUnique({ where: { id: movieId } }).then((m) => {
    if (!m) throw new HttpError(404, "Movie not found", { code: "NOT_FOUND" });
  });
  await prisma.history.upsert({
    where: { userId_movieId: { userId, movieId } },
    update: { seenAt: new Date() },
    create: { userId, movieId },
  });
  return getUserProfile(userId);
}

