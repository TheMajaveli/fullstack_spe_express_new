/**
 * Calls getPersonalizedRecommendations for the first USER in DB (real data + optional OpenAI).
 * Run from api/: npx ts-node --transpile-only scripts/smoke-recommendations.ts
 */
import "dotenv/config";
import { db } from "../src/database/connection";
import { getPersonalizedRecommendations } from "../src/services/recommendationService";

async function main() {
  const [rows] = await db.query(
    "SELECT id, username FROM users WHERE role = 'USER' ORDER BY createdAt ASC LIMIT 1"
  );
  const list = rows as { id: string; username: string }[];
  if (!list.length) {
    console.error("No USER in database. Run: npm run db:seed");
    process.exit(1);
  }
  const { id, username } = list[0];
  console.log("User:", username, "(" + id + ")");
  console.log("OPENAI_API_KEY set:", Boolean(process.env.OPENAI_API_KEY?.trim()));

  const result = await getPersonalizedRecommendations(id);
  console.log("source:", result.source);
  console.log("insight:", result.insight);
  console.log(
    "movies:",
    result.movies.map((m) => ({ id: m.id, title: m.title, year: m.year, category: m.category }))
  );
  await db.end();
  process.exit(0);
}

main().catch(async (e) => {
  console.error(e?.message || e);
  try {
    await db.end();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
