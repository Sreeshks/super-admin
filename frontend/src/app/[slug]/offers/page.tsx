import React from "react";
import { notFound } from "next/navigation";
import { publicApi } from "@/lib/api";
import { generateTenantMetadata } from "@/lib/seo";
import { OffersSection } from "@/components/sections/offers-section";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(props: PageProps) {
  const { slug } = await props.params;
  try {
    const data = await publicApi.getWebsiteData(slug);
    return generateTenantMetadata({
      company: data.company,
      profile: data.profile,
      pageTitle: "Special Offers & Seasonal Privileges",
      pageDescription: `Discover limited-time packages and luxury promotions at ${data.company.name}.`,
      canonicalPath: `/${slug}/offers`,
    });
  } catch {
    return { title: "Offers & Promotions" };
  }
}

export default async function OffersPage(props: PageProps) {
  const { slug } = await props.params;

  let websiteData;
  try {
    websiteData = await publicApi.getWebsiteData(slug);
  } catch {
    notFound();
  }

  return (
    <div className="bg-white min-h-screen">
      <OffersSection offers={websiteData.offers} />
    </div>
  );
}
