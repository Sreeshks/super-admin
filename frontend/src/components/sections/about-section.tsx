"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTenant } from "@/providers/tenant-provider";
import { AnimatedBracket } from "@/components/ui/animated-bracket";

export function AboutSection() {
  const { company, profile, makeUrl } = useTenant();
  const businessName = profile?.company_name || company.name;

  return (
    <div className="w-full">
      {/* 1. White Editorial Statement with Animated Expanding Bracket Flourishes */}
      <section className="py-24 sm:py-36 bg-white border-b border-neutral-200 overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 text-center space-y-10">
          <span className="sr-only">Our Story & Philosophy</span>
          
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="font-sans text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight text-black leading-tight max-w-5xl mx-auto"
          >
            <span>WE</span>
            <AnimatedBracket text="ABOUT US" delay={0.1} />
            <span>HELP CREATE MOMENTS OF BEAUTY FOR YOU</span>
            <AnimatedBracket text="ABOUT US" delay={0.25} />
            <span>AND YOUR GLOW</span>
            <AnimatedBracket text="ABOUT US" delay={0.4} />
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-sm sm:text-base text-neutral-600 max-w-2xl mx-auto leading-relaxed"
          >
            {profile?.about_section ||
              `${businessName} is a premium beauty and wellness studio, offering expert care for skin, body, and hair. We provide personalized consultations to select treatments that precisely address each client's individual needs.`}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.35 }}
          >
            <Link
              href={makeUrl("/about")}
              className="inline-block text-xs sm:text-sm font-bold uppercase tracking-widest text-black underline underline-offset-8 hover:text-neutral-600 transition-colors"
            >
              Read More
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 2. Deep Espresso "THE STORY" Section with Oval Mirror and Stats */}
      <section className="py-20 sm:py-28 bg-[#35251D] text-white overflow-hidden border-b border-neutral-200">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left: Rounded Vertical Oval Mirror */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 flex justify-center"
            >
              <div className="relative w-64 sm:w-80 h-96 sm:h-[480px] rounded-full overflow-hidden border-2 border-white/20 shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80"
                  alt={`${businessName} Sanctuary`}
                  fill
                  sizes="(max-width: 1024px) 80vw, 400px"
                  className="object-cover brightness-90"
                />
              </div>
            </motion.div>

            {/* Right: The Story & Stats */}
            <div className="lg:col-span-7 space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-4"
              >
                <h3 className="font-sans text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
                  THE STORY OF {businessName.split(" ")[0]}
                </h3>

                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-xl">
                  {profile?.full_description ||
                    `${businessName} was born from a simple belief: beauty is most powerful when it reflects how you feel inside. Inspired by nature, light, and the soft rhythm of self-care, our studio was created as a gentle space where women could reconnect with themselves — not just enhance their appearance.`}
                </p>
              </motion.div>

              {/* Minimal Numbers / Metrics */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="pt-4 border-t border-white/15 grid grid-cols-3 gap-4 max-w-md"
              >
                <div>
                  <span className="block text-2xl sm:text-4xl font-black text-white">5</span>
                  <span className="text-[11px] text-neutral-400 uppercase tracking-widest block mt-1">
                    Years of Experience
                  </span>
                </div>
                <div>
                  <span className="block text-2xl sm:text-4xl font-black text-white">16</span>
                  <span className="text-[11px] text-neutral-400 uppercase tracking-widest block mt-1">
                    Master Team
                  </span>
                </div>
                <div>
                  <span className="block text-2xl sm:text-4xl font-black text-white">465</span>
                  <span className="text-[11px] text-neutral-400 uppercase tracking-widest block mt-1">
                    SQ.M. Sanctuary
                  </span>
                </div>
              </motion.div>

              <div>
                <Link
                  href={makeUrl("/about")}
                  className="inline-block text-xs font-bold uppercase tracking-widest text-white underline underline-offset-8 hover:text-neutral-300 transition-colors"
                >
                  Read More
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
