import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";

import { errorHandler } from "./middlewares/errorHandler";
import { authRoutes } from "./routes/authRoutes";
import { movieRoutes } from "./routes/movieRoutes";
import { userRoutes } from "./routes/userRoutes";
import { categoryRoutes } from "./routes/categoryRoutes";

export function createApp() {
  const app = express();

  app.use(helmet());
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

  // Health
  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use("/auth", authLimiter, authRoutes);
  app.use("/movies", movieRoutes);
  app.use("/user", userRoutes);
  app.use("/categories", categoryRoutes);

  app.use(errorHandler);
  return app;
}

