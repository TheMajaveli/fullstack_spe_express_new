/** Fallback poster when movie poster URL fails to load (404, CORS, etc.) */
export const FALLBACK_POSTER_URL =
  'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=500';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000';

/** Résout l'URL d'une affiche : préfixe avec l'API si relative (/uploads/...), sinon garde l'URL telle quelle */
export function getPosterUrl(posterUrl: string | undefined): string {
  if (!posterUrl) return FALLBACK_POSTER_URL;
  if (posterUrl.startsWith('http://') || posterUrl.startsWith('https://')) return posterUrl;
  return `${API_URL}${posterUrl.startsWith('/') ? '' : '/'}${posterUrl}`;
}

/** Note affichée (API / DB peut renvoyer null ou une valeur non numérique). */
export function formatMovieRating(rating: unknown): string {
  const n = Number(rating);
  return Number.isFinite(n) ? n.toFixed(1) : '—';
}

/** Extrait l’ID vidéo YouTube pour iframe embed (watch, youtu.be, shorts). */
export function youtubeEmbedUrl(trailerUrl: string | undefined | null): string | null {
  if (!trailerUrl?.trim()) return null;
  const u = trailerUrl
    .trim()
    .replace(/^http:\/\//i, "https://")
    .replace(/m\.youtube\.com/i, "www.youtube.com");
  const watch = u.match(/[?&]v=([\w-]{11})/);
  if (watch) return `https://www.youtube.com/embed/${watch[1]}`;
  const short = u.match(/youtu\.be\/([\w-]{11})/);
  if (short) return `https://www.youtube.com/embed/${short[1]}`;
  const shorts = u.match(/youtube\.com\/shorts\/([\w-]{11})/);
  if (shorts) return `https://www.youtube.com/embed/${shorts[1]}`;
  const embedded = u.match(/youtube\.com\/embed\/([\w-]{11})/);
  if (embedded) return `https://www.youtube.com/embed/${embedded[1]}`;
  return null;
}
