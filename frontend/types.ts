
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  avatar?: string;
  watchlist: string[];
  history: string[];
  ratings: Record<string, number>; // movieId -> rating
  ratingNotes?: Record<string, string>; // movieId -> note/comment
}

export interface Movie {
  id: string;
  title: string;
  description: string;
  year: number;
  rating: number;
  category: string;
  posterUrl: string;
  /** URL YouTube (watch) ou autre ; affichée en fiche détail si présente. */
  trailerUrl?: string | null;
  duration: string;
  director: string;
}

/** Clés d’humeur alignées sur GET /user/recommendations?mood= */
export type RecommendationMoodKey =
  | 'neutral'
  | 'sad'
  | 'need_cheer'
  | 'motivation'
  | 'chill'
  | 'thrill';

/** Réponse GET /user/recommendations — titres toujours issus du catalogue (données réelles). */
export interface PersonalizedRecommendations {
  movies: Movie[];
  source: 'openai' | 'rules';
  insight: string;
  mood: RecommendationMoodKey;
}

export interface CatalogParams {
  search?: string;
  category?: string;
  minRating?: number;
  sort?: 'rating' | 'rating_desc' | 'rating_asc' | 'newest' | 'oldest' | 'title';
  page?: number;
  limit?: number;
  /** API synopsis locale (`?lang=`) */
  lang?: 'en' | 'fr';
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}
