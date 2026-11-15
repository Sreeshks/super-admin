import uuid
from datetime import UTC, datetime

from sqlalchemy import func, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import (
    BadRequestException,
    ConflictException,
    NotFoundException,
)
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
    Offer,
    Service,
    ServiceGalleryImage,
    SocialLink,
    Testimonial,
    WebsiteSection,
    YouTubeVideo,
    offer_services,
)
from app.repositories.tenant_aware import TenantAwareRepository
from app.schemas.common import PaginationMeta
from app.schemas.content import (
    BannerCreate,
    BannerUpdate,
    BlogCreate,
    BlogUpdate,
    CategoryCreate,
    CategoryUpdate,
    CompanyProfileUpdate,
    ContactDetailsUpdate,
    ContactEnquiryStatusUpdate,
    FAQCreate,
    FAQUpdate,
    InstagramPostCreate,
    InstagramPostUpdate,
    LocationCreate,
    LocationUpdate,
    OfferCreate,
    OfferUpdate,
    ServiceBulkOrderUpdate,
    ServiceBulkStatusUpdate,
    ServiceCreate,
    ServiceUpdate,
    SocialLinkCreate,
    SocialLinkUpdate,
    TestimonialCreate,
    TestimonialUpdate,
    WebsiteSectionBatchUpdate,
    WebsiteSectionUpdate,
    YouTubeVideoCreate,
    YouTubeVideoUpdate,
)
from app.utils.slug import generate_slug
from app.utils.youtube import extract_youtube_id, get_youtube_embed_url


