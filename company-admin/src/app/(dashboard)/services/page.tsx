"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { servicesApi, ServiceListParams } from "@/lib/api/services";
import { categoriesApi } from "@/lib/api/categories";
import { profileApi } from "@/lib/api/profile";
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
import { Pagination } from "@/components/ui/pagination";
import { Dialog } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Scissors,
  PlusCircle,
  Search,
  RotateCcw,
  Edit2,
  Trash2,
  Upload,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Service, ServiceCreate, ServiceUpdate } from "@/types";

export default function ServicesPage() {
  const queryClient = useQueryClient();
  const [params, setParams] = useState<ServiceListParams>({
    page: 1,
    page_size: 10,
    search: undefined,
    category_id: undefined,
    status: undefined,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);

  // Form State
  const [formData, setFormData] = useState<ServiceCreate>({
    category_id: "",
    name: "",
    slug: "",
    description: "",
    image: "",
    duration_minutes: 45,
    price: 500,
    offer_price: undefined,
    is_featured: false,
    is_active: true,
    display_order: 1,
  });

  const [uploadingImage, setUploadingImage] = useState(false);

  // Profile query (for company currency)
  const { data: profile } = useQuery({
    queryKey: ["company-profile"],
    queryFn: () => profileApi.getProfile(),
  });

  // Categories query
  const { data: categories } = useQuery({
    queryKey: ["service-categories-list"],
    queryFn: () => categoriesApi.list(),
  });

  // Services query
  const { data: response, isLoading, refetch } = useQuery({
    queryKey: ["services-list", params],
    queryFn: () => servicesApi.list(params),
  });

  // Save Mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingService) {
        return servicesApi.update(editingService.id, formData);
      } else {
        return servicesApi.create(formData);
      }
    },
    onSuccess: () => {
      toast.success(editingService ? "Service updated successfully" : "New service created");
      setModalOpen(false);
      setEditingService(null);
      queryClient.invalidateQueries({ queryKey: ["services-list"] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to save service";
      toast.error(msg);
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => servicesApi.delete(id),
    onSuccess: () => {
      toast.success("Service deleted successfully");
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ["services-list"] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to delete service";
      toast.error(msg);
    },
  });

  const openCreateModal = () => {
    setEditingService(null);
    setFormData({
      category_id: categories?.[0]?.id || "",
      name: "",
      slug: "",
      description: "",
      image: "",
      duration_minutes: 45,
      price: 500,
      offer_price: undefined,
      is_featured: false,
      is_active: true,
      display_order: 1,
    });
    setModalOpen(true);
  };

  const openEditModal = (s: Service) => {
    setEditingService(s);
    setFormData({
      category_id: s.category_id,
      name: s.name,
      slug: s.slug,
      description: s.description || (s as any).short_description || "",
      image: s.image || (s as any).featured_image || "",
      duration_minutes: s.duration_minutes || 45,
      price: s.price ?? (s as any).regular_price ?? 0,
      offer_price: (s.offer_price ?? (s as any).discounted_price) ?? undefined,
      is_featured: s.is_featured,
      is_active: s.is_active ?? ((s as any).status === "active"),
      display_order: s.display_order || 1,
    });
    setModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const res = await mediaApi.upload(file, "services");
      setFormData((prev) => ({ ...prev, image: res.file_url }));
      toast.success("Service image uploaded successfully!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Image upload failed";
      toast.error(msg);
    } finally {
      setUploadingImage(false);
    }
  };

  const services = response?.data || [];
  const pagination = response?.pagination;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              Services Catalog
            </h2>
            <p className="text-sm text-slate-500">
              Create and manage all service offerings, pricing tiers, durations, and images.
            </p>
          </div>

          <Button size="md" onClick={openCreateModal} className="gap-2 shadow-sm">
            <PlusCircle className="w-4 h-4" />
            Add New Service
          </Button>
        </div>

        {/* Filter Bar */}
        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={params.search || ""}
                  onChange={(e) =>
                    setParams((prev) => ({ ...prev, search: e.target.value, page: 1 }))
                  }
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="w-full md:w-56">
                <select
                  value={params.category_id || ""}
                  onChange={(e) =>
                    setParams((prev) => ({
                      ...prev,
                      category_id: e.target.value || undefined,
                      page: 1,
                    }))
                  }
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 focus:outline-none"
                >
                  <option value="">All Categories</option>
                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

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
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 focus:outline-none"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <Button
                variant="outline"
                size="md"
                onClick={() => refetch()}
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
              </div>
            ) : services.length === 0 ? (
              <EmptyState
                icon={<Scissors className="w-8 h-8" />}
                title="No Services Found"
                description="Get started by registering your first service offering."
                action={<Button onClick={openCreateModal}>Create First Service</Button>}
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Offer Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((s) => {
                    const svcPrice = s.price ?? (s as any).regular_price ?? 0;
                    const svcOfferPrice = s.offer_price ?? (s as any).discounted_price;
                    const svcImage = s.image || (s as any).featured_image;
                    const svcCategoryName =
                      categories?.find((c) => c.id === s.category_id)?.name ||
                      s.category?.name ||
                      "General";
                    const svcActive = s.is_active ?? ((s as any).status === "active");

                    return (
                      <TableRow key={s.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {svcImage ? (
                              <img
                                src={svcImage}
                                alt={s.name}
                                className="h-10 w-10 rounded-lg object-cover border border-slate-200"
                              />
                            ) : (
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs uppercase">
                                <Scissors className="w-4 h-4" />
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-sm text-slate-900">{s.name}</p>
                              {s.is_featured && (
                                <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                                  Featured
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="text-xs font-semibold text-slate-700">
                          {svcCategoryName}
                        </TableCell>

                        <TableCell className="text-xs text-slate-500">
                          {s.duration_minutes || 45} mins
                        </TableCell>

                        <TableCell className="text-xs font-bold text-slate-900">
                          {formatCurrency(svcPrice, s.currency || profile?.currency || "OMR")}
                        </TableCell>

                        <TableCell className="text-xs font-bold text-emerald-700">
                          {svcOfferPrice
                            ? formatCurrency(svcOfferPrice, s.currency || profile?.currency || "OMR")
                            : "-"}
                        </TableCell>

                        <TableCell>
                          <Badge variant={svcActive ? "success" : "secondary"}>
                            {svcActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditModal(s)}
                            title="Edit"
                            className="h-8 w-8 text-slate-600 hover:text-emerald-700"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteTarget(s)}
                            title="Delete"
                            className="h-8 w-8 text-slate-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
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

        {/* Create/Edit Modal */}
        <Dialog
          open={modalOpen}
          onOpenChange={setModalOpen}
          title={editingService ? "Edit Service" : "Add New Service"}
          description="Service parameters and website storefront presentation"
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
                {editingService ? "Save Service" : "Create Service"}
              </Button>
            </>
          }
        >
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Service Name"
                placeholder="e.g. Deep Tissue Massage"
                required
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              />

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData((prev) => ({ ...prev, category_id: e.target.value }))}
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 focus:outline-none"
                >
                  <option value="">Select Category</option>
                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Standard Price (₹)"
                type="number"
                required
                value={formData.price}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, price: parseFloat(e.target.value) || 0 }))
                }
              />

              <Input
                label="Offer Price (₹, optional)"
                type="number"
                value={formData.offer_price || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    offer_price: e.target.value ? parseFloat(e.target.value) : undefined,
                  }))
                }
              />

              <Input
                label="Duration (Minutes)"
                type="number"
                value={formData.duration_minutes}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    duration_minutes: parseInt(e.target.value) || 30,
                  }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Service Description
              </label>
              <textarea
                rows={3}
                placeholder="Detailed description of the treatment..."
                className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                value={formData.description || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>

            {/* Image Uploader */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Service Cover Image
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
                  {uploadingImage ? "Uploading..." : "Upload Cover Image"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                </label>
              </div>
            </div>

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData((prev) => ({ ...prev, is_featured: e.target.checked }))}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                Mark as Featured Service
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                Active (Show on Website)
              </label>
            </div>
          </div>
        </Dialog>

        {/* Delete Confirmation */}
        <Dialog
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          title="Delete Service Offering"
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
            This will permanently remove the service from your website menu.
          </p>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

