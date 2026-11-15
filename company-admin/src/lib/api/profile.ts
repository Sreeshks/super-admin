import { apiClient } from "./client";
import { CompanyProfile, CompanyProfileUpdate, StandardResponse } from "@/types";

export const profileApi = {
  getProfile: async (): Promise<CompanyProfile> => {
    const res = await apiClient.get<StandardResponse<CompanyProfile>>("/admin/profile");
    return res.data.data;
  },

  updateProfile: async (data: CompanyProfileUpdate): Promise<CompanyProfile> => {
    const res = await apiClient.put<StandardResponse<CompanyProfile>>("/admin/profile", data);
    return res.data.data;
  },
};

