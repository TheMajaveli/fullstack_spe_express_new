import type { Request, Response, NextFunction } from "express";
import { getMovie, listMovies } from "../services/movieService";

export async function listMoviesController(req: Request, res: Response, next: NextFunction) {
  try {
    const q = typeof req.query.q === "string" ? req.query.q : undefined;
    const category = typeof req.query.category === "string" ? req.query.category : undefined;
    const sortRaw = typeof req.query.sort === "string" ? req.query.sort : undefined;
    const sort = sortRaw === "newest" || sortRaw === "rating" || sortRaw === "title" ? sortRaw : undefined;
    const page = typeof req.query.page === "string" ? Number(req.query.page) : undefined;
    const rating = typeof req.query.rating === "string" ? Number(req.query.rating) : undefined;
    let limit: number | undefined;
    const rawLimit = req.query.limit;
    const limitStr = Array.isArray(rawLimit) ? rawLimit[0] : rawLimit;
    if (typeof limitStr === "string") {
      const n = parseInt(limitStr, 10);
      if (Number.isFinite(n) && n >= 1 && n <= 50) limit = n;
    }
    if (limit === undefined && req.originalUrl) {
      const match = req.originalUrl.match(/[?&]limit=(\d+)/);
      if (match) {
        const n = parseInt(match[1], 10);
        if (Number.isFinite(n) && n >= 1 && n <= 50) limit = n;
      }
    }

    const data = await listMovies({
      q,
      category,
      sort,
      page: Number.isFinite(page) ? page : undefined,
      rating: Number.isFinite(rating) ? rating : undefined,
      limit,
    });

    res.setHeader("X-Catalog-Limit", String(data.data.length));
    return res.json({ success: true, data });
  } catch (e) {
    return next(e);
  }
}

export async function getMovieController(req: Request, res: Response, next: NextFunction) {
  try {
    const movie = await getMovie(String((req.params as any).id));
    return res.json({ success: true, data: movie });
  } catch (e) {
    return next(e);
  }
}

