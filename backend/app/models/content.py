import uuid
from datetime import UTC, datetime

from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Table,
    Text,
    Uuid,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, TenantScopedModel

# Association table for Offers and Services
offer_services = Table(
    "offer_services",
    Base.metadata,
    Column("offer_id", Uuid(as_uuid=True), ForeignKey("offers.id", ondelete="CASCADE"), primary_key=True),
    Column("service_id", Uuid(as_uuid=True), ForeignKey("services.id", ondelete="CASCADE"), primary_key=True),
)


class CompanyProfile(TenantScopedModel):
    __tablename__ = "company_profiles"

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), unique=True, nullable=False, index=True
    )
    company_name: Mapped[str] = mapped_column(String(200), nullable=False)
    logo: Mapped[str | None] = mapped_column(String(500), nullable=True)
    favicon: Mapped[str | None] = mapped_column(String(500), nullable=True)
    short_description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    full_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    about_section: Mapped[str | None] = mapped_column(Text, nullable=True)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    whatsapp_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    address: Mapped[str | None] = mapped_column(String(300), nullable=True)
    city: Mapped[str | None] = mapped_column(String(100), nullable=True)
    state: Mapped[str | None] = mapped_column(String(100), nullable=True)
    country: Mapped[str | None] = mapped_column(String(100), nullable=True)
    postal_code: Mapped[str | None] = mapped_column(String(30), nullable=True)
    latitude: Mapped[float | None] = mapped_column(Numeric(10, 7), nullable=True)
    longitude: Mapped[float | None] = mapped_column(Numeric(10, 7), nullable=True)
    opening_hours: Mapped[dict | None] = mapped_column(JSON, nullable=True, default=dict)
    website_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    contact_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    currency: Mapped[str | None] = mapped_column(String(10), default="USD", nullable=True)

    tenant = relationship("Tenant", back_populates="profile")


class Location(TenantScopedModel):
    __tablename__ = "locations"

    location_name: Mapped[str] = mapped_column(String(200), nullable=False)
    address: Mapped[str] = mapped_column(String(300), nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    state: Mapped[str | None] = mapped_column(String(100), nullable=True)
    country: Mapped[str] = mapped_column(String(100), nullable=False)
    postal_code: Mapped[str | None] = mapped_column(String(30), nullable=True)
    latitude: Mapped[float | None] = mapped_column(Numeric(10, 7), nullable=True)
    longitude: Mapped[float | None] = mapped_column(Numeric(10, 7), nullable=True)
    contact_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    opening_hours: Mapped[dict | None] = mapped_column(JSON, nullable=True, default=dict)
    status: Mapped[str] = mapped_column(String(30), default="active", nullable=False)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    tenant = relationship("Tenant", back_populates="locations")


class Category(TenantScopedModel):
    __tablename__ = "categories"

    name: Mapped[str] = mapped_column(String(150), nullable=False)
    slug: Mapped[str] = mapped_column(String(150), index=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    image: Mapped[str | None] = mapped_column(String(500), nullable=True)
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="active", nullable=False)
    seo_title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    seo_description: Mapped[str | None] = mapped_column(String(500), nullable=True)

    services = relationship("Service", back_populates="category", cascade="all, delete-orphan")


class Service(TenantScopedModel):
    __tablename__ = "services"

    category_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("categories.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    slug: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    short_description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    full_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    featured_image: Mapped[str | None] = mapped_column(String(500), nullable=True)
    regular_price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    discounted_price: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    currency: Mapped[str] = mapped_column(String(10), default="USD", nullable=False)
    duration_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="active", nullable=False, index=True)
    seo_title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    seo_description: Mapped[str | None] = mapped_column(String(500), nullable=True)

    category = relationship("Category", back_populates="services")
    gallery_images = relationship(
        "ServiceGalleryImage", back_populates="service", cascade="all, delete-orphan", lazy="selectin"
    )
    offers = relationship("Offer", secondary=offer_services, back_populates="services")


class ServiceGalleryImage(TenantScopedModel):
    __tablename__ = "service_gallery"

    service_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("services.id", ondelete="CASCADE"), nullable=False, index=True
    )
    image_url: Mapped[str] = mapped_column(String(500), nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    service = relationship("Service", back_populates="gallery_images")


class Offer(TenantScopedModel):
    __tablename__ = "offers"

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    short_description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    full_content: Mapped[str | None] = mapped_column(Text, nullable=True)
    banner_image: Mapped[str | None] = mapped_column(String(500), nullable=True)
    regular_price: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    offer_price: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    discount_percentage: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    start_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    expiry_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    cta_text: Mapped[str | None] = mapped_column(String(100), nullable=True)
    cta_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="active", nullable=False, index=True)

    services = relationship("Service", secondary=offer_services, back_populates="offers", lazy="selectin")


