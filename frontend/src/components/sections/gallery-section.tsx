"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTenant } from "@/providers/tenant-provider";
import { X, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { MediaAsset } from "@/types";
import { AnimatedBracket } from "@/components/ui/animated-bracket";

interface GalleryItem {
  id: string;
  url: string;
  title?: string;
  label?: string;
}

export function GallerySection({
  images = [],
  gallery = [],
}: {
  images?: GalleryItem[];
  gallery?: MediaAsset[];
}) {
  const { company, profile, makeUrl } = useTenant();
  const [activePhoto, setActivePhoto] = useState<GalleryItem | null>(null);

  const businessName = profile?.company_name || company.name;

  // Fallback photography matching the Lunaria editorial reference aesthetic
  const defaultItems: GalleryItem[] = [
    {
      id: "1",
      url: "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&w=1200&q=85",
      label: "INTERIOR",
      title: "Main Reception & Greeting Lounge",
    },
    {
      id: "2",
      url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=85",
      label: "RELAXATION AREA",
      title: "Hydrotherapy Water Lounge",
    },
    {
      id: "3",
      url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=85",
      label: "HAIR TREATMENTS ROOMS",
      title: "Styling Suite & Atelier",
    },
    {
      id: "4",
      url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=85",
      label: "THE CHIEF DOCTOR'S OFFICE",
      title: "Private Consultation Studio",
    },
    {
      id: "5",
      url: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=85",
      label: "SPA ZONE",
      title: "Aromatherapy & Body Sanctuary",
    },
    {
      id: "6",
      url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=85",
      label: "RELAXATION SUITE",
      title: "Meditation & Warm Tea Corner",
    },
  ];

  // Resolve items from props
  let resolvedItems: GalleryItem[] = [];
  if (gallery && gallery.length > 0) {
    resolvedItems = gallery.map((g) => ({
      id: g.id,
      url: g.file_url,
      label: g.metadata_info?.label || g.original_name.replace(/\.[^/.]+$/, "").toUpperCase(),
      title: g.metadata_info?.alt_text || g.original_name,
    }));
  } else if (images && images.length > 0) {
    resolvedItems = images;
  } else {
    resolvedItems = defaultItems;
  }

  const items = resolvedItems.length > 0 ? resolvedItems : defaultItems;

  return (
    <section className="py-24 sm:py-32 bg-white border-b border-black/10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Mobile Header */}
        <div className="lg:hidden mb-12 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-sans text-4xl sm:text-5xl font-extrabold uppercase tracking-tight text-black flex items-center justify-center gap-2"
          >
            <span>OUR</span>
            <AnimatedBracket text="GALLERY" delay={0.15} />
            <span>SPACE</span>
          </motion.h2>
          <p className="mt-3 text-xs sm:text-sm text-neutral-500 max-w-md mx-auto">
            An intimate look inside {businessName}&apos;s architectural sanctuary and sensory suites.
          </p>
        </div>

        {/* Desktop Editorial Asymmetric Layout */}
        <div className="hidden lg:block relative min-h-[920px]">
          {/* Item 1: Top Left - INTERIOR */}
          {items[0] && (
            <div
              onClick={() => setActivePhoto(items[0])}
              className="absolute left-0 top-0 w-[280px] cursor-pointer group"
            >
              <div className="relative h-[280px] overflow-hidden bg-neutral-100">
                <Image
                  src={items[0].url}
                  alt={items[0].title || "Space interior"}
                  fill
                  sizes="280px"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>
              <div className="flex items-center justify-between pt-2.5 text-[11px] font-bold tracking-widest uppercase text-black">
                <span>{items[0].label || "INTERIOR"}</span>
                <span className="font-mono text-sm leading-none">×</span>
              </div>
            </div>
          )}

          {/* Item 2: Top Center - RELAXATION AREA */}
          {items[1] && (
            <div
              onClick={() => setActivePhoto(items[1])}
              className="absolute left-[340px] top-12 w-[240px] cursor-pointer group"
            >
              <div className="relative h-[300px] overflow-hidden bg-neutral-100">
                <Image
                  src={items[1].url}
                  alt={items[1].title || "Relaxation area"}
                  fill
                  sizes="240px"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>
              <div className="flex items-center justify-between pt-2.5 text-[11px] font-bold tracking-widest uppercase text-black">
                <span>{items[1].label || "RELAXATION AREA"}</span>
                <span className="font-mono text-sm leading-none">×</span>
              </div>
            </div>
          )}

          {/* Item 3: Top Right - SPA ZONE */}
          {items[2] && (
            <div
              onClick={() => setActivePhoto(items[2])}
              className="absolute right-0 top-0 w-[360px] cursor-pointer group"
            >
              <div className="relative h-[320px] overflow-hidden bg-neutral-100">
                <Image
                  src={items[2].url}
                  alt={items[2].title || "Spa zone"}
                  fill
                  sizes="360px"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>
              <div className="flex items-center justify-between pt-2.5 text-[11px] font-bold tracking-widest uppercase text-black">
                <span>{items[2].label || "RELAXATION AREA"}</span>
                <span className="font-mono text-sm leading-none">×</span>
              </div>
            </div>
          )}

          {/* Centerpiece Headline: OUR ⁽ GALLERY ⁾ SPACE */}
          <div className="absolute left-[180px] top-[410px] z-10 select-none pointer-events-none">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="font-sans text-6xl xl:text-7xl font-extrabold uppercase tracking-tight text-black flex items-center gap-3"
            >
              <span>OUR</span>
              <AnimatedBracket text="GALLERY" delay={0.2} />
              <span>SPACE</span>
            </motion.h2>
          </div>

          {/* Item 4: Middle Right - HAIR TREATMENTS ROOMS */}
          {items[3] && (
            <div
              onClick={() => setActivePhoto(items[3])}
              className="absolute right-0 top-[370px] w-[290px] cursor-pointer group"
            >
              <div className="relative h-[290px] overflow-hidden bg-neutral-100">
                <Image
                  src={items[3].url}
                  alt={items[3].title || "Treatment room"}
                  fill
                  sizes="290px"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>
              <div className="flex items-center justify-between pt-2.5 text-[11px] font-bold tracking-widest uppercase text-black">
                <span>{items[3].label || "HAIR TREATMENTS ROOMS"}</span>
                <span className="font-mono text-sm leading-none">×</span>
              </div>
            </div>
          )}

          {/* Item 5: Bottom Left - THE CHIEF DOCTOR'S OFFICE */}
          {items[4] && (
            <div
              onClick={() => setActivePhoto(items[4])}
              className="absolute left-0 bottom-0 w-[360px] cursor-pointer group"
            >
              <div className="relative h-[260px] overflow-hidden bg-neutral-100">
                <Image
                  src={items[4].url}
                  alt={items[4].title || "Doctor's office"}
                  fill
                  sizes="360px"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>
              <div className="flex items-center justify-between pt-2.5 text-[11px] font-bold tracking-widest uppercase text-black">
                <span>{items[4].label || "THE CHIEF DOCTOR'S OFFICE"}</span>
                <span className="font-mono text-sm leading-none">×</span>
              </div>
            </div>
          )}

          {/* Item 6: Bottom Right - SPA ZONE */}
          {items[5] && (
            <div
              onClick={() => setActivePhoto(items[5])}
              className="absolute right-0 bottom-0 w-[380px] cursor-pointer group"
            >
              <div className="relative h-[280px] overflow-hidden bg-neutral-100">
                <Image
                  src={items[5].url}
                  alt={items[5].title || "Spa zone lounge"}
                  fill
                  sizes="380px"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>
              <div className="flex items-center justify-between pt-2.5 text-[11px] font-bold tracking-widest uppercase text-black">
                <span>{items[5].label || "SPA ZONE"}</span>
                <span className="font-mono text-sm leading-none">×</span>
              </div>
            </div>
          )}
        </div>

        {/* Mobile / Tablet Responsive Stacked Grid */}
        <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-8">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => setActivePhoto(item)}
              className="group cursor-pointer"
            >
              <div className="relative aspect-4/3 w-full overflow-hidden bg-neutral-100">
                <Image
                  src={item.url}
                  alt={item.title || item.label || "Space"}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="flex items-center justify-between pt-2.5 text-[11px] font-bold tracking-widest uppercase text-black">
                <span>{item.label || item.title || "STUDIO SUITE"}</span>
                <span className="font-mono text-sm leading-none">×</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA Button */}
        <div className="mt-16 sm:mt-20 flex justify-center">
          <Link
            href={makeUrl("/contact")}
            className="inline-flex items-center justify-center gap-3 px-10 py-4 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors"
          >
            <span>Book an Appointment</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Lightbox Modal */}
      {activePhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={() => setActivePhoto(null)}
        >
          <button
            onClick={() => setActivePhoto(null)}
            className="absolute top-6 right-6 p-3 text-white/80 hover:text-white transition-colors"
            aria-label="Close photo"
          >
            <X className="w-6 h-6" />
          </button>
          <div
            className="relative max-w-5xl max-h-[85vh] w-full h-[75vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={activePhoto.url}
              alt={activePhoto.title || activePhoto.label || "Expanded photo"}
              fill
              sizes="95vw"
              className="object-contain"
            />
            <div className="absolute bottom-0 inset-x-0 p-4 text-center">
              <span className="text-xs font-bold tracking-widest uppercase text-white bg-black/60 px-4 py-1.5 backdrop-blur-xs">
                {activePhoto.label || activePhoto.title}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
