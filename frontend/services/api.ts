
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
      if (params.category) qs.set("category", params.category);
      if (params.minRating != null) qs.set("rating", String(params.minRating));
      if (params.sort) qs.set("sort", params.sort);
      if (params.page) qs.set("page", String(params.page));

      const data = await requestWithRefresh<{ data: Movie[]; total: number; totalPages: number }>(
        `/movies?${qs.toString()}`,
        { method: "GET" }
      );
      return data;
    },
    get: async (id: string) => {
      return await requestWithRefresh<Movie>(`/movies/${id}`, { method: "GET" });
    },
    create: async (movie: Partial<Movie>) => {
      // Admin-only
      return await requestWithRefresh<Movie>(`/movies`, {
        method: "POST",
        headers: { ...getAuthHeaders() },
        body: JSON.stringify(movie),
      });
    },
    update: async (id: string, movie: Partial<Movie>) => {
      return await requestWithRefresh<Movie>(`/movies/${id}`, {
        method: "PUT",
        headers: { ...getAuthHeaders() },
        body: JSON.stringify(movie),
      });
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
    }
  }
};
