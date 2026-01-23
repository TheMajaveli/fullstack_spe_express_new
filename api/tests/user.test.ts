import request from "supertest";
import { createApp } from "../src/app";

jest.mock("../src/prisma/client", () => {
  const { prismaMock } = require("./__mocks__/prismaClient");
  return { prisma: prismaMock };
});

describe("user space", () => {
  const app = createApp();
  const { prisma } = require("../src/prisma/client");
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
    prisma.user.findUnique.mockResolvedValue({
      id: "u1",
      email: "user@test.com",
      username: "user",
      role: "USER",
    });
    prisma.watchlist.findMany.mockResolvedValue([{ movieId: "m1" }, { movieId: "m2" }]);
    prisma.history.findMany.mockResolvedValue([{ movieId: "m1" }]);
    prisma.rating.findMany.mockResolvedValue([{ movieId: "m1", ratingNumber: 8 }]);

    const res = await request(app).get("/user/me").set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.watchlist).toEqual(["m1", "m2"]);
    expect(res.body.data.history).toEqual(["m1"]);
    expect(res.body.data.ratings).toEqual({ m1: 8 });
  });

  test("POST /user/watchlist/:movieId adds movie to watchlist", async () => {
    prisma.movie.findUnique.mockResolvedValue({ id: "m1", title: "Test Movie" });
    prisma.watchlist.upsert.mockResolvedValue({} as any);
    prisma.user.findUnique.mockResolvedValue({
      id: "u1",
      email: "user@test.com",
      username: "user",
      role: "USER",
    });
    prisma.watchlist.findMany.mockResolvedValue([{ movieId: "m1" }]);
    prisma.history.findMany.mockResolvedValue([]);
    prisma.rating.findMany.mockResolvedValue([]);

    const res = await request(app)
      .post("/user/watchlist/m1")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.watchlist).toContain("m1");
    expect(prisma.watchlist.upsert).toHaveBeenCalled();
  });

  test("POST /user/watchlist/:movieId requires authentication", async () => {
    const res = await request(app).post("/user/watchlist/m1");

    expect(res.status).toBe(401);
  });

  test("DELETE /user/watchlist/:movieId removes from watchlist", async () => {
    prisma.watchlist.delete.mockResolvedValue({} as any);
    prisma.user.findUnique.mockResolvedValue({
      id: "u1",
      email: "user@test.com",
      username: "user",
      role: "USER",
    });
    prisma.watchlist.findMany.mockResolvedValue([]);
    prisma.history.findMany.mockResolvedValue([]);
    prisma.rating.findMany.mockResolvedValue([]);

    const res = await request(app)
      .delete("/user/watchlist/m1")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(prisma.watchlist.delete).toHaveBeenCalledWith({
      where: { userId_movieId: { userId: "u1", movieId: "m1" } },
    });
  });

  test("POST /user/ratings/:movieId adds rating", async () => {
    prisma.movie.findUnique.mockResolvedValue({ id: "m1" });
    prisma.rating.upsert.mockResolvedValue({} as any);
    prisma.rating.aggregate.mockResolvedValue({ _avg: { ratingNumber: 8.5 } });
    prisma.movie.update.mockResolvedValue({} as any);
    prisma.user.findUnique.mockResolvedValue({
      id: "u1",
      email: "user@test.com",
      username: "user",
      role: "USER",
    });
    prisma.watchlist.findMany.mockResolvedValue([]);
    prisma.history.findMany.mockResolvedValue([]);
    prisma.rating.findMany.mockResolvedValue([{ movieId: "m1", ratingNumber: 8 }]);

    const res = await request(app)
      .post("/user/ratings/m1")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ ratingNumber: 8, note: "Great movie!" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(prisma.rating.upsert).toHaveBeenCalledWith({
      where: { userId_movieId: { userId: "u1", movieId: "m1" } },
      update: { ratingNumber: 8, note: "Great movie!" },
      create: { userId: "u1", movieId: "m1", ratingNumber: 8, note: "Great movie!" },
    });
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
    prisma.movie.findUnique.mockResolvedValue({ id: "m1" });
    prisma.history.upsert.mockResolvedValue({} as any);
    prisma.user.findUnique.mockResolvedValue({
      id: "u1",
      email: "user@test.com",
      username: "user",
      role: "USER",
    });
    prisma.watchlist.findMany.mockResolvedValue([]);
    prisma.history.findMany.mockResolvedValue([{ movieId: "m1" }]);
    prisma.rating.findMany.mockResolvedValue([]);

    const res = await request(app)
      .post("/user/history/m1")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(prisma.history.upsert).toHaveBeenCalled();
  });
});
