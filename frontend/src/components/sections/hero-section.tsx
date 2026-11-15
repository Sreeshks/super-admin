"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { Banner } from "@/types";
import { useTenant } from "@/providers/tenant-provider";

export function HeroSection({ banners = [] }: { banners?: Banner[] }) {
  const { company, profile, makeUrl } = useTenant();
  const [imageError, setImageError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Parallax transforms creating a cinematic video-like tracking shot
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-40%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.15]);
  const narrativeY = useTransform(scrollYProgress, [0, 0.5], ["0%", "-30%"]);
  const narrativeOpacity = useTransform(scrollYProgress, [0, 0.45], [1, 0]);
  const indicatorOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  const businessName = profile?.company_name || company.name;
  const activeBanners = banners.filter((b) => b.status !== "inactive");
  const banner = activeBanners[0];

  const defaultImageUrl =
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1920&q=80";

  // Desktop banner with fallback
  const heroDesktopUrl =
    banner?.desktop_media_url ||
    banner?.image_url ||
    defaultImageUrl;

  // Mobile banner with fallback to desktop banner
  const heroMobileUrl =
    banner?.mobile_media_url ||
    heroDesktopUrl;

  const titleText =
    banner?.heading ||
    banner?.title ||
    `Your glow begins here. Welcome to ${businessName}.`;

  const subtitleLabel =
    banner?.subtitle ||
    (company.business_type?.name ? company.business_type.name.toUpperCase() : "BEAUTY SALON");

  const buttonText =
    banner?.cta_button_text ||
    banner?.button_text ||
    "Book an Appointment";

  const buttonUrl =
    banner?.cta_button_url ||
    banner?.link_url ||
    makeUrl("/contact");

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen min-h-[750px] overflow-hidden z-0 bg-neutral-950 border-b border-neutral-900"
    >
      {/* Background Portrait Photo with Parallax Scroll: Full Screen Full Bleed Edge-to-Edge */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div
          style={{ y: imageY, scale: imageScale }}
          className="relative w-full h-full"
        >
          {/* Mobile Screen Artwork (portrait optimized, with desktop fallback) */}
          <div className="relative w-full h-full sm:hidden">
            <Image
              src={!imageError ? heroMobileUrl : defaultImageUrl}
              alt={businessName}
              fill
              priority
              unoptimized
              sizes="100vw"
              onError={() => setImageError(true)}
              className="object-cover object-center brightness-95"
            />
          </div>

          {/* Desktop Screen Artwork (widescreen landscape) */}
          <div className="relative w-full h-full hidden sm:block">
            <Image
              src={!imageError ? heroDesktopUrl : defaultImageUrl}
              alt={businessName}
              fill
              priority
              unoptimized
              sizes="100vw"
              onError={() => setImageError(true)}
              className="object-cover object-top brightness-95"
            />
          </div>
        </motion.div>

        {/* Full-bleed cinematic gradient overlay: covers the appbar background at top and text at bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/25 to-black/85 pointer-events-none" />
        <div className="absolute inset-0 lg:bg-gradient-to-r lg:from-black/75 lg:via-black/20 lg:to-transparent pointer-events-none" />
      </div>

      {/* Floating Content container positioned over the full-bleed image */}
      <div className="relative z-10 w-full h-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-14 pt-32 sm:pt-40 pb-8 sm:pb-12 flex flex-col justify-between">
        {/* Floating Top Left Editorial Narrative with Parallax Scroll */}
        <motion.div
          style={{ y: narrativeY, opacity: narrativeOpacity }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-lg text-white space-y-3"
        >
          <p className="text-sm sm:text-base font-normal tracking-wide leading-relaxed text-neutral-200">
            {titleText}
          </p>
          <div>
            <Link
              href={buttonUrl}
              className="inline-block text-xs sm:text-sm font-semibold tracking-wider uppercase underline underline-offset-8 text-white hover:text-neutral-300 transition-colors"
            >
              {buttonText}
            </Link>
          </div>
        </motion.div>

        {/* Massive Editorial Luxury Headline Across Bottom with Video-like Scroll Parallax */}
        <motion.div
          style={{ y: textY, opacity: textOpacity }}
          className="pb-4 sm:pb-6"
        >
          <span className="sr-only">Experience Refined Luxury at {businessName}</span>
          
          <div className="flex flex-col items-start gap-1 sm:gap-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-1"
            >
              <span className="editorial-bracket text-[10px] sm:text-xs text-white/90 border-white/20 select-none">
                Aesthetic Sanctuary
              </span>
            </motion.div>

            <h1 className="font-luxury italic text-5xl sm:text-7xl md:text-8xl lg:text-[11vw] font-light tracking-tight text-white leading-[0.92] select-none drop-shadow-[0_15px_35px_rgba(0,0,0,0.85)] flex flex-wrap items-baseline gap-x-3 sm:gap-x-6">
              {subtitleLabel.trim().split(/\s+/).map((word, idx) => {
                const formatted =
                  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                return (
                  <span key={idx} className="overflow-hidden inline-block py-1">
                    <motion.span
                      initial={{ y: "115%", opacity: 0 }}
                      animate={{ y: "0%", opacity: 1 }}
                      transition={{
                        duration: 1.1,
                        delay: 0.25 + idx * 0.12,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className={`inline-block transition-transform duration-500 hover:-translate-y-1 ${
                        idx === 0
                          ? "font-light text-white"
                          : "font-normal text-white/95"
                      }`}
                    >
                      {formatted}
                    </motion.span>
                  </span>
                );
              })}
            </h1>
          </div>
        </motion.div>
      </div>

      {/* Luxury subtle scroll exploration indicator */}
      <motion.div
        style={{ opacity: indicatorOpacity }}
        className="hidden sm:flex absolute bottom-8 right-8 lg:right-14 z-20 items-center gap-3 text-white/70 pointer-events-none"
      >
        <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-white/60">
          Scroll to explore
        </span>
        <div className="w-5 h-9 rounded-full border border-white/40 flex items-start justify-center p-1">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="w-1 h-2 rounded-full bg-white"
          />
        </div>
      </motion.div>
    </section>
  );
}
