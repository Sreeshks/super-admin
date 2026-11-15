from datetime import UTC, datetime

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException
from app.models.content import (
    FAQ,
    Banner,
    Blog,
    Category,
    CompanyProfile,
    ContactDetails,
    ContactEnquiry,
    InstagramPost,
    Location,
    MediaAsset,
    Offer,
    Service,
    SocialLink,
    Testimonial,
    WebsiteSection,
    YouTubeVideo,
)
from app.models.tenant import Tenant
from app.schemas.common import PaginationMeta
from app.schemas.content import (
    BannerResponse,
    BlogResponse,
    CategoryResponse,
    CompanyProfileResponse,
    ContactDetailsResponse,
    ContactEnquiryCreate,
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
from app.schemas.public import PublicSitemapResponse, PublicWebsiteData, SitemapUrl
from app.schemas.tenant import CompanyResponse
from app.utils.youtube import get_youtube_embed_url


class PublicService:
    def __init__(self, db: AsyncSession, tenant: Tenant):
        self.db = db
        self.tenant = tenant
        self.tenant_id = tenant.id

    async def get_enabled_sections_map(self) -> dict[str, bool]:
        """Fetch section visibility map."""
        stmt = select(WebsiteSection).where(WebsiteSection.tenant_id == self.tenant_id)
        res = await self.db.execute(stmt)
        sections = res.scalars().all()
        # Default True if not found
        return {s.section_key: s.enabled for s in sections}

    async def get_aggregated_website_data(self) -> PublicWebsiteData:
        """
        Assemble the full public website payload.
        Only returns content for enabled website sections!
        """
        sections_map = await self.get_enabled_sections_map()
        now = datetime.now(UTC)

        # 1. Profile & Company
        profile_res = await self.get_profile()

        # 2. Locations
        locations = await self.get_locations()

        # 3. Sections list
        stmt_sec = (
            select(WebsiteSection)
            .where(WebsiteSection.tenant_id == self.tenant_id)
            .order_by(WebsiteSection.display_order.asc())
        )
        sections = (await self.db.execute(stmt_sec)).scalars().all()

        # 4. Banners (Hero section)
        banners = []
        if sections_map.get("hero", True):
            stmt_b = (
                select(Banner)
                .where(
                    Banner.tenant_id == self.tenant_id,
                    Banner.status == "active",
                    Banner.is_deleted == False,
                    or_(Banner.start_date.is_(None), Banner.start_date <= now),
                    or_(Banner.end_date.is_(None), Banner.end_date >= now),
                )
                .order_by(Banner.display_order.asc())
            )
            banners = (await self.db.execute(stmt_b)).scalars().all()

        # 5. Categories
        categories = []
        if sections_map.get("categories", True):
            stmt_cat = (
                select(Category)
                .where(
                    Category.tenant_id == self.tenant_id,
                    Category.status == "active",
                    Category.is_deleted == False,
                )
                .order_by(Category.display_order.asc())
            )
            categories = (await self.db.execute(stmt_cat)).scalars().all()

        # 6. Featured Services
        services = []
        if sections_map.get("services", True):
            stmt_srv = (
                select(Service)
                .where(
                    Service.tenant_id == self.tenant_id,
                    Service.status == "active",
                    Service.is_featured == True,
                    Service.is_deleted == False,
                )
                .order_by(Service.display_order.asc())
                .limit(12)
            )
            services = (await self.db.execute(stmt_srv)).scalars().all()

        # 7. Offers
        offers = []
        if sections_map.get("offers", True):
            stmt_off = (
                select(Offer)
                .where(
                    Offer.tenant_id == self.tenant_id,
                    Offer.status == "active",
                    Offer.is_deleted == False,
                    or_(Offer.start_date.is_(None), Offer.start_date <= now),
                    or_(Offer.expiry_date.is_(None), Offer.expiry_date >= now),
                )
                .order_by(Offer.display_order.asc())
            )
            offers = (await self.db.execute(stmt_off)).scalars().all()

        # 8. Instagram Posts
        instagram_posts = []
        if sections_map.get("instagram", True):
            stmt_ig = (
                select(InstagramPost)
                .where(
                    InstagramPost.tenant_id == self.tenant_id,
                    InstagramPost.status == "active",
                    InstagramPost.is_deleted == False,
                )
                .order_by(InstagramPost.display_order.asc())
            )
            instagram_posts = (await self.db.execute(stmt_ig)).scalars().all()

        # 9. YouTube Videos
        youtube_videos = []
        if sections_map.get("youtube", True):
            stmt_yt = (
                select(YouTubeVideo)
                .where(
                    YouTubeVideo.tenant_id == self.tenant_id,
                    YouTubeVideo.status == "active",
                    YouTubeVideo.is_deleted == False,
                )
                .order_by(YouTubeVideo.display_order.asc())
            )
            youtube_videos = (await self.db.execute(stmt_yt)).scalars().all()
            for y in youtube_videos:
                y.embed_url = get_youtube_embed_url(y.youtube_video_id)

        # 10. Social Links
        stmt_soc = (
            select(SocialLink)
            .where(
                SocialLink.tenant_id == self.tenant_id,
                SocialLink.status == "active",
                SocialLink.is_deleted == False,
            )
            .order_by(SocialLink.display_order.asc())
        )
        social_links = (await self.db.execute(stmt_soc)).scalars().all()

        # 11. Testimonials
        testimonials = []
        if sections_map.get("testimonials", True):
            stmt_testim = (
                select(Testimonial)
                .where(
                    Testimonial.tenant_id == self.tenant_id,
                    Testimonial.status == "active",
                    Testimonial.is_deleted == False,
                )
                .order_by(Testimonial.display_order.asc())
            )
            testimonials = (await self.db.execute(stmt_testim)).scalars().all()

        # 12. FAQs
        faqs = []
        if sections_map.get("faq", True):
            stmt_faq = (
                select(FAQ)
                .where(
                    FAQ.tenant_id == self.tenant_id,
                    FAQ.status == "active",
                    FAQ.is_deleted == False,
                )
                .order_by(FAQ.display_order.asc())
            )
            faqs = (await self.db.execute(stmt_faq)).scalars().all()

        # 13. Blogs
        blogs = []
        if sections_map.get("blog", True):
            stmt_blog = (
                select(Blog)
                .where(
                    Blog.tenant_id == self.tenant_id,
                    Blog.status == "published",
                    Blog.is_deleted == False,
                )
                .order_by(Blog.published_date.desc())
                .limit(6)
            )
            blogs = (await self.db.execute(stmt_blog)).scalars().all()

        # 14. Gallery (Media Assets)
        gallery_items = []
        if sections_map.get("gallery", True):
            stmt_gal = (
                select(MediaAsset)
                .where(
                    MediaAsset.tenant_id == self.tenant_id,
                    MediaAsset.is_deleted == False,
                )
                .order_by(MediaAsset.created_at.asc())
            )
            gallery_items = (await self.db.execute(stmt_gal)).scalars().all()

        # 15. Contact
        contact = None
        if sections_map.get("contact", True):
            stmt_con = select(ContactDetails).where(ContactDetails.tenant_id == self.tenant_id)
            contact = (await self.db.execute(stmt_con)).scalars().first()

        return PublicWebsiteData(
            company=CompanyResponse.model_validate(self.tenant),
            profile=CompanyProfileResponse.model_validate(profile_res) if profile_res else None,
            locations=[LocationResponse.model_validate(l) for l in locations],
            sections=[WebsiteSectionResponse.model_validate(s) for s in sections],
            banners=[BannerResponse.model_validate(b) for b in banners],
            categories=[CategoryResponse.model_validate(c) for c in categories],
            featured_services=[ServiceResponse.model_validate(s) for s in services],
            offers=[OfferResponse.model_validate(o) for o in offers],
            instagram_posts=[InstagramPostResponse.model_validate(ig) for ig in instagram_posts],
            youtube_videos=[YouTubeVideoResponse.model_validate(yt) for yt in youtube_videos],
            social_links=[SocialLinkResponse.model_validate(sl) for sl in social_links],
            testimonials=[TestimonialResponse.model_validate(t) for t in testimonials],
            faqs=[FAQResponse.model_validate(f) for f in faqs],
            blogs=[BlogResponse.model_validate(b) for b in blogs],
            gallery=[MediaAssetResponse.model_validate(g) for g in gallery_items],
            contact=ContactDetailsResponse.model_validate(contact) if contact else None,
        )

    async def get_profile(self) -> CompanyProfile | None:
        stmt = select(CompanyProfile).where(CompanyProfile.tenant_id == self.tenant_id)
        return (await self.db.execute(stmt)).scalars().first()

    async def get_locations(self) -> list[Location]:
        stmt = (
            select(Location)
            .where(Location.tenant_id == self.tenant_id, Location.status == "active", Location.is_deleted == False)
            .order_by(Location.is_primary.desc())
        )
        return list((await self.db.execute(stmt)).scalars().all())

    async def get_gallery(self) -> list[MediaAsset]:
        stmt = (
            select(MediaAsset)
            .where(MediaAsset.tenant_id == self.tenant_id, MediaAsset.is_deleted == False)
            .order_by(MediaAsset.created_at.asc())
        )
        return list((await self.db.execute(stmt)).scalars().all())

    async def get_categories(self) -> list[Category]:
        sections_map = await self.get_enabled_sections_map()
        if not sections_map.get("categories", True):
            return []
        stmt = (
            select(Category)
            .where(Category.tenant_id == self.tenant_id, Category.status == "active", Category.is_deleted == False)
            .order_by(Category.display_order.asc())
        )
        return list((await self.db.execute(stmt)).scalars().all())

    async def get_services(
        self,
        page: int = 1,
        page_size: int = 20,
        category_slug: str | None = None,
    ) -> tuple[list[Service], PaginationMeta]:
        sections_map = await self.get_enabled_sections_map()
        if not sections_map.get("services", True):
            return [], PaginationMeta(
                page=page, page_size=page_size, total_items=0, total_pages=0, has_next=False, has_previous=False
            )

        stmt = select(Service).where(
            Service.tenant_id == self.tenant_id,
            Service.status == "active",
            Service.is_deleted == False,
        )
        if category_slug:
            stmt = stmt.join(Category, Category.id == Service.category_id).where(Category.slug == category_slug)

        # Count
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total_items = (await self.db.execute(count_stmt)).scalar() or 0
        total_pages = (total_items + page_size - 1) // page_size if total_items > 0 else 0

        offset = (page - 1) * page_size
        stmt = stmt.order_by(Service.display_order.asc()).offset(offset).limit(page_size)
        items = list((await self.db.execute(stmt)).scalars().all())

        meta = PaginationMeta(
            page=page,
            page_size=page_size,
            total_items=total_items,
            total_pages=total_pages,
            has_next=page < total_pages,
            has_previous=page > 1,
        )
        return items, meta

    async def get_service_by_slug(self, slug: str) -> Service:
        stmt = select(Service).where(
            Service.tenant_id == self.tenant_id,
            Service.slug == slug,
            Service.status == "active",
            Service.is_deleted == False,
        )
        service = (await self.db.execute(stmt)).scalars().first()
        if not service:
            raise NotFoundException("Service not found")
        return service

    async def get_blog_by_slug(self, slug: str) -> Blog:
        sections_map = await self.get_enabled_sections_map()
        if not sections_map.get("blog", True):
            raise NotFoundException("Blog section is disabled")
        stmt = select(Blog).where(
            Blog.tenant_id == self.tenant_id,
            Blog.slug == slug,
            Blog.status == "published",
            Blog.is_deleted == False,
        )
        blog = (await self.db.execute(stmt)).scalars().first()
        if not blog:
            raise NotFoundException("Blog article not found")
        return blog

    async def submit_enquiry(self, data: ContactEnquiryCreate) -> ContactEnquiry:
        enquiry = ContactEnquiry(
            tenant_id=self.tenant_id,
            customer_name=data.customer_name,
            email=str(data.email),
            phone=data.phone,
            subject=data.subject,
            message=data.message,
            status="new",
        )
        self.db.add(enquiry)
        await self.db.commit()
        await self.db.refresh(enquiry)
        return enquiry

    async def generate_sitemap(self, base_url: str = "") -> PublicSitemapResponse:
        slug = self.tenant.slug
        base = base_url.rstrip("/") if base_url else f"https://{slug}.platform.com"

        urls = [
            SitemapUrl(loc=f"{base}/", priority=1.0),
            SitemapUrl(loc=f"{base}/services", priority=0.8),
            SitemapUrl(loc=f"{base}/offers", priority=0.8),
            SitemapUrl(loc=f"{base}/blogs", priority=0.7),
            SitemapUrl(loc=f"{base}/contact", priority=0.6),
        ]

        # Add active services
        stmt_srv = select(Service.slug).where(
            Service.tenant_id == self.tenant_id, Service.status == "active", Service.is_deleted == False
        )
        for s_slug in (await self.db.execute(stmt_srv)).scalars().all():
            urls.append(SitemapUrl(loc=f"{base}/services/{s_slug}", priority=0.7))

        # Add published blogs
        stmt_blog = select(Blog.slug).where(
            Blog.tenant_id == self.tenant_id, Blog.status == "published", Blog.is_deleted == False
        )
        for b_slug in (await self.db.execute(stmt_blog)).scalars().all():
            urls.append(SitemapUrl(loc=f"{base}/blogs/{b_slug}", priority=0.7))

        return PublicSitemapResponse(company_slug=slug, urls=urls)
