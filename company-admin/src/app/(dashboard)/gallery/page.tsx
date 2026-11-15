"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mediaApi } from "@/lib/api/media";
import { uploadToImgBB } from "@/lib/api/imgbb";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  ImageIcon,
  Upload,
  Copy,
  Search,
  Trash2,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  X,
} from "lucide-react";
import { formatBytes } from "@/lib/utils";
import { toast } from "sonner";
import { MediaAsset } from "@/types";

interface BatchGalleryItem {
  id: string;
  file: File;
  previewUrl: string;
  label: string;
  status: "idle" | "uploading" | "done" | "error";
}

const GALLERY_CATEGORIES = [
  "Interior",
  "Relaxation Area",
  "Hair Treatments",
  "Spa Zone",
  "Skin Care",
  "Bridal & Makeup",
  "Nail Studio",
  "Consultation Room",
  "Products",
  "General",
];

export default function GalleryPage() {
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState<string>("");
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<MediaAsset | null>(null);

  // Batch Upload State
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [batchCategory, setBatchCategory] = useState("Interior");
  const [batchFiles, setBatchFiles] = useState<BatchGalleryItem[]>([]);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);

  const { data: assets, isLoading } = useQuery({
    queryKey: ["company-media", selectedType],
    queryFn: () => mediaApi.list(selectedType || undefined),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => mediaApi.delete(id),
    onSuccess: () => {
      toast.success("Media asset deleted successfully");
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ["company-media"] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to delete asset";
      toast.error(msg);
    },
  });

  // Multiple File Selection
  const handleBatchFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    const newItems: BatchGalleryItem[] = files.map((f, idx) => ({
      id: `${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 7)}`,
      file: f,
      previewUrl: URL.createObjectURL(f),
      label: f.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ").toUpperCase(),
      status: "idle",
    }));
    setBatchFiles((prev) => [...prev, ...newItems]);
  };

  const removeBatchItem = (id: string) => {
    setBatchFiles((prev) => prev.filter((item) => item.id !== id));
  };

  // Upload Batch via ImgBB
  const processBatchUpload = async () => {
    if (batchFiles.length === 0) {
      toast.error("Please select at least one image to upload");
      return;
    }

    setIsBatchProcessing(true);
    let successCount = 0;

    for (let i = 0; i < batchFiles.length; i++) {
      const item = batchFiles[i];
      setBatchFiles((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, status: "uploading" } : it))
      );

      try {
        // 1. Direct ImgBB Cloud Upload
        const imgbbUrl = await uploadToImgBB(item.file);

        // 2. Register MediaAsset in backend
        await mediaApi.createFromUrl({
          file_url: imgbbUrl,
          original_name: item.file.name,
          media_type: "gallery",
          label: item.label || batchCategory.toUpperCase(),
          file_size: item.file.size,
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
    queryClient.invalidateQueries({ queryKey: ["company-media"] });

    if (successCount === batchFiles.length) {
      toast.success(`Successfully uploaded ${successCount} gallery images to ImgBB!`);
      setBatchModalOpen(false);
      setBatchFiles([]);
    } else {
      toast.error(`Uploaded ${successCount} of ${batchFiles.length} images. Check failed items.`);
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("ImgBB image URL copied to clipboard!");
  };

  const filteredAssets = (assets || []).filter((a) =>
    a.original_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-emerald-600" />
                Photo Gallery & Media Assets
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                ⚡ ImgBB Cloud Active
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              Upload high-resolution photography for your public website gallery and portfolio.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              size="md"
              onClick={() => {
                setBatchFiles([]);
                setBatchModalOpen(true);
              }}
              className="gap-2 shadow-xs bg-slate-900 hover:bg-slate-800"
            >
              <Upload className="w-4 h-4" />
              Upload Images to ImgBB
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search gallery files by filename or tag..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="w-full md:w-56">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 focus:outline-none"
                >
                  <option value="">All Media Types</option>
                  <option value="gallery">Gallery Only</option>
                  <option value="banners">Banners</option>
                  <option value="services">Services</option>
                  <option value="categories">Categories</option>
                  <option value="offers">Offers</option>
                  <option value="blogs">Blogs</option>
                  <option value="general">General</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Media Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-56 w-full rounded-xl" />
            ))}
          </div>
        ) : filteredAssets.length === 0 ? (
          <EmptyState
            icon={<ImageIcon className="w-8 h-8" />}
            title="No Gallery Images Uploaded Yet"
            description="Upload interior, spa, treatment, or styling photos to showcase your beauty center."
            action={
              <Button onClick={() => setBatchModalOpen(true)}>
                Upload Images via ImgBB
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredAssets.map((asset) => {
              const labelTag: string =
                typeof asset.metadata_info?.label === "string"
                  ? asset.metadata_info.label
                  : asset.original_name.replace(/\.[^/.]+$/, "").toUpperCase();

              return (
                <Card
                  key={asset.id}
                  className="group border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                    <img
                      src={asset.file_url}
                      alt={asset.original_name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge
                      variant="secondary"
                      className="absolute top-2 left-2 text-[10px] bg-slate-900/80 text-white border-0 backdrop-blur-xs font-bold"
                    >
                      {labelTag}
                    </Badge>
                  </div>

                  <div className="p-3 border-t bg-white space-y-2">
                    <p
                      className="text-xs font-bold text-slate-900 truncate"
                      title={asset.original_name}
                    >
                      {asset.original_name}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{formatBytes(asset.file_size)}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => copyUrl(asset.file_url)}
                          className="p-1 hover:text-emerald-700 transition-colors"
                          title="Copy ImgBB URL"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={asset.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 hover:text-blue-600 transition-colors"
                          title="View on ImgBB CDN"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => setDeleteTarget(asset)}
                          className="p-1 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Upload Modal (Multiple & Single with ImgBB) */}
        <Dialog
          open={batchModalOpen}
          onOpenChange={(open) => !isBatchProcessing && setBatchModalOpen(open)}
          title="Upload Images to ImgBB Cloud"
          description="Upload high-resolution gallery images directly using your ImgBB cloud account."
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
                Upload to ImgBB {batchFiles.length > 0 ? `(${batchFiles.length} Photos)` : ""}
              </Button>
            </>
          }
        >
          <div className="space-y-4 py-2">
            {/* Category Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Default Gallery Category / Label
              </label>
              <select
                value={batchCategory}
                onChange={(e) => setBatchCategory(e.target.value)}
                disabled={isBatchProcessing}
                className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 focus:outline-none"
              >
                {GALLERY_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Dropzone */}
            <label className="cursor-pointer flex flex-col items-center justify-center p-6 border-2 border-dashed border-emerald-400 bg-emerald-50/20 rounded-xl hover:bg-emerald-50/40 transition">
              <Upload className="w-8 h-8 text-emerald-600 mb-2" />
              <span className="text-sm font-bold text-slate-800">
                Choose Gallery Photos
              </span>
              <span className="text-xs text-slate-500 mt-0.5">
                Select one or multiple JPG, PNG, WEBP files
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

                <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                  {batchFiles.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center gap-3 shadow-2xs"
                    >
                      <img
                        src={item.previewUrl}
                        alt="Preview"
                        className="h-10 w-14 rounded object-cover border"
                      />

                      <div className="flex-1 min-w-0">
                        <Input
                          value={item.label}
                          onChange={(e) =>
                            setBatchFiles((prev) =>
                              prev.map((it) => (it.id === item.id ? { ...it, label: e.target.value } : it))
                            )
                          }
                          placeholder="Gallery Label (e.g. INTERIOR)"
                          className="h-8 text-xs font-semibold"
                          disabled={isBatchProcessing}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        {item.status === "uploading" && (
                          <span className="text-[10px] text-amber-600 font-semibold animate-pulse">
                            Uploading to ImgBB...
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
          title="Delete Media Asset"
          description={`Are you sure you want to delete "${deleteTarget?.original_name}"?`}
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
                Delete Asset
              </Button>
            </>
          }
        >
          <p className="text-xs text-slate-600 py-2">
            This image will be removed from your gallery and media library.
          </p>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
