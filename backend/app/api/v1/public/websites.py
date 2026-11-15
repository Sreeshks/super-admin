from typing import Optional

from fastapi import APIRouter, Depends, Query, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import NotFoundException
from app.dependencies.rate_limit import rate_limit_public_enquiry
from app.dependencies.tenant import resolve_public_tenant
from app.models.tenant import Tenant
from app.repositories.tenant import TenantRepository
from app.schemas.common import PaginatedResponse, StandardResponse
from app.schemas.content import (
    BannerResponse,
    BlogResponse,
    CategoryResponse,
    CompanyProfileResponse,
    ContactDetailsResponse,
    ContactEnquiryCreate,
    ContactEnquiryResponse,
    FAQResponse,
    InstagramPostResponse,
    LocationResponse,
    MediaAssetResponse,
    OfferResponse,
    ServiceResponse,
    SocialLinkResponse,
    TestimonialResponse,
    WebsiteSectionResponse,
    YouTubeVideoResponse,
)
from app.schemas.public import (
    PublicSitemapResponse,
    PublicWebsiteData,
)
from app.services.public_service import PublicService

router = APIRouter(prefix="/public/websites", tags=["Public Website"])


@router.get("/resolve/domain", response_model=StandardResponse[dict[str, str]])
async def resolve_domain(
    domain: str = Query(..., description="Custom domain to resolve"),
    db: AsyncSession = Depends(get_db),
):
    tenant_repo = TenantRepository(db)
    clean_domain = domain.split(":")[0].strip().lower()
    tenant = await tenant_repo.get_by_verified_domain(clean_domain)
    if not tenant or tenant.website_status != "active" or tenant.account_status != "active":
        raise NotFoundException("Custom domain not found or inactive")
    return StandardResponse(
        message="Domain resolved",
        data={"slug": tenant.slug, "company_name": tenant.name},
    )


@router.get("/{slug}", response_model=StandardResponse[PublicWebsiteData])
async def get_public_website(
    tenant: Tenant = Depends(resolve_public_tenant),
    db: AsyncSession = Depends(get_db),
):
    service = PublicService(db, tenant)
    data = await service.get_aggregated_website_data()
    return StandardResponse(
        message="Public website configuration retrieved successfully",
        data=data,
    )


@router.get("/{slug}/profile", response_model=StandardResponse[Optional[CompanyProfileResponse]])
async def get_public_profile(
    tenant: Tenant = Depends(resolve_public_tenant),
    db: AsyncSession = Depends(get_db),
):
    service = PublicService(db, tenant)
    profile = await service.get_profile()
    return StandardResponse(
        message="Profile retrieved",
        data=CompanyProfileResponse.model_validate(profile) if profile else None,
    )


@router.get("/{slug}/locations", response_model=StandardResponse[list[LocationResponse]])
async def get_public_locations(
    tenant: Tenant = Depends(resolve_public_tenant),
    db: AsyncSession = Depends(get_db),
):
    service = PublicService(db, tenant)
    locations = await service.get_locations()
    return StandardResponse(
        message="Locations retrieved",
        data=[LocationResponse.model_validate(l) for l in locations],
    )


@router.get("/{slug}/categories", response_model=StandardResponse[list[CategoryResponse]])
async def get_public_categories(
    tenant: Tenant = Depends(resolve_public_tenant),
    db: AsyncSession = Depends(get_db),
):
    service = PublicService(db, tenant)
    categories = await service.get_categories()
    return StandardResponse(
        message="Categories retrieved",
        data=[CategoryResponse.model_validate(c) for c in categories],
    )


@router.get("/{slug}/services", response_model=PaginatedResponse[ServiceResponse])
async def get_public_services(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category: str | None = Query(None, description="Category slug"),
    tenant: Tenant = Depends(resolve_public_tenant),
    db: AsyncSession = Depends(get_db),
):
    service = PublicService(db, tenant)
    items, pagination = await service.get_services(page=page, page_size=page_size, category_slug=category)
    return PaginatedResponse(
        data=[ServiceResponse.model_validate(s) for s in items],
        pagination=pagination,
    )


@router.get("/{slug}/services/{service_slug}", response_model=StandardResponse[ServiceResponse])
async def get_public_service_by_slug(
    service_slug: str,
    tenant: Tenant = Depends(resolve_public_tenant),
    db: AsyncSession = Depends(get_db),
):
    service = PublicService(db, tenant)
    item = await service.get_service_by_slug(service_slug)
    return StandardResponse(
        message="Service details retrieved",
        data=ServiceResponse.model_validate(item),
    )


@router.get("/{slug}/offers", response_model=StandardResponse[list[OfferResponse]])
async def get_public_offers(
    tenant: Tenant = Depends(resolve_public_tenant),
    db: AsyncSession = Depends(get_db),
):
    service = PublicService(db, tenant)
    web_data = await service.get_aggregated_website_data()
    return StandardResponse(
        message="Offers retrieved",
        data=web_data.offers,
    )


@router.get("/{slug}/banners", response_model=StandardResponse[list[BannerResponse]])
async def get_public_banners(
    tenant: Tenant = Depends(resolve_public_tenant),
    db: AsyncSession = Depends(get_db),
):
    service = PublicService(db, tenant)
    web_data = await service.get_aggregated_website_data()
    return StandardResponse(
        message="Banners retrieved",
        data=web_data.banners,
    )


