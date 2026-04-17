/**
 * Remplit descriptionFr dans ../movies.json (traduction en → fr) via google-translate-api-x.
 * Depuis api/ : npx ts-node --transpile-only scripts/fill-movie-descriptions-fr-gtx.ts
 */
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { translate } from "google-translate-api-x";

type JsonMovie = { id: string; description: string; descriptionFr?: string; [k: string]: unknown };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const moviesPath = path.join(process.cwd(), "..", "movies.json");
  const raw = JSON.parse(readFileSync(moviesPath, "utf-8")) as { movies: JsonMovie[] };
  if (!Array.isArray(raw.movies)) throw new Error("movies invalide");

  let n = 0;
  for (let i = 0; i < raw.movies.length; i++) {
    const m = raw.movies[i];
    if (m.descriptionFr && String(m.descriptionFr).trim()) continue;
    const res = await translate(String(m.description || ""), { to: "fr" });
    m.descriptionFr = String(res.text || "").trim();
    n += 1;
    if (n % 10 === 0) {
      writeFileSync(moviesPath, JSON.stringify({ movies: raw.movies }, null, 2) + "\n", "utf-8");
      process.stdout.write(`\r… ${i + 1}/${raw.movies.length} (sauvegardé)`);
    }
    await sleep(120);
  }
  writeFileSync(moviesPath, JSON.stringify({ movies: raw.movies }, null, 2) + "\n", "utf-8");
  console.log(n ? `\nTraduits : ${n}` : "\nDéjà complets.");
}

main().catch((e) => {
  console.error(e?.message || e);
  process.exit(1);
});
