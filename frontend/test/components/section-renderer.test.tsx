import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SectionRenderer } from "@/components/sections/section-renderer";
import { TenantProvider } from "@/providers/tenant-provider";
import { PublicWebsiteData } from "@/types";

describe("Dynamic Section Rendering Engine", () => {
  const baseData: PublicWebsiteData = {
    company: {
      id: "comp-1",
      name: "Serenity Wellness",
      slug: "serenity-wellness",
      website_status: "active",
      account_status: "active",
    },
    profile: {
      id: "p1",
      tenant_id: "comp-1",
      company_name: "Serenity Wellness",
      short_description: "Luxury wellness sanctuary.",
      updated_at: new Date().toISOString(),
    },
    sections: [
      { id: "s1", section_key: "hero", display_name: "Hero", enabled: true, display_order: 1 },
      { id: "s2", section_key: "about", display_name: "About", enabled: true, display_order: 2 },
      { id: "s3", section_key: "faq", display_name: "FAQ", enabled: false, display_order: 3 },
      { id: "s4", section_key: "contact", display_name: "Contact", enabled: true, display_order: 4 },
    ],
    banners: [],
    categories: [],
    featured_services: [],
    offers: [],
    instagram_posts: [],
    youtube_videos: [],
    social_links: [],
    testimonials: [],
    faqs: [
      {
        id: "f1",
        question: "Is consultation free?",
        answer: "Yes, initial consultation is complimentary.",
        display_order: 1,
      },
    ],
    blogs: [],
    locations: [],
  };

  it("renders enabled sections and skips disabled sections completely", () => {
    render(
      <TenantProvider
        slug="serenity-wellness"
        company={baseData.company}
        profile={baseData.profile}
        sections={baseData.sections}
      >
        <SectionRenderer data={baseData} />
      </TenantProvider>
    );

    // Hero and About are enabled
    expect(screen.getByText(/Experience Refined Luxury at Serenity Wellness/i)).toBeInTheDocument();
    expect(screen.getByText(/Our Story & Philosophy/i)).toBeInTheDocument();

    // Contact is enabled
    expect(screen.getByText(/Visit Us or Reserve a Session/i)).toBeInTheDocument();

    // FAQ is disabled (enabled: false): question must NOT be rendered!
    expect(screen.queryByText(/Frequently Asked Questions/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Is consultation free\?/i)).not.toBeInTheDocument();
  });

  it("handles empty section configurations gracefully without crashing", () => {
    const emptySectionsData = { ...baseData, sections: [] };

    render(
      <TenantProvider
        slug="serenity-wellness"
        company={emptySectionsData.company}
        profile={emptySectionsData.profile}
        sections={[]}
      >
        <SectionRenderer data={emptySectionsData} />
      </TenantProvider>
    );

    // Default fallback order renders smoothly
    expect(screen.getByText(/Experience Refined Luxury/i)).toBeInTheDocument();
  });
});

