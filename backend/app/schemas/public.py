from pydantic import BaseModel

from app.schemas.content import (
    BannerResponse,
    BlogResponse,
    CategoryResponse,
    CompanyProfileResponse,
    ContactDetailsResponse,
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
from app.schemas.tenant import CompanyResponse


class PublicWebsiteData(BaseModel):
    company: CompanyResponse
    profile: CompanyProfileResponse | None = None
    locations: list[LocationResponse] = []
    sections: list[WebsiteSectionResponse] = []
    banners: list[BannerResponse] = []
    categories: list[CategoryResponse] = []
    featured_services: list[ServiceResponse] = []
    offers: list[OfferResponse] = []
    instagram_posts: list[InstagramPostResponse] = []
    youtube_videos: list[YouTubeVideoResponse] = []
    social_links: list[SocialLinkResponse] = []
    testimonials: list[TestimonialResponse] = []
    faqs: list[FAQResponse] = []
    blogs: list[BlogResponse] = []
    gallery: list[MediaAssetResponse] = []
    contact: ContactDetailsResponse | None = None


class SitemapUrl(BaseModel):
    loc: str
    changefreq: str = "weekly"
    priority: float = 0.8
    lastmod: str | None = None


class PublicSitemapResponse(BaseModel):
    company_slug: str
    urls: list[SitemapUrl]
