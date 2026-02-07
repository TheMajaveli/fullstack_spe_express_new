import request from "supertest";
import { createApp } from "../src/app";
import { dbMock } from "./__mocks__/mysqlClient";

jest.mock("../src/database/connection", () => {
  const { dbMock } = require("./__mocks__/mysqlClient");
  return { db: dbMock };
});

describe("movies", () => {
  const app = createApp();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GET /movies supports catalog query params", async () => {
    // Mock: count query (execute)
    dbMock.execute.mockResolvedValueOnce([[{ total: 1 }], []]);
    // Mock: data query (query)
    dbMock.query.mockResolvedValueOnce([
      [
        {
          id: "m1",
          title: "Inception",
          description: "x",
          year: 2010,
          ratingAvg: 8.8,
          posterUrl: "p",
          duration: "2h",
          director: "Nolan",
          categoryName: "Sci-Fi",
        },
      ],
      [],
    ]);

    const res = await request(app).get("/movies?q=incep&category=Sci-Fi&rating=8&sort=rating&page=1");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.data[0].category).toBe("Sci-Fi");
    expect(res.body.data.total).toBe(1);
  });

  test("GET /movies/:id returns movie details", async () => {
    dbMock.execute.mockResolvedValueOnce([
      [
        {
          id: "m1",
          title: "Inception",
          description: "A mind-bending thriller",
          year: 2010,
          ratingAvg: 8.8,
          posterUrl: "/uploads/poster.jpg",
          duration: "2h 28m",
          director: "Christopher Nolan",
          categoryName: "Sci-Fi",
        },
      ],
      [],
    ]);

    const res = await request(app).get("/movies/m1");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe("m1");
    expect(res.body.data.title).toBe("Inception");
    expect(res.body.data.category).toBe("Sci-Fi");
  });

  test("GET /movies/:id returns 404 for non-existent movie", async () => {
    dbMock.execute.mockResolvedValueOnce([[], []]);

    const res = await request(app).get("/movies/nonexistent");

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  test("GET /movies supports pagination", async () => {
    // Mock: count query (execute)
    dbMock.execute.mockResolvedValueOnce([[{ total: 20 }], []]);
    // Mock: data query (query)
    dbMock.query.mockResolvedValueOnce([
      [
        {
          id: "m1",
          title: "Movie 1",
          description: "x",
          year: 2020,
          ratingAvg: 8.0,
          posterUrl: "p",
          duration: "1h",
          director: "Dir",
          categoryName: null,
        },
      ],
      [],
    ]);

    const res = await request(app).get("/movies?page=2");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.total).toBe(20);
    expect(res.body.data.totalPages).toBeGreaterThan(1);
  });

  test("GET /movies supports sorting by title", async () => {
    // Mock: count query (execute)
    dbMock.execute.mockResolvedValueOnce([[{ total: 2 }], []]);
    // Mock: data query (query)
    dbMock.query.mockResolvedValueOnce([
      [
        {
          id: "m1",
          title: "Alpha",
          description: "x",
          year: 2020,
          ratingAvg: 8.0,
          posterUrl: "p",
          duration: "1h",
          director: "Dir",
          categoryName: null,
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
          categoryName: null,
        },
      ],
      [],
    ]);

    const res = await request(app).get("/movies?sort=title");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(dbMock.query).toHaveBeenCalledWith(
      expect.stringContaining("ORDER BY m.title ASC"),
      expect.any(Array)
    );
  });

  test("GET /movies supports custom limit parameter", async () => {
    // Mock: count query (execute)
    dbMock.execute.mockResolvedValueOnce([[{ total: 30 }], []]);
    // Mock: data query (query, limit 12)
    dbMock.query.mockResolvedValueOnce([
      Array.from({ length: 12 }, (_, i) => ({
        id: `m${i}`,
        title: `Movie ${i}`,
        description: "x",
        year: 2020,
        ratingAvg: 8.0,
        posterUrl: "p",
        duration: "1h",
        director: "Dir",
        categoryName: null,
      })),
      [],
    ]);

    const res = await request(app).get("/movies?limit=12");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalPages).toBe(3); // 30 / 12 = 2.5 => 3
  });

  test("GET /movies handles invalid page gracefully", async () => {
    // page=0 fails validation (min 1) → 400
    const res = await request(app).get("/movies?page=0");
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("GET /movies returns empty array when no movies match", async () => {
    // Mock: count query (execute)
    dbMock.execute.mockResolvedValueOnce([[{ total: 0 }], []]);
    // Mock: data query (query)
    dbMock.query.mockResolvedValueOnce([[], []]);

    const res = await request(app).get("/movies?q=nonexistentmovie");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.data).toEqual([]);
    expect(res.body.data.total).toBe(0);
    expect(res.body.data.totalPages).toBe(1);
  });

  test("GET /movies validates query parameters", async () => {
    const res = await request(app).get("/movies?limit=999"); // Over max

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
