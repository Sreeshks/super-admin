import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { AuthTokens } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 25000,
});

export const COMPANY_TOKEN_KEY = "nofa_company_admin_tokens";

export function getStoredTokens(): AuthTokens | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(COMPANY_TOKEN_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredTokens(tokens: AuthTokens | null): void {
  if (typeof window === "undefined") return;
  if (tokens) {
    localStorage.setItem(COMPANY_TOKEN_KEY, JSON.stringify(tokens));
  } else {
    localStorage.removeItem(COMPANY_TOKEN_KEY);
  }
}

// Request interceptor to attach Bearer token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const tokens = getStoredTokens();
    if (tokens?.access_token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${tokens.access_token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Mutex for refresh token flow to avoid duplicate concurrent calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });
  failedQueue = [];
};

// Response interceptor for token refresh & normalized error messages
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (
        originalRequest.url?.includes("/auth/login") ||
        originalRequest.url?.includes("/auth/refresh")
      ) {
        return Promise.reject(error);
      }

      const tokens = getStoredTokens();
      if (!tokens?.refresh_token) {
        setStoredTokens(null);
        if (typeof window !== "undefined" && window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => apiClient(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post<{
          success: boolean;
          message: string;
          data: AuthTokens;
        }>(`${BASE_URL}/auth/refresh`, {
          refresh_token: tokens.refresh_token,
        });

        const newTokens = refreshResponse.data.data;
        setStoredTokens(newTokens);
        processQueue(null);

        originalRequest.headers.Authorization = `Bearer ${newTokens.access_token}`;
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr as Error);
        setStoredTokens(null);
        if (typeof window !== "undefined" && window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data && typeof data === "object") {
      if ("message" in data && typeof data.message === "string") {
        return data.message;
      }
      if ("detail" in data) {
        if (typeof data.detail === "string") return data.detail;
        if (Array.isArray(data.detail)) {
          return data.detail.map((d: { msg?: string }) => d.msg || JSON.stringify(d)).join(", ");
        }
      }
    }
    if (error.message) return error.message;
  }
  return "An unexpected error occurred. Please try again.";
}

