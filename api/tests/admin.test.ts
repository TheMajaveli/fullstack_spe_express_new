import request from "supertest";
import { createApp } from "../src/app";

jest.mock("../src/prisma/client", () => {
  const { prismaMock } = require("./__mocks__/prismaClient");
  return { prisma: prismaMock };
});

describe("admin", () => {
  const app = createApp();
  const { prisma } = require("../src/prisma/client");

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_ACCESS_SECRET = "test-access";
    process.env.JWT_ACCESS_EXPIRES_IN = "15m";
  });

  test("POST /movies requires admin token", async () => {
    const res = await request(app).post("/movies").send({ title: "x" });
    expect(res.status).toBe(401);
  });

  test("POST /movies creates movie when admin", async () => {
    const jwt = require("jsonwebtoken");
    const token = jwt.sign(
      { sub: "u1", role: "ADMIN", email: "admin@x.com", username: "admin" },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    prisma.movie.create.mockResolvedValue({
      id: "m1",
      title: "X",
      description: "D",
      year: 2020,
      ratingAvg: 0,
      posterUrl: "/uploads/p.png",
      duration: "1h",
      director: "Dir",
      categories: [{ category: { name: "Action" } }],
    });

    const res = await request(app)
      .post("/movies")
      .set("Authorization", `Bearer ${token}`)
      .field("title", "X")
      .field("description", "D")
      .field("year", "2020")
      .field("duration", "1h")
      .field("director", "Dir")
      .field("category", "Action")
      .field("posterUrl", "/uploads/p.png");

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe("m1");
  });
});

