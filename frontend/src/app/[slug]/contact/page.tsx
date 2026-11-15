import React from "react";
import { notFound } from "next/navigation";
import { publicApi } from "@/lib/api";
import { generateTenantMetadata } from "@/lib/seo";
import { ContactSection } from "@/components/sections/contact-section";

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
      pageTitle: "Contact & Appointment Bookings",
      pageDescription: `Reserve your appointment or reach out to the concierge team at ${data.company.name}.`,
      canonicalPath: `/${slug}/contact`,
    });
  } catch {
    return { title: "Contact Us" };
  }
}

export default async function ContactPage(props: PageProps) {
  const { slug } = await props.params;

  let websiteData;
  try {
    websiteData = await publicApi.getWebsiteData(slug);
  } catch {
    notFound();
  }

  const { contact, locations } = websiteData;

  return (
    <div className="bg-white min-h-screen">
      <ContactSection contact={contact} locations={locations} />
    </div>
  );
}
