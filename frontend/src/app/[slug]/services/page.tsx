import React from "react";
import { notFound } from "next/navigation";
import { publicApi } from "@/lib/api";
import { generateTenantMetadata } from "@/lib/seo";
import { FeaturedServicesSection } from "@/components/sections/featured-services-section";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    category?: string;
  }>;
}

export async function generateMetadata(props: PageProps) {
  const { slug } = await props.params;
  try {
    const data = await publicApi.getWebsiteData(slug);
    return generateTenantMetadata({
      company: data.company,
      profile: data.profile,
      pageTitle: "Services & Treatment Catalog",
      pageDescription: `Explore the complete menu of luxury services, hair treatments, and spa therapies at ${data.company.name}.`,
      canonicalPath: `/${slug}/services`,
    });
  } catch {
    return { title: "Services Catalog" };
  }
}

export default async function ServicesPage(props: PageProps) {
  const { slug } = await props.params;

  let websiteData;
  let allServices;
  let categories;

  try {
    [websiteData, allServices, categories] = await Promise.all([
      publicApi.getWebsiteData(slug),
      publicApi.getServices(slug, { page: 1, page_size: 100 }),
      publicApi.getCategories(slug),
    ]);
  } catch {
    notFound();
  }

  const servicesList =
    allServices.data && allServices.data.length > 0
      ? allServices.data
      : websiteData.featured_services;

  return (
    <div className="bg-white min-h-screen">
      <FeaturedServicesSection
        services={servicesList}
        categories={categories && categories.length > 0 ? categories : websiteData.categories}
      />
    </div>
  );
}
