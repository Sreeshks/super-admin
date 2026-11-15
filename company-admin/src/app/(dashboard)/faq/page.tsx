"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { faqsApi } from "@/lib/api/content";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { HelpCircle, PlusCircle, Edit2, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { FAQ, FAQCreate } from "@/types";

export default function FAQPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FAQ | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [formData, setFormData] = useState<FAQCreate>({
    question: "",
    answer: "",
    display_order: 1,
    is_active: true,
  });

  const { data: faqs, isLoading } = useQuery({
    queryKey: ["company-faqs"],
    queryFn: () => faqsApi.list(),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingFaq) {
        return faqsApi.update(editingFaq.id, formData);
      } else {
        return faqsApi.create(formData);
      }
    },
    onSuccess: () => {
      toast.success(editingFaq ? "FAQ updated successfully" : "New FAQ added");
      setModalOpen(false);
      setEditingFaq(null);
      queryClient.invalidateQueries({ queryKey: ["company-faqs"] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to save FAQ";
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => faqsApi.delete(id),
    onSuccess: () => {
      toast.success("FAQ removed");
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ["company-faqs"] });
    },
  });

  const openCreateModal = () => {
    setEditingFaq(null);
    setFormData({
      question: "",
      answer: "",
      display_order: (faqs?.length || 0) + 1,
      is_active: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (f: FAQ) => {
    setEditingFaq(f);
    setFormData({
      question: f.question,
      answer: f.answer,
      display_order: f.display_order,
      is_active: f.is_active,
    });
    setModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              Frequently Asked Questions (FAQ)
            </h2>
            <p className="text-sm text-slate-500">
              Help prospective clients understand appointments, pricing, cancellations, and salon policies.
            </p>
          </div>

          <Button size="md" onClick={openCreateModal} className="gap-2 shadow-sm">
            <PlusCircle className="w-4 h-4" />
            Add FAQ
          </Button>
        </div>

        {/* FAQs List with Accordion preview */}
        <Card className="border-slate-200 shadow-xs overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : !faqs || faqs.length === 0 ? (
              <EmptyState
                icon={<HelpCircle className="w-8 h-8" />}
                title="No FAQs Configured"
                description="Create helpful answers to common customer questions."
                action={<Button onClick={openCreateModal}>Add First FAQ</Button>}
              />
            ) : (
              <div className="divide-y divide-slate-100">
                {faqs.map((faq) => {
                  const isExpanded = expandedId === faq.id;
                  return (
                    <div key={faq.id} className="p-4 transition-colors hover:bg-slate-50/50">
                      <div className="flex items-center justify-between gap-3">
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                          className="flex items-center gap-3 text-left flex-1"
                        >
                          <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="font-bold text-xs sm:text-sm text-slate-900">
                            {faq.question}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          )}
                        </button>

                        <div className="flex items-center gap-2">
                          <Badge variant={faq.is_active ? "success" : "secondary"}>
                            {faq.is_active ? "Active" : "Hidden"}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditModal(faq)}
                            className="h-7 w-7 text-slate-600 hover:text-emerald-700"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteTarget(faq)}
                            className="h-7 w-7 text-slate-400 hover:text-red-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-3 pl-7 pr-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-2.5">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal */}
        <Dialog
          open={modalOpen}
          onOpenChange={setModalOpen}
          title={editingFaq ? "Edit FAQ" : "Add FAQ Question"}
          description="Customer help query and answer"
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
                {editingFaq ? "Save FAQ" : "Add FAQ"}
              </Button>
            </>
          }
        >
          <div className="space-y-4 py-2">
            <Input
              label="Question"
              placeholder="e.g. Do I need an advance appointment?"
              required
              value={formData.question}
              onChange={(e) => setFormData((prev) => ({ ...prev, question: e.target.value }))}
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Answer <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                placeholder="Clear and informative answer for your customers..."
                required
                className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                value={formData.answer}
                onChange={(e) => setFormData((prev) => ({ ...prev, answer: e.target.value }))}
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
                Active (Display in Website Accordion)
              </label>
            </div>
          </div>
        </Dialog>

        {/* Delete Modal */}
        <Dialog
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          title="Delete FAQ"
          description={`Delete "${deleteTarget?.question}"?`}
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
            This FAQ question will no longer be visible on your website.
          </p>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

