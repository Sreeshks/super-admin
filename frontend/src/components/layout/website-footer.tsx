"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTenant } from "@/providers/tenant-provider";
import { toast } from "sonner";
import { ArrowRight, Check } from "lucide-react";

export function WebsiteFooter({
  locations = [],
  socialLinks = [],
}: {
  locations?: Array<{
    id: string;
    location_name: string;
    address: string;
    city: string;
    contact_number?: string | null;
    is_primary: boolean;
  }>;
  socialLinks?: Array<{ id: string; platform: string; url: string }>;
}) {
  const { company, profile, isSectionEnabled, makeUrl } = useTenant();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const businessName = profile?.company_name || company.name;
  const businessType =
    company.business_type?.name?.toUpperCase() || "BEAUTY SALON";

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    setSubscribed(true);
    toast.success("Thank you for subscribing to our private editorial journal!");
    setEmail("");
  };

  return (
    <footer className="bg-white text-black pt-20 pb-10 border-t border-black/10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pb-16">
          
          {/* Col 1: Brand & Newsletter (Span 5) */}
          <div className="lg:col-span-5 space-y-6">
            <Link
              href={makeUrl("/")}
              className="font-sans text-2xl font-black uppercase tracking-tight text-black inline-block"
            >
              {businessName}
            </Link>

            <p className="text-xs text-neutral-600 leading-relaxed max-w-sm">
              Stay in Touch with {businessName}. Be the first to know about new treatments, seasonal
              offers and wellness tips directly to your inbox.
            </p>

            {/* Newsletter Subscription Form */}
            {subscribed ? (
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black pt-2">
                <Check className="w-4 h-4" />
                <span>You are on our private guest list</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex max-w-sm border-b border-black">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                  required
                  className="w-full py-2.5 bg-transparent text-xs text-black placeholder:text-neutral-400 focus:outline-hidden"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-black hover:text-neutral-600 transition-colors whitespace-nowrap"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>

          {/* Col 2: Top Services (Span 3) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-black">
              Top Services
            </h4>
            <ul className="space-y-2 text-xs text-neutral-600">
              <li>
                <Link
                  href={makeUrl("/services")}
                  className="hover:text-black transition-colors"
                >
                  Enzyme Exfoliation
                </Link>
              </li>
              <li>
                <Link
                  href={makeUrl("/services")}
                  className="hover:text-black transition-colors"
                >
                  Dermaplaning
                </Link>
              </li>
              <li>
                <Link
                  href={makeUrl("/services")}
                  className="hover:text-black transition-colors"
                >
                  Microcurrent Lift
                </Link>
              </li>
              <li>
                <Link
                  href={makeUrl("/services")}
                  className="hover:text-black transition-colors"
                >
                  High Frequency Therapy
                </Link>
              </li>
              <li>
                <Link
                  href={makeUrl("/services")}
                  className="hover:text-black transition-colors"
                >
                  Deep Hydration Ritual
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Navigation (Span 2) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-black">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs text-neutral-600">
              <li>
                <Link href={makeUrl("/")} className="hover:text-black transition-colors">
                  Home
                </Link>
              </li>
              {isSectionEnabled("about") && (
                <li>
                  <Link href={makeUrl("/about")} className="hover:text-black transition-colors">
                    About
                  </Link>
                </li>
              )}
              {isSectionEnabled("services") && (
                <li>
                  <Link href={makeUrl("/services")} className="hover:text-black transition-colors">
                    Services
                  </Link>
                </li>
              )}
              {isSectionEnabled("gallery") && (
                <li>
                  <Link href={makeUrl("/gallery")} className="hover:text-black transition-colors">
                    Our Space
                  </Link>
                </li>
              )}
              {isSectionEnabled("blog") && (
                <li>
                  <Link href={makeUrl("/blog")} className="hover:text-black transition-colors">
                    Journal
                  </Link>
                </li>
              )}
              {isSectionEnabled("contact") && (
                <li>
                  <Link href={makeUrl("/contact")} className="hover:text-black transition-colors">
                    Contact
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Col 4: Follow Us (Span 2) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-black">
              Follow Us
            </h4>
            <ul className="space-y-2 text-xs text-neutral-600">
              {socialLinks && socialLinks.length > 0 ? (
                socialLinks.map((s) => (
                  <li key={s.id}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="capitalize hover:text-black transition-colors"
                    >
                      {s.platform}
                    </a>
                  </li>
                ))
              ) : (
                <>
                  <li>
                    <a
                      href="https://instagram.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-black transition-colors"
                    >
                      Instagram
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://linkedin.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-black transition-colors"
                    >
                      LinkedIn
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://facebook.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-black transition-colors"
                    >
                      Facebook
                    </a>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Oversized Typographic Signature Banner (Spans Full Width) */}
        <div className="py-6 border-y border-black/10 select-none pointer-events-none text-center overflow-hidden">
          <p className="font-sans font-black tracking-tight text-[13.5vw] leading-none uppercase text-black">
            {businessType}
          </p>
        </div>

        {/* Bottom Legal & Meta */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500 font-sans">
          <div className="flex items-center gap-6">
            <Link href={makeUrl("/privacy")} className="hover:text-black transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href={makeUrl("/terms")} className="hover:text-black transition-colors">
              Terms of Service
            </Link>
          </div>
          <p>© {new Date().getFullYear()} {businessName}. All rights reserved.</p>
        </div>

      </div>
    </footer>
  );
}
