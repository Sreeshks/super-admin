import { apiClient } from "./client";
import {
  CategoryCreate,
  CategoryUpdate,
  ServiceCategory,
  StandardResponse,
} from "@/types";

export const categoriesApi = {
  list: async (status?: string): Promise<ServiceCategory[]> => {
    const res = await apiClient.get<StandardResponse<ServiceCategory[]>>("/admin/categories", {
      params: status ? { status } : undefined,
    });
    return res.data.data;
  },

  getById: async (id: string): Promise<ServiceCategory> => {
    const res = await apiClient.get<StandardResponse<ServiceCategory>>(`/admin/categories/${id}`);
    return res.data.data;
  },

  create: async (data: CategoryCreate): Promise<ServiceCategory> => {
    const res = await apiClient.post<StandardResponse<ServiceCategory>>("/admin/categories", data);
    return res.data.data;
  },

  update: async (id: string, data: CategoryUpdate): Promise<ServiceCategory> => {
    const res = await apiClient.put<StandardResponse<ServiceCategory>>(
      `/admin/categories/${id}`,
      data
    );
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/categories/${id}`);
  },

  reorder: async (orderList: Array<{ id: string; display_order: number }>): Promise<void> => {
    await apiClient.patch("/admin/categories/reorder", { order_list: orderList });
  },
};

