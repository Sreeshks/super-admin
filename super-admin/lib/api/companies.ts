import { apiClient } from "./client";
import {
  Company,
  CompanyCreatePayload,
  CompanyCreateResponse,
  CompanyUpdatePayload,
  PaginatedResponse,
  StandardResponse,
} from "@/types";

export interface CompanyListParams {
  page?: number;
  page_size?: number;
  search?: string;
  business_type_id?: string;
  status?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export const companiesApi = {
  list: async (params?: CompanyListParams): Promise<PaginatedResponse<Company>> => {
    const cleanParams: Record<string, unknown> = {};
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v !== "" && v !== null && v !== undefined) {
          cleanParams[k] = v;
        }
      }
    }
    const res = await apiClient.get<PaginatedResponse<Company>>("/console/companies", {
      params: cleanParams,
    });
    return res.data;
  },

  getById: async (id: string): Promise<Company> => {
    const res = await apiClient.get<StandardResponse<Company>>(`/console/companies/${id}`);
    return res.data.data;
  },

  create: async (payload: CompanyCreatePayload): Promise<CompanyCreateResponse> => {
    const res = await apiClient.post<StandardResponse<CompanyCreateResponse>>(
      "/console/companies",
      payload
    );
    return res.data.data;
  },

  update: async (id: string, payload: CompanyUpdatePayload): Promise<Company> => {
    const res = await apiClient.put<StandardResponse<Company>>(
      `/console/companies/${id}`,
      payload
    );
    return res.data.data;
  },

  updateStatus: async (
    id: string,
    payload: { website_status?: string; account_status?: string }
  ): Promise<Company> => {
    const res = await apiClient.patch<StandardResponse<Company>>(
      `/console/companies/${id}/status`,
      payload
    );
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/console/companies/${id}`);
  },
};

