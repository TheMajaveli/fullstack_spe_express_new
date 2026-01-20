
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
}

export interface Movie {
  id: string;
  title: string;
  description: string;
  year: number;
  rating: number;
  category: string;
  posterUrl: string;
  duration: string;
  director: string;
}

export interface CatalogParams {
  search?: string;
  category?: string;
  minRating?: number;
  sort?: 'rating' | 'newest' | 'title';
  page?: number;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}
