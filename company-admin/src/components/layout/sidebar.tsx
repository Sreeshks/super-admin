"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import {
  LayoutDashboard,
  Globe,
  Sliders,
  Image as ImageIcon,
  Share2,
  Eye,
  Scissors,
  Tags,
  BadgePercent,
  MapPin,
  Users,
  MessageSquareQuote,
  HelpCircle,
  BookOpen,
  Inbox,
  Building,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  X,
  Sparkles,
  ExternalLink,
} from "lucide-react";

interface NavGroup {
  group: string;
  items: Array<{
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
  }>;
}

const navGroups: NavGroup[] = [
  {
    group: "Overview",
    items: [{ name: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    group: "Website Management",
    items: [
      { name: "Website Overview", href: "/website", icon: Globe },
      { name: "Website Sections", href: "/website/sections", icon: Sliders },
      { name: "Hero Banners", href: "/banners", icon: ImageIcon },
      { name: "Gallery & Media", href: "/gallery", icon: ImageIcon },
      { name: "Social Media", href: "/social-media", icon: Share2 },
      { name: "Live Preview", href: "/website/preview", icon: Eye },
    ],
  },
  {
    group: "Business Management",
    items: [
      { name: "Services", href: "/services", icon: Scissors },
      { name: "Categories", href: "/categories", icon: Tags },
      { name: "Offers & Promos", href: "/offers", icon: BadgePercent },
      { name: "Locations", href: "/locations", icon: MapPin },
      { name: "Team Members", href: "/team", icon: Users },
    ],
  },
  {
    group: "Content Management",
    items: [
      { name: "Testimonials", href: "/testimonials", icon: MessageSquareQuote },
      { name: "FAQs", href: "/faq", icon: HelpCircle },
      { name: "Blogs & Articles", href: "/blogs", icon: BookOpen },
    ],
  },
  {
    group: "Customer Engagement",
    items: [{ name: "Customer Enquiries", href: "/enquiries", icon: Inbox }],
  },
  {
    group: "Administration",
    items: [
      { name: "Business Profile", href: "/profile", icon: Building },
      { name: "Activity Logs", href: "/activity", icon: History },
      { name: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, profile, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Drawer Trigger Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-4 z-40 p-2 rounded-lg bg-slate-900 text-white shadow-md"
        aria-label="Open navigation drawer"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-slate-900 text-slate-300 border-r border-slate-800 transition-all duration-300 ease-in-out",
          isCollapsed ? "w-20" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800">
          <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-white text-sm tracking-tight truncate">
                  {profile?.name || "Company Admin"}
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase">
                  Business Portal
                </span>
              </div>
            )}
          </Link>

          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items with Groups */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {navGroups.map((group) => (
            <div key={group.group} className="space-y-1">
              {!isCollapsed && (
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {group.group}
                </p>
              )}
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname?.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all",
                      isActive
                        ? "bg-emerald-600 text-white shadow-xs font-semibold"
                        : "text-slate-400 hover:bg-slate-800 hover:text-slate-200",
                      isCollapsed && "justify-center px-2 py-2.5"
                    )}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <Icon
                      className={cn(
                        "w-4 h-4 shrink-0 transition-colors",
                        isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                      )}
                    />
                    {!isCollapsed && <span className="truncate">{item.name}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer Profile & Collapse Toggle */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          {!isCollapsed && (
            <div className="flex items-center justify-between px-2 py-1">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-950 text-emerald-400 text-xs font-bold shrink-0">
                  {user?.full_name?.charAt(0) || "U"}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-slate-200 truncate">
                    {user?.full_name}
                  </span>
                  <span className="text-[10px] text-slate-500 truncate">{user?.email}</span>
                </div>
              </div>

              <button
                onClick={logout}
                title="Sign out"
                className="text-slate-400 hover:text-red-400 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="hidden lg:flex justify-end">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

