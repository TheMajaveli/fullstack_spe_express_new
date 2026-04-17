/** Valeurs acceptées pour ?mood= sur GET /user/recommendations */
export const RECOMMENDATION_MOODS = [
  "neutral",
  "sad",
  "need_cheer",
  "motivation",
  "chill",
  "thrill",
] as const;

export type RecommendationMood = (typeof RECOMMENDATION_MOODS)[number];

export function normalizeMood(raw: unknown): RecommendationMood {
  if (typeof raw === "string" && (RECOMMENDATION_MOODS as readonly string[]).includes(raw)) {
    return raw as RecommendationMood;
  }
  return "neutral";
}

/** Catégories DB à favoriser selon l’humeur (mode règles). */
export const MOOD_CATEGORY_BOOST: Record<RecommendationMood, string[]> = {
  neutral: [],
  sad: ["Drama", "Romance", "Comedy"],
  need_cheer: ["Comedy", "Romance", "Musical", "Animation"],
  motivation: ["Biography", "Sport", "Drama", "Documentary"],
  chill: ["Comedy", "Romance", "Animation", "Nature", "Fantasy"],
  thrill: ["Action", "Thriller", "Horror", "Sci-Fi", "Crime", "Adventure"],
};

/** Instructions pour le modèle (IA) — uniquement pour ordonner les candidats fournis. */
export const MOOD_AI_HINTS: Record<RecommendationMood, string> = {
  neutral: "Humeur neutre : proposer un mix équilibré parmi les candidats.",
  sad: "Spectateur triste ou fragile : privilégier réconfort, empathie, fins ouvertes ou douceur (uniquement parmi les candidats listés).",
  need_cheer: "Besoin de remonter le moral : comédies, feel-good, légèreté (candidats uniquement).",
  motivation: "Cherche la motivation : récits inspirants, dépassement, sport, biographie (candidats uniquement).",
  chill: "Détente : films relaxants, romance, comédie légère, animation (candidats uniquement).",
  thrill: "Envie de sensations : action, tension, frissons, SF intense (candidats uniquement).",
};
