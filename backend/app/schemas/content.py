import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, EmailStr, Field, computed_field, model_validator


# 1. Company Profile
class CompanyProfileUpdate(BaseModel):
    company_name: str | None = Field(None, min_length=2, max_length=200)
    logo: str | None = None
    favicon: str | None = None
    short_description: str | None = None
    full_description: str | None = None
    about_section: str | None = None
    phone: str | None = None
    email: EmailStr | None = None
    whatsapp_number: str | None = None
    address: str | None = None
    city: str | None = None
    state: str | None = None
    country: str | None = None
    postal_code: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    opening_hours: dict[str, Any] | None = None
    website_url: str | None = None
    contact_email: EmailStr | None = None
    currency: str | None = None


class CompanyProfileResponse(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    company_name: str
    logo: str | None = None
    favicon: str | None = None
    short_description: str | None = None
    full_description: str | None = None
    about_section: str | None = None
    phone: str | None = None
    email: str | None = None
    whatsapp_number: str | None = None
    address: str | None = None
    city: str | None = None
    state: str | None = None
    country: str | None = None
    postal_code: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    opening_hours: dict[str, Any] | None = None
    website_url: str | None = None
    contact_email: str | None = None
    currency: str | None = "USD"
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# 2. Location
class LocationCreate(BaseModel):
    location_name: str = Field(min_length=2, max_length=200)
    address: str = Field(min_length=5, max_length=300)
    city: str = Field(min_length=2, max_length=100)
    state: str | None = None
    country: str = "India"
    postal_code: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    contact_number: str | None = None
    email: EmailStr | None = None
    opening_hours: dict[str, Any] | None = Field(default_factory=dict)
    status: str = Field(default="active", pattern="^(active|inactive)$")
    is_primary: bool = False


class LocationUpdate(BaseModel):
    location_name: str | None = Field(None, min_length=2, max_length=200)
    address: str | None = None
    city: str | None = None
    state: str | None = None
    country: str | None = None
    postal_code: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    contact_number: str | None = None
    email: EmailStr | None = None
    opening_hours: dict[str, Any] | None = None
    status: str | None = Field(None, pattern="^(active|inactive)$")
    is_primary: bool | None = None


class LocationResponse(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    location_name: str
    address: str
    city: str
    state: str | None = None
    country: str
    postal_code: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    contact_number: str | None = None
    email: str | None = None
    opening_hours: dict[str, Any] | None = None
    status: str
    is_primary: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# 3. Category
class CategoryCreate(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    slug: str | None = None
    description: str | None = None
    image: str | None = None
    image_url: str | None = None
    display_order: int = 0
    status: str = Field(default="active", pattern="^(active|inactive)$")
    is_active: bool | None = None
    seo_title: str | None = None
    seo_description: str | None = None

    @model_validator(mode="before")
    @classmethod
    def normalize_category_create(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "image_url" in data and not data.get("image"):
                data["image"] = data.get("image_url")
            if "is_active" in data and not data.get("status"):
                data["status"] = "active" if data.get("is_active") else "inactive"
        return data


class CategoryUpdate(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=150)
    slug: str | None = None
    description: str | None = None
    image: str | None = None
    image_url: str | None = None
    display_order: int | None = None
    status: str | None = Field(None, pattern="^(active|inactive)$")
    is_active: bool | None = None
    seo_title: str | None = None
    seo_description: str | None = None

    @model_validator(mode="before")
    @classmethod
    def normalize_category_update(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "image_url" in data and not data.get("image"):
                data["image"] = data.get("image_url")
            if "is_active" in data and not data.get("status"):
                data["status"] = "active" if data.get("is_active") else "inactive"
        return data


class CategoryResponse(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    name: str
    slug: str
    description: str | None = None
    image: str | None = None
    display_order: int
    status: str
    seo_title: str | None = None
    seo_description: str | None = None
    created_at: datetime
    updated_at: datetime

    @computed_field
    @property
    def image_url(self) -> str | None:
        return self.image

    @computed_field
    @property
    def is_active(self) -> bool:
        return self.status == "active"

    model_config = ConfigDict(from_attributes=True)


# 4. Service & Service Gallery
class ServiceGalleryResponse(BaseModel):
    id: uuid.UUID
    image_url: str
    display_order: int

    model_config = ConfigDict(from_attributes=True)


class ServiceCreate(BaseModel):
    category_id: uuid.UUID
    name: str = Field(min_length=2, max_length=200)
    slug: str | None = None
    short_description: str | None = None
    full_description: str | None = None
    featured_image: str | None = None
    gallery_images: list[str] | None = Field(default_factory=list)
    regular_price: float | None = None
    discounted_price: float | None = None
    currency: str = Field(default="USD", max_length=10)
    duration_minutes: int | None = Field(None, ge=1)
    is_featured: bool = False
    display_order: int = 0
    status: str = Field(default="active", pattern="^(active|inactive)$")
    seo_title: str | None = None
    seo_description: str | None = None

    # Aliases accepted from Company Admin UI:
    price: float | None = None
    offer_price: float | None = None
    image: str | None = None
    description: str | None = None
    is_active: bool | None = None

    @model_validator(mode="before")
    @classmethod
    def normalize_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "price" in data and not data.get("regular_price"):
                data["regular_price"] = data.get("price")
            if "offer_price" in data and not data.get("discounted_price"):
                data["discounted_price"] = data.get("offer_price")
            if "image" in data and not data.get("featured_image"):
                data["featured_image"] = data.get("image")
            if "description" in data and not data.get("short_description"):
                data["short_description"] = data.get("description")
            if "is_active" in data and not data.get("status"):
                data["status"] = "active" if data.get("is_active") else "inactive"
            if not data.get("regular_price"):
                data["regular_price"] = 0.0
        return data


class ServiceUpdate(BaseModel):
    category_id: uuid.UUID | None = None
    name: str | None = Field(None, min_length=2, max_length=200)
    slug: str | None = None
    short_description: str | None = None
    full_description: str | None = None
    featured_image: str | None = None
    gallery_images: list[str] | None = None
    regular_price: float | None = Field(None, gt=0)
    discounted_price: float | None = Field(None, ge=0)
    currency: str | None = None
    duration_minutes: int | None = Field(None, ge=1)
    is_featured: bool | None = None
    display_order: int | None = None
    status: str | None = Field(None, pattern="^(active|inactive)$")
    seo_title: str | None = None
    seo_description: str | None = None

    price: float | None = None
    offer_price: float | None = None
    image: str | None = None
    description: str | None = None
    is_active: bool | None = None

    @model_validator(mode="before")
    @classmethod
    def normalize_update_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "price" in data and not data.get("regular_price"):
                data["regular_price"] = data.get("price")
            if "offer_price" in data and not data.get("discounted_price"):
                data["discounted_price"] = data.get("offer_price")
            if "image" in data and not data.get("featured_image"):
                data["featured_image"] = data.get("image")
            if "description" in data and not data.get("short_description"):
                data["short_description"] = data.get("description")
            if "is_active" in data and not data.get("status"):
                data["status"] = "active" if data.get("is_active") else "inactive"
        return data


class ServiceResponse(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    category_id: uuid.UUID
    name: str
    slug: str
    short_description: str | None = None
    full_description: str | None = None
    featured_image: str | None = None
    gallery_images: list[ServiceGalleryResponse] = []
    regular_price: float
    discounted_price: float | None = None
    currency: str
    duration_minutes: int | None = None
    is_featured: bool
    display_order: int
    status: str
    seo_title: str | None = None
    seo_description: str | None = None
    created_at: datetime
    updated_at: datetime

    @computed_field
    @property
    def price(self) -> float:
        return self.regular_price

    @computed_field
    @property
    def offer_price(self) -> float | None:
        return self.discounted_price

    @computed_field
    @property
    def image(self) -> str | None:
        return self.featured_image

    @computed_field
    @property
    def description(self) -> str | None:
        return self.short_description or self.full_description

    @computed_field
    @property
    def is_active(self) -> bool:
        return self.status == "active"

    model_config = ConfigDict(from_attributes=True)


class ServiceBulkStatusUpdate(BaseModel):
    service_ids: list[uuid.UUID]
    status: str = Field(pattern="^(active|inactive)$")


class ServiceBulkOrderUpdateItem(BaseModel):
    service_id: uuid.UUID
    display_order: int


class ServiceBulkOrderUpdate(BaseModel):
    orders: list[ServiceBulkOrderUpdateItem]


class ServiceBulkDelete(BaseModel):
    service_ids: list[uuid.UUID]
    confirm: bool = Field(True, description="Explicit confirmation required to bulk delete")


# 5. Offer
class OfferCreate(BaseModel):
    title: str = Field(min_length=2, max_length=255)
    slug: str | None = None
    short_description: str | None = None
    full_content: str | None = None
    banner_image: str | None = None
    regular_price: float | None = None
    offer_price: float | None = None
    discount_percentage: float | None = None
    start_date: datetime | None = None
    expiry_date: datetime | None = None
    associated_service_ids: list[uuid.UUID] | None = Field(default_factory=list)
    cta_text: str | None = None
    cta_url: str | None = None
    is_featured: bool = False
    display_order: int = 0
    status: str = Field(default="active", pattern="^(active|inactive)$")


class OfferUpdate(BaseModel):
    title: str | None = Field(None, min_length=2, max_length=255)
    slug: str | None = None
    short_description: str | None = None
    full_content: str | None = None
    banner_image: str | None = None
    regular_price: float | None = None
    offer_price: float | None = None
    discount_percentage: float | None = None
    start_date: datetime | None = None
    expiry_date: datetime | None = None
    associated_service_ids: list[uuid.UUID] | None = None
    cta_text: str | None = None
    cta_url: str | None = None
    is_featured: bool | None = None
    display_order: int | None = None
    status: str | None = Field(None, pattern="^(active|inactive)$")


class OfferResponse(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    title: str
    slug: str
    short_description: str | None = None
    full_content: str | None = None
    banner_image: str | None = None
    regular_price: float | None = None
    offer_price: float | None = None
    discount_percentage: float | None = None
    start_date: datetime | None = None
    expiry_date: datetime | None = None
    cta_text: str | None = None
    cta_url: str | None = None
    is_featured: bool
    display_order: int
    status: str
    is_expired: bool = False
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# 6. Hero Banner
class BannerCreate(BaseModel):
    media_type: str = Field(default="IMAGE", pattern="^(IMAGE|VIDEO)$")
    desktop_media_url: str
    mobile_media_url: str | None = None
    desktop_video_url: str | None = None
    mobile_video_url: str | None = None
    heading: str | None = None
    subtitle: str | None = None
    description: str | None = None
    cta_button_text: str | None = None
    cta_button_url: str | None = None
    display_order: int = 0
    start_date: datetime | None = None
    end_date: datetime | None = None
    status: str = Field(default="active", pattern="^(active|inactive)$")


class BannerUpdate(BaseModel):
    media_type: str | None = Field(None, pattern="^(IMAGE|VIDEO)$")
    desktop_media_url: str | None = None
    mobile_media_url: str | None = None
    desktop_video_url: str | None = None
    mobile_video_url: str | None = None
    heading: str | None = None
    subtitle: str | None = None
    description: str | None = None
    cta_button_text: str | None = None
    cta_button_url: str | None = None
    display_order: int | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None
    status: str | None = Field(None, pattern="^(active|inactive)$")


class BannerResponse(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    media_type: str
    desktop_media_url: str
    mobile_media_url: str | None = None
    desktop_video_url: str | None = None
    mobile_video_url: str | None = None
    heading: str | None = None
    subtitle: str | None = None
    description: str | None = None
    cta_button_text: str | None = None
    cta_button_url: str | None = None
    display_order: int
    start_date: datetime | None = None
    end_date: datetime | None = None
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# 7. Instagram Post
class InstagramPostCreate(BaseModel):
    post_url: str
    caption: str | None = None
    thumbnail_url: str | None = None
    display_order: int = 0
    status: str = Field(default="active", pattern="^(active|inactive)$")


class InstagramPostUpdate(BaseModel):
    post_url: str | None = None
    caption: str | None = None
    thumbnail_url: str | None = None
    display_order: int | None = None
    status: str | None = Field(None, pattern="^(active|inactive)$")


class InstagramPostResponse(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    post_url: str
    caption: str | None = None
    thumbnail_url: str | None = None
    display_order: int
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# 8. YouTube Video
class YouTubeVideoCreate(BaseModel):
    title: str
    video_url: str
    thumbnail_url: str | None = None
    description: str | None = None
    display_order: int = 0
    status: str = Field(default="active", pattern="^(active|inactive)$")


class YouTubeVideoUpdate(BaseModel):
    title: str | None = None
    video_url: str | None = None
    thumbnail_url: str | None = None
    description: str | None = None
    display_order: int | None = None
    status: str | None = Field(None, pattern="^(active|inactive)$")


class YouTubeVideoResponse(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    title: str
    video_url: str
    youtube_video_id: str
    embed_url: str
    thumbnail_url: str | None = None
    description: str | None = None
    display_order: int
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# 9. Social Link
class SocialLinkCreate(BaseModel):
    platform: str = Field(pattern="^(instagram|facebook|youtube|whatsapp|linkedin|pinterest|tiktok|x)$")
    url: str
    display_order: int = 0
    status: str = Field(default="active", pattern="^(active|inactive)$")


class SocialLinkUpdate(BaseModel):
    platform: str | None = Field(None, pattern="^(instagram|facebook|youtube|whatsapp|linkedin|pinterest|tiktok|x)$")
    url: str | None = None
    display_order: int | None = None
    status: str | None = Field(None, pattern="^(active|inactive)$")


class SocialLinkResponse(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    platform: str
    url: str
    display_order: int
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# 10. FAQ
class FAQCreate(BaseModel):
    question: str = Field(min_length=5, max_length=500)
    answer: str = Field(min_length=5)
    display_order: int = 0
    status: str = Field(default="active", pattern="^(active|inactive)$")


class FAQUpdate(BaseModel):
    question: str | None = Field(None, min_length=5, max_length=500)
    answer: str | None = Field(None, min_length=5)
    display_order: int | None = None
    status: str | None = Field(None, pattern="^(active|inactive)$")


class FAQResponse(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    question: str
    answer: str
    display_order: int
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# 11. Blog
class BlogCreate(BaseModel):
    title: str = Field(min_length=3, max_length=255)
    slug: str | None = None
    short_description: str | None = None
    full_content: str = Field(min_length=10)
    featured_image: str | None = None
    author: str | None = None
    category: str | None = None
    tags: list[str] | None = Field(default_factory=list)
    seo_title: str | None = None
    seo_description: str | None = None
    canonical_url: str | None = None
    published_date: datetime | None = None
    status: str = Field(default="draft", pattern="^(draft|published|archived)$")


class BlogUpdate(BaseModel):
    title: str | None = Field(None, min_length=3, max_length=255)
    slug: str | None = None
    short_description: str | None = None
    full_content: str | None = Field(None, min_length=10)
    featured_image: str | None = None
    author: str | None = None
    category: str | None = None
    tags: list[str] | None = None
    seo_title: str | None = None
    seo_description: str | None = None
    canonical_url: str | None = None
    published_date: datetime | None = None
    status: str | None = Field(None, pattern="^(draft|published|archived)$")


class BlogResponse(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    title: str
    slug: str
    short_description: str | None = None
    full_content: str
    featured_image: str | None = None
    author: str | None = None
    category: str | None = None
    tags: list[str] | None = None
    seo_title: str | None = None
    seo_description: str | None = None
    canonical_url: str | None = None
    published_date: datetime | None = None
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# 12. Testimonial
class TestimonialCreate(BaseModel):
    customer_name: str = Field(min_length=2, max_length=150)
    customer_designation: str | None = None
    customer_image: str | None = None
    review: str = Field(min_length=5)
    rating: int = Field(default=5, ge=1, le=5)
    display_order: int = 0
    status: str = Field(default="active", pattern="^(active|inactive)$")


class TestimonialUpdate(BaseModel):
    customer_name: str | None = Field(None, min_length=2, max_length=150)
    customer_designation: str | None = None
    customer_image: str | None = None
    review: str | None = Field(None, min_length=5)
    rating: int | None = Field(None, ge=1, le=5)
    display_order: int | None = None
    status: str | None = Field(None, pattern="^(active|inactive)$")


class TestimonialResponse(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    customer_name: str
    customer_designation: str | None = None
    customer_image: str | None = None
    review: str
    rating: int
    display_order: int
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# 13. Website Sections
class WebsiteSectionUpdate(BaseModel):
    enabled: bool | None = None
    is_enabled: bool | None = None
    display_order: int | None = None
    configuration: dict[str, Any] | None = None
    settings: dict[str, Any] | None = None

    @model_validator(mode="before")
    @classmethod
    def normalize_section_update(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "is_enabled" in data and "enabled" not in data:
                data["enabled"] = data.get("is_enabled")
            if "settings" in data and "configuration" not in data:
                data["configuration"] = data.get("settings")
        return data


class WebsiteSectionBatchUpdateItem(BaseModel):
    section_key: str
    enabled: bool = True
    is_enabled: bool | None = None
    display_order: int = 0
    configuration: dict[str, Any] | None = None
    settings: dict[str, Any] | None = None

    @model_validator(mode="before")
    @classmethod
    def normalize_section_batch(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "is_enabled" in data and "enabled" not in data:
                data["enabled"] = data.get("is_enabled")
            if "settings" in data and "configuration" not in data:
                data["configuration"] = data.get("settings")
        return data


class WebsiteSectionBatchUpdate(BaseModel):
    sections: list[WebsiteSectionBatchUpdateItem]


class WebsiteSectionResponse(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    section_key: str
    enabled: bool
    display_order: int
    configuration: dict[str, Any] | None = None
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

    @computed_field
    @property
    def is_enabled(self) -> bool:
        return self.enabled

    @computed_field
    @property
    def display_name(self) -> str:
        return self.section_key.replace("_", " ").title()

    @computed_field
    @property
    def settings(self) -> dict[str, Any] | None:
        return self.configuration


# 14. Contact Details & Enquiries
class ContactDetailsUpdate(BaseModel):
    business_email: EmailStr | None = None
    phone: str | None = None
    whatsapp: str | None = None
    address: str | None = None
    map_url: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    opening_hours: dict[str, Any] | None = None


class ContactDetailsResponse(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    business_email: str | None = None
    phone: str | None = None
    whatsapp: str | None = None
    address: str | None = None
    map_url: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    opening_hours: dict[str, Any] | None = None
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ContactEnquiryCreate(BaseModel):
    customer_name: str = Field(min_length=2, max_length=150)
    email: EmailStr
    phone: str | None = None
    subject: str | None = None
    message: str = Field(min_length=5)


class ContactEnquiryStatusUpdate(BaseModel):
    status: str = Field(pattern="^(new|read|replied|closed)$")


class ContactEnquiryResponse(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    customer_name: str
    email: str
    phone: str | None = None
    subject: str | None = None
    message: str
    submission_date: datetime
    status: str

    model_config = ConfigDict(from_attributes=True)


# 15. Media Asset
class MediaAssetCreateUrl(BaseModel):
    file_url: str
    original_name: str
    media_type: str = "gallery"
    label: str | None = None
    file_size: int = 0


class MediaAssetResponse(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    file_name: str
    original_name: str
    file_url: str
    mime_type: str
    file_size: int
    storage_provider: str
    media_type: str
    metadata_info: dict[str, Any] | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
