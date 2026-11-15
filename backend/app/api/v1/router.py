from fastapi import APIRouter

from app.api.v1.admin.banners import router as admin_banners_router
from app.api.v1.admin.blogs import router as admin_blogs_router
from app.api.v1.admin.categories import router as admin_categories_router
from app.api.v1.admin.contact import router as admin_contact_router
from app.api.v1.admin.domains import router as admin_domains_router
from app.api.v1.admin.faqs import router as admin_faqs_router
from app.api.v1.admin.instagram import router as admin_instagram_router
from app.api.v1.admin.locations import router as admin_locations_router
from app.api.v1.admin.media import router as admin_media_router
from app.api.v1.admin.offers import router as admin_offers_router
from app.api.v1.admin.profile import router as admin_profile_router
from app.api.v1.admin.sections import router as admin_sections_router
from app.api.v1.admin.services import router as admin_services_router
from app.api.v1.admin.social import router as admin_social_router
from app.api.v1.admin.testimonials import router as admin_testimonials_router
from app.api.v1.admin.youtube import router as admin_youtube_router
from app.api.v1.auth.endpoints import router as auth_router
from app.api.v1.console.administrators import router as console_administrators_router
from app.api.v1.console.business_types import router as console_business_types_router
from app.api.v1.console.companies import router as console_companies_router
from app.api.v1.console.dashboard import router as console_dashboard_router
from app.api.v1.console.settings import router as console_settings_router
from app.api.v1.console.subscriptions import router as console_subscriptions_router
from app.api.v1.public.websites import router as public_websites_router

api_v1_router = APIRouter()

# Authentication
api_v1_router.include_router(auth_router)

# Super Admin Console
api_v1_router.include_router(console_companies_router, prefix="/console")
api_v1_router.include_router(console_business_types_router, prefix="/console")
api_v1_router.include_router(console_dashboard_router, prefix="/console")
api_v1_router.include_router(console_subscriptions_router, prefix="/console")
api_v1_router.include_router(console_settings_router, prefix="/console")
api_v1_router.include_router(console_administrators_router, prefix="/console")

# Company Admin Panel
api_v1_router.include_router(admin_profile_router, prefix="/admin")
api_v1_router.include_router(admin_locations_router, prefix="/admin")
api_v1_router.include_router(admin_categories_router, prefix="/admin")
api_v1_router.include_router(admin_services_router, prefix="/admin")
api_v1_router.include_router(admin_offers_router, prefix="/admin")
api_v1_router.include_router(admin_banners_router, prefix="/admin")
api_v1_router.include_router(admin_instagram_router, prefix="/admin")
api_v1_router.include_router(admin_youtube_router, prefix="/admin")
api_v1_router.include_router(admin_social_router, prefix="/admin")
api_v1_router.include_router(admin_faqs_router, prefix="/admin")
api_v1_router.include_router(admin_blogs_router, prefix="/admin")
api_v1_router.include_router(admin_testimonials_router, prefix="/admin")
api_v1_router.include_router(admin_sections_router, prefix="/admin")
api_v1_router.include_router(admin_contact_router, prefix="/admin")
api_v1_router.include_router(admin_media_router, prefix="/admin")
api_v1_router.include_router(admin_domains_router, prefix="/admin")

# Public Website
api_v1_router.include_router(public_websites_router)
