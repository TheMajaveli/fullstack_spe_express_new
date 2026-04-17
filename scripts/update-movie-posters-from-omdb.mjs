#!/usr/bin/env node
/**
 * Met à jour posterUrl dans movies.json via OMDb (affiches Amazon, fiables pour le hotlinking).
 *
 * Usage (racine du dépôt) :
 *   node scripts/update-movie-posters-from-omdb.mjs
 *
 * Variables d’environnement :
 *   OMDB_API_KEY — https://www.omdbapi.com/apikey.aspx (recommandé ; quota plus élevé)
 *   OMDB_DELAY_MS — délai entre requêtes (défaut 120)
 *
 * Logique :
 *   1) GET par imdbId ; si Poster = N/A → GET par title + year
 *   2) Remplace _SX300 par _SX500 pour une meilleure résolution quand c’est possible
 */

import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const jsonPath = join(root, "movies.json");

const API_KEY = process.env.OMDB_API_KEY || "trilogy";
const DELAY_MS = Number(process.env.OMDB_DELAY_MS || 120);

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function upgradePosterSize(url) {
  if (typeof url !== "string") return url;
  return url.replace(/_SX300(?=\.jpg)/i, "_SX500");
}

async function fetchByImdb(imdbId) {
  const u = new URL("https://www.omdbapi.com/");
  u.searchParams.set("i", imdbId);
  u.searchParams.set("apikey", API_KEY);
  const res = await fetch(u);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${imdbId}`);
  return res.json();
}

async function fetchByTitleYear(title, year) {
  const u = new URL("https://www.omdbapi.com/");
  u.searchParams.set("t", title);
  u.searchParams.set("y", String(year));
  u.searchParams.set("apikey", API_KEY);
  const res = await fetch(u);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${title}`);
  return res.json();
}

function pickPoster(d) {
  if (d.Response === "False") return null;
  const p = d.Poster;
  if (!p || p === "N/A") return null;
  return upgradePosterSize(p);
}

async function resolvePoster(m) {
  const byId = await fetchByImdb(m.imdbId);
  let poster = pickPoster(byId);
  if (poster) return { poster, detail: byId };

  await sleep(DELAY_MS);
  const byTitle = await fetchByTitleYear(m.title, m.year);
  poster = pickPoster(byTitle);
  return { poster, detail: byTitle };
}

async function main() {
  const doc = JSON.parse(readFileSync(jsonPath, "utf8"));
  if (!Array.isArray(doc.movies)) {
    console.error("movies.json: « movies » invalide");
    process.exit(1);
  }

  let ok = 0;
  let skip = 0;
  let fail = 0;

  for (let i = 0; i < doc.movies.length; i++) {
    const m = doc.movies[i];
    if (!m.imdbId) {
      console.warn(`[${i + 1}] ${m.title}: pas d’imdbId`);
      skip += 1;
      continue;
    }
    try {
      const { poster } = await resolvePoster(m);
      if (poster) {
        m.posterUrl = poster;
        ok += 1;
      } else {
        console.warn(`[${i + 1}] ${m.title}: pas d’affiche OMDb`);
        skip += 1;
      }
    } catch (e) {
      console.error(`[${i + 1}] ${m.title}:`, e?.message || e);
      fail += 1;
    }
    if (i < doc.movies.length - 1) await sleep(DELAY_MS);
    if ((i + 1) % 50 === 0) console.log(`… ${i + 1}/${doc.movies.length}`);
  }

  writeFileSync(jsonPath, `${JSON.stringify(doc, null, 2)}\n`, "utf8");
  console.log(`Terminé : ${ok} affiches, ${skip} sans poster, ${fail} erreurs.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
