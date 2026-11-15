"use client";

import React, { useState } from "react";
import { FAQ } from "@/types";
import { Plus, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { AnimatedBracket } from "@/components/ui/animated-bracket";

export function FAQSection({ faqs = [] }: { faqs?: FAQ[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  // Fallback high-value FAQs
  const defaultFaqs: FAQ[] = [
    {
      id: "1",
      question: "How should I prepare for a personalized facial ritual?",
      answer:
        "We recommend discontinuing potent retinoids or AHA/BHA chemical exfoliants 48 hours prior to your visit. Please arrive makeup-free if convenient, though our master aestheticians perform a thorough double-cleansing ritual at the start of every session.",
      display_order: 1,
    },
    {
      id: "2",
      question: "What is your cancellation and rescheduling policy?",
      answer:
        "We request at least 24 hours advance notice to adjust or cancel appointments. Because treatment rooms and specialized therapists are reserved exclusively for you, cancellations within 24 hours may incur a courtesy reservation fee.",
      display_order: 2,
    },
    {
      id: "3",
      question: "Are treatments suitable for sensitive or sensitized skin barriers?",
      answer:
        "Every session begins with a comprehensive skin analysis under specialized diagnostic light. Our formulations are tailored dynamically to soothe active inflammation, strengthen lipid barrier integrity, and prevent reactive irritation.",
      display_order: 3,
    },
    {
      id: "4",
      question: "Do you offer private suite appointments or group bookings?",
      answer:
        "Yes, our private VIP suites and sensory hydrotherapy spaces can be reserved for dedicated bespoke appointments or private bridal parties. Contact our concierge desk directly for group coordination.",
      display_order: 4,
    },
  ];

  const items = faqs && faqs.length > 0 ? faqs : defaultFaqs;

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section className="py-24 sm:py-32 bg-white border-b border-black/10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Heading */}
        <div className="text-center mb-16 sm:mb-20">
          <span className="sr-only">Frequently Asked Questions</span>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="font-sans text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-black flex items-center justify-center gap-2"
          >
            <span>COMMON</span>
            <AnimatedBracket text="QUESTIONS & PROTOCOLS" delay={0.15} />
            <span>INQUIRIES</span>
          </motion.h2>
          <p className="mt-3 text-xs sm:text-sm text-neutral-500 max-w-md mx-auto">
            Helpful answers to assist you before entering our quiet sanctuary.
          </p>
        </div>

        {/* Minimal Accordion List */}
        <div className="divide-y divide-black/10 border-y border-black/10">
          {items.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={faq.id} className="py-6 transition-colors">
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full text-left flex items-center justify-between gap-6 font-sans text-sm sm:text-base font-bold uppercase tracking-wide text-black hover:text-neutral-600 transition-colors focus:outline-hidden"
                >
                  <span>{faq.question}</span>
                  <div className="w-7 h-7 border border-black/20 flex items-center justify-center text-black flex-shrink-0">
                    {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="pt-4 pr-10 text-xs sm:text-sm text-neutral-600 leading-relaxed font-sans">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
