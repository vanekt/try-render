import { supabase } from "../supabase";

const apiUrl = import.meta.env.VITE_BACKEND_URL || "/api";

export async function apiRequest(endpoint, options = {}) {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      throw new Error("Failed to get session");
    }

    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (session?.access_token) {
      headers["Authorization"] = `Bearer ${session.access_token}`;
    }

    const response = await fetch(`${apiUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401 && session?.refresh_token) {
      const {
        data: { session: newSession },
        error: refreshError,
      } = await supabase.auth.refreshSession();

      if (!refreshError && newSession?.access_token) {
        headers["Authorization"] = `Bearer ${newSession.access_token}`;

        const retryResponse = await fetch(`${apiUrl}${endpoint}`, {
          ...options,
          headers,
        });

        return retryResponse;
      }
    }

    return response;
  } catch (error) {
    console.error("API request error:", error);
    throw error;
  }
}

export const api = {
  get: (endpoint) => apiRequest(endpoint, { method: "GET" }),

  post: (endpoint, data) =>
    apiRequest(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  put: (endpoint, data) =>
    apiRequest(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (endpoint) => apiRequest(endpoint, { method: "DELETE" }),
};
