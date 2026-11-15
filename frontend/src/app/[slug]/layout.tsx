import React from "react";
import { notFound } from "next/navigation";
import { publicApi } from "@/lib/api";
import { TenantProvider } from "@/providers/tenant-provider";
import { WebsiteHeader } from "@/components/layout/website-header";
import { WebsiteFooter } from "@/components/layout/website-footer";
import { generateLocalBusinessSchema, generateTenantMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  try {
    const data = await publicApi.getWebsiteData(slug);
    return generateTenantMetadata({
      company: data.company,
      profile: data.profile,
      canonicalPath: `/${slug}`,
    });
  } catch {
    return {
      title: "Company Website Not Found",
    };
  }
}

export default async function TenantLayout(props: LayoutProps) {
  const { slug } = await props.params;

  let websiteData;
  try {
    websiteData = await publicApi.getWebsiteData(slug);
  } catch {
    notFound();
  }

  if (!websiteData || !websiteData.company) {
    notFound();
  }

  const jsonLd = generateLocalBusinessSchema(
    websiteData.company,
    websiteData.profile,
    websiteData.locations
  );

  return (
    <TenantProvider
      slug={slug}
      company={websiteData.company}
      profile={websiteData.profile}
      sections={websiteData.sections}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-brand-primary selection:text-white">
        <WebsiteHeader />
        <main className="flex-1">{props.children}</main>
        <WebsiteFooter
          locations={websiteData.locations}
          socialLinks={websiteData.social_links}
        />
      </div>
    </TenantProvider>
  );
}
