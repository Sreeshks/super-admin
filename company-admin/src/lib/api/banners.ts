import { apiClient } from "./client";
import { Banner, BannerCreate, BannerUpdate, StandardResponse } from "@/types";

interface BackendBanner {
  id: string;
  tenant_id: string;
  media_type: string;
  desktop_media_url: string;
  mobile_media_url?: string | null;
  desktop_video_url?: string | null;
  mobile_video_url?: string | null;
  heading?: string | null;
  subtitle?: string | null;
  description?: string | null;
  cta_button_text?: string | null;
  cta_button_url?: string | null;
  display_order: number;
  status: string;
  created_at: string;
  updated_at?: string;
}

function normalizeBanner(b: BackendBanner): Banner {
  return {
    id: b.id,
    tenant_id: b.tenant_id,
    title: b.heading || "",
    heading: b.heading || "",
    subtitle: b.subtitle || null,
    description: b.description || null,
    image: b.desktop_media_url,
    desktop_media_url: b.desktop_media_url,
    mobile_image: b.mobile_media_url || null,
    mobile_media_url: b.mobile_media_url || null,
    button_text: b.cta_button_text || null,
    cta_button_text: b.cta_button_text || null,
    button_url: b.cta_button_url || null,
    cta_button_url: b.cta_button_url || null,
    display_order: b.display_order ?? 0,
    is_active: b.status === "active",
    status: b.status,
    created_at: b.created_at,
    updated_at: b.updated_at || b.created_at,
  };
}

function toBackendCreate(data: BannerCreate) {
  const desktopUrl = data.desktop_media_url || data.image || "";
  const mobileUrl = data.mobile_media_url || data.mobile_image || null;
  const title = data.heading || data.title || "";
  const btnText = data.cta_button_text || data.button_text || null;
  const btnUrl = data.cta_button_url || data.button_url || null;
  const isActive = data.is_active !== undefined ? data.is_active : data.status !== "inactive";

  return {
    media_type: "IMAGE",
    desktop_media_url: desktopUrl,
    mobile_media_url: mobileUrl,
    heading: title || null,
    subtitle: data.subtitle || null,
    description: data.description || null,
    cta_button_text: btnText,
    cta_button_url: btnUrl,
    display_order: data.display_order ?? 0,
    status: isActive ? "active" : "inactive",
  };
}

function toBackendUpdate(data: BannerUpdate) {
  const payload: Record<string, unknown> = {};

  if (data.desktop_media_url !== undefined || data.image !== undefined) {
    payload.desktop_media_url = data.desktop_media_url || data.image;
  }
  if (data.mobile_media_url !== undefined || data.mobile_image !== undefined) {
    payload.mobile_media_url = data.mobile_media_url || data.mobile_image || null;
  }
  if (data.heading !== undefined || data.title !== undefined) {
    payload.heading = data.heading || data.title || null;
  }
  if (data.subtitle !== undefined) payload.subtitle = data.subtitle;
  if (data.description !== undefined) payload.description = data.description;
  if (data.cta_button_text !== undefined || data.button_text !== undefined) {
    payload.cta_button_text = data.cta_button_text || data.button_text || null;
  }
  if (data.cta_button_url !== undefined || data.button_url !== undefined) {
    payload.cta_button_url = data.cta_button_url || data.button_url || null;
  }
  if (data.display_order !== undefined) payload.display_order = data.display_order;
  if (data.is_active !== undefined) {
    payload.status = data.is_active ? "active" : "inactive";
  } else if (data.status !== undefined) {
    payload.status = data.status;
  }

  return payload;
}

export const bannersApi = {
  list: async (activeOnly = false): Promise<Banner[]> => {
    const res = await apiClient.get<StandardResponse<BackendBanner[]>>("/admin/banners", {
      params: { active_only: activeOnly },
    });
    return (res.data.data || []).map(normalizeBanner);
  },

  getById: async (id: string): Promise<Banner> => {
    const res = await apiClient.get<StandardResponse<BackendBanner>>(`/admin/banners/${id}`);
    return normalizeBanner(res.data.data);
  },

  create: async (data: BannerCreate): Promise<Banner> => {
    const payload = toBackendCreate(data);
    const res = await apiClient.post<StandardResponse<BackendBanner>>("/admin/banners", payload);
    return normalizeBanner(res.data.data);
  },

  update: async (id: string, data: BannerUpdate): Promise<Banner> => {
    const payload = toBackendUpdate(data);
    const res = await apiClient.put<StandardResponse<BackendBanner>>(`/admin/banners/${id}`, payload);
    return normalizeBanner(res.data.data);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/banners/${id}`);
  },
};
