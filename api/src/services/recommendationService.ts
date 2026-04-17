/**
 * Recommandations personnalisées : invariant strict — chaque film renvoyé provient
 * uniquement des lignes retournées par la requête SQL sur `movies` (candidats).
 * L’IA ne fait qu’ordonner des id déjà présents dans ce jeu ; tout autre id est ignoré.
 */
import { db } from "../database/connection";
import { movieDescriptionForLang, toFrontendMovie, type MovieContentLang } from "./movieService";
import { getUserProfile } from "./userService";
import {
  type RecommendationMood,
  MOOD_AI_HINTS,
  MOOD_CATEGORY_BOOST,
  normalizeMood,
} from "./recommendationMoods";

/** Nombre max de titres tirés de la base pour classement (hors films déjà « engagés »). */
const MAX_CANDIDATES = Number(process.env.RECOMMENDATION_MAX_CANDIDATES) || 100;
/** Défaut de titres renvoyés si le client ne passe pas ?limit= */
const DEFAULT_RETURN = Number(process.env.RECOMMENDATION_MAX_RETURN) || 8;
/** Plafond absolu pour ?limit= (évite abus). */
const MAX_RETURN_CAP = 10;

function clampReturnLimit(raw: unknown): number {
  if (raw === undefined || raw === null || raw === "") return DEFAULT_RETURN;
  const n = typeof raw === "number" ? raw : parseInt(String(raw), 10);
  if (!Number.isFinite(n)) return DEFAULT_RETURN;
  const x = Math.floor(n);
  if (x < 1) return 1;
  if (x > MAX_RETURN_CAP) return MAX_RETURN_CAP;
  return x;
}
const DESCRIPTION_PREVIEW = 280;

function clampCandidateLimit(n: number): number {
  if (!Number.isFinite(n) || n < 20) return 20;
  if (n > 300) return 300;
  return Math.floor(n);
}

function truncate(text: string, max: number): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

async function fetchMoviesWithCategory(ids: string[]): Promise<any[]> {
  if (ids.length === 0) return [];
  const placeholders = ids.map(() => "?").join(",");
  const [rows] = await db.query(
    `SELECT m.*, MAX(c.name) as categoryName
     FROM movies m
     LEFT JOIN movie_categories mc ON m.id = mc.movieId
     LEFT JOIN categories c ON mc.categoryId = c.id
     WHERE m.id IN (${placeholders})
     GROUP BY m.id`,
    ids
  );
  return rows as any[];
}

async function fetchCandidateRows(excludeIds: string[], limit: number): Promise<any[]> {
  const base = `
    SELECT m.*, MAX(c.name) as categoryName
    FROM movies m
    LEFT JOIN movie_categories mc ON m.id = mc.movieId
    LEFT JOIN categories c ON mc.categoryId = c.id
  `;
  if (excludeIds.length === 0) {
    const [rows] = await db.query(
      `${base}
       GROUP BY m.id
       ORDER BY m.ratingAvg DESC, m.year DESC
       LIMIT ?`,
      [limit]
    );
    return rows as any[];
  }
  const ph = excludeIds.map(() => "?").join(",");
  const [rows] = await db.query(
    `${base}
     WHERE m.id NOT IN (${ph})
     GROUP BY m.id
     ORDER BY m.ratingAvg DESC, m.year DESC
     LIMIT ?`,
    [...excludeIds, limit]
  );
  return rows as any[];
}

function rankByRules(
  tasteRows: any[],
  candidateRows: any[],
  mood: RecommendationMood,
  lang: MovieContentLang
): { orderedIds: string[]; insight: string } {
  const tasteCats = new Set(
    tasteRows.map((r) => String(r.categoryName || "").trim()).filter(Boolean)
  );
  const tasteDirectors = new Set(
    tasteRows.map((r) => String(r.director || "").trim()).filter(Boolean)
  );
  const moodCats = new Set(MOOD_CATEGORY_BOOST[mood]);
  const scored = candidateRows.map((row) => {
    const cat = String(row.categoryName || "").trim();
    let score = Number(row.ratingAvg) || 0;
    if (tasteCats.has(cat)) score += 5;
    const dir = String(row.director || "").trim();
    if (tasteDirectors.has(dir)) score += 2;
    if (mood !== "neutral" && moodCats.has(cat)) score += 4;
    return { id: row.id, score };
  });
  scored.sort((a, b) => b.score - a.score);
  const hasTaste = tasteRows.length > 0;
  const insight =
    lang === "fr"
      ? mood === "neutral"
        ? hasTaste
          ? "Des films choisis en lien avec ce que vous avez déjà aimé."
          : "Une sélection de titres forts pour vous guider."
        : hasTaste
          ? "Nous avons combiné votre humeur du moment et vos goûts pour cette sélection."
          : "Cette sélection met l’accent sur votre humeur du moment."
      : mood === "neutral"
        ? hasTaste
          ? "Picks chosen to line up with what you already enjoy."
          : "A set of standout titles to get you started."
        : hasTaste
          ? "We’ve blended how you’re feeling with your tastes for this lineup."
          : "These picks lean into how you’re feeling right now.";
  return { orderedIds: scored.map((s) => s.id), insight };
}

