"use client";

import React from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HardDrive, Image as ImageIcon, Cloud, Server, ShieldCheck } from "lucide-react";

export default function MediaOverviewPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            Global Media & Storage Overview
          </h2>
          <p className="text-sm text-slate-500">
            Tenant media consumption, S3 storage distribution, and bandwidth monitoring.
          </p>
        </div>

        {/* Storage KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-slate-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase">
                  Storage Consumed
                </span>
                <HardDrive className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-3xl font-extrabold text-slate-900 mt-2">128.4 MB</p>
              <p className="text-xs text-slate-500 mt-1">Across all tenant uploads</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase">
                  Total Objects
                </span>
                <ImageIcon className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-3xl font-extrabold text-slate-900 mt-2">482 Files</p>
              <p className="text-xs text-slate-500 mt-1">Images, logos & banners</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase">
                  Storage Provider
                </span>
                <Cloud className="w-5 h-5 text-indigo-600" />
              </div>
              <p className="text-3xl font-extrabold text-indigo-600 mt-2">S3 / MinIO</p>
              <p className="text-xs text-slate-500 mt-1">Encrypted tenant paths</p>
            </CardContent>
          </Card>
        </div>

        {/* Security / Path isolation card */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base">Tenant Path Isolation Architecture</CardTitle>
            <CardDescription>Zero cross-tenant media access</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-slate-600 leading-relaxed">
              Every uploaded image, banner, or logo is stored with a tenant prefix in the object store:
            </p>
            <div className="p-3 bg-slate-900 text-slate-200 rounded-lg font-mono text-xs">
              s3://nofa-saas-media/tenants/&#123;tenant_id&#125;/banners/hero_banner.webp
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              Uploads are automatically validated with MIME type sniffing, resized with Pillow, and
              converted to optimized WebP.
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

