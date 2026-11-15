import { apiClient } from "./client";
import {
  PaginatedResponse,
  Service,
  ServiceCreate,
  ServiceUpdate,
  StandardResponse,
} from "@/types";

export interface ServiceListParams {
  page?: number;
  page_size?: number;
  search?: string;
  category_id?: string;
  status?: string;
  is_featured?: boolean;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export const servicesApi = {
  list: async (params?: ServiceListParams): Promise<PaginatedResponse<Service>> => {
    const cleanParams: Record<string, unknown> = {};
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== "" && val !== undefined && val !== null) {
          cleanParams[key] = val;
        }
      });
    }
    const res = await apiClient.get<PaginatedResponse<Service>>("/admin/services", {
      params: cleanParams,
    });
    return res.data;
  },

  getById: async (id: string): Promise<Service> => {
    const res = await apiClient.get<StandardResponse<Service>>(`/admin/services/${id}`);
    return res.data.data;
  },

  create: async (data: ServiceCreate): Promise<Service> => {
    const res = await apiClient.post<StandardResponse<Service>>("/admin/services", data);
    return res.data.data;
  },

  update: async (id: string, data: ServiceUpdate): Promise<Service> => {
    const res = await apiClient.put<StandardResponse<Service>>(`/admin/services/${id}`, data);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/services/${id}`);
  },

  bulkUpdateStatus: async (serviceIds: string[], status: string): Promise<number> => {
    const res = await apiClient.patch<StandardResponse<{ updated_count: number }>>(
      "/admin/services/bulk/status",
      { service_ids: serviceIds, status }
    );
    return res.data.data.updated_count;
  },

  bulkDelete: async (serviceIds: string[]): Promise<number> => {
    const res = await apiClient.post<StandardResponse<{ deleted_count: number }>>(
      "/admin/services/bulk/delete",
      { service_ids: serviceIds }
    );
    return res.data.data.deleted_count;
  },
};

