"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bannersApi } from "@/lib/api/banners";
import { mediaApi } from "@/lib/api/media";
import { uploadToImgBB } from "@/lib/api/imgbb";
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
import {
  ImageIcon,
  PlusCircle,
  Edit2,
  Trash2,
  Upload,
  Smartphone,
  Monitor,
  Layers,
  ArrowUp,
  ArrowDown,
  X,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Banner, BannerCreate } from "@/types";

interface BatchItem {
  id: string;
  file: File;
  previewUrl: string;
  title: string;
  isMobile: boolean;
  status: "idle" | "uploading" | "done" | "error";
}

export default function BannersPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null);

  // Single Banner Form Data
  const [formData, setFormData] = useState<BannerCreate>({
    title: "",
    subtitle: "",
    description: "",
    image: "",
    mobile_image: "",
    button_text: "Book Appointment",
    button_url: "#services",
    display_order: 1,
    is_active: true,
  });

  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [uploadingDesktop, setUploadingDesktop] = useState(false);
  const [uploadingMobile, setUploadingMobile] = useState(false);

  // Batch Upload State
  const [batchFiles, setBatchFiles] = useState<BatchItem[]>([]);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);

  const { data: banners, isLoading } = useQuery({
    queryKey: ["company-banners"],
    queryFn: () => bannersApi.list(),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!formData.image && !formData.desktop_media_url) {
        throw new Error("Desktop hero image is required");
      }
      if (editingBanner) {
        return bannersApi.update(editingBanner.id, formData);
      } else {
        return bannersApi.create(formData);
      }
    },
    onSuccess: () => {
      toast.success(editingBanner ? "Banner updated successfully" : "Hero banner published");
      setModalOpen(false);
      setEditingBanner(null);
      queryClient.invalidateQueries({ queryKey: ["company-banners"] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to save banner";
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => bannersApi.delete(id),
    onSuccess: () => {
      toast.success("Banner deleted successfully");
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ["company-banners"] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to delete banner";
      toast.error(msg);
    },
  });

  const openCreateModal = () => {
    setEditingBanner(null);
    setFormData({
      title: "",
      subtitle: "",
      description: "",
      image: "",
      mobile_image: "",
      button_text: "Book Appointment",
      button_url: "#services",
      display_order: (banners?.length || 0) + 1,
      is_active: true,
    });
    setPreviewDevice("desktop");
    setModalOpen(true);
  };

  const openEditModal = (b: Banner) => {
    setEditingBanner(b);
    setFormData({
      title: b.title || b.heading || "",
      subtitle: b.subtitle || "",
      description: b.description || "",
      image: b.image || b.desktop_media_url || "",
      mobile_image: b.mobile_image || b.mobile_media_url || "",
      button_text: b.button_text || b.cta_button_text || "",
      button_url: b.button_url || b.cta_button_url || "",
      display_order: b.display_order,
      is_active: b.is_active,
    });
    setPreviewDevice(b.mobile_image ? "mobile" : "desktop");
    setModalOpen(true);
  };

  const handleUpload = async (file: File, isMobile = false) => {
    if (isMobile) setUploadingMobile(true);
    else setUploadingDesktop(true);

    try {
      const url = await uploadToImgBB(file);
      if (isMobile) {
        setFormData((prev) => ({
          ...prev,
          mobile_image: url,
          mobile_media_url: url,
        }));
        toast.success("Mobile banner uploaded to ImgBB!");
      } else {
        setFormData((prev) => ({
          ...prev,
          image: url,
          desktop_media_url: url,
        }));
        toast.success("Desktop banner uploaded to ImgBB!");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      toast.error(msg);
    } finally {
      if (isMobile) setUploadingMobile(false);
      else setUploadingDesktop(false);
    }
  };

  // Re-ordering logic
  const handleMoveOrder = async (banner: Banner, direction: "up" | "down") => {
    if (!banners) return;
    const sorted = [...banners].sort((a, b) => a.display_order - b.display_order);
    const currentIndex = sorted.findIndex((b) => b.id === banner.id);
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    const otherBanner = sorted[targetIndex];
    try {
      await bannersApi.update(banner.id, { display_order: otherBanner.display_order });
      await bannersApi.update(otherBanner.id, { display_order: banner.display_order });
      toast.success("Banner order updated");
      queryClient.invalidateQueries({ queryKey: ["company-banners"] });
    } catch {
      toast.error("Failed to reorder banners");
    }
  };

  // Multiple File Selection
  const handleBatchFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    const newItems: BatchItem[] = files.map((f, idx) => ({
      id: `${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 7)}`,
      file: f,
      previewUrl: URL.createObjectURL(f),
      title: f.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
      isMobile: false,
      status: "idle",
    }));
    setBatchFiles((prev) => [...prev, ...newItems]);
  };

  const removeBatchItem = (id: string) => {
    setBatchFiles((prev) => prev.filter((item) => item.id !== id));
  };

  // Batch Processing
  const processBatchUpload = async () => {
    if (batchFiles.length === 0) {
      toast.error("Please select at least one banner image to upload");
      return;
    }

    setIsBatchProcessing(true);
    let successCount = 0;
    const startOrder = (banners?.length || 0) + 1;

    for (let i = 0; i < batchFiles.length; i++) {
      const item = batchFiles[i];
      setBatchFiles((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, status: "uploading" } : it))
      );

      try {
        const fileUrl = await uploadToImgBB(item.file);

        await bannersApi.create({
          title: item.title,
          subtitle: "Featured Collection",
          image: fileUrl,
          desktop_media_url: fileUrl,
          mobile_image: item.isMobile ? fileUrl : undefined,
          mobile_media_url: item.isMobile ? fileUrl : undefined,
          button_text: "Explore Services",
          button_url: "#services",
          display_order: startOrder + i,
          is_active: true,
        });

        setBatchFiles((prev) =>
          prev.map((it) => (it.id === item.id ? { ...it, status: "done" } : it))
        );
        successCount++;
      } catch {
        setBatchFiles((prev) =>
          prev.map((it) => (it.id === item.id ? { ...it, status: "error" } : it))
        );
      }
    }

    setIsBatchProcessing(false);
    queryClient.invalidateQueries({ queryKey: ["company-banners"] });

    if (successCount === batchFiles.length) {
      toast.success(`Successfully uploaded and created ${successCount} banners!`);
      setBatchModalOpen(false);
      setBatchFiles([]);
    } else {
      toast.error(`Uploaded ${successCount} of ${batchFiles.length} banners. Check failed items.`);
    }
  };

  const sortedBanners = banners ? [...banners].sort((a, b) => a.display_order - b.display_order) : [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with Title and Both Single + Multiple Upload Options */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-emerald-600" />
                Hero Banners & Sliders
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                ⚡ ImgBB Cloud API Active
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              Upload and manage desktop and mobile hero banners powered directly by ImgBB Cloud.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                setBatchFiles([]);
                setBatchModalOpen(true);
              }}
              className="gap-2 shadow-xs border-slate-300"
            >
              <Layers className="w-4 h-4 text-emerald-600" />
              Upload Multiple Banners
            </Button>

            <Button size="md" onClick={openCreateModal} className="gap-2 shadow-xs bg-slate-900 hover:bg-slate-800">
              <PlusCircle className="w-4 h-4" />
              Add Hero Banner
            </Button>
          </div>
        </div>

        {/* Feature Highlights Alert */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Desktop Artwork</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Full-width 16:9 landscape (1920×1080) for widescreen desktop visitors.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs flex items-start gap-3">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Mobile Artwork</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Portrait 4:5 or 9:16 (1080×1350) optimized for mobile smartphones.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Multiple Uploads</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Batch upload multiple slides at once to build an interactive carousel.
              </p>
            </div>
          </div>
        </div>

        {/* Banners List */}
        <Card className="border-slate-200 shadow-xs overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : sortedBanners.length === 0 ? (
              <EmptyState
                icon={<ImageIcon className="w-8 h-8" />}
                title="No Hero Banners Published"
                description="Upload desktop and mobile banners to showcase your brand on your website."
                action={
                  <div className="flex items-center gap-2">
                    <Button onClick={openCreateModal}>Upload First Banner</Button>
                    <Button variant="outline" onClick={() => setBatchModalOpen(true)}>
                      Batch Upload
                    </Button>
                  </div>
                }
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Order</TableHead>
                    <TableHead>Desktop Banner</TableHead>
                    <TableHead>Mobile Banner</TableHead>
                    <TableHead>Headline & Tagline</TableHead>
                    <TableHead>Button CTA</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedBanners.map((b, idx) => {
                    const desktopImg = b.image || b.desktop_media_url;
                    const mobileImg = b.mobile_image || b.mobile_media_url;
                    const headingText = b.title || b.heading || "Untitled Banner";

                    return (
                      <TableRow key={b.id}>
                        {/* Display Order & Up/Down */}
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className="font-mono text-xs font-bold text-slate-600 w-5">
                              #{b.display_order}
                            </span>
                            <div className="flex flex-col">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMoveOrder(b, "up")}
                                className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                                title="Move Up"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === sortedBanners.length - 1}
                                onClick={() => handleMoveOrder(b, "down")}
                                className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                                title="Move Down"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </TableCell>

                        {/* Desktop Image */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {desktopImg ? (
                              <img
                                src={desktopImg}
                                alt={headingText}
                                className="h-12 w-24 rounded-lg object-cover border border-slate-200 shadow-2xs"
                              />
                            ) : (
                              <div className="h-12 w-24 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 border border-dashed">
                                Missing
                              </div>
                            )}
                            <div className="hidden lg:block text-[11px] text-slate-500">
                              <span className="font-semibold text-slate-700">Desktop</span>
                              <p className="text-[10px]">1920×1080</p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Mobile Image */}
                        <TableCell>
                          {mobileImg ? (
                            <div className="flex items-center gap-2">
                              <img
                                src={mobileImg}
                                alt="Mobile banner"
                                className="h-12 w-9 rounded-lg object-cover border border-slate-200 shadow-2xs"
                              />
                              <Badge variant="outline" className="text-[10px] bg-indigo-50/50 text-indigo-700 border-indigo-200">
                                Portrait
                              </Badge>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">
                              Using desktop fallback
                            </span>
                          )}
                        </TableCell>

                        {/* Headline */}
                        <TableCell>
                          <p className="font-bold text-xs text-slate-900 max-w-xs truncate">{headingText}</p>
                          <p className="text-[11px] text-slate-500 max-w-xs truncate">{b.subtitle || "-"}</p>
                        </TableCell>

                        {/* Button CTA */}
                        <TableCell className="text-xs">
                          {b.button_text || b.cta_button_text ? (
                            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block text-[11px]">
                              {b.button_text || b.cta_button_text}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">-</span>
                          )}
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <Badge variant={b.is_active ? "success" : "secondary"}>
                            {b.is_active ? "Active" : "Hidden"}
                          </Badge>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditModal(b)}
                              title="Edit Banner"
                              className="h-8 w-8 text-slate-600 hover:text-emerald-700"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteTarget(b)}
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
          </CardContent>
        </Card>

        {/* Single Banner Modal (Dual Upload: Desktop & Mobile) */}
        <Dialog
          open={modalOpen}
          onOpenChange={setModalOpen}
          title={editingBanner ? "Edit Hero Banner" : "Create Hero Banner"}
          description="Upload custom artwork optimized for desktop and mobile screens."
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                isLoading={saveMutation.isPending}
                onClick={() => saveMutation.mutate()}
                className="bg-slate-900 hover:bg-slate-800"
              >
                {editingBanner ? "Save Changes" : "Publish Banner"}
              </Button>
            </>
          }
        >
          <div className="space-y-5 py-2 max-h-[70vh] overflow-y-auto px-1">
            {/* Device Preview Switcher */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-xs font-semibold text-slate-700">Preview Device:</span>
              <div className="flex items-center gap-1 bg-white p-0.5 rounded-md border border-slate-200 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setPreviewDevice("desktop")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition ${
                    previewDevice === "desktop"
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  Desktop View
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice("mobile")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition ${
                    previewDevice === "mobile"
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  Mobile View
                </button>
              </div>
            </div>

            {/* Live Visual Simulation Preview Box */}
            <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-neutral-900 shadow-inner flex items-center justify-center min-h-[160px]">
              {previewDevice === "desktop" ? (
                formData.image ? (
                  <div className="relative w-full h-44 overflow-hidden">
                    <img
                      src={formData.image}
                      alt="Desktop Preview"
                      className="w-full h-full object-cover brightness-75"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 text-white">
                      <p className="text-sm font-black tracking-tight">{formData.title || "Your Banner Headline"}</p>
                      <p className="text-[11px] text-white/80">{formData.subtitle || "Optional Subtitle / Tagline"}</p>
                      {formData.button_text && (
                        <div className="mt-2">
                          <span className="inline-block px-2.5 py-1 text-[10px] font-bold rounded bg-white text-black">
                            {formData.button_text}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-6 text-slate-400 text-xs">
                    <Monitor className="w-8 h-8 mx-auto mb-1 opacity-50" />
                    Please upload a desktop banner image below
                  </div>
                )
              ) : formData.mobile_image || formData.image ? (
                <div className="relative w-44 h-56 my-2 rounded-lg overflow-hidden border border-slate-700 shadow-lg">
                  <img
                    src={formData.mobile_image || formData.image}
                    alt="Mobile Preview"
                    className="w-full h-full object-cover brightness-75"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-2.5 text-white">
                    <p className="text-[11px] font-black leading-tight">{formData.title || "Headline"}</p>
                    <p className="text-[9px] text-white/80 truncate">{formData.subtitle || ""}</p>
                    {formData.button_text && (
                      <span className="mt-1 inline-block px-1.5 py-0.5 text-[8px] font-bold rounded bg-white text-black text-center">
                        {formData.button_text}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center p-6 text-slate-400 text-xs">
                  <Smartphone className="w-8 h-8 mx-auto mb-1 opacity-50" />
                  Please upload a mobile portrait banner or desktop banner
                </div>
              )}
            </div>

            {/* DUAL UPLOADER SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 1. Desktop Uploader */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <Monitor className="w-4 h-4 text-emerald-600" />
                    Desktop Banner <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">1920×1080 (16:9)</span>
                </div>

                {formData.image ? (
                  <div className="relative rounded-lg overflow-hidden border border-slate-200 group">
                    <img
                      src={formData.image}
                      alt="Desktop Banner"
                      className="w-full h-28 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                      <label className="cursor-pointer px-2.5 py-1.5 rounded-md bg-white text-black text-xs font-bold hover:bg-slate-100">
                        Replace
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], false)}
                          className="hidden"
                          disabled={uploadingDesktop}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, image: "", desktop_media_url: "" }))}
                        className="px-2.5 py-1.5 rounded-md bg-red-600 text-white text-xs font-bold hover:bg-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center justify-center p-5 border-2 border-dashed border-slate-300 rounded-lg hover:border-emerald-500 hover:bg-emerald-50/20 transition">
                    <Upload className="w-6 h-6 text-slate-400 mb-1" />
                    <span className="text-xs font-bold text-slate-800">
                      {uploadingDesktop ? "Uploading Desktop..." : "Upload Desktop Image"}
                    </span>
                    <span className="text-[10px] text-slate-400">JPG, PNG, WEBP up to 10MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], false)}
                      className="hidden"
                      disabled={uploadingDesktop}
                    />
                  </label>
                )}
              </div>

              {/* 2. Mobile Uploader */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-indigo-600" />
                    Mobile Banner <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">1080×1350 (4:5)</span>
                </div>

                {formData.mobile_image ? (
                  <div className="relative rounded-lg overflow-hidden border border-slate-200 group">
                    <img
                      src={formData.mobile_image}
                      alt="Mobile Banner"
                      className="w-full h-28 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                      <label className="cursor-pointer px-2.5 py-1.5 rounded-md bg-white text-black text-xs font-bold hover:bg-slate-100">
                        Replace
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], true)}
                          className="hidden"
                          disabled={uploadingMobile}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, mobile_image: "", mobile_media_url: "" }))}
                        className="px-2.5 py-1.5 rounded-md bg-red-600 text-white text-xs font-bold hover:bg-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center justify-center p-5 border-2 border-dashed border-slate-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50/20 transition">
                    <Smartphone className="w-6 h-6 text-slate-400 mb-1" />
                    <span className="text-xs font-bold text-slate-800">
                      {uploadingMobile ? "Uploading Mobile..." : "Upload Mobile Portrait"}
                    </span>
                    <span className="text-[10px] text-slate-400">Defaults to desktop if blank</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], true)}
                      className="hidden"
                      disabled={uploadingMobile}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Typography & CTA Form */}
            <div className="space-y-4 pt-1">
              <Input
                label="Banner Headline"
                placeholder="e.g. Elevate Your Beauty Experience"
                required
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              />

              <Input
                label="Subtitle / Tagline"
                placeholder="e.g. Premium styling & spa treatments crafted for you"
                value={formData.subtitle || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, subtitle: e.target.value }))}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Button CTA Text"
                  placeholder="Book Appointment"
                  value={formData.button_text || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, button_text: e.target.value }))}
                />
                <Input
                  label="Button Destination URL"
                  placeholder="#services or /contact"
                  value={formData.button_url || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, button_url: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 items-center pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Display Order
                  </label>
                  <Input
                    type="number"
                    min={1}
                    value={formData.display_order ?? 1}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        display_order: parseInt(e.target.value, 10) || 1,
                      }))
                    }
                  />
                </div>

                <div className="pt-5">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    Active (Show in Hero Slider)
                  </label>
                </div>
              </div>
            </div>
          </div>
        </Dialog>

        {/* Batch / Multiple Upload Modal */}
        <Dialog
          open={batchModalOpen}
          onOpenChange={(open) => !isBatchProcessing && setBatchModalOpen(open)}
          title="Upload Multiple Banners"
          description="Select multiple images at once to quickly create hero slider banners."
          footer={
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBatchModalOpen(false)}
                disabled={isBatchProcessing}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                isLoading={isBatchProcessing}
                onClick={processBatchUpload}
                disabled={batchFiles.length === 0}
                className="bg-slate-900 hover:bg-slate-800"
              >
                Upload & Create {batchFiles.length > 0 ? `(${batchFiles.length} Banners)` : ""}
              </Button>
            </>
          }
        >
          <div className="space-y-4 py-2">
            {/* File Dropzone */}
            <label className="cursor-pointer flex flex-col items-center justify-center p-6 border-2 border-dashed border-emerald-400 bg-emerald-50/20 rounded-xl hover:bg-emerald-50/40 transition">
              <Upload className="w-8 h-8 text-emerald-600 mb-2" />
              <span className="text-sm font-bold text-slate-800">
                Choose Multiple Banner Images
              </span>
              <span className="text-xs text-slate-500 mt-0.5">
                Hold Shift or Ctrl to select multiple JPG, PNG, WEBP files
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleBatchFileSelect}
                className="hidden"
                disabled={isBatchProcessing}
              />
            </label>

            {/* Selected Queue */}
            {batchFiles.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
                  <span>Selected Images ({batchFiles.length})</span>
                  <button
                    type="button"
                    onClick={() => setBatchFiles([])}
                    className="text-red-600 hover:underline text-[11px]"
                    disabled={isBatchProcessing}
                  >
                    Clear All
                  </button>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                  {batchFiles.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center gap-3 shadow-2xs"
                    >
                      <img
                        src={item.previewUrl}
                        alt="Preview"
                        className="h-10 w-16 rounded object-cover border"
                      />

                      <div className="flex-1 min-w-0">
                        <Input
                          value={item.title}
                          onChange={(e) =>
                            setBatchFiles((prev) =>
                              prev.map((it) => (it.id === item.id ? { ...it, title: e.target.value } : it))
                            )
                          }
                          placeholder="Banner Headline"
                          className="h-8 text-xs"
                          disabled={isBatchProcessing}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        {item.status === "uploading" && (
                          <span className="text-[10px] text-amber-600 font-semibold animate-pulse">
                            Uploading...
                          </span>
                        )}
                        {item.status === "done" && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        )}
                        {item.status === "error" && (
                          <span className="text-[10px] text-red-600 font-semibold">Failed</span>
                        )}
                        {!isBatchProcessing && item.status === "idle" && (
                          <button
                            type="button"
                            onClick={() => removeBatchItem(item.id)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          title="Delete Hero Banner"
          description={`Are you sure you want to delete "${deleteTarget?.title || deleteTarget?.heading}"?`}
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
                Delete Banner
              </Button>
            </>
          }
        >
          <p className="text-xs text-slate-600 py-2">
            This banner will be permanently removed from your hero slider and website.
          </p>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
