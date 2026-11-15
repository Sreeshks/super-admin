import { apiClient } from "./client";
import { MediaAsset, StandardResponse } from "@/types";

export const mediaApi = {
  list: async (mediaType?: string): Promise<MediaAsset[]> => {
    const res = await apiClient.get<StandardResponse<MediaAsset[]>>("/admin/media", {
      params: mediaType ? { media_type: mediaType } : undefined,
    });
    return res.data.data;
  },

  upload: async (file: File, mediaType = "general"): Promise<MediaAsset> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("media_type", mediaType);

    const res = await apiClient.post<StandardResponse<MediaAsset>>(
      "/admin/media/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return res.data.data;
  },

  createFromUrl: async (data: {
    file_url: string;
    original_name: string;
    media_type?: string;
    label?: string;
    file_size?: number;
  }): Promise<MediaAsset> => {
    const res = await apiClient.post<StandardResponse<MediaAsset>>("/admin/media/url", data);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/media/${id}`);
  },
};

