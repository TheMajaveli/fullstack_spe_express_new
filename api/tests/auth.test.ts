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
});

