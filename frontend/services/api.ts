
import { Movie, User, CatalogParams } from "../types";

type ApiSuccess<T> = { success: true; data: T };
type ApiError = { success: false; error: { message: string; code?: string; details?: any } };
type ApiResponse<T> = ApiSuccess<T> | ApiError;

const API_URL = (import.meta as any).env?.VITE_API_URL || "http://localhost:4000";

const getAuthHeaders = () => {
  try {
    const raw = localStorage.getItem("cinenoir-v2-storage");
    if (!raw) return {};
    const state = JSON.parse(raw)?.state;
    const token = state?.accessToken;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
};

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  const json = (await res.json()) as ApiResponse<T>;
  if (!("success" in json) || json.success !== true) {
    const err = (json as ApiError).error?.message || `Request failed (${res.status})`;
    throw new Error(err);
  }
  return json.data;
}

async function requestWithRefresh<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    return await requestJson<T>(path, init);
  } catch (e: any) {
    // If unauthorized, attempt refresh once
    if (String(e?.message || "").toLowerCase().includes("unauthorized")) {
      const raw = localStorage.getItem("cinenoir-v2-storage");
      const refreshToken = raw ? JSON.parse(raw)?.state?.refreshToken : null;
      if (refreshToken) {
        const refreshed = await requestJson<{ accessToken: string }>("/auth/refresh", {
          method: "POST",
          body: JSON.stringify({ refreshToken }),
        });
        // Persist new accessToken back into zustand storage shape
        const parsed = JSON.parse(raw);
        parsed.state.accessToken = refreshed.accessToken;
        localStorage.setItem("cinenoir-v2-storage", JSON.stringify(parsed));
        return await requestJson<T>(path, init);
      }
    }
    throw e;
  }
}

