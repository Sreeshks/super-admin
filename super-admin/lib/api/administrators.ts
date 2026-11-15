import { apiClient } from "./client";
import { Administrator, PaginatedResponse, StandardResponse } from "@/types";

export interface AdministratorListParams {
  page?: number;
  page_size?: number;
  search?: string;
  role?: string;
  status?: string;
}

export const administratorsApi = {
  list: async (
    params?: AdministratorListParams
  ): Promise<PaginatedResponse<Administrator>> => {
    const res = await apiClient.get<PaginatedResponse<Administrator>>(
      "/console/administrators",
      { params }
    );
    return res.data;
  },

  updateStatus: async (
    userId: string,
    isActive: boolean
  ): Promise<{ id: string; is_active: boolean }> => {
    const res = await apiClient.patch<
      StandardResponse<{ id: string; is_active: boolean }>
    >(`/console/administrators/${userId}/status`, { is_active: isActive });
    return res.data.data;
  },

  resetPassword: async (
    userId: string,
    newPassword: string
  ): Promise<{ id: string; email: string }> => {
    const res = await apiClient.post<
      StandardResponse<{ id: string; email: string }>
    >(`/console/administrators/${userId}/reset-password`, {
      new_password: newPassword,
    });
    return res.data.data;
  },
};

