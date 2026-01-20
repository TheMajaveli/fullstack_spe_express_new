import { prisma } from "../prisma/client";
import { HttpError } from "../middlewares/errorHandler";

export type MovieListParams = {
  q?: string;
  category?: string;
  rating?: number;
  sort?: "newest" | "rating" | "title";
  page?: number;
};

const PAGE_SIZE = 6; // matches frontend mock

function toFrontendMovie(row: any) {
  const categoryName: string =
    row.categories?.[0]?.category?.name ?? row.categoryFallback ?? "Uncategorized";

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

  const where: any = {};
  if (q) {
    where.title = { contains: q, mode: "insensitive" };
  }
  if (minRating != null) {
    where.ratingAvg = { gte: minRating };
  }
  if (category) {
    where.categories = { some: { category: { name: category } } };
  }

  const orderBy =
    params.sort === "rating"
      ? { ratingAvg: "desc" as const }
      : params.sort === "title"
        ? { title: "asc" as const }
        : { year: "desc" as const };

  const [total, rows] = await Promise.all([
    prisma.movie.count({ where }),
    prisma.movie.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { categories: { include: { category: true } } },
    }),
  ]);

  return {
    data: rows.map(toFrontendMovie),
    total,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export async function getMovie(id: string) {
  const row = await prisma.movie.findUnique({
    where: { id },
    include: { categories: { include: { category: true } } },
  });
  if (!row) throw new HttpError(404, "Movie not found", { code: "NOT_FOUND" });
  return toFrontendMovie(row);
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

  let categoryConnect:
    | { create: { category: { connectOrCreate: { where: { name: string }; create: { name: string } } } } }
    | undefined;

  if (input.category && input.category !== "All") {
    categoryConnect = {
      create: {
        category: {
          connectOrCreate: {
            where: { name: input.category },
            create: { name: input.category },
          },
        },
      },
    };
  }

  const movie = await prisma.movie.create({
    data: {
      title: input.title,
      description: input.description,
      year: input.year,
      releaseDate,
      duration: input.duration,
      director: input.director,
      posterUrl: input.posterUrl || "",
      categories: categoryConnect,
    },
    include: { categories: { include: { category: true } } },
  });

  return toFrontendMovie(movie);
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
  const existing = await prisma.movie.findUnique({ where: { id } });
  if (!existing) throw new HttpError(404, "Movie not found", { code: "NOT_FOUND" });

  const releaseDate = input.year ? new Date(`${input.year}-01-01T00:00:00.000Z`) : undefined;

  // If category provided, replace category links with single category
  const categories =
    input.category && input.category !== "All"
      ? {
          deleteMany: {},
          create: {
            category: {
              connectOrCreate: {
                where: { name: input.category },
                create: { name: input.category },
              },
            },
          },
        }
      : undefined;

  const movie = await prisma.movie.update({
    where: { id },
    data: {
      title: input.title,
      description: input.description,
      year: input.year,
      releaseDate,
      duration: input.duration,
      director: input.director,
      posterUrl: input.posterUrl,
      categories,
    },
    include: { categories: { include: { category: true } } },
  });

  return toFrontendMovie(movie);
}

export async function deleteMovie(id: string) {
  await prisma.movie.delete({ where: { id } }).catch(() => {
    throw new HttpError(404, "Movie not found", { code: "NOT_FOUND" });
  });
  return { ok: true };
}

