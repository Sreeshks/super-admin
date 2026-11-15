"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Offer } from "@/types";
import { useTenant } from "@/providers/tenant-provider";
import { formatDate, formatCurrency } from "@/lib/utils";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { AnimatedBracket } from "@/components/ui/animated-bracket";

export function OffersSection({ offers = [] }: { offers?: Offer[] }) {
  const { makeUrl, profile, company } = useTenant();
  const businessName = profile?.company_name || company.name;

  const defaultBanner =
    "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=85";

  return (
    <section className="py-24 sm:py-32 bg-[#F7F6F3] border-b border-black/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header if Offers Exist */}
        {offers && offers.length > 0 && (
          <div className="mb-16 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              className="font-sans text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-black flex items-center justify-center gap-2"
            >
              <span>SPECIAL</span>
              <AnimatedBracket text="CURATED PACKAGES" delay={0.15} />
              <span>PRIVILEGES</span>
            </motion.h2>
            <p className="mt-3 text-xs sm:text-sm text-neutral-600 max-w-md mx-auto">
              Limited-edition seasonal treatment sequences and bundled rejuvenation therapies.
            </p>
          </div>
        )}

        {/* Offers Grid */}
        {offers && offers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {offers.map((offer) => {
              const discountLabel =
                offer.discount_type === "percentage"
                  ? `${offer.discount_value}% OFF`
                  : `${formatCurrency(offer.discount_value, profile?.currency || "OMR")} OFF`;

              return (
                <div
                  key={offer.id}
                  className="group bg-white border border-black/10 flex flex-col justify-between hover:border-black/30 transition-colors"
                >
                  <div className="relative aspect-16/10 w-full overflow-hidden bg-neutral-100">
                    <Image
                      src={offer.banner_url || offer.banner_image || defaultBanner}
                      alt={offer.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute top-4 left-4 bg-black text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1">
                      {discountLabel}
                    </div>
                  </div>

                  <div className="p-6 sm:p-8 flex flex-col flex-1 justify-between space-y-6">
                    <div className="space-y-2">
                      <h3 className="font-sans text-base font-bold uppercase tracking-wider text-black group-hover:text-neutral-700 transition-colors">
                        {offer.title}
                      </h3>
                      {offer.description && (
                        <p className="text-xs text-neutral-600 leading-relaxed line-clamp-3">
                          {offer.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-4 border-t border-black/10 flex items-center justify-between text-xs">
                      {offer.expiry_date ? (
                        <span className="text-[11px] font-mono text-neutral-500">
                          Valid until {formatDate(offer.expiry_date)}
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono text-neutral-500">
                          Ongoing Privilege
                        </span>
                      )}

                      <Link
                        href={makeUrl("/contact")}
                        className="font-bold uppercase tracking-widest text-[11px] text-black underline hover:text-neutral-600 transition-colors"
                      >
                        Book Ritual
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Editorial "DIDN'T FIND WHAT YOU'RE LOOKING FOR?" Banner matching Reference */}
        <div className="relative bg-[#35251D] text-white p-8 sm:p-14 lg:p-16 overflow-hidden max-w-5xl mx-auto">
          {/* Subtle warm glow background accent */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-[#523B2F]/40 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#E8DED1] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Bespoke Skin & Wellness Consultation
            </span>

            <h3 className="font-sans text-2xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-white leading-tight">
              DIDN&apos;T FIND WHAT YOU&apos;RE LOOKING FOR?
            </h3>

            <p className="text-xs sm:text-sm text-[#E8DED1] leading-relaxed">
              Not sure which treatment is right for your skin? We know every face tells a different story.
              Sometimes choosing the right facial can feel overwhelming.
              Write to us or book a quick consultation. Our expert team at {businessName} will help you find the
              perfect ritual for your skin&apos;s unique needs.
            </p>

            <div className="pt-3">
              <Link
                href={makeUrl("/contact")}
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white underline hover:text-[#E8DED1] transition-colors group"
              >
                <span>Book a consultation</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
