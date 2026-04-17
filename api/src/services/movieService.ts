import { db } from "../database/connection";
import { HttpError } from "../middlewares/errorHandler";
import { randomUUID } from "crypto";

/** Titre normalisé pour comparaisons et contrainte UNIQUE (titre + année). */
export function normalizeMovieTitle(raw: string): string {
  return String(raw ?? "")
    .trim()
    .replace(/\s+/g, " ");
}

async function findMovieIdByTitleYear(title: string, year: number): Promise<string | null> {
  const [rows] = await db.execute("SELECT id FROM movies WHERE title = ? AND year = ? LIMIT 1", [title, year]);
  const r = rows as { id: string }[];
  return r.length ? r[0].id : null;
}

export type MovieListSort =
  | "newest"
  | "oldest"
  | "rating"
  | "rating_desc"
  | "rating_asc"
  | "title";

/** Langue du contenu catalogue (synopsis) : `fr` utilise `descriptionFr` quand présent. */
export type MovieContentLang = "en" | "fr";

export type MovieListParams = {
  q?: string;
  category?: string;
  rating?: number;
  sort?: MovieListSort;
  page?: number;
  limit?: number;
  lang?: MovieContentLang;
};

const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 50;

export function movieDescriptionForLang(row: any, lang: MovieContentLang): string {
  if (lang === "fr") {
    const fr = String(row.descriptionFr ?? "").trim();
    if (fr) return fr;
  }
  return String(row.description ?? "").trim();
}

export function toFrontendMovie(row: any, lang: MovieContentLang = "en") {
  const categoryName: string = row.categoryName ?? "Uncategorized";

  return {
    id: row.id,
    title: row.title,
    description: movieDescriptionForLang(row, lang),
    year: row.year,
    rating: row.ratingAvg,
    category: categoryName,
    posterUrl: row.posterUrl,
    trailerUrl: row.trailerUrl ?? null,
    duration: row.duration,
    director: row.director,
  };
}

