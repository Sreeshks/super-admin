"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Globe,
  Sliders,
  ImageIcon,
  Share2,
  Eye,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  LayoutTemplate,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function WebsiteOverviewPage() {
  const { profile } = useAuth();

  const publicWebsiteUrl = profile?.slug
    ? `http://localhost:8000/api/v1/websites/${profile.slug}`
    : "#";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              Website Overview
            </h2>
            <p className="text-sm text-slate-500">
              Central control for your business storefront, public branding, and section displays.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/website/preview">
              <Button variant="outline" size="md" className="gap-2">
                <Eye className="w-4 h-4 text-emerald-600" />
                Live Preview
              </Button>
            </Link>
            <a href={publicWebsiteUrl} target="_blank" rel="noopener noreferrer">
              <Button size="md" className="gap-2 shadow-sm">
                <Globe className="w-4 h-4" />
                Open Website
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </a>
          </div>
        </div>

        {/* Storefront Status Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 border-slate-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold">Public Storefront Information</CardTitle>
                <Badge
                  variant={
                    profile?.website_status === "active"
                      ? "success"
                      : profile?.website_status === "maintenance"
                      ? "warning"
                      : "destructive"
                  }
                >
                  {profile?.website_status || "Active"}
                </Badge>
              </div>
              <CardDescription>
                Public domain routing and website deployment details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="font-bold text-slate-400 uppercase">Platform Subpath</span>
                  <p className="font-mono font-bold text-emerald-700 text-sm mt-1">
                    /websites/{profile?.slug}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="font-bold text-slate-400 uppercase">Storefront Template</span>
                  <p className="font-bold text-slate-800 text-sm mt-1">
                    Luxury Chic Responsive
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="font-bold text-slate-400 uppercase">Registered Date</span>
                  <p className="font-bold text-slate-800 text-sm mt-1">
                    {formatDate(profile?.created_at)}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="font-bold text-slate-400 uppercase">Last Updated</span>
                  <p className="font-bold text-slate-800 text-sm mt-1">
                    {formatDate(profile?.updated_at)}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  All website data is automatically served through your isolated tenant context. Any content
                  changes published here take effect immediately on your public website.
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Shortcuts */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-base font-bold">Storefront Sections</CardTitle>
              <CardDescription>Direct navigation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <Link
                href="/website/sections"
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-600" />
                  <span>Section Visibility & Order</span>
                </div>
                <span>→</span>
              </Link>

              <Link
                href="/banners"
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-emerald-600" />
                  <span>Hero Banners</span>
                </div>
                <span>→</span>
              </Link>

              <Link
                href="/gallery"
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-emerald-600" />
                  <span>Media & Photo Gallery</span>
                </div>
                <span>→</span>
              </Link>

              <Link
                href="/social-media"
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-emerald-600" />
                  <span>Social Links & Instagram</span>
                </div>
                <span>→</span>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

