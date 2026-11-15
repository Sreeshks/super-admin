"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Blog } from "@/types";
import { useTenant } from "@/providers/tenant-provider";
import { formatDate } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export function BlogSection({ blogs = [] }: { blogs?: Blog[] }) {
  const { makeUrl } = useTenant();

  // Fallback high-fashion editorial articles matching reference
  const defaultBlogs: Blog[] = [
    {
      id: "1",
      title: "THE POWER OF COMBINING MICRONEEDLING AND EXOSOMES",
      slug: "microneedling-and-exosomes",
      short_description:
        "How cutting-edge cellular therapy accelerates collagen synthesis, reduces pore structure, and restores skin resilience.",
      full_content: "",
      featured_image:
        "https://images.unsplash.com/photo-1512290900672-1f028479e491?auto=format&fit=crop&w=1000&q=85",
      published_date: "2025-06-06",
    },
    {
      id: "2",
      title: "WHAT IS PERIORAL DERMATITIS?",
      slug: "what-is-perioral-dermatitis",
      short_description:
        "Understanding irritation triggers around the mouth and nose, and why stripping back actives is the path to long-term recovery.",
      full_content: "",
      featured_image:
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=85",
      published_date: "2025-06-12",
    },
    {
      id: "3",
      title: "WHAT HAPPENS BENEATH SKIN AS WE AGE?",
      slug: "skin-aging-mechanisms",
      short_description:
        "A biological perspective on elastin matrix breakdown, moisture retention capacity, and non-invasive restorative treatments.",
      full_content: "",
      featured_image:
        "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=1000&q=85",
      published_date: "2025-05-20",
    },
  ];

  const items = blogs && blogs.length > 0 ? blogs.slice(0, 3) : defaultBlogs;

  return (
    <section className="py-24 sm:py-32 bg-white border-b border-black/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Heading */}
        <div className="text-center mb-16 sm:mb-20">
          <h2 className="font-sans text-4xl sm:text-6xl font-extrabold uppercase tracking-tight text-black flex items-center justify-center gap-3">
            <span>NEWSLETTER</span>
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-neutral-500 max-w-md mx-auto">
            Deep-dive skincare research, clinic notes, and restorative self-care rituals.
          </p>
        </div>

        {/* 3 Asymmetric Editorial Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 items-end max-w-6xl mx-auto">
          {/* Card 1: Wide portrait */}
          {items[0] && (
            <Link
              href={makeUrl(`/blog/${items[0].slug}`)}
              className="group block cursor-pointer"
            >
              <div className="relative aspect-4/5 w-full overflow-hidden bg-neutral-100">
                <Image
                  src={items[0].featured_image || defaultBlogs[0].featured_image!}
                  alt={items[0].title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>
              <div className="pt-4 space-y-1.5">
                <h3 className="font-sans text-sm font-bold uppercase tracking-wide text-black group-hover:text-neutral-600 transition-colors leading-snug">
                  {items[0].title}
                </h3>
                {items[0].published_date && (
                  <p className="text-[11px] text-neutral-400 font-mono">
                    {formatDate(items[0].published_date)}
                  </p>
                )}
              </div>
            </Link>
          )}

          {/* Card 2: Circular or Square artistic crop */}
          {items[1] && (
            <Link
              href={makeUrl(`/blog/${items[1].slug}`)}
              className="group block cursor-pointer md:pb-6"
            >
              <div className="relative aspect-square w-4/5 mx-auto overflow-hidden rounded-full bg-neutral-100">
                <Image
                  src={items[1].featured_image || defaultBlogs[1].featured_image!}
                  alt={items[1].title}
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>
              <div className="pt-6 text-center space-y-1.5">
                <h3 className="font-sans text-sm font-bold uppercase tracking-wide text-black group-hover:text-neutral-600 transition-colors leading-snug max-w-xs mx-auto">
                  {items[1].title}
                </h3>
                {items[1].published_date && (
                  <p className="text-[11px] text-neutral-400 font-mono">
                    {formatDate(items[1].published_date)}
                  </p>
                )}
              </div>
            </Link>
          )}

          {/* Card 3: Tall portrait */}
          {items[2] && (
            <Link
              href={makeUrl(`/blog/${items[2].slug}`)}
              className="group block cursor-pointer"
            >
              <div className="relative aspect-3/4 w-full overflow-hidden bg-neutral-100">
                <Image
                  src={items[2].featured_image || defaultBlogs[2].featured_image!}
                  alt={items[2].title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>
              <div className="pt-4 space-y-1.5">
                <h3 className="font-sans text-sm font-bold uppercase tracking-wide text-black group-hover:text-neutral-600 transition-colors leading-snug">
                  {items[2].title}
                </h3>
                {items[2].published_date && (
                  <p className="text-[11px] text-neutral-400 font-mono">
                    {formatDate(items[2].published_date)}
                  </p>
                )}
              </div>
            </Link>
          )}
        </div>

        {/* View All CTA */}
        <div className="mt-16 text-center">
          <Link
            href={makeUrl("/blog")}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-black underline hover:text-neutral-600 transition-colors group"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
