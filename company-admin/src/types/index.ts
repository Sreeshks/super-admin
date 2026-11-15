export interface StandardResponse<T> {
  success: boolean;
  message: string;
  data: T;
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
  data: T[];
  pagination: PaginationMeta;
}

export interface Role {
  id: string;
  name: string;
  description?: string | null;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string | null;
  tenant_id?: string | null;
  is_active: boolean;
  roles: Role[];
  last_login_at?: string | null;
  created_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface CompanyProfile {
  id: string;
  name: string;
  slug: string;
  business_type_id: string;
  logo?: string | null;
  favicon?: string | null;
  phone?: string | null;
  email?: string | null;
  description?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postal_code?: string | null;
  currency?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  website_status: "active" | "maintenance" | "disabled";
  account_status: "active" | "suspended" | "trial";
  created_at: string;
  updated_at: string;
}

export interface CompanyProfileUpdate {
  name?: string;
  logo?: string | null;
  favicon?: string | null;
  phone?: string | null;
  email?: string | null;
  description?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postal_code?: string | null;
  currency?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface WebsiteSection {
  id: string;
  tenant_id: string;
  section_key: string;
  display_name: string;
  is_enabled: boolean;
  display_order: number;
  settings?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceCategory {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CategoryCreate {
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  display_order?: number;
  is_active?: boolean;
}

export interface CategoryUpdate {
  name?: string;
  slug?: string;
  description?: string;
  image?: string;
  display_order?: number;
  is_active?: boolean;
}

export interface Service {
  id: string;
  tenant_id: string;
  category_id: string;
  category?: ServiceCategory | null;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  duration_minutes: number;
  price: number;
  offer_price?: number | null;
  currency?: string | null;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ServiceCreate {
  category_id: string;
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  duration_minutes: number;
  price: number;
  offer_price?: number;
  currency?: string;
  is_featured?: boolean;
  is_active?: boolean;
  display_order?: number;
}

export interface ServiceUpdate {
  category_id?: string;
  name?: string;
  slug?: string;
  description?: string;
  image?: string;
  duration_minutes?: number;
  price?: number;
  offer_price?: number | null;
  is_featured?: boolean;
  is_active?: boolean;
  display_order?: number;
}

export interface Offer {
  id: string;
  tenant_id: string;
  title: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  discount_percentage?: number | null;
  discount_amount?: number | null;
  original_price?: number | null;
  offer_price?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface OfferCreate {
  title: string;
  slug?: string;
  description?: string;
  image?: string;
  discount_percentage?: number;
  discount_amount?: number;
  original_price?: number;
  offer_price?: number;
  start_date?: string;
  end_date?: string;
  is_featured?: boolean;
  is_active?: boolean;
  display_order?: number;
}

export interface OfferUpdate {
  title?: string;
  slug?: string;
  description?: string;
  image?: string;
  discount_percentage?: number | null;
  discount_amount?: number | null;
  original_price?: number | null;
  offer_price?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  is_featured?: boolean;
  is_active?: boolean;
  display_order?: number;
}

export interface Banner {
  id: string;
  tenant_id: string;
  title: string;
  heading?: string | null;
  subtitle?: string | null;
  description?: string | null;
  image: string;
  desktop_media_url?: string;
  mobile_image?: string | null;
  mobile_media_url?: string | null;
  button_text?: string | null;
  cta_button_text?: string | null;
  button_url?: string | null;
  cta_button_url?: string | null;
  display_order: number;
  is_active: boolean;
  status?: string;
  created_at: string;
  updated_at: string;
}

export interface BannerCreate {
  title?: string;
  heading?: string;
  subtitle?: string;
  description?: string;
  image?: string;
  desktop_media_url?: string;
  mobile_image?: string;
  mobile_media_url?: string;
  button_text?: string;
  cta_button_text?: string;
  button_url?: string;
  cta_button_url?: string;
  display_order?: number;
  is_active?: boolean;
  status?: string;
}

export interface BannerUpdate {
  title?: string;
  heading?: string;
  subtitle?: string;
  description?: string;
  image?: string;
  desktop_media_url?: string;
  mobile_image?: string;
  mobile_media_url?: string;
  button_text?: string;
  cta_button_text?: string;
  button_url?: string;
  cta_button_url?: string;
  display_order?: number;
  is_active?: boolean;
  status?: string;
}

export interface MediaAsset {
  id: string;
  tenant_id: string;
  file_name: string;
  original_name: string;
  file_path: string;
  file_url: string;
  mime_type: string;
  file_size: number;
  storage_provider: string;
  media_type: string;
  metadata_info?: Record<string, unknown> | null;
  created_at: string;
}

export interface Testimonial {
  id: string;
  tenant_id: string;
  customer_name: string;
  customer_designation?: string | null;
  customer_avatar?: string | null;
  rating: number;
  review: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TestimonialCreate {
  customer_name: string;
  customer_designation?: string;
  customer_avatar?: string;
  rating?: number;
  review: string;
  display_order?: number;
  is_active?: boolean;
}

export interface TestimonialUpdate {
  customer_name?: string;
  customer_designation?: string;
  customer_avatar?: string;
  rating?: number;
  review?: string;
  display_order?: number;
  is_active?: boolean;
}

export interface FAQ {
  id: string;
  tenant_id: string;
  question: string;
  answer: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FAQCreate {
  question: string;
  answer: string;
  display_order?: number;
  is_active?: boolean;
}

export interface FAQUpdate {
  question?: string;
  answer?: string;
  display_order?: number;
  is_active?: boolean;
}

export interface Blog {
  id: string;
  tenant_id: string;
  title: string;
  slug: string;
  short_description?: string | null;
  content: string;
  featured_image?: string | null;
  author?: string | null;
  is_published: boolean;
  published_at?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogCreate {
  title: string;
  slug?: string;
  short_description?: string;
  content: string;
  featured_image?: string;
  author?: string;
  is_published?: boolean;
  seo_title?: string;
  seo_description?: string;
}

export interface BlogUpdate {
  title?: string;
  slug?: string;
  short_description?: string;
  content?: string;
  featured_image?: string;
  author?: string;
  is_published?: boolean;
  seo_title?: string;
  seo_description?: string;
}

export interface ContactEnquiry {
  id: string;
  tenant_id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  status: "new" | "in_progress" | "resolved" | "closed";
  created_at: string;
}

export interface ContactDetails {
  id?: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  opening_hours?: Record<string, string> | null;
  map_url?: string | null;
  whatsapp_number?: string | null;
}

export interface Location {
  id: string;
  tenant_id: string;
  name: string;
  address: string;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
  phone?: string | null;
  email?: string | null;
  map_url?: string | null;
  is_primary: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LocationCreate {
  name: string;
  address: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  phone?: string;
  email?: string;
  map_url?: string;
  is_primary?: boolean;
  is_active?: boolean;
}

export interface LocationUpdate {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  phone?: string;
  email?: string;
  map_url?: string;
  is_primary?: boolean;
  is_active?: boolean;
}

export interface SocialLinks {
  instagram_url?: string | null;
  facebook_url?: string | null;
  youtube_url?: string | null;
  whatsapp_number?: string | null;
  twitter_url?: string | null;
  linkedin_url?: string | null;
}

export interface InstagramPost {
  id: string;
  post_url: string;
  caption?: string | null;
  thumbnail_url?: string | null;
  display_order: number;
  is_active: boolean;
}

export interface YouTubeVideo {
  id: string;
  video_url: string;
  youtube_video_id?: string;
  thumbnail_url?: string | null;
  title?: string | null;
  display_order: number;
  is_active: boolean;
}

export interface CustomDomain {
  id: string;
  tenant_id: string;
  domain: string;
  is_primary: boolean;
  verification_status: "pending" | "verified" | "failed";
  verified_at?: string | null;
  status: string;
  created_at: string;
}

