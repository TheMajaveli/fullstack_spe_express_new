import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";

import { db } from "./database/connection";
import { errorHandler } from "./middlewares/errorHandler";
import { authRoutes } from "./routes/authRoutes";
import { movieRoutes } from "./routes/movieRoutes";
import { userRoutes } from "./routes/userRoutes";
import { categoryRoutes } from "./routes/categoryRoutes";
import { adminRoutes } from "./routes/adminRoutes";

export function createApp() {
  const app = express();

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );
  app.use(cors());
  app.use(express.json());

  // Static uploads
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  // Rate limit auth endpoints (mounted later under /auth)
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  });

  // Health (includes DB check to verify connection and database)
  app.get("/health", async (_req, res) => {
    try {
      const [rows] = await db.query("SELECT DATABASE() as db, COUNT(*) as movieCount FROM movies");
      const info = (rows as any[])[0];
      res.json({
        ok: true,
        database: info?.db ?? "unknown",
        movieCount: Number(info?.movieCount ?? 0),
      });
    } catch (e: any) {
      res.status(503).json({
        ok: false,
        error: "Database unreachable",
        message: e?.message ?? String(e),
      });
    }
  });

  app.use("/auth", authLimiter, authRoutes);
  app.use("/movies", movieRoutes);
  app.use("/user", userRoutes);
  app.use("/categories", categoryRoutes);
  app.use("/admin", adminRoutes);

  app.use(errorHandler);
  return app;
}

