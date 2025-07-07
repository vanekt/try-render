import axios, { InternalAxiosRequestConfig, AxiosError } from "axios";
import { supabase } from "../supabase";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token) {
    config.headers = config.headers || {};
    config.headers["Authorization"] = `Bearer ${session.access_token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const {
        data: { session: newSession },
        error: refreshError,
      } = await supabase.auth.refreshSession();

      if (!refreshError && newSession?.access_token) {
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers[
          "Authorization"
        ] = `Bearer ${newSession.access_token}`;
        return api(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

export { api };
