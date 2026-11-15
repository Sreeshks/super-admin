import { apiClient } from "./client";
import { AuthTokens, StandardResponse, User } from "@/types";

export interface LoginPayload {
  email: string;
  password: string;
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

  forgotPassword: async (email: string): Promise<string> => {
    const res = await apiClient.post<StandardResponse<null>>("/auth/forgot-password", { email });
    return res.data.message;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<string> => {
    const res = await apiClient.post<StandardResponse<null>>("/auth/change-password", {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return res.data.message;
  },
};

