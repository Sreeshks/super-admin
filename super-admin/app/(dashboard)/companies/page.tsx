"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { companiesApi, CompanyListParams } from "@/lib/api/companies";
import { businessTypesApi } from "@/lib/api/business-types";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog } from "@/components/ui/dialog";
import {
  Building2,
  PlusCircle,
  Search,
  Filter,
  Eye,
  Trash2,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Company } from "@/types";

export default function CompaniesPage() {
  const queryClient = useQueryClient();
  const [params, setParams] = useState<CompanyListParams>({
    page: 1,
    page_size: 10,
    search: undefined,
    business_type_id: undefined,
    status: undefined,
  });

  const [deleteTarget, setDeleteTarget] = useState<Company | null>(null);

  // Fetch Business Types for filter dropdown
  const { data: businessTypes } = useQuery({
    queryKey: ["business-types-list"],
    queryFn: () => businessTypesApi.list(),
  });

  // Fetch Companies
  const { data: response, isLoading, refetch } = useQuery({
    queryKey: ["companies-list", params],
    queryFn: () => companiesApi.list(params),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => companiesApi.delete(id),
    onSuccess: () => {
      toast.success("Company archived and soft-deleted successfully");
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ["companies-list"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to delete company";
      toast.error(msg);
    },
  });

  // Status toggle mutation
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      companiesApi.updateStatus(id, { account_status: status }),
    onSuccess: () => {
      toast.success("Company account status updated");
      queryClient.invalidateQueries({ queryKey: ["companies-list"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to update status";
      toast.error(msg);
    },
  });

  const companies = response?.data || [];
  const pagination = response?.pagination;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              Company Management
            </h2>
            <p className="text-sm text-slate-500">
              Manage all client businesses, website access, and tenant isolation states.
            </p>
          </div>
          <Link href="/companies/create">
            <Button size="md" className="gap-2 shadow-sm">
              <PlusCircle className="w-4 h-4" />
              Create New Company
            </Button>
          </Link>
        </div>

        {/* Filters and Search Bar */}
        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by company name or slug..."
                  value={params.search || ""}
                  onChange={(e) =>
                    setParams((prev) => ({ ...prev, search: e.target.value, page: 1 }))
                  }
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Business Type Filter */}
              <div className="w-full md:w-56">
                <select
                  value={params.business_type_id || ""}
                  onChange={(e) =>
                    setParams((prev) => ({
                      ...prev,
                      business_type_id: e.target.value || undefined,
                      page: 1,
                    }))
                  }
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">All Business Types</option>
                  {businessTypes?.map((bt) => (
                    <option key={bt.id} value={bt.id}>
                      {bt.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="w-full md:w-44">
                <select
                  value={params.status || ""}
                  onChange={(e) =>
                    setParams((prev) => ({
                      ...prev,
                      status: e.target.value || undefined,
                      page: 1,
                    }))
                  }
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="trial">Trial</option>
                </select>
              </div>

              {/* Refresh button */}
              <Button
                variant="outline"
                size="md"
                onClick={() => refetch()}
                title="Refresh Table"
                className="w-full md:w-auto"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card className="border-slate-200 shadow-xs overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : companies.length === 0 ? (
              <EmptyState
                icon={<Building2 className="w-8 h-8" />}
                title="No Companies Found"
                description="No businesses match your active filter criteria. Try adjusting your search query."
                action={
                  <Link href="/companies/create">
                    <Button size="sm">Register First Company</Button>
                  </Link>
                }
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Sector / Type</TableHead>
                    <TableHead>Website Status</TableHead>
                    <TableHead>Account Status</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map((c) => (
                    <TableRow key={c.id}>
                      {/* Name & Slug */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 font-bold text-sm">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <Link
                              href={`/companies/${c.id}`}
                              className="font-bold text-sm text-slate-900 hover:text-blue-600 hover:underline"
                            >
                              {c.name}
                            </Link>
                            <p className="text-xs text-slate-400 font-mono">/{c.slug}</p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Business Type */}
                      <TableCell>
                        <span className="inline-flex items-center text-xs font-semibold text-slate-700">
                          {c.business_type?.name || "General"}
                        </span>
                      </TableCell>

                      {/* Website Status */}
                      <TableCell>
                        <Badge
                          variant={
                            c.website_status === "active"
                              ? "success"
                              : c.website_status === "maintenance"
                              ? "warning"
                              : "destructive"
                          }
                        >
                          {c.website_status}
                        </Badge>
                      </TableCell>

                      {/* Account Status with Toggle */}
                      <TableCell>
                        <select
                          value={c.account_status}
                          onChange={(e) =>
                            statusMutation.mutate({ id: c.id, status: e.target.value })
                          }
                          className="h-8 rounded-md border border-slate-200 bg-slate-50 px-2 text-xs font-semibold text-slate-700 focus:outline-none"
                        >
                          <option value="active">Active</option>
                          <option value="suspended">Suspended</option>
                          <option value="trial">Trial</option>
                        </select>
                      </TableCell>

                      {/* Created At */}
                      <TableCell className="text-xs text-slate-500">
                        {formatDate(c.created_at)}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/companies/${c.id}`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="View details"
                              className="h-8 w-8 text-slate-600 hover:text-blue-600"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteTarget(c)}
                            title="Soft delete / archive"
                            className="h-8 w-8 text-slate-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {/* Pagination Controls */}
            {pagination && (
              <div className="border-t border-slate-100 px-4">
                <Pagination
                  meta={pagination}
                  onPageChange={(page) => setParams((prev) => ({ ...prev, page }))}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Modal */}
        <Dialog
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          title="Archive Company Tenant"
          description={`Are you sure you want to archive "${deleteTarget?.name}"?`}
          footer={
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                isLoading={deleteMutation.isPending}
                onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              >
                Confirm Soft Delete
              </Button>
            </>
          }
        >
          <div className="space-y-3 py-2 text-sm text-slate-600">
            <p>
              This action will mark the tenant as soft-deleted and disable its public website and
              administrator logins.
            </p>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              Tenant data records will be preserved in database storage according to platform compliance rules.
            </div>
          </div>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