class ContentService:
    def __init__(self, db: AsyncSession, tenant_id: uuid.UUID):
        self.db = db
        self.tenant_id = tenant_id

    # ------------------ PROFILE ------------------
    async def get_profile(self) -> CompanyProfile:
        stmt = select(CompanyProfile).where(CompanyProfile.tenant_id == self.tenant_id)
        res = await self.db.execute(stmt)
        profile = res.scalars().first()
        if not profile:
            raise NotFoundException("Company profile not found")
        return profile

    async def update_profile(self, data: CompanyProfileUpdate) -> CompanyProfile:
        profile = await self.get_profile()
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(profile, key, value)
        await self.db.commit()
        await self.db.refresh(profile)
        return profile

    # ------------------ LOCATIONS ------------------
    async def list_locations(self, page: int = 1, page_size: int = 20) -> tuple[list[Location], PaginationMeta]:
        repo = TenantAwareRepository(Location, self.db, self.tenant_id)
        items, meta = await repo.list_paginated(
            page=page,
            page_size=page_size,
            order_by=Location.is_primary.desc(),
        )
        return list(items), meta

    async def create_location(self, data: LocationCreate) -> Location:
        if data.is_primary:
            # Demote existing primary locations
            await self.db.execute(update(Location).where(Location.tenant_id == self.tenant_id).values(is_primary=False))

        loc = Location(tenant_id=self.tenant_id, **data.model_dump())
        self.db.add(loc)
        await self.db.commit()
        await self.db.refresh(loc)
        return loc

    async def update_location(self, loc_id: uuid.UUID, data: LocationUpdate) -> Location:
        repo = TenantAwareRepository(Location, self.db, self.tenant_id)
        loc = await repo.get_by_id(loc_id)
        if not loc:
            raise NotFoundException("Location not found")

        update_dict = data.model_dump(exclude_unset=True)
        if update_dict.get("is_primary") is True:
            await self.db.execute(
                update(Location)
                .where(Location.tenant_id == self.tenant_id, Location.id != loc_id)
                .values(is_primary=False)
            )

        for key, val in update_dict.items():
            setattr(loc, key, val)

        await self.db.commit()
        await self.db.refresh(loc)
        return loc

    async def delete_location(self, loc_id: uuid.UUID) -> None:
        repo = TenantAwareRepository(Location, self.db, self.tenant_id)
        loc = await repo.get_by_id(loc_id)
        if not loc:
            raise NotFoundException("Location not found")
        await repo.soft_delete(loc)
        await self.db.commit()

    # ------------------ CATEGORIES ------------------
    async def list_categories(
        self,
        page: int = 1,
        page_size: int = 20,
        search: str | None = None,
        status: str | None = None,
    ) -> tuple[list[Category], PaginationMeta]:
        repo = TenantAwareRepository(Category, self.db, self.tenant_id)
        filters = []
        if status:
            filters.append(Category.status == status)
        if search:
            filters.append(Category.name.ilike(f"%{search.strip()}%"))

        items, meta = await repo.list_paginated(
            page=page,
            page_size=page_size,
            filters=filters,
            order_by=Category.display_order.asc(),
        )
        return list(items), meta

    async def create_category(self, data: CategoryCreate) -> Category:
        slug = data.slug.strip() if data.slug else generate_slug(data.name)
        # Check slug unique within tenant
        stmt = select(Category).where(
            Category.tenant_id == self.tenant_id,
            Category.slug == slug,
            Category.is_deleted == False,
        )
        if (await self.db.execute(stmt)).scalars().first():
            raise ConflictException(f"Category slug '{slug}' already exists in your company")

        cat_dict = data.model_dump()
        cat_dict["slug"] = slug
        category = Category(tenant_id=self.tenant_id, **cat_dict)
        self.db.add(category)
        await self.db.commit()
        await self.db.refresh(category)
        return category

    async def update_category(self, cat_id: uuid.UUID, data: CategoryUpdate) -> Category:
        repo = TenantAwareRepository(Category, self.db, self.tenant_id)
        category = await repo.get_by_id(cat_id)
        if not category:
            raise NotFoundException("Category not found")

        update_dict = data.model_dump(exclude_unset=True)
        if update_dict.get("slug"):
            slug = generate_slug(update_dict["slug"])
            stmt = select(Category).where(
                Category.tenant_id == self.tenant_id,
                Category.slug == slug,
                Category.id != cat_id,
                Category.is_deleted == False,
            )
            if (await self.db.execute(stmt)).scalars().first():
                raise ConflictException(f"Category slug '{slug}' already exists")
            update_dict["slug"] = slug

        for k, v in update_dict.items():
            setattr(category, k, v)

        await self.db.commit()
        await self.db.refresh(category)
        return category

    async def delete_category(self, cat_id: uuid.UUID) -> None:
        repo = TenantAwareRepository(Category, self.db, self.tenant_id)
        category = await repo.get_by_id(cat_id)
        if not category:
            raise NotFoundException("Category not found")

        # Check if services exist under this category
        stmt_services = select(func.count(Service.id)).where(
            Service.tenant_id == self.tenant_id,
            Service.category_id == cat_id,
            Service.is_deleted == False,
        )
        count = (await self.db.execute(stmt_services)).scalar() or 0
        if count > 0:
            raise BadRequestException(f"Cannot delete category: {count} service(s) are associated with it.")

        await repo.soft_delete(category)
        await self.db.commit()

    # ------------------ SERVICES ------------------
    async def list_services(
        self,
        page: int = 1,
        page_size: int = 20,
        search: str | None = None,
        category_id: uuid.UUID | None = None,
        status: str | None = None,
        is_featured: bool | None = None,
        sort_by: str = "created_at",
        sort_order: str = "desc",
    ) -> tuple[list[Service], PaginationMeta]:
        repo = TenantAwareRepository(Service, self.db, self.tenant_id)
        filters = []
        if category_id:
            filters.append(Service.category_id == category_id)
        if status:
            filters.append(Service.status == status)
        if is_featured is not None:
            filters.append(Service.is_featured == is_featured)
        if search:
            filters.append(Service.name.ilike(f"%{search.strip()}%"))

        col = getattr(Service, sort_by, Service.created_at)
        order_clause = col.desc() if sort_order.lower() == "desc" else col.asc()

        items, meta = await repo.list_paginated(
            page=page,
            page_size=page_size,
            filters=filters,
            order_by=order_clause,
        )
        return list(items), meta

    async def create_service(self, data: ServiceCreate) -> Service:
        # Validate category belongs to this tenant
        cat_repo = TenantAwareRepository(Category, self.db, self.tenant_id)
        category = await cat_repo.get_by_id(data.category_id)
        if not category:
            raise BadRequestException("Invalid category_id: Category does not exist in your tenant")

        # Validate price discount
        if data.discounted_price is not None and data.discounted_price >= data.regular_price:
            raise BadRequestException("Discounted price must be less than regular price")

        slug = data.slug.strip() if data.slug else generate_slug(data.name)
        stmt = select(Service).where(
            Service.tenant_id == self.tenant_id,
            Service.slug == slug,
            Service.is_deleted == False,
        )
        if (await self.db.execute(stmt)).scalars().first():
            raise ConflictException(f"Service slug '{slug}' already exists in your company")

        service_dict = data.model_dump(exclude={"gallery_images"})
        service_dict["slug"] = slug
        service = Service(tenant_id=self.tenant_id, **service_dict)
        self.db.add(service)
        await self.db.flush()

        # Add gallery images if any
        if data.gallery_images:
            for i, img_url in enumerate(data.gallery_images):
                img = ServiceGalleryImage(
                    tenant_id=self.tenant_id,
                    service_id=service.id,
                    image_url=img_url,
                    display_order=i,
                )
                self.db.add(img)

        await self.db.commit()
        await self.db.refresh(service)
        return service

    async def update_service(self, service_id: uuid.UUID, data: ServiceUpdate) -> Service:
        repo = TenantAwareRepository(Service, self.db, self.tenant_id)
        service = await repo.get_by_id(service_id)
        if not service:
            raise NotFoundException("Service not found")

        update_dict = data.model_dump(exclude_unset=True, exclude={"gallery_images"})

        if update_dict.get("category_id"):
            cat_repo = TenantAwareRepository(Category, self.db, self.tenant_id)
            if not await cat_repo.get_by_id(update_dict["category_id"]):
                raise BadRequestException("Category does not exist in your company")

        regular = update_dict.get("regular_price", service.regular_price)
        discount = update_dict.get("discounted_price", service.discounted_price)
        if discount is not None and discount >= regular:
            raise BadRequestException("Discounted price must be less than regular price")

        if update_dict.get("slug"):
            slug = generate_slug(update_dict["slug"])
            stmt = select(Service).where(
                Service.tenant_id == self.tenant_id,
                Service.slug == slug,
                Service.id != service_id,
                Service.is_deleted == False,
            )
            if (await self.db.execute(stmt)).scalars().first():
                raise ConflictException(f"Service slug '{slug}' already exists")
            update_dict["slug"] = slug

        for k, v in update_dict.items():
            setattr(service, k, v)

        if data.gallery_images is not None:
            # Replace gallery images
            await self.db.execute(
                update(ServiceGalleryImage).where(ServiceGalleryImage.service_id == service_id).values(is_deleted=True)
            )
            for i, img_url in enumerate(data.gallery_images):
                img = ServiceGalleryImage(
                    tenant_id=self.tenant_id,
                    service_id=service.id,
                    image_url=img_url,
                    display_order=i,
                )
                self.db.add(img)

        await self.db.commit()
        await self.db.refresh(service)
        return service

    async def delete_service(self, service_id: uuid.UUID) -> None:
        repo = TenantAwareRepository(Service, self.db, self.tenant_id)
        service = await repo.get_by_id(service_id)
        if not service:
            raise NotFoundException("Service not found")
        await repo.soft_delete(service)
        await self.db.commit()

    async def bulk_update_service_status(self, data: ServiceBulkStatusUpdate) -> int:
        stmt = (
            update(Service)
            .where(
                Service.tenant_id == self.tenant_id,
                Service.id.in_(data.service_ids),
                Service.is_deleted == False,
            )
            .values(status=data.status)
        )
        res = await self.db.execute(stmt)
        await self.db.commit()
        return res.rowcount

    async def bulk_update_service_order(self, data: ServiceBulkOrderUpdate) -> None:
        for item in data.orders:
            await self.db.execute(
                update(Service)
                .where(
                    Service.tenant_id == self.tenant_id,
                    Service.id == item.service_id,
                    Service.is_deleted == False,
                )
                .values(display_order=item.display_order)
            )
        await self.db.commit()

    async def bulk_delete_services(self, service_ids: list[uuid.UUID]) -> int:
        stmt = (
            update(Service)
            .where(
                Service.tenant_id == self.tenant_id,
                Service.id.in_(service_ids),
                Service.is_deleted == False,
            )
            .values(is_deleted=True, deleted_at=datetime.now(UTC))
        )
        res = await self.db.execute(stmt)
        await self.db.commit()
        return res.rowcount

    # ------------------ OFFERS ------------------
    async def list_offers(
        self,
        page: int = 1,
        page_size: int = 20,
        status_filter: str | None = None,  # "active", "scheduled", "expired"
    ) -> tuple[list[Offer], PaginationMeta]:
        repo = TenantAwareRepository(Offer, self.db, self.tenant_id)
        now = datetime.now(UTC)
        filters = []

        if status_filter == "expired":
            filters.append(Offer.expiry_date < now)
        elif status_filter == "scheduled":
            filters.append(Offer.start_date > now)
        elif status_filter == "active":
            filters.append(Offer.status == "active")
            filters.append(or_(Offer.expiry_date.is_(None), Offer.expiry_date >= now))
            filters.append(or_(Offer.start_date.is_(None), Offer.start_date <= now))

        items, meta = await repo.list_paginated(
            page=page,
            page_size=page_size,
            filters=filters,
            order_by=Offer.display_order.asc(),
        )
        # Compute is_expired dynamically
        for off in items:
            off.is_expired = off.expiry_date < now if off.expiry_date else False
        return list(items), meta

    async def create_offer(self, data: OfferCreate) -> Offer:
        slug = data.slug.strip() if data.slug else generate_slug(data.title)
        offer_dict = data.model_dump(exclude={"associated_service_ids"})
        offer_dict["slug"] = slug
        offer = Offer(tenant_id=self.tenant_id, **offer_dict)
        self.db.add(offer)
        await self.db.flush()

        if data.associated_service_ids:
            for s_id in data.associated_service_ids:
                stmt_link = offer_services.insert().values(offer_id=offer.id, service_id=s_id)
                await self.db.execute(stmt_link)

        await self.db.commit()
        await self.db.refresh(offer)
        return offer

    async def update_offer(self, offer_id: uuid.UUID, data: OfferUpdate) -> Offer:
        repo = TenantAwareRepository(Offer, self.db, self.tenant_id)
        offer = await repo.get_by_id(offer_id)
        if not offer:
            raise NotFoundException("Offer not found")

        update_dict = data.model_dump(exclude_unset=True, exclude={"associated_service_ids"})
        if update_dict.get("slug"):
            update_dict["slug"] = generate_slug(update_dict["slug"])

        for k, v in update_dict.items():
            setattr(offer, k, v)

        if data.associated_service_ids is not None:
            await self.db.execute(offer_services.delete().where(offer_services.c.offer_id == offer_id))
            for s_id in data.associated_service_ids:
                await self.db.execute(offer_services.insert().values(offer_id=offer.id, service_id=s_id))

        await self.db.commit()
        await self.db.refresh(offer)
        return offer

    async def delete_offer(self, offer_id: uuid.UUID) -> None:
        repo = TenantAwareRepository(Offer, self.db, self.tenant_id)
        offer = await repo.get_by_id(offer_id)
        if not offer:
            raise NotFoundException("Offer not found")
        await repo.soft_delete(offer)
        await self.db.commit()

    # ------------------ HERO BANNERS ------------------
    async def list_banners(self) -> list[Banner]:
        repo = TenantAwareRepository(Banner, self.db, self.tenant_id)
        return list(await repo.list(order_by=Banner.display_order.asc()))

    async def create_banner(self, data: BannerCreate) -> Banner:
        banner = Banner(tenant_id=self.tenant_id, **data.model_dump())
        self.db.add(banner)
        await self.db.commit()
        await self.db.refresh(banner)
        return banner

    async def update_banner(self, banner_id: uuid.UUID, data: BannerUpdate) -> Banner:
        repo = TenantAwareRepository(Banner, self.db, self.tenant_id)
        banner = await repo.get_by_id(banner_id)
        if not banner:
            raise NotFoundException("Banner not found")
        for k, v in data.model_dump(exclude_unset=True).items():
            setattr(banner, k, v)
        await self.db.commit()
        await self.db.refresh(banner)
        return banner

    async def delete_banner(self, banner_id: uuid.UUID) -> None:
        repo = TenantAwareRepository(Banner, self.db, self.tenant_id)
        banner = await repo.get_by_id(banner_id)
        if not banner:
            raise NotFoundException("Banner not found")
        await repo.soft_delete(banner)
        await self.db.commit()

    # ------------------ INSTAGRAM POSTS ------------------
    async def list_instagram_posts(self) -> list[InstagramPost]:
        repo = TenantAwareRepository(InstagramPost, self.db, self.tenant_id)
        return list(await repo.list(order_by=InstagramPost.display_order.asc()))

    async def create_instagram_post(self, data: InstagramPostCreate) -> InstagramPost:
        post = InstagramPost(tenant_id=self.tenant_id, **data.model_dump())
        self.db.add(post)
        await self.db.commit()
        await self.db.refresh(post)
        return post

    async def update_instagram_post(self, post_id: uuid.UUID, data: InstagramPostUpdate) -> InstagramPost:
        repo = TenantAwareRepository(InstagramPost, self.db, self.tenant_id)
        post = await repo.get_by_id(post_id)
        if not post:
            raise NotFoundException("Instagram post not found")
        for k, v in data.model_dump(exclude_unset=True).items():
            setattr(post, k, v)
        await self.db.commit()
        await self.db.refresh(post)
        return post

    async def delete_instagram_post(self, post_id: uuid.UUID) -> None:
        repo = TenantAwareRepository(InstagramPost, self.db, self.tenant_id)
        post = await repo.get_by_id(post_id)
        if not post:
            raise NotFoundException("Instagram post not found")
        await repo.soft_delete(post)
        await self.db.commit()

    # ------------------ YOUTUBE VIDEOS ------------------
    async def list_youtube_videos(self) -> list[YouTubeVideo]:
        repo = TenantAwareRepository(YouTubeVideo, self.db, self.tenant_id)
        videos = await repo.list(order_by=YouTubeVideo.display_order.asc())
        for v in videos:
            v.embed_url = get_youtube_embed_url(v.youtube_video_id)
        return list(videos)

    async def create_youtube_video(self, data: YouTubeVideoCreate) -> YouTubeVideo:
        video_id = extract_youtube_id(data.video_url)
        if not video_id:
            raise BadRequestException("Could not extract a valid YouTube video ID from the provided URL")

        video = YouTubeVideo(
            tenant_id=self.tenant_id,
            title=data.title,
            video_url=data.video_url,
            youtube_video_id=video_id,
            thumbnail_url=data.thumbnail_url or f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg",
            description=data.description,
            display_order=data.display_order,
            status=data.status,
        )
        self.db.add(video)
        await self.db.commit()
        await self.db.refresh(video)
        video.embed_url = get_youtube_embed_url(video.youtube_video_id)
        return video

    async def update_youtube_video(self, video_id: uuid.UUID, data: YouTubeVideoUpdate) -> YouTubeVideo:
        repo = TenantAwareRepository(YouTubeVideo, self.db, self.tenant_id)
        video = await repo.get_by_id(video_id)
        if not video:
            raise NotFoundException("YouTube video not found")

        update_dict = data.model_dump(exclude_unset=True)
        if update_dict.get("video_url"):
            y_id = extract_youtube_id(update_dict["video_url"])
            if not y_id:
                raise BadRequestException("Invalid YouTube URL")
            video.youtube_video_id = y_id
            if not update_dict.get("thumbnail_url"):
                video.thumbnail_url = f"https://img.youtube.com/vi/{y_id}/hqdefault.jpg"

        for k, v in update_dict.items():
            setattr(video, k, v)

        await self.db.commit()
        await self.db.refresh(video)
        video.embed_url = get_youtube_embed_url(video.youtube_video_id)
        return video

    async def delete_youtube_video(self, video_id: uuid.UUID) -> None:
        repo = TenantAwareRepository(YouTubeVideo, self.db, self.tenant_id)
        video = await repo.get_by_id(video_id)
        if not video:
            raise NotFoundException("YouTube video not found")
        await repo.soft_delete(video)
        await self.db.commit()

    # ------------------ SOCIAL LINKS ------------------
    async def list_social_links(self) -> list[SocialLink]:
        repo = TenantAwareRepository(SocialLink, self.db, self.tenant_id)
        return list(await repo.list(order_by=SocialLink.display_order.asc()))

    async def create_social_link(self, data: SocialLinkCreate) -> SocialLink:
        link = SocialLink(tenant_id=self.tenant_id, **data.model_dump())
        self.db.add(link)
        await self.db.commit()
        await self.db.refresh(link)
        return link

    async def update_social_link(self, link_id: uuid.UUID, data: SocialLinkUpdate) -> SocialLink:
        repo = TenantAwareRepository(SocialLink, self.db, self.tenant_id)
        link = await repo.get_by_id(link_id)
        if not link:
            raise NotFoundException("Social link not found")
        for k, v in data.model_dump(exclude_unset=True).items():
            setattr(link, k, v)
        await self.db.commit()
        await self.db.refresh(link)
        return link

    async def delete_social_link(self, link_id: uuid.UUID) -> None:
        repo = TenantAwareRepository(SocialLink, self.db, self.tenant_id)
        link = await repo.get_by_id(link_id)
        if not link:
            raise NotFoundException("Social link not found")
        await repo.soft_delete(link)
        await self.db.commit()

    # ------------------ FAQS ------------------
    async def list_faqs(self, page: int = 1, page_size: int = 20) -> tuple[list[FAQ], PaginationMeta]:
        repo = TenantAwareRepository(FAQ, self.db, self.tenant_id)
        items, meta = await repo.list_paginated(
            page=page,
            page_size=page_size,
            order_by=FAQ.display_order.asc(),
        )
        return list(items), meta

    async def create_faq(self, data: FAQCreate) -> FAQ:
        faq = FAQ(tenant_id=self.tenant_id, **data.model_dump())
        self.db.add(faq)
        await self.db.commit()
        await self.db.refresh(faq)
        return faq

    async def update_faq(self, faq_id: uuid.UUID, data: FAQUpdate) -> FAQ:
        repo = TenantAwareRepository(FAQ, self.db, self.tenant_id)
        faq = await repo.get_by_id(faq_id)
        if not faq:
            raise NotFoundException("FAQ not found")
        for k, v in data.model_dump(exclude_unset=True).items():
            setattr(faq, k, v)
        await self.db.commit()
        await self.db.refresh(faq)
        return faq

    async def delete_faq(self, faq_id: uuid.UUID) -> None:
        repo = TenantAwareRepository(FAQ, self.db, self.tenant_id)
        faq = await repo.get_by_id(faq_id)
        if not faq:
            raise NotFoundException("FAQ not found")
        await repo.soft_delete(faq)
        await self.db.commit()

    # ------------------ BLOGS ------------------
    async def list_blogs(
        self,
        page: int = 1,
        page_size: int = 20,
        status: str | None = None,
        search: str | None = None,
    ) -> tuple[list[Blog], PaginationMeta]:
        repo = TenantAwareRepository(Blog, self.db, self.tenant_id)
        filters = []
        if status:
            filters.append(Blog.status == status)
        if search:
            filters.append(Blog.title.ilike(f"%{search.strip()}%"))

        items, meta = await repo.list_paginated(
            page=page,
            page_size=page_size,
            filters=filters,
            order_by=Blog.published_date.desc(),
        )
        return list(items), meta

    async def create_blog(self, data: BlogCreate) -> Blog:
        slug = data.slug.strip() if data.slug else generate_slug(data.title)
        stmt = select(Blog).where(
            Blog.tenant_id == self.tenant_id,
            Blog.slug == slug,
            Blog.is_deleted == False,
        )
        if (await self.db.execute(stmt)).scalars().first():
            raise ConflictException(f"Blog slug '{slug}' already exists in your company")

        blog_dict = data.model_dump()
        blog_dict["slug"] = slug
        if data.status == "published" and not data.published_date:
            blog_dict["published_date"] = datetime.now(UTC)

        blog = Blog(tenant_id=self.tenant_id, **blog_dict)
        self.db.add(blog)
        await self.db.commit()
        await self.db.refresh(blog)
        return blog

    async def update_blog(self, blog_id: uuid.UUID, data: BlogUpdate) -> Blog:
        repo = TenantAwareRepository(Blog, self.db, self.tenant_id)
        blog = await repo.get_by_id(blog_id)
        if not blog:
            raise NotFoundException("Blog not found")

        update_dict = data.model_dump(exclude_unset=True)
        if update_dict.get("slug"):
            slug = generate_slug(update_dict["slug"])
            stmt = select(Blog).where(
                Blog.tenant_id == self.tenant_id,
                Blog.slug == slug,
                Blog.id != blog_id,
                Blog.is_deleted == False,
            )
            if (await self.db.execute(stmt)).scalars().first():
                raise ConflictException(f"Blog slug '{slug}' already exists")
            update_dict["slug"] = slug

        if update_dict.get("status") == "published" and not blog.published_date:
            update_dict["published_date"] = datetime.now(UTC)

        for k, v in update_dict.items():
            setattr(blog, k, v)

        await self.db.commit()
        await self.db.refresh(blog)
        return blog

    async def delete_blog(self, blog_id: uuid.UUID) -> None:
        repo = TenantAwareRepository(Blog, self.db, self.tenant_id)
        blog = await repo.get_by_id(blog_id)
        if not blog:
            raise NotFoundException("Blog not found")
        await repo.soft_delete(blog)
        await self.db.commit()

    # ------------------ TESTIMONIALS ------------------
    async def list_testimonials(self, page: int = 1, page_size: int = 20) -> tuple[list[Testimonial], PaginationMeta]:
        repo = TenantAwareRepository(Testimonial, self.db, self.tenant_id)
        items, meta = await repo.list_paginated(
            page=page,
            page_size=page_size,
            order_by=Testimonial.display_order.asc(),
        )
        return list(items), meta

    async def create_testimonial(self, data: TestimonialCreate) -> Testimonial:
        testim = Testimonial(tenant_id=self.tenant_id, **data.model_dump())
        self.db.add(testim)
        await self.db.commit()
        await self.db.refresh(testim)
        return testim

    async def update_testimonial(self, testim_id: uuid.UUID, data: TestimonialUpdate) -> Testimonial:
        repo = TenantAwareRepository(Testimonial, self.db, self.tenant_id)
        testim = await repo.get_by_id(testim_id)
        if not testim:
            raise NotFoundException("Testimonial not found")
        for k, v in data.model_dump(exclude_unset=True).items():
            setattr(testim, k, v)
        await self.db.commit()
        await self.db.refresh(testim)
        return testim

    async def delete_testimonial(self, testim_id: uuid.UUID) -> None:
        repo = TenantAwareRepository(Testimonial, self.db, self.tenant_id)
        testim = await repo.get_by_id(testim_id)
        if not testim:
            raise NotFoundException("Testimonial not found")
        await repo.soft_delete(testim)
        await self.db.commit()

    # ------------------ WEBSITE SECTIONS ------------------
    async def list_sections(self) -> list[WebsiteSection]:
        stmt = (
            select(WebsiteSection)
            .where(WebsiteSection.tenant_id == self.tenant_id)
            .order_by(WebsiteSection.display_order.asc())
        )
        res = await self.db.execute(stmt)
        return list(res.scalars().all())

    async def update_section(self, section_key: str, data: WebsiteSectionUpdate) -> WebsiteSection:
        stmt = select(WebsiteSection).where(
            WebsiteSection.tenant_id == self.tenant_id,
            WebsiteSection.section_key == section_key,
        )
        res = await self.db.execute(stmt)
        sec = res.scalars().first()
        if not sec:
            sec = WebsiteSection(tenant_id=self.tenant_id, section_key=section_key)
            self.db.add(sec)

        for k, v in data.model_dump(exclude_unset=True).items():
            setattr(sec, k, v)

        await self.db.commit()
        await self.db.refresh(sec)
        return sec

    async def batch_update_sections(self, data: WebsiteSectionBatchUpdate) -> list[WebsiteSection]:
        updated_secs = []
        for item in data.sections:
            stmt = select(WebsiteSection).where(
                WebsiteSection.tenant_id == self.tenant_id,
                WebsiteSection.section_key == item.section_key,
            )
            res = await self.db.execute(stmt)
            sec = res.scalars().first()
            if not sec:
                sec = WebsiteSection(tenant_id=self.tenant_id, section_key=item.section_key)
                self.db.add(sec)
            sec.enabled = item.enabled
            sec.display_order = item.display_order
            if item.configuration is not None:
                sec.configuration = item.configuration
            updated_secs.append(sec)

        await self.db.commit()
        return updated_secs

    # ------------------ CONTACT & ENQUIRIES ------------------
    async def get_contact_details(self) -> ContactDetails:
        stmt = select(ContactDetails).where(ContactDetails.tenant_id == self.tenant_id)
        res = await self.db.execute(stmt)
        cd = res.scalars().first()
        if not cd:
            cd = ContactDetails(tenant_id=self.tenant_id)
            self.db.add(cd)
            await self.db.commit()
            await self.db.refresh(cd)
        return cd

    async def update_contact_details(self, data: ContactDetailsUpdate) -> ContactDetails:
        cd = await self.get_contact_details()
        for k, v in data.model_dump(exclude_unset=True).items():
            setattr(cd, k, v)
        await self.db.commit()
        await self.db.refresh(cd)
        return cd

    async def list_enquiries(
        self,
        page: int = 1,
        page_size: int = 20,
        status: str | None = None,
        search: str | None = None,
    ) -> tuple[list[ContactEnquiry], PaginationMeta]:
        repo = TenantAwareRepository(ContactEnquiry, self.db, self.tenant_id)
        filters = []
        if status:
            filters.append(ContactEnquiry.status == status)
        if search:
            filters.append(
                or_(
                    ContactEnquiry.customer_name.ilike(f"%{search.strip()}%"),
                    ContactEnquiry.email.ilike(f"%{search.strip()}%"),
                    ContactEnquiry.message.ilike(f"%{search.strip()}%"),
                )
            )
        items, meta = await repo.list_paginated(
            page=page,
            page_size=page_size,
            filters=filters,
            order_by=ContactEnquiry.submission_date.desc(),
        )
        return list(items), meta

    async def update_enquiry_status(self, enquiry_id: uuid.UUID, data: ContactEnquiryStatusUpdate) -> ContactEnquiry:
        repo = TenantAwareRepository(ContactEnquiry, self.db, self.tenant_id)
        enquiry = await repo.get_by_id(enquiry_id)
        if not enquiry:
            raise NotFoundException("Enquiry not found")
        enquiry.status = data.status
        await self.db.commit()
        await self.db.refresh(enquiry)
        return enquiry
