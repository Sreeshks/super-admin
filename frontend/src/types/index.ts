export interface StandardResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp?: string;
}

export interface PaginationMeta {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message?: string;
  data: T[];
  pagination: PaginationMeta;
}

export interface BusinessType {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
}

export interface CompanyInfo {
  id: string;
  name: string;
  slug: string;
  business_type_id?: string;
  business_type?: BusinessType | null;
  website_status: "active" | "maintenance" | "disabled";
  account_status: "active" | "suspended" | "trial";
  created_at?: string;
  updated_at?: string;
}

export interface CompanyProfile {
  id: string;
  tenant_id: string;
  company_name: string;
  logo?: string | null;
  favicon?: string | null;
  short_description?: string | null;
  full_description?: string | null;
  about_section?: string | null;
  phone?: string | null;
  email?: string | null;
  whatsapp_number?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postal_code?: string | null;
  currency?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  opening_hours?: Record<string, string> | null;
  website_url?: string | null;
  contact_email?: string | null;
}

export interface WebsiteSection {
  id: string;
  section_key: string;
  display_name: string;
  enabled: boolean;
  display_order: number;
}

export interface Banner {
  id: string;
  heading?: string;
  title?: string;
  subtitle?: string | null;
  description?: string | null;
  desktop_media_url?: string | null;
  image_url?: string;
  mobile_media_url?: string | null;
  desktop_video_url?: string | null;
  mobile_video_url?: string | null;
  media_type?: string;
  cta_button_text?: string | null;
  button_text?: string | null;
  cta_button_url?: string | null;
  link_url?: string | null;
  display_order: number;
  status?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  image_url?: string | null;
  display_order: number;
  status?: string;
}

export interface Service {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  short_description?: string | null;
  full_description?: string | null;
  description?: string | null;
  regular_price: number | string;
  discounted_price?: number | string | null;
  currency?: string | null;
  duration_minutes?: number | null;
  featured_image?: string | null;
  image_url?: string | null;
  is_featured: boolean;
  display_order: number;
  status?: string;
}

export interface Offer {
  id: string;
  title: string;
  slug: string;
  short_description?: string | null;
  description?: string | null;
  discount_type?: "percentage" | "fixed";
  discount_percentage?: number | string | null;
  discount_value?: number | string;
  regular_price?: number | string;
  offer_price?: number | string | null;
  coupon_code?: string | null;
  start_date?: string | null;
  expiry_date?: string | null;
  banner_image?: string | null;
  banner_url?: string | null;
  cta_text?: string | null;
  cta_url?: string | null;
  display_order: number;
  status?: string;
}

export interface InstagramPost {
  id: string;
  post_url: string;
  caption?: string | null;
  thumbnail_url?: string | null;
  display_order: number;
}

export interface YouTubeVideo {
  id: string;
  youtube_video_id: string;
  title?: string | null;
  video_url: string;
  thumbnail_url?: string | null;
  embed_url?: string | null;
  display_order: number;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  display_order: number;
}

export interface Testimonial {
  id: string;
  customer_name: string;
  customer_designation?: string | null;
  customer_title?: string | null;
  review?: string;
  review_text?: string;
  rating?: number | null;
  customer_image?: string | null;
  avatar_url?: string | null;
  display_order: number;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  display_order: number;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  short_description?: string | null;
  full_content: string;
  featured_image?: string | null;
  author?: string | null;
  category?: string | null;
  tags?: string[];
  published_date?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
}

export interface LocationItem {
  id: string;
  location_name: string;
  address: string;
  city: string;
  state?: string | null;
  country: string;
  postal_code?: string | null;
  currency?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  contact_number?: string | null;
  email?: string | null;
  opening_hours?: Record<string, string> | null;
  status: string;
  is_primary: boolean;
}

export interface ContactDetails {
  id: string;
  primary_phone?: string | null;
  secondary_phone?: string | null;
  email?: string | null;
  whatsapp_number?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  google_maps_url?: string | null;
  opening_hours?: Record<string, string> | null;
}

export interface MediaAsset {
  id: string;
  tenant_id: string;
  file_name: string;
  original_name: string;
  file_url: string;
  mime_type: string;
  file_size: number;
  storage_provider: string;
  media_type: string;
  metadata_info?: {
    label?: string;
    alt_text?: string;
    category?: string;
  } | null;
  created_at?: string;
}

export interface PublicWebsiteData {
  company: CompanyInfo;
  profile?: CompanyProfile | null;
  locations: LocationItem[];
  sections: WebsiteSection[];
  banners: Banner[];
  categories: Category[];
  featured_services: Service[];
  offers: Offer[];
  instagram_posts: InstagramPost[];
  youtube_videos: YouTubeVideo[];
  social_links: SocialLink[];
  testimonials: Testimonial[];
  faqs: FAQ[];
  blogs: Blog[];
  gallery?: MediaAsset[];
  contact?: ContactDetails | null;
}

export interface ContactEnquiryPayload {
  customer_name: string;
  email: string;
  phone: string;
  subject?: string;
  message: string;
}

export interface SitemapUrl {
  loc: string;
  changefreq: string;
  priority: number;
  lastmod?: string;
}

export interface PublicSitemapData {
  company_slug: string;
  urls: SitemapUrl[];
}

export interface DynamicBrandTheme {
  primary: string;
  primaryHover: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
}
