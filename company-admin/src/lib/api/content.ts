import { apiClient } from "./client";
import {
  Blog,
  BlogCreate,
  BlogUpdate,
  CustomDomain,
  FAQ,
  FAQCreate,
  FAQUpdate,
  InstagramPost,
  SocialLinks,
  StandardResponse,
  Testimonial,
  TestimonialCreate,
  TestimonialUpdate,
  YouTubeVideo,
} from "@/types";

export const testimonialsApi = {
  list: async (activeOnly = false): Promise<Testimonial[]> => {
    const res = await apiClient.get<StandardResponse<Testimonial[]>>("/admin/testimonials", {
      params: { active_only: activeOnly },
    });
    return res.data.data;
  },
  create: async (data: TestimonialCreate): Promise<Testimonial> => {
    const res = await apiClient.post<StandardResponse<Testimonial>>("/admin/testimonials", data);
    return res.data.data;
  },
  update: async (id: string, data: TestimonialUpdate): Promise<Testimonial> => {
    const res = await apiClient.put<StandardResponse<Testimonial>>(`/admin/testimonials/${id}`, data);
    return res.data.data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/testimonials/${id}`);
  },
};

export const faqsApi = {
  list: async (activeOnly = false): Promise<FAQ[]> => {
    const res = await apiClient.get<StandardResponse<FAQ[]>>("/admin/faqs", {
      params: { active_only: activeOnly },
    });
    return res.data.data;
  },
  create: async (data: FAQCreate): Promise<FAQ> => {
    const res = await apiClient.post<StandardResponse<FAQ>>("/admin/faqs", data);
    return res.data.data;
  },
  update: async (id: string, data: FAQUpdate): Promise<FAQ> => {
    const res = await apiClient.put<StandardResponse<FAQ>>(`/admin/faqs/${id}`, data);
    return res.data.data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/faqs/${id}`);
  },
};

export const blogsApi = {
  list: async (publishedOnly = false): Promise<Blog[]> => {
    const res = await apiClient.get<StandardResponse<Blog[]>>("/admin/blogs", {
      params: { published_only: publishedOnly },
    });
    return res.data.data;
  },
  create: async (data: BlogCreate): Promise<Blog> => {
    const res = await apiClient.post<StandardResponse<Blog>>("/admin/blogs", data);
    return res.data.data;
  },
  update: async (id: string, data: BlogUpdate): Promise<Blog> => {
    const res = await apiClient.put<StandardResponse<Blog>>(`/admin/blogs/${id}`, data);
    return res.data.data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/blogs/${id}`);
  },
};

export const socialApi = {
  getLinks: async (): Promise<SocialLinks> => {
    const res = await apiClient.get<StandardResponse<SocialLinks>>("/admin/social");
    return res.data.data;
  },
  updateLinks: async (data: SocialLinks): Promise<SocialLinks> => {
    const res = await apiClient.put<StandardResponse<SocialLinks>>("/admin/social", data);
    return res.data.data;
  },
};

export const instagramApi = {
  list: async (): Promise<InstagramPost[]> => {
    const res = await apiClient.get<StandardResponse<InstagramPost[]>>("/admin/instagram");
    return res.data.data;
  },
  create: async (data: { post_url: string; caption?: string; thumbnail_url?: string }): Promise<InstagramPost> => {
    const res = await apiClient.post<StandardResponse<InstagramPost>>("/admin/instagram", data);
    return res.data.data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/instagram/${id}`);
  },
};

export const youtubeApi = {
  list: async (): Promise<YouTubeVideo[]> => {
    const res = await apiClient.get<StandardResponse<YouTubeVideo[]>>("/admin/youtube");
    return res.data.data;
  },
  create: async (data: { video_url: string; title?: string }): Promise<YouTubeVideo> => {
    const res = await apiClient.post<StandardResponse<YouTubeVideo>>("/admin/youtube", data);
    return res.data.data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/youtube/${id}`);
  },
};

export const domainsApi = {
  list: async (): Promise<CustomDomain[]> => {
    const res = await apiClient.get<StandardResponse<CustomDomain[]>>("/admin/domains");
    return res.data.data;
  },
  add: async (domain: string, isPrimary = false): Promise<CustomDomain> => {
    const res = await apiClient.post<StandardResponse<CustomDomain>>("/admin/domains", {
      domain,
      is_primary: isPrimary,
    });
    return res.data.data;
  },
  verify: async (id: string): Promise<{ domain: string; verified: boolean; verification_status: string; dns_txt_record: string }> => {
    const res = await apiClient.post<StandardResponse<{ domain: string; verified: boolean; verification_status: string; dns_txt_record: string }>>(`/admin/domains/${id}/verify`);
    return res.data.data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/domains/${id}`);
  },
};

