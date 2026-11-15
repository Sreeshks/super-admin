"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { testimonialsApi } from "@/lib/api/content";
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
import { MessageSquareQuote, PlusCircle, Edit2, Trash2, Star } from "lucide-react";
import { toast } from "sonner";
import { Testimonial, TestimonialCreate } from "@/types";

export default function TestimonialsPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);

  const [formData, setFormData] = useState<TestimonialCreate>({
    customer_name: "",
    customer_designation: "",
    customer_avatar: "",
    rating: 5,
    review: "",
    display_order: 1,
    is_active: true,
  });

  const { data: testimonials, isLoading } = useQuery({
    queryKey: ["company-testimonials"],
    queryFn: () => testimonialsApi.list(),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingTestimonial) {
        return testimonialsApi.update(editingTestimonial.id, formData);
      } else {
        return testimonialsApi.create(formData);
      }
    },
    onSuccess: () => {
      toast.success(
        editingTestimonial ? "Testimonial updated successfully" : "New testimonial published"
      );
      setModalOpen(false);
      setEditingTestimonial(null);
      queryClient.invalidateQueries({ queryKey: ["company-testimonials"] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to save testimonial";
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => testimonialsApi.delete(id),
    onSuccess: () => {
      toast.success("Testimonial removed");
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ["company-testimonials"] });
    },
  });

  const openCreateModal = () => {
    setEditingTestimonial(null);
    setFormData({
      customer_name: "",
      customer_designation: "",
      customer_avatar: "",
      rating: 5,
      review: "",
      display_order: (testimonials?.length || 0) + 1,
      is_active: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (t: Testimonial) => {
    setEditingTestimonial(t);
    setFormData({
      customer_name: t.customer_name,
      customer_designation: t.customer_designation || "",
      customer_avatar: t.customer_avatar || "",
      rating: t.rating,
      review: t.review,
      display_order: t.display_order,
      is_active: t.is_active,
    });
    setModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              Customer Testimonials & Reviews
            </h2>
            <p className="text-sm text-slate-500">
              Showcase verified client experiences and star ratings on your storefront.
            </p>
          </div>

          <Button size="md" onClick={openCreateModal} className="gap-2 shadow-sm">
            <PlusCircle className="w-4 h-4" />
            Add Testimonial
          </Button>
        </div>

        <Card className="border-slate-200 shadow-xs overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : !testimonials || testimonials.length === 0 ? (
              <EmptyState
                icon={<MessageSquareQuote className="w-8 h-8" />}
                title="No Testimonials Yet"
                description="Add feedback from your happy customers to build trust."
                action={<Button onClick={openCreateModal}>Add Testimonial</Button>}
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Review</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testimonials.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs uppercase">
                            {t.customer_name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-xs text-slate-900">{t.customer_name}</p>
                            <p className="text-[11px] text-slate-400">
                              {t.customer_designation || "Verified Client"}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1 text-amber-500">
                          {Array.from({ length: t.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                          ))}
                        </div>
                      </TableCell>

                      <TableCell className="text-xs text-slate-600 max-w-sm line-clamp-2">
                        &ldquo;{t.review}&rdquo;
                      </TableCell>

                      <TableCell>
                        <Badge variant={t.is_active ? "success" : "secondary"}>
                          {t.is_active ? "Published" : "Hidden"}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditModal(t)}
                            title="Edit"
                            className="h-8 w-8 text-slate-600 hover:text-emerald-700"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteTarget(t)}
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
          title={editingTestimonial ? "Edit Testimonial" : "Add Testimonial"}
          description="Customer review and satisfaction rating"
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
                {editingTestimonial ? "Save Review" : "Publish Review"}
              </Button>
            </>
          }
        >
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Customer Name"
                placeholder="e.g. Priya Sharma"
                required
                value={formData.customer_name}
                onChange={(e) => setFormData((prev) => ({ ...prev, customer_name: e.target.value }))}
              />
              <Input
                label="Designation / Role"
                placeholder="e.g. Regular Client"
                value={formData.customer_designation || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, customer_designation: e.target.value }))
                }
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Rating
              </label>
              <select
                value={formData.rating}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, rating: parseInt(e.target.value) || 5 }))
                }
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 focus:outline-none"
              >
                <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
                <option value="4">⭐⭐⭐⭐ 4 Stars</option>
                <option value="3">⭐⭐⭐ 3 Stars</option>
                <option value="2">⭐⭐ 2 Stars</option>
                <option value="1">⭐ 1 Star</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Review Text <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="What the customer said about their experience..."
                required
                className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                value={formData.review}
                onChange={(e) => setFormData((prev) => ({ ...prev, review: e.target.value }))}
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                Published on Website
              </label>
            </div>
          </div>
        </Dialog>

        {/* Delete Modal */}
        <Dialog
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          title="Delete Testimonial"
          description={`Delete testimonial from "${deleteTarget?.customer_name}"?`}
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
            This will permanently remove the review from your website.
          </p>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

