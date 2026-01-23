import request from "supertest";
import { createApp } from "../src/app";

jest.mock("../src/prisma/client", () => {
  const { prismaMock } = require("./__mocks__/prismaClient");
  return { prisma: prismaMock };
});

describe("auth", () => {
  const app = createApp();
  const { prisma } = require("../src/prisma/client");

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_ACCESS_SECRET = "test-access";
    process.env.JWT_ACCESS_EXPIRES_IN = "15m";
  });

  test("POST /auth/register returns tokens + user", async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({ id: "u1", email: "a@b.com", username: "alice", role: "USER" });
    prisma.refreshToken.create.mockResolvedValue({ id: "rt1" });

    const res = await request(app)
      .post("/auth/register")
      .send({ email: "a@b.com", username: "alice", password: "Password1" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe("a@b.com");
    expect(res.body.data.accessToken).toBeTruthy();
    expect(res.body.data.refreshToken).toBeTruthy();
  });

  test("POST /auth/login returns tokens + user", async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: "u1",
      email: "a@b.com",
      username: "alice",
      role: "USER",
      passwordHash: await require("bcrypt").hash("Password1", 1),
    });
    prisma.refreshToken.create.mockResolvedValue({ id: "rt1" });

    const res = await request(app).post("/auth/login").send({ email: "a@b.com", password: "Password1" });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.username).toBe("alice");
    expect(res.body.data.accessToken).toBeTruthy();
    expect(res.body.data.refreshToken).toBeTruthy();
  });

  test("POST /auth/register rejects duplicate email", async () => {
    prisma.user.findUnique.mockResolvedValue({ id: "existing", email: "a@b.com" });

    const res = await request(app)
      .post("/auth/register")
      .send({ email: "a@b.com", username: "alice", password: "Password1" });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("EMAIL_TAKEN");
  });

  test("POST /auth/login rejects invalid credentials", async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const res = await request(app).post("/auth/login").send({ email: "a@b.com", password: "WrongPass" });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
  });

  test("POST /auth/refresh returns new access token", async () => {
    const refreshToken = "valid-refresh-token";
    const tokenHash = require("crypto").createHash("sha256").update(refreshToken).digest("hex");

    prisma.refreshToken.findUnique.mockResolvedValue({
      id: "rt1",
      tokenHash,
      userId: "u1",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      user: { id: "u1", email: "a@b.com", username: "alice", role: "USER" },
    });

    const res = await request(app).post("/auth/refresh").send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeTruthy();
  });

  test("POST /auth/refresh rejects expired token", async () => {
    const refreshToken = "expired-token";
    const tokenHash = require("crypto").createHash("sha256").update(refreshToken).digest("hex");

    prisma.refreshToken.findUnique.mockResolvedValue({
      id: "rt1",
      tokenHash,
      userId: "u1",
      expiresAt: new Date(Date.now() - 1000), // Expired
      user: { id: "u1", email: "a@b.com", username: "alice", role: "USER" },
    });
    prisma.refreshToken.delete.mockResolvedValue({} as any);

    const res = await request(app).post("/auth/refresh").send({ refreshToken });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("REFRESH_EXPIRED");
  });

  test("POST /auth/logout invalidates refresh token", async () => {
    const refreshToken = "token-to-delete";
    const tokenHash = require("crypto").createHash("sha256").update(refreshToken).digest("hex");

    prisma.refreshToken.delete.mockResolvedValue({} as any);

    const res = await request(app).post("/auth/logout").send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(prisma.refreshToken.delete).toHaveBeenCalledWith({ where: { tokenHash } });
  });

  test("GET /auth/me returns user profile", async () => {
    const jwt = require("jsonwebtoken");
    const token = jwt.sign(
      { sub: "u1", role: "USER", email: "a@b.com", username: "alice" },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    prisma.user.findUnique.mockResolvedValue({
      id: "u1",
      email: "a@b.com",
      username: "alice",
      role: "USER",
    });
    prisma.watchlist.findMany.mockResolvedValue([]);
    prisma.history.findMany.mockResolvedValue([]);
    prisma.rating.findMany.mockResolvedValue([]);

    const res = await request(app).get("/auth/me").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe("a@b.com");
    expect(res.body.data.watchlist).toEqual([]);
  });

  test("GET /auth/me requires authentication", async () => {
    const res = await request(app).get("/auth/me");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test("POST /auth/register validates password strength", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ email: "a@b.com", username: "alice", password: "weak" }); // Too short

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});

