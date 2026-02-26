import { db } from "../database/connection";
import { HttpError } from "../middlewares/errorHandler";
import { randomUUID } from "crypto";

export type MovieListParams = {
  q?: string;
  category?: string;
  rating?: number;
  sort?: "newest" | "rating" | "title";
  page?: number;
  limit?: number;
};

const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 50;

function toFrontendMovie(row: any) {
  const categoryName: string = row.categoryName ?? "Uncategorized";

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    year: row.year,
    rating: row.ratingAvg,
    category: categoryName,
    posterUrl: row.posterUrl,
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

  const orderBy =
    params.sort === "rating"
      ? "m.ratingAvg DESC"
      : params.sort === "title"
        ? "m.title ASC"
        : "m.year DESC";

  const offset = (page - 1) * pageSize;

  // Build WHERE clause and params separately for movies table vs joined query
  let movieWhereClause = "1=1";
  let joinedWhereClause = "1=1";
  const movieParams: any[] = [];
  const joinedParams: any[] = [];

  if (q) {
    movieWhereClause += " AND m.title LIKE ?";
    joinedWhereClause += " AND m.title LIKE ?";
    movieParams.push(`%${q}%`);
    joinedParams.push(`%${q}%`);
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

  return {
    data: (rows as any[]).map(toFrontendMovie),
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getMovie(id: string) {
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
  return toFrontendMovie(rowArray[0]);
}

export async function createMovie(input: {
  title: string;
  description: string;
  year: number;
  duration: string;
  director: string;
  category?: string;
  posterUrl?: string;
}) {
  const releaseDate = new Date(`${input.year}-01-01T00:00:00.000Z`);
  const movieId = randomUUID();

  await db.execute(
    "INSERT INTO movies (id, title, description, releaseDate, year, duration, director, posterUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [movieId, input.title, input.description, releaseDate, input.year, input.duration, input.director, input.posterUrl || ""]
  );

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
  }>
) {
  const [existing] = await db.execute("SELECT id FROM movies WHERE id = ?", [id]);
  if ((existing as any[]).length === 0) {
    throw new HttpError(404, "Film non trouvé", { code: "NOT_FOUND" });
  }

  const updates: string[] = [];
  const params: any[] = [];

  if (input.title !== undefined) {
    updates.push("title = ?");
    params.push(input.title);
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

  if (updates.length > 0) {
    params.push(id);
    await db.execute(`UPDATE movies SET ${updates.join(", ")} WHERE id = ?`, params);
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
