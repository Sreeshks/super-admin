"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesApi } from "@/lib/api/categories";
import { uploadToImgBB } from "@/lib/api/imgbb";
import { mediaApi } from "@/lib/api/media";
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
import { Tags, PlusCircle, Edit2, Trash2, Upload } from "lucide-react";
import { formatDate, getMediaUrl } from "@/lib/utils";
import { toast } from "sonner";
import { CategoryCreate, ServiceCategory } from "@/types";

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ServiceCategory | null>(null);

  const [formData, setFormData] = useState<CategoryCreate>({
    name: "",
    slug: "",
    description: "",
    image: "",
    display_order: 1,
    is_active: true,
  });

  const [uploading, setUploading] = useState(false);

  const { data: categories, isLoading } = useQuery({
    queryKey: ["service-categories-list"],
    queryFn: () => categoriesApi.list(),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingCategory) {
        return categoriesApi.update(editingCategory.id, formData);
      } else {
        return categoriesApi.create(formData);
      }
    },
    onSuccess: () => {
      toast.success(editingCategory ? "Category updated successfully" : "New category added");
      setModalOpen(false);
      setEditingCategory(null);
      queryClient.invalidateQueries({ queryKey: ["service-categories-list"] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to save category";
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => {
      toast.success("Category deleted successfully");
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ["service-categories-list"] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Cannot delete category with associated services";
      toast.error(msg);
    },
  });

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      image: "",
      display_order: (categories?.length || 0) + 1,
      is_active: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (cat: ServiceCategory) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      image: cat.image || "",
      display_order: cat.display_order,
      is_active: cat.is_active ?? ((cat as any).status === "active"),
    });
    setModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const imgUrl = await uploadToImgBB(file);
      setFormData((prev) => ({ ...prev, image: imgUrl }));
      toast.success("Category image uploaded to ImgBB!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              Service Categories
            </h2>
            <p className="text-sm text-slate-500">
              Organize your service catalog into customer-facing departments (e.g. Hair Care, Facials).
            </p>
          </div>

          <Button size="md" onClick={openCreateModal} className="gap-2 shadow-sm">
            <PlusCircle className="w-4 h-4" />
            Add Category
          </Button>
        </div>

        <Card className="border-slate-200 shadow-xs overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : !categories || categories.length === 0 ? (
              <EmptyState
                icon={<Tags className="w-8 h-8" />}
                title="No Categories Configured"
                description="Create service departments to group your offerings."
                action={<Button onClick={openCreateModal}>Create Category</Button>}
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Display Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((cat) => (
                    <TableRow key={cat.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {cat.image ? (
                            <img
                              src={getMediaUrl(cat.image)}
                              alt={cat.name}
                              className="h-9 w-9 rounded-lg object-cover border"
                            />
                          ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs uppercase">
                              <Tags className="w-4 h-4" />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-xs text-slate-900">{cat.name}</p>
                            <p className="text-[11px] text-slate-400 truncate max-w-xs">
                              {cat.description || "-"}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="font-mono text-xs text-slate-500">
                        {cat.slug}
                      </TableCell>

                      <TableCell className="text-xs font-semibold text-slate-700">
                        #{cat.display_order}
                      </TableCell>

                      <TableCell>
                        <Badge variant={(cat.is_active ?? ((cat as any).status === "active")) ? "success" : "secondary"}>
                          {(cat.is_active ?? ((cat as any).status === "active")) ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-xs text-slate-500">
                        {formatDate(cat.created_at)}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditModal(cat)}
                            title="Edit"
                            className="h-8 w-8 text-slate-600 hover:text-emerald-700"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteTarget(cat)}
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
          title={editingCategory ? "Edit Category" : "Add Service Category"}
          description="Classification for your treatment and service offerings"
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
                {editingCategory ? "Save Category" : "Create Category"}
              </Button>
            </>
          }
        >
          <div className="space-y-4 py-2">
            <Input
              label="Category Name"
              placeholder="e.g. Hair Treatments"
              required
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            />

            <Input
              label="Custom Slug (Optional)"
              placeholder="e.g. hair-treatments"
              value={formData.slug || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Description
              </label>
              <textarea
                rows={2}
                placeholder="Description of treatments under this department..."
                className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                value={formData.description || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>

            {/* Image upload */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Department Image
              </label>
              <div className="flex items-center gap-3">
                {formData.image && (
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="h-12 w-12 rounded-lg object-cover border"
                  />
                )}
                <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 border rounded-lg text-xs font-semibold hover:bg-slate-50">
                  <Upload className="w-4 h-4 text-slate-500" />
                  {uploading ? "Uploading..." : "Upload Category Image"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                Active Category
              </label>
            </div>
          </div>
        </Dialog>

        {/* Delete Confirmation */}
        <Dialog
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          title="Delete Category"
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
          <p className="text-xs text-slate-600 py-2">
            Note: You cannot delete a category that still contains active services.
          </p>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

