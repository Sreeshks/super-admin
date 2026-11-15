"use client";

import React, { useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { usePathname } from "next/navigation";
import {
  Bell,
  Search,
  LogOut,
  ShieldAlert,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const breadcrumbTitles: Record<string, string> = {
  "/dashboard": "Executive Dashboard",
  "/companies": "Company Directory",
  "/companies/create": "Create Business Account",
  "/business-types": "Business Types & Configurations",
  "/administrators": "Platform Administrators",
  "/subscriptions": "Subscription Plans & Billing",
  "/domains": "Custom Domains Management",
  "/templates": "Website Template Catalog",
  "/media": "Global Media & Storage",
  "/support": "Support Tickets & Enquiries",
  "/activity-logs": "Platform Audit & Security Logs",
  "/settings": "Platform Global Settings",
};

export function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const getPageTitle = () => {
    if (!pathname) return "Console";
    if (breadcrumbTitles[pathname]) return breadcrumbTitles[pathname];
    if (pathname.startsWith("/companies/")) return "Company Profile & Details";
    return "Administration Console";
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 sm:px-8 backdrop-blur-xs shadow-xs">
      {/* Title & Breadcrumbs */}
      <div className="flex items-center gap-3 pl-12 lg:pl-0">
        <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
          {getPageTitle()}
        </h1>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Search */}
        <div className="relative hidden md:block w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search console..."
            className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>

        {/* Notifications */}
        <button
          className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200" />

        {/* User profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 rounded-lg p-1.5 text-left hover:bg-slate-50 transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700 font-bold text-xs uppercase shadow-xs">
              {user?.full_name?.charAt(0) || "A"}
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-xs font-semibold text-slate-900 leading-tight">
                {user?.full_name || "Super Admin"}
              </span>
              <span className="text-[10px] text-blue-600 font-medium leading-tight">
                SUPER_ADMIN
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div
              className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white py-2 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100"
              onClick={() => setShowProfileMenu(false)}
            >
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{user?.full_name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                <div className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded w-fit">
                  <ShieldAlert className="w-3 h-3" />
                  Verified Super Administrator
                </div>
              </div>

              <div className="pt-1">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out of Console
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

