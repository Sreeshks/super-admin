import { mediaApi } from "./media";

export const IMGBB_API_KEY = "34b1022bc8d3afbe2dc9875cba76714d";

export interface ImgBBResponse {
  data: {
    id: string;
    title: string;
    url_viewer: string;
    url: string;
    display_url: string;
    width: number;
    height: number;
    size: number;
    time: number;
    expiration: number;
    image: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    thumb?: {
      url: string;
    };
    delete_url?: string;
  };
  success: boolean;
  status: number;
}

/**
 * Upload an image file directly to ImgBB using the provided API key.
 * Falls back to platform backend media endpoint if direct browser upload is blocked.
 */
export async function uploadToImgBB(file: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const data: ImgBBResponse = await response.json();
      if (data.success && data.data?.url) {
        return data.data.url;
      }
    }
  } catch (err) {
    console.warn("Direct ImgBB fetch warning, attempting fallback via media service:", err);
  }

  // Graceful fallback to backend which also uses ImgBB
  const backendAsset = await mediaApi.upload(file, "banners");
  return backendAsset.file_url;
}

