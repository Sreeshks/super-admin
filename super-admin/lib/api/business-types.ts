import { apiClient } from "./client";
import {
  BusinessType,
  BusinessTypeCreate,
  BusinessTypeUpdate,
  StandardResponse,
} from "@/types";

export const businessTypesApi = {
  list: async (status?: string): Promise<BusinessType[]> => {
    const res = await apiClient.get<StandardResponse<BusinessType[]>>("/console/business-types", {
      params: status ? { status } : undefined,
    });
    return res.data.data;
  },

  getById: async (id: string): Promise<BusinessType> => {
    const res = await apiClient.get<StandardResponse<BusinessType>>(
      `/console/business-types/${id}`
    );
    return res.data.data;
  },

  create: async (payload: BusinessTypeCreate): Promise<BusinessType> => {
    const res = await apiClient.post<StandardResponse<BusinessType>>(
      "/console/business-types",
      payload
    );
    return res.data.data;
  },

  update: async (id: string, payload: BusinessTypeUpdate): Promise<BusinessType> => {
    const res = await apiClient.put<StandardResponse<BusinessType>>(
      `/console/business-types/${id}`,
      payload
    );
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/console/business-types/${id}`);
  },
};

