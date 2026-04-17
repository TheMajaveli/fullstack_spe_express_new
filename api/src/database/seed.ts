import "dotenv/config";
import { readFileSync, existsSync } from "fs";
import path from "path";
import { db } from "./connection";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { normalizeMovieTitle } from "../services/movieService";

type JsonMovie = {
  id: string;
  title: string;
  description: string;
  descriptionFr?: string;
  year: number;
  duration: string;
  director: string;
  posterUrl: string;
  categories: string[];
  ratingAvg: number;
  trailerUrl?: string | null;
};

function resolveMoviesJsonPath(): string {
  const candidates = [
    path.join(process.cwd(), "..", "movies.json"),
    path.join(process.cwd(), "movies.json"),
    "/movies.json", // bind-mount Docker (voir docker-compose.yml)
  ];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  throw new Error(
    `movies.json introuvable. Cherché : ${candidates.join(", ")} — racine du dépôt ou volume Docker.`
  );
}

async function ensureCategory(categoryMap: Map<string, string>, name: string) {
  const trimmed = name.trim();
  if (!trimmed) return;
  if (categoryMap.has(trimmed)) return;

  const [existing] = await db.execute("SELECT id FROM categories WHERE name = ?", [trimmed]);
  const rows = existing as any[];
  if (rows.length > 0) {
    categoryMap.set(trimmed, rows[0].id);
    return;
  }
  const id = randomUUID();
  await db.execute("INSERT INTO categories (id, name) VALUES (?, ?)", [id, trimmed]);
  categoryMap.set(trimmed, id);
}

async function seed() {
  try {
    const jsonPath = resolveMoviesJsonPath();
    const parsed = JSON.parse(readFileSync(jsonPath, "utf-8")) as { movies: JsonMovie[] };
    if (!Array.isArray(parsed.movies)) {
      throw new Error("movies.json : la propriété « movies » doit être un tableau.");
    }

    const categoryMap = new Map<string, string>();
    for (const m of parsed.movies) {
      for (const c of m.categories || []) {
        await ensureCategory(categoryMap, c);
      }
    }
    console.log(`✅ ${categoryMap.size} catégories (movies.json)`);

    const dedupedMovies: JsonMovie[] = [];
    const seenTitleYear = new Set<string>();
    let skippedDup = 0;
    for (const m of parsed.movies) {
      const t = normalizeMovieTitle(m.title);
      const key = `${t}|${m.year}`;
      if (seenTitleYear.has(key)) {
        skippedDup += 1;
        continue;
      }
      seenTitleYear.add(key);
      dedupedMovies.push({ ...m, title: t });
    }
    if (skippedDup > 0) {
      console.log(`⚠️  ${skippedDup} entrée(s) ignorée(s) : doublon titre + année dans movies.json`);
    }

    const adminEmail = "admin@cinenoir.local";
    const adminPassword = "Admin1234";
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    const adminId = randomUUID();

    await db.execute(
      "INSERT INTO users (id, email, username, passwordHash, role) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE role = ?",
      [adminId, adminEmail, "admin", passwordHash, "ADMIN", "ADMIN"]
    );

    console.log(`✅ Admin user created: ${adminEmail} / ${adminPassword}`);

    const dummyUsers = [
      { username: "john_doe", email: "john@cinenoir.local" },
      { username: "jane_smith", email: "jane@cinenoir.local" },
      { username: "mike_wilson", email: "mike@cinenoir.local" },
      { username: "sarah_jones", email: "sarah@cinenoir.local" },
      { username: "david_brown", email: "david@cinenoir.local" },
      { username: "emma_davis", email: "emma@cinenoir.local" },
      { username: "chris_miller", email: "chris@cinenoir.local" },
      { username: "lisa_garcia", email: "lisa@cinenoir.local" },
      { username: "tom_martinez", email: "tom@cinenoir.local" },
      { username: "anna_rodriguez", email: "anna@cinenoir.local" },
      { username: "james_hernandez", email: "james@cinenoir.local" },
      { username: "maria_lopez", email: "maria@cinenoir.local" },
      { username: "robert_gonzalez", email: "robert@cinenoir.local" },
      { username: "patricia_wilson", email: "patricia@cinenoir.local" },
      { username: "michael_anderson", email: "michael@cinenoir.local" },
    ];

    const userPassword = "User1234";
    const userPasswordHash = await bcrypt.hash(userPassword, 12);

    for (const user of dummyUsers) {
      const userId = randomUUID();
      await db.execute(
        "INSERT INTO users (id, email, username, passwordHash, role) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE username = VALUES(username)",
        [userId, user.email, user.username, userPasswordHash, "USER"]
      );
    }

    console.log(`✅ Created ${dummyUsers.length} dummy users with password: ${userPassword}`);

    let n = 0;
    let withTrailer = 0;
    for (const m of dedupedMovies) {
      const releaseDate = new Date(`${m.year}-01-01T00:00:00.000Z`);
      const trailer = m.trailerUrl && String(m.trailerUrl).trim() ? String(m.trailerUrl).trim().slice(0, 512) : null;
      if (trailer) withTrailer += 1;
      const poster = String(m.posterUrl || "").slice(0, 500);

      const descriptionFr =
        m.descriptionFr && String(m.descriptionFr).trim() ? String(m.descriptionFr).trim().slice(0, 65535) : null;

      await db.execute(
        `INSERT INTO movies (id, title, description, descriptionFr, releaseDate, year, duration, director, ratingAvg, posterUrl, trailerUrl)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           title = VALUES(title),
           description = VALUES(description),
           descriptionFr = VALUES(descriptionFr),
           releaseDate = VALUES(releaseDate),
           year = VALUES(year),
           duration = VALUES(duration),
           director = VALUES(director),
           ratingAvg = VALUES(ratingAvg),
           posterUrl = VALUES(posterUrl),
           trailerUrl = VALUES(trailerUrl)`,
        [m.id, m.title, m.description, descriptionFr, releaseDate, m.year, m.duration, m.director, m.ratingAvg, poster, trailer]
      );

      await db.execute("DELETE FROM movie_categories WHERE movieId = ?", [m.id]);
      const cats = Array.from(new Set((m.categories || []).map((c) => String(c).trim()).filter(Boolean)));
      for (const catName of cats) {
        const catId = categoryMap.get(catName);
        if (catId) {
          await db.execute("INSERT IGNORE INTO movie_categories (movieId, categoryId) VALUES (?, ?)", [m.id, catId]);
        }
      }
      n += 1;
      if (n % 50 === 0) console.log(`  … ${n} films`);
    }

    console.log(
      `✅ ${dedupedMovies.length} films importés depuis ${path.relative(process.cwd(), jsonPath) || jsonPath} (${withTrailer} avec trailerUrl)`
    );
    await db.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    await db.end();
    process.exit(1);
  }
}

seed();
