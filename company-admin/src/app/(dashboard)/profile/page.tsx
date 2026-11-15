"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profileApi } from "@/lib/api/profile";
import { mediaApi } from "@/lib/api/media";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Building, Save, Upload, ExternalLink, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { CompanyProfileUpdate } from "@/types";

export default function BusinessProfilePage() {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<CompanyProfileUpdate>({
    name: "",
    logo: "",
    favicon: "",
    phone: "",
    email: "",
    description: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    postal_code: "",
    currency: "OMR",
  });

  const [uploadingLogo, setUploadingLogo] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["company-profile"],
    queryFn: () => profileApi.getProfile(),
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name,
        logo: profile.logo || "",
        favicon: profile.favicon || "",
        phone: profile.phone || "",
        email: profile.email || "",
        description: profile.description || "",
        address: profile.address || "",
        city: profile.city || "",
        state: profile.state || "",
        country: profile.country || "India",
        postal_code: profile.postal_code || "",
        currency: profile.currency || "OMR",
      });
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: () => profileApi.updateProfile(formData),
    onSuccess: (updated) => {
      toast.success("Business profile saved successfully!");
      queryClient.setQueryData(["company-profile"], updated);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to update profile";
      toast.error(msg);
    },
  });

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const res = await mediaApi.upload(file, "logo");
      setFormData((prev) => ({ ...prev, logo: res.file_url }));
      toast.success("Logo uploaded!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Logo upload failed";
      toast.error(msg);
    } finally {
      setUploadingLogo(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl space-y-6">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            Business Profile & Branding
          </h2>
          <p className="text-sm text-slate-500">
            Official company name, identity logo, address, and primary contact information.
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : (
          <div className="space-y-6">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-base font-bold">Identity & Contact</CardTitle>
                <CardDescription>Public brand information shown across your website</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Business Name"
                    placeholder="e.g. Nofa Luxury Spa & Salon"
                    required
                    value={formData.name || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  />

                  <Input
                    label="Official Contact Email"
                    type="email"
                    placeholder="info@nofasalon.com"
                    value={formData.email || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  />

                  <Input
                    label="Official Phone Number"
                    placeholder="+91 98765 43210"
                    value={formData.phone || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  />

                  <div>
                    <span className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                      Website Subpath
                    </span>
                    <div className="h-10 px-3 bg-slate-100 rounded-lg flex items-center text-xs font-mono text-slate-600 border">
                      /websites/{profile?.slug}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Business About / Bio
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Brief description of your salon or wellness centre..."
                    className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    value={formData.description || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
                  />
                </div>

                {/* Logo Upload */}
                <div className="space-y-2 pt-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Business Brand Logo
                  </label>
                  <div className="flex items-center gap-3">
                    {formData.logo ? (
                      <img
                        src={formData.logo}
                        alt="Logo"
                        className="h-14 w-14 rounded-xl object-contain border p-1 bg-white"
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-xl border border-dashed flex items-center justify-center bg-slate-50 text-slate-400">
                        <Building className="w-6 h-6" />
                      </div>
                    )}
                    <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 border rounded-lg text-xs font-semibold hover:bg-slate-50">
                      <Upload className="w-4 h-4 text-slate-500" />
                      {uploadingLogo ? "Uploading..." : "Upload Business Logo"}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        disabled={uploadingLogo}
                      />
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-base font-bold">Primary Physical Address</CardTitle>
                <CardDescription>Location coordinates rendered in footer and contact sections</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                    onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                  />

                  <Input
                    label="State"
                    placeholder="Maharashtra"
                    value={formData.state || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, state: e.target.value }))}
                  />

                  <Input
                    label="Postal Code"
                    placeholder="400001"
                    value={formData.postal_code || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, postal_code: e.target.value }))
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

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                      Business Currency
                    </label>
                    <select
                      className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      value={formData.currency || "OMR"}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, currency: e.target.value }))
                      }
                    >
                      <option value="OMR">OMR — Omani Rial (ر.ع.)</option>
                      <option value="USD">USD — US Dollar ($)</option>
                      <option value="INR">INR — Indian Rupee (₹)</option>
                      <option value="AED">AED — UAE Dirham (د.إ)</option>
                      <option value="SAR">SAR — Saudi Riyal (﷼)</option>
                      <option value="EUR">EUR — Euro (€)</option>
                      <option value="GBP">GBP — British Pound (£)</option>
                      <option value="KWD">KWD — Kuwaiti Dinar (د.ك)</option>
                      <option value="QAR">QAR — Qatari Riyal (ر.ق)</option>
                      <option value="BHD">BHD — Bahraini Dinar (.د.ب)</option>
                    </select>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Prices across your public website and services will dynamically display in this currency.
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end p-4 border-t">
                <Button
                  isLoading={updateMutation.isPending}
                  onClick={() => updateMutation.mutate()}
                  className="gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Business Profile
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

