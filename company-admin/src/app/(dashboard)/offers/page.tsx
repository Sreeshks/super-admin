"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { offersApi } from "@/lib/api/offers";
import { mediaApi } from "@/lib/api/media";
import { profileApi } from "@/lib/api/profile";
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
import { BadgePercent, PlusCircle, Edit2, Trash2, Upload, Calendar } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Offer, OfferCreate } from "@/types";

export default function OffersPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Offer | null>(null);

  const [formData, setFormData] = useState<OfferCreate>({
    title: "",
    slug: "",
    description: "",
    image: "",
    discount_percentage: 20,
    original_price: 1000,
    offer_price: 800,
    is_featured: false,
    is_active: true,
    display_order: 1,
  });

  const [uploading, setUploading] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["company-profile"],
    queryFn: () => profileApi.getProfile(),
  });

  const { data: offers, isLoading } = useQuery({
    queryKey: ["company-offers"],
    queryFn: () => offersApi.list(),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingOffer) {
        return offersApi.update(editingOffer.id, formData);
      } else {
        return offersApi.create(formData);
      }
    },
    onSuccess: () => {
      toast.success(editingOffer ? "Offer updated successfully" : "New offer launched");
      setModalOpen(false);
      setEditingOffer(null);
      queryClient.invalidateQueries({ queryKey: ["company-offers"] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to save offer";
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => offersApi.delete(id),
    onSuccess: () => {
      toast.success("Offer deleted successfully");
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ["company-offers"] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to delete offer";
      toast.error(msg);
    },
  });

  const openCreateModal = () => {
    setEditingOffer(null);
    setFormData({
      title: "",
      slug: "",
      description: "",
      image: "",
      discount_percentage: 20,
      original_price: 1000,
      offer_price: 800,
      is_featured: false,
      is_active: true,
      display_order: (offers?.length || 0) + 1,
    });
    setModalOpen(true);
  };

  const openEditModal = (o: Offer) => {
    setEditingOffer(o);
    setFormData({
      title: o.title,
      slug: o.slug,
      description: o.description || "",
      image: o.image || "",
      discount_percentage: o.discount_percentage ?? undefined,
      original_price: o.original_price ?? undefined,
      offer_price: o.offer_price ?? undefined,
      start_date: o.start_date ? o.start_date.split("T")[0] : undefined,
      end_date: o.end_date ? o.end_date.split("T")[0] : undefined,
      is_featured: o.is_featured,
      is_active: o.is_active,
      display_order: o.display_order,
    });
    setModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await mediaApi.upload(file, "offers");
      setFormData((prev) => ({ ...prev, image: res.file_url }));
      toast.success("Offer banner uploaded!");
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
              Special Offers & Promotions
            </h2>
            <p className="text-sm text-slate-500">
              Promote seasonal deals, discount packages, and featured package rates on your storefront.
            </p>
          </div>

          <Button size="md" onClick={openCreateModal} className="gap-2 shadow-sm">
            <PlusCircle className="w-4 h-4" />
            Create New Offer
          </Button>
        </div>

        <Card className="border-slate-200 shadow-xs overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : !offers || offers.length === 0 ? (
              <EmptyState
                icon={<BadgePercent className="w-8 h-8" />}
                title="No Active Offers"
                description="Create your first promotional discount package for visitors."
                action={<Button onClick={openCreateModal}>Create Offer</Button>}
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Offer Title</TableHead>
                    <TableHead>Discount / Rate</TableHead>
                    <TableHead>Validity</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {offers.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {o.image ? (
                            <img
                              src={o.image}
                              alt={o.title}
                              className="h-10 w-10 rounded-lg object-cover border"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-700 font-bold text-xs">
                              <BadgePercent className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-xs text-slate-900">{o.title}</p>
                            <p className="text-[11px] text-slate-400 max-w-xs truncate">
                              {o.description || "-"}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="text-xs">
                        {o.offer_price ? (
                          <div className="flex items-center gap-1.5 font-bold">
                            <span className="text-emerald-700">
                              {formatCurrency(o.offer_price, profile?.currency || "OMR")}
                            </span>
                            {o.original_price && (
                              <span className="text-slate-400 line-through text-[11px]">
                                {formatCurrency(o.original_price, profile?.currency || "OMR")}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="font-bold text-amber-700">
                            {o.discount_percentage ? `${o.discount_percentage}% OFF` : "-"}
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="text-xs text-slate-500">
                        {o.start_date || o.end_date ? (
                          <div className="flex items-center gap-1 text-[11px]">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              {o.start_date ? formatDate(o.start_date).split(",")[0] : "Now"} –{" "}
                              {o.end_date ? formatDate(o.end_date).split(",")[0] : "Ongoing"}
                            </span>
                          </div>
                        ) : (
                          "Ongoing"
                        )}
                      </TableCell>

                      <TableCell>
                        {o.is_featured ? (
                          <Badge variant="warning">Featured</Badge>
                        ) : (
                          <span className="text-slate-400 text-xs">Standard</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <Badge variant={o.is_active ? "success" : "secondary"}>
                          {o.is_active ? "Active" : "Draft"}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditModal(o)}
                            title="Edit"
                            className="h-8 w-8 text-slate-600 hover:text-emerald-700"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteTarget(o)}
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

        {/* Modal */}
        <Dialog
          open={modalOpen}
          onOpenChange={setModalOpen}
          title={editingOffer ? "Edit Offer" : "Create Promotional Offer"}
          description="Special rates and promotional packages"
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
                {editingOffer ? "Save Offer" : "Publish Offer"}
              </Button>
            </>
          }
        >
          <div className="space-y-4 py-2">
            <Input
              label="Offer Title"
              placeholder="e.g. Monsoon Glow Rejuvenation Combo"
              required
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            />

            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Original Price (₹)"
                type="number"
                value={formData.original_price || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    original_price: parseFloat(e.target.value) || undefined,
                  }))
                }
              />
              <Input
                label="Offer Price (₹)"
                type="number"
                value={formData.offer_price || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    offer_price: parseFloat(e.target.value) || undefined,
                  }))
                }
              />
              <Input
                label="Discount %"
                type="number"
                value={formData.discount_percentage || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    discount_percentage: parseInt(e.target.value) || undefined,
                  }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Offer Description
              </label>
              <textarea
                rows={2}
                placeholder="What is included in this promotional deal..."
                className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                value={formData.description || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>

            {/* Banner Upload */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Offer Image / Banner
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
                  {uploading ? "Uploading..." : "Upload Offer Banner"}
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

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData((prev) => ({ ...prev, is_featured: e.target.checked }))}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                Featured Offer (Highlight on Homepage)
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                Active (Live)
              </label>
            </div>
          </div>
        </Dialog>

        {/* Delete Modal */}
        <Dialog
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          title="Delete Offer"
          description={`Delete "${deleteTarget?.title}"?`}
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
            This will permanently remove the promotional package.
          </p>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

