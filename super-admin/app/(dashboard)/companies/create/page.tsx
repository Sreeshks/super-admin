"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { businessTypesApi } from "@/lib/api/business-types";
import { subscriptionsApi } from "@/lib/api/subscriptions";
import { companiesApi } from "@/lib/api/companies";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  UserCheck,
  MapPin,
  Globe,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  KeyRound,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import { CompanyCreatePayload, CompanyCreateResponse } from "@/types";

const STEPS = [
  { id: 1, name: "Business Info", icon: Building2 },
  { id: 2, name: "Admin Account", icon: UserCheck },
  { id: 3, name: "Location", icon: MapPin },
  { id: 4, name: "Website Config", icon: Globe },
  { id: 5, name: "Subscription", icon: CreditCard },
  { id: 6, name: "Review & Create", icon: CheckCircle2 },
];

export default function CreateCompanyPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [createdResult, setCreatedResult] = useState<CompanyCreateResponse | null>(null);

  // Form State
  const [formData, setFormData] = useState<CompanyCreatePayload>({
    company_name: "",
    slug: "",
    business_type_id: "",
    description: "",
    phone: "",
    email: "",
    admin_name: "",
    admin_email: "",
    initial_password: "Password@123",
    address: "",
    city: "",
    state: "",
    country: "India",
    postal_code: "",
    website_status: "active",
    account_status: "active",
  });

  const [selectedPlanId, setSelectedPlanId] = useState<string>("");

  // Business Types
  const { data: businessTypes } = useQuery({
    queryKey: ["business-types-list"],
    queryFn: () => businessTypesApi.list(),
  });

  // Plans
  const { data: plans } = useQuery({
    queryKey: ["subscription-plans-list"],
    queryFn: () => subscriptionsApi.listPlans(),
  });

  // Set default business type and plan when loaded
  useEffect(() => {
    if (businessTypes && businessTypes.length > 0 && !formData.business_type_id) {
      setFormData((prev) => ({ ...prev, business_type_id: businessTypes[0].id }));
    }
  }, [businessTypes, formData.business_type_id]);

  useEffect(() => {
    if (plans && plans.length > 0 && !selectedPlanId) {
      setSelectedPlanId(plans[0].id);
    }
  }, [plans, selectedPlanId]);

  // Slug generator helper
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const generatedSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setFormData((prev) => ({
      ...prev,
      company_name: name,
      slug: prev.slug === "" || prev.slug === generatedSlug.slice(0, -1) ? generatedSlug : prev.slug,
    }));
  };

  // Submit Mutation
  const createMutation = useMutation({
    mutationFn: (payload: CompanyCreatePayload) => companiesApi.create(payload),
    onSuccess: (data) => {
      setCreatedResult(data);
      toast.success("Business account registered successfully!");
      queryClient.invalidateQueries({ queryKey: ["companies-list"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to create company";
      toast.error(msg);
    },
  });

  const handleNext = () => {
    // Basic validation per step
    if (currentStep === 1) {
      if (!formData.company_name.trim()) {
        toast.error("Please enter a company name");
        return;
      }
      if (!formData.business_type_id) {
        toast.error("Please select a business type");
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.admin_name.trim() || !formData.admin_email.trim()) {
        toast.error("Please fill in administrator name and email");
        return;
      }
      if (!formData.initial_password || formData.initial_password.length < 8) {
        toast.error("Password must be at least 8 characters");
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 6));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    createMutation.mutate(formData);
  };

  const selectedBusinessType = businessTypes?.find((b) => b.id === formData.business_type_id);
  const selectedPlan = plans?.find((p) => p.id === selectedPlanId);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            Create Business Account
          </h2>
          <p className="text-sm text-slate-500">
            Step-by-step onboarding wizard for multi-tenant business website setup.
          </p>
        </div>

        {/* Wizard Stepper Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {STEPS.map((s) => {
            const Icon = s.icon;
            const isCompleted = currentStep > s.id;
            const isCurrent = currentStep === s.id;

            return (
              <div
                key={s.id}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  isCurrent
                    ? "border-blue-600 bg-blue-50 text-blue-700 shadow-xs"
                    : isCompleted
                    ? "border-emerald-300 bg-emerald-50/50 text-emerald-700"
                    : "border-slate-200 bg-white text-slate-400"
                }`}
              >
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-lg text-xs font-bold ${
                    isCurrent
                      ? "bg-blue-600 text-white"
                      : isCompleted
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : s.id}
                </div>
                <span className="truncate">{s.name}</span>
              </div>
            );
          })}
        </div>

        {/* Success Modal / Screen if created */}
        {createdResult ? (
          <Card className="border-emerald-200 bg-white shadow-xl">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 mb-2">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <CardTitle className="text-xl text-slate-900">
                Company Provisioned Successfully!
              </CardTitle>
              <CardDescription>
                Tenant isolation and website endpoints are now active.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-xs font-semibold text-slate-500">Company ID</span>
                  <span className="text-xs font-mono font-bold text-slate-800">
                    {createdResult.company.id}
                  </span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-xs font-semibold text-slate-500">Company Name</span>
                  <span className="text-xs font-bold text-slate-800">
                    {createdResult.company.name}
                  </span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-xs font-semibold text-slate-500">Website Slug</span>
                  <span className="text-xs font-mono font-bold text-blue-600">
                    /{createdResult.company.slug}
                  </span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-xs font-semibold text-slate-500">Administrator Email</span>
                  <span className="text-xs font-bold text-slate-800">
                    {createdResult.admin_email}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Initial Password</span>
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {formData.initial_password}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                {createdResult.temporary_credentials_note}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => router.push("/companies")}
              >
                Back to Directory
              </Button>
              <Button
                onClick={() => router.push(`/companies/${createdResult.company.id}`)}
              >
                View Company Profile
              </Button>
            </CardFooter>
          </Card>
        ) : (
          /* Step Forms */
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardContent className="p-6">
              {/* STEP 1: Business Info */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-900 border-b pb-2">
                    Step 1: Business Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Company Name"
                      placeholder="e.g. Nofa Luxury Spa & Salon"
                      required
                      value={formData.company_name}
                      onChange={handleNameChange}
                    />

                    <Input
                      label="Website Slug / Subdomain"
                      placeholder="e.g. nofa-luxury-spa"
                      helperText="Used in public website URL: /websites/{slug}"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, slug: e.target.value }))
                      }
                    />

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                        Business Sector / Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.business_type_id}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            business_type_id: e.target.value,
                          }))
                        }
                        className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        {businessTypes?.map((bt) => (
                          <option key={bt.id} value={bt.id}>
                            {bt.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <Input
                      label="Business Phone"
                      placeholder="+91 98765 43210"
                      value={formData.phone || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, phone: e.target.value }))
                      }
                    />

                    <div className="sm:col-span-2">
                      <Input
                        label="Official Contact Email"
                        type="email"
                        placeholder="contact@nofasalon.com"
                        value={formData.email || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, email: e.target.value }))
                        }
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                        Description / About
                      </label>
                      <textarea
                        rows={3}
                        className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        placeholder="Premium beauty, wellness and hair styling studio..."
                        value={formData.description || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Administrator Account */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-900 border-b pb-2">
                    Step 2: Initial Company Administrator Account
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Admin Full Name"
                      placeholder="e.g. John Doe"
                      required
                      value={formData.admin_name}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, admin_name: e.target.value }))
                      }
                    />

                    <Input
                      label="Admin Login Email"
                      type="email"
                      placeholder="admin@nofasalon.com"
                      required
                      value={formData.admin_email}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, admin_email: e.target.value }))
                      }
                    />

                    <div className="sm:col-span-2">
                      <Input
                        label="Temporary Password"
                        placeholder="Min 8 characters"
                        required
                        helperText="The administrator will use this password to log into their Company Admin Panel."
                        value={formData.initial_password}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            initial_password: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Location */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-900 border-b pb-2">
                    Step 3: Primary Physical Address
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <Input
                        label="Street Address"
                        placeholder="123 Luxury Boulevard, Central Mall"
                        value={formData.address || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, address: e.target.value }))
                        }
                      />
                    </div>

                    <Input
                      label="City"
                      placeholder="Mumbai"
                      value={formData.city || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, city: e.target.value }))
                      }
                    />

                    <Input
                      label="State / Province"
                      placeholder="Maharashtra"
                      value={formData.state || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, state: e.target.value }))
                      }
                    />

                    <Input
                      label="Postal / Zip Code"
                      placeholder="400001"
                      value={formData.postal_code || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          postal_code: e.target.value,
                        }))
                      }
                    />

                    <Input
                      label="Country"
                      placeholder="India"
                      value={formData.country || "India"}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, country: e.target.value }))
                      }
                    />
                  </div>
                </div>
              )}

              {/* STEP 4: Website Config */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-900 border-b pb-2">
                    Step 4: Website & Account Governance
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                        Initial Website Status
                      </label>
                      <select
                        value={formData.website_status}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            website_status: e.target.value as "active" | "maintenance" | "disabled",
                          }))
                        }
                        className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none"
                      >
                        <option value="active">Active (Visible to public)</option>
                        <option value="maintenance">Maintenance Mode</option>
                        <option value="disabled">Disabled</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                        Initial Account Status
                      </label>
                      <select
                        value={formData.account_status}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            account_status: e.target.value as "active" | "suspended" | "trial",
                          }))
                        }
                        className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none"
                      >
                        <option value="active">Active (Full features)</option>
                        <option value="trial">Trial Period</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: Subscription Plan */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-900 border-b pb-2">
                    Step 5: Select Subscription Tier
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {plans?.map((plan) => {
                      const isSelected = selectedPlanId === plan.id;
                      return (
                        <div
                          key={plan.id}
                          onClick={() => setSelectedPlanId(plan.id)}
                          className={`cursor-pointer rounded-xl border p-4 transition-all ${
                            isSelected
                              ? "border-blue-600 bg-blue-50/40 ring-2 ring-blue-600/30 shadow-md"
                              : "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-slate-900">
                              {plan.name}
                            </span>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-blue-600" />
                            )}
                          </div>
                          <p className="mt-2 text-2xl font-black text-slate-900">
                            ₹{plan.price}
                            <span className="text-xs font-medium text-slate-500">
                              /{plan.billing_cycle}
                            </span>
                          </p>
                          <ul className="mt-3 space-y-1.5 text-xs text-slate-600 border-t pt-3">
                            <li>Max {plan.max_services} Services</li>
                            <li>Max {plan.max_locations} Location</li>
                            <li>{plan.max_storage_mb} MB Media Storage</li>
                            <li>
                              {plan.allow_custom_domain
                                ? "✓ Custom Domain Allowed"
                                : "✕ Custom Domain Disabled"}
                            </li>
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 6: Review & Create */}
              {currentStep === 6 && (
                <div className="space-y-6">
                  <h3 className="text-base font-bold text-slate-900 border-b pb-2">
                    Step 6: Review Configuration & Provision Tenant
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="rounded-xl border border-slate-200 p-4 bg-slate-50 space-y-2">
                      <p className="text-xs font-bold uppercase text-slate-500">
                        Company Summary
                      </p>
                      <p className="font-bold text-base text-slate-900">
                        {formData.company_name}
                      </p>
                      <p className="text-xs text-slate-600">
                        Slug: <span className="font-mono text-blue-600">/{formData.slug}</span>
                      </p>
                      <p className="text-xs text-slate-600">
                        Sector: <span className="font-semibold">{selectedBusinessType?.name}</span>
                      </p>
                      <p className="text-xs text-slate-600">
                        Location: {formData.city || "Not set"}, {formData.country}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 p-4 bg-slate-50 space-y-2">
                      <p className="text-xs font-bold uppercase text-slate-500">
                        Administrator Access
                      </p>
                      <p className="font-bold text-base text-slate-900">
                        {formData.admin_name}
                      </p>
                      <p className="text-xs text-slate-600">
                        Email: <span className="font-semibold">{formData.admin_email}</span>
                      </p>
                      <p className="text-xs text-slate-600">
                        Role: <span className="font-semibold text-blue-600">COMPANY_ADMIN</span>
                      </p>
                      <p className="text-xs text-slate-600">
                        Subscription Plan:{" "}
                        <span className="font-bold text-slate-900">
                          {selectedPlan?.name || "Standard"}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center gap-3">
                    <Sparkles className="w-5 h-5 shrink-0 text-blue-600" />
                    <span>
                      Clicking <strong>&ldquo;Provision Business Now&rdquo;</strong> will atomically create the tenant
                      record, hash administrator credentials with Argon2id, configure default website sections,
                      and establish Row-Level Security tenant isolation.
                    </span>
                  </div>
                </div>
              )}
            </CardContent>

            {/* Wizard Navigation Footer */}
            <CardFooter className="flex items-center justify-between border-t p-4">
              <Button
                variant="outline"
                size="sm"
                disabled={currentStep === 1}
                onClick={handleBack}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Previous Step
              </Button>

              {currentStep < 6 ? (
                <Button size="sm" onClick={handleNext}>
                  Next Step
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  size="md"
                  isLoading={createMutation.isPending}
                  onClick={handleSubmit}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  Provision Business Now
                </Button>
              )}
            </CardFooter>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