class Banner(TenantScopedModel):
    __tablename__ = "banners"

    media_type: Mapped[str] = mapped_column(String(20), default="IMAGE", nullable=False)  # IMAGE, VIDEO
    desktop_media_url: Mapped[str] = mapped_column(String(500), nullable=False)
    mobile_media_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    desktop_video_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    mobile_video_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    heading: Mapped[str | None] = mapped_column(String(255), nullable=True)
    subtitle: Mapped[str | None] = mapped_column(String(255), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    cta_button_text: Mapped[str | None] = mapped_column(String(100), nullable=True)
    cta_button_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    start_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    end_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(String(30), default="active", nullable=False, index=True)


class InstagramPost(TenantScopedModel):
    __tablename__ = "instagram_posts"

    post_url: Mapped[str] = mapped_column(String(500), nullable=False)
    caption: Mapped[str | None] = mapped_column(Text, nullable=True)
    thumbnail_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="active", nullable=False)


class YouTubeVideo(TenantScopedModel):
    __tablename__ = "youtube_videos"

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    video_url: Mapped[str] = mapped_column(String(500), nullable=False)
    youtube_video_id: Mapped[str] = mapped_column(String(50), nullable=False)
    thumbnail_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="active", nullable=False)


class SocialLink(TenantScopedModel):
    __tablename__ = "social_links"

    platform: Mapped[str] = mapped_column(
        String(50), nullable=False
    )  # instagram, facebook, youtube, whatsapp, linkedin, pinterest, tiktok, x
    url: Mapped[str] = mapped_column(String(500), nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="active", nullable=False)


class FAQ(TenantScopedModel):
    __tablename__ = "faqs"

    question: Mapped[str] = mapped_column(String(500), nullable=False)
    answer: Mapped[str] = mapped_column(Text, nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="active", nullable=False)


class Blog(TenantScopedModel):
    __tablename__ = "blogs"

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    short_description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    full_content: Mapped[str] = mapped_column(Text, nullable=False)
    featured_image: Mapped[str | None] = mapped_column(String(500), nullable=True)
    author: Mapped[str | None] = mapped_column(String(100), nullable=True)
    category: Mapped[str | None] = mapped_column(String(100), nullable=True)
    tags: Mapped[list | None] = mapped_column(JSON, nullable=True, default=list)
    seo_title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    seo_description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    canonical_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    published_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(
        String(30), default="draft", nullable=False, index=True
    )  # draft, published, archived


class Testimonial(TenantScopedModel):
    __tablename__ = "testimonials"

    customer_name: Mapped[str] = mapped_column(String(150), nullable=False)
    customer_designation: Mapped[str | None] = mapped_column(String(150), nullable=True)
    customer_image: Mapped[str | None] = mapped_column(String(500), nullable=True)
    review: Mapped[str] = mapped_column(Text, nullable=False)
    rating: Mapped[int] = mapped_column(Integer, default=5, nullable=False)  # 1 to 5
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="active", nullable=False)


class WebsiteSection(TenantScopedModel):
    __tablename__ = "website_sections"

    section_key: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    configuration: Mapped[dict | None] = mapped_column(JSON, nullable=True, default=dict)

    tenant = relationship("Tenant", back_populates="sections")


class ContactDetails(TenantScopedModel):
    __tablename__ = "contact_details"

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), unique=True, nullable=False, index=True
    )
    business_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    whatsapp: Mapped[str | None] = mapped_column(String(50), nullable=True)
    address: Mapped[str | None] = mapped_column(String(300), nullable=True)
    map_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    latitude: Mapped[float | None] = mapped_column(Numeric(10, 7), nullable=True)
    longitude: Mapped[float | None] = mapped_column(Numeric(10, 7), nullable=True)
    opening_hours: Mapped[dict | None] = mapped_column(JSON, nullable=True, default=dict)

    tenant = relationship("Tenant", back_populates="contact_details")


class ContactEnquiry(TenantScopedModel):
    __tablename__ = "contact_enquiries"

    customer_name: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    subject: Mapped[str | None] = mapped_column(String(255), nullable=True)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    submission_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )
    status: Mapped[str] = mapped_column(String(30), default="new", nullable=False)  # new, read, replied, closed


class MediaAsset(TenantScopedModel):
    __tablename__ = "media_assets"

    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    original_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    file_url: Mapped[str] = mapped_column(String(500), nullable=False)
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    file_size: Mapped[int] = mapped_column(Integer, nullable=False)
    storage_provider: Mapped[str] = mapped_column(String(50), default="local", nullable=False)
    media_type: Mapped[str] = mapped_column(
        String(50), nullable=False
    )  # logo, category, service, offer, banner, blog, etc.
    metadata_info: Mapped[dict | None] = mapped_column(JSON, nullable=True, default=dict)
