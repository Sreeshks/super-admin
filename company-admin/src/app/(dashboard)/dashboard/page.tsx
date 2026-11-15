"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import { servicesApi } from "@/lib/api/services";
import { offersApi } from "@/lib/api/offers";
import { contactApi } from "@/lib/api/contact";
import { locationsApi } from "@/lib/api/locations";
import { blogsApi } from "@/lib/api/content";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Scissors,
  BadgePercent,
  Inbox,
  MapPin,
  BookOpen,
  Globe,
  PlusCircle,
  ExternalLink,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { formatDate } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  new: "#2563EB",
  in_progress: "#D97706",
  resolved: "#059669",
  closed: "#64748B",
};

export default function DashboardPage() {
  const { profile } = useAuth();

  // Real backend queries
  const { data: servicesRes, isLoading: servicesLoading } = useQuery({
    queryKey: ["company-services", { page: 1, page_size: 1 }],
    queryFn: () => servicesApi.list({ page: 1, page_size: 1 }),
  });

  const { data: offers, isLoading: offersLoading } = useQuery({
    queryKey: ["company-offers"],
    queryFn: () => offersApi.list(),
  });

  const { data: enquiriesRes, isLoading: enquiriesLoading } = useQuery({
    queryKey: ["company-enquiries", { page: 1, page_size: 100 }],
    queryFn: () => contactApi.listEnquiries({ page: 1, page_size: 100 }),
  });

  const { data: locations, isLoading: locationsLoading } = useQuery({
    queryKey: ["company-locations"],
    queryFn: () => locationsApi.list(),
  });

  const { data: blogs, isLoading: blogsLoading } = useQuery({
    queryKey: ["company-blogs"],
    queryFn: () => blogsApi.list(),
  });

  // Calculate enquiry distribution
  const enquiryChartData = React.useMemo(() => {
    const list = enquiriesRes?.data || [];
    const counts: Record<string, number> = {
      new: 0,
      in_progress: 0,
      resolved: 0,
      closed: 0,
    };
    list.forEach((e) => {
      if (counts[e.status] !== undefined) {
        counts[e.status]++;
      } else {
        counts.new++;
      }
    });

    return Object.entries(counts).map(([status, count]) => ({
      name: status.replace("_", " ").toUpperCase(),
      status,
      count,
    }));
  }, [enquiriesRes]);

  const recentEnquiries = (enquiriesRes?.data || []).slice(0, 5);
  const totalServices = servicesRes?.pagination?.total_items ?? 0;
  const activeOffers = offers?.filter((o) => o.is_active).length ?? 0;
  const totalEnquiries = enquiriesRes?.pagination?.total_items ?? 0;
  const totalLocations = locations?.length ?? 0;
  const publishedBlogs = blogs?.filter((b) => b.is_published).length ?? 0;

  const publicWebsiteUrl = profile?.slug
    ? `http://localhost:8000/api/v1/websites/${profile.slug}`
    : "#";

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Header & Quick Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black tracking-tight text-slate-900">
                {profile?.name || "Business Overview"}
              </h2>
              {profile && (
                <Badge
                  variant={
                    profile.website_status === "active"
                      ? "success"
                      : profile.website_status === "maintenance"
                      ? "warning"
                      : "destructive"
                  }
                >
                  {profile.website_status}
                </Badge>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              Manage website storefront content, customer leads, and business catalog.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link href="/services">
              <Button size="md" className="gap-2 shadow-sm">
                <PlusCircle className="w-4 h-4" />
                Add Service
              </Button>
            </Link>
            <Link href="/offers">
              <Button variant="outline" size="md">
                Create Offer
              </Button>
            </Link>
            <a href={publicWebsiteUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="md" className="gap-1.5 text-emerald-700">
                <Globe className="w-4 h-4 text-emerald-600" />
                View Website
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </a>
          </div>
        </div>

        {/* Summary KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* Services */}
          <Card className="border-slate-200 shadow-xs">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Services
                </span>
                <Scissors className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">
                {servicesLoading ? <Skeleton className="h-7 w-12" /> : totalServices}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Offered to clients</p>
            </CardContent>
          </Card>

          {/* Active Offers */}
          <Card className="border-slate-200 shadow-xs">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Active Offers
                </span>
                <BadgePercent className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-2xl font-black text-amber-600 mt-2">
                {offersLoading ? <Skeleton className="h-7 w-12" /> : activeOffers}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Live promo deals</p>
            </CardContent>
          </Card>

          {/* Enquiries */}
          <Card className="border-slate-200 shadow-xs">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Enquiries
                </span>
                <Inbox className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-black text-blue-600 mt-2">
                {enquiriesLoading ? <Skeleton className="h-7 w-12" /> : totalEnquiries}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Website submissions</p>
            </CardContent>
          </Card>

          {/* Locations */}
          <Card className="border-slate-200 shadow-xs">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Outlets
                </span>
                <MapPin className="w-4 h-4 text-violet-600" />
              </div>
              <p className="text-2xl font-black text-violet-600 mt-2">
                {locationsLoading ? <Skeleton className="h-7 w-12" /> : totalLocations}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Branch locations</p>
            </CardContent>
          </Card>

          {/* Published Blogs */}
          <Card className="border-slate-200 shadow-xs">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Articles
                </span>
                <BookOpen className="w-4 h-4 text-rose-600" />
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">
                {blogsLoading ? <Skeleton className="h-7 w-12" /> : publishedBlogs}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Live content posts</p>
            </CardContent>
          </Card>

          {/* Website Status */}
          <Card className="border-slate-200 shadow-xs">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Storefront
                </span>
                <Globe className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-lg font-black text-emerald-700 mt-2 truncate capitalize">
                {profile?.website_status || "Active"}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Public status</p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics & Website Status Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Enquiry Status Distribution Chart */}
          <Card className="lg:col-span-2 border-slate-200 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base font-bold">Enquiry Pipeline Distribution</CardTitle>
                <CardDescription>Customer inquiries grouped by operational status</CardDescription>
              </div>
              <Inbox className="w-5 h-5 text-slate-400" />
            </CardHeader>
            <CardContent className="pt-4">
              {enquiriesLoading ? (
                <Skeleton className="h-60 w-full" />
              ) : totalEnquiries === 0 ? (
                <div className="h-60 flex flex-col items-center justify-center text-center p-6">
                  <Inbox className="w-10 h-10 text-slate-300 mb-2" />
                  <p className="text-sm font-semibold text-slate-700">No customer enquiries yet</p>
                  <p className="text-xs text-slate-500">
                    When visitors submit the contact form on your website, leads will appear here.
                  </p>
                </div>
              ) : (
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={enquiryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0F172A",
                          borderRadius: "8px",
                          border: "none",
                          color: "#fff",
                          fontSize: "12px",
                        }}
                      />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {enquiryChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={STATUS_COLORS[entry.status] || "#059669"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Website Status & Storefront Card */}
          <Card className="border-slate-200 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Public Storefront</CardTitle>
              <CardDescription>Live website endpoints</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400">
                  Primary Website URL
                </span>
                <p className="text-xs font-mono font-bold text-slate-800 break-all">
                  /websites/{profile?.slug || "your-slug"}
                </p>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                <span className="text-xs font-semibold text-emerald-800">Tenant Isolation</span>
                <Badge variant="success">RLS Enforced</Badge>
              </div>

              <div className="pt-2 space-y-2">
                <a
                  href={publicWebsiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-xs"
                >
                  <Globe className="w-3.5 h-3.5" />
                  Open Live Storefront
                  <ExternalLink className="w-3 h-3" />
                </a>

                <Link href="/website/sections" className="block">
                  <Button variant="outline" className="w-full text-xs">
                    Configure Website Sections
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Enquiries Table */}
        <Card className="border-slate-200 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold">Recent Customer Inquiries</CardTitle>
              <CardDescription>Latest customer messages received from the website contact form</CardDescription>
            </div>
            <Link href="/enquiries" className="text-xs font-semibold text-emerald-700 hover:underline">
              View all enquiries
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {enquiriesLoading ? (
                <div className="p-4 space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : recentEnquiries.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  No enquiries received yet.
                </div>
              ) : (
                recentEnquiries.map((enq) => (
                  <div
                    key={enq.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-2 hover:bg-slate-50/60 transition-colors"
                  >
                    <div>
                      <p className="font-bold text-xs text-slate-900">{enq.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {enq.email} {enq.phone && `• ${enq.phone}`}
                      </p>
                      <p className="text-xs text-slate-700 mt-1 line-clamp-1">{enq.message}</p>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <Badge
                        variant={
                          enq.status === "new"
                            ? "default"
                            : enq.status === "resolved"
                            ? "success"
                            : "secondary"
                        }
                      >
                        {enq.status.replace("_", " ")}
                      </Badge>
                      <span className="text-[11px] text-slate-400 whitespace-nowrap">
                        {formatDate(enq.created_at)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

