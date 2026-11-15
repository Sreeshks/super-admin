"use client";

import React from "react";
import { PublicWebsiteData } from "@/types";
import { HeroSection } from "./hero-section";
import { AboutSection } from "./about-section";
import { CategorySection } from "./category-section";
import { FeaturedServicesSection } from "./featured-services-section";
import { OffersSection } from "./offers-section";
import { GallerySection } from "./gallery-section";
import { InstagramSection } from "./instagram-section";
import { YouTubeSection } from "./youtube-section";
import { TestimonialsSection } from "./testimonials-section";
import { FAQSection } from "./faq-section";
import { BlogSection } from "./blog-section";
import { ContactSection } from "./contact-section";

const DEFAULT_SECTION_ORDER = [
  "hero",
  "about",
  "categories",
  "services",
  "offers",
  "gallery",
  "instagram",
  "youtube",
  "testimonials",
  "faq",
  "blog",
  "contact",
];

export function SectionRenderer({ data }: { data: PublicWebsiteData }) {
  // 1. Determine ordered list of sections
  const sectionsList = data.sections && data.sections.length > 0
    ? [...data.sections].sort((a, b) => a.display_order - b.display_order)
    : DEFAULT_SECTION_ORDER.map((key, i) => ({
        id: key,
        section_key: key,
        display_name: key,
        enabled: true,
        display_order: i + 1,
      }));

  return (
    <div className="flex flex-col w-full">
      {sectionsList.map((section) => {
        // Skip disabled sections
        if (section.enabled === false) {
          return null;
        }

        switch (section.section_key) {
          case "hero":
            return <HeroSection key="hero" banners={data.banners} />;
          case "about":
            return <AboutSection key="about" />;
          case "categories":
            return (
              <CategorySection key="categories" categories={data.categories} />
            );
          case "services":
            return (
              <FeaturedServicesSection
                key="services"
                services={data.featured_services}
                categories={data.categories}
              />
            );
          case "offers":
            return <OffersSection key="offers" offers={data.offers} />;
          case "gallery":
            return <GallerySection key="gallery" gallery={data.gallery} />;
          case "instagram":
            return (
              <InstagramSection
                key="instagram"
                posts={data.instagram_posts}
              />
            );
          case "youtube":
            return (
              <YouTubeSection key="youtube" videos={data.youtube_videos} />
            );
          case "testimonials":
            return (
              <TestimonialsSection
                key="testimonials"
                testimonials={data.testimonials}
              />
            );
          case "faq":
            return <FAQSection key="faq" faqs={data.faqs} />;
          case "blog":
            return <BlogSection key="blog" blogs={data.blogs} />;
          case "contact":
            return (
              <ContactSection
                key="contact"
                contact={data.contact}
                locations={data.locations}
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

