/**
 * Remplit `descriptionFr` dans ../movies.json (100 films) via l’API OpenAI.
 * Exécution : depuis le dossier api/ — npx ts-node --transpile-only scripts/fill-movie-descriptions-fr.ts
 * Requiert OPENAI_API_KEY dans api/.env
 */
import "dotenv/config";
import { readFileSync, writeFileSync } from "fs";
import path from "path";

type JsonMovie = {
  id: string;
  title: string;
  description: string;
  descriptionFr?: string;
  [k: string]: unknown;
};

const CHUNK = 20;

async function translateChunk(
  movies: { id: string; title: string; description: string }[],
  key: string,
  model: string
): Promise<Map<string, string>> {
  const payload = movies.map((m) => ({ id: m.id, title: m.title, description: m.description }));
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.25,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            'Tu traduis des synopsis de films de l’anglais vers le français (ton cinéma, naturel). Réponds uniquement avec un JSON : {"items":[{"id":"<uuid>","descriptionFr":"<texte>"}]} — une entrée par film, mêmes id, pas de titre dans descriptionFr.',
        },
        { role: "user", content: JSON.stringify(payload) },
      ],
    }),
  });
  const data = (await res.json()) as {
    error?: { message?: string };
    choices?: Array<{ message?: { content?: string } }>;
  };
  if (!res.ok) {
    throw new Error(data.error?.message || `HTTP ${res.status}`);
  }
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("Réponse OpenAI vide");
  const parsed = JSON.parse(text) as { items?: Array<{ id: string; descriptionFr: string }> };
  const items = parsed.items;
  if (!Array.isArray(items)) throw new Error("JSON sans tableau items");
  const map = new Map<string, string>();
  for (const it of items) {
    if (it?.id && typeof it.descriptionFr === "string" && it.descriptionFr.trim()) {
      map.set(it.id, it.descriptionFr.trim());
    }
  }
  return map;
}

async function main() {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) {
    console.error("OPENAI_API_KEY manquant (api/.env).");
    process.exit(1);
  }
  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
  const moviesPath = path.join(process.cwd(), "..", "movies.json");
  const raw = JSON.parse(readFileSync(moviesPath, "utf-8")) as { movies: JsonMovie[] };
  if (!Array.isArray(raw.movies)) {
    console.error("movies.json : propriété movies invalide");
    process.exit(1);
  }

  const need = raw.movies.filter((m) => !m.descriptionFr || !String(m.descriptionFr).trim());
  console.log(`Films sans descriptionFr : ${need.length} / ${raw.movies.length}`);

  const byId = new Map(raw.movies.map((m) => [m.id, m]));
  for (let i = 0; i < need.length; i += CHUNK) {
    const slice = need.slice(i, i + CHUNK).map((m) => ({
      id: m.id,
      title: m.title,
      description: m.description,
    }));
    console.log(`Lot ${i / CHUNK + 1} (${slice.length} titres)…`);
    const map = await translateChunk(slice, key, model);
    for (const m of slice) {
      const fr = map.get(m.id);
      if (!fr) {
        console.error(`Manquant pour id ${m.title} (${m.id})`);
        process.exit(1);
      }
      const row = byId.get(m.id);
      if (row) row.descriptionFr = fr;
    }
  }

  const out = JSON.stringify({ movies: raw.movies }, null, 2) + "\n";
  writeFileSync(moviesPath, out, "utf-8");
  console.log("Écrit :", moviesPath);
}

main().catch((e) => {
  console.error(e?.message || e);
  process.exit(1);
});
