import { apiClient } from "./client";
import { Offer, OfferCreate, OfferUpdate, StandardResponse } from "@/types";

export const offersApi = {
  list: async (activeOnly = false): Promise<Offer[]> => {
    const res = await apiClient.get<StandardResponse<Offer[]>>("/admin/offers", {
      params: { active_only: activeOnly },
    });
    return res.data.data;
  },

  getById: async (id: string): Promise<Offer> => {
    const res = await apiClient.get<StandardResponse<Offer>>(`/admin/offers/${id}`);
    return res.data.data;
  },

  create: async (data: OfferCreate): Promise<Offer> => {
    const res = await apiClient.post<StandardResponse<Offer>>("/admin/offers", data);
    return res.data.data;
  },

  update: async (id: string, data: OfferUpdate): Promise<Offer> => {
    const res = await apiClient.put<StandardResponse<Offer>>(`/admin/offers/${id}`, data);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/offers/${id}`);
  },
};

