import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { publicApi } from "@/lib/api";
import { generateTenantMetadata } from "@/lib/seo";
import { MapPin, Phone, Mail, Clock, ExternalLink, Calendar, Sparkles } from "lucide-react";

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
      pageTitle: "Our Outlets & Branch Locations",
      pageDescription: `Find addresses, phone numbers, and directions to ${data.company.name} salon and wellness centers.`,
      canonicalPath: `/${slug}/locations`,
    });
  } catch {
    return { title: "Locations" };
  }
}

export default async function LocationsPage(props: PageProps) {
  const { slug } = await props.params;

  let websiteData;
  let locations;
  try {
    [websiteData, locations] = await Promise.all([
      publicApi.getWebsiteData(slug),
      publicApi.getLocations(slug),
    ]);
  } catch {
    notFound();
  }

  const { company, profile } = websiteData;
  const businessName = profile?.company_name || company.name;

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <section className="py-16 sm:py-20 bg-slate-950 text-white border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-secondary flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Branch Directory
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-black tracking-tight text-white">
            Our Studio Locations
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Experience our signature treatments across our branches and aesthetic centers.
          </p>
        </div>
      </section>

      {/* Locations List */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {locations.length === 0 ? (
          <div className="py-24 text-center space-y-3">
            <MapPin className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="font-serif text-lg font-bold text-slate-900">
              Main Studio Location
            </h3>
            {profile?.address ? (
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                {profile.address}, {profile.city}
              </p>
            ) : (
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Please refer to our contact page for directions and appointment booking.
              </p>
            )}
            <div className="pt-2">
              <Link
                href={`/${slug}/contact`}
                className="inline-flex items-center gap-1 text-xs font-bold text-brand-primary underline"
              >
                <span>Visit Contact Page</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {locations.map((loc) => {
              const mapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${loc.location_name} ${loc.address} ${loc.city}`
              )}`;

              return (
                <div
                  key={loc.id}
                  className="p-8 rounded-3xl bg-slate-50 border border-slate-200 shadow-xs hover:shadow-xl transition-all flex flex-col justify-between space-y-6"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="p-3 rounded-xl bg-brand-primary text-white">
                        <MapPin className="w-5 h-5 text-brand-secondary" />
                      </div>
                      {loc.is_primary && (
                        <span className="px-3 py-1 rounded-full bg-brand-secondary/15 text-brand-secondary text-[11px] font-bold uppercase tracking-wider">
                          Primary Flagship
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-serif text-xl font-bold text-slate-900">
                        {loc.location_name}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {loc.address}, {loc.city}
                        {loc.state && `, ${loc.state}`} {loc.postal_code}
                      </p>
                    </div>

                    <div className="space-y-2.5 pt-2 text-xs text-slate-700">
                      {loc.contact_number && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-brand-secondary" />
                          <a
                            href={`tel:${loc.contact_number}`}
                            className="font-medium hover:text-brand-primary transition-colors"
                          >
                            {loc.contact_number}
                          </a>
                        </div>
                      )}
                      {loc.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-brand-secondary" />
                          <a
                            href={`mailto:${loc.email}`}
                            className="font-medium hover:text-brand-primary transition-colors"
                          >
                            {loc.email}
                          </a>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-brand-secondary" />
                        <span>Daily: 9:30 AM – 8:30 PM</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                    <a
                      href={mapsSearchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-brand-secondary hover:underline"
                    >
                      <span>Get Directions</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <Link
                      href={`/${slug}/contact`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand-primary text-white text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all"
                    >
                      <Calendar className="w-3 h-3 text-brand-secondary" />
                      <span>Book Branch</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

