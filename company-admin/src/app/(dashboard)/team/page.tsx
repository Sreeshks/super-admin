"use client";

import React from "react";
import { useAuth } from "@/providers/auth-provider";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, ShieldCheck, UserCheck, KeyRound } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function TeamPage() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="max-w-4xl space-y-6">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            Team Members & Access Roles
          </h2>
          <p className="text-sm text-slate-500">
            Administrators and content staff authorized to manage this company website.
          </p>
        </div>

        {/* Current User Card */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base font-bold">Active Administrator Session</CardTitle>
            <CardDescription>Your current authenticated credentials</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-lg uppercase shadow-xs">
                {user?.full_name?.charAt(0) || "U"}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-900">{user?.full_name}</h3>
                  <Badge variant="success">Active Session</Badge>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {user?.roles?.map((r) => (
                    <Badge key={r.id} variant="default">
                      {r.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              Tenant Context: Strictly restricted to your business workspace. Cross-tenant queries are blocked by PostgreSQL Row-Level Security.
            </div>
          </CardContent>
        </Card>

        {/* Roles Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                Company Admin Role
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-600 space-y-1.5">
              <p>• Full website storefront control</p>
              <p>• Manage services, offers, categories, and banners</p>
              <p>• Respond to customer inquiries</p>
              <p>• Update business profile, address, and social links</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-blue-600" />
                Content Manager Role
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-600 space-y-1.5">
              <p>• Publish blogs and testimonials</p>
              <p>• Upload photos to gallery and media library</p>
              <p>• Update FAQs and social media highlights</p>
              <p>• Cannot alter business profile or security settings</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