function parseAiPayload(raw: string): { orderedIds: string[]; insight: string } | null {
  const trimmed = raw.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  const jsonStr = jsonMatch ? jsonMatch[0] : trimmed;
  try {
    const parsed = JSON.parse(jsonStr) as { orderedIds?: unknown; insight?: unknown };
    if (!Array.isArray(parsed.orderedIds)) return null;
    const orderedIds = parsed.orderedIds.filter((id): id is string => typeof id === "string" && id.length > 0);
    const insight = typeof parsed.insight === "string" ? parsed.insight.trim() : "";
    return { orderedIds, insight };
  } catch {
    return null;
  }
}

async function openaiRankCandidates(
  tasteLines: string[],
  candidates: Array<{
    id: string;
    title: string;
    year: number;
    category: string;
    director: string;
    blurb: string;
  }>,
  mood: RecommendationMood
): Promise<{ orderedIds: string[]; insight: string } | null> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;

  try {
    const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
    const userPayload = {
      consigne:
        "Classe UNIQUEMENT les entrées du tableau candidats (films déjà en base). Copie les valeurs id à l'identique depuis candidats — n'invente aucun film ni aucun id. Tout id absent de candidats sera rejeté côté serveur.",
      humeur: MOOD_AI_HINTS[mood],
      gouts_utilisateur: tasteLines.length
        ? tasteLines
        : ["(aucun historique : proposer une découverte variée parmi les candidats)"],
      candidats: candidates,
    };

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.35,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "Tu es un conseiller cinéma. Réponse JSON uniquement : orderedIds (tableau) et insight (une phrase en français, peut mentionner l'humeur). Respecte le champ humeur du message utilisateur pour l'ordre de préférence. orderedIds ne doit contenir QUE des id copiés depuis le champ id des objets du tableau candidats. Aucun titre ou id hors de ce tableau.",
          },
          { role: "user", content: JSON.stringify(userPayload) },
        ],
      }),
    });

    if (!res.ok) return null;
    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const text = data.choices?.[0]?.message?.content;
    if (!text) return null;
    return parseAiPayload(text);
  } catch {
    return null;
  }
}

function dedupeIds(ids: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of ids) {
    if (!seen.has(id)) {
      seen.add(id);
      out.push(id);
    }
  }
  return out;
}

export type PersonalizedRecommendations = {
  movies: ReturnType<typeof toFrontendMovie>[];
  source: "openai" | "rules";
  insight: string;
  mood: RecommendationMood;
};

export async function getPersonalizedRecommendations(
  userId: string,
  options?: { mood?: string | undefined; lang?: MovieContentLang; limit?: unknown }
): Promise<PersonalizedRecommendations> {
  const mood = normalizeMood(options?.mood);
  const lang: MovieContentLang = options?.lang === "fr" ? "fr" : "en";
  const returnLimit = clampReturnLimit(options?.limit);
  const candidateLimit = clampCandidateLimit(MAX_CANDIDATES);
  const profile = await getUserProfile(userId);
  const engaged = new Set<string>([
    ...profile.watchlist,
    ...profile.history,
    ...Object.keys(profile.ratings),
  ]);

  const tasteIds = Array.from(
    new Set([...profile.watchlist, ...Object.keys(profile.ratings), ...profile.history])
  );
  const tasteRows = await fetchMoviesWithCategory(tasteIds.slice(0, 48));

  const exclude = Array.from(engaged);
  let candidateRows = await fetchCandidateRows(exclude, candidateLimit);

  if (candidateRows.length === 0 && exclude.length > 0) {
    candidateRows = await fetchCandidateRows([], candidateLimit);
    candidateRows = candidateRows.filter((r) => !engaged.has(r.id)).slice(0, candidateLimit);
  }

  if (candidateRows.length === 0) {
    return {
      movies: [],
      source: "rules",
      insight: lang === "fr" ? "Aucune suggestion pour l’instant." : "No suggestions right now.",
      mood,
    };
  }

  const validIds = new Set(candidateRows.map((r) => r.id));
  const candidatesPayload = candidateRows.map((row) => ({
    id: row.id,
    title: row.title,
    year: row.year,
    category: String(row.categoryName || "Uncategorized"),
    director: String(row.director || ""),
    blurb: truncate(movieDescriptionForLang(row, lang), DESCRIPTION_PREVIEW),
  }));

  const tasteLines = tasteRows.map((row) => {
    const r = profile.ratings[row.id];
    const parts = [`${row.title} (${row.year})`, String(row.categoryName || ""), String(row.director || "")];
    if (r != null) parts.push(`note utilisateur ${r}/10`);
    return parts.filter(Boolean).join(" · ");
  });

  const rules = rankByRules(tasteRows, candidateRows, mood, lang);
  let orderedIds: string[] = rules.orderedIds;
  let insight = rules.insight;
  let source: "openai" | "rules" = "rules";

  const ai = await openaiRankCandidates(tasteLines, candidatesPayload, mood);
  const aiFiltered = ai?.orderedIds.filter((id) => validIds.has(id)) ?? [];
  if (ai && aiFiltered.length > 0) {
    const rest = rules.orderedIds.filter((id) => !aiFiltered.includes(id));
    orderedIds = dedupeIds([...aiFiltered, ...rest]);
    insight = ai.insight || insight;
    source = "openai";
  } else {
    orderedIds = dedupeIds(orderedIds);
  }

  orderedIds = orderedIds.filter((id) => validIds.has(id));
  orderedIds = orderedIds.slice(0, returnLimit);
  const rowById = new Map(candidateRows.map((r) => [r.id, r]));
  const movies = orderedIds
    .map((id) => rowById.get(id))
    .filter((row): row is NonNullable<typeof row> => row != null)
    .map((row) => toFrontendMovie(row, lang));

  return { movies, source, insight, mood };
}
