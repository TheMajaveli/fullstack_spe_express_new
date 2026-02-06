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
    const limit = typeof req.query.limit === "string" ? Number(req.query.limit) : undefined;

    const data = await listMovies({
      q,
      category,
      sort,
      page: Number.isFinite(page) ? page : undefined,
      rating: Number.isFinite(rating) ? rating : undefined,
      limit: Number.isFinite(limit) ? limit : undefined,
    });

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

