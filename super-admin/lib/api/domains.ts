import { apiClient } from "./client";
import { CustomDomain, StandardResponse } from "@/types";

export const domainsApi = {
  list: async (): Promise<CustomDomain[]> => {
    const res = await apiClient.get<StandardResponse<CustomDomain[]>>("/admin/domains");
    return res.data.data;
  },

  verify: async (id: string): Promise<{ domain: string; verified: boolean; verification_status: string }> => {
    const res = await apiClient.post<
      StandardResponse<{ domain: string; verified: boolean; verification_status: string; dns_txt_record: string }>
    >(`/admin/domains/${id}/verify`);
    return res.data.data;
  },
};

