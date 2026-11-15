"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Category, Service } from "@/types";
import { useTenant } from "@/providers/tenant-provider";
import { formatCurrency, formatDuration, getMediaUrl } from "@/lib/utils";
import { X, Star, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { AnimatedBracket } from "@/components/ui/animated-bracket";

export function FeaturedServicesSection({
  services = [],
  categories = [],
}: {
  services?: Service[];
  categories?: Category[];
}) {
  const { makeUrl, profile } = useTenant();
  const [selectedCatId, setSelectedCatId] = useState<string>("all");
  const [activeModalService, setActiveModalService] = useState<Service | null>(null);

  if (!services || services.length === 0) {
    return null;
  }

  // Filter services by category if selected
  const filteredServices =
    selectedCatId === "all"
      ? services
      : services.filter((s) => s.category_id === selectedCatId);

  const currentCategory = categories.find((c) => c.id === selectedCatId);

  const getServiceCount = (catId: string) => {
    return services.filter((s) => s.category_id === catId).length;
  };

  return (
    <section className="py-24 sm:py-32 bg-white border-b border-neutral-200">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 space-y-12">
        {/* Editorial Heading */}
        <div className="text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="font-sans text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-black"
          >
            <span>OUR</span>
            <AnimatedBracket text="SERVICES" delay={0.15} />
            <span>SERVICES</span>
          </motion.h2>
        </div>

        {/* Category Selector Bar (Modular Boxes with images & counts) */}
        {categories.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-4">
            {/* ALL Services Card */}
            <button
              onClick={() => setSelectedCatId("all")}
              className={`p-4 sm:p-5 border text-left flex flex-col justify-between h-24 sm:h-28 transition-all ${
                selectedCatId === "all"
                  ? "border-black bg-[#F7F6F3]"
                  : "border-neutral-200 hover:border-neutral-400 bg-white"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-500">
                  ALL
                </span>
                <span className="text-xs font-mono font-bold text-black">○</span>
              </div>
              <span className="text-xs sm:text-sm font-black uppercase tracking-tight text-black">
                {services.length} services
              </span>
            </button>

            {/* Individual Categories */}
            {categories.slice(0, 3).map((cat, idx) => {
              const isSelected = selectedCatId === cat.id;
              const symbols = ["×", "¤", "›"];
              const count = getServiceCount(cat.id);

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCatId(cat.id)}
                  className={`relative p-4 sm:p-5 border text-left flex items-center gap-3 h-24 sm:h-28 overflow-hidden transition-all ${
                    isSelected
                      ? "border-black bg-[#F7F6F3]"
                      : "border-neutral-200 hover:border-neutral-400 bg-white"
                  }`}
                >
                  {(cat.image || cat.image_url) && (
                    <div className="relative w-12 sm:w-14 h-14 sm:h-16 rounded-none overflow-hidden flex-shrink-0 border border-neutral-200">
                      <Image
                        src={getMediaUrl(cat.image || cat.image_url)}
                        alt={cat.name}
                        fill
                        sizes="60px"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-black truncate">
                        {cat.name}
                      </span>
                      <span className="text-xs font-mono text-black font-bold">
                        {symbols[idx % symbols.length]}
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-500 font-medium block mt-1">
                      {count > 0 ? `${count} services` : "Featured"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Category Description Banner */}
        <div className="pt-8 border-t border-neutral-200 grid grid-cols-1 md:grid-cols-12 gap-6 items-baseline">
          <div className="md:col-span-5">
            <h3 className="font-sans text-2xl sm:text-4xl font-black uppercase tracking-tight text-black">
              {currentCategory ? currentCategory.name : "ALL SERVICES"}
            </h3>
          </div>
          <div className="md:col-span-7">
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-xl">
              {currentCategory?.description ||
                "Inspired by nature, light, and the soft rhythm of self-care, our treatments are designed to restore balance, nourish deeply, and reveal your natural radiance."}
            </p>
          </div>
        </div>

        {/* Services Grid (Minimal Thin-Border Modular Layout) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-neutral-200 border border-neutral-200">
          {filteredServices.map((service, i) => {
            const rawServiceImage =
              service.featured_image ||
              service.image ||
              service.image_url;
            const serviceImage = rawServiceImage
              ? getMediaUrl(rawServiceImage)
              : "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80";

            return (
              <div
                key={service.id}
                className="group bg-white flex flex-col justify-between hover:bg-[#FDFCFB] transition-colors"
              >
                {/* Full-width Service Artwork Box */}
                <div className="relative aspect-16/10 w-full overflow-hidden bg-neutral-100">
                  <Image
                    src={serviceImage}
                    alt={service.name}
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  {service.is_featured && (
                    <div className="absolute top-3 left-3 bg-black/90 backdrop-blur-xs text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1">
                      Signature
                    </div>
                  )}
                </div>

                <div className="p-6 sm:p-7 flex flex-col flex-1 justify-between space-y-6">
                  <div className="space-y-3">
                    <h4 className="font-sans text-sm sm:text-base font-black uppercase tracking-tight text-black leading-snug group-hover:text-neutral-700 transition-colors">
                      {service.name}
                    </h4>

                    <div className="flex items-center justify-between text-xs font-bold text-black font-mono border-b border-neutral-100 pb-2">
                      <span className="text-sm">
                        {formatCurrency(
                          service.regular_price,
                          service.currency || profile?.currency || "OMR"
                        )}
                      </span>
                      {service.duration_minutes && (
                        <span className="flex items-center gap-1.5 text-neutral-500 font-sans font-medium text-[11px]">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDuration(service.duration_minutes)}
                        </span>
                      )}
                    </div>

                    {service.description && (
                      <p className="text-xs text-neutral-500 leading-relaxed line-clamp-3">
                        {service.description}
                      </p>
                    )}
                  </div>

                  {/* Actions spanning the full width of this box */}
                  <div className="grid grid-cols-2 gap-2 pt-4 border-t border-neutral-100 w-full">
                    <Link
                      href={makeUrl("/contact")}
                      className="w-full py-2.5 bg-black hover:bg-neutral-800 text-white text-[10px] font-bold uppercase tracking-wider text-center transition-colors flex items-center justify-center"
                    >
                      Book Now
                    </Link>
                    <button
                      onClick={() => setActiveModalService(service)}
                      className="w-full py-2.5 border border-black/30 hover:border-black text-black hover:bg-neutral-50 text-[10px] font-bold uppercase tracking-wider text-center transition-colors"
                    >
                      Learn More
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Interspersed Photo Break Box matching the reference */}
          <div className="hidden lg:flex relative col-span-2 row-span-1 bg-neutral-100 min-h-[240px] overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80"
              alt="Treatment ritual"
              fill
              sizes="(max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />
          </div>
        </div>

        {/* View All Services Action */}
        <div className="text-center pt-8">
          <Link
            href={makeUrl("/services")}
            className="inline-block text-xs font-bold uppercase tracking-widest text-black underline underline-offset-8 hover:text-neutral-600 transition-colors"
          >
            View All Services
          </Link>
        </div>
      </div>

      {/* Service Details Drawer / Modal (matches Screenshot 3 Left Card) */}
      {activeModalService && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
          onClick={() => setActiveModalService(null)}
        >
          <div
            className="relative bg-white max-w-lg w-full max-h-[90vh] overflow-y-auto border border-neutral-300 p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveModalService(null)}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-black"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Service Image */}
            {(activeModalService.featured_image || activeModalService.image || activeModalService.image_url) && (
              <div className="relative h-56 w-full overflow-hidden border border-neutral-200">
                <Image
                  src={getMediaUrl(activeModalService.featured_image || activeModalService.image || activeModalService.image_url!)}
                  alt={activeModalService.name}
                  fill
                  sizes="500px"
                  className="object-cover"
                />
              </div>
            )}

            {/* Rating */}
            <div className="flex items-center gap-1.5 text-xs font-bold text-black">
              <div className="flex text-black">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <span>4.9</span>
            </div>

            {/* Title & Pricing */}
            <div className="space-y-2">
              <h3 className="font-sans text-2xl font-black uppercase tracking-tight text-black">
                {activeModalService.name}
              </h3>
              <div className="flex items-center gap-3 text-sm font-mono font-bold text-black">
                <span>{formatCurrency(activeModalService.regular_price, activeModalService.currency || profile?.currency || "OMR")}</span>
                {activeModalService.duration_minutes && (
                  <>
                    <span className="text-neutral-400">⊙</span>
                    <span className="flex items-center gap-1 text-xs">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDuration(activeModalService.duration_minutes)}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Description & Details */}
            <div className="prose prose-sm text-xs sm:text-sm text-neutral-600 leading-relaxed space-y-4">
              <p>{activeModalService.description}</p>
            </div>

            {/* Book CTA */}
            <div className="pt-4 border-t border-neutral-200">
              <Link
                href={makeUrl("/contact")}
                className="block w-full py-4 bg-black hover:bg-neutral-800 text-white text-center text-xs font-bold uppercase tracking-widest transition-colors"
              >
                Book an Appointment
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
