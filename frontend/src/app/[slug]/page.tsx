import React from "react";
import { notFound } from "next/navigation";
import { publicApi } from "@/lib/api";
import { SectionRenderer } from "@/components/sections/section-renderer";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function TenantHomePage(props: PageProps) {
  const { slug } = await props.params;

  let websiteData;
  try {
    websiteData = await publicApi.getWebsiteData(slug);
  } catch {
    notFound();
  }

  if (!websiteData) {
    notFound();
  }

  return <SectionRenderer data={websiteData} />;
}

