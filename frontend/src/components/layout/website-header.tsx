"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTenant } from "@/providers/tenant-provider";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function WebsiteHeader() {
  const { company, profile, slug, isSectionEnabled, makeUrl } = useTenant();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const businessName = profile?.company_name || company.name;
  const currentSlug = slug || company.slug;
  const cleanPath = (pathname || "").replace(/\/+$/, "");
  const isHome =
    cleanPath === "" ||
    cleanPath === `/${currentSlug}` ||
    cleanPath === `/${company.slug}`;

  const isTransparent = isHome && !isScrolled;

  const navItems = [
    { label: "ABOUT US", href: makeUrl("/about"), enabled: isSectionEnabled("about") },
    { label: "SERVICES", href: makeUrl("/services"), enabled: isSectionEnabled("services") },
    { label: "OFFERS", href: makeUrl("/offers"), enabled: isSectionEnabled("offers") },
    { label: "GALLERY", href: makeUrl("/gallery"), enabled: isSectionEnabled("gallery") },
    { label: "BLOG", href: makeUrl("/blog"), enabled: isSectionEnabled("blog") },
    { label: "CONTACTS", href: makeUrl("/contact"), enabled: isSectionEnabled("contact") },
  ].filter((item) => item.enabled !== false);

  const isActive = (href: string) => {
    if (href.endsWith(company.slug) || href === "/") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <header
      className={cn(
        "z-50 transition-all duration-300",
        isHome ? "fixed top-0 left-0 right-0" : "sticky top-0",
        isTransparent
          ? "bg-transparent text-white border-b border-transparent"
          : "bg-white/95 backdrop-blur-md text-black border-b border-neutral-200 shadow-xs"
      )}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href={makeUrl("/")} className="flex items-center group">
            <span
              className={cn(
                "font-sans text-xl sm:text-2xl font-black tracking-widest uppercase transition-colors",
                isTransparent ? "text-white" : "text-black"
              )}
            >
              {businessName.split(" ")[0]}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-[11px] font-bold uppercase tracking-[0.18em] transition-colors",
                  isTransparent
                    ? isActive(item.href)
                      ? "text-white underline underline-offset-8"
                      : "text-white/80 hover:text-white"
                    : isActive(item.href)
                    ? "text-black underline underline-offset-8"
                    : "text-neutral-600 hover:text-black"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Right Action */}
          <div className="hidden lg:flex items-center gap-4">
            <Link
              href={makeUrl("/contact")}
              className={cn(
                "inline-flex items-center px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.18em] transition-all",
                isTransparent
                  ? "bg-white/15 backdrop-blur-md text-white border border-white/40 hover:bg-white hover:text-black"
                  : "bg-black hover:bg-neutral-800 text-white"
              )}
            >
              Book an Appointment
            </Link>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex lg:hidden items-center gap-3">
            <Link
              href={makeUrl("/contact")}
              className={cn(
                "inline-flex items-center px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all",
                isTransparent
                  ? "bg-white/20 backdrop-blur-md text-white border border-white/30"
                  : "bg-black text-white"
              )}
            >
              Book
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className={cn(
                "px-3.5 py-1.5 border text-[11px] font-bold uppercase tracking-wider transition-colors",
                isTransparent
                  ? "border-white text-white hover:bg-white/10"
                  : "border-black text-black hover:bg-neutral-100"
              )}
            >
              Menu
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-white text-black flex flex-col p-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-6 border-b border-neutral-200">
            <span className="text-xl font-black tracking-widest text-black uppercase">
              {businessName.split(" ")[0]}
            </span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-neutral-400 hover:text-black"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 py-8 flex flex-col justify-between">
            <nav className="space-y-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-2xl font-black uppercase tracking-tight text-neutral-900 hover:text-neutral-600 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="pt-6 border-t border-neutral-200 space-y-4">
              <Link
                href={makeUrl("/contact")}
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full py-4 bg-black text-white text-center text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors"
              >
                Book an Appointment
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
