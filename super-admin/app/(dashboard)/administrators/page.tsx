"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { administratorsApi, AdministratorListParams } from "@/lib/api/administrators";
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
import { Dialog } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Users2, Search, KeyRound, ShieldAlert, CheckCircle2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Administrator } from "@/types";

export default function AdministratorsPage() {
  const queryClient = useQueryClient();
  const [params, setParams] = useState<AdministratorListParams>({
    page: 1,
    page_size: 10,
    search: "",
  });

  const [passwordTarget, setPasswordTarget] = useState<Administrator | null>(null);
  const [newPassword, setNewPassword] = useState("Password@123");

  const { data: response, isLoading } = useQuery({
    queryKey: ["administrators-list", params],
    queryFn: () => administratorsApi.list(params),
  });

  // Status Mutation
  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      administratorsApi.updateStatus(id, isActive),
    onSuccess: () => {
      toast.success("Administrator active state updated");
      queryClient.invalidateQueries({ queryKey: ["administrators-list"] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to update status";
      toast.error(msg);
    },
  });

  // Password Reset Mutation
  const resetMutation = useMutation({
    mutationFn: () => {
      if (!passwordTarget) throw new Error("No target selected");
      return administratorsApi.resetPassword(passwordTarget.id, newPassword);
    },
    onSuccess: () => {
      toast.success(`Password reset for ${passwordTarget?.email}. Sessions invalidated.`);
      setPasswordTarget(null);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to reset password";
      toast.error(msg);
    },
  });

  const admins = response?.data || [];
  const pagination = response?.pagination;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              Platform Administrators
            </h2>
            <p className="text-sm text-slate-500">
              Oversee company admins, roles, account lockouts, and emergency credential resets.
            </p>
          </div>
        </div>

        {/* Filter / Search */}
        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search administrators by name or email..."
                value={params.search || ""}
                onChange={(e) =>
                  setParams((prev) => ({ ...prev, search: e.target.value, page: 1 }))
                }
                className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-slate-200 shadow-xs overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : admins.length === 0 ? (
              <EmptyState
                icon={<Users2 className="w-8 h-8" />}
                title="No Administrators Found"
                description="No users matched your search criteria."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Administrator</TableHead>
                    <TableHead>Company Tenant</TableHead>
                    <TableHead>Assigned Roles</TableHead>
                    <TableHead>Account Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-700 font-bold text-xs uppercase">
                            {admin.full_name?.charAt(0) || "U"}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-slate-900">{admin.full_name}</p>
                            <p className="text-xs text-slate-400">{admin.email}</p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="text-xs font-semibold text-slate-700">
                        {admin.company_name ? (
                          <span>{admin.company_name}</span>
                        ) : (
                          <span className="text-slate-400 italic">Platform (Super Admin)</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {admin.roles.map((r) => (
                            <Badge
                              key={r}
                              variant={r.includes("SUPER") ? "destructive" : "default"}
                            >
                              {r}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>

                      <TableCell>
                        <button
                          onClick={() =>
                            statusMutation.mutate({ id: admin.id, isActive: !admin.is_active })
                          }
                          className="cursor-pointer"
                        >
                          <Badge variant={admin.is_active ? "success" : "secondary"}>
                            {admin.is_active ? "Active" : "Deactivated"}
                          </Badge>
                        </button>
                      </TableCell>

                      <TableCell className="text-xs text-slate-500">
                        {formatDate(admin.created_at)}
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setPasswordTarget(admin);
                            setNewPassword("Password@123");
                          }}
                          className="text-xs gap-1.5"
                        >
                          <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                          Reset Password
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

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

        {/* Reset Password Modal */}
        <Dialog
          open={!!passwordTarget}
          onOpenChange={(open) => !open && setPasswordTarget(null)}
          title="Force Reset Administrator Password"
          description={`Issue a new temporary master password for ${passwordTarget?.email}`}
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setPasswordTarget(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                isLoading={resetMutation.isPending}
                onClick={() => resetMutation.mutate()}
              >
                Apply New Password
              </Button>
            </>
          }
        >
          <div className="space-y-4 py-2">
            <Input
              label="New Temporary Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              helperText="Minimum 8 characters. All existing active JWT sessions for this administrator will be revoked immediately."
            />

            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              The administrator will be forced to log in with this new password.
            </div>
          </div>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

