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
