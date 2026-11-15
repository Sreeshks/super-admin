"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { companiesApi } from "@/lib/api/companies";
import { businessTypesApi } from "@/lib/api/business-types";
import { subscriptionsApi } from "@/lib/api/subscriptions";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2,
  ArrowLeft,
  Globe,
  CreditCard,
  Users2,
  Settings,
  HardDrive,
  ShieldCheck,
  ExternalLink,
  Save,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { CompanyUpdatePayload } from "@/types";

const TABS = [
  { id: "overview", label: "Overview", icon: Building2 },
  { id: "info", label: "Business Info", icon: Settings },
  { id: "subscription", label: "Subscription", icon: CreditCard },
  { id: "domains", label: "Custom Domains", icon: Globe },
  { id: "usage", label: "Storage & Limits", icon: HardDrive },
];

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const companyId = params?.id as string;

  const [activeTab, setActiveTab] = useState("overview");

  // Fetch Company Details
  const { data: company, isLoading, error } = useQuery({
    queryKey: ["company-detail", companyId],
    queryFn: () => companiesApi.getById(companyId),
    enabled: !!companyId,
  });

  // Business Types
  const { data: businessTypes } = useQuery({
    queryKey: ["business-types-list"],
    queryFn: () => businessTypesApi.list(),
  });

  // Plans
  const { data: plans } = useQuery({
    queryKey: ["subscription-plans-list"],
    queryFn: () => subscriptionsApi.listPlans(),
  });

  // Edit State
  const [editData, setEditData] = useState<CompanyUpdatePayload>({
    name: "",
    slug: "",
    website_status: "active",
    account_status: "active",
  });

  React.useEffect(() => {
    if (company) {
      setEditData({
        name: company.name,
        slug: company.slug,
        website_status: company.website_status,
        account_status: company.account_status,
        business_type_id: company.business_type_id,
      });
    }
  }, [company]);

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: (payload: CompanyUpdatePayload) => companiesApi.update(companyId, payload),
    onSuccess: (updated) => {
      toast.success("Company profile saved successfully");
      queryClient.setQueryData(["company-detail", companyId], updated);
      queryClient.invalidateQueries({ queryKey: ["companies-list"] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to update company";
      toast.error(msg);
    },
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !company) {
    return (
      <DashboardLayout>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
          <AlertCircle className="mx-auto w-8 h-8 mb-2" />
          <h3 className="font-bold">Failed to load company details</h3>
          <p className="text-xs mt-1">The requested company may have been deleted or does not exist.</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push("/companies")}>
            Back to Companies
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Back Link & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push("/companies")}
              className="h-9 w-9 shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-slate-900">{company.name}</h2>
                <Badge
                  variant={
                    company.account_status === "active"
                      ? "success"
                      : company.account_status === "trial"
                      ? "warning"
                      : "destructive"
                  }
                >
                  {company.account_status}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Tenant ID: {company.id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`http://localhost:8000/api/v1/websites/${company.slug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm" className="gap-1.5">
                <Globe className="w-4 h-4 text-blue-600" />
                Live Website
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </Button>
            </a>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 gap-1 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 border-slate-200">
              <CardHeader>
                <CardTitle className="text-base">Tenant Highlights</CardTitle>
                <CardDescription>Multi-tenant isolated company configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-xs text-slate-500 uppercase font-semibold">
                      Business Sector
                    </span>
                    <p className="font-bold text-slate-900 mt-0.5">
                      {company.business_type?.name || "General"}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-xs text-slate-500 uppercase font-semibold">
                      Website Status
                    </span>
                    <p className="font-bold text-slate-900 mt-0.5 capitalize">
                      {company.website_status}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-xs text-slate-500 uppercase font-semibold">
                      Registered On
                    </span>
                    <p className="font-bold text-slate-900 mt-0.5">
                      {formatDate(company.created_at)}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-xs text-slate-500 uppercase font-semibold">
                      Last Updated
                    </span>
                    <p className="font-bold text-slate-900 mt-0.5">
                      {formatDate(company.updated_at)}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
                  <div>
                    <p className="font-bold">PostgreSQL Row-Level Security Isolation</p>
                    <p className="text-[11px] text-blue-700 mt-0.5">
                      All services, categories, offers, banners, media, and customer enquiries are
                      strictly bound to tenant ID <code>{company.id}</code>.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-base">Website Endpoint</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <span className="text-xs text-slate-500 font-semibold">Public Subpath</span>
                  <div className="p-2 bg-slate-100 rounded-lg text-xs font-mono text-slate-800 break-all">
                    /websites/{company.slug}
                  </div>
                </div>
                <div className="pt-2">
                  <a
                    href={`http://localhost:8000/api/v1/websites/${company.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700"
                  >
                    Open Live JSON View
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 2: BUSINESS INFO (EDITABLE) */}
        {activeTab === "info" && (
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-base">Edit Company Details</CardTitle>
              <CardDescription>Update tenant parameters and public visibility</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Company Name"
                  value={editData.name || ""}
                  onChange={(e) => setEditData((prev) => ({ ...prev, name: e.target.value }))}
                />

                <Input
                  label="Website Slug"
                  value={editData.slug || ""}
                  onChange={(e) => setEditData((prev) => ({ ...prev, slug: e.target.value }))}
                />

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Business Sector / Type
                  </label>
                  <select
                    value={editData.business_type_id || ""}
                    onChange={(e) =>
                      setEditData((prev) => ({ ...prev, business_type_id: e.target.value }))
                    }
                    className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 focus:outline-none"
                  >
                    {businessTypes?.map((bt) => (
                      <option key={bt.id} value={bt.id}>
                        {bt.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Website Status
                  </label>
                  <select
                    value={editData.website_status || "active"}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        website_status: e.target.value as "active" | "maintenance" | "disabled",
                      }))
                    }
                    className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Account Status
                  </label>
                  <select
                    value={editData.account_status || "active"}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        account_status: e.target.value as "active" | "suspended" | "trial",
                      }))
                    }
                    className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="trial">Trial</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-3 border-t p-4">
              <Button
                isLoading={updateMutation.isPending}
                onClick={() => updateMutation.mutate(editData)}
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* TAB 3: SUBSCRIPTION */}
        {activeTab === "subscription" && (
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-base">Subscription & Feature Entitlements</CardTitle>
              <CardDescription>Managed tier limits and quota enforcement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {plans?.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2"
                  >
                    <span className="font-bold text-sm text-slate-900">{p.name}</span>
                    <p className="text-xl font-extrabold text-blue-600">
                      ₹{p.price} <span className="text-xs text-slate-500 font-normal">/{p.billing_cycle}</span>
                    </p>
                    <ul className="text-xs text-slate-600 space-y-1 pt-2 border-t">
                      <li>Max Services: {p.max_services}</li>
                      <li>Max Locations: {p.max_locations}</li>
                      <li>Storage: {p.max_storage_mb} MB</li>
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* TAB 4: DOMAINS */}
        {activeTab === "domains" && (
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-base">Custom Domains</CardTitle>
              <CardDescription>Branded domains configured for this company</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center border border-dashed rounded-xl border-slate-200">
                <Globe className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-800">Custom Domain Status</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Tenant is currently operating under the primary platform routing: <code>/{company.slug}</code>.
                  Custom domain mapping can be configured in the Custom Domains module.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* TAB 5: USAGE */}
        {activeTab === "usage" && (
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-base">Resource Usage & Quotas</CardTitle>
              <CardDescription>Entitlement tracking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span>Storage Quota</span>
                  <span>14.5 MB / 500 MB</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: "3%" }} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

