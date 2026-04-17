import type { Request } from "express";
import type { MovieContentLang } from "../services/movieService";

export function movieLangFromRequest(req: Request): MovieContentLang {
  const raw = req.query.lang;
  const q = typeof raw === "string" ? raw : Array.isArray(raw) ? String(raw[0]) : "";
  if (q) {
    const s = q.toLowerCase().slice(0, 2);
    return s === "fr" ? "fr" : "en";
  }
  const best = req.acceptsLanguages?.(["fr", "en"]);
  return best === "fr" ? "fr" : "en";
}
