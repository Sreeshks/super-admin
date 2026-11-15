import axios from "axios";
import {
  Blog,
  Category,
  CompanyProfile,
  ContactDetails,
  ContactEnquiryPayload,
  FAQ,
  InstagramPost,
  LocationItem,
  MediaAsset,
  Offer,
  PaginatedResponse,
  PublicSitemapData,
  PublicWebsiteData,
  Service,
  SocialLink,
  StandardResponse,
  Testimonial,
  WebsiteSection,
  YouTubeVideo,
} from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

export const publicClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

export const publicApi = {
  getWebsiteData: async (slug: string): Promise<PublicWebsiteData> => {
    const res = await publicClient.get<StandardResponse<PublicWebsiteData>>(
      `/public/websites/${slug}`
    );
    return res.data.data;
  },

  getProfile: async (slug: string): Promise<CompanyProfile | null> => {
    const res = await publicClient.get<StandardResponse<CompanyProfile | null>>(
      `/public/websites/${slug}/profile`
    );
    return res.data.data;
  },

  getLocations: async (slug: string): Promise<LocationItem[]> => {
    const res = await publicClient.get<StandardResponse<LocationItem[]>>(
      `/public/websites/${slug}/locations`
    );
    return res.data.data || [];
  },

  getCategories: async (slug: string): Promise<Category[]> => {
    const res = await publicClient.get<StandardResponse<Category[]>>(
      `/public/websites/${slug}/categories`
    );
    return res.data.data || [];
  },

  getServices: async (
    slug: string,
    params?: { page?: number; page_size?: number; category?: string }
  ): Promise<PaginatedResponse<Service>> => {
    const res = await publicClient.get<PaginatedResponse<Service>>(
      `/public/websites/${slug}/services`,
      { params }
    );
    return res.data;
  },

  getServiceBySlug: async (slug: string, serviceSlug: string): Promise<Service> => {
    const res = await publicClient.get<StandardResponse<Service>>(
      `/public/websites/${slug}/services/${serviceSlug}`
    );
    return res.data.data;
  },

  getOffers: async (slug: string): Promise<Offer[]> => {
    const res = await publicClient.get<StandardResponse<Offer[]>>(
      `/public/websites/${slug}/offers`
    );
    return res.data.data || [];
  },

  getGallery: async (slug: string): Promise<MediaAsset[]> => {
    const res = await publicClient.get<StandardResponse<MediaAsset[]>>(
      `/public/websites/${slug}/gallery`
    );
    return res.data.data || [];
  },

  getVideos: async (slug: string): Promise<YouTubeVideo[]> => {
    const res = await publicClient.get<StandardResponse<YouTubeVideo[]>>(
      `/public/websites/${slug}/videos`
    );
    return res.data.data || [];
  },

  getInstagram: async (slug: string): Promise<InstagramPost[]> => {
    const res = await publicClient.get<StandardResponse<InstagramPost[]>>(
      `/public/websites/${slug}/instagram`
    );
    return res.data.data || [];
  },

  getSocialLinks: async (slug: string): Promise<SocialLink[]> => {
    const res = await publicClient.get<StandardResponse<SocialLink[]>>(
      `/public/websites/${slug}/social-links`
    );
    return res.data.data || [];
  },

  getFaqs: async (slug: string): Promise<FAQ[]> => {
    const res = await publicClient.get<StandardResponse<FAQ[]>>(
      `/public/websites/${slug}/faqs`
    );
    return res.data.data || [];
  },

  getBlogs: async (slug: string): Promise<Blog[]> => {
    const res = await publicClient.get<StandardResponse<Blog[]>>(
      `/public/websites/${slug}/blogs`
    );
    return res.data.data || [];
  },

  getBlogBySlug: async (slug: string, blogSlug: string): Promise<Blog> => {
    const res = await publicClient.get<StandardResponse<Blog>>(
      `/public/websites/${slug}/blogs/${blogSlug}`
    );
    return res.data.data;
  },

  getTestimonials: async (slug: string): Promise<Testimonial[]> => {
    const res = await publicClient.get<StandardResponse<Testimonial[]>>(
      `/public/websites/${slug}/testimonials`
    );
    return res.data.data || [];
  },

  getContact: async (slug: string): Promise<ContactDetails | null> => {
    const res = await publicClient.get<StandardResponse<ContactDetails | null>>(
      `/public/websites/${slug}/contact`
    );
    return res.data.data;
  },

  getSections: async (slug: string): Promise<WebsiteSection[]> => {
    const res = await publicClient.get<StandardResponse<WebsiteSection[]>>(
      `/public/websites/${slug}/sections`
    );
    return res.data.data || [];
  },

  getSitemap: async (slug: string): Promise<PublicSitemapData> => {
    const res = await publicClient.get<StandardResponse<PublicSitemapData>>(
      `/public/websites/${slug}/sitemap`
    );
    return res.data.data;
  },

  submitEnquiry: async (
    slug: string,
    payload: ContactEnquiryPayload
  ): Promise<{ success: boolean; message: string }> => {
    const res = await publicClient.post<StandardResponse<unknown>>(
      `/public/websites/${slug}/enquiries`,
      payload
    );
    return {
      success: res.data.success,
      message: res.data.message || "Enquiry submitted successfully",
    };
  },
};

