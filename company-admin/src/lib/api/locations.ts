import { apiClient } from "./client";
import { Location, LocationCreate, LocationUpdate, StandardResponse } from "@/types";

export const locationsApi = {
  list: async (activeOnly = false): Promise<Location[]> => {
    const res = await apiClient.get<StandardResponse<Location[]>>("/admin/locations", {
      params: { active_only: activeOnly },
    });
    return res.data.data;
  },

  getById: async (id: string): Promise<Location> => {
    const res = await apiClient.get<StandardResponse<Location>>(`/admin/locations/${id}`);
    return res.data.data;
  },

  create: async (data: LocationCreate): Promise<Location> => {
    const res = await apiClient.post<StandardResponse<Location>>("/admin/locations", data);
    return res.data.data;
  },

  update: async (id: string, data: LocationUpdate): Promise<Location> => {
    const res = await apiClient.put<StandardResponse<Location>>(`/admin/locations/${id}`, data);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/locations/${id}`);
  },
};

