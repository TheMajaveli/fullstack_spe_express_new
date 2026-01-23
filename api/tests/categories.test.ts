import request from "supertest";
import { createApp } from "../src/app";

jest.mock("../src/prisma/client", () => {
  const { prismaMock } = require("./__mocks__/prismaClient");
  return { prisma: prismaMock };
});

describe("categories", () => {
  const app = createApp();
  const { prisma } = require("../src/prisma/client");
  const jwt = require("jsonwebtoken");

  let adminToken: string;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_ACCESS_SECRET = "test-access";
    process.env.JWT_ACCESS_EXPIRES_IN = "15m";

    adminToken = jwt.sign(
      { sub: "a1", role: "ADMIN", email: "admin@test.com", username: "admin" },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" }
    );
  });

  test("GET /categories returns all categories", async () => {
    prisma.category.findMany.mockResolvedValue([
      { id: "c1", name: "Action" },
      { id: "c2", name: "Sci-Fi" },
    ]);

    const res = await request(app).get("/categories");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0].name).toBe("Action");
  });

  test("POST /categories creates category (admin only)", async () => {
    prisma.category.create.mockResolvedValue({ id: "c1", name: "Horror" });

    const res = await request(app)
      .post("/categories")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Horror" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe("Horror");
  });

  test("POST /categories requires admin role", async () => {
    const userToken = jwt.sign(
      { sub: "u1", role: "USER", email: "user@test.com", username: "user" },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    const res = await request(app)
      .post("/categories")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ name: "Horror" });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test("PUT /categories/:id updates category", async () => {
    prisma.category.update.mockResolvedValue({ id: "c1", name: "Thriller" });

    const res = await request(app)
      .put("/categories/c1")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Thriller" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe("Thriller");
  });

  test("DELETE /categories/:id deletes category", async () => {
    prisma.category.delete.mockResolvedValue({} as any);

    const res = await request(app)
      .delete("/categories/c1")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(prisma.category.delete).toHaveBeenCalledWith({ where: { id: "c1" } });
  });
});
