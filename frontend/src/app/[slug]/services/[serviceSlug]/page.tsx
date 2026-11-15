import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { publicApi } from "@/lib/api";
import { generateServiceSchema, generateTenantMetadata } from "@/lib/seo";
import { formatCurrency, formatDuration } from "@/lib/utils";
import { Clock, Calendar, ArrowLeft, Check, Sparkles } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string; serviceSlug: string }>;
}

export async function generateMetadata(props: PageProps) {
  const { slug, serviceSlug } = await props.params;
  try {
    const [data, service] = await Promise.all([
      publicApi.getWebsiteData(slug),
      publicApi.getServiceBySlug(slug, serviceSlug),
    ]);
    return generateTenantMetadata({
      company: data.company,
      profile: data.profile,
      pageTitle: service.name,
      pageDescription:
        service.description ||
        `Book ${service.name} at ${data.company.name}. Premium treatments crafted for visible results.`,
      canonicalPath: `/${slug}/services/${serviceSlug}`,
      image: service.image_url,
    });
  } catch {
    return { title: "Service Details" };
  }
}

export default async function ServiceDetailPage(props: PageProps) {
  const { slug, serviceSlug } = await props.params;

  let websiteData;
  let service;

  try {
    [websiteData, service] = await Promise.all([
      publicApi.getWebsiteData(slug),
      publicApi.getServiceBySlug(slug, serviceSlug),
    ]);
  } catch {
    notFound();
  }

  const { company, profile, featured_services } = websiteData;
  const businessName = profile?.company_name || company.name;

  const hasDiscount =
    service.discounted_price &&
    Number(service.discounted_price) < Number(service.regular_price);

  const jsonLd = generateServiceSchema(service, company, profile);

  const defaultImage =
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80";

  // Related services (exclude current)
  const relatedServices = featured_services
    .filter((s) => s.id !== service.id)
    .slice(0, 3);

  return (
    <div className="bg-white min-h-screen py-12 lg:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Breadcrumb / Back link */}
        <Link
          href={`/${slug}/services`}
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-brand-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Services</span>
        </Link>

        {/* Hero Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Service Image */}
          <div className="lg:col-span-6 relative h-[380px] sm:h-[480px] rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-slate-100">
            <Image
              src={service.image_url || defaultImage}
              alt={service.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            {hasDiscount && (
              <div className="absolute top-4 left-4 bg-rose-600 text-white text-xs font-black uppercase px-3 py-1.5 rounded-full shadow-md tracking-wider">
                Special Privilege Rate
              </div>
            )}
          </div>

          {/* Service Info & Booking Card */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-secondary flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Signature Treatment
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
                {service.name}
              </h1>
            </div>

            {/* Price & Duration Badge */}
            <div className="flex flex-wrap items-baseline gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">
                  {formatCurrency(
                    hasDiscount ? service.discounted_price : service.regular_price,
                    service.currency || profile?.currency || "OMR"
                  )}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-slate-400 line-through">
                    {formatCurrency(service.regular_price, service.currency || profile?.currency || "OMR")}
                  </span>
                )}
              </div>

              {service.duration_minutes && (
                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold border-l border-slate-300 pl-4">
                  <Clock className="w-4 h-4 text-brand-secondary" />
                  <span>Duration: {formatDuration(service.duration_minutes)}</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Treatment Overview
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                {service.description ||
                  `Experience the ultimate luxury of ${service.name} at ${businessName}. Every detail is calibrated to provide rejuvenating, long-lasting transformation.`}
              </p>
            </div>

            {/* Treatment Highlights */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Personalized aesthetic consultation before treatment</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Performed by certified master therapists & stylists</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Hospital-grade sanitized tools & organic luxury products</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 flex flex-col sm:flex-row gap-4">
              <Link
                href={`/${slug}/contact`}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-brand-primary text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg hover:opacity-95 active:scale-98 transition-all"
              >
                <Calendar className="w-4 h-4 text-brand-secondary" />
                <span>Reserve This Treatment</span>
              </Link>

              {profile?.whatsapp_number && (
                <a
                  href={`https://wa.me/${profile.whatsapp_number.replace(
                    /[^0-9]/g,
                    ""
                  )}?text=Hi, I would like to book ${encodeURIComponent(service.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3.5 rounded-full border border-slate-300 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  WhatsApp Inquiries
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Related Services */}
        {relatedServices.length > 0 && (
          <div className="pt-16 border-t border-slate-100 space-y-6">
            <h3 className="font-serif text-2xl font-bold text-slate-900">
              You Might Also Enjoy
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedServices.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/${slug}/services/${rel.slug}`}
                  className="group flex gap-4 p-4 rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all"
                >
                  <div className="relative h-20 w-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                    <Image
                      src={rel.image_url || defaultImage}
                      alt={rel.name}
                      fill
                      sizes="80px"
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-serif text-sm font-bold text-slate-900 group-hover:text-brand-primary transition-colors">
                      {rel.name}
                    </h4>
                    <span className="text-xs font-bold text-slate-900 block">
                      {formatCurrency(rel.regular_price, rel.currency || profile?.currency || "OMR")}
                    </span>
                    {rel.duration_minutes && (
                      <span className="text-[11px] text-slate-500">
                        {formatDuration(rel.duration_minutes)}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

