import { apiClient } from "./client";
import {
  ContactDetails,
  ContactEnquiry,
  PaginatedResponse,
  StandardResponse,
} from "@/types";

export interface EnquiryListParams {
  page?: number;
  page_size?: number;
  status?: string;
  search?: string;
}

export const contactApi = {
  getDetails: async (): Promise<ContactDetails> => {
    const res = await apiClient.get<StandardResponse<ContactDetails>>("/admin/contact");
    return res.data.data;
  },

  updateDetails: async (data: ContactDetails): Promise<ContactDetails> => {
    const res = await apiClient.put<StandardResponse<ContactDetails>>("/admin/contact", data);
    return res.data.data;
  },

  listEnquiries: async (
    params?: EnquiryListParams
  ): Promise<PaginatedResponse<ContactEnquiry>> => {
    const res = await apiClient.get<PaginatedResponse<ContactEnquiry>>(
      "/admin/contact/enquiries",
      { params }
    );
    return res.data;
  },

  updateEnquiryStatus: async (
    id: string,
    status: string
  ): Promise<ContactEnquiry> => {
    const res = await apiClient.patch<StandardResponse<ContactEnquiry>>(
      `/admin/contact/enquiries/${id}/status`,
      { status }
    );
    return res.data.data;
  },
};