@router.get("/{slug}/gallery", response_model=StandardResponse[list[MediaAssetResponse]])
async def get_public_gallery(
    tenant: Tenant = Depends(resolve_public_tenant),
    db: AsyncSession = Depends(get_db),
):
    service = PublicService(db, tenant)
    gallery = await service.get_gallery()
    return StandardResponse(
        message="Gallery images retrieved",
        data=[MediaAssetResponse.model_validate(g) for g in gallery],
    )


@router.get("/{slug}/videos", response_model=StandardResponse[list[YouTubeVideoResponse]])
async def get_public_videos(
    tenant: Tenant = Depends(resolve_public_tenant),
    db: AsyncSession = Depends(get_db),
):
    service = PublicService(db, tenant)
    web_data = await service.get_aggregated_website_data()
    return StandardResponse(
        message="YouTube videos retrieved",
        data=web_data.youtube_videos,
    )


@router.get("/{slug}/instagram", response_model=StandardResponse[list[InstagramPostResponse]])
async def get_public_instagram(
    tenant: Tenant = Depends(resolve_public_tenant),
    db: AsyncSession = Depends(get_db),
):
    service = PublicService(db, tenant)
    web_data = await service.get_aggregated_website_data()
    return StandardResponse(
        message="Instagram posts retrieved",
        data=web_data.instagram_posts,
    )


@router.get("/{slug}/social-links", response_model=StandardResponse[list[SocialLinkResponse]])
async def get_public_social_links(
    tenant: Tenant = Depends(resolve_public_tenant),
    db: AsyncSession = Depends(get_db),
):
    service = PublicService(db, tenant)
    web_data = await service.get_aggregated_website_data()
    return StandardResponse(
        message="Social links retrieved",
        data=web_data.social_links,
    )


@router.get("/{slug}/faqs", response_model=StandardResponse[list[FAQResponse]])
async def get_public_faqs(
    tenant: Tenant = Depends(resolve_public_tenant),
    db: AsyncSession = Depends(get_db),
):
    service = PublicService(db, tenant)
    web_data = await service.get_aggregated_website_data()
    return StandardResponse(
        message="FAQs retrieved",
        data=web_data.faqs,
    )


@router.get("/{slug}/blogs", response_model=StandardResponse[list[BlogResponse]])
async def get_public_blogs(
    tenant: Tenant = Depends(resolve_public_tenant),
    db: AsyncSession = Depends(get_db),
):
    service = PublicService(db, tenant)
    web_data = await service.get_aggregated_website_data()
    return StandardResponse(
        message="Blogs retrieved",
        data=web_data.blogs,
    )


@router.get("/{slug}/blogs/{blog_slug}", response_model=StandardResponse[BlogResponse])
async def get_public_blog_by_slug(
    blog_slug: str,
    tenant: Tenant = Depends(resolve_public_tenant),
    db: AsyncSession = Depends(get_db),
):
    service = PublicService(db, tenant)
    item = await service.get_blog_by_slug(blog_slug)
    return StandardResponse(
        message="Blog details retrieved",
        data=BlogResponse.model_validate(item),
    )


@router.get("/{slug}/testimonials", response_model=StandardResponse[list[TestimonialResponse]])
async def get_public_testimonials(
    tenant: Tenant = Depends(resolve_public_tenant),
    db: AsyncSession = Depends(get_db),
):
    service = PublicService(db, tenant)
    web_data = await service.get_aggregated_website_data()
    return StandardResponse(
        message="Testimonials retrieved",
        data=web_data.testimonials,
    )


@router.get("/{slug}/contact", response_model=StandardResponse[Optional[ContactDetailsResponse]])
async def get_public_contact(
    tenant: Tenant = Depends(resolve_public_tenant),
    db: AsyncSession = Depends(get_db),
):
    service = PublicService(db, tenant)
    web_data = await service.get_aggregated_website_data()
    return StandardResponse(
        message="Contact info retrieved",
        data=web_data.contact,
    )


@router.get("/{slug}/sections", response_model=StandardResponse[list[WebsiteSectionResponse]])
async def get_public_sections(
    tenant: Tenant = Depends(resolve_public_tenant),
    db: AsyncSession = Depends(get_db),
):
    service = PublicService(db, tenant)
    web_data = await service.get_aggregated_website_data()
    return StandardResponse(
        message="Website sections status retrieved",
        data=web_data.sections,
    )


@router.get("/{slug}/sitemap", response_model=StandardResponse[PublicSitemapResponse])
async def get_public_sitemap(
    request: Request,
    tenant: Tenant = Depends(resolve_public_tenant),
    db: AsyncSession = Depends(get_db),
):
    service = PublicService(db, tenant)
    base_url = str(request.base_url).rstrip("/")
    sitemap = await service.generate_sitemap(base_url)
    return StandardResponse(
        message="Sitemap generated",
        data=sitemap,
    )


@router.post(
    "/{slug}/enquiries",
    response_model=StandardResponse[ContactEnquiryResponse],
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(rate_limit_public_enquiry)],
)
async def submit_public_enquiry(
    data: ContactEnquiryCreate,
    tenant: Tenant = Depends(resolve_public_tenant),
    db: AsyncSession = Depends(get_db),
):
    service = PublicService(db, tenant)
    enquiry = await service.submit_enquiry(data)
    return StandardResponse(
        message="Your enquiry has been received. Our team will contact you shortly.",
        data=ContactEnquiryResponse.model_validate(enquiry),
    )
