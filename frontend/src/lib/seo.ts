import { Metadata } from "next";
import { Blog, CompanyInfo, CompanyProfile, FAQ, LocationItem, Service } from "@/types";

export function generateTenantMetadata({
  company,
  profile,
  pageTitle,
  pageDescription,
  canonicalPath = "",
  image,
}: {
  company: CompanyInfo;
  profile?: CompanyProfile | null;
  pageTitle?: string;
  pageDescription?: string;
  canonicalPath?: string;
  image?: string | null;
}): Metadata {
  const businessName = profile?.company_name || company.name;
  const description =
    pageDescription ||
    profile?.short_description ||
    `Welcome to ${businessName}. Discover our premium beauty, wellness, and salon services.`;
  const title = pageTitle ? `${pageTitle} | ${businessName}` : `${businessName} | Official Website`;
  const heroImage = image || profile?.logo || "/og-fallback.jpg";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: businessName,
      images: [
        {
          url: heroImage,
          width: 1200,
          height: 630,
          alt: businessName,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [heroImage],
    },
    alternates: {
      canonical: canonicalPath,
    },
    icons: {
      icon: profile?.favicon || profile?.logo || "/favicon.ico",
    },
  };
}

export function generateLocalBusinessSchema(
  company: CompanyInfo,
  profile?: CompanyProfile | null,
  locations: LocationItem[] = []
) {
  const primaryLoc = locations.find((l) => l.is_primary) || locations[0];
  const businessType = company.business_type?.slug?.toLowerCase() || "";
  let schemaType = "LocalBusiness";
  if (businessType.includes("salon") || businessType.includes("hair")) {
    schemaType = "BeautySalon";
  } else if (businessType.includes("spa") || businessType.includes("wellness")) {
    schemaType = "HealthAndBeautyBusiness";
  }

  return {
    "@context": "https://schema.org",
    "@type": schemaType,
    name: profile?.company_name || company.name,
    description: profile?.short_description || profile?.full_description || "",
    image: profile?.logo || undefined,
    telephone: profile?.phone || primaryLoc?.contact_number || undefined,
    email: profile?.email || primaryLoc?.email || undefined,
    address: primaryLoc
      ? {
          "@type": "PostalAddress",
          streetAddress: primaryLoc.address,
          addressLocality: primaryLoc.city,
          addressRegion: primaryLoc.state || undefined,
          postalCode: primaryLoc.postal_code || undefined,
          addressCountry: primaryLoc.country || "IN",
        }
      : profile?.address
      ? {
          "@type": "PostalAddress",
          streetAddress: profile.address,
          addressLocality: profile.city || "",
          addressRegion: profile.state || undefined,
          postalCode: profile.postal_code || undefined,
          addressCountry: profile.country || "IN",
        }
      : undefined,
    geo: primaryLoc?.latitude && primaryLoc?.longitude
      ? {
          "@type": "GeoCoordinates",
          latitude: primaryLoc.latitude,
          longitude: primaryLoc.longitude,
        }
      : undefined,
  };
}

export function generateServiceSchema(
  service: Service,
  company: CompanyInfo,
  profile?: CompanyProfile | null
) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.description || "",
    provider: {
      "@type": "LocalBusiness",
      name: profile?.company_name || company.name,
    },
    offers: {
      "@type": "Offer",
      price: service.discounted_price || service.regular_price,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
    },
  };
}

export function generateFaqSchema(faqs: FAQ[]) {
  if (!faqs || faqs.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };
}

export function generateBlogSchema(
  blog: Blog,
  company: CompanyInfo,
  profile?: CompanyProfile | null
) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: blog.title,
    description: blog.short_description || "",
    image: blog.featured_image || undefined,
    datePublished: blog.published_date || undefined,
    author: {
      "@type": "Person",
      name: blog.author || profile?.company_name || company.name,
    },
    publisher: {
      "@type": "Organization",
      name: profile?.company_name || company.name,
      logo: {
        "@type": "ImageObject",
        url: profile?.logo || "",
      },
    },
  };
}