export async function listMovies(params: MovieListParams) {
  const page = params.page && params.page > 0 ? params.page : 1;
  const q = params.q?.trim();
  const category = params.category && params.category !== "All" ? params.category : undefined;
  const minRating = typeof params.rating === "number" && params.rating > 0 ? params.rating : undefined;
  
  // Limit: use request value (1–50) or default 12 (never use 6)
  let pageSize = DEFAULT_PAGE_SIZE;
  const requestedLimit = params.limit != null ? Number(params.limit) : NaN;
  if (Number.isFinite(requestedLimit) && requestedLimit >= 1) {
    pageSize = Math.min(Math.floor(requestedLimit), MAX_PAGE_SIZE);
  }
  if (pageSize === 6) pageSize = 12;

  const sort = params.sort;
  const orderBy =
    sort === "rating" || sort === "rating_desc"
      ? "m.ratingAvg DESC"
      : sort === "rating_asc"
        ? "m.ratingAvg ASC"
        : sort === "title"
          ? "m.title ASC"
          : sort === "oldest"
            ? "m.year ASC"
            : "m.year DESC";

  const offset = (page - 1) * pageSize;

  // Build WHERE clause and params separately for movies table vs joined query
  let movieWhereClause = "1=1";
  let joinedWhereClause = "1=1";
  const movieParams: any[] = [];
  const joinedParams: any[] = [];

  if (q) {
    const pattern = `%${q}%`;
    const searchSql =
      " AND (m.title LIKE ? OR CAST(m.year AS CHAR) LIKE ? OR CAST(m.ratingAvg AS CHAR) LIKE ?)";
    movieWhereClause += searchSql;
    joinedWhereClause += searchSql;
    movieParams.push(pattern, pattern, pattern);
    joinedParams.push(pattern, pattern, pattern);
  }
  if (minRating != null) {
    movieWhereClause += " AND m.ratingAvg >= ?";
    joinedWhereClause += " AND m.ratingAvg >= ?";
    movieParams.push(minRating);
    joinedParams.push(minRating);
  }
  if (category) {
    joinedWhereClause += " AND c.name = ?";
    joinedParams.push(category);
  }

  // Count query
  let countQuery: string;
  let countParams: any[];
  
  if (category) {
    countQuery = `SELECT COUNT(DISTINCT m.id) as total FROM movies m 
       LEFT JOIN movie_categories mc ON m.id = mc.movieId 
       LEFT JOIN categories c ON mc.categoryId = c.id 
       WHERE ${joinedWhereClause}`;
    countParams = joinedParams;
  } else {
    countQuery = `SELECT COUNT(*) as total FROM movies m WHERE ${movieWhereClause}`;
    countParams = movieParams;
  }
  
  const [countRows] = await db.execute(countQuery, countParams);
  const total = (countRows as any[])[0].total;

  // Data query - always join to get category, use MAX() for categoryName to satisfy GROUP BY
  // Use query() instead of execute() for LIMIT with placeholders to avoid prepared statement issues
  const dataQuery = `
    SELECT m.*, MAX(c.name) as categoryName 
    FROM movies m
    LEFT JOIN movie_categories mc ON m.id = mc.movieId
    LEFT JOIN categories c ON mc.categoryId = c.id
    WHERE ${category ? joinedWhereClause : movieWhereClause}
    GROUP BY m.id
    ORDER BY ${orderBy}
    LIMIT ${offset}, ${pageSize}
  `;

  const dataParams = category ? joinedParams : movieParams;
  const [rows] = await db.query(dataQuery, dataParams);
  const lang: MovieContentLang = params.lang ?? "en";

  return {
    data: (rows as any[]).map((r) => toFrontendMovie(r, lang)),
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getMovie(id: string, lang: MovieContentLang = "en") {
  const [rows] = await db.execute(
    `SELECT m.*, c.name as categoryName 
     FROM movies m
     LEFT JOIN movie_categories mc ON m.id = mc.movieId
     LEFT JOIN categories c ON mc.categoryId = c.id
     WHERE m.id = ?
     LIMIT 1`,
    [id]
  );
  const rowArray = rows as any[];
  if (rowArray.length === 0) {
    throw new HttpError(404, "Film non trouvé", { code: "NOT_FOUND" });
  }
  return toFrontendMovie(rowArray[0], lang);
}

export async function createMovie(input: {
  title: string;
  description: string;
  year: number;
  duration: string;
  director: string;
  category?: string;
  posterUrl?: string;
  trailerUrl?: string | null;
}) {
  const title = normalizeMovieTitle(input.title);
  if (!title) {
    throw new HttpError(400, "Titre requis", { code: "VALIDATION" });
  }
  const existingId = await findMovieIdByTitleYear(title, input.year);
  if (existingId) {
    throw new HttpError(409, "Un film avec ce titre et cette année existe déjà", { code: "DUPLICATE_MOVIE" });
  }

  const releaseDate = new Date(`${input.year}-01-01T00:00:00.000Z`);
  const movieId = randomUUID();

  try {
    await db.execute(
      "INSERT INTO movies (id, title, description, releaseDate, year, duration, director, posterUrl, trailerUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        movieId,
        title,
        input.description,
        releaseDate,
        input.year,
        input.duration,
        input.director,
        input.posterUrl || "",
        input.trailerUrl ?? null,
      ]
    );
  } catch (e: any) {
    if (e?.code === "ER_DUP_ENTRY") {
      throw new HttpError(409, "Un film avec ce titre et cette année existe déjà", { code: "DUPLICATE_MOVIE" });
    }
    throw e;
  }

  if (input.category && input.category !== "All") {
    // Get or create category
    const [catRows] = await db.execute("SELECT id FROM categories WHERE name = ?", [input.category]);
    let categoryId: string;
    if ((catRows as any[]).length > 0) {
      categoryId = (catRows as any[])[0].id;
    } else {
      categoryId = randomUUID();
      await db.execute("INSERT INTO categories (id, name) VALUES (?, ?)", [categoryId, input.category]);
    }
    await db.execute("INSERT INTO movie_categories (movieId, categoryId) VALUES (?, ?)", [movieId, categoryId]);
  }

  return getMovie(movieId);
}

export async function updateMovie(
  id: string,
  input: Partial<{
    title: string;
    description: string;
    year: number;
    duration: string;
    director: string;
    category: string;
    posterUrl: string;
    trailerUrl: string | null;
  }>
) {
  const [existingRows] = await db.execute("SELECT id, title, year FROM movies WHERE id = ?", [id]);
  const existingArr = existingRows as { id: string; title: string; year: number }[];
  if (existingArr.length === 0) {
    throw new HttpError(404, "Film non trouvé", { code: "NOT_FOUND" });
  }
  const current = existingArr[0];

  const nextTitle = input.title !== undefined ? normalizeMovieTitle(input.title) : current.title;
  if (input.title !== undefined && !nextTitle) {
    throw new HttpError(400, "Titre requis", { code: "VALIDATION" });
  }
  const nextYear = input.year !== undefined ? input.year : current.year;

  const conflictId = await findMovieIdByTitleYear(nextTitle, nextYear);
  if (conflictId && conflictId !== id) {
    throw new HttpError(409, "Un film avec ce titre et cette année existe déjà", { code: "DUPLICATE_MOVIE" });
  }

  const updates: string[] = [];
  const params: any[] = [];

  if (input.title !== undefined) {
    updates.push("title = ?");
    params.push(nextTitle);
  }
  if (input.description !== undefined) {
    updates.push("description = ?");
    params.push(input.description);
  }
  if (input.year !== undefined) {
    updates.push("year = ?");
    updates.push("releaseDate = ?");
    params.push(input.year);
    params.push(new Date(`${input.year}-01-01T00:00:00.000Z`));
  }
  if (input.duration !== undefined) {
    updates.push("duration = ?");
    params.push(input.duration);
  }
  if (input.director !== undefined) {
    updates.push("director = ?");
    params.push(input.director);
  }
  if (input.posterUrl !== undefined) {
    updates.push("posterUrl = ?");
    params.push(input.posterUrl);
  }
  if (input.trailerUrl !== undefined) {
    updates.push("trailerUrl = ?");
    params.push(input.trailerUrl);
  }

  if (updates.length > 0) {
    params.push(id);
    try {
      await db.execute(`UPDATE movies SET ${updates.join(", ")} WHERE id = ?`, params);
    } catch (e: any) {
      if (e?.code === "ER_DUP_ENTRY") {
        throw new HttpError(409, "Un film avec ce titre et cette année existe déjà", { code: "DUPLICATE_MOVIE" });
      }
      throw e;
    }
  }

  // Handle category update
  if (input.category !== undefined && input.category !== "All") {
    // Delete existing categories
    await db.execute("DELETE FROM movie_categories WHERE movieId = ?", [id]);

    // Get or create category
    const [catRows] = await db.execute("SELECT id FROM categories WHERE name = ?", [input.category]);
    let categoryId: string;
    if ((catRows as any[]).length > 0) {
      categoryId = (catRows as any[])[0].id;
    } else {
      categoryId = randomUUID();
      await db.execute("INSERT INTO categories (id, name) VALUES (?, ?)", [categoryId, input.category]);
    }
    await db.execute("INSERT INTO movie_categories (movieId, categoryId) VALUES (?, ?)", [id, categoryId]);
  }

  return getMovie(id);
}

export async function deleteMovie(id: string) {
  const [result] = await db.execute("DELETE FROM movies WHERE id = ?", [id]);
  const affectedRows = (result as any).affectedRows;
  if (affectedRows === 0) {
    throw new HttpError(404, "Film non trouvé", { code: "NOT_FOUND" });
  }
  return { ok: true };
}
