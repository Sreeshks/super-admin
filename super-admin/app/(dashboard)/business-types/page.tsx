"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Dialog } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Tags, PlusCircle, Edit2, Trash2, AlertCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { BusinessType, BusinessTypeCreate, BusinessTypeUpdate } from "@/types";

export default function BusinessTypesPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<BusinessType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BusinessType | null>(null);

  const [formData, setFormData] = useState<BusinessTypeCreate>({
    name: "",
    slug: "",
    description: "",
    status: "active",
  });

  // Fetch Business Types
  const { data: types, isLoading } = useQuery({
    queryKey: ["business-types-list"],
    queryFn: () => businessTypesApi.list(),
  });

  // Create / Update Mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingType) {
        return businessTypesApi.update(editingType.id, formData);
      } else {
        return businessTypesApi.create(formData);
      }
    },
    onSuccess: () => {
      toast.success(
        editingType ? "Business type updated successfully" : "New business type registered"
      );
      setModalOpen(false);
      setEditingType(null);
      queryClient.invalidateQueries({ queryKey: ["business-types-list"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to save business type";
      toast.error(msg);
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => businessTypesApi.delete(id),
    onSuccess: () => {
      toast.success("Business type removed successfully");
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ["business-types-list"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to delete business type";
      toast.error(msg);
    },
  });

  const openCreateModal = () => {
    setEditingType(null);
    setFormData({ name: "", slug: "", description: "", status: "active" });
    setModalOpen(true);
  };

  const openEditModal = (item: BusinessType) => {
    setEditingType(item);
    setFormData({
      name: item.name,
      slug: item.slug,
      description: item.description || "",
      status: item.status,
    });
    setModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              Business Types
            </h2>
            <p className="text-sm text-slate-500">
              Configure industry sectors, default website templates, and recommended categories.
            </p>
          </div>
          <Button size="md" onClick={openCreateModal} className="gap-2 shadow-sm">
            <PlusCircle className="w-4 h-4" />
            Add Business Type
          </Button>
        </div>

        {/* Table Card */}
        <Card className="border-slate-200 shadow-xs overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : !types || types.length === 0 ? (
              <EmptyState
                icon={<Tags className="w-8 h-8" />}
                title="No Business Types Configured"
                description="Get started by creating your first business sector (e.g. Salon, Spa, Hair Studio)."
                action={<Button onClick={openCreateModal}>Create Business Type</Button>}
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sector Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {types.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-bold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs">
                            <Tags className="w-4 h-4" />
                          </div>
                          <span>{item.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-blue-600">
                        {item.slug}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 max-w-xs truncate">
                        {item.description || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.status === "active" ? "success" : "secondary"}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">
                        {formatDate(item.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditModal(item)}
                            title="Edit"
                            className="h-8 w-8 text-slate-600 hover:text-blue-600"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteTarget(item)}
                            title="Delete"
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
          </CardContent>
        </Card>

        {/* Create/Edit Modal */}
        <Dialog
          open={modalOpen}
          onOpenChange={setModalOpen}
          title={editingType ? "Edit Business Type" : "Create Business Type"}
          description="Define the industry classification and defaults."
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                isLoading={saveMutation.isPending}
                onClick={() => saveMutation.mutate()}
              >
                {editingType ? "Save Changes" : "Create Type"}
              </Button>
            </>
          }
        >
          <div className="space-y-4 py-2">
            <Input
              label="Business Type Name"
              placeholder="e.g. Wellness Centre"
              required
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            />

            <Input
              label="Custom Slug (Optional)"
              placeholder="e.g. wellness-centre"
              value={formData.slug || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Description
              </label>
              <textarea
                rows={3}
                placeholder="Description of businesses in this category..."
                className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                value={formData.description || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: e.target.value as "active" | "inactive",
                  }))
                }
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 focus:outline-none"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </Dialog>

        {/* Delete Confirmation */}
        <Dialog
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          title="Delete Business Type"
          description={`Delete "${deleteTarget?.name}"?`}
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                isLoading={deleteMutation.isPending}
                onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              >
                Delete
              </Button>
            </>
          }
        >
          <div className="space-y-2 py-2 text-sm text-slate-600">
            <p>
              Business types currently assigned to existing companies cannot be deleted. Ensure no
              active companies use this business type first.
            </p>
          </div>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

