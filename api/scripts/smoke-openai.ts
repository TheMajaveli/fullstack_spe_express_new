/**
 * Quick check that OPENAI_API_KEY works (no DB).
 * Run from api/: npx ts-node --transpile-only scripts/smoke-openai.ts
 */
import "dotenv/config";

async function main() {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) {
    console.error("Missing OPENAI_API_KEY. Add it to api/.env (not frontend/.env.local).");
    process.exit(1);
  }
  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: 16,
      messages: [{ role: "user", content: 'Reply with exactly: {"ok":true}' }],
      response_format: { type: "json_object" },
    }),
  });
  const data = (await res.json()) as { error?: { message?: string }; choices?: unknown[] };
  if (!res.ok) {
    console.error("OpenAI error:", data.error?.message || res.status);
    process.exit(1);
  }
  if (!data.choices?.length) {
    console.error("Unexpected response shape");
    process.exit(1);
  }
  console.log("OpenAI OK, model:", model);
  process.exit(0);
}

main().catch((e) => {
  console.error(e?.message || e);
  process.exit(1);
});
