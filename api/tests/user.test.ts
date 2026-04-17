import request from "supertest";
import { createApp } from "../src/app";
import { dbMock } from "./__mocks__/mysqlClient";

jest.mock("../src/database/connection", () => {
  const { dbMock } = require("./__mocks__/mysqlClient");
  return { db: dbMock };
});

describe("user space", () => {
  const app = createApp();
  const jwt = require("jsonwebtoken");

  let userToken: string;
  let adminToken: string;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_ACCESS_SECRET = "test-access";
    process.env.JWT_ACCESS_EXPIRES_IN = "15m";

    userToken = jwt.sign(
      { sub: "u1", role: "USER", email: "user@test.com", username: "user" },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    adminToken = jwt.sign(
      { sub: "a1", role: "ADMIN", email: "admin@test.com", username: "admin" },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" }
    );
  });

  test("GET /user/me returns user profile with watchlist/history/ratings", async () => {
    // Mock: get user
    dbMock.execute.mockResolvedValueOnce([
      [{ id: "u1", email: "user@test.com", username: "user", role: "USER" }],
      [],
    ]);
    // Mock: get watchlist
    dbMock.execute.mockResolvedValueOnce([[{ movieId: "m1" }, { movieId: "m2" }], []]);
    // Mock: get history
    dbMock.execute.mockResolvedValueOnce([[{ movieId: "m1" }], []]);
    // Mock: get ratings
    dbMock.execute.mockResolvedValueOnce([[{ movieId: "m1", ratingNumber: 8 }], []]);

    const res = await request(app).get("/user/me").set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.watchlist).toEqual(["m1", "m2"]);
    expect(res.body.data.history).toEqual(["m1"]);
    expect(res.body.data.ratings).toEqual({ m1: 8 });
  });

  test("POST /user/watchlist/:movieId adds movie to watchlist", async () => {
    // Mock: check movie exists
    dbMock.execute.mockResolvedValueOnce([[{ id: "m1", title: "Test Movie" }], []]);
    // Mock: insert watchlist
    dbMock.execute.mockResolvedValueOnce([{ affectedRows: 1 }, []]);
    // Mock: get user profile
    dbMock.execute.mockResolvedValueOnce([
      [{ id: "u1", email: "user@test.com", username: "user", role: "USER" }],
      [],
    ]);
    dbMock.execute.mockResolvedValueOnce([[{ movieId: "m1" }], []]);
    dbMock.execute.mockResolvedValueOnce([[], []]);
    dbMock.execute.mockResolvedValueOnce([[], []]);

    const res = await request(app)
      .post("/user/watchlist/m1")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.watchlist).toContain("m1");
    expect(dbMock.execute).toHaveBeenCalledWith(
      expect.stringContaining("INSERT IGNORE INTO watchlist"),
      ["u1", "m1"]
    );
  });

  test("POST /user/watchlist/:movieId requires authentication", async () => {
    const res = await request(app).post("/user/watchlist/m1");

    expect(res.status).toBe(401);
  });

  test("DELETE /user/watchlist/:movieId removes from watchlist", async () => {
    // Mock: delete watchlist
    dbMock.execute.mockResolvedValueOnce([{ affectedRows: 1 }, []]);
    // Mock: get user profile
    dbMock.execute.mockResolvedValueOnce([
      [{ id: "u1", email: "user@test.com", username: "user", role: "USER" }],
      [],
    ]);
    dbMock.execute.mockResolvedValueOnce([[], []]);
    dbMock.execute.mockResolvedValueOnce([[], []]);
    dbMock.execute.mockResolvedValueOnce([[], []]);

    const res = await request(app)
      .delete("/user/watchlist/m1")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(dbMock.execute).toHaveBeenCalledWith(
      expect.stringContaining("DELETE FROM watchlist"),
      ["u1", "m1"]
    );
  });

  test("POST /user/ratings/:movieId adds rating", async () => {
    // Mock: check movie exists
    dbMock.execute.mockResolvedValueOnce([[{ id: "m1" }], []]);
    // Mock: upsert rating
    dbMock.execute.mockResolvedValueOnce([{ affectedRows: 1 }, []]);
    // Mock: get average rating
    dbMock.execute.mockResolvedValueOnce([[{ avgRating: 8.5 }], []]);
    // Mock: update movie rating
    dbMock.execute.mockResolvedValueOnce([{ affectedRows: 1 }, []]);
    // Mock: get user profile
    dbMock.execute.mockResolvedValueOnce([
      [{ id: "u1", email: "user@test.com", username: "user", role: "USER" }],
      [],
    ]);
    dbMock.execute.mockResolvedValueOnce([[], []]);
    dbMock.execute.mockResolvedValueOnce([[], []]);
    dbMock.execute.mockResolvedValueOnce([[{ movieId: "m1", ratingNumber: 8 }], []]);

    const res = await request(app)
      .post("/user/ratings/m1")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ ratingNumber: 8, note: "Great movie!" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(dbMock.execute).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO ratings"),
      expect.arrayContaining(["u1", "m1", 8])
    );
  });

  test("POST /user/ratings/:movieId rejects invalid rating", async () => {
    const res = await request(app)
      .post("/user/ratings/m1")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ ratingNumber: 11 }); // Invalid: > 10

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("POST /user/history/:movieId records view", async () => {
    // Mock: check movie exists
    dbMock.execute.mockResolvedValueOnce([[{ id: "m1" }], []]);
    // Mock: upsert history
    dbMock.execute.mockResolvedValueOnce([{ affectedRows: 1 }, []]);
    // Mock: get user profile
    dbMock.execute.mockResolvedValueOnce([
      [{ id: "u1", email: "user@test.com", username: "user", role: "USER" }],
      [],
    ]);
    dbMock.execute.mockResolvedValueOnce([[], []]);
    dbMock.execute.mockResolvedValueOnce([[{ movieId: "m1" }], []]);
    dbMock.execute.mockResolvedValueOnce([[], []]);

    const res = await request(app)
      .post("/user/history/m1")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(dbMock.execute).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO history"),
      expect.arrayContaining(["u1", "m1"])
    );
  });

  test("POST /user/watchlist/:movieId returns 404 for missing movie", async () => {
    // Mock: movie not found
    dbMock.execute.mockResolvedValueOnce([[], []]);

    const res = await request(app)
      .post("/user/watchlist/nonexistent-movie")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  test("POST /user/ratings/:movieId validates rating range", async () => {
    const res = await request(app)
      .post("/user/ratings/m1")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ ratingNumber: 15, note: "Great" }); // Over 10

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  test("POST /user/ratings/:movieId returns 404 for missing movie", async () => {
    // Mock: movie not found
    dbMock.execute.mockResolvedValueOnce([[], []]);

    const res = await request(app)
      .post("/user/ratings/nonexistent-movie")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ ratingNumber: 8 });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  test("POST /user/history/:movieId returns 404 for missing movie", async () => {
    // Mock: movie not found
    dbMock.execute.mockResolvedValueOnce([[], []]);

    const res = await request(app)
      .post("/user/history/nonexistent-movie")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  test("GET /user/recommendations returns 401 without token", async () => {
    const res = await request(app).get("/user/recommendations");
    expect(res.status).toBe(401);
  });

  test("GET /user/recommendations returns rules-ranked movies from DB when OpenAI is unset", async () => {
    delete process.env.OPENAI_API_KEY;
    dbMock.execute.mockResolvedValueOnce([[{ id: "u1", email: "user@test.com", username: "user", role: "USER" }], []]);
    dbMock.execute.mockResolvedValueOnce([[], []]);
    dbMock.execute.mockResolvedValueOnce([[], []]);
    dbMock.execute.mockResolvedValueOnce([[], []]);
    dbMock.query.mockResolvedValueOnce([
      [
        {
          id: "m2",
          title: "Beta",
          description: "Desc",
          year: 2021,
          ratingAvg: 9,
          posterUrl: "",
          duration: "2h",
          director: "D1",
          categoryName: "Action",
        },
        {
          id: "m3",
          title: "Alpha",
          description: "Desc",
          year: 2020,
          ratingAvg: 7,
          posterUrl: "",
          duration: "1h",
          director: "D2",
          categoryName: "Drama",
        },
      ],
      [],
    ]);

    const res = await request(app).get("/user/recommendations").set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.source).toBe("rules");
    expect(res.body.data.movies.map((m: { id: string }) => m.id)).toEqual(["m2", "m3"]);
    expect(res.body.data.movies[0].title).toBe("Beta");
    expect(typeof res.body.data.insight).toBe("string");
    expect(res.body.data.mood).toBe("neutral");

    dbMock.execute.mockResolvedValueOnce([[{ id: "u1", email: "user@test.com", username: "user", role: "USER" }], []]);
    dbMock.execute.mockResolvedValueOnce([[], []]);
    dbMock.execute.mockResolvedValueOnce([[], []]);
    dbMock.execute.mockResolvedValueOnce([[], []]);
    dbMock.query.mockResolvedValueOnce([
      [
        {
          id: "m2",
          title: "Beta",
          description: "Desc",
          year: 2021,
          ratingAvg: 9,
          posterUrl: "",
          duration: "2h",
          director: "D1",
          categoryName: "Action",
        },
        {
          id: "m3",
          title: "Alpha",
          description: "Desc",
          year: 2020,
          ratingAvg: 7,
          posterUrl: "",
          duration: "1h",
          director: "D2",
          categoryName: "Drama",
        },
      ],
      [],
    ]);

    const resLimit1 = await request(app)
      .get("/user/recommendations?limit=1")
      .set("Authorization", `Bearer ${userToken}`);
    expect(resLimit1.status).toBe(200);
    expect(resLimit1.body.data.movies).toHaveLength(1);
    expect(resLimit1.body.data.movies[0].id).toBe("m2");
  });

  test("GET /user/recommendations validates mood query", async () => {
    const res = await request(app)
      .get("/user/recommendations?mood=not_a_real_mood")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("GET /user/recommendations validates limit query", async () => {
    const res = await request(app)
      .get("/user/recommendations?limit=99")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
