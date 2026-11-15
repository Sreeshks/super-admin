"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Testimonial } from "@/types";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { AnimatedBracket } from "@/components/ui/animated-bracket";

export function TestimonialsSection({
  testimonials = [],
}: {
  testimonials?: Testimonial[];
}) {
  const [currentPage, setCurrentPage] = useState(0);

  // Fallback realistic testimonials matching the editorial references
  const defaultTestimonials: Testimonial[] = [
    {
      id: "1",
      customer_name: "Mellisa P.",
      customer_title: "Enzyme Exfoliation, Jun 28th, 2025",
      review_text:
        "My favorite stress reliever. There's nothing like ending the month with a visit here. The atmosphere is so calming, the staff are always attentive, and I leave feeling like a new person. If I could come every week, I would!",
      rating: 5,
      avatar_url:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
      display_order: 1,
    },
    {
      id: "2",
      customer_name: "Sophie L.",
      customer_title: "Glow Revival Facial, Jul 6th, 2025",
      review_text:
        "My skin has never looked this radiant. One facial erased the dullness and gave me the confidence to go makeup-free. The care felt truly personal — I'm already booking my next visit.",
      rating: 5,
      avatar_url:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
      display_order: 2,
    },
    {
      id: "3",
      customer_name: "Elena V.",
      customer_title: "Deep Hydration Ritual, Aug 12th, 2025",
      review_text:
        "The bespoke approach here is unlike any other salon. Every product was carefully selected for my skin barrier needs, and the neck and shoulder massage felt heavenly. True quiet luxury.",
      rating: 5,
      avatar_url:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80",
      display_order: 3,
    },
    {
      id: "4",
      customer_name: "Camille R.",
      customer_title: "Vitamin C Infusion, Sep 2nd, 2025",
      review_text:
        "The aesthetic and attention to detail is unmatched. The studio smells incredible, the therapists are deeply knowledgeable, and my complexion has retained its glow for weeks.",
      rating: 5,
      avatar_url:
        "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=300&q=80",
      display_order: 4,
    },
  ];

  const items = testimonials.length > 0 ? testimonials : defaultTestimonials;

  // Calculate average rating
  const avgRating = items.length > 0
    ? (items.reduce((sum, t) => sum + (t.rating || 5), 0) / items.length).toFixed(1)
    : "4.9";

  const pageSize = 2;
  const totalPages = Math.ceil(items.length / pageSize);

  const prev = () => setCurrentPage((p) => (p > 0 ? p - 1 : totalPages - 1));
  const next = () => setCurrentPage((p) => (p < totalPages - 1 ? p + 1 : 0));

  const visibleItems = items.slice(
    currentPage * pageSize,
    currentPage * pageSize + pageSize
  );

  return (
    <section className="py-24 sm:py-32 bg-white border-b border-black/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Headline matching Reference */}
        <div className="text-center max-w-4xl mx-auto mb-16 sm:mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="font-sans text-3xl sm:text-5xl lg:text-6xl font-extrabold uppercase tracking-tight text-black leading-tight sm:leading-none"
          >
            <span>REAL</span>
            <AnimatedBracket text={`${avgRating} AVERAGE RATING`} delay={0.1} />
            <span>RESULTS</span>
            <br />
            <span className="block mt-2 sm:mt-3">NO FILTERS NO RETOUCHING</span>
            <span className="block mt-2 sm:mt-3">
              <span>JUST</span>
              <AnimatedBracket text="1.45K REVIEWS" delay={0.25} />
              <span>REAL PEOPLE</span>
            </span>
          </motion.h2>
        </div>

        {/* Review Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
          {visibleItems.map((item) => (
            <div
              key={item.id}
              className="border border-black/10 bg-white p-6 sm:p-8 flex flex-col justify-between space-y-6 min-h-[290px] shadow-xs hover:border-black/30 transition-colors"
            >
              {/* Star Rating & Score */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex text-black">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < (item.rating || 5)
                            ? "fill-black text-black"
                            : "text-neutral-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold font-mono text-black">
                    {(item.rating || 5).toFixed(1)}
                  </span>
                </div>

                {/* Review Text */}
                <p className="text-xs sm:text-sm text-neutral-800 leading-relaxed font-sans">
                  {item.review || item.review_text}
                </p>
              </div>

              {/* Customer Profile & Treatment Tag */}
              <div className="flex items-center gap-3.5 pt-4 border-t border-black/5">
                {(item.customer_image || item.avatar_url) ? (
                  <div className="relative h-11 w-11 rounded-full overflow-hidden bg-neutral-100 flex-shrink-0 border border-black/10">
                    <Image
                      src={item.customer_image || item.avatar_url!}
                      alt={item.customer_name}
                      fill
                      sizes="44px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-11 w-11 rounded-full bg-neutral-900 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                    {item.customer_name.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-black">
                    {item.customer_name}
                  </h4>
                  {(item.customer_designation || item.customer_title) && (
                    <p className="text-[11px] text-neutral-500 font-sans mt-0.5">
                      {item.customer_designation || item.customer_title}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-between max-w-5xl mx-auto pt-6 border-t border-black/5">
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx)}
                  className={`h-1.5 transition-all duration-300 ${
                    currentPage === idx ? "w-8 bg-black" : "w-2 bg-neutral-300"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={prev}
                className="w-10 h-10 border border-black/15 flex items-center justify-center text-black hover:border-black transition-colors"
                aria-label="Previous reviews"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={next}
                className="w-10 h-10 border border-black/15 flex items-center justify-center text-black hover:border-black transition-colors"
                aria-label="Next reviews"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
