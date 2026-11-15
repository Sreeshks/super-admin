"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api/dashboard";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2,
  CheckCircle2,
  XCircle,
  Tags,
  Users2,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  Activity,
  Layers,
  Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { formatDate } from "@/lib/utils";

const COLORS = ["#2563EB", "#7C3AED", "#059669", "#D97706", "#DC2626", "#0891B2"];

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => dashboardApi.getStats(),
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ["dashboard-activities"],
    queryFn: () => dashboardApi.getRecentActivity(8),
  });

  // Prepare chart data from companies_by_business_type dict
  const chartData = React.useMemo(() => {
    if (!stats?.companies_by_business_type) return [];
    return Object.entries(stats.companies_by_business_type).map(([name, count]) => ({
      name,
      count,
    }));
  }, [stats]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header with Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              Platform Overview
            </h2>
            <p className="text-sm text-slate-500">
              Real-time monitoring across all hosted tenant businesses and infrastructure.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Link href="/companies/create">
              <Button size="md" className="gap-2 shadow-sm">
                <PlusCircle className="w-4 h-4" />
                Register Company
              </Button>
            </Link>
            <Link href="/business-types">
              <Button variant="outline" size="md">
                Configure Types
              </Button>
            </Link>
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Companies */}
          <Card className="border-slate-200 shadow-xs">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Total Companies
                </p>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Building2 className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                {statsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <h3 className="text-3xl font-extrabold text-slate-900">
                    {stats?.total_companies ?? 0}
                  </h3>
                )}
                <p className="mt-1 text-xs text-slate-500 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                  Multi-tenant ecosystem
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Active Companies */}
          <Card className="border-slate-200 shadow-xs">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Active Companies
                </p>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                {statsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <h3 className="text-3xl font-extrabold text-emerald-600">
                    {stats?.active_companies ?? 0}
                  </h3>
                )}
                <p className="mt-1 text-xs text-emerald-700 font-medium">
                  Operational websites
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Business Types */}
          <Card className="border-slate-200 shadow-xs">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Business Types
                </p>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <Tags className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                {statsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <h3 className="text-3xl font-extrabold text-indigo-600">
                    {stats?.total_business_types ?? 0}
                  </h3>
                )}
                <p className="mt-1 text-xs text-slate-500">Configured sectors</p>
              </div>
            </CardContent>
          </Card>

          {/* Administrators */}
          <Card className="border-slate-200 shadow-xs">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Administrators
                </p>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                  <Users2 className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                {statsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <h3 className="text-3xl font-extrabold text-violet-600">
                    {stats?.total_administrators ?? 0}
                  </h3>
                )}
                <p className="mt-1 text-xs text-slate-500">Privileged users</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts & Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Companies by Business Type Chart */}
          <Card className="lg:col-span-2 border-slate-200 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base font-bold">Companies by Business Sector</CardTitle>
                <CardDescription>Live breakdown across registered business categories</CardDescription>
              </div>
              <Layers className="w-5 h-5 text-slate-400" />
            </CardHeader>
            <CardContent className="pt-4">
              {statsLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <Skeleton className="h-full w-full" />
                </div>
              ) : chartData.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6">
                  <Tags className="w-10 h-10 text-slate-300 mb-2" />
                  <p className="text-sm font-semibold text-slate-700">No company data yet</p>
                  <p className="text-xs text-slate-500">
                    Register businesses to visualize category distributions.
                  </p>
                </div>
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
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
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats & Health */}
          <Card className="border-slate-200 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Platform Status</CardTitle>
              <CardDescription>Key tenancy metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-xs font-semibold text-slate-600">Platform Isolation</span>
                <Badge variant="success">Row-Level RLS Active</Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-xs font-semibold text-slate-600">Active Tenant Ratio</span>
                <span className="text-sm font-bold text-slate-900">
                  {stats && stats.total_companies > 0
                    ? `${Math.round((stats.active_companies / stats.total_companies) * 100)}%`
                    : "100%"}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-xs font-semibold text-slate-600">Inactive / Suspended</span>
                <span className="text-sm font-bold text-amber-600">
                  {stats?.inactive_companies ?? 0}
                </span>
              </div>

              <div className="pt-2">
                <Link href="/companies">
                  <Button variant="outline" className="w-full text-xs gap-1.5">
                    Browse All Companies
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Registrations & Activities Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Companies */}
          <Card className="border-slate-200 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold">Recent Company Registrations</CardTitle>
                <CardDescription>Newly onboarded client businesses</CardDescription>
              </div>
              <Link href="/companies" className="text-xs font-semibold text-blue-600 hover:underline">
                View all
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {statsLoading ? (
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : !stats?.recently_registered_companies ||
                  stats.recently_registered_companies.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    No registered companies yet.
                  </div>
                ) : (
                  stats.recently_registered_companies.map((company) => (
                    <div
                      key={company.id}
                      className="flex items-center justify-between p-4 hover:bg-slate-50/60 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-700 font-bold text-xs uppercase">
                          {company.name.charAt(0)}
                        </div>
                        <div>
                          <Link
                            href={`/companies/${company.id}`}
                            className="font-bold text-xs text-slate-900 hover:text-blue-600"
                          >
                            {company.name}
                          </Link>
                          <p className="text-[11px] text-slate-500">{company.slug}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
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
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Platform Activity */}
          <Card className="border-slate-200 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold">Platform Activity Logs</CardTitle>
                <CardDescription>Security & audit action timeline</CardDescription>
              </div>
              <Link href="/activity-logs" className="text-xs font-semibold text-blue-600 hover:underline">
                View all
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 max-h-[340px] overflow-y-auto">
                {activitiesLoading ? (
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ) : !activities || activities.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    No recent activities recorded.
                  </div>
                ) : (
                  activities.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 p-3.5 text-xs">
                      <div className="flex h-6 w-6 mt-0.5 items-center justify-center rounded-full bg-slate-100 text-slate-600 shrink-0">
                        <Activity className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800">
                          {log.action}{" "}
                          <span className="text-slate-500 font-normal">on {log.entity_name}</span>
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {formatDate(log.created_at)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

