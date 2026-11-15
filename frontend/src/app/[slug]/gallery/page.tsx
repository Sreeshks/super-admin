import React from "react";
import { notFound } from "next/navigation";
import { publicApi } from "@/lib/api";
import { generateTenantMetadata } from "@/lib/seo";
import { GallerySection } from "@/components/sections/gallery-section";

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
      pageTitle: "Our Space & Atmosphere",
      pageDescription: `Explore high-resolution photography of ${data.company.name}'s treatment rooms, salon stations, and luxury amenities.`,
      canonicalPath: `/${slug}/gallery`,
    });
  } catch {
    return { title: "Our Space" };
  }
}

export default async function GalleryPage(props: PageProps) {
  const { slug } = await props.params;

  let websiteData;
  try {
    websiteData = await publicApi.getWebsiteData(slug);
  } catch {
    notFound();
  }

  return (
    <div className="bg-white min-h-screen">
      <GallerySection gallery={websiteData.gallery} />
    </div>
  );
}
