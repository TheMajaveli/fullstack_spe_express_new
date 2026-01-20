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
});

