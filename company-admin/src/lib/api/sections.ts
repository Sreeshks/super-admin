import { apiClient } from "./client";
import { StandardResponse, WebsiteSection } from "@/types";

export interface SectionUpdatePayload {
  is_enabled?: boolean;
  display_order?: number;
  settings?: Record<string, unknown>;
}

export interface SectionBatchItem {
  section_key: string;
  is_enabled: boolean;
  display_order: number;
  settings?: Record<string, unknown>;
}

export const sectionsApi = {
  list: async (): Promise<WebsiteSection[]> => {
    const res = await apiClient.get<StandardResponse<WebsiteSection[]>>("/admin/sections");
    return res.data.data;
  },

  update: async (sectionKey: string, payload: SectionUpdatePayload): Promise<WebsiteSection> => {
    const res = await apiClient.put<StandardResponse<WebsiteSection>>(
      `/admin/sections/${sectionKey}`,
      payload
    );
    return res.data.data;
  },

  batchUpdate: async (sections: SectionBatchItem[]): Promise<WebsiteSection[]> => {
    const res = await apiClient.put<StandardResponse<WebsiteSection[]>>("/admin/sections/batch", {
      sections,
    });
    return res.data.data;
  },
};

