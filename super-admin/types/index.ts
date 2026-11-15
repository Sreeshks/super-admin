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

export interface ApiErrorDetail {
  field?: string;
  issue: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error_code: string;
  details: ApiErrorDetail[];
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

export interface BusinessType {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  default_configuration?: Record<string, unknown> | null;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

export interface BusinessTypeCreate {
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  default_configuration?: Record<string, unknown>;
  status?: "active" | "inactive";
}

export interface BusinessTypeUpdate {
  name?: string;
  slug?: string;
  description?: string;
  image?: string;
  default_configuration?: Record<string, unknown>;
  status?: "active" | "inactive";
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  business_type_id: string;
  business_type?: BusinessType | null;
  website_status: "active" | "maintenance" | "disabled";
  account_status: "active" | "suspended" | "trial";
  created_at: string;
  updated_at: string;
}

export interface CompanyCreatePayload {
  company_name: string;
  slug?: string;
  business_type_id: string;
  logo?: string;
  favicon?: string;
  phone?: string;
  email?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  website_status: "active" | "maintenance" | "disabled";
  account_status: "active" | "suspended" | "trial";
  admin_name: string;
  admin_email: string;
  initial_password: string;
}

export interface CompanyCreateResponse {
  company: Company;
  admin_user_id: string;
  admin_email: string;
  admin_name: string;
  temporary_credentials_note: string;
}

export interface CompanyUpdatePayload {
  name?: string;
  slug?: string;
  business_type_id?: string;
  website_status?: "active" | "maintenance" | "disabled";
  account_status?: "active" | "suspended" | "trial";
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  billing_cycle: "monthly" | "yearly";
  max_services: number;
  max_locations: number;
  max_storage_mb: number;
  max_admins: number;
  allow_custom_domain: boolean;
  is_active: boolean;
  created_at: string;
}

export interface SubscriptionPlanCreate {
  name: string;
  slug?: string;
  description?: string;
  price: number;
  billing_cycle?: "monthly" | "yearly";
  max_services?: number;
  max_locations?: number;
  max_storage_mb?: number;
  max_admins?: number;
  allow_custom_domain?: boolean;
  is_active?: boolean;
}

export interface SubscriptionPlanUpdate {
  name?: string;
  slug?: string;
  description?: string;
  price?: number;
  billing_cycle?: "monthly" | "yearly";
  max_services?: number;
  max_locations?: number;
  max_storage_mb?: number;
  max_admins?: number;
  allow_custom_domain?: boolean;
  is_active?: boolean;
}

export interface TenantSubscription {
  id: string;
  tenant_id: string;
  plan_id: string;
  status: string;
  start_date: string;
  end_date?: string | null;
  auto_renew: boolean;
  created_at: string;
}

export interface PlatformSetting {
  key: string;
  value: Record<string, unknown>;
  description?: string | null;
}

export interface AuditLog {
  id: string;
  tenant_id?: string | null;
  user_id?: string | null;
  action: string;
  entity_name: string;
  entity_id?: string | null;
  details?: Record<string, unknown> | null;
  created_at: string;
}

export interface DashboardStats {
  total_companies: number;
  active_companies: number;
  inactive_companies: number;
  total_business_types: number;
  total_administrators: number;
  recently_registered_companies: Company[];
  companies_by_business_type: Record<string, number>;
}

export interface Administrator {
  id: string;
  email: string;
  full_name: string;
  phone?: string | null;
  tenant_id?: string | null;
  company_name?: string | null;
  is_active: boolean;
  roles: string[];
  created_at: string;
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

