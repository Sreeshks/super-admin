import { describe, it, expect } from "vitest";
import {
  generateTenantMetadata,
  generateLocalBusinessSchema,
  generateServiceSchema,
  generateFaqSchema,
  generateBlogSchema,
} from "@/lib/seo";
import { Blog, CompanyInfo, CompanyProfile, FAQ, LocationItem, Service } from "@/types";

describe("Dynamic SEO and Schema.org Generator", () => {
  const mockCompany: CompanyInfo = {
    id: "comp-123",
    name: "Luxe Salon & Spa",
    slug: "luxe-salon",
    business_type: { id: "bt1", name: "Beauty Salon", slug: "salon" },
    website_status: "active",
    account_status: "active",
  };

  const mockProfile: CompanyProfile = {
    id: "p1",
    tenant_id: "comp-123",
    company_name: "Luxe Salon & Spa",
    logo: "https://example.com/logo.png",
    short_description: "Premier luxury hair and skin care studio.",
    address: "123 High Street",
    city: "Bangalore",
    phone: "+919876543210",
    email: "info@luxesalon.com",
    updated_at: new Date().toISOString(),
  };

  it("generates company-specific metadata without leaking cross-tenant data", () => {
    const meta = generateTenantMetadata({
      company: mockCompany,
      profile: mockProfile,
      pageTitle: "Our Treatments",
      canonicalPath: "/luxe-salon/services",
    });

    expect(meta.title).toBe("Our Treatments | Luxe Salon & Spa");
    expect(meta.description).toContain("Premier luxury hair and skin care studio");
    expect(meta.openGraph?.siteName).toBe("Luxe Salon & Spa");
    expect(meta.alternates?.canonical).toBe("/luxe-salon/services");
  });

  it("generates BeautySalon JSON-LD structured data for salon business type", () => {
    const locations: LocationItem[] = [
      {
        id: "loc-1",
        location_name: "Flagship Indiranagar",
        address: "100ft Road",
        city: "Bangalore",
        country: "India",
        contact_number: "+919876543210",
        is_primary: true,
        status: "active",
        latitude: 12.9716,
        longitude: 77.5946,
      },
    ];

    const jsonLd = generateLocalBusinessSchema(mockCompany, mockProfile, locations);
    expect(jsonLd["@type"]).toBe("BeautySalon");
    expect(jsonLd.name).toBe("Luxe Salon & Spa");
    expect(jsonLd.geo?.latitude).toBe(12.9716);
    expect(jsonLd.telephone).toBe("+919876543210");
  });

  it("generates Service schema with offer pricing", () => {
    const service: Service = {
      id: "srv-1",
      category_id: "cat-1",
      name: "Keratin Therapy",
      slug: "keratin-therapy",
      regular_price: 3000,
      discounted_price: 2400,
      duration_minutes: 90,
      is_featured: true,
      display_order: 1,
    };

    const schema = generateServiceSchema(service, mockCompany, mockProfile);
    expect(schema["@type"]).toBe("Service");
    expect(schema.name).toBe("Keratin Therapy");
    expect(schema.offers.price).toBe(2400);
  });

  it("generates FAQPage schema from questions", () => {
    const faqs: FAQ[] = [
      {
        id: "f1",
        question: "Do you accept appointments online?",
        answer: "Yes, submit our enquiry form or chat on WhatsApp.",
        display_order: 1,
      },
    ];

    const schema = generateFaqSchema(faqs);
    expect(schema?.["@type"]).toBe("FAQPage");
    expect(schema?.mainEntity[0].name).toBe("Do you accept appointments online?");
  });

  it("generates Article schema for published blogs", () => {
    const blog: Blog = {
      id: "b1",
      title: "Monsoon Hair Care Guide",
      slug: "monsoon-hair-care-guide",
      short_description: "How to combat humidity and frizz.",
      full_content: "<p>Deep conditioning is essential...</p>",
      author: "Master Stylist Priya",
      published_date: "2026-07-15",
    };

    const schema = generateBlogSchema(blog, mockCompany, mockProfile);
    expect(schema["@type"]).toBe("Article");
    expect(schema.headline).toBe("Monsoon Hair Care Guide");
    expect(schema.author.name).toBe("Master Stylist Priya");
  });
});

