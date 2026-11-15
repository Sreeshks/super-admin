"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { subscriptionsApi } from "@/lib/api/subscriptions";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard, PlusCircle, Check, Edit2, Trash2, Zap } from "lucide-react";
import { toast } from "sonner";
import { SubscriptionPlan, SubscriptionPlanCreate } from "@/types";

export default function SubscriptionsPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

  const [formData, setFormData] = useState<SubscriptionPlanCreate>({
    name: "",
    slug: "",
    description: "",
    price: 999,
    billing_cycle: "monthly",
    max_services: 50,
    max_locations: 1,
    max_storage_mb: 500,
    max_admins: 2,
    allow_custom_domain: false,
    is_active: true,
  });

  const { data: plans, isLoading } = useQuery({
    queryKey: ["subscription-plans-list"],
    queryFn: () => subscriptionsApi.listPlans(true),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingPlan) {
        return subscriptionsApi.updatePlan(editingPlan.id, formData);
      } else {
        return subscriptionsApi.createPlan(formData);
      }
    },
    onSuccess: () => {
      toast.success(editingPlan ? "Plan updated successfully" : "New plan created");
      setModalOpen(false);
      setEditingPlan(null);
      queryClient.invalidateQueries({ queryKey: ["subscription-plans-list"] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to save plan";
      toast.error(msg);
    },
  });

  const openCreateModal = () => {
    setEditingPlan(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      price: 999,
      billing_cycle: "monthly",
      max_services: 50,
      max_locations: 1,
      max_storage_mb: 500,
      max_admins: 2,
      allow_custom_domain: false,
      is_active: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      slug: plan.slug,
      description: plan.description || "",
      price: plan.price,
      billing_cycle: plan.billing_cycle,
      max_services: plan.max_services,
      max_locations: plan.max_locations,
      max_storage_mb: plan.max_storage_mb,
      max_admins: plan.max_admins,
      allow_custom_domain: plan.allow_custom_domain,
      is_active: plan.is_active,
    });
    setModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              Subscription Plans & Entitlements
            </h2>
            <p className="text-sm text-slate-500">
              Configure multi-tier pricing, quota limits, and custom domain permissions.
            </p>
          </div>
          <Button size="md" onClick={openCreateModal} className="gap-2 shadow-sm">
            <PlusCircle className="w-4 h-4" />
            Create Plan
          </Button>
        </div>

        {/* Plans Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-80 w-full" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans?.map((plan) => (
              <Card
                key={plan.id}
                className="border-slate-200 bg-white shadow-xs relative flex flex-col justify-between"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold">{plan.name}</CardTitle>
                    <Badge variant={plan.is_active ? "success" : "secondary"}>
                      {plan.is_active ? "Active" : "Archived"}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    {plan.description || "Standard multi-tenant package"}
                  </CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-black text-slate-900">₹{plan.price}</span>
                    <span className="text-xs font-semibold text-slate-500">
                      {" "}/ {plan.billing_cycle}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pb-6 flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Tier Quotas & Features
                  </p>
                  <ul className="space-y-2 text-xs text-slate-700">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>
                        Up to <strong>{plan.max_services}</strong> Service Offerings
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>
                        Up to <strong>{plan.max_locations}</strong> Business Outlets
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>
                        <strong>{plan.max_storage_mb} MB</strong> Media & Gallery Storage
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>
                        Up to <strong>{plan.max_admins}</strong> Administrator Accounts
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      {plan.allow_custom_domain ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span className="font-semibold text-blue-600">
                            Custom Domain Mapping Included
                          </span>
                        </>
                      ) : (
                        <span className="text-slate-400">✕ Custom Domain Disabled</span>
                      )}
                    </li>
                  </ul>
                </CardContent>
                <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50/50 rounded-b-xl">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(plan)}
                    className="text-xs gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit Tier
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        <Dialog
          open={modalOpen}
          onOpenChange={setModalOpen}
          title={editingPlan ? "Edit Subscription Tier" : "Create New Subscription Tier"}
          description="Define pricing and feature limits for client businesses."
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
                {editingPlan ? "Save Plan" : "Create Plan"}
              </Button>
            </>
          }
        >
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Plan Name"
                placeholder="e.g. Enterprise Tier"
                required
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              />
              <Input
                label="Price (₹ INR)"
                type="number"
                required
                value={formData.price}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, price: parseFloat(e.target.value) || 0 }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Billing Cycle
                </label>
                <select
                  value={formData.billing_cycle}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      billing_cycle: e.target.value as "monthly" | "yearly",
                    }))
                  }
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 focus:outline-none"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <Input
                label="Max Storage (MB)"
                type="number"
                value={formData.max_storage_mb}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    max_storage_mb: parseInt(e.target.value) || 100,
                  }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Max Services"
                type="number"
                value={formData.max_services}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    max_services: parseInt(e.target.value) || 10,
                  }))
                }
              />
              <Input
                label="Max Locations"
                type="number"
                value={formData.max_locations}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    max_locations: parseInt(e.target.value) || 1,
                  }))
                }
              />
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.allow_custom_domain}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      allow_custom_domain: e.target.checked,
                    }))
                  }
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Allow Custom Domain Mapping
              </label>
            </div>
          </div>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

