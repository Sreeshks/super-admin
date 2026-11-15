"use client";

import React, { useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Monitor,
  Tablet,
  Smartphone,
  ExternalLink,
  RotateCcw,
  Globe,
} from "lucide-react";

export default function WebsitePreviewPage() {
  const { profile } = useAuth();
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [key, setKey] = useState(0);

  const websiteUrl = profile?.slug
    ? `http://localhost:8000/api/v1/websites/${profile.slug}`
    : "";

  const deviceWidths = {
    desktop: "w-full max-w-5xl",
    tablet: "w-[768px]",
    mobile: "w-[390px]",
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              Live Storefront Preview
            </h2>
            <p className="text-sm text-slate-500">
              Preview your public website across desktop, tablet, and mobile viewport dimensions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Viewport switchers */}
            <div className="flex items-center rounded-lg border border-slate-200 bg-white p-1">
              <button
                onClick={() => setDevice("desktop")}
                className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors ${
                  device === "desktop"
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="Desktop View"
              >
                <Monitor className="w-4 h-4" />
                <span className="hidden sm:inline">Desktop</span>
              </button>
              <button
                onClick={() => setDevice("tablet")}
                className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors ${
                  device === "tablet"
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="Tablet View"
              >
                <Tablet className="w-4 h-4" />
                <span className="hidden sm:inline">Tablet</span>
              </button>
              <button
                onClick={() => setDevice("mobile")}
                className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors ${
                  device === "mobile"
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="Mobile View"
              >
                <Smartphone className="w-4 h-4" />
                <span className="hidden sm:inline">Mobile</span>
              </button>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setKey((prev) => prev + 1)}
              title="Reload Frame"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>

            <a href={websiteUrl} target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="gap-1.5">
                <ExternalLink className="w-3.5 h-3.5" />
                Open External
              </Button>
            </a>
          </div>
        </div>

        {/* Viewport Wrapper */}
        <div className="flex justify-center p-4 bg-slate-200/60 rounded-2xl border border-slate-300 min-h-[700px] overflow-x-auto">
          <div
            className={`transition-all duration-300 bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-300 flex flex-col ${deviceWidths[device]}`}
          >
            {/* Mock browser top bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-slate-100 border-b border-slate-200">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              <div className="flex-1 max-w-sm mx-4">
                <div className="flex items-center justify-center gap-1.5 py-1 px-3 bg-white rounded-md border text-[11px] font-mono text-slate-500 truncate">
                  <Globe className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span className="truncate">
                    {profile?.slug ? `https://yourdomain.com/websites/${profile.slug}` : "..."}
                  </span>
                </div>
              </div>
              <div className="w-10" />
            </div>

            {/* Iframe */}
            {websiteUrl ? (
              <iframe
                key={key}
                src={websiteUrl}
                title="Storefront Preview"
                className="w-full flex-1 min-h-[640px] border-0 bg-white"
              />
            ) : (
              <div className="flex h-96 items-center justify-center text-xs text-slate-500">
                Website slug not loaded.
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

