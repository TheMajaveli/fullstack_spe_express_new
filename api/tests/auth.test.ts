import request from "supertest";
import { createApp } from "../src/app";
import { dbMock } from "./__mocks__/mysqlClient";

jest.mock("../src/database/connection", () => {
  const { dbMock } = require("./__mocks__/mysqlClient");
  return { db: dbMock };
});

describe("auth", () => {
  const app = createApp();

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_ACCESS_SECRET = "test-access";
    process.env.JWT_ACCESS_EXPIRES_IN = "15m";
  });

  test("POST /auth/register returns tokens + user", async () => {
    // Mock: check if user exists (returns empty array)
    dbMock.execute.mockResolvedValueOnce([[], []]);
    // Mock: insert user
    dbMock.execute.mockResolvedValueOnce([{ affectedRows: 1 }, []]);
    // Mock: get user after insert
    dbMock.execute.mockResolvedValueOnce([
      [{ id: "u1", email: "a@b.com", username: "alice", role: "USER" }],
      [],
    ]);
    // Mock: insert refresh token
    dbMock.execute.mockResolvedValueOnce([{ affectedRows: 1 }, []]);

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
    const passwordHash = await require("bcrypt").hash("Password1", 1);
    // Mock: find user
    dbMock.execute.mockResolvedValueOnce([
      [{ id: "u1", email: "a@b.com", username: "alice", role: "USER", passwordHash }],
      [],
    ]);
    // Mock: insert refresh token
    dbMock.execute.mockResolvedValueOnce([{ affectedRows: 1 }, []]);

    const res = await request(app).post("/auth/login").send({ email: "a@b.com", password: "Password1" });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.username).toBe("alice");
    expect(res.body.data.accessToken).toBeTruthy();
    expect(res.body.data.refreshToken).toBeTruthy();
  });

  test("POST /auth/register rejects duplicate email", async () => {
    // Mock: user already exists
    dbMock.execute.mockResolvedValueOnce([[{ id: "existing", email: "a@b.com" }], []]);

    const res = await request(app)
      .post("/auth/register")
      .send({ email: "a@b.com", username: "alice", password: "Password1" });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("EMAIL_TAKEN");
  });

  test("POST /auth/login rejects invalid credentials", async () => {
    // Mock: user not found
    dbMock.execute.mockResolvedValueOnce([[], []]);

    const res = await request(app).post("/auth/login").send({ email: "a@b.com", password: "WrongPass" });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
  });

  test("POST /auth/refresh returns new access token", async () => {
    const refreshToken = "valid-refresh-token";
    const tokenHash = require("crypto").createHash("sha256").update(refreshToken).digest("hex");

    // Mock: find refresh token with user
    dbMock.execute.mockResolvedValueOnce([
      [
        {
          id: "rt1",
          tokenHash,
          userId: "u1",
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          email: "a@b.com",
          username: "alice",
          role: "USER",
        },
      ],
      [],
    ]);

    const res = await request(app).post("/auth/refresh").send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeTruthy();
  });

  test("POST /auth/refresh rejects expired token", async () => {
    const refreshToken = "expired-token";
    const tokenHash = require("crypto").createHash("sha256").update(refreshToken).digest("hex");

    // Mock: find expired token
    dbMock.execute.mockResolvedValueOnce([
      [
        {
          id: "rt1",
          tokenHash,
          userId: "u1",
          expiresAt: new Date(Date.now() - 1000), // Expired
          email: "a@b.com",
          username: "alice",
          role: "USER",
        },
      ],
      [],
    ]);
    // Mock: delete expired token
    dbMock.execute.mockResolvedValueOnce([{ affectedRows: 1 }, []]);

    const res = await request(app).post("/auth/refresh").send({ refreshToken });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("REFRESH_EXPIRED");
  });

  test("POST /auth/logout invalidates refresh token", async () => {
    const refreshToken = "token-to-delete";
    const tokenHash = require("crypto").createHash("sha256").update(refreshToken).digest("hex");

    // Mock: delete token
    dbMock.execute.mockResolvedValueOnce([{ affectedRows: 1 }, []]);

    const res = await request(app).post("/auth/logout").send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(dbMock.execute).toHaveBeenCalledWith(expect.stringContaining("DELETE FROM refresh_tokens"), [
      tokenHash,
    ]);
  });

  test("GET /auth/me returns user profile", async () => {
    const jwt = require("jsonwebtoken");
    const token = jwt.sign(
      { sub: "u1", role: "USER", email: "a@b.com", username: "alice" },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    // Mock: get user
    dbMock.execute.mockResolvedValueOnce([
      [{ id: "u1", email: "a@b.com", username: "alice", role: "USER" }],
      [],
    ]);
    // Mock: get watchlist
    dbMock.execute.mockResolvedValueOnce([[], []]);
    // Mock: get history
    dbMock.execute.mockResolvedValueOnce([[], []]);
    // Mock: get ratings
    dbMock.execute.mockResolvedValueOnce([[], []]);

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
