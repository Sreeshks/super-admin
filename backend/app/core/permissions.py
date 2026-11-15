from enum import Enum


class RoleEnum(str, Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    COMPANY_ADMIN = "COMPANY_ADMIN"
    CONTENT_MANAGER = "CONTENT_MANAGER"


class PermissionEnum(str, Enum):
    # Platform / Console
    MANAGE_PLATFORM = "platform:manage"
    MANAGE_TENANTS = "tenants:manage"
    VIEW_TENANTS = "tenants:view"
    MANAGE_BUSINESS_TYPES = "business_types:manage"
    VIEW_ANALYTICS = "analytics:view"
    MANAGE_SUBSCRIPTIONS = "subscriptions:manage"
    VIEW_AUDIT_LOGS = "audit_logs:view"

    # Tenant Profile & Administration
    MANAGE_COMPANY_PROFILE = "company:profile:manage"
    MANAGE_COMPANY_USERS = "company:users:manage"
    MANAGE_LOCATIONS = "company:locations:manage"
    MANAGE_SECTIONS = "company:sections:manage"
    MANAGE_DOMAINS = "company:domains:manage"

    # Content Operations
    MANAGE_CATEGORIES = "content:categories:manage"
    MANAGE_SERVICES = "content:services:manage"
    MANAGE_OFFERS = "content:offers:manage"
    MANAGE_BANNERS = "content:banners:manage"
    MANAGE_SOCIAL = "content:social:manage"
    MANAGE_FAQS = "content:faqs:manage"
    MANAGE_BLOGS = "content:blogs:manage"
    MANAGE_TESTIMONIALS = "content:testimonials:manage"
    MANAGE_MEDIA = "content:media:manage"
    VIEW_ENQUIRIES = "enquiries:view"
    MANAGE_ENQUIRIES = "enquiries:manage"


ROLE_PERMISSIONS: dict[RoleEnum, set[PermissionEnum]] = {
    RoleEnum.SUPER_ADMIN: {p for p in PermissionEnum},
    RoleEnum.COMPANY_ADMIN: {
        PermissionEnum.MANAGE_COMPANY_PROFILE,
        PermissionEnum.MANAGE_COMPANY_USERS,
        PermissionEnum.MANAGE_LOCATIONS,
        PermissionEnum.MANAGE_SECTIONS,
        PermissionEnum.MANAGE_DOMAINS,
        PermissionEnum.MANAGE_CATEGORIES,
        PermissionEnum.MANAGE_SERVICES,
        PermissionEnum.MANAGE_OFFERS,
        PermissionEnum.MANAGE_BANNERS,
        PermissionEnum.MANAGE_SOCIAL,
        PermissionEnum.MANAGE_FAQS,
        PermissionEnum.MANAGE_BLOGS,
        PermissionEnum.MANAGE_TESTIMONIALS,
        PermissionEnum.MANAGE_MEDIA,
        PermissionEnum.VIEW_ENQUIRIES,
        PermissionEnum.MANAGE_ENQUIRIES,
    },
    RoleEnum.CONTENT_MANAGER: {
        PermissionEnum.MANAGE_CATEGORIES,
        PermissionEnum.MANAGE_SERVICES,
        PermissionEnum.MANAGE_OFFERS,
        PermissionEnum.MANAGE_BANNERS,
        PermissionEnum.MANAGE_FAQS,
        PermissionEnum.MANAGE_BLOGS,
        PermissionEnum.MANAGE_TESTIMONIALS,
        PermissionEnum.MANAGE_MEDIA,
        PermissionEnum.VIEW_ENQUIRIES,
    },
}
