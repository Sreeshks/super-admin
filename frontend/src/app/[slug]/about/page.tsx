import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { publicApi } from "@/lib/api";
import { generateTenantMetadata } from "@/lib/seo";
import { AboutSection } from "@/components/sections/about-section";
import { ArrowRight, ShieldCheck, Sparkles, HeartHandshake } from "lucide-react";

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
      pageTitle: "About Us & Story",
      pageDescription:
        data.profile?.about_section ||
        `Learn about the philosophy, heritage, and certified specialists behind ${data.company.name}.`,
      canonicalPath: `/${slug}/about`,
    });
  } catch {
    return { title: "About Us" };
  }
}

export default async function AboutPage(props: PageProps) {
  const { slug } = await props.params;

  let websiteData;
  try {
    websiteData = await publicApi.getWebsiteData(slug);
  } catch {
    notFound();
  }

  const { company, profile } = websiteData;
  const businessName = profile?.company_name || company.name;

  const principles = [
    {
      icon: Sparkles,
      title: "INTENTIONAL CRAFTSMANSHIP",
      description:
        "Every stroke, formula, and sequence is executed with clinical precision and artistic sensitivity to your body's rhythm.",
    },
    {
      icon: ShieldCheck,
      title: "BIO-COMPATIBLE PURITY",
      description:
        "We source pharmaceutical-grade botanicals and barrier-supportive actives that nourish skin without triggering inflammation.",
    },
    {
      icon: HeartHandshake,
      title: "QUIET LUXURY SANCTUARY",
      description:
        "Step away from the sensory noise of the city into private sound-dampened suites designed for absolute calm and renewal.",
    },
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Editorial About Section with 'THE STORY' deep espresso card */}
      <AboutSection />

      {/* Philosophy & Pillars */}
      <section className="py-24 sm:py-32 bg-[#F7F6F3] border-b border-black/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
            <h2 className="font-sans text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-black flex items-center justify-center gap-3">
              <span>OUR</span>
              <span className="editorial-bracket text-xs sm:text-sm font-semibold tracking-wider text-black">
                CORE PHILOSOPHY
              </span>
              <span>PILLARS</span>
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-neutral-600 max-w-md mx-auto">
              Guiding every consultation, treatment, and hospitality touchpoint at {businessName}.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {principles.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div
                  key={idx}
                  className="bg-white p-8 sm:p-10 border border-black/10 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="w-10 h-10 border border-black/20 flex items-center justify-center text-black">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-black">
                      {p.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-sans">
                      {p.description}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-black/5 text-[10px] font-mono text-neutral-400">
                    PILLAR 0{idx + 1}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Sanctuary Invitation CTA */}
      <section className="py-24 bg-white text-center">
        <div className="max-w-2xl mx-auto px-4 space-y-6">
          <h2 className="font-sans text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-black">
            Experience the Quiet Luxury of {businessName}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
            Reserve your consultation or speak with our concierge desk to curate a ritual uniquely suited to you.
          </p>
          <div className="pt-4">
            <Link
              href={`/${slug}/contact`}
              className="inline-flex items-center gap-3 px-10 py-4 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors"
            >
              <span>Reserve an Appointment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
