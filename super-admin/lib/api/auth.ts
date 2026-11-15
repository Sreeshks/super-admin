import { apiClient } from "./client";
import { AuthTokens, StandardResponse, User } from "@/types";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface PasswordResetPayload {
  email: string;
}

export interface PasswordConfirmPayload {
  token: string;
  new_password: string;
}

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthTokens> => {
    const res = await apiClient.post<StandardResponse<AuthTokens>>("/auth/login", payload);
    return res.data.data;
  },

  getMe: async (): Promise<User> => {
    const res = await apiClient.get<StandardResponse<User>>("/auth/me");
    return res.data.data;
  },

  refreshToken: async (refreshToken: string): Promise<AuthTokens> => {
    const res = await apiClient.post<StandardResponse<AuthTokens>>("/auth/refresh", {
      refresh_token: refreshToken,
    });
    return res.data.data;
  },

  logout: async (refreshToken: string): Promise<void> => {
    await apiClient.post("/auth/logout", { refresh_token: refreshToken });
  },

  logoutAll: async (): Promise<void> => {
    await apiClient.post("/auth/logout-all");
  },

  forgotPassword: async (payload: PasswordResetPayload): Promise<string> => {
    const res = await apiClient.post<StandardResponse<null>>("/auth/forgot-password", payload);
    return res.data.message;
  },

  resetPassword: async (payload: PasswordConfirmPayload): Promise<string> => {
    const res = await apiClient.post<StandardResponse<null>>("/auth/reset-password", payload);
    return res.data.message;
  },
};