export const api = {
  movies: {
    list: async (params: CatalogParams) => {
      const qs = new URLSearchParams();
      if (params.search) qs.set("q", params.search);
      if (params.category && params.category !== "Tous") qs.set("category", params.category);
      if (params.minRating != null) qs.set("rating", String(params.minRating));
      if (params.sort) qs.set("sort", params.sort);
      if (params.page) qs.set("page", String(params.page));
      if (params.limit) qs.set("limit", String(params.limit));

      const data = await requestWithRefresh<{ data: Movie[]; total: number; totalPages: number }>(
        `/movies?${qs.toString()}`,
        { method: "GET" }
      );
      return data;
    },
    get: async (id: string) => {
      return await requestWithRefresh<Movie>(`/movies/${id}`, { method: "GET" });
    },
    create: async (movie: Partial<Movie>, posterFile?: File) => {
      // Admin-only - Use FormData for file upload
      const formData = new FormData();
      formData.append("title", movie.title || "");
      formData.append("description", movie.description || "");
      formData.append("year", String(movie.year || ""));
      formData.append("duration", movie.duration || "");
      formData.append("director", movie.director || "");
      formData.append("category", movie.category || "");
      if (posterFile) {
        formData.append("poster", posterFile);
      } else if (movie.posterUrl) {
        formData.append("posterUrl", movie.posterUrl);
      }

      const res = await fetch(`${API_URL}/movies`, {
        method: "POST",
        headers: { ...getAuthHeaders() },
        body: formData,
      });

      const json = (await res.json()) as ApiResponse<Movie>;
      if (!("success" in json) || json.success !== true) {
        const err = (json as ApiError).error?.message || `Request failed (${res.status})`;
        throw new Error(err);
      }
      return json.data;
    },
    update: async (id: string, movie: Partial<Movie>, posterFile?: File) => {
      // Use FormData for file upload
      const formData = new FormData();
      if (movie.title) formData.append("title", movie.title);
      if (movie.description) formData.append("description", movie.description);
      if (movie.year) formData.append("year", String(movie.year));
      if (movie.duration) formData.append("duration", movie.duration);
      if (movie.director) formData.append("director", movie.director);
      if (movie.category) formData.append("category", movie.category);
      if (posterFile) {
        formData.append("poster", posterFile);
      } else if (movie.posterUrl) {
        formData.append("posterUrl", movie.posterUrl);
      }

      const res = await fetch(`${API_URL}/movies/${id}`, {
        method: "PUT",
        headers: { ...getAuthHeaders() },
        body: formData,
      });

      const json = (await res.json()) as ApiResponse<Movie>;
      if (!("success" in json) || json.success !== true) {
        const err = (json as ApiError).error?.message || `Request failed (${res.status})`;
        throw new Error(err);
      }
      return json.data;
    },
    delete: async (id: string) => {
      const res = await requestWithRefresh<boolean>(`/movies/${id}`, {
        method: "DELETE",
        headers: { ...getAuthHeaders() },
      });
      return res;
    }
  },
  auth: {
    login: async (email: string, password: string) => {
      const data = await requestJson<{ user: User; accessToken: string; refreshToken: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      return data;
    },
    register: async (email: string, username: string, password: string) => {
      const data = await requestJson<{ user: User; accessToken: string; refreshToken: string }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, username, password }),
      });
      return data;
    },
    me: async () => {
      return await requestWithRefresh<User>("/auth/me", {
        method: "GET",
        headers: { ...getAuthHeaders() },
      });
    },
    forgotPassword: async (email: string) => {
      return await requestJson<{ success: boolean; message: string }>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
    },
    resetPassword: async (token: string, password: string) => {
      return await requestJson<{ success: boolean; message: string }>("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });
    },
    updatePassword: async (currentPassword: string, newPassword: string) => {
      return await requestWithRefresh<{ success: boolean; message: string }>("/auth/update-password", {
        method: "POST",
        headers: { ...getAuthHeaders() },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
    }
  },
  user: {
    addWatchlist: async (movieId: string) => {
      const user = await requestWithRefresh<User>(`/user/watchlist/${movieId}`, {
        method: "POST",
        headers: { ...getAuthHeaders() },
      });
      return { watchlist: user.watchlist };
    },
    removeWatchlist: async (movieId: string) => {
      const user = await requestWithRefresh<User>(`/user/watchlist/${movieId}`, {
        method: "DELETE",
        headers: { ...getAuthHeaders() },
      });
      return { watchlist: user.watchlist };
    },
    addRating: async (movieId: string, ratingNumber: number, note?: string) => {
      const user = await requestWithRefresh<User>(`/user/ratings/${movieId}`, {
        method: "POST",
        headers: { ...getAuthHeaders() },
        body: JSON.stringify({ ratingNumber, note }),
      });
      return { rating: { ratingNumber, note }, user: user };
    },
    addHistory: async (movieId: string) => {
      const user = await requestWithRefresh<User>(`/user/history/${movieId}`, {
        method: "POST",
        headers: { ...getAuthHeaders() },
      });
      return { history: user.history };
    }
  },
  categories: {
    list: async () => {
      return await requestWithRefresh<Array<{ id: string; name: string; createdAt: string }>>("/categories", {
        method: "GET",
      });
    },
    create: async (name: string) => {
      return await requestWithRefresh<{ id: string; name: string; createdAt: string }>("/categories", {
        method: "POST",
        headers: { ...getAuthHeaders() },
        body: JSON.stringify({ name }),
      });
    },
    update: async (id: string, name: string) => {
      return await requestWithRefresh<{ id: string; name: string; createdAt: string }>(`/categories/${id}`, {
        method: "PUT",
        headers: { ...getAuthHeaders() },
        body: JSON.stringify({ name }),
      });
    },
    delete: async (id: string) => {
      return await requestWithRefresh<boolean>(`/categories/${id}`, {
        method: "DELETE",
        headers: { ...getAuthHeaders() },
      });
    }
  },
  admin: {
    getStats: async () => {
      return await requestWithRefresh<{
        totalUsers: number;
        totalAdmins: number;
        totalMovies: number;
        totalCategories: number;
        totalRatings: number;
        totalWatchlistItems: number;
        totalHistoryItems: number;
        averageRating: number;
        recentUsers: Array<{ id: string; username: string; email: string; role: string; createdAt: string }>;
        recentMovies: Array<{ id: string; title: string; year: number; ratingAvg: number; createdAt: string }>;
        topRatedMovies: Array<{ id: string; title: string; ratingAvg: number; year: number }>;
        categoryDistribution: Array<{ categoryName: string; movieCount: number }>;
        userActivity: Array<{ date: string; registrations: number; ratings: number; watchlistAdds: number }>;
      }>("/admin/stats", {
        method: "GET",
        headers: { ...getAuthHeaders() },
      });
    },
    getUsers: async () => {
      return await requestWithRefresh<Array<{
        id: string;
        username: string;
        email: string;
        role: string;
        createdAt: string;
        watchlistCount: number;
        ratingsCount: number;
        historyCount: number;
      }>>("/admin/users", {
        method: "GET",
        headers: { ...getAuthHeaders() },
      });
    },
    getAnalytics: async () => {
      return await requestWithRefresh<{
        moviesByYear: Array<{ year: number; count: number }>;
        ratingsDistribution: Array<{ rating: number; count: number }>;
        mostWatched: Array<{ id: string; title: string; watchCount: number }>;
        mostRated: Array<{ id: string; title: string; ratingCount: number; avgRating: number }>;
      }>("/admin/analytics", {
        method: "GET",
        headers: { ...getAuthHeaders() },
      });
    }
  }
};
