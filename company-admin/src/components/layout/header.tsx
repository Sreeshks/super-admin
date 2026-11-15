"use client";

import React, { useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { usePathname } from "next/navigation";
import {
  Bell,
  Search,
  ExternalLink,
  ChevronDown,
  Globe,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const titles: Record<string, string> = {
  "/dashboard": "Business Dashboard",
  "/website": "Website Overview",
  "/website/sections": "Website Sections Configuration",
  "/banners": "Hero Banners",
  "/gallery": "Media & Gallery",
  "/social-media": "Social Media Channels",
  "/website/preview": "Live Storefront Preview",
  "/services": "Services Catalog",
  "/categories": "Service Categories",
  "/offers": "Special Offers & Promotions",
  "/locations": "Business Locations",
  "/team": "Team & Access Permissions",
  "/testimonials": "Customer Testimonials",
  "/faq": "Frequently Asked Questions",
  "/blogs": "Company Blog CMS",
  "/enquiries": "Customer Enquiries",
  "/profile": "Company Business Profile",
  "/activity": "Activity Audit Log",
  "/settings": "Account Settings",
};

export function Header() {
  const { user, profile, logout } = useAuth();
  const pathname = usePathname();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const getPageTitle = () => {
    if (!pathname) return "Console";
    return titles[pathname] || "Business Management";
  };

  const publicWebsiteUrl = profile?.slug
    ? `http://localhost:8000/api/v1/websites/${profile.slug}`
    : "#";

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 sm:px-8 backdrop-blur-xs shadow-xs">
      {/* Title & Mobile offset */}
      <div className="flex items-center gap-3 pl-12 lg:pl-0">
        <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
          {getPageTitle()}
        </h1>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Website Status & Quick View */}
        {profile && (
          <div className="hidden sm:flex items-center gap-2.5">
            <Badge
              variant={
                profile.website_status === "active"
                  ? "success"
                  : profile.website_status === "maintenance"
                  ? "warning"
                  : "destructive"
              }
            >
              Website: {profile.website_status}
            </Badge>

            <a
              href={publicWebsiteUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                View Website
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </Button>
            </a>
          </div>
        )}

        {/* User avatar + dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 rounded-lg p-1.5 text-left hover:bg-slate-50 transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 font-bold text-xs uppercase shadow-xs">
              {user?.full_name?.charAt(0) || "U"}
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-xs font-semibold text-slate-900 leading-tight">
                {user?.full_name}
              </span>
              <span className="text-[10px] text-emerald-600 font-medium leading-tight">
                {user?.roles?.[0]?.name || "COMPANY_ADMIN"}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {showProfileMenu && (
            <div
              className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white py-2 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100"
              onClick={() => setShowProfileMenu(false)}
            >
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{user?.full_name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                <div className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded w-fit">
                  <ShieldCheck className="w-3 h-3" />
                  Tenant Context Active
                </div>
              </div>

              <div className="pt-1">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out of Portal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

