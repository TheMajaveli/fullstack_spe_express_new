import request from "supertest";
import { createApp } from "../src/app";
import { dbMock } from "./__mocks__/mysqlClient";

jest.mock("../src/database/connection", () => {
  const { dbMock } = require("./__mocks__/mysqlClient");
  return { db: dbMock };
});

describe("categories", () => {
  const app = createApp();
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
    dbMock.execute.mockResolvedValueOnce([
      [
        { id: "c1", name: "Action" },
        { id: "c2", name: "Sci-Fi" },
      ],
      [],
    ]);

    const res = await request(app).get("/categories");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0].name).toBe("Action");
  });

  test("POST /categories creates category (admin only)", async () => {
    // INSERT then SELECT
    dbMock.execute.mockResolvedValueOnce([{ affectedRows: 1 }, []]);
    dbMock.execute.mockResolvedValueOnce([
      [{ id: "cat-new", name: "Horror", createdAt: "2024-01-01T00:00:00.000Z" }],
      [],
    ]);

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
    // UPDATE then SELECT
    dbMock.execute.mockResolvedValueOnce([{ affectedRows: 1 }, []]);
    dbMock.execute.mockResolvedValueOnce([
      [{ id: "c1", name: "Thriller", createdAt: "2024-01-01T00:00:00.000Z" }],
      [],
    ]);

    const res = await request(app)
      .put("/categories/c1")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Thriller" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe("Thriller");
  });

  test("DELETE /categories/:id deletes category", async () => {
    dbMock.execute.mockResolvedValueOnce([{ affectedRows: 1 }, []]);

    const res = await request(app)
      .delete("/categories/c1")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(dbMock.execute).toHaveBeenCalledWith(expect.stringContaining("DELETE FROM categories"), ["c1"]);
  });
});
