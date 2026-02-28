import type { Request, Response, NextFunction } from "express";
import path from "path";
import { createMovie, deleteMovie, updateMovie } from "../services/movieService";

export async function createMovieController(req: Request, res: Response, next: NextFunction) {
  try {
    const body = req.body as any;
    const posterUrl =
      req.file ? `/uploads/${path.basename((req.file as any).path)}` : typeof body.posterUrl === "string" ? body.posterUrl : "";

    const rawYear = body.year != null && body.year !== "" ? Number(body.year) : NaN;
    const year = !isNaN(rawYear) ? rawYear : new Date().getFullYear();

    const movie = await createMovie({
      title: body.title,
      description: body.description,
      year,
      duration: body.duration,
      director: body.director,
      category: body.category,
      posterUrl,
    });

    return res.status(201).json({ success: true, data: movie });
  } catch (e) {
    return next(e);
  }
}

export async function updateMovieController(req: Request, res: Response, next: NextFunction) {
  try {
    const id = String((req.params as any).id);
    const body = req.body as any;
    const posterUrl =
      req.file ? `/uploads/${path.basename((req.file as any).path)}` : typeof body.posterUrl === "string" ? body.posterUrl : undefined;

    const movie = await updateMovie(id, {
      title: body.title,
      description: body.description,
      year: body.year != null && body.year !== "" ? Number(body.year) : undefined,
      duration: body.duration,
      director: body.director,
      category: body.category,
      posterUrl,
    });

    return res.json({ success: true, data: movie });
  } catch (e) {
    return next(e);
  }
}

export async function deleteMovieController(req: Request, res: Response, next: NextFunction) {
  try {
    const id = String((req.params as any).id);
    await deleteMovie(id);
    return res.json({ success: true, data: true });
  } catch (e) {
    return next(e);
  }
}

