import request from "supertest";
import { createApp } from "../src/app";

jest.mock("../src/prisma/client", () => {
  const { prismaMock } = require("./__mocks__/prismaClient");
  return { prisma: prismaMock };
});

describe("movies", () => {
  const app = createApp();
  const { prisma } = require("../src/prisma/client");

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GET /movies supports catalog query params", async () => {
    prisma.movie.count.mockResolvedValue(1);
    prisma.movie.findMany.mockResolvedValue([
      {
        id: "m1",
        title: "Inception",
        description: "x",
        year: 2010,
        ratingAvg: 8.8,
        posterUrl: "p",
        duration: "2h",
        director: "Nolan",
        categories: [{ category: { name: "Sci-Fi" } }],
      },
    ]);

    const res = await request(app).get("/movies?q=incep&category=Sci-Fi&rating=8&sort=rating&page=1");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.data[0].category).toBe("Sci-Fi");
    expect(res.body.data.total).toBe(1);
  });

  test("GET /movies/:id returns movie details", async () => {
    prisma.movie.findUnique.mockResolvedValue({
      id: "m1",
      title: "Inception",
      description: "A mind-bending thriller",
      year: 2010,
      ratingAvg: 8.8,
      posterUrl: "/uploads/poster.jpg",
      duration: "2h 28m",
      director: "Christopher Nolan",
      categories: [{ category: { name: "Sci-Fi" } }],
    });

    const res = await request(app).get("/movies/m1");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe("m1");
    expect(res.body.data.title).toBe("Inception");
    expect(res.body.data.category).toBe("Sci-Fi");
  });

  test("GET /movies/:id returns 404 for non-existent movie", async () => {
    prisma.movie.findUnique.mockResolvedValue(null);

    const res = await request(app).get("/movies/nonexistent");

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  test("GET /movies supports pagination", async () => {
    prisma.movie.count.mockResolvedValue(20);
    prisma.movie.findMany.mockResolvedValue([
      {
        id: "m1",
        title: "Movie 1",
        description: "x",
        year: 2020,
        ratingAvg: 8.0,
        posterUrl: "p",
        duration: "1h",
        director: "Dir",
        categories: [],
      },
    ]);

    const res = await request(app).get("/movies?page=2");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.total).toBe(20);
    expect(res.body.data.totalPages).toBeGreaterThan(1);
  });

  test("GET /movies supports sorting by title", async () => {
    prisma.movie.count.mockResolvedValue(2);
    prisma.movie.findMany.mockResolvedValue([
      {
        id: "m1",
        title: "Alpha",
        description: "x",
        year: 2020,
        ratingAvg: 8.0,
        posterUrl: "p",
        duration: "1h",
        director: "Dir",
        categories: [],
      },
      {
        id: "m2",
        title: "Beta",
        description: "x",
        year: 2020,
        ratingAvg: 8.0,
        posterUrl: "p",
        duration: "1h",
        director: "Dir",
        categories: [],
      },
    ]);

    const res = await request(app).get("/movies?sort=title");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(prisma.movie.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { title: "asc" },
      })
    );
  });
});

