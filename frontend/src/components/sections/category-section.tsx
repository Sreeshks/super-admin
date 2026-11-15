"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Category } from "@/types";
import { useTenant } from "@/providers/tenant-provider";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { AnimatedBracket } from "@/components/ui/animated-bracket";

export function CategorySection({ categories = [] }: { categories?: Category[] }) {
  const { makeUrl } = useTenant();

  if (!categories || categories.length === 0) {
    return null;
  }

  const defaultCategoryImages: Record<string, string> = {
    skin: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=85",
    body: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=85",
    hair: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=85",
    nail: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=800&q=85",
    spa: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=85",
  };

  const getFallback = (name: string) => {
    const n = name.toLowerCase();
    for (const key of Object.keys(defaultCategoryImages)) {
      if (n.includes(key)) return defaultCategoryImages[key];
    }
    return "https://images.unsplash.com/photo-1512290900672-1f028479e491?auto=format&fit=crop&w=800&q=85";
  };

  return (
    <section className="py-24 sm:py-32 bg-white border-b border-black/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Title */}
        <div className="text-center mb-16 sm:mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="font-sans text-3xl sm:text-5xl lg:text-6xl font-extrabold uppercase tracking-tight text-black flex items-center justify-center gap-2"
          >
            <span>CURATED</span>
            <AnimatedBracket text="SPECIALIZATIONS" delay={0.15} />
            <span>RITUALS</span>
          </motion.h2>
          <p className="mt-3 text-xs sm:text-sm text-neutral-500 max-w-md mx-auto">
            Explore our specialized disciplines across aesthetic skin science, scalp health, and body therapies.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {categories.map((cat) => {
            const img = cat.image_url || getFallback(cat.name);
            return (
              <Link
                key={cat.id}
                href={makeUrl(`/services?category=${cat.slug}`)}
                className="group block border border-black/10 bg-white hover:border-black/30 transition-colors"
              >
                <div className="relative aspect-4/3 w-full overflow-hidden bg-neutral-100">
                  <Image
                    src={img}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                </div>
                <div className="p-6 flex items-center justify-between border-t border-black/10">
                  <div>
                    <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-black group-hover:text-neutral-600 transition-colors">
                      {cat.name}
                    </h3>
                    {cat.description && (
                      <p className="text-xs text-neutral-500 line-clamp-1 mt-1 font-sans">
                        {cat.description}
                      </p>
                    )}
                  </div>
                  <div className="w-8 h-8 border border-black/20 flex items-center justify-center text-black group-hover:border-black group-hover:bg-black group-hover:text-white transition-colors">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}
