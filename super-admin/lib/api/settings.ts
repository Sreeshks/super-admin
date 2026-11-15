import { apiClient } from "./client";
import { PlatformSetting, StandardResponse } from "@/types";

export const settingsApi = {
  list: async (): Promise<PlatformSetting[]> => {
    const res = await apiClient.get<StandardResponse<PlatformSetting[]>>("/console/settings");
    return res.data.data;
  },

  save: async (key: string, value: Record<string, unknown>, description?: string): Promise<PlatformSetting> => {
    const res = await apiClient.post<StandardResponse<PlatformSetting>>("/console/settings", {
      key,
      value,
      description,
    });
    return res.data.data;
  },
};

